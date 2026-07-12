# KiranaOS 🛒

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CC?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white)](https://turbo.build/)

**KiranaOS** is a production-grade, highly optimized SaaS Point of Sale (POS) and inventory management platform designed for local retail stores (kirana shops). 

The platform supports a full multi-tenant architecture, allowing any grocery shop owner to register their shop, set up their inventory, manage checkouts, and print custom thermal receipts. It replaces manual ledgers with a responsive, digital terminal while ensuring complete database-level data isolation between different shops.

---

## 🏛️ System Architecture

The application is structured as a TypeScript monorepo using **npm workspaces** and **Turborepo** for optimized local compilation and deployment pipelines.  

* **Backend (`apps/api`):** A Node.js/Express REST server that integrates with a PostgreSQL database via Prisma ORM. Secures endpoint routes via JWT validation and Helmet headers. Enforces strict multitenancy constraints on all query selectors.
* **Frontend (`apps/web`):** A Next.js (App Router) client built with Tailwind CSS v4, providing an optimized dashboard for tablet and desktop billing terminals.

```
kiranaOS/
├── apps/
│   ├── api/             # Express API Server
│   │   ├── prisma/      # Schema, migrations, and database seeders
│   │   └── src/
│   │       ├── config/  # Client instances
│   │       ├── modules/ # Modules: auth, categories, products, bills, reports
│   │       └── utils/
│   └── web/             # Next.js App Router Client
│       ├── app/         # Pages (Billing Terminal, Invoice Ledger, Reports, Inventory)
│       ├── components/  # Core structural layouts (Sidebar, Topbar)
│       ├── hooks/       # Custom React state hooks
│       └── lib/         # Axios config & interceptor rules
├── package.json         # Workspace root settings
└── turbo.json           # Turborepo caching pipelines
```

---

## ⚙️ Core Technical Highlights

### 1. Multi-Tenant Data Isolation
To securely host multiple stores on a single platform, all database queries are scoped by the logged-in user's context:
*   Compound database indexes (`@@unique([sku, userId])` on Products and `@@unique([name, userId])` on Categories) prevent collisions between different stores.
*   Data access layers enforce strict query filters (`where: { userId: req.user.userId }`), securing and isolating each merchant's inventories and transaction ledgers.

### 2. Auto-Onboarding Engine
When a new store owner signs up, the backend automatically triggers an onboarding script that seeds the merchant's account with basic FMCG categories and popular default products (e.g. Milk, Butter, Biscuits) to provide a ready-to-use playground.

### 3. Concurrency Control (Atomic Billing Transactions)
To prevent incorrect stock levels during concurrent checkouts, the POS billing system writes transactions using database-level transaction queries. When a cashier completes a bill:
1. Current product stock limits are locked and validated.
2. The `Bill` and `BillItem` records are created.
3. Product stock counts are decremented atomically.
If any validation fails (e.g. stock goes below zero), the entire operation rolls back, preserving inventory integrity.

### 4. Client-Side Input Debouncing
Product catalogue lookups during billing utilize search input debouncing (300ms delay), avoiding database performance hits and ensuring the checkout terminal renders lag-free.

### 5. Thermal Printer Formatter
Includes a dedicated print module that formats invoice metadata into standard 80mm thermal receipt formats, dynamically pulling customized store details (Name, Address, Phone, GSTIN) from the merchant's profile.

---

## 🚀 Getting Started (Local Development)

### Prerequisites
* **Node.js** >= 20.0.0
* **PostgreSQL** running locally

### 1. Installation
Clone and install dependencies from the monorepo root:
```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/kiranaOS.git
cd kiranaOS
npm install
```

### 2. Set Up Environment variables
Create a `.env` file in the API subfolder:
```bash
cp apps/api/.env.example apps/api/.env
```
Open `apps/api/.env` and update your PostgreSQL connection string:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/kiranaos?schema=public"
JWT_SECRET="your-secret-key"
```

### 3. Database Migration & Setup
Migrate local tables and restore the inventory catalog & transaction records:
```bash
cd apps/api
npx prisma db push
npx prisma db seed
```

### 4. Boot Servers
Run the development workspace:
```bash
npm run dev
```
* **API Server:** http://localhost:4000
* **Web App:** http://localhost:3000

---

## 📊 API Endpoints Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| **POST** | `/api/auth/register` | Register a new store owner (seeds defaults) | No |
| **POST** | `/api/auth/login` | Authenticate user and sign JWT | No |
| **GET** | `/api/auth/me` | Fetch active user credentials | Yes |
| **PUT** | `/api/auth/profile` | Update store owner name/email | Yes |
| **GET** | `/api/products` | Paginated search of active products | Yes |
| **POST** | `/api/products` | Create a new inventory product | Yes |
| **PUT** | `/api/products/:id` | Update product information | Yes |
| **DELETE** | `/api/products/:id` | Soft-delete a product from catalog | Yes |
| **POST** | `/api/bills` | Checkout a cart and save a bill (atomic) | Yes |
| **GET** | `/api/bills` | Paginated view of invoice history | Yes |
| **GET** | `/api/reports/summary` | Today's KPI metrics (Sales, Profit, Bills count) | Yes |
| **GET** | `/api/reports/best-sellers` | Top 10 best-selling items today | Yes |

---

## 🔐 Demo Credentials
Log in to your local or deployed dashboard using the pre-seeded store owner account (fully populated with 200 products & 60 bills of active retail history):

* **Email:** `nikhil@kirana.com`
* **Password:** `nikhil123`
