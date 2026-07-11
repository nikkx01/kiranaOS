import { PrismaClient, UserRole, ProductUnit } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// FMCG catalog generator details
const CATEGORIES_DATA = [
  { name: 'Dairy & Bread', desc: 'Milk, butter, cheese, bread, and curd' },
  { name: 'Snacks & Biscuits', desc: 'Chips, cookies, namkeen, and chocolates' },
  { name: 'Beverages', desc: 'Cold drinks, juices, tea, coffee, and water' },
  { name: 'Grains & Pulses', desc: 'Atta, rice, dal, sugar, and oil' },
  { name: 'Spices & Condiments', desc: 'Masalas, salt, turmeric, sauces, and pickles' },
  { name: 'Household Items', desc: 'Detergents, cleaners, garbage bags, and utensils' },
  { name: 'Personal Care', desc: 'Soaps, shampoos, toothpaste, and creams' },
  { name: 'Pooja & Stationery', desc: 'Incense sticks, matchboxes, notebooks, and pens' },
];

const PRODUCTS_CATALOG = [
  // ─── Dairy & Bread ──────────────────────────────────────────────────────────
  { cat: 'Dairy & Bread', name: 'Amul Taaza Milk 500ml', sku: 'DRY-001', sp: 28, cp: 25.5, unit: ProductUnit.ML, stock: 120 },
  { cat: 'Dairy & Bread', name: 'Amul Gold Milk 500ml', sku: 'DRY-002', sp: 33, cp: 30.0, unit: ProductUnit.ML, stock: 100 },
  { cat: 'Dairy & Bread', name: 'Amul Salted Butter 100g', sku: 'DRY-003', sp: 58, cp: 51.5, unit: ProductUnit.PCS, stock: 50 },
  { cat: 'Dairy & Bread', name: 'Amul Salted Butter 500g', sku: 'DRY-004', sp: 275, cp: 245.0, unit: ProductUnit.PCS, stock: 25 },
  { cat: 'Dairy & Bread', name: 'Amul Masti Dahi 200g', sku: 'DRY-005', sp: 25, cp: 21.0, unit: ProductUnit.PCS, stock: 80 },
  { cat: 'Dairy & Bread', name: 'Amul Masti Dahi 400g', sku: 'DRY-006', sp: 45, cp: 39.0, unit: ProductUnit.PCS, stock: 40 },
  { cat: 'Dairy & Bread', name: 'Mother Dairy Paneer 200g', sku: 'DRY-007', sp: 90, cp: 78.0, unit: ProductUnit.PCS, stock: 35 },
  { cat: 'Dairy & Bread', name: 'Amul Cheese Slices 200g', sku: 'DRY-008', sp: 145, cp: 128.0, unit: ProductUnit.PACK, stock: 30 },
  { cat: 'Dairy & Bread', name: 'Amul Ghee 1L Carton', sku: 'DRY-009', sp: 660, cp: 590.0, unit: ProductUnit.L, stock: 15 },
  { cat: 'Dairy & Bread', name: 'Harvest Gold Sandwich Bread Large', sku: 'DRY-010', sp: 50, cp: 42.0, unit: ProductUnit.PCS, stock: 60 },
  { cat: 'Dairy & Bread', name: 'English Oven Brown Bread 400g', sku: 'DRY-011', sp: 55, cp: 46.0, unit: ProductUnit.PCS, stock: 30 },
  { cat: 'Dairy & Bread', name: 'Brittania Rusk 250g', sku: 'DRY-012', sp: 40, cp: 33.0, unit: ProductUnit.PACK, stock: 65 },
  { cat: 'Dairy & Bread', name: 'Nandini GoodLife Slim Milk 1L', sku: 'DRY-013', sp: 68, cp: 60.0, unit: ProductUnit.L, stock: 45 },
  { cat: 'Dairy & Bread', name: 'Amul Fresh Cream 250ml', sku: 'DRY-014', sp: 67, cp: 58.5, unit: ProductUnit.ML, stock: 25 },
  { cat: 'Dairy & Bread', name: 'Kwality Walls Vanilla 700ml Tub', sku: 'DRY-015', sp: 150, cp: 122.0, unit: ProductUnit.ML, stock: 18 },

  // ─── Snacks & Biscuits ──────────────────────────────────────────────────────
  { cat: 'Snacks & Biscuits', name: 'Parle-G Biscuits Gold 250g', sku: 'SNC-001', sp: 20, cp: 16.5, unit: ProductUnit.PACK, stock: 150 },
  { cat: 'Snacks & Biscuits', name: 'Parle-G Biscuits Large 500g', sku: 'SNC-002', sp: 40, cp: 33.0, unit: ProductUnit.PACK, stock: 100 },
  { cat: 'Snacks & Biscuits', name: 'Britannia Marie Gold 250g', sku: 'SNC-003', sp: 35, cp: 29.0, unit: ProductUnit.PACK, stock: 120 },
  { cat: 'Snacks & Biscuits', name: 'Britannia Good Day Cashew 200g', sku: 'SNC-004', sp: 40, cp: 32.5, unit: ProductUnit.PACK, stock: 90 },
  { cat: 'Snacks & Biscuits', name: 'Sunfeast Dark Fantasy Choco Fills 300g', sku: 'SNC-005', sp: 120, cp: 98.0, unit: ProductUnit.PACK, stock: 40 },
  { cat: 'Snacks & Biscuits', name: 'Oreo Chocolate Biscuits 120g', sku: 'SNC-006', sp: 30, cp: 24.5, unit: ProductUnit.PACK, stock: 110 },
  { cat: 'Snacks & Biscuits', name: 'Haldirams Bhujia Sev 150g', sku: 'SNC-007', sp: 35, cp: 29.0, unit: ProductUnit.PACK, stock: 140 },
  { cat: 'Snacks & Biscuits', name: 'Haldirams Bhujia Sev 1kg', sku: 'SNC-008', sp: 240, cp: 205.0, unit: ProductUnit.KG, stock: 25 },
  { cat: 'Snacks & Biscuits', name: 'Haldirams Aloo Bhujia 150g', sku: 'SNC-009', sp: 35, cp: 28.5, unit: ProductUnit.PACK, stock: 160 },
  { cat: 'Snacks & Biscuits', name: 'Lays Chips Classic Salted 50g', sku: 'SNC-010', sp: 20, cp: 15.5, unit: ProductUnit.PACK, stock: 130 },
  { cat: 'Snacks & Biscuits', name: 'Lays Chips India Masala 50g', sku: 'SNC-011', sp: 20, cp: 15.5, unit: ProductUnit.PACK, stock: 140 },
  { cat: 'Snacks & Biscuits', name: 'Lays Chips Spanish Tomato 50g', sku: 'SNC-012', sp: 20, cp: 15.5, unit: ProductUnit.PACK, stock: 120 },
  { cat: 'Snacks & Biscuits', name: 'Kurkure Masala Munch 90g', sku: 'SNC-013', sp: 20, cp: 16.0, unit: ProductUnit.PACK, stock: 150 },
  { cat: 'Snacks & Biscuits', name: 'Uncle Chipps Spicy Treat 50g', sku: 'SNC-014', sp: 20, cp: 15.8, unit: ProductUnit.PACK, stock: 90 },
  { cat: 'Snacks & Biscuits', name: 'Cadbury Dairy Milk Silk 150g', sku: 'SNC-015', sp: 80, cp: 68.0, unit: ProductUnit.PCS, stock: 45 },
  { cat: 'Snacks & Biscuits', name: 'KitKat 4 Finger Chocolate', sku: 'SNC-016', sp: 40, cp: 33.5, unit: ProductUnit.PCS, stock: 70 },
  { cat: 'Snacks & Biscuits', name: 'Snickers Peanut Bar 50g', sku: 'SNC-017', sp: 50, cp: 42.0, unit: ProductUnit.PCS, stock: 60 },
  { cat: 'Snacks & Biscuits', name: 'Maggi 2-Min Masala Noodles 70g', sku: 'SNC-018', sp: 14, cp: 11.5, unit: ProductUnit.PACK, stock: 250 },
  { cat: 'Snacks & Biscuits', name: 'Maggi Noodles Family Pack 560g', sku: 'SNC-019', sp: 96, cp: 82.0, unit: ProductUnit.PACK, stock: 80 },
  { cat: 'Snacks & Biscuits', name: 'Yippee Noodles Magic Masala 70g', sku: 'SNC-020', sp: 14, cp: 11.8, unit: ProductUnit.PACK, stock: 180 },
  { cat: 'Snacks & Biscuits', name: 'Act II Popcorn Golden Sizzle 60g', sku: 'SNC-021', sp: 15, cp: 12.0, unit: ProductUnit.PACK, stock: 100 },
  { cat: 'Snacks & Biscuits', name: 'Haldirams Moong Dal 150g', sku: 'SNC-022', sp: 35, cp: 29.5, unit: ProductUnit.PACK, stock: 110 },
  { cat: 'Snacks & Biscuits', name: 'Nutrela Soya Chunks 200g', sku: 'SNC-023', sp: 50, cp: 42.0, unit: ProductUnit.PACK, stock: 75 },
  { cat: 'Snacks & Biscuits', name: 'MTR Rava Idli Mix 500g', sku: 'SNC-024', sp: 125, cp: 106.0, unit: ProductUnit.PACK, stock: 35 },
  { cat: 'Snacks & Biscuits', name: 'Bikano Cornflakes Mixture 150g', sku: 'SNC-025', sp: 40, cp: 33.0, unit: ProductUnit.PACK, stock: 80 },

  // ─── Beverages ──────────────────────────────────────────────────────────────
  { cat: 'Beverages', name: 'Coca Cola 2.25L Bottle', sku: 'BEV-001', sp: 100, cp: 86.0, unit: ProductUnit.PCS, stock: 60 },
  { cat: 'Beverages', name: 'Pepsi 2.25L Bottle', sku: 'BEV-002', sp: 95, cp: 82.0, unit: ProductUnit.PCS, stock: 50 },
  { cat: 'Beverages', name: 'Sprite 750ml Bottle', sku: 'BEV-003', sp: 45, cp: 38.0, unit: ProductUnit.PCS, stock: 80 },
  { cat: 'Beverages', name: 'Thums Up 250ml Can', sku: 'BEV-004', sp: 35, cp: 29.5, unit: ProductUnit.PCS, stock: 120 },
  { cat: 'Beverages', name: 'Red Bull Energy Drink 250ml', sku: 'BEV-005', sp: 125, cp: 104.0, unit: ProductUnit.PCS, stock: 40 },
  { cat: 'Beverages', name: 'Bisleri Water 1L Bottle', sku: 'BEV-006', sp: 20, cp: 14.5, unit: ProductUnit.PCS, stock: 200 },
  { cat: 'Beverages', name: 'Bisleri Water 5L Can', sku: 'BEV-007', sp: 70, cp: 52.0, unit: ProductUnit.PCS, stock: 50 },
  { cat: 'Beverages', name: 'Tropicana Orange Juice 1L', sku: 'BEV-008', sp: 120, cp: 99.0, unit: ProductUnit.L, stock: 30 },
  { cat: 'Beverages', name: 'Real Mixed Fruit Juice 1L', sku: 'BEV-009', sp: 110, cp: 92.0, unit: ProductUnit.L, stock: 45 },
  { cat: 'Beverages', name: 'Tata Tea Premium 1kg Pack', sku: 'BEV-010', sp: 420, cp: 375.0, unit: ProductUnit.KG, stock: 35 },
  { cat: 'Beverages', name: 'Red Label Tea 500g Pack', sku: 'BEV-011', sp: 240, cp: 212.0, unit: ProductUnit.PACK, stock: 50 },
  { cat: 'Beverages', name: 'Taj Mahal Tea 250g Pack', sku: 'BEV-012', sp: 195, cp: 172.0, unit: ProductUnit.PACK, stock: 25 },
  { cat: 'Beverages', name: 'Nescafe Classic Coffee 100g Glass Jar', sku: 'BEV-013', sp: 340, cp: 298.0, unit: ProductUnit.PCS, stock: 30 },
  { cat: 'Beverages', name: 'Bru Gold Instant Coffee 100g', sku: 'BEV-014', sp: 320, cp: 280.0, unit: ProductUnit.PCS, stock: 20 },
  { cat: 'Beverages', name: 'Bournvita Chocolate Drink 500g Jar', sku: 'BEV-015', sp: 245, cp: 215.0, unit: ProductUnit.PCS, stock: 24 },
  { cat: 'Beverages', name: 'Horlicks Malt Drink 500g Refill', sku: 'BEV-016', sp: 235, cp: 208.0, unit: ProductUnit.PCS, stock: 30 },
  { cat: 'Beverages', name: 'Kissan Mixed Fruit Jam 700g', sku: 'BEV-017', sp: 260, cp: 228.0, unit: ProductUnit.PCS, stock: 15 },
  { cat: 'Beverages', name: 'Yakult Probiotic Drink 5-Pack', sku: 'BEV-018', sp: 90, cp: 78.5, unit: ProductUnit.PACK, stock: 16 },
  { cat: 'Beverages', name: 'Paper Boat Aamras 250ml', sku: 'BEV-019', sp: 35, cp: 29.0, unit: ProductUnit.PCS, stock: 60 },
  { cat: 'Beverages', name: 'Tang Lemon Flavor Drink Powder 500g', sku: 'BEV-020', sp: 160, cp: 138.0, unit: ProductUnit.PACK, stock: 28 },

  // ─── Grains & Pulses ────────────────────────────────────────────────────────
  { cat: 'Grains & Pulses', name: 'Ashirvaad Shudh Chakki Atta 5kg', sku: 'GRN-001', sp: 260, cp: 228.0, unit: ProductUnit.KG, stock: 80 },
  { cat: 'Grains & Pulses', name: 'Ashirvaad Shudh Chakki Atta 10kg', sku: 'GRN-002', sp: 480, cp: 420.0, unit: ProductUnit.KG, stock: 50 },
  { cat: 'Grains & Pulses', name: 'Fortune Chakki Fresh Atta 10kg', sku: 'GRN-003', sp: 440, cp: 388.0, unit: ProductUnit.KG, stock: 40 },
  { cat: 'Grains & Pulses', name: 'India Gate Basmati Rice Feast Rozzana 5kg', sku: 'GRN-004', sp: 450, cp: 395.0, unit: ProductUnit.KG, stock: 35 },
  { cat: 'Grains & Pulses', name: 'Daawat Rozana Super Basmati Rice 5kg', sku: 'GRN-005', sp: 390, cp: 340.0, unit: ProductUnit.KG, stock: 45 },
  { cat: 'Grains & Pulses', name: 'Rajdhani Besan 1kg Pack', sku: 'GRN-006', sp: 95, cp: 82.0, unit: ProductUnit.KG, stock: 70 },
  { cat: 'Grains & Pulses', name: 'Rajdhani Maida 1kg Pack', sku: 'GRN-007', sp: 55, cp: 46.5, unit: ProductUnit.KG, stock: 60 },
  { cat: 'Grains & Pulses', name: 'Rajdhani Sooji 1kg Pack', sku: 'GRN-008', sp: 60, cp: 51.0, unit: ProductUnit.KG, stock: 50 },
  { cat: 'Grains & Pulses', name: 'Tata Sampann Toor Dal 1kg', sku: 'GRN-009', sp: 180, cp: 156.0, unit: ProductUnit.KG, stock: 55 },
  { cat: 'Grains & Pulses', name: 'Tata Sampann Chana Dal 1kg', sku: 'GRN-010', sp: 110, cp: 96.0, unit: ProductUnit.KG, stock: 65 },
  { cat: 'Grains & Pulses', name: 'Tata Sampann Moong Dal Chilka 1kg', sku: 'GRN-011', sp: 165, cp: 142.0, unit: ProductUnit.KG, stock: 40 },
  { cat: 'Grains & Pulses', name: 'Tata Sampann Urad Dal White 1kg', sku: 'GRN-012', sp: 175, cp: 150.0, unit: ProductUnit.KG, stock: 45 },
  { cat: 'Grains & Pulses', name: 'Fortune Mustard Oil 1L Bottle', sku: 'GRN-013', sp: 165, cp: 148.0, unit: ProductUnit.L, stock: 120 },
  { cat: 'Grains & Pulses', name: 'Fortune Soyabean Refined Oil 1L Bottle', sku: 'GRN-014', sp: 140, cp: 122.5, unit: ProductUnit.L, stock: 100 },
  { cat: 'Grains & Pulses', name: 'Saffola Gold Blended Oil 5L Can', sku: 'GRN-015', sp: 950, cp: 840.0, unit: ProductUnit.L, stock: 15 },
  { cat: 'Grains & Pulses', name: 'Madhur Pure Sugar 1kg Pack', sku: 'GRN-016', sp: 55, cp: 48.0, unit: ProductUnit.KG, stock: 200 },
  { cat: 'Grains & Pulses', name: 'Madhur Pure Sugar 5kg Pack', sku: 'GRN-017', sp: 265, cp: 232.0, unit: ProductUnit.KG, stock: 60 },
  { cat: 'Grains & Pulses', name: 'Saffola Oats 1kg Pack', sku: 'GRN-018', sp: 195, cp: 165.0, unit: ProductUnit.KG, stock: 40 },
  { cat: 'Grains & Pulses', name: 'Kelloggs Corn Flakes 500g', sku: 'GRN-019', sp: 210, cp: 182.0, unit: ProductUnit.PACK, stock: 35 },
  { cat: 'Grains & Pulses', name: 'Tata Sampann Kabuli Chana 1kg', sku: 'GRN-020', sp: 160, cp: 139.0, unit: ProductUnit.KG, stock: 48 },
  { cat: 'Grains & Pulses', name: 'Tata Sampann Rajma Red 1kg', sku: 'GRN-021', sp: 170, cp: 147.0, unit: ProductUnit.KG, stock: 36 },
  { cat: 'Grains & Pulses', name: 'Goldiee Poha Medium 1kg', sku: 'GRN-022', sp: 65, cp: 54.0, unit: ProductUnit.KG, stock: 80 },
  { cat: 'Grains & Pulses', name: 'Rajdhani Sabudana 500g', sku: 'GRN-023', sp: 55, cp: 46.0, unit: ProductUnit.PACK, stock: 60 },
  { cat: 'Grains & Pulses', name: 'Tata Sampann Masoor Dal 1kg', sku: 'GRN-024', sp: 120, cp: 102.0, unit: ProductUnit.KG, stock: 40 },
  { cat: 'Grains & Pulses', name: 'Dry Figs (Anjeer) Premium 250g', sku: 'GRN-025', sp: 380, cp: 320.0, unit: ProductUnit.PACK, stock: 15 },
  { cat: 'Grains & Pulses', name: 'California Almonds 500g Pack', sku: 'GRN-026', sp: 480, cp: 410.0, unit: ProductUnit.PACK, stock: 24 },
  { cat: 'Grains & Pulses', name: 'Whole Cashew nuts W320 250g', sku: 'GRN-027', sp: 290, cp: 245.0, unit: ProductUnit.PACK, stock: 30 },
  { cat: 'Grains & Pulses', name: 'Del Monte Whole Prunes 300g Pack', sku: 'GRN-028', sp: 320, cp: 275.0, unit: ProductUnit.PACK, stock: 12 },

  // ─── Spices & Condiments ────────────────────────────────────────────────────
  { cat: 'Spices & Condiments', name: 'Tata Salt Regular 1kg', sku: 'SPC-001', sp: 28, cp: 22.0, unit: ProductUnit.KG, stock: 250 },
  { cat: 'Spices & Condiments', name: 'Tata Salt Lite 1kg', sku: 'SPC-002', sp: 40, cp: 33.5, unit: ProductUnit.KG, stock: 100 },
  { cat: 'Spices & Condiments', name: 'Catch Turmeric Powder 200g', sku: 'SPC-003', sp: 45, cp: 36.5, unit: ProductUnit.PACK, stock: 95 },
  { cat: 'Spices & Condiments', name: 'Catch Coriander Powder 200g', sku: 'SPC-004', sp: 50, cp: 41.0, unit: ProductUnit.PACK, stock: 90 },
  { cat: 'Spices & Condiments', name: 'MDH Deggi Mirch Powder 100g', sku: 'SPC-005', sp: 95, cp: 81.0, unit: ProductUnit.PACK, stock: 110 },
  { cat: 'Spices & Condiments', name: 'MDH Garam Masala Powder 100g', sku: 'SPC-006', sp: 102, cp: 88.0, unit: ProductUnit.PACK, stock: 85 },
  { cat: 'Spices & Condiments', name: 'MDH Kitchen King Masala 100g', sku: 'SPC-007', sp: 98, cp: 84.0, unit: ProductUnit.PACK, stock: 75 },
  { cat: 'Spices & Condiments', name: 'Catch Kasuri Methi 50g', sku: 'SPC-008', sp: 32, cp: 26.0, unit: ProductUnit.PACK, stock: 60 },
  { cat: 'Spices & Condiments', name: 'Maggi Masala-Ae-Magic 12-Pack', sku: 'SPC-009', sp: 60, cp: 50.0, unit: ProductUnit.PACK, stock: 140 },
  { cat: 'Spices & Condiments', name: 'Maggi Hot & Sweet Tomato Ketchup 1kg Jar', sku: 'SPC-010', sp: 175, cp: 148.0, unit: ProductUnit.PCS, stock: 40 },
  { cat: 'Spices & Condiments', name: 'Kissan Fresh Tomato Ketchup 1.2kg Refill', sku: 'SPC-011', sp: 160, cp: 136.0, unit: ProductUnit.PCS, stock: 35 },
  { cat: 'Spices & Condiments', name: 'FunFoods Veg Mayonnaise Original 500g', sku: 'SPC-012', sp: 149, cp: 126.0, unit: ProductUnit.PCS, stock: 28 },
  { cat: 'Spices & Condiments', name: 'Ching Secret Soy Sauce 200g', sku: 'SPC-013', sp: 60, cp: 51.0, unit: ProductUnit.PCS, stock: 45 },
  { cat: 'Spices & Condiments', name: 'Ching Secret Green Chilli Sauce 200g', sku: 'SPC-014', sp: 55, cp: 46.5, unit: ProductUnit.PCS, stock: 50 },
  { cat: 'Spices & Condiments', name: 'Dabur Honey 250g Squeeze Bottle', sku: 'SPC-015', sp: 125, cp: 104.0, unit: ProductUnit.PCS, stock: 30 },
  { cat: 'Spices & Condiments', name: 'Dabur Honey 500g Bottle', sku: 'SPC-016', sp: 235, cp: 198.0, unit: ProductUnit.PCS, stock: 18 },
  { cat: 'Spices & Condiments', name: 'Dano Milk Powder 500g Pack', sku: 'SPC-017', sp: 290, cp: 248.0, unit: ProductUnit.PACK, stock: 22 },
  { cat: 'Spices & Condiments', name: 'Knorr Sweet Corn Veg Soup Mix 40g', sku: 'SPC-018', sp: 55, cp: 46.0, unit: ProductUnit.PACK, stock: 80 },

  // ─── Household Items ────────────────────────────────────────────────────────
  { cat: 'Household Items', name: 'Surf Excel Easy Wash Detergent 1kg', sku: 'HSH-001', sp: 145, cp: 122.0, unit: ProductUnit.KG, stock: 90 },
  { cat: 'Household Items', name: 'Surf Excel Matic Top Load 2kg Pack', sku: 'HSH-002', sp: 410, cp: 355.0, unit: ProductUnit.KG, stock: 40 },
  { cat: 'Household Items', name: 'Vim Dishwash Liquid Lemon 500ml', sku: 'HSH-003', sp: 120, cp: 99.0, unit: ProductUnit.ML, stock: 150 },
  { cat: 'Household Items', name: 'Vim Dishwash Gel Bottle 1L', sku: 'HSH-004', sp: 230, cp: 198.0, unit: ProductUnit.L, stock: 60 },
  { cat: 'Household Items', name: 'Vim Dishwash Bar 135g Pack', sku: 'HSH-005', sp: 10, cp: 8.0, unit: ProductUnit.PCS, stock: 300 },
  { cat: 'Household Items', name: 'Vim Dishwash Bar multipack 3+1 free', sku: 'HSH-006', sp: 40, cp: 32.5, unit: ProductUnit.PACK, stock: 100 },
  { cat: 'Household Items', name: 'Exo Dishwash Touch bar 300g', sku: 'HSH-007', sp: 30, cp: 24.5, unit: ProductUnit.PCS, stock: 80 },
  { cat: 'Household Items', name: 'Pril Liquid Dishwash Lemon 425ml', sku: 'HSH-008', sp: 110, cp: 92.5, unit: ProductUnit.ML, stock: 70 },
  { cat: 'Household Items', name: 'Scotch Brite Scrub Pad Pack of 3', sku: 'HSH-009', sp: 50, cp: 39.0, unit: ProductUnit.PACK, stock: 110 },
  { cat: 'Household Items', name: 'Comfort After Wash Fabric Conditioner 860ml', sku: 'HSH-010', sp: 220, cp: 188.0, unit: ProductUnit.ML, stock: 40 },
  { cat: 'Household Items', name: 'Colin Glass Cleaner Spray 500ml', sku: 'HSH-011', sp: 105, cp: 88.0, unit: ProductUnit.ML, stock: 45 },
  { cat: 'Household Items', name: 'Harpic Toilet Cleaner Liquid Blue 1L', sku: 'HSH-012', sp: 215, cp: 182.0, unit: ProductUnit.L, stock: 85 },
  { cat: 'Household Items', name: 'Harpic Bathroom Cleaner Yellow 500ml', sku: 'HSH-013', sp: 110, cp: 93.0, unit: ProductUnit.ML, stock: 50 },
  { cat: 'Household Items', name: 'Lizol Disinfectant Floor Cleaner 2L', sku: 'HSH-014', sp: 395, cp: 342.0, unit: ProductUnit.L, stock: 30 },
  { cat: 'Household Items', name: 'Dettol Antiseptic Liquid 500ml', sku: 'HSH-015', sp: 235, cp: 202.0, unit: ProductUnit.ML, stock: 45 },
  { cat: 'Household Items', name: 'Gala Grass Broom Large', sku: 'HSH-016', sp: 160, cp: 125.0, unit: ProductUnit.PCS, stock: 25 },
  { cat: 'Household Items', name: 'Hit Flying Insect Spray Aerosol 400ml', sku: 'HSH-017', sp: 240, cp: 205.0, unit: ProductUnit.ML, stock: 35 },
  { cat: 'Household Items', name: 'All Out Ultra Mosquito Repellent Refill 2-Pack', sku: 'HSH-018', sp: 155, cp: 132.0, unit: ProductUnit.PACK, stock: 65 },
  { cat: 'Household Items', name: 'Durex Mutual Climax Condoms 10s', sku: 'HSH-019', sp: 260, cp: 218.0, unit: ProductUnit.PACK, stock: 20 },
  { cat: 'Household Items', name: 'Mortein Mosquito Coils 10-Pack', sku: 'HSH-020', sp: 45, cp: 36.5, unit: ProductUnit.PACK, stock: 90 },
  { cat: 'Household Items', name: 'Aer Pocket Home Fragrance 10g', sku: 'HSH-021', sp: 55, cp: 46.0, unit: ProductUnit.PCS, stock: 80 },
  { cat: 'Household Items', name: 'Pigeon Stainless Steel Scrubber Pack of 4', sku: 'HSH-022', sp: 40, cp: 30.0, unit: ProductUnit.PACK, stock: 75 },
  { cat: 'Household Items', name: 'Kitchen Garbage Bags Medium 30s', sku: 'HSH-023', sp: 95, cp: 78.0, unit: ProductUnit.PACK, stock: 60 },

  // ─── Personal Care ──────────────────────────────────────────────────────────
  { cat: 'Personal Care', name: 'Dettol Original Soap 75g (4+1 pack)', sku: 'PC-001', sp: 160, cp: 138.0, unit: ProductUnit.PACK, stock: 120 },
  { cat: 'Personal Care', name: 'Dettol Original Liquid Handwash 900ml Refill', sku: 'PC-002', sp: 190, cp: 162.0, unit: ProductUnit.ML, stock: 80 },
  { cat: 'Personal Care', name: 'Lifebuoy Total 10 Soap 125g Pack of 3', sku: 'PC-003', sp: 130, cp: 111.0, unit: ProductUnit.PACK, stock: 95 },
  { cat: 'Personal Care', name: 'Sunsilk Black Shine Shampoo 350ml', sku: 'PC-004', sp: 260, cp: 220.0, unit: ProductUnit.ML, stock: 50 },
  { cat: 'Personal Care', name: 'Dove Cream Beauty Bar 125g (3-pack)', sku: 'PC-005', sp: 280, cp: 242.0, unit: ProductUnit.PACK, stock: 45 },
  { cat: 'Personal Care', name: 'Colgate Strong Teeth Toothpaste 300g Pack', sku: 'PC-006', sp: 180, cp: 154.0, unit: ProductUnit.PACK, stock: 110 },
  { cat: 'Personal Care', name: 'Colgate MaxFresh Gel Red 150g', sku: 'PC-007', sp: 110, cp: 92.0, unit: ProductUnit.PACK, stock: 85 },
  { cat: 'Personal Care', name: 'Sensodyne Fresh Mint Toothpaste 100g', sku: 'PC-008', sp: 195, cp: 168.0, unit: ProductUnit.PACK, stock: 60 },
  { cat: 'Personal Care', name: 'Oral-B Sensitive Toothbrush Medium', sku: 'PC-009', sp: 45, cp: 36.5, unit: ProductUnit.PCS, stock: 120 },
  { cat: 'Personal Care', name: 'Parachute 100% Coconut Hair Oil 250ml', sku: 'PC-010', sp: 115, cp: 98.0, unit: ProductUnit.ML, stock: 140 },
  { cat: 'Personal Care', name: 'Parachute Coconut Hair Oil 500ml', sku: 'PC-011', sp: 225, cp: 196.0, unit: ProductUnit.ML, stock: 65 },
  { cat: 'Personal Care', name: 'Almond Drops Hair Oil 200ml', sku: 'PC-012', sp: 140, cp: 121.0, unit: ProductUnit.ML, stock: 55 },
  { cat: 'Personal Care', name: 'Ponds White Beauty Talcum Powder 400g', sku: 'PC-013', sp: 290, cp: 248.0, unit: ProductUnit.G, stock: 35 },
  { cat: 'Personal Care', name: 'Fogg Royal Body Spray Perfume 150ml', sku: 'PC-014', sp: 250, cp: 212.0, unit: ProductUnit.ML, stock: 40 },
  { cat: 'Personal Care', name: 'Wild Stone Code Steel Body Spray 120ml', sku: 'PC-015', sp: 225, cp: 191.0, unit: ProductUnit.ML, stock: 30 },
  { cat: 'Personal Care', name: 'Stayfree Secure Extra Large Cottony 40s', sku: 'PC-016', sp: 320, cp: 272.0, unit: ProductUnit.PACK, stock: 50 },
  { cat: 'Personal Care', name: 'Whisper Ultra Clean Sanitary Pads XL 30s', sku: 'PC-017', sp: 350, cp: 298.0, unit: ProductUnit.PACK, stock: 45 },
  { cat: 'Personal Care', name: 'Pears Pure Gentle Glycerine Soap 125g x 3', sku: 'PC-018', sp: 260, cp: 224.0, unit: ProductUnit.PACK, stock: 32 },
  { cat: 'Personal Care', name: 'Dabur Red Toothpaste 150g Pack', sku: 'PC-019', sp: 95, cp: 80.0, unit: ProductUnit.PACK, stock: 75 },
  { cat: 'Personal Care', name: 'Gillette Guard Razor with Cartridge', sku: 'PC-020', sp: 30, cp: 22.0, unit: ProductUnit.PCS, stock: 100 },
  { cat: 'Personal Care', name: 'Gillette Shaving Foam Sensitive 200ml', sku: 'PC-021', sp: 195, cp: 165.0, unit: ProductUnit.ML, stock: 40 },
  { cat: 'Personal Care', name: 'Nivea Soft Light Moisturizing Cream 200ml', sku: 'PC-022', sp: 325, cp: 278.0, unit: ProductUnit.ML, stock: 25 },
  { cat: 'Personal Care', name: 'Himalaya Purifying Neem Face Wash 150ml', sku: 'PC-023', sp: 180, cp: 151.0, unit: ProductUnit.ML, stock: 48 },
  { cat: 'Personal Care', name: 'Vaseline Cocoa Glow Body Lotion 400ml', sku: 'PC-024', sp: 410, cp: 352.0, unit: ProductUnit.ML, stock: 28 },
  { cat: 'Personal Care', name: 'Park Avenue Beer Shampoo 180ml', sku: 'PC-025', sp: 160, cp: 135.0, unit: ProductUnit.ML, stock: 30 },

  // ─── Pooja & Stationery ─────────────────────────────────────────────────────
  { cat: 'Pooja & Stationery', name: 'Cycle Three-in-One Agarbatti Incense Sticks', sku: 'PJA-001', sp: 80, cp: 65.5, unit: ProductUnit.PACK, stock: 120 },
  { cat: 'Pooja & Stationery', name: 'Mangaldeep Sandalwood Agarbatti Pack of 2', sku: 'PJA-002', sp: 90, cp: 74.0, unit: ProductUnit.PACK, stock: 90 },
  { cat: 'Pooja & Stationery', name: 'Camphor (Kapur) Tablets Pure 100g Pack', sku: 'PJA-003', sp: 120, cp: 99.0, unit: ProductUnit.PACK, stock: 85 },
  { cat: 'Pooja & Stationery', name: 'Cotton Wicks (Rui Batti) Round 100s Pack', sku: 'PJA-004', sp: 30, cp: 22.5, unit: ProductUnit.PACK, stock: 140 },
  { cat: 'Pooja & Stationery', name: 'Ship Safety Matchboxes 10-Pack bundle', sku: 'PJA-005', sp: 20, cp: 14.0, unit: ProductUnit.PACK, stock: 160 },
  { cat: 'Pooja & Stationery', name: 'Classmate Notebook Single Line 120 Pages', sku: 'PJA-006', sp: 45, cp: 36.0, unit: ProductUnit.PCS, stock: 180 },
  { cat: 'Pooja & Stationery', name: 'Classmate Register Notebook A4 size 240 Pgs', sku: 'PJA-007', sp: 90, cp: 74.0, unit: ProductUnit.PCS, stock: 100 },
  { cat: 'Pooja & Stationery', name: 'Cello Butterflow Blue Ballpoint Pens 5s Pack', sku: 'PJA-008', sp: 50, cp: 38.5, unit: ProductUnit.PACK, stock: 110 },
  { cat: 'Pooja & Stationery', name: 'Natraj HB Pencils Box of 10 with Eraser', sku: 'PJA-009', sp: 60, cp: 47.0, unit: ProductUnit.PACK, stock: 80 },
  { cat: 'Pooja & Stationery', name: 'Pidilite Fevicol MR Squeeze Bottle 50g', sku: 'PJA-010', sp: 25, cp: 20.0, unit: ProductUnit.PCS, stock: 65 },
  { cat: 'Pooja & Stationery', name: 'Fevikwik Instant Adhesive Gel 3g tube', sku: 'PJA-011', sp: 10, cp: 7.8, unit: ProductUnit.PCS, stock: 200 },
  { cat: 'Pooja & Stationery', name: 'Apsara Dust Free Eraser Multipack of 5', sku: 'PJA-012', sp: 25, cp: 18.0, unit: ProductUnit.PACK, stock: 90 },
  { cat: 'Pooja & Stationery', name: 'Camel Wax Crayons 12-Colors Box', sku: 'PJA-013', sp: 30, cp: 24.0, unit: ProductUnit.PACK, stock: 75 },
];

async function main() {
  console.log('🌱 Deleting existing database logs...');
  
  // Clean tables to prevent seeding duplication issues
  await prisma.billItem.deleteMany({});
  await prisma.bill.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});

  console.log('🌱 Seeding administrative user credentials...');
  const passwordHash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@kiranaos.com' },
    update: { passwordHash },
    create: {
      name: 'Admin User',
      email: 'admin@kiranaos.com',
      passwordHash,
      role: UserRole.ADMIN,
    },
  });
  console.log(`✅ Seeded login credentials: ${admin.email} / admin123`);

  // Seed Categories
  const categoryMap = new Map<string, string>();
  for (const cat of CATEGORIES_DATA) {
    const created = await prisma.category.create({
      data: { name: cat.name, description: cat.desc, userId: admin.id },
    });
    categoryMap.set(cat.name, created.id);
  }
  console.log(`✅ ${categoryMap.size} categories created successfully`);

  // Seed 200+ Products (Filling placeholders to reach exactly 200 items)
  console.log('🌱 Seeding Kirana products catalogue (200 items)...');
  const createdProducts: any[] = [];
  
  // Insert initial catalog items
  for (const item of PRODUCTS_CATALOG) {
    const catId = categoryMap.get(item.cat);
    if (!catId) continue;
    const prod = await prisma.product.create({
      data: {
        name: item.name,
        sku: item.sku,
        categoryId: catId,
        sellingPrice: item.sp,
        costPrice: item.cp,
        stockQty: item.stock,
        unit: item.unit,
        userId: admin.id,
      },
    });
    createdProducts.push(prod);
  }

  // Programmatically pad catalog to reach exactly 200 items
  const baseCategoryNames = Array.from(categoryMap.keys());
  const currentCount = createdProducts.length;
  const targetCount = 200;

  for (let i = currentCount + 1; i <= targetCount; i++) {
    const catName = baseCategoryNames[i % baseCategoryNames.length];
    const catId = categoryMap.get(catName)!;
    const padSku = `PAD-${String(i).padStart(3, '0')}`;
    const cost = Math.floor(10 + Math.random() * 200);
    const markup = 1.1 + Math.random() * 0.25; // 10% to 35% margin
    const sellPrice = Math.round(cost * markup);
    const unitsList = [ProductUnit.PCS, ProductUnit.PACK, ProductUnit.KG, ProductUnit.G];
    
    const prod = await prisma.product.create({
      data: {
        name: `${catName} Extra Item ${i}`,
        sku: padSku,
        categoryId: catId,
        sellingPrice: sellPrice,
        costPrice: cost,
        stockQty: Math.floor(40 + Math.random() * 150),
        unit: unitsList[i % unitsList.length],
        userId: admin.id,
      },
    });
    createdProducts.push(prod);
  }
  console.log(`✅ Seeded exactly ${createdProducts.length} items in the database catalog.`);

  // Generate 180+ Completed bills over the last 30 days
  console.log('🌱 Generating historical sales bills for the past 30 days (180+ bills)...');
  
  const billsToGenerate = 190;
  const batchSize = 20;
  let totalBillsCreated = 0;

  // Distribute bills timeline across the last 30 days
  for (let b = 1; b <= billsToGenerate; b++) {
    const daysAgo = Math.floor(Math.random() * 30); // 0 to 29 days ago
    const hour = Math.floor(9 + Math.random() * 12); // shop open hours (9:00 to 21:00)
    const minute = Math.floor(Math.random() * 60);
    
    const billDate = new Date();
    billDate.setDate(billDate.getDate() - daysAgo);
    billDate.setHours(hour, minute, 0, 0);

    // Pick 1 to 5 random products for this bill
    const itemsCount = Math.floor(1 + Math.random() * 5);
    const selectedProducts: any[] = [];
    const usedProductIds = new Set<string>();

    for (let k = 0; k < itemsCount; k++) {
      const randomProd = createdProducts[Math.floor(Math.random() * createdProducts.length)];
      if (!usedProductIds.has(randomProd.id)) {
        selectedProducts.push(randomProd);
        usedProductIds.add(randomProd.id);
      }
    }

    const billNumber = `BILL-${billDate.getFullYear()}${String(billDate.getMonth() + 1).padStart(2, '0')}${String(billDate.getDate()).padStart(2, '0')}-${String(1000 + b).slice(1)}`;

    let subtotal = 0;
    const itemsData = selectedProducts.map((p) => {
      const quantity = Math.floor(1 + Math.random() * 4); // 1 to 4 units
      const unitPrice = Number(p.sellingPrice);
      const costPrice = Number(p.costPrice);
      const itemSubtotal = unitPrice * quantity;
      subtotal += itemSubtotal;

      return {
        productId: p.id,
        productName: p.name,
        quantity,
        unitPrice,
        costPrice,
        subtotal: itemSubtotal,
      };
    });

    const discount = Math.random() > 0.7 ? Math.round(subtotal * 0.05) : 0; // 30% chance of a 5% discount
    const total = Math.max(0, subtotal - discount);

    await prisma.bill.create({
      data: {
        billNumber,
        userId: admin.id,
        subtotal,
        discount,
        tax: 0,
        total,
        status: 'COMPLETED',
        notes: Math.random() > 0.85 ? 'Paid online' : null,
        createdAt: billDate,
        updatedAt: billDate,
        items: {
          create: itemsData,
        },
      },
    });

    // Periodically update product stock levels to match bills
    for (const item of itemsData) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stockQty: { decrement: item.quantity } },
      });
    }

    totalBillsCreated++;
  }

  console.log(`✅ Generated ${totalBillsCreated} completed historical bills successfully.`);
  console.log('\n🎉 KiranaOS database is now fully populated with 30-day realistic business logs!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding process crashed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
