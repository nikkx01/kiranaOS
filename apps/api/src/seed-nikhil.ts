import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding custom wholesale shop data for nikhilshop@gmail.com...');

  // 1. Create or get user
  const email = 'nikhilshop@gmail.com';
  const name = 'Nikhil Grocery Wholesale';
  const passwordHash = bcryptjs.hashSync('nikhil123', 10);

  let user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    console.log(`User ${email} already exists. Cleaning up old data and resetting password...`);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
    // Delete old bills
    await prisma.bill.deleteMany({ where: { userId: user.id } });
    // Delete old products
    await prisma.product.deleteMany({ where: { userId: user.id } });
    // Delete old categories
    await prisma.category.deleteMany({ where: { userId: user.id } });
  } else {
    user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: 'ADMIN',
      },
    });
    console.log(`Created user ${email}`);
  }

  const userId = user.id;

  // 2. Create categories
  const categoriesData = [
    { name: 'Grains, Rice & Pulses', description: 'Bulk sacks of rice, wheat, and pulses' },
    { name: 'Spices & Flours', description: 'Flours like Atta, Maida, Suji, and boxed spices' },
    { name: 'Edible Oils & Ghee', description: 'Tins and boxes of edible oil' },
    { name: 'Sugar, Salt & Sweeteners', description: 'Sugar sacks, salt cases, and sweeteners' },
    { name: 'Packaged Wholesale Cartons', description: 'Cartons of noodles, pasta, and processed foods' },
    { name: 'Snacks & Beverages', description: 'Cases of biscuits, tea, and chips' },
    { name: 'Cleaning & Detergents', description: 'Wholesale boxes of soaps, detergents, and dishwashers' },
    { name: 'Soaps & Toiletries', description: 'Wholesale boxes of handwash, shampoo, and personal care' },
  ];

  const categoriesMap: { [key: string]: string } = {};

  for (const cat of categoriesData) {
    const createdCat = await prisma.category.create({
      data: {
        name: cat.name,
        description: cat.description,
        userId,
      },
    });
    categoriesMap[cat.name] = createdCat.id;
  }
  console.log(`Seeded ${categoriesData.length} categories.`);

  // 3. Create products
  const productsData = [
    {
      name: 'Aashirvaad Shudh Chakki Atta (10kg Bag)',
      sku: 'W-ATTA-AAS-10K',
      description: 'Chakki Atta 10kg package bag',
      costPrice: 420.00,
      sellingPrice: 460.00,
      stockQty: 120,
      unit: 'PACK' as const,
      categoryName: 'Spices & Flours',
    },
    {
      name: 'Fortune Soya Health Oil (15L Tin)',
      sku: 'W-OIL-FOR-15L',
      description: 'Refined soyabean oil 15L tin container',
      costPrice: 1750.00,
      sellingPrice: 1890.00,
      stockQty: 45,
      unit: 'PCS' as const,
      categoryName: 'Edible Oils & Ghee',
    },
    {
      name: 'Tata Salt Iodized (1kg x 24 Box)',
      sku: 'W-SLT-TAT-24P',
      description: 'Wholesale case of Tata Salt (24 packets of 1kg)',
      costPrice: 500.00,
      sellingPrice: 560.00,
      stockQty: 60,
      unit: 'BOX' as const,
      categoryName: 'Sugar, Salt & Sweeteners',
    },
    {
      name: 'Madhur Sugar M-Grade (50kg Sack)',
      sku: 'W-SGR-MAD-50K',
      description: 'Premium quality sugar 50kg wholesale sack',
      costPrice: 2050.00,
      sellingPrice: 2200.00,
      stockQty: 80,
      unit: 'PACK' as const,
      categoryName: 'Sugar, Salt & Sweeteners',
    },
    {
      name: 'Maggi Noodles 96-Pack Carton',
      sku: 'W-NDL-MAG-96P',
      description: 'Maggi 2-Min masala noodles 70g wholesale carton',
      costPrice: 1100.00,
      sellingPrice: 1250.00,
      stockQty: 100,
      unit: 'BOX' as const,
      categoryName: 'Packaged Wholesale Cartons',
    },
    {
      name: 'Surf Excel Easy Wash Carton (500g x 48)',
      sku: 'W-DET-SUR-48P',
      description: 'Surf Excel Easy Wash 500g wholesale carton',
      costPrice: 2800.00,
      sellingPrice: 3100.00,
      stockQty: 30,
      unit: 'BOX' as const,
      categoryName: 'Cleaning & Detergents',
    },
    {
      name: 'Dettol Liquid Handwash 5L Can',
      sku: 'W-SOAP-DET-5L',
      description: 'Liquid Handwash 5L bulk container can',
      costPrice: 800.00,
      sellingPrice: 900.00,
      stockQty: 50,
      unit: 'PCS' as const,
      categoryName: 'Soaps & Toiletries',
    },
    {
      name: 'Tata Tea Premium Carton (1kg x 12)',
      sku: 'W-TEA-TAT-12P',
      description: 'Tata Tea Premium 1kg packages wholesale carton',
      costPrice: 3200.00,
      sellingPrice: 3500.00,
      stockQty: 40,
      unit: 'BOX' as const,
      categoryName: 'Snacks & Beverages',
    },
    {
      name: 'Basmati Rice Rozana Premium (25kg Bag)',
      sku: 'W-RIC-BAS-25K',
      description: 'Premium Rozana Basmati Rice 25kg bag',
      costPrice: 1800.00,
      sellingPrice: 2050.00,
      stockQty: 70,
      unit: 'PACK' as const,
      categoryName: 'Grains, Rice & Pulses',
    },
    {
      name: 'Fortune Premium Mustard Oil (1L x 12 Box)',
      sku: 'W-OIL-FOR-12P',
      description: 'Kachi Ghani Mustard Oil 1L wholesale box',
      costPrice: 1650.00,
      sellingPrice: 1780.00,
      stockQty: 35,
      unit: 'BOX' as const,
      categoryName: 'Edible Oils & Ghee',
    },
    {
      name: 'MDH Deggi Mirch 100g (Pack of 10)',
      sku: 'W-SPC-MDH-10P',
      description: 'MDH Deggi Mirch Powder 100g packets bundle',
      costPrice: 650.00,
      sellingPrice: 720.00,
      stockQty: 85,
      unit: 'PACK' as const,
      categoryName: 'Spices & Flours',
    },
    {
      name: 'Cadbury Dairy Milk 10g (Pack of 144 Box)',
      sku: 'W-CHO-CAD-144',
      description: 'Cadbury Dairy Milk 10g wholesale display box',
      costPrice: 1200.00,
      sellingPrice: 1350.00,
      stockQty: 55,
      unit: 'BOX' as const,
      categoryName: 'Snacks & Beverages',
    },
    {
      name: 'Haldiram Bhujia Sev 1kg (Pack of 10)',
      sku: 'W-SNK-HAL-10P',
      description: 'Haldiram Bhujia Sev 1kg packages case',
      costPrice: 2000.00,
      sellingPrice: 2250.00,
      stockQty: 40,
      unit: 'PACK' as const,
      categoryName: 'Snacks & Beverages',
    },
    {
      name: 'Parle-G Gold Biscuits (1kg x 10 Box)',
      sku: 'W-BIS-PAR-10P',
      description: 'Parle-G Gold Biscuits 1kg packages wholesale box',
      costPrice: 850.00,
      sellingPrice: 950.00,
      stockQty: 90,
      unit: 'BOX' as const,
      categoryName: 'Snacks & Beverages',
    },
    {
      name: 'Colgate Strong Teeth Paste 150g (Pack of 12)',
      sku: 'W-PST-COL-12P',
      description: 'Colgate Strong Teeth 150g wholesale bundle',
      costPrice: 600.00,
      sellingPrice: 680.00,
      stockQty: 75,
      unit: 'PACK' as const,
      categoryName: 'Soaps & Toiletries',
    },
    {
      name: 'Vim Dishwash Liquid 5L Can',
      sku: 'W-VIM-LIQ-5L',
      description: 'Vim Dishwashing liquid 5L can container',
      costPrice: 580.00,
      sellingPrice: 650.00,
      stockQty: 60,
      unit: 'PCS' as const,
      categoryName: 'Cleaning & Detergents',
    },
    {
      name: 'Aashirvaad Multi-grain Atta (5kg x 4 Bag)',
      sku: 'W-ATTA-MUL-5K',
      description: 'Multi-grain Atta 5kg packages bundle box',
      costPrice: 900.00,
      sellingPrice: 1020.00,
      stockQty: 50,
      unit: 'BOX' as const,
      categoryName: 'Spices & Flours',
    },
    {
      name: 'Chana Dal Premium Desi (30kg Sack)',
      sku: 'W-DAL-CHN-30K',
      description: 'High quality Chana Dal 30kg sack bag',
      costPrice: 2200.00,
      sellingPrice: 2450.00,
      stockQty: 65,
      unit: 'PACK' as const,
      categoryName: 'Grains, Rice & Pulses',
    },
    {
      name: 'Toor Dal Premium Latur (30kg Sack)',
      sku: 'W-DAL-TOR-30K',
      description: 'High quality Toor Dal 30kg sack bag',
      costPrice: 3800.00,
      sellingPrice: 4200.00,
      stockQty: 45,
      unit: 'PACK' as const,
      categoryName: 'Grains, Rice & Pulses',
    },
    {
      name: 'Maida Fine Flour (50kg Sack)',
      sku: 'W-FLR-MAI-50K',
      description: 'Maida Fine Flour 50kg wholesale sack',
      costPrice: 1600.00,
      sellingPrice: 1800.00,
      stockQty: 80,
      unit: 'PACK' as const,
      categoryName: 'Spices & Flours',
    },
  ];

  const productsList = [];
  for (const prod of productsData) {
    const createdProduct = await prisma.product.create({
      data: {
        name: prod.name,
        sku: prod.sku,
        description: prod.description,
        costPrice: prod.costPrice,
        sellingPrice: prod.sellingPrice,
        stockQty: prod.stockQty,
        unit: prod.unit,
        userId,
        categoryId: categoriesMap[prod.categoryName],
      },
    });
    productsList.push(createdProduct);
  }
  console.log(`Seeded ${productsList.length} products.`);

  // 4. Generate sales history (bills) over the last 15 days
  const numDays = 15;
  const now = new Date();
  let billCount = 0;

  for (let i = numDays; i >= 0; i--) {
    // Generate 2-4 bills per day
    const numBills = Math.floor(Math.random() * 3) + 2; // 2, 3, or 4 bills

    for (let b = 0; b < numBills; b++) {
      const billDate = new Date();
      billDate.setDate(now.getDate() - i);
      // Set random business hours (9:00 AM to 8:30 PM)
      billDate.setHours(
        Math.floor(Math.random() * 12) + 9,
        Math.floor(Math.random() * 60),
        Math.floor(Math.random() * 60)
      );

      // Select 2 to 5 random products for this bill
      const itemsCount = Math.floor(Math.random() * 4) + 2; // 2, 3, 4, or 5 products
      const shuffled = [...productsList].sort(() => 0.5 - Math.random());
      const selectedProducts = shuffled.slice(0, itemsCount);

      const billItems = [];
      let subtotal = 0;

      for (const prod of selectedProducts) {
        const qty = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3 wholesale boxes/sacks
        const unitPrice = Number(prod.sellingPrice);
        const costPrice = Number(prod.costPrice);
        const itemSubtotal = unitPrice * qty;
        subtotal += itemSubtotal;

        billItems.push({
          productId: prod.id,
          productName: prod.name,
          quantity: qty,
          unitPrice,
          costPrice,
          subtotal: itemSubtotal,
        });
      }

      const discount = Math.random() > 0.6 ? (Math.floor(Math.random() * 3) + 1) * 50 : 0; // 0, 50, 100, or 150 discount
      const total = Math.max(0, subtotal - discount);

      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const yyyymmdd =
        billDate.getFullYear().toString() +
        (billDate.getMonth() + 1).toString().padStart(2, '0') +
        billDate.getDate().toString().padStart(2, '0');
      const billNumber = `BILL-${yyyymmdd}-${randomNum}`;

      await prisma.bill.create({
        data: {
          billNumber,
          userId,
          subtotal,
          discount,
          tax: 0,
          total,
          status: 'COMPLETED',
          createdAt: billDate,
          updatedAt: billDate,
          items: {
            create: billItems,
          },
        },
      });
      billCount++;
    }
  }

  console.log(`Seeded ${billCount} bills.`);
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });