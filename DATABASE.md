# 🗄️ Database Architecture & Schema Documentation — TimeToMeal

This document provides a complete guide and standard **PostgreSQL / Supabase** database schema for the **TimeToMeal** Hostel Canteen & Pre-Ordering platform.

---

## 📌 Table of Contents
1. [Overview & ER Diagram Summary](#overview--er-diagram-summary)
2. [Database Setup Instructions](#database-setup-instructions)
3. [Complete SQL DDL Schema Script](#complete-sql-ddl-schema-script)
4. [Table Field Specifications](#table-field-specifications)
5. [Row Level Security (RLS) & Policies](#row-level-security-rls--policies)
6. [Sample Seed Data (Initial Setup)](#sample-seed-data-initial-setup)
7. [React Integration Guide](#react-integration-guide)

---

## 1. Overview & ER Diagram Summary

The TimeToMeal database handles three primary user roles (**Students**, **Canteen Staff**, and **Admins**) along with meal ordering, inventory tracking, and payment receipts.

### Key Entities & Relationships:
- **`users`**: Central auth table storing credentials and roles (`student`, `staff`, `admin`).
- **`student_profiles`**: Linked 1:1 with `users` (Stores Hostel Block, Room Number, Register No).
- **`canteen_profiles`**: Linked 1:1 with `users` (Stores Canteen/Mess name, logo, operating hours, printer and payment settings).
- **`admin_profiles`**: Linked 1:1 with `users` (System admins and staff managers).
- **`menu_items`**: Belongs to a Canteen (`canteen_id`). Tracks online/offline stock, pricing, vegetarian status, and category (`breakfast`, `lunch`, `snacks`).
- **`orders`**: Connects a Student with a Canteen. Contains token code (`order_code`), order type (`online`, `walk-in`), and order status (`pending`, `preparing`, `ready`, `delivered`, `cancelled`).
- **`order_items`**: Junction table for items in an order (stores snapshot price & quantity).
- **`payments`**: Payment transaction record linked to an order (`QR`, `cash`, `UPI`, `Razorpay`).

---

## 2. Database Setup Instructions

### Option A: Supabase (Recommended)
1. Go to [Supabase](https://supabase.com) and create a new project.
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste the entire SQL script from Section 3 below and click **Run**.
4. Copy your `SUPABASE_URL` and `SUPABASE_ANON_KEY` from **Project Settings > API**.
5. Add these to your `.env` file:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### Option B: Standard PostgreSQL / Cloud SQL
1. Connect to your PostgreSQL database instance using `psql` or PGAdmin:
   ```bash
   psql -h localhost -U postgres -d timetomeal_db
   ```
2. Run the SQL script from Section 3 to construct the tables and indexes.

---

## 3. Complete SQL DDL Schema Script

Run the following SQL commands to initialize custom enums, tables, foreign key constraints, and triggers:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. ENUM TYPES
-- ==========================================
CREATE TYPE app_role AS ENUM ('student', 'staff', 'admin');
CREATE TYPE meal_category AS ENUM ('breakfast', 'lunch', 'snacks');
CREATE TYPE order_status AS ENUM ('pending', 'preparing', 'ready', 'delivered', 'cancelled');
CREATE TYPE order_type AS ENUM ('online', 'walk-in');
CREATE TYPE payment_method AS ENUM ('QR', 'cash', 'UPI', 'Razorpay');
CREATE TYPE payment_status AS ENUM ('partial', 'completed');
CREATE TYPE canteen_status AS ENUM ('active', 'inactive');

-- ==========================================
-- 2. USERS TABLE (Central Auth)
-- ==========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role app_role NOT NULL DEFAULT 'student',
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. USER PROFILES
-- ==========================================

-- Student Profiles
CREATE TABLE student_profiles (
    student_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    register_number VARCHAR(50) UNIQUE NOT NULL,
    hostel_name VARCHAR(100) NOT NULL, -- e.g. "Hostel Block A", "Hostel Block B"
    room_number VARCHAR(20) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Canteen / Mess Profiles
CREATE TABLE canteen_profiles (
    canteen_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    canteen_name VARCHAR(150) NOT NULL,
    owner_name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    logo_url TEXT,
    is_online BOOLEAN DEFAULT true,
    status canteen_status DEFAULT 'active',
    open_time TIME DEFAULT '07:00:00',
    close_time TIME DEFAULT '22:00:00',
    printer_settings JSONB DEFAULT '{
        "printer_name": "Thermal Printer 80mm",
        "printer_type": "thermal",
        "paper_size": "80mm",
        "print_speed": "medium",
        "auto_cut": true,
        "print_header_text": "TimeToMeal Canteen",
        "print_footer_text": "Thank you! Visit again.",
        "show_logo": true,
        "show_datetime": true,
        "show_ordertype": true,
        "show_prices": true,
        "font_size": "medium"
    }'::jsonb,
    payment_settings JSONB DEFAULT '{
        "qr_image_url": "",
        "qr_enabled": true,
        "default_payment_mode": "online"
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admin Profiles
CREATE TABLE admin_profiles (
    admin_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 4. MENU ITEMS (Food / Meal Items)
-- ==========================================
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canteen_id UUID NOT NULL REFERENCES canteen_profiles(canteen_id) ON DELETE CASCADE,
    item_name VARCHAR(150) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    category meal_category NOT NULL,
    availability BOOLEAN DEFAULT true,
    image_url TEXT,
    stock_online INT DEFAULT 0 CHECK (stock_online >= 0),
    stock_offline INT DEFAULT 0 CHECK (stock_offline >= 0),
    low_stock_threshold INT DEFAULT 10,
    description TEXT,
    is_veg BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 5. ORDERS & PURCHASES
-- ==========================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES student_profiles(student_id) ON DELETE SET NULL,
    canteen_id UUID NOT NULL REFERENCES canteen_profiles(canteen_id) ON DELETE CASCADE,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    paid_amount DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
    order_status order_status NOT NULL DEFAULT 'pending',
    order_type order_type NOT NULL DEFAULT 'online',
    order_code VARCHAR(20) NOT NULL, -- e.g., "M101", "W205"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Items (Junction Table)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    item_name VARCHAR(150) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    quantity INT NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 6. PAYMENTS & TRANSACTIONS
-- ==========================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payment_method payment_method NOT NULL,
    payment_status payment_status NOT NULL DEFAULT 'completed',
    transaction_reference VARCHAR(100),
    paid_amount DECIMAL(10, 2) NOT NULL CHECK (paid_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 7. PERFORMANCE INDEXES
-- ==========================================
CREATE INDEX idx_menu_canteen ON menu_items(canteen_id);
CREATE INDEX idx_menu_category ON menu_items(category);
CREATE INDEX idx_menu_availability ON menu_items(availability);
CREATE INDEX idx_orders_student ON orders(student_id);
CREATE INDEX idx_orders_canteen ON orders(canteen_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_code ON orders(order_code);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_payments_order ON payments(order_id);
```

---

## 4. Table Field Specifications

### 1. `users`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Account login email |
| `password_hash` | VARCHAR(255) | | Encrypted password |
| `role` | ENUM (`app_role`) | NOT NULL | User role: `student`, `staff`, `admin` |
| `last_login` | TIMESTAMPTZ | | Timestamp of last login |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation date |

### 2. `student_profiles`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `student_id` | UUID | PRIMARY KEY, FK -> `users(id)` | Foreign key to user account |
| `full_name` | VARCHAR(150) | NOT NULL | Student's full name |
| `register_number` | VARCHAR(50) | UNIQUE, NOT NULL | College Roll/Reg Number |
| `hostel_name` | VARCHAR(100) | NOT NULL | Hostel Block name (e.g., Hostel Block A) |
| `room_number` | VARCHAR(20) | NOT NULL | Room number |
| `phone_number` | VARCHAR(20) | NOT NULL | Mobile number for notifications |

### 3. `canteen_profiles`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `canteen_id` | UUID | PRIMARY KEY, FK -> `users(id)` | Foreign key to user account |
| `canteen_name` | VARCHAR(150) | NOT NULL | Canteen / Mess display name |
| `owner_name` | VARCHAR(100) | NOT NULL | Canteen manager name |
| `is_online` | BOOLEAN | DEFAULT true | Master store open/close switch |
| `printer_settings` | JSONB | | Printer configurations (80mm/58mm, header, auto-cut) |
| `payment_settings` | JSONB | | Payment QR code image URL and options |

### 4. `menu_items`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique food item ID |
| `canteen_id` | UUID | FK -> `canteen_profiles(canteen_id)` | Belonging canteen |
| `item_name` | VARCHAR(150) | NOT NULL | Food item title (e.g. Masala Dosa) |
| `price` | DECIMAL(10,2) | CHECK >= 0 | Price in INR |
| `category` | ENUM | `breakfast`, `lunch`, `snacks` | Meal slot filter |
| `is_veg` | BOOLEAN | DEFAULT true | Veg (`true`) or Non-Veg (`false`) |
| `stock_online` | INT | CHECK >= 0 | Digital pre-order stock limit |
| `stock_offline` | INT | CHECK >= 0 | Counter walk-in stock limit |

### 5. `orders`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Order ID |
| `student_id` | UUID | FK -> `student_profiles(student_id)` | Ordering student |
| `canteen_id` | UUID | FK -> `canteen_profiles(canteen_id)` | Target canteen |
| `total_amount` | DECIMAL(10,2) | NOT NULL | Total billing amount |
| `order_status` | ENUM | `pending`, `preparing`, `ready`, `delivered`, `cancelled` | Live status tracking |
| `order_type` | ENUM | `online`, `walk-in` | Channel type |
| `order_code` | VARCHAR(20) | NOT NULL | 3-4 digit pickup ticket code |

---

## 5. Row Level Security (RLS) & Policies

If deploying on **Supabase**, enable RLS for data protection:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE canteen_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 1. Public Menu Items Read Access
CREATE POLICY "Public Menu Items are viewable by everyone" 
ON menu_items FOR SELECT USING (true);

-- 2. Canteen Staff can update their own Menu Items
CREATE POLICY "Staff can manage own menu items" 
ON menu_items FOR ALL USING (auth.uid() = canteen_id);

-- 3. Students can view their own orders
CREATE POLICY "Students can view own orders" 
ON orders FOR SELECT USING (auth.uid() = student_id);

-- 4. Canteen Staff can view orders for their canteen
CREATE POLICY "Staff can view canteen orders" 
ON orders FOR SELECT USING (auth.uid() = canteen_id);
```

---

## 6. Sample Seed Data (Initial Setup)

Execute these `INSERT` statements to populate test data for immediate testing:

```sql
-- 1. Insert Canteen Users
INSERT INTO users (id, email, role) VALUES 
('c0000000-0000-0000-0000-000000000001', 'block_a_canteen@campus.edu', 'staff'),
('c0000000-0000-0000-0000-000000000002', 'block_b_mess@campus.edu', 'staff');

-- 2. Insert Canteen Profiles
INSERT INTO canteen_profiles (canteen_id, canteen_name, owner_name, address, contact_number, email) VALUES
('c0000000-0000-0000-0000-000000000001', 'Hostel Block A Canteen', 'Ramesh Kumar', 'Hostel Block A Ground Floor', '+91 98765 43210', 'block_a_canteen@campus.edu'),
('c0000000-0000-0000-0000-000000000002', 'Hostel Block B Mess', 'Suresh Patel', 'Hostel Block B Mess Hall', '+91 98765 43211', 'block_b_mess@campus.edu');

-- 3. Insert Sample Menu Items
INSERT INTO menu_items (canteen_id, item_name, price, category, availability, is_veg, stock_online, stock_offline, image_url) VALUES
('c0000000-0000-0000-0000-000000000001', 'Masala Dosa', 45.00, 'breakfast', true, true, 50, 30, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop'),
('c0000000-0000-0000-0000-000000000001', 'Veg Thali', 85.00, 'lunch', true, true, 30, 20, 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop'),
('c0000000-0000-0000-0000-000000000001', 'Grilled Sandwich', 50.00, 'snacks', true, true, 40, 25, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop'),
('c0000000-0000-0000-0000-000000000002', 'Chicken Biryani', 120.00, 'lunch', true, false, 25, 15, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop');
```

---

## 7. React Integration Guide

In your React app, configure `/lib/supabase.ts` to query live database records:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Example: Fetch live Menu Items
export async function getMenuItems() {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('availability', true);

  if (error) throw error;
  return data;
}

// Example: Create Order
export async function createOrder(orderData: any) {
  const { data, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select();

  if (error) throw error;
  return data[0];
}
```
