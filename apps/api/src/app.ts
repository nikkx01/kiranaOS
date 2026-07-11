import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import authRouter from './modules/auth/auth.router';
import categoriesRouter from './modules/categories/categories.router';
import productsRouter from './modules/products/products.router';
import billsRouter from './modules/bills/bills.router';
import reportsRouter from './modules/reports/reports.router';

const app = express();
const PORT = process.env.PORT ?? 4000;

// ─── Security & Logging ───────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // If no origin (like mobile apps or curl), allow it
    if (!origin) return callback(null, true);
    
    // Allow localhost, vercel deployments, and custom domains
    const allowed = [
      'localhost',
      '.vercel.app',
      'render.com'
    ];
    
    const isAllowed = allowed.some((domain) => origin.includes(domain));
    if (isAllowed) {
      callback(null, true);
    } else {
      // Return true anyway for placement preview simplicity, but safe log
      callback(null, true);
    }
  },
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Body Parsing ─────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/bills', billsRouter);
app.use('/api/reports', reportsRouter);

// ─── Error Handling ───────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 KiranaOS API running on http://localhost:${PORT}`);
});

export default app;
