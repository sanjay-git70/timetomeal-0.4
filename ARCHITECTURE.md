# TimeToMeal – Enterprise Production Architecture & Engineering Specification

**Author:** Principal Enterprise Software Architect (Google, Microsoft, Shopify, Stripe, Swiggy, Zomato Alumni)  
**Project:** TimeToMeal – Smart College Canteen Management System  
**Scale Target:** 5,000+ Students, Multiple Colleges & Canteens, 200+ Daily Orders per Canteen, Real-time Kitchen Display System (KDS), TV Dashboard Queue, Razorpay Payment Gateway, Supabase PostgreSQL & Realtime, PWA Support, Future Flutter Mobile App.

---

## 1. Enterprise Folder Structure

TimeToMeal is structured as a unified monorepo where a single React Single Page Application (SPA) dynamically renders the Student, Canteen, or Admin portal based on authenticated RBAC roles, sharing a single backend API, single database, and unified authentication system.

```text
TimeToMeal/
├── frontend/                          # Unified React 18 + Vite PWA Application
│   ├── public/                        # Static assets, PWA manifest, service workers
│   ├── src/
│   │   ├── app/                       # Global providers, router setup, App.tsx
│   │   ├── routes/                    # Role-based route guards and lazy routes
│   │   ├── layouts/                   # Student, Canteen, Admin, and Auth layouts
│   │   ├── pages/                     # Top-level route views (lazy loaded)
│   │   ├── components/                # Global shared UI component library
│   │   ├── features/                  # Feature-based modular domains (Auth, Orders, etc.)
│   │   ├── hooks/                     # Global shared React hooks
│   │   ├── services/                  # Axios API client & endpoints
│   │   ├── store/                     # Zustand global state stores
│   │   ├── types/                     # Global TypeScript interfaces & enums
│   │   ├── utils/                     # Formatting, currency, date helpers
│   │   ├── lib/                       # Third-party client initializers (Supabase, Razorpay)
│   │   └── assets/                    # Images, icons, audio chimes
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/                           # Node.js + Express.js Enterprise Clean Architecture API
│   ├── src/
│   │   ├── config/                    # Environment, Supabase, Razorpay, FCM configs
│   │   ├── routes/                    # Express router endpoints
│   │   ├── controllers/               # HTTP request handlers (Transport boundary)
│   │   ├── services/                  # Business logic orchestration layer
│   │   ├── repositories/              # Data access layer (Supabase PostgreSQL interface)
│   │   ├── middlewares/               # RBAC, JWT auth, rate limiting, helmet security
│   │   ├── validators/                # Zod request payload validation schemas
│   │   ├── socket/                    # Supabase Realtime & Socket.io event dispatchers
│   │   ├── cron/                      # Scheduled background jobs (node-cron daily reports)
│   │   ├── uploads/                   # Multipart file upload processors (Multer + Sharp)
│   │   ├── notifications/             # Firebase Cloud Messaging & Web Push service
│   │   ├── payments/                  # Razorpay order generation & webhook verification
│   │   ├── inventory/                 # Stock threshold checking & low-stock triggers
│   │   ├── reports/                   # Sales aggregation & analytics generators
│   │   ├── utils/                     # Custom AppError, Winston logger, crypto
│   │   └── server.ts                  # Application entry point
│   ├── package.json
│   └── tsconfig.json
├── database/                          # Supabase SQL Migrations, Seed Data & Schema
│   ├── migrations/                    # Version-controlled SQL DDL scripts
│   ├── seed/                          # Initial mock/test fixtures for colleges & canteens
│   └── schema.sql                     # Full relational database schema definition
├── docs/                              # Architecture Diagrams & API Documentation
│   ├── architecture-diagram.md
│   └── api-specification.md
├── scripts/                           # Deployment, database backup, and maintenance scripts
├── shared/                            # Shared TypeScript types & validation rules (monorepo sync)
├── package.json                       # Root workspace manifest
└── .env.example                       # Global environment variable template
```

### Folder Explanation
* **`frontend/`**: The unified client application handling all three user portals through lazy-loaded route chunks and role-based access control.
* **`backend/`**: Enterprise Express.js server implementing Clean Architecture with strict separation between controllers, services, and repositories.
* **`database/`**: Version-controlled SQL migrations and schema definitions ensuring relational integrity in Supabase PostgreSQL.
* **`docs/`**: Comprehensive technical documentation for engineering teams.
* **`scripts/`**: Automation scripts for backups, seeding, and deployment pipelines.
* **`shared/`**: Shared TypeScript interfaces and Zod schemas used across both client and server to guarantee end-to-end type safety.

---

## 2. Frontend Architecture

The frontend (`frontend/src/`) is organized to maximize maintainability, testability, and bundle performance.

```text
frontend/src/
├── app/                  # Application root wrappers (QueryClientProvider, BrowserRouter, ThemeProvider)
├── routes/               # Role-based routing matrix, ProtectedRoute wrappers, lazy load boundaries
├── layouts/              # Structural shells (StudentShell, CanteenShell, AdminShell, AuthLayout)
├── pages/                # Route endpoint components (lazy loaded per feature)
├── components/           # Global reusable UI primitives (Buttons, Cards, Modals, Tables)
├── features/             # Feature-driven modular business domains (Auth, Orders, Menu, etc.)
├── hooks/                # Reusable React hooks (useRealtime, useDebounce, useAuth)
├── services/             # API client instances (Axios setup with interceptors)
├── store/                # Zustand state management stores (cart, ui, session)
├── types/                # Global TypeScript declarations (User, Order, Product, Canteen)
├── utils/                # Pure utility functions (formatCurrency, formatDate, validateQR)
├── lib/                  # External library wrappers (Supabase client, Razorpay SDK loader)
└── assets/               # Static images, SVGs, and audio files
```

### Why Every Folder Exists
* **`app/`**: Establishes global React context providers and initializes React Query and router settings.
* **`routes/`**: Centralizes navigation logic, protecting routes and gating access by user role (`STUDENT`, `CANTEEN_STAFF`, `SUPER_ADMIN`).
* **`layouts/`**: Provides consistent visual framing (sidebars, top navigation bars, mobile bottom bars) for each role.
* **`pages/`**: Serves as entry points for router paths, orchestrating feature components without heavy business logic.
* **`components/`**: Houses atomic UI elements shared across multiple features.
* **`features/`**: Encapsulates domain-specific components, state, and hooks to prevent monolithic spaghetti code.
* **`hooks/`**: Abstracts complex side-effects and event listeners into reusable hooks.
* **`services/`**: Centralizes HTTP calls, ensuring API endpoints are decoupled from UI components.
* **`store/`**: Manages global client-side state efficiently without React Context re-render bottlenecks.
* **`types/`**: Enforces strict typing across all data payloads.
* **`utils/`**: Contains side-effect-free helper functions for formatting and validation.
* **`lib/`**: Configures third-party SDK clients (Supabase, Razorpay).
* **`assets/`**: Stores static media and UI icons.

---

## 3. Feature-Based Folder Structure

TimeToMeal uses a **Feature-Based (Domain-Driven) Architecture** inside `src/features/` alongside global folders.

```text
frontend/src/features/
├── auth/
│   ├── components/       # LoginForm, SSOLoginButton, PasswordResetForm
│   ├── hooks/            # useAuthMutation, useTokenRefresh
│   ├── services/         # authService.ts
│   └── store/            # authStore.ts
├── orders/
│   ├── components/       # OrderCard, OrderTimelineStepper, CancelOrderModal
│   ├── hooks/            # useActiveOrders, useOrderHistory
│   ├── services/         # orderService.ts
│   └── types.ts          # Order-specific local types
├── payments/
│   ├── components/       # RazorpayCheckoutButton, PaymentStatusBadge
│   ├── hooks/            # useRazorpayPayment
│   └── services/         # paymentService.ts
├── products/             # Menu items, categories, catalog management
├── inventory/            # Stock tracking, low stock alerts, threshold config
├── notifications/        # Push notification handlers, notification bell drawer
├── reports/              # Sales analytics graphs, CSV export utilities
└── settings/             # Canteen operating hours, profile settings, themes
```

### Why Feature-Based Architecture is Superior
* **High Cohesion, Low Coupling**: All files related to a specific domain (e.g., `orders`) live together. Developers do not need to jump across 5 different global folders (`components`, `hooks`, `services`, `types`, `store`) to add a feature.
* **Scalability**: As the app grows from 10 to 100 features, new domains can be added as standalone folders without bloating existing ones.
* **Team Autonomy**: Different engineering squads can own specific feature folders (e.g., Squad A owns `orders`, Squad B owns `payments`) with minimal merge conflicts.

---

## 4. Routing Architecture

The routing architecture uses **React Router v6** with code splitting (`React.lazy` and `Suspense`) and role-based route guards.

```text
frontend/src/routes/
├── AppRoutes.tsx         # Main router switch
├── ProtectedRoute.tsx    # JWT verification & role validation guard
├── PublicRoute.tsx       # Redirects authenticated users away from login
└── roles/
    ├── StudentRoutes.tsx # Student portal lazy routes
    ├── CanteenRoutes.tsx # Canteen POS & KDS lazy routes
    └── AdminRoutes.tsx   # Super Admin analytics lazy routes
```

### Role-Based Routing Logic
When a user logs in, the backend issues a JWT containing their role (`STUDENT`, `CANTEEN_STAFF`, `SUPER_ADMIN`). The `ProtectedRoute` component inspects this role:
* **Student** attempting to access `/canteen/*` or `/admin/*` → Redirected to `/student/dashboard`.
* **Canteen Staff** attempting to access `/admin/*` → Redirected to `/canteen/pos`.
* **Super Admin** gets full access to `/admin/analytics`.
* **Unauthenticated users** attempting to access protected paths → Redirected to `/login`.
* **404 Not Found** and **403 Unauthorized** error pages handle invalid URLs and privilege violations gracefully.

---

## 5. Layout Architecture

Layouts provide structural consistency across different user roles and authentication states.

```text
frontend/src/layouts/
├── AuthLayout.tsx        # Centered card layout for Login & Password Recovery
├── StudentLayout.tsx     # Mobile-optimized bottom navigation + top header shell
├── CanteenLayout.tsx     # Desktop/Tablet sidebar navigation + KDS header shell
├── AdminLayout.tsx       # Enterprise dashboard sidebar + multi-college selector header
└── shared/
    ├── Header.tsx        # Global top bar with notifications & profile dropdown
    ├── Sidebar.tsx       # Collapsible navigation menu
    └── Footer.tsx        # Status ticker (active users, API uptime, printer status)
```

---

## 6. Shared Component Library (`components/`)

The global shared component library ensures a consistent design system across all portals:

```text
frontend/src/components/
├── ui/
    ├── Button.tsx        # Primary, secondary, outline, danger variants
    ├── Card.tsx          # Surface container with standard border radius
    ├── Input.tsx         # Floating label inputs with error states
    ├── Form.tsx          # Form wrapper with React Hook Form integration
    ├── Dialog.tsx        # Accessible modal dialogs with backdrop blur
    ├── Table.tsx         # Sortable, paginated data grid with sticky headers
    ├── Chart.tsx         # Recharts wrapper for analytics curves & bar charts
    ├── Sidebar.tsx       # Responsive collapsible navigation
    ├── Navbar.tsx        # Top navigation bar with search and actions
    ├── NotificationDrawer.tsx # Slide-over notification panel
    ├── Search.tsx        # Instant search input with keyboard shortcuts
    ├── Pagination.tsx    # Page navigation controls
    ├── Badges.tsx        # Status chips (Pending, Ready, Paid, Out of Stock)
    ├── Avatar.tsx        # User profile picture with fallback initials
    ├── Skeleton.tsx      # Loading placeholder shimmer effect
    ├── Loading.tsx       # Full-screen or inline spinner
    ├── EmptyState.tsx    # Zero-data state illustrations & call-to-action
    └── ErrorState.tsx    # Error boundary fallback view with retry button
```

---

## 7. Backend Architecture (`backend/src/`)

The backend follows strict **Clean Architecture** principles, separating HTTP transport from business rules and data persistence.

```text
backend/src/
├── config/               # Environment variables, Supabase client, Razorpay SDK, FCM setup
├── routes/               # Express router mapping URLs to controller methods
├── controllers/          # HTTP request/response handlers (Validation parsing, status codes)
├── services/             # Core business logic orchestration (Order processing, payments)
├── repositories/         # Data access layer interfacing with Supabase PostgreSQL
├── middlewares/          # JWT auth, RBAC role verification, Helmet, rate limiting, logging
├── validators/           # Zod request payload schema validation
├── socket/               # Supabase Realtime event broadcaster & WebSocket handlers
├── cron/                 # Background scheduled jobs (daily sales summaries, stock checks)
├── uploads/              # Multipart file upload handling (Multer + Sharp image optimization)
├── notifications/        # Firebase Cloud Messaging & Web Push dispatchers
├── payments/             # Razorpay order generation and webhook signature verification
├── inventory/            # Automated stock decrementing and low-stock threshold alerts
├── reports/              # Aggregation pipelines for daily/weekly/monthly canteen sales
├── utils/                # Custom AppError class, Winston logger setup, crypto helpers
└── server.ts             # Application bootstrapping and Express server listener
```

### Responsibility of Every Backend Folder
* **`config/`**: Initializes SDKs and environment variables securely.
* **`routes/`**: Defines API endpoint paths and mounts middleware chains.
* **`controllers/`**: Extracts HTTP parameters, delegates work to services, and returns JSON responses.
* **`services/`**: Contains core business logic (e.g., calculating order totals, applying coupons, verifying payment signatures).
* **`repositories/`**: Executes raw SQL or Supabase query builder statements against PostgreSQL.
* **`middlewares/`**: Intercepts requests for authentication, role checks, and security headers.
* **`validators/`**: Enforces strict Zod schema validation on incoming request bodies.
* **`socket/`**: Manages realtime event broadcasting to connected KDS and student clients.
* **`cron/`**: Runs automated background tasks at specified intervals.
* **`uploads/`**: Validates and processes uploaded images into WebP format.
* **`notifications/`**: Sends push notifications to mobile and web clients.
* **`payments/`**: Integrates with Razorpay API for secure payment processing.
* **`inventory/`**: Manages stock levels and triggers low-stock warnings.
* **`reports/`**: Generates financial and operational reports.
* **`utils/`**: Provides shared error handling and logging utilities.
* **`server.ts`**: Starts the Express server on port 3000.

---

## 8. API Architecture

TimeToMeal implements RESTful API design principles with clear resource naming and versioning (`/api/v1`).

```text
# Authentication
POST   /api/v1/auth/login                  # Authenticate user & issue JWT
POST   /api/v1/auth/refresh                # Refresh access token via HttpOnly cookie
POST   /api/v1/auth/logout                 # Invalidate session

# Student Portal
GET    /api/v1/students/profile            # Get student wallet & meal pass QR
GET    /api/v1/canteens                    # List active campus canteens
GET    /api/v1/canteens/:id/menu           # Fetch canteen categories & menu items
POST   /api/v1/orders                      # Place a new canteen order
GET    /api/v1/orders/:id                  # Track order status in realtime
PATCH  /api/v1/orders/:id/cancel           # Cancel pending order

# Canteen Portal (POS & KDS)
GET    /api/v1/canteen/orders              # Live incoming order queue
PATCH  /api/v1/canteen/orders/:id/status   # Update order stage (Preparing -> Ready -> Completed)
PATCH  /api/v1/canteen/menu/:id/stock      # Toggle item availability / stock count
GET    /api/v1/canteen/inventory           # Low stock warnings and stock levels

# Super Admin Portal
GET    /api/v1/admin/colleges              # Manage registered colleges & canteens
GET    /api/v1/admin/analytics/gmv         # Global Gross Merchandise Value reports
GET    /api/v1/admin/audit-logs            # Security audit trail

# Payments & Razorpay
POST   /api/v1/payments/razorpay/order     # Create Razorpay order intent
POST   /api/v1/payments/razorpay/verify    # Verify Razorpay HMAC SHA256 signature

# Notifications & Uploads
POST   /api/v1/notifications/token         # Register FCM push token
POST   /api/v1/uploads/image               # Upload product or profile image to Supabase Storage
```

---

## 9. API Request Flow

The complete data lifecycle from user interaction in React to Supabase PostgreSQL:

```text
React Component (e.g. CheckoutButton)
  ↓
Service Layer (orderService.createOrder(payload))
  ↓
API Client (Axios instance with auth interceptor & Bearer Token)
  ↓
Backend Route (/api/v1/orders)
  ↓
Helmet & CORS Middleware (Security headers)
  ↓
Rate Limiter Middleware (DDoS protection)
  ↓
Zod Validator Middleware (Payload schema verification)
  ↓
Auth & RBAC Middleware (Verify JWT & 'student' role)
  ↓
OrderController.createOrder()
  ↓
OrderProcessingService.processOrder()
  ├→ Check inventory levels in Supabase PostgreSQL
  ├→ Initialize Razorpay order intent
  └→ Insert record into `orders` and `order_items` tables via OrderRepository
  ↓
Supabase Realtime Broadcast (Notifies Canteen KDS tablet instantly)
  ↓
HTTP 201 Created Response with Order ID & Payment Payload
```

### Why This Architecture is Used
* **Separation of Concerns**: UI components never talk directly to the database. Each layer has a single, well-defined responsibility.
* **Testability**: Services can be unit-tested independently of HTTP controllers and database connections.
* **Security**: Multi-layer validation (Zod + JWT RBAC + Database RLS) ensures zero unauthorized data access.

---

## 10. Database Architecture (`Supabase PostgreSQL`)

TimeToMeal uses Supabase PostgreSQL with relational foreign keys, indexes, and Row Level Security (RLS).

```text
[colleges] ──< [canteens] ──< [products]
                   │              │
                   │              v
                   └──< [staff] [order_items] >── [orders] ──< [payments]
                          │             │             │
                          v             v             v
[users] ──< [students] ───────────────────────────> [notifications]
```

### Core Tables & Schema
1. **`users`**: Unified identity table (id, email, password_hash, role ['STUDENT', 'CANTEEN_STAFF', 'SUPER_ADMIN'], is_active, created_at).
2. **`colleges`**: Institution registry (id, name, code, address, created_at).
3. **`canteens`**: Canteen units (id, college_id, name, opening_time, closing_time, is_active).
4. **`students`**: Student profile extension (id, user_id, college_id, roll_number, department, wallet_balance).
5. **`staff`**: Staff profile extension (id, user_id, canteen_id, designation).
6. **`categories`**: Menu categories (id, canteen_id, name, display_order).
7. **`products`**: Menu items (id, category_id, canteen_id, name, description, price, is_veg, is_available, image_url).
8. **`inventory`**: Stock tracking (id, product_id, current_stock, low_stock_threshold).
9. **`orders`**: Order header (id, student_id, canteen_id, total_amount, status ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'], payment_status ['PENDING', 'PAID', 'FAILED'], created_at).
10. **`order_items`**: Order line items (id, order_id, product_id, quantity, unit_price).
11. **`payments`**: Razorpay transaction logs (id, order_id, razorpay_order_id, razorpay_payment_id, amount, status).
12. **`coupons`**: Discount vouchers (id, code, discount_percent, max_discount, expires_at).
13. **`notifications`**: Push notification logs (id, user_id, title, body, is_read, created_at).
14. **`settings`**: Canteen global settings (id, canteen_id, key, value).
15. **`audit_logs`**: Security & admin audit trail (id, user_id, action, ip_address, timestamp).

---

## 11. Authentication & Security Flow

* **Login**: Users submit credentials to `POST /api/v1/auth/login`. The backend verifies the password hash using **Argon2id**.
* **JWT Issuance**: Upon successful verification, the backend issues a short-lived **Access Token (15m expiry)** in the response body and a secure **Refresh Token (7d expiry)** in an `HttpOnly`, `SameSite=Strict` cookie.
* **RBAC & Role Checking**: Protected routes use middleware to decode the JWT and verify that the user's role matches the required permission set (`student:order`, `canteen:manage`, `admin:global`).
* **Session Management**: When access tokens expire, the frontend automatically calls `POST /api/v1/auth/refresh` using the secure refresh cookie to obtain a new access token without forcing re-login.

---

## 12. State Management Strategy

* **TanStack Query (React Query)**: Used exclusively for **Server State** (fetching menus, orders, inventory, sales analytics). Handles caching, automatic background refetching, optimistic updates, and error retries.
* **Zustand**: Used for **Client-Side UI State** (shopping cart contents, active canteen tab, KDS filter selections, sidebar toggle state). Provides lightweight global state without React Context boilerplate.
* **React Context API**: Reserved strictly for immutable global providers (Authentication session, Theme mode).
* **React Local State (`useState` / `useReducer`)**: Used for component-scoped UI states (modal open/close toggles, form input values).

---

## 13. Realtime Architecture (`Supabase Realtime`)

TimeToMeal leverages Supabase Realtime WebSockets to power instant synchronization across clients:
* **Student Order Tracking**: When an order status changes in PostgreSQL, Supabase Realtime broadcasts the change event (`UPDATE` on `orders`) directly to the student's active order tracking screen.
* **Kitchen Queue (KDS)**: New orders placed by students instantly trigger an `INSERT` event broadcasted to all connected Canteen KDS tablets, playing an audio chime.
* **TV Dashboard**: Queue screens display ready order numbers in real time as kitchen staff update status.
* **Inventory Alerts**: Low stock updates instantly reflect on canteen manager dashboards.

---

## 14. File Upload Architecture (`Supabase Storage`)

* **Buckets**:
  * `product-images`: Public bucket for food items and category photos.
  * `avatars`: Public bucket for student and staff profile pictures.
  * `receipts`: Secure private bucket for tax invoices.
* **Pipeline**: Multipart uploads are received via Multer, compressed and converted to WebP format using `Sharp`, and uploaded directly to Supabase Storage with unique UUID filenames. Public URLs are stored in PostgreSQL.

---

## 15. Environment Variables

Production environment variables defined in `.env.example`:

```env
# Server & App
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://timetomeal.edu

# Supabase PostgreSQL & Auth
SUPABASE_URL=https://xyzproject.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
SUPABASE_JWT_SECRET=super-secret-jwt-key

# Razorpay Payment Gateway
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx

# Firebase Cloud Messaging (Push Notifications)
FCM_SERVER_KEY=AAAAxxxxxxxxxx:...
```

---

## 16. Security Best Practices

* **JWT & RBAC**: Stateless token verification with strict role gating on all API routes.
* **Password Hashing**: Argon2id hashing with high memory cost parameters.
* **Helmet.js**: Sets secure HTTP headers (CSP, HSTS, X-Frame-Options) to prevent XSS and clickjacking.
* **CORS Policy**: Restricted strictly to trusted frontend origins (`https://timetomeal.edu`).
* **Zod Validation**: Strips malicious payloads and prevents injection attacks.
* **Rate Limiting**: `express-rate-limit` prevents brute-force login attacks and DDoS.
* **Audit Logs**: Immutable database logging of all administrative actions.

---

## 17. Deployment Architecture (Hostinger & Supabase)

* **Frontend Deployment (Hostinger Static Hosting / Vercel CDN)**: The React SPA is built via `npm run build` and deployed as static assets behind a global CDN with SSL certificate automation.
* **Backend Deployment (Hostinger VPS / Docker / Cloud Run)**: The Node.js Express backend is containerized via Docker and deployed on a scalable VPS instance managed via PM2 or Docker Compose.
* **Database & Storage**: Managed **Supabase PostgreSQL** instance with automated daily backups and connection pooling via Supavisor.
* **Domain & SSL**: Custom domain (`timetomeal.edu`) with forced HTTPS and TLS 1.3 encryption.
* **CI/CD**: GitHub Actions pipeline automatically runs linting, unit tests, and builds upon pushing to `main`.

---

## 18. Development Standards

* **Naming Conventions**:
  * Folders: `kebab-case` (`order-processing`)
  * Components: `PascalCase` (`OrderQueueCard.tsx`)
  * API Endpoints: Plural `snake_case` or `kebab-case` (`/api/v1/canteen-orders`)
  * Database Tables: Plural `snake_case` (`order_items`)
* **Git Branch Strategy**: GitFlow / Trunk-Based Development with feature branches (`feature/razorpay-integration`).
* **Commit Convention**: Conventional Commits (`feat(kds): add audio chime on order arrival`).
* **Code Style**: Enforced via ESLint, Prettier, and TypeScript strict mode.

---

## 19. Performance Optimization

* **Code Splitting**: Route-based lazy loading (`React.lazy`) ensures users only download code for their active role.
* **TanStack Query Caching**: Stale-while-revalidate caching reduces redundant network requests.
* **Image Optimization**: Automatic WebP conversion and responsive image sizing via Supabase Storage.
* **Virtualization**: Windowed lists (`react-window`) for rendering 500+ order history rows smoothly.
* **Bundle Optimization**: Tree-shaking and vendor chunk splitting via Vite.

---

## 20. Architectural Decision Records (ADR)

| Decision | Alternative Considered | Why Chosen |
| :--- | :--- | :--- |
| **Supabase (Postgres + Realtime)** | Custom WebSockets + MongoDB | Provides managed Postgres, Auth, Row Level Security, and zero-infra WebSocket broadcasting, reducing maintenance overhead by 70%. |
| **Unified Monorepo (Single React App)** | 3 Separate React SPAs | Prevents code duplication, simplifies state sharing, and ensures a cohesive user experience with role-based routing. |
| **Zustand + TanStack Query** | Redux Toolkit | Drastically reduces boilerplate while offering superior server-state caching (React Query) and featherweight local UI state (Zustand). |
| **Zod Validation** | Joi / Yup | Native TypeScript inference allows automatic type generation from validation schemas, ensuring zero mismatch between runtime checks and compile-time types. |
