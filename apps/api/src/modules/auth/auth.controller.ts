import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma';
import { signToken } from '../../utils/jwt';
import { sendSuccess, sendError } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/authenticate';
import { CATEGORIES_DATA, PRODUCTS_CATALOG } from '../../data/catalog';

export const login = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      sendError(res, 'Email and password are required', 400);
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      sendError(res, 'Invalid credentials', 401);
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      sendError(res, 'Invalid credentials', 401);
      return;
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    sendSuccess(res, {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

export const me = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
};

export const register = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, email, password, shopName } = req.body as {
      name: string;
      email: string;
      password: string;
      shopName: string;
    };

    if (!name || !email || !password || !shopName) {
      sendError(res, 'Name, email, password, and shop name are required', 400);
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      sendError(res, 'Email address already registered', 409);
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Create new user
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: 'ADMIN' },
    });

    // Seed all 8 categories for this user
    const categoryMap = new Map<string, string>();
    for (const cat of CATEGORIES_DATA) {
      const created = await prisma.category.create({
        data: { name: cat.name, description: cat.desc, userId: user.id },
      });
      categoryMap.set(cat.name, created.id);
    }

    // Seed all 200 products using shared catalog
    for (const p of PRODUCTS_CATALOG) {
      const categoryId = categoryMap.get(p.cat);
      if (!categoryId) continue;
      await prisma.product.create({
        data: {
          name: p.name,
          sku: `${p.sku}-${user.id.slice(-4)}`,
          categoryId,
          sellingPrice: p.sp,
          costPrice: p.cp,
          unit: p.unit,
          stockQty: p.stock,
          userId: user.id,
        },
      });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    sendSuccess(res, {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        shopName,
      },
    }, 'Store registered successfully');
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, email } = req.body as { name?: string; email?: string };

    const updateData: Record<string, any> = {};
    if (name) updateData.name = name.trim();
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== req.user!.userId) {
        sendError(res, 'Email address already in use', 409);
        return;
      }
      updateData.email = email.trim();
    }

    const updated = await prisma.user.update({
      where: { id: req.user!.userId },
      data: updateData,
      select: { id: true, name: true, email: true, role: true },
    });

    sendSuccess(res, updated, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};

