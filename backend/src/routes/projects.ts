import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { authenticateWallet, AuthRequest } from '../middleware/auth';
import { solanaService } from '../services/solana';
import { strictRateLimiter } from '../middleware/rateLimiter';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  symbol: z.string().min(1).max(10).toUpperCase(),
  description: z.string().min(10).max(5000),
  website: z.string().url().optional(),
  twitter: z.string().optional(),
  telegram: z.string().optional(),
  discord: z.string().url().optional(),
  github: z.string().url().optional(),
  tokenAddress: z.string(),
  tokenMint: z.string(),
  logoUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
  tags: z.array(z.string()).optional().default([]),
});

/**
 * GET /api/projects
 * Get all approved projects with pagination and filtering
 */
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string || 'APPROVED';
    const search = req.query.search as string;
    const tag = req.query.tag as string;

    const skip = (page - 1) * limit;

    const where: any = {
      status: status as any,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { symbol: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tag) {
      where.tags = { has: tag };
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              walletAddress: true,
              username: true,
            },
          },
        },
      }),
      prisma.project.count({ where }),
    ]);

    res.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/projects/:id
 * Get a specific project by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            walletAddress: true,
            username: true,
          },
        },
      },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Increment view count
    await prisma.project.update({
      where: { id: req.params.id },
      data: { views: { increment: 1 } },
    });

    res.json(project);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/projects/token/:tokenMint
 * Get project by token mint address
 */
router.get('/token/:tokenMint', async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { tokenMint: req.params.tokenMint },
      include: {
        user: {
          select: {
            walletAddress: true,
            username: true,
          },
        },
      },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/projects
 * Submit a new project
 */
router.post('/', strictRateLimiter, authenticateWallet, async (req: AuthRequest, res, next) => {
  try {
    const data = createProjectSchema.parse(req.body);

    // Verify token mint
    const isValidMint = await solanaService.verifyTokenMint(data.tokenMint);
    if (!isValidMint) {
      throw new AppError('Invalid token mint address', 400);
    }

    // Check if project already exists
    const existing = await prisma.project.findFirst({
      where: {
        OR: [
          { tokenMint: data.tokenMint },
          { tokenAddress: data.tokenAddress },
        ],
      },
    });

    if (existing) {
      throw new AppError('Project with this token already exists', 409);
    }

    // Get token info
    const tokenInfo = await solanaService.getTokenInfo(data.tokenMint);

    // Create or get user
    let user = await prisma.user.findUnique({
      where: { walletAddress: req.user!.walletAddress },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { walletAddress: req.user!.walletAddress },
      });
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        ...data,
        submittedBy: user.id,
        tokenDecimals: tokenInfo.decimals,
        tokenSupply: tokenInfo.supply,
      },
      include: {
        user: {
          select: {
            walletAddress: true,
            username: true,
          },
        },
      },
    });

    res.status(201).json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    next(error);
  }
});

/**
 * GET /api/projects/:id/favorite
 * Toggle favorite status for a project
 */
router.post('/:id/favorite', authenticateWallet, async (req: AuthRequest, res, next) => {
  try {
    const projectId = req.params.id;
    const userId = req.user!.userId;

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress: req.user!.walletAddress },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { walletAddress: req.user!.walletAddress },
      });
    }

    const existing = await prisma.projectFavorite.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId,
        },
      },
    });

    if (existing) {
      // Remove favorite
      await prisma.projectFavorite.delete({
        where: {
          userId_projectId: {
            userId: user.id,
            projectId,
          },
        },
      });

      await prisma.project.update({
        where: { id: projectId },
        data: { favorites: { decrement: 1 } },
      });

      res.json({ favorited: false });
    } else {
      // Add favorite
      await prisma.projectFavorite.create({
        data: {
          userId: user.id,
          projectId,
        },
      });

      await prisma.project.update({
        where: { id: projectId },
        data: { favorites: { increment: 1 } },
      });

      res.json({ favorited: true });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/projects/featured
 * Get featured projects
 */
router.get('/featured/list', async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: { status: 'FEATURED' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: {
            walletAddress: true,
            username: true,
          },
        },
      },
    });

    res.json(projects);
  } catch (error) {
    next(error);
  }
});

export { router as projectRoutes };

