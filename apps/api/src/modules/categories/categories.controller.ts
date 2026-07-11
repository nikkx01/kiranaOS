import { Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { sendSuccess, sendError } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/authenticate';

export const listCategories = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: req.user!.userId },
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    sendSuccess(res, categories);
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, description } = req.body as { name: string; description?: string };

    if (!name?.trim()) {
      sendError(res, 'Category name is required', 400);
      return;
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        userId: req.user!.userId,
      },
    });
    sendSuccess(res, category, 'Category created', 201);
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2002') {
      sendError(res, 'Category with this name already exists', 409);
      return;
    }
    next(err);
  }
};

export const updateCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description } = req.body as { name?: string; description?: string };

    const existing = await prisma.category.findFirst({
      where: { id, userId: req.user!.userId },
    });

    if (!existing) {
      sendError(res, 'Category not found', 404);
      return;
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description.trim() }),
      },
    });
    sendSuccess(res, category, 'Category updated');
  } catch (err: unknown) {
    next(err);
  }
};

export const deleteCategory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.category.findFirst({
      where: { id, userId: req.user!.userId },
    });

    if (!existing) {
      sendError(res, 'Category not found', 404);
      return;
    }

    await prisma.category.delete({ where: { id } });
    sendSuccess(res, null, 'Category deleted');
  } catch (err: unknown) {
    next(err);
  }
};
