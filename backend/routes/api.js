const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../db/index');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Helper to hash password
function hashPassword(password) {
    return crypto.pbkdf2Sync(password, 'salt-veg-hotel', 1000, 64, 'sha512').toString('hex');
}

// -------------------------------------------------------------
// AUTHENTICATION ENDPOINTS
// -------------------------------------------------------------

router.post('/auth/register', (req, res) => {
    try {
        const { username, email, password, phone, role } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email and password are required' });
        }

        const existing = db.queryOne('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
        if (existing) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        const passHash = hashPassword(password);
        const assignedRole = role || 'customer';

        const result = db.run(
            `INSERT INTO users (username, email, password_hash, role, phone, email_verified) 
             VALUES (?, ?, ?, ?, ?, 1)`,
            [username, email, passHash, assignedRole, phone || '']
        );

        res.status(201).json({ message: 'User registered successfully', userId: result.lastInsertRowid });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/auth/login', (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = db.queryOne('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const passHash = hashPassword(password);
        if (user.password_hash !== passHash) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT
        const { SECRET_KEY, generateToken } = require('../middleware/auth');
        const token = generateToken(user);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                phone: user.phone,
                loyalty_pts: user.loyalty_pts,
                membership_level: user.membership_level
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/auth/profile', authenticateToken, (req, res) => {
    try {
        const user = db.queryOne('SELECT id, username, email, role, phone, loyalty_pts, membership_level FROM users WHERE id = ?', [req.user.id]);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/auth/forgot-password', (req, res) => {
    try {
        const { email } = req.body;
        const user = db.queryOne('SELECT id FROM users WHERE email = ?', [email]);
        if (!user) return res.status(404).json({ error: 'Email not found' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

        db.run('UPDATE users SET otp = ?, otp_expiry = ? WHERE id = ?', [otp, expiry, user.id]);
        console.log(`[SMS/EMAIL LOG] Forgot password OTP for ${email}: ${otp}`);

        res.json({ message: 'OTP sent successfully to email (mocked). Please check logs/console.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/auth/verify-otp', (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = db.queryOne('SELECT id, otp, otp_expiry FROM users WHERE email = ?', [email]);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.otp !== otp || new Date(user.otp_expiry) < new Date()) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        db.run('UPDATE users SET otp = NULL, otp_expiry = NULL, email_verified = 1 WHERE id = ?', [user.id]);
        res.json({ message: 'OTP verified successfully. You can reset password now.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/auth/change-password', (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) return res.status(400).json({ error: 'Email and new password required' });

        const passHash = hashPassword(newPassword);
        db.run('UPDATE users SET password_hash = ? WHERE email = ?', [passHash, email]);
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// -------------------------------------------------------------
// MENU MANAGEMENT ENDPOINTS
// -------------------------------------------------------------

router.get('/menu/categories', (req, res) => {
    try {
        const cats = db.query('SELECT * FROM categories');
        res.json(cats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/menu/categories', authenticateToken, requireRole(['admin', 'manager']), (req, res) => {
    try {
        const { name, description, image_url } = req.body;
        const result = db.run('INSERT INTO categories (name, description, image_url) VALUES (?, ?, ?)', [name, description || '', image_url || '']);
        res.status(201).json({ id: result.lastInsertRowid, name, description, image_url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/menu/items', (req, res) => {
    try {
        const { category_id, search, jain, bestseller, recommended } = req.query;
        let sql = `
            SELECT m.*, c.name as category_name 
            FROM menu_items m
            LEFT JOIN categories c ON m.category_id = c.id
            WHERE m.available = 1
        `;
        const params = [];

        if (category_id) {
            sql += ' AND m.category_id = ?';
            params.push(category_id);
        }
        if (search) {
            sql += ' AND (m.name LIKE ? OR m.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        if (jain === 'true') {
            sql += ' AND m.is_jain_available = 1';
        }
        if (bestseller === 'true') {
            sql += ' AND m.is_bestseller = 1';
        }
        if (recommended === 'true') {
            sql += ' AND m.is_recommended = 1';
        }

        const items = db.query(sql, params);
        res.json(items.map(item => {
            try {
                item.images = JSON.parse(item.images || '[]');
            } catch {
                item.images = [item.images];
            }
            return item;
        }));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/menu/items', authenticateToken, requireRole(['admin', 'manager']), (req, res) => {
    try {
        const { category_id, name, description, price, discount, prep_time, calories, ingredients, allergens, is_jain_available, is_bestseller, is_recommended, images } = req.body;
        const offer_price = price - (price * (discount || 0) / 100);

        const result = db.run(
            `INSERT INTO menu_items (category_id, name, description, price, discount, offer_price, prep_time, calories, ingredients, allergens, is_jain_available, is_bestseller, is_recommended, images, available)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [
                category_id, name, description, price, discount || 0, offer_price,
                prep_time || 15, calories || null, ingredients || '', allergens || '',
                is_jain_available ? 1 : 0, is_bestseller ? 1 : 0, is_recommended ? 1 : 0,
                JSON.stringify(images || [])
            ]
        );
        res.status(201).json({ id: result.lastInsertRowid, name, price, offer_price });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/menu/items/:id', authenticateToken, requireRole(['admin', 'manager']), (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, discount, prep_time, calories, ingredients, allergens, is_jain_available, is_bestseller, is_recommended, available } = req.body;
        const offer_price = price - (price * (discount || 0) / 100);

        db.run(
            `UPDATE menu_items 
             SET name=?, description=?, price=?, discount=?, offer_price=?, prep_time=?, calories=?, ingredients=?, allergens=?, is_jain_available=?, is_bestseller=?, is_recommended=?, available=?
             WHERE id=?`,
            [name, description, price, discount, offer_price, prep_time, calories, ingredients, allergens, is_jain_available ? 1 : 0, is_bestseller ? 1 : 0, is_recommended ? 1 : 0, available ? 1 : 0, id]
        );
        res.json({ message: 'Menu item updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/menu/items/:id', authenticateToken, requireRole(['admin']), (req, res) => {
    try {
        db.run('DELETE FROM menu_items WHERE id = ?', [req.params.id]);
        res.json({ message: 'Menu item deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// -------------------------------------------------------------
// TABLE MANAGEMENT ENDPOINTS
// -------------------------------------------------------------

router.get('/tables', (req, res) => {
    try {
        const tables = db.query('SELECT * FROM restaurant_tables');
        res.json(tables);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/tables/:id/status', authenticateToken, requireRole(['admin', 'manager', 'waiter', 'cashier']), (req, res) => {
    try {
        const { status } = req.body;
        db.run('UPDATE restaurant_tables SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Table status updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/tables/reserve', (req, res) => {
    try {
        const { customer_id, name, phone, table_id, guests_count, reservation_time } = req.body;
        
        // Mark table as reserved
        db.run('UPDATE restaurant_tables SET status = "reserved" WHERE id = ?', [table_id]);
        
        const result = db.run(
            `INSERT INTO table_reservations (customer_id, name, phone, table_id, guests_count, reservation_time, status) 
             VALUES (?, ?, ?, ?, ?, ?, 'confirmed')`,
            [customer_id || null, name, phone, table_id, guests_count, reservation_time]
        );

        res.status(201).json({ message: 'Table reserved successfully', reservationId: result.lastInsertRowid });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// -------------------------------------------------------------
// ORDER ENDPOINTS
// -------------------------------------------------------------

router.post('/orders/create', (req, res) => {
    try {
        const { 
            customer_id, order_type, table_id, items, 
            payment_method, spice_level, extra_butter, 
            extra_cheese, no_onion, no_garlic, is_jain, 
            instructions, coupon_code 
        } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Order must contain items' });
        }

        // Calculate Totals
        let subtotal = 0;
        for (const item of items) {
            const menuItem = db.queryOne('SELECT offer_price FROM menu_items WHERE id = ?', [item.menu_item_id]);
            if (!menuItem) return res.status(400).json({ error: `Menu item ${item.menu_item_id} not found` });
            subtotal += menuItem.offer_price * item.quantity;
        }

        // Apply coupon if valid
        let discount = 0;
        if (coupon_code) {
            const cp = db.queryOne('SELECT * FROM coupons WHERE code = ? AND active = 1 AND expiry_date >= date("now")', [coupon_code]);
            if (cp) {
                if (subtotal >= cp.min_order_value) {
                    if (cp.type === 'flat') {
                        discount = cp.value;
                    } else if (cp.type === 'percentage') {
                        discount = (subtotal * cp.value / 100);
                        if (discount > cp.max_discount) discount = cp.max_discount;
                    }
                }
            }
        }

        const settingsGst = db.queryOne('SELECT value FROM settings WHERE key = "gst_percentage"');
        const gstPct = settingsGst ? parseFloat(settingsGst.value) : 5.0;
        const gstAmt = parseFloat(((subtotal - discount) * gstPct / 100).toFixed(2));
        const finalAmount = parseFloat((subtotal - discount + gstAmt).toFixed(2));

        // Create Order
        const isPaid = (payment_method !== 'cash') ? 'paid' : 'pending';
        
        let waiterId = null;
        if (table_id) {
            // Assign a random active waiter
            const waiter = db.queryOne('SELECT id FROM users WHERE role = "waiter" LIMIT 1');
            if (waiter) waiterId = waiter.id;
            
            // Mark table occupied
            db.run('UPDATE restaurant_tables SET status = "occupied" WHERE id = ?', [table_id]);
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        const result = db.run(
            `INSERT INTO orders (
                customer_id, waiter_id, order_type, table_id, status, total_amount, gst, 
                discount, final_amount, coupon_code, payment_status, payment_method, 
                spice_level, extra_butter, extra_cheese, no_onion, no_garlic, is_jain, 
                instructions, delivery_otp
             ) VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                customer_id || null, waiterId, order_type, table_id || null, subtotal, gstAmt,
                discount, finalAmount, coupon_code || null, isPaid, payment_method,
                spice_level || 'medium', extra_butter ? 1 : 0, extra_cheese ? 1 : 0,
                no_onion ? 1 : 0, no_garlic ? 1 : 0, is_jain ? 1 : 0, instructions || '', otp
            ]
        );

        const orderId = result.lastInsertRowid;

        // Insert Order Items and Adjust Inventory
        for (const item of items) {
            const menuItem = db.queryOne('SELECT offer_price FROM menu_items WHERE id = ?', [item.menu_item_id]);
            db.run(
                `INSERT INTO order_items (order_id, menu_item_id, quantity, price, customizations) 
                 VALUES (?, ?, ?, ?, ?)`,
                [orderId, item.menu_item_id, item.quantity, menuItem.offer_price, JSON.stringify(item.customizations || {})]
            );

            // Mock Stock deduction: adjust inventory of masalas/veggies/paneer randomly
            const mainIngredient = item.menu_item_id % 2 === 0 ? 'Fresh Paneer' : 'Fresh Tomatoes';
            db.run('UPDATE inventory SET quantity = MAX(0, quantity - ?) WHERE item_name = ?', [0.2 * item.quantity, mainIngredient]);
        }

        // Add loyalty points if customer logged in
        if (customer_id) {
            const ptsEarned = Math.floor(finalAmount / 10);
            db.run('UPDATE users SET loyalty_pts = loyalty_pts + ? WHERE id = ?', [ptsEarned, customer_id]);
        }

        console.log(`[SMS/EMAIL LOG] Order Confirmation for Order #${orderId}. OTP: ${otp}`);

        res.status(201).json({
            message: 'Order placed successfully',
            orderId,
            otp,
            finalAmount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/orders', authenticateToken, (req, res) => {
    try {
        let sql = `
            SELECT o.*, t.table_number, u.username as customer_name, d.username as delivery_partner_name
            FROM orders o
            LEFT JOIN restaurant_tables t ON o.table_id = t.id
            LEFT JOIN users u ON o.customer_id = u.id
            LEFT JOIN users d ON o.delivery_partner_id = d.id
        `;
        const params = [];

        if (req.user.role === 'customer') {
            sql += ' WHERE o.customer_id = ?';
            params.push(req.user.id);
        } else if (req.user.role === 'waiter') {
            sql += ' WHERE o.waiter_id = ? OR o.order_type = "dine-in"';
            params.push(req.user.id);
        } else if (req.user.role === 'delivery') {
            sql += ' WHERE o.delivery_partner_id = ? OR (o.order_type = "delivery" AND o.status = "ready")';
            params.push(req.user.id);
        } else if (req.user.role === 'kitchen') {
            sql += ' WHERE o.status IN ("pending", "cooking", "ready")';
        }

        sql += ' ORDER BY o.id DESC';
        const orders = db.query(sql, params);

        res.json(orders.map(o => {
            o.items = db.query(
                `SELECT oi.*, m.name as item_name, m.images 
                 FROM order_items oi
                 LEFT JOIN menu_items m ON oi.menu_item_id = m.id
                 WHERE oi.order_id = ?`,
                [o.id]
            ).map(i => {
                try {
                    i.images = JSON.parse(i.images || '[]');
                } catch {
                    i.images = [i.images];
                }
                return i;
            });
            return o;
        }));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/orders/:id/status', authenticateToken, (req, res) => {
    try {
        const { status, delivery_partner_id } = req.body;
        const { id } = req.params;

        let sql = 'UPDATE orders SET status = ?';
        const params = [status];

        if (delivery_partner_id) {
            sql += ', delivery_partner_id = ?';
            params.push(delivery_partner_id);
        }

        sql += ' WHERE id = ?';
        params.push(id);

        db.run(sql, params);

        // Manage Table Status based on order status updates
        const order = db.queryOne('SELECT table_id, order_type FROM orders WHERE id = ?', [id]);
        if (order && order.table_id) {
            if (status === 'served') {
                db.run('UPDATE restaurant_tables SET status = "cleaning" WHERE id = ?', [order.table_id]);
            } else if (status === 'delivered' || status === 'cancelled') {
                db.run('UPDATE restaurant_tables SET status = "available" WHERE id = ?', [order.table_id]);
            }
        }

        // Notification print log
        console.log(`[NOTIF LOG] Order #${id} status changed to: ${status}`);

        res.json({ message: `Order status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// -------------------------------------------------------------
// INVENTORY ENDPOINTS
// -------------------------------------------------------------

router.get('/inventory', authenticateToken, requireRole(['admin', 'manager', 'kitchen']), (req, res) => {
    try {
        const inv = db.query('SELECT * FROM inventory');
        res.json(inv);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/inventory/adjust', authenticateToken, requireRole(['admin', 'manager', 'kitchen']), (req, res) => {
    try {
        const { id, quantity, type } = req.body; // type: 'in' or 'out'
        const change = type === 'in' ? parseFloat(quantity) : -parseFloat(quantity);
        db.run('UPDATE inventory SET quantity = MAX(0, quantity + ?) WHERE id = ?', [change, id]);
        res.json({ message: 'Inventory updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// -------------------------------------------------------------
// BILLING / RECEIPT ENDPOINTS
// -------------------------------------------------------------

router.get('/billing/receipt/:id', (req, res) => {
    try {
        const { id } = req.params;
        const order = db.queryOne(
            `SELECT o.*, t.table_number, u.username as customer_name 
             FROM orders o
             LEFT JOIN restaurant_tables t ON o.table_id = t.id
             LEFT JOIN users u ON o.customer_id = u.id
             WHERE o.id = ?`,
            [id]
        );

        if (!order) return res.status(404).json({ error: 'Order not found' });

        const items = db.query(
            `SELECT oi.*, m.name as item_name 
             FROM order_items oi
             LEFT JOIN menu_items m ON oi.menu_item_id = m.id
             WHERE oi.order_id = ?`,
            [id]
        );

        const receiptHtml = `
            <div style="font-family: 'Courier New', Courier, monospace; width: 300px; padding: 15px; border: 1px dashed #333; margin: auto; background-color: #fff; color: #000;">
                <div style="text-align: center; margin-bottom: 10px;">
                    <h2 style="margin: 0; font-size: 1.4rem; color: #2e7d32;">GOURMET VEG OASIS</h2>
                    <p style="margin: 3px 0; font-size: 0.8rem;">100% Pure Vegetarian</p>
                    <p style="margin: 3px 0; font-size: 0.75rem;">Green View Avenue, Food Plaza, Suite 101</p>
                    <p style="margin: 3px 0; font-size: 0.75rem;">Tel: +91 98765 43210</p>
                </div>
                <hr style="border-top: 1px dashed #333;" />
                <p style="margin: 5px 0; font-size: 0.8rem;"><strong>Invoice #:</strong> GVO-${order.id}</p>
                <p style="margin: 5px 0; font-size: 0.8rem;"><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
                <p style="margin: 5px 0; font-size: 0.8rem;"><strong>Order Type:</strong> ${order.order_type.toUpperCase()}</p>
                ${order.table_number ? `<p style="margin: 5px 0; font-size: 0.8rem;"><strong>Table:</strong> ${order.table_number}</p>` : ''}
                ${order.customer_name ? `<p style="margin: 5px 0; font-size: 0.8rem;"><strong>Customer:</strong> ${order.customer_name}</p>` : ''}
                <hr style="border-top: 1px dashed #333;" />
                <table style="width: 100%; font-size: 0.8rem; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 1px dashed #333;">
                            <th style="text-align: left; padding: 3px 0;">Item</th>
                            <th style="text-align: center; padding: 3px 0;">Qty</th>
                            <th style="text-align: right; padding: 3px 0;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                            <tr>
                                <td style="padding: 3px 0;">${item.item_name}</td>
                                <td style="text-align: center; padding: 3px 0;">${item.quantity}</td>
                                <td style="text-align: right; padding: 3px 0;">₹${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <hr style="border-top: 1px dashed #333;" />
                <div style="font-size: 0.8rem;">
                    <div style="display: flex; justify-content: space-between; margin: 3px 0;">
                        <span>Subtotal:</span>
                        <span>₹${order.total_amount.toFixed(2)}</span>
                    </div>
                    ${order.discount > 0 ? `
                    <div style="display: flex; justify-content: space-between; margin: 3px 0; color: #d32f2f;">
                        <span>Discount:</span>
                        <span>-₹${order.discount.toFixed(2)}</span>
                    </div>
                    ` : ''}
                    <div style="display: flex; justify-content: space-between; margin: 3px 0;">
                        <span>GST (5%):</span>
                        <span>₹${order.gst.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 5px 0; font-size: 0.95rem; font-weight: bold; border-top: 1px double #333; padding-top: 5px;">
                        <span>GRAND TOTAL:</span>
                        <span>₹${order.final_amount.toFixed(2)}</span>
                    </div>
                </div>
                <hr style="border-top: 1px dashed #333;" />
                <div style="text-align: center; font-size: 0.75rem; margin-top: 10px;">
                    <p style="margin: 2px 0;">Payment Method: ${order.payment_method.toUpperCase()}</p>
                    <p style="margin: 2px 0;">Payment Status: ${order.payment_status.toUpperCase()}</p>
                    <h4 style="margin: 10px 0 0 0; color: #2e7d32;">THANK YOU! VISIT AGAIN!</h4>
                </div>
            </div>
        `;
        res.send(receiptHtml);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// -------------------------------------------------------------
// REPORTS / ANALYTICS ENDPOINTS
// -------------------------------------------------------------

router.get('/reports/dashboard', authenticateToken, requireRole(['admin', 'manager']), (req, res) => {
    try {
        const salesStats = db.queryOne('SELECT SUM(final_amount) as totalRevenue, COUNT(*) as totalOrders FROM orders WHERE payment_status = "paid"');
        const categoriesCount = db.queryOne('SELECT COUNT(*) as count FROM categories');
        const itemsCount = db.queryOne('SELECT COUNT(*) as count FROM menu_items');
        const lowStock = db.queryOne('SELECT COUNT(*) as count FROM inventory WHERE quantity <= low_stock_threshold');
        const customerCount = db.queryOne('SELECT COUNT(*) as count FROM users WHERE role = "customer"');

        // Sales trend: Group by date (last 7 days)
        const salesTrend = db.query(`
            SELECT date(created_at) as date, SUM(final_amount) as amount, COUNT(*) as count
            FROM orders
            WHERE payment_status = "paid"
            GROUP BY date(created_at)
            ORDER BY date(created_at) DESC
            LIMIT 7
        `);

        // Top dishes
        const topDishes = db.query(`
            SELECT m.name, SUM(oi.quantity) as soldQty
            FROM order_items oi
            LEFT JOIN menu_items m ON oi.menu_item_id = m.id
            GROUP BY oi.menu_item_id
            ORDER BY soldQty DESC
            LIMIT 5
        `);

        res.json({
            revenue: salesStats.totalRevenue || 12450.00, // seed mock if database has few sales
            orders: salesStats.totalOrders || 38,
            categories: categoriesCount.count,
            items: itemsCount.count,
            customers: customerCount.count,
            lowStockItems: lowStock.count,
            salesTrend: salesTrend.length ? salesTrend : [
                { date: '2026-07-01', amount: 1200, count: 5 },
                { date: '2026-07-02', amount: 1850, count: 8 },
                { date: '2026-07-03', amount: 1500, count: 6 },
                { date: '2026-07-04', amount: 2400, count: 11 },
                { date: '2026-07-05', amount: 3100, count: 14 },
                { date: '2026-07-06', amount: 2450, count: 9 }
            ],
            topDishes: topDishes.length ? topDishes : [
                { name: 'Paneer Butter Masala', soldQty: 25 },
                { name: 'Masala Dosa', soldQty: 20 },
                { name: 'Royal Maharaja Thali', soldQty: 18 },
                { name: 'Double Cheese Margherita Pizza', soldQty: 12 }
            ]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// -------------------------------------------------------------
// SETTINGS ENDPOINTS
// -------------------------------------------------------------

router.get('/settings', (req, res) => {
    try {
        const list = db.query('SELECT * FROM settings');
        const settingsMap = {};
        for (const s of list) {
            settingsMap[s.key] = s.value;
        }
        res.json(settingsMap);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/settings/update', authenticateToken, requireRole(['admin']), (req, res) => {
    try {
        const body = req.body;
        for (const [key, value] of Object.entries(body)) {
            db.run(
                `INSERT INTO settings (key, value) VALUES (?, ?)
                 ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
                [key, String(value)]
            );
        }
        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// -------------------------------------------------------------
// EMPLOYEE MANAGEMENT ENDPOINTS
// -------------------------------------------------------------

router.get('/employees', authenticateToken, requireRole(['admin', 'manager']), (req, res) => {
    try {
        const employees = db.query('SELECT id, username, email, role, phone FROM users WHERE role != "customer"');
        res.json(employees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Attendance mark
router.post('/employees/attendance', authenticateToken, (req, res) => {
    try {
        const { user_id, date, status, check_in, check_out } = req.body;
        db.run(
            `INSERT INTO employee_attendance (user_id, date, status, check_in, check_out) 
             VALUES (?, ?, ?, ?, ?)`,
            [user_id, date, status, check_in || null, check_out || null]
        );
        res.json({ message: 'Attendance recorded' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// -------------------------------------------------------------
// COUPONS ENDPOINTS
// -------------------------------------------------------------

router.get('/coupons', (req, res) => {
    try {
        const coupons = db.query('SELECT * FROM coupons WHERE active = 1 AND expiry_date >= date("now")');
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/coupons/validate', (req, res) => {
    try {
        const { code, amount } = req.body;
        const cp = db.queryOne('SELECT * FROM coupons WHERE code = ? AND active = 1 AND expiry_date >= date("now")', [code]);
        
        if (!cp) return res.status(404).json({ valid: false, error: 'Invalid or expired coupon' });
        if (amount < cp.min_order_value) return res.status(400).json({ valid: false, error: `Minimum order amount of ₹${cp.min_order_value} required` });

        let discount = 0;
        if (cp.type === 'flat') {
            discount = cp.value;
        } else if (cp.type === 'percentage') {
            discount = (amount * cp.value / 100);
            if (discount > cp.max_discount) discount = cp.max_discount;
        }

        res.json({ valid: true, discount, type: cp.type, value: cp.value });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// -------------------------------------------------------------
// REVIEWS ENDPOINTS
// -------------------------------------------------------------

router.get('/reviews', (req, res) => {
    try {
        const { item_id } = req.query;
        let sql = `
            SELECT r.*, u.username 
            FROM reviews r
            LEFT JOIN users u ON r.customer_id = u.id
            WHERE r.is_moderated = 1
        `;
        const params = [];
        if (item_id) {
            sql += ' AND r.menu_item_id = ?';
            params.push(item_id);
        }
        sql += ' ORDER BY r.created_at DESC';
        res.json(db.query(sql, params));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/reviews', authenticateToken, (req, res) => {
    try {
        const { menu_item_id, rating, comment } = req.body;
        db.run(
            `INSERT INTO reviews (customer_id, menu_item_id, rating, comment) 
             VALUES (?, ?, ?, ?)`,
            [req.user.id, menu_item_id, rating, comment]
        );
        res.status(201).json({ message: 'Review added successfully (pending moderation)' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
