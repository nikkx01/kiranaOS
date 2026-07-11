import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma';
import { signToken } from '../../utils/jwt';
import { sendSuccess, sendError } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/authenticate';

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
      data: {
        name,
        email,
        passwordHash,
        role: 'ADMIN',
      },
    });

    // Onboard/pre-seed default categories for the new store owner
    const dairyCat = await prisma.category.create({
      data: { name: `Dairy - ${shopName}`, description: 'Milk, butter, dahi', userId: user.id },
    });
    const snacksCat = await prisma.category.create({
      data: { name: `Snacks - ${shopName}`, description: 'Biscuits, chips, noodles', userId: user.id },
    });
    const bevCat = await prisma.category.create({
      data: { name: `Beverages - ${shopName}`, description: 'Cold drinks, juices', userId: user.id },
    });
    const grainsCat = await prisma.category.create({
      data: { name: `Grains - ${shopName}`, description: 'Atta, rice, dal, salt', userId: user.id },
    });

    // Onboard default products catalog
    const defaultProducts = [
      { name: 'Amul Milk 500ml', sku: `DRY-${user.id.slice(-3)}-001`, categoryId: dairyCat.id, sellingPrice: 28, costPrice: 25, unit: 'PCS' as any, stockQty: 50 },
      { name: 'Amul Butter 100g', sku: `DRY-${user.id.slice(-3)}-002`, categoryId: dairyCat.id, sellingPrice: 58, costPrice: 52, unit: 'PCS' as any, stockQty: 30 },
      { name: 'Marie Gold Biscuits 250g', sku: `SNC-${user.id.slice(-3)}-001`, categoryId: snacksCat.id, sellingPrice: 35, costPrice: 29, unit: 'PACK' as any, stockQty: 60 },
      { name: 'Maggi Noodles 70g', sku: `SNC-${user.id.slice(-3)}-002`, categoryId: snacksCat.id, sellingPrice: 14, costPrice: 11.5, unit: 'PACK' as any, stockQty: 100 },
      { name: 'Coca Cola 2.25L', sku: `BEV-${user.id.slice(-3)}-001`, categoryId: bevCat.id, sellingPrice: 100, costPrice: 86, unit: 'PCS' as any, stockQty: 24 },
      { name: 'Tata Salt 1kg', sku: `GRN-${user.id.slice(-3)}-001`, categoryId: grainsCat.id, sellingPrice: 28, costPrice: 22, unit: 'KG' as any, stockQty: 80 },
    ];

    for (const p of defaultProducts) {
      await prisma.product.create({
        data: {
          ...p,
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

