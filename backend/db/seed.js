const crypto = require('crypto');

function hashPassword(password) {
    return crypto.pbkdf2Sync(password, 'salt-veg-hotel', 1000, 64, 'sha512').toString('hex');
}

function runSeed({ query, queryOne, run }) {
    console.log('Seeding initial data...');

    // 1. Insert Default Users
    const users = [
        { username: 'admin', email: 'admin@natkhatveg.com', password: 'admin123', role: 'admin', phone: '9876543210' },
        { username: 'manager', email: 'manager@natkhatveg.com', password: 'manager123', role: 'manager', phone: '9876543211' },
        { username: 'cashier', email: 'cashier@natkhatveg.com', password: 'cashier123', role: 'cashier', phone: '9876543212' },
        { username: 'waiter', email: 'waiter@natkhatveg.com', password: 'waiter123', role: 'waiter', phone: '9876543213' },
        { username: 'kitchen', email: 'kitchen@natkhatveg.com', password: 'kitchen123', role: 'kitchen', phone: '9876543214' },
        { username: 'delivery', email: 'delivery@natkhatveg.com', password: 'delivery123', role: 'delivery', phone: '9876543215' },
        { username: 'customer', email: 'customer@natkhatveg.com', password: 'customer123', role: 'customer', phone: '9876543216' }
    ];

    for (const u of users) {
        const passHash = hashPassword(u.password);
        run(
            `INSERT INTO users (username, email, password_hash, role, phone, email_verified) 
             VALUES (?, ?, ?, ?, ?, 1)`,
            [u.username, u.email, passHash, u.role, u.phone]
        );
    }

    // 2. Insert Menu Categories
    const categories = [
        { name: 'South Indian', description: 'Traditional and crispy dosas, fluffy idlis, and piping hot vadas.', image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=60' },
        { name: 'North Indian', description: 'Flavorful curries, freshly baked naans, and rich gravies.', image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=60' },
        { name: 'Punjabi', description: 'Rich paneer specialities, dal makhani, and butter-laden flatbreads.', image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=60' },
        { name: 'Chinese', description: 'Delicious noodles, fried rice, manchurian, and paneer chilly.', image_url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=60' },
        { name: 'Snacks', description: 'Tasty and savory quick bites to satisfy your cravings.', image_url: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=60' },
        { name: 'Fast Food', description: 'Premium veggie burgers, cheese loaded pizzas, and wraps.', image_url: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&auto=format&fit=crop&q=60' },
        { name: 'Thali', description: 'Complete traditional meals served with curries, breads, sweets, and sides.', image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=60' },
        { name: 'Breakfast', description: 'Perfect morning options: poha, paratha, upma, and more.', image_url: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=60' },
        { name: 'Lunch', description: 'Special combinations and quick lunches.', image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=60' },
        { name: 'Dinner', description: 'Elegant and complete dinner selections.', image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=60' },
        { name: 'Desserts', description: 'Sweet treats: gulab jamun, rasmalai, sizzling brownie, and halwa.', image_url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop&q=60' },
        { name: 'Ice Cream', description: 'Creamy scoops, sundaes, and ice-cream logs.', image_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=60' },
        { name: 'Beverages', description: 'Traditional filter coffee, masala tea, and soft drinks.', image_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=60' },
        { name: 'Juices', description: 'Freshly squeezed fruit juices without artificial sweeteners.', image_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=60' },
        { name: 'Milkshakes', description: 'Thick, creamy shakes topped with nuts and ice cream.', image_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=60' }
    ];

    const categoryMap = {};
    for (const cat of categories) {
        const result = run(
            `INSERT INTO categories (name, description, image_url) VALUES (?, ?, ?)`,
            [cat.name, cat.description, cat.image_url]
        );
        categoryMap[cat.name] = result.lastInsertRowid;
    }

    // 3. Insert Menu Items
    const menuItems = [
        // South Indian
        {
            category: 'South Indian',
            name: 'Masala Dosa',
            description: 'Crispy rice and lentil crepe stuffed with a spiced potato mash, served with coconut chutney and hot sambar.',
            price: 120, discount: 10, prep_time: 10, calories: 350,
            ingredients: 'Rice, Urad Dal, Potatoes, Mustard Seeds, Curry Leaves, Butter',
            allergens: 'Dairy (Butter)',
            is_jain_available: 1, is_bestseller: 1, is_recommended: 1,
            images: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=60'
        },
        {
            category: 'South Indian',
            name: 'Idli Sambar Vada Combo',
            description: 'Two fluffy steamed idlis and one crispy medu vada, served with traditional sambar and tomato chutney.',
            price: 90, discount: 0, prep_time: 8, calories: 280,
            ingredients: 'Rice, Urad Dal, Fenugreek, Spices, Tamarind, Coconut',
            allergens: 'None',
            is_jain_available: 1, is_bestseller: 0, is_recommended: 1,
            images: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=60'
        },
        // Punjabi / North Indian
        {
            category: 'Punjabi',
            name: 'Paneer Butter Masala',
            description: 'Soft cottage cheese cubes cooked in a rich, creamy, and mildly sweet tomato-based gravy, topped with fresh cream.',
            price: 240, discount: 15, prep_time: 15, calories: 480,
            ingredients: 'Paneer, Tomatoes, Cashews, Cream, Butter, Garam Masala',
            allergens: 'Dairy, Nuts (Cashews)',
            is_jain_available: 1, is_bestseller: 1, is_recommended: 1,
            images: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=60'
        },
        {
            category: 'Punjabi',
            name: 'Dal Makhani',
            description: 'Black lentils and kidney beans simmered overnight on low charcoal flame, finished with churned butter and fresh cream.',
            price: 190, discount: 0, prep_time: 20, calories: 420,
            ingredients: 'Black Urad Dal, Rajma, Tomatoes, Butter, Cream, Garlic, Spices',
            allergens: 'Dairy',
            is_jain_available: 0, is_bestseller: 1, is_recommended: 0,
            images: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=60'
        },
        {
            category: 'North Indian',
            name: 'Butter Naan',
            description: 'Soft and leavened flatbread made of refined flour, baked in a traditional clay tandoor and brushed with fresh butter.',
            price: 50, discount: 0, prep_time: 5, calories: 150,
            ingredients: 'Maida, Yeast, Butter, Milk',
            allergens: 'Gluten, Dairy',
            is_jain_available: 1, is_bestseller: 0, is_recommended: 1,
            images: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=600&auto=format&fit=crop&q=60'
        },
        // Chinese
        {
            category: 'Chinese',
            name: 'Veg Schezwan Noodles',
            description: 'Stir-fried noodles tossed with crunchy colorful vegetables in a hot and spicy Schezwan sauce.',
            price: 160, discount: 5, prep_time: 12, calories: 380,
            ingredients: 'Noodles, Capsicum, Carrot, Cabbage, Spring Onion, Schezwan Sauce, Soy Sauce',
            allergens: 'Gluten, Soy',
            is_jain_available: 0, is_bestseller: 0, is_recommended: 0,
            images: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=60'
        },
        {
            category: 'Chinese',
            name: 'Veg Manchurian Gravy',
            description: 'Deep-fried vegetable dumplings cooked in a savory, tangy, and spicy soy-garlic gravy.',
            price: 170, discount: 10, prep_time: 15, calories: 310,
            ingredients: 'Cabbage, Carrot, Cornflour, Garlic, Ginger, Soy Sauce, Chilli Sauce',
            allergens: 'Soy, Gluten',
            is_jain_available: 0, is_bestseller: 1, is_recommended: 1,
            images: 'https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=600&auto=format&fit=crop&q=60'
        },
        // Fast Food
        {
            category: 'Fast Food',
            name: 'Double Cheese Margherita Pizza',
            description: 'Classic single-base pizza topped with fresh tomato sauce, double mozzarella cheese, and basil leaves.',
            price: 220, discount: 12, prep_time: 15, calories: 520,
            ingredients: 'Pizza Base, Tomato Puree, Mozzarella Cheese, Olive Oil, Fresh Basil',
            allergens: 'Gluten, Dairy',
            is_jain_available: 1, is_bestseller: 1, is_recommended: 1,
            images: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&auto=format&fit=crop&q=60'
        },
        // Thali
        {
            category: 'Thali',
            name: 'Royal Maharaja Thali',
            description: 'A grand feast featuring Paneer Sabji, Veg Kolhapuri, Dal Tadka, Jeera Rice, 2 Butter Rotis, Sweet, Raita, Pickle, and Papad.',
            price: 320, discount: 10, prep_time: 20, calories: 850,
            ingredients: 'Mixed Veggies, Paneer, Lentils, Rice, Wheat Flour, Curd, Sweets',
            allergens: 'Dairy, Gluten, Nuts',
            is_jain_available: 1, is_bestseller: 1, is_recommended: 1,
            images: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=60'
        },
        // Breakfast
        {
            category: 'Breakfast',
            name: 'Indori Poha',
            description: 'Light and fluffy flattened rice seasoned with turmeric, mustard seeds, green chillies, topped with crunchy sev and pomegranate seeds.',
            price: 60, discount: 0, prep_time: 5, calories: 190,
            ingredients: 'Flattened Rice, Mustard Seeds, Turmeric, Peanuts, Sev, Lemon',
            allergens: 'Peanuts',
            is_jain_available: 1, is_bestseller: 1, is_recommended: 0,
            images: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=60'
        },
        // Desserts
        {
            category: 'Desserts',
            name: 'Gulab Jamun (2 Pcs)',
            description: 'Soft and warm milk-solid dumplings dipped in flavored sugar syrup, garnished with cardamom and pistachio slivers.',
            price: 70, discount: 0, prep_time: 5, calories: 220,
            ingredients: 'Koya, Paneer, Maida, Sugar Syrup, Pistachio, Cardamom',
            allergens: 'Dairy, Gluten, Nuts',
            is_jain_available: 1, is_bestseller: 1, is_recommended: 1,
            images: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop&q=60'
        },
        // Milkshakes
        {
            category: 'Milkshakes',
            name: 'Premium Mango Milkshake',
            description: 'Creamy mango milkshake prepared using sweet Alphonso mango pulp, topped with a scoop of vanilla ice cream.',
            price: 130, discount: 5, prep_time: 8, calories: 340,
            ingredients: 'Alphonso Mango Pulp, Fresh Milk, Sugar, Vanilla Ice Cream',
            allergens: 'Dairy',
            is_jain_available: 1, is_bestseller: 1, is_recommended: 0,
            images: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=60'
        }
    ];

    for (const item of menuItems) {
        const catId = categoryMap[item.category];
        const discountAmt = (item.price * (item.discount / 100));
        const offerPrice = item.price - discountAmt;

        run(
            `INSERT INTO menu_items (
                category_id, name, description, price, discount, offer_price, 
                prep_time, calories, ingredients, allergens, is_jain_available, 
                is_bestseller, is_recommended, images, available
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [
                catId, item.name, item.description, item.price, item.discount, offerPrice,
                item.prep_time, item.calories, item.ingredients, item.allergens, item.is_jain_available,
                item.is_bestseller, item.is_recommended, JSON.stringify([item.images])
            ]
        );
    }

    // 4. Insert Restaurant Tables
    const tablesData = [
        { table_number: 'T1', capacity: 2, status: 'available' },
        { table_number: 'T2', capacity: 2, status: 'available' },
        { table_number: 'T3', capacity: 4, status: 'available' },
        { table_number: 'T4', capacity: 4, status: 'occupied' },
        { table_number: 'T5', capacity: 6, status: 'available' },
        { table_number: 'T6', capacity: 6, status: 'reserved' },
        { table_number: 'T7', capacity: 8, status: 'cleaning' },
        { table_number: 'T8', capacity: 4, status: 'available' }
    ];

    for (const t of tablesData) {
        const qrCode = `http://localhost:5173/qr-order?table=${t.table_number}`;
        run(
            `INSERT INTO restaurant_tables (table_number, capacity, status, qr_code_data) 
             VALUES (?, ?, ?, ?)`,
            [t.table_number, t.capacity, t.status, qrCode]
        );
    }

    // 5. Insert Coupons
    const couponsData = [
        { code: 'WELCOME100', type: 'flat', value: 100, min_order_value: 500, max_discount: 100, expiry_date: '2027-12-31' },
        { code: 'VEG20', type: 'percentage', value: 20, min_order_value: 300, max_discount: 150, expiry_date: '2027-12-31' },
        { code: 'JAINSPECIAL', type: 'flat', value: 50, min_order_value: 200, max_discount: 50, expiry_date: '2027-12-31' },
        { code: 'FESTIVE30', type: 'percentage', value: 30, min_order_value: 600, max_discount: 300, expiry_date: '2027-12-31' }
    ];

    for (const c of couponsData) {
        run(
            `INSERT INTO coupons (code, type, value, min_order_value, max_discount, expiry_date, active) 
             VALUES (?, ?, ?, ?, ?, ?, 1)`,
            [c.code, c.type, c.value, c.min_order_value, c.max_discount, c.expiry_date]
        );
    }

    // 6. Insert Inventory
    const inventoryData = [
        { item_name: 'Fresh Tomatoes', category: 'vegetables', quantity: 45.5, unit: 'kg', low_stock_threshold: 10.0, expiry_date: '2026-07-12', supplier_name: 'Green Agro Suppliers', supplier_contact: '9876541111' },
        { item_name: 'Fresh Paneer', category: 'dairy', quantity: 20.0, unit: 'kg', low_stock_threshold: 5.0, expiry_date: '2026-07-09', supplier_name: 'Dairy Pure Farm', supplier_contact: '9876542222' },
        { item_name: 'Amul Mozzarella Cheese', category: 'dairy', quantity: 15.0, unit: 'kg', low_stock_threshold: 4.0, expiry_date: '2026-08-30', supplier_name: 'Dairy Pure Farm', supplier_contact: '9876542222' },
        { item_name: 'Basmati Rice', category: 'rice', quantity: 150.0, unit: 'kg', low_stock_threshold: 30.0, expiry_date: '2027-01-30', supplier_name: 'Bharat Rice Mills', supplier_contact: '9876543333' },
        { item_name: 'Pure Sunflower Oil', category: 'oil', quantity: 5.0, unit: 'liters', low_stock_threshold: 20.0, expiry_date: '2027-06-15', supplier_name: 'Bharat Rice Mills', supplier_contact: '9876543333' }, // Trigger warning threshold
        { item_name: 'Garam Masala Spices', category: 'masala', quantity: 12.0, unit: 'kg', low_stock_threshold: 3.0, expiry_date: '2026-12-31', supplier_name: 'Indian Masala Spices', supplier_contact: '9876544444' },
        { item_name: 'Biodegradable Packing Boxes', category: 'packaging', quantity: 300.0, unit: 'packets', low_stock_threshold: 50.0, expiry_date: '2028-06-30', supplier_name: 'EcoPack Co.', supplier_contact: '9876545555' }
    ];

    for (const inv of inventoryData) {
        run(
            `INSERT INTO inventory (item_name, category, quantity, unit, low_stock_threshold, expiry_date, supplier_name, supplier_contact) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [inv.item_name, inv.category, inv.quantity, inv.unit, inv.low_stock_threshold, inv.expiry_date, inv.supplier_name, inv.supplier_contact]
        );
    }

    // 7. Insert Settings
    const settingsData = {
        'gst_percentage': '5.0',
        'restaurant_name': 'Natkhat Pure Veg',
        'restaurant_address': 'Divine Krishna Arcade, Temple Road, Sector 4',
        'restaurant_phone': '+91 98765 43210',
        'restaurant_email': 'contact@natkhatveg.com',
        'working_hours': '08:00 AM - 11:00 PM',
        'delivery_charge': '40.00',
        'service_charge_pct': '5.0',
        'currency_symbol': '₹',
        'currency_code': 'INR'
    };

    for (const [key, val] of Object.entries(settingsData)) {
        run(`INSERT INTO settings (key, value) VALUES (?, ?)`, [key, val]);
    }

    console.log('Seeding completed successfully!');
}

module.exports = {
    runSeed
};
