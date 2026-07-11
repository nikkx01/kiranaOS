import { Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { sendSuccess, sendError } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/authenticate';

export const listProducts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      search,
      categoryId,
      page = '1',
      limit = '20',
      active = 'true',
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, any> = {
      userId: req.user!.userId,
      isActive: active === 'true',
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { name: 'asc' },
        include: { category: { select: { id: true, name: true } } },
      }),
      prisma.product.count({ where }),
    ]);

    sendSuccess(res, products, 'Products fetched', 200, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
};

export const getProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const product = await prisma.product.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
      include: { category: true },
    });

    if (!product) {
      sendError(res, 'Product not found', 404);
      return;
    }

    sendSuccess(res, product);
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, sku, description, categoryId, sellingPrice, costPrice, stockQty, unit } =
      req.body as {
        name: string;
        sku: string;
        description?: string;
        categoryId?: string;
        sellingPrice: number;
        costPrice: number;
        stockQty?: number;
        unit?: string;
      };

    if (!name || !sku || sellingPrice == null || costPrice == null) {
      sendError(res, 'name, sku, sellingPrice and costPrice are required', 400);
      return;
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        description: description?.trim(),
        categoryId: categoryId || null,
        sellingPrice,
        costPrice,
        stockQty: stockQty ?? 0,
        unit: (unit as never) ?? 'PCS',
        userId: req.user!.userId,
      },
      include: { category: { select: { id: true, name: true } } },
    });

    sendSuccess(res, product, 'Product created', 201);
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2002') {
      sendError(res, 'Product with this SKU already exists', 409);
      return;
    }
    next(err);
  }
};

export const updateProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body as Record<string, unknown>;

    const existing = await prisma.product.findFirst({
      where: { id, userId: req.user!.userId },
    });

    if (!existing) {
      sendError(res, 'Product not found', 404);
      return;
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData as Record<string, unknown>,
      include: { category: { select: { id: true, name: true } } },
    });

    sendSuccess(res, product, 'Product updated');
  } catch (err: unknown) {
    next(err);
  }
};

export const deleteProduct = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.product.findFirst({
      where: { id, userId: req.user!.userId },
    });

    if (!existing) {
      sendError(res, 'Product not found', 404);
      return;
    }

    // Soft delete – keeps references in bill items intact
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    sendSuccess(res, null, 'Product deleted');
  } catch (err: unknown) {
    next(err);
  }
};
