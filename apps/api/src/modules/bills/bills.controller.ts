import { Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { sendSuccess, sendError } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/authenticate';

interface BillItemInput {
  productId: string;
  quantity: number;
}

const generateBillNumber = (): string => {
  const date = new Date();
  const yyyymmdd =
    date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    date.getDate().toString().padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `BILL-${yyyymmdd}-${random}`;
};

export const createBill = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { items, discount = 0, notes } = req.body as {
      items: BillItemInput[];
      discount?: number;
      notes?: string;
    };

    if (!items?.length) {
      sendError(res, 'Bill must have at least one item', 400);
      return;
    }

    // Fetch all products involved
    const productIds = items.map((i: BillItemInput) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    if (products.length !== productIds.length) {
      sendError(res, 'One or more products not found or inactive', 400);
      return;
    }

    type ProductRecord = typeof products[number];
    const productMap = new Map<string, ProductRecord>(products.map((p: ProductRecord) => [p.id, p]));

    // Build bill items with computed prices
    const billItemsData = items.map((item: BillItemInput) => {
      const product = productMap.get(item.productId)!;
      const unitPrice = Number(product.sellingPrice);
      const costPrice = Number(product.costPrice);
      return {
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unitPrice,
        costPrice,
        subtotal: unitPrice * item.quantity,
      };
    });

    const subtotal = billItemsData.reduce((acc: number, i: { subtotal: number }) => acc + i.subtotal, 0);
    const total = Math.max(0, subtotal - discount);
    const billNumber = generateBillNumber();

    // Use a transaction: create bill + decrement stock atomically
    const bill = await prisma.$transaction(async (tx) => {
      const newBill = await tx.bill.create({
        data: {
          billNumber,
          userId: req.user!.userId,
          subtotal,
          discount,
          tax: 0,
          total,
          status: 'COMPLETED',
          notes,
          items: {
            create: billItemsData,
          },
        },
        include: {
          items: true,
          user: { select: { id: true, name: true } },
        },
      });

      // Decrement stock for each product
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { decrement: item.quantity } },
        });
      }

      return newBill;
    });

    sendSuccess(res, bill, 'Bill created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const listBills = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '20',
      status,
      from,
      to,
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const where = {
      ...(status && { status: status as 'DRAFT' | 'COMPLETED' | 'CANCELLED' }),
      ...(from || to
        ? {
            createdAt: {
              ...(from && { gte: new Date(from) }),
              ...(to && { lte: new Date(to) }),
            },
          }
        : {}),
    };

    const [bills, total] = await Promise.all([
      prisma.bill.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.bill.count({ where }),
    ]);

    sendSuccess(res, bills, 'Bills fetched', 200, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
};

export const getBill = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const bill = await prisma.bill.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: { product: { select: { id: true, name: true, unit: true } } },
        },
        user: { select: { id: true, name: true } },
      },
    });

    if (!bill) {
      sendError(res, 'Bill not found', 404);
      return;
    }

    sendSuccess(res, bill);
  } catch (err) {
    next(err);
  }
};
