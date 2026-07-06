const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db/index'); // Automatically runs migrations and seeder if empty
const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public folder if present
app.use(express.static(path.join(__dirname, 'public')));

// Register API Routes
app.use('/api', apiRouter);

// Base route for API status
app.get('/', (req, res) => {
    res.json({
        name: 'Gourmet Veg Oasis REST API',
        status: 'online',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        supportedRoles: ['customer', 'waiter', 'cashier', 'kitchen', 'delivery', 'manager', 'admin']
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(` GOURMET VEG OASIS BACKEND RUNNING ON PORT ${PORT}`);
    console.log(` REST API URL: http://localhost:${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Database: SQLite (embedded in root)`);
    console.log(`=================================================`);
});
