const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public folder if present
app.use(express.static(path.join(__dirname, 'public')));

// SPA Fallback handler
const spaFallback = (req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.json({
            name: 'Natkhat Pure Veg REST API',
            status: 'online',
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
        });
    }
};

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Wait for DB to initialize before starting server
async function startServer() {
    try {
        console.log('Initializing database...');
        const db = require('./db/index');
        if (db.readyPromise) {
            await db.readyPromise;
        }
        console.log('Database ready.');

        const apiRouter = require('./routes/api');
        app.use('/api', apiRouter);
        app.get('*', spaFallback);

        app.listen(PORT, '0.0.0.0', () => {
            console.log('=================================================');
            console.log(` NATKHAT PURE VEG BACKEND RUNNING ON PORT ${PORT}`);
            console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log('=================================================');
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

startServer();
