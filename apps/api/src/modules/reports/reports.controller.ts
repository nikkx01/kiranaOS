import { Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { sendSuccess } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/authenticate';

export const getSummary = async (
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const dateFilter = {
      createdAt: { gte: todayStart, lte: todayEnd },
      status: 'COMPLETED' as const,
    };

    // Totals in one aggregation
    const [billsAgg, billItems] = await Promise.all([
      prisma.bill.aggregate({
        where: dateFilter,
        _sum: { total: true, discount: true },
        _count: { id: true },
      }),
      prisma.billItem.findMany({
        where: { bill: dateFilter },
        select: { quantity: true, unitPrice: true, costPrice: true },
      }),
    ]);

    const totalSales = Number(billsAgg._sum.total ?? 0);
    const totalBills = billsAgg._count.id;
    const totalProfit = billItems.reduce((acc: number, item: { quantity: number; unitPrice: unknown; costPrice: unknown }) => {
      const profit = (Number(item.unitPrice) - Number(item.costPrice)) * item.quantity;
      return acc + profit;
    }, 0);

    sendSuccess(res, {
      totalSales,
      totalProfit,
      totalBills,
      totalDiscount: Number(billsAgg._sum.discount ?? 0),
      averageBillValue: totalBills > 0 ? totalSales / totalBills : 0,
    });
  } catch (err) {
    next(err);
  }
};

export const getBestSellers = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { limit = '10', from, to } = req.query as Record<string, string>;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const dateFilter = from || to
      ? {
          ...(from && { gte: new Date(from) }),
          ...(to && { lte: new Date(to) }),
        }
      : { gte: todayStart, lte: todayEnd };

    const results = await prisma.billItem.groupBy({
      by: ['productId', 'productName'],
      where: {
        bill: {
          createdAt: dateFilter,
          status: 'COMPLETED',
        },
      },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: parseInt(limit),
    });

    const bestSellers = results.map((r: (typeof results)[number]) => ({
      productId: r.productId,
      productName: r.productName,
      totalQuantity: r._sum.quantity ?? 0,
      totalRevenue: Number(r._sum.subtotal ?? 0),
    }));

    sendSuccess(res, bestSellers);
  } catch (err) {
    next(err);
  }
};
