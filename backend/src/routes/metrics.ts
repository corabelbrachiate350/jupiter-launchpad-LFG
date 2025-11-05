import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { authenticateAdmin, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/metrics/project/:id
 * Get metrics for a specific project
 */
router.get('/project/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const days = parseInt(req.query.days as string) || 30;

    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        swapVolume: true,
        liquidity: true,
        holders: true,
        views: true,
        favorites: true,
      },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await prisma.projectMetric.findMany({
      where: {
        projectId: id,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    res.json({
      project: {
        id: project.id,
        name: project.name,
        currentMetrics: {
          swapVolume: project.swapVolume,
          liquidity: project.liquidity,
          holders: project.holders,
          views: project.views,
          favorites: project.favorites,
        },
      },
      historical: metrics,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/metrics/project/:id
 * Update project metrics (admin only, or via automated service)
 */
router.post('/project/:id', authenticateAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { swapVolume, liquidity, holders, price } = req.body;

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Update current metrics
    await prisma.project.update({
      where: { id },
      data: {
        swapVolume: swapVolume || project.swapVolume,
        liquidity: liquidity || project.liquidity,
        holders: holders !== undefined ? holders : project.holders,
        currentPrice: price || project.currentPrice,
      },
    });

    // Create metric record
    const metric = await prisma.projectMetric.create({
      data: {
        projectId: id,
        swapVolume: swapVolume || project.swapVolume,
        liquidity: liquidity || project.liquidity,
        holders: holders !== undefined ? holders : project.holders,
        price: price || project.currentPrice,
      },
    });

    res.json(metric);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/metrics/trending
 * Get trending projects based on metrics
 */
router.get('/trending', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    // Get projects with highest swap volume in last 24h
    const projects = await prisma.project.findMany({
      where: {
        status: 'APPROVED',
      },
      orderBy: [
        { swapVolume: 'desc' },
        { views: 'desc' },
        { favorites: 'desc' },
      ],
      take: limit,
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

export { router as metricsRoutes };

