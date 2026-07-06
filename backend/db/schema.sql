-- Database Schema for Pure Veg Hotel Management System

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('customer', 'cashier', 'waiter', 'kitchen', 'delivery', 'manager', 'admin')),
    phone TEXT,
    loyalty_pts INTEGER DEFAULT 0,
    membership_level TEXT DEFAULT 'Bronze' CHECK(membership_level IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
    otp TEXT,
    otp_expiry TEXT,
    email_verified INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT
);

-- Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    discount REAL DEFAULT 0,
    offer_price REAL NOT NULL,
    prep_time INTEGER DEFAULT 15, -- in minutes
    calories INTEGER,
    ingredients TEXT,
    allergens TEXT,
    available INTEGER DEFAULT 1, -- boolean
    is_jain_available INTEGER DEFAULT 0, -- boolean
    is_bestseller INTEGER DEFAULT 0, -- boolean
    is_recommended INTEGER DEFAULT 0, -- boolean
    images TEXT, -- JSON string or comma-separated list of image URLs/placeholders
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tables Table
CREATE TABLE IF NOT EXISTS restaurant_tables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_number TEXT NOT NULL UNIQUE,
    capacity INTEGER NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('available', 'occupied', 'cleaning', 'reserved')) DEFAULT 'available',
    qr_code_data TEXT
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    cashier_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    waiter_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    delivery_partner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    order_type TEXT NOT NULL CHECK(order_type IN ('pickup', 'delivery', 'dine-in')) DEFAULT 'dine-in',
    table_id INTEGER REFERENCES restaurant_tables(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK(status IN ('pending', 'cooking', 'ready', 'packed', 'served', 'delivered', 'cancelled')) DEFAULT 'pending',
    total_amount REAL NOT NULL,
    gst REAL NOT NULL,
    discount REAL DEFAULT 0,
    final_amount REAL NOT NULL,
    coupon_code TEXT,
    payment_status TEXT NOT NULL CHECK(payment_status IN ('pending', 'paid', 'refunded')) DEFAULT 'pending',
    payment_method TEXT NOT NULL CHECK(payment_method IN ('upi', 'card', 'netbanking', 'wallet', 'cash')) DEFAULT 'cash',
    spice_level TEXT CHECK(spice_level IN ('mild', 'medium', 'spicy')) DEFAULT 'medium',
    extra_butter INTEGER DEFAULT 0,
    extra_cheese INTEGER DEFAULT 0,
    no_onion INTEGER DEFAULT 0,
    no_garlic INTEGER DEFAULT 0,
    is_jain INTEGER DEFAULT 0,
    instructions TEXT,
    delivery_otp TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    customizations TEXT -- JSON string containing selected flags like extra_cheese, no_onion, etc.
);

-- Table Reservations Table
CREATE TABLE IF NOT EXISTS table_reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    table_id INTEGER REFERENCES restaurant_tables(id) ON DELETE CASCADE,
    guests_count INTEGER NOT NULL,
    reservation_time TEXT NOT NULL, -- ISO date-time string
    status TEXT NOT NULL CHECK(status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('vegetables', 'dairy', 'grocery', 'masala', 'rice', 'flour', 'oil', 'packaging')),
    quantity REAL NOT NULL,
    unit TEXT NOT NULL, -- e.g., kg, liters, packets
    low_stock_threshold REAL NOT NULL,
    expiry_date TEXT,
    supplier_name TEXT,
    supplier_contact TEXT
);

-- Staff Attendance Table
CREATE TABLE IF NOT EXISTS employee_attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    date TEXT NOT NULL, -- YYYY-MM-DD
    status TEXT NOT NULL CHECK(status IN ('present', 'absent', 'leave')),
    check_in TEXT, -- HH:MM
    check_out TEXT -- HH:MM
);

-- Staff Salary Table
CREATE TABLE IF NOT EXISTS employee_salary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- YYYY-MM
    basic_salary REAL NOT NULL,
    bonus REAL DEFAULT 0,
    deductions REAL DEFAULT 0,
    status TEXT NOT NULL CHECK(status IN ('paid', 'pending')) DEFAULT 'pending'
);

-- Staff Shifts Table
CREATE TABLE IF NOT EXISTS employee_shifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    shift_start TEXT NOT NULL, -- HH:MM
    shift_end TEXT NOT NULL, -- HH:MM
    day_of_week TEXT NOT NULL -- e.g., 'Monday', 'All'
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    comment TEXT,
    reply TEXT,
    is_moderated INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
    code TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK(type IN ('percentage', 'flat', 'bogo', 'festival', 'first_order')),
    value REAL NOT NULL,
    min_order_value REAL DEFAULT 0,
    max_discount REAL DEFAULT 9999,
    expiry_date TEXT NOT NULL, -- YYYY-MM-DD
    active INTEGER DEFAULT 1
);

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
