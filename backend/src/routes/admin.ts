import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { authenticateAdmin, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const updateProjectStatusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'FEATURED', 'ARCHIVED']),
  rejectionReason: z.string().optional(),
});

/**
 * GET /api/admin/projects
 * Get all projects (including pending) for admin review
 */
router.get('/projects', authenticateAdmin, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
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
 * PATCH /api/admin/projects/:id/status
 * Update project status (approve/reject/feature)
 */
router.patch(
  '/projects/:id/status',
  authenticateAdmin,
  async (req: AuthRequest, res, next) => {
    try {
      const { id } = req.params;
      const data = updateProjectStatusSchema.parse(req.body);

      const project = await prisma.project.findUnique({
        where: { id },
      });

      if (!project) {
        throw new AppError('Project not found', 404);
      }

      const updateData: any = {
        status: data.status,
        updatedAt: new Date(),
      };

      if (data.status === 'APPROVED' || data.status === 'FEATURED') {
        updateData.approvedAt = new Date();
        updateData.approvedBy = req.admin!.adminId;
        updateData.rejectionReason = null;
      } else if (data.status === 'REJECTED') {
        updateData.rejectionReason = data.rejectionReason || 'Rejected by admin';
      }

      const updated = await prisma.project.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              walletAddress: true,
              username: true,
            },
          },
        },
      });

      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      next(error);
    }
  }
);

/**
 * DELETE /api/admin/projects/:id
 * Delete a project (only super admin)
 */
router.delete(
  '/projects/:id',
  authenticateAdmin,
  requireRole(['SUPER_ADMIN']),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      await prisma.project.delete({
        where: { id },
      });

      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/admin/stats
 * Get admin dashboard statistics
 */
router.get('/stats', authenticateAdmin, async (req, res, next) => {
  try {
    const [
      totalProjects,
      pendingProjects,
      approvedProjects,
      featuredProjects,
      totalUsers,
      totalViews,
      totalFavorites,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: 'PENDING' } }),
      prisma.project.count({ where: { status: 'APPROVED' } }),
      prisma.project.count({ where: { status: 'FEATURED' } }),
      prisma.user.count(),
      prisma.project.aggregate({ _sum: { views: true } }),
      prisma.project.aggregate({ _sum: { favorites: true } }),
    ]);

    res.json({
      projects: {
        total: totalProjects,
        pending: pendingProjects,
        approved: approvedProjects,
        featured: featuredProjects,
      },
      users: {
        total: totalUsers,
      },
      engagement: {
        totalViews: totalViews._sum.views || 0,
        totalFavorites: totalFavorites._sum.favorites || 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as adminRoutes };

