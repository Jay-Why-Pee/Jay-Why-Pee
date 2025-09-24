const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
require('dotenv').config();

// Import database and controllers
const sqlite3 = require('sqlite3').verbose();
const DataCollectionController = require('./utils/dataCollectionController');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Database connection
const db = new sqlite3.Database('database.sqlite', (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    db.serialize(() => {
        // News articles table
        db.run(`CREATE TABLE IF NOT EXISTS news (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            summary TEXT,
            source TEXT,
            url TEXT,
            category TEXT,
            published_date DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Market trends table
        db.run(`CREATE TABLE IF NOT EXISTS market_trends (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            indicator_name TEXT,
            value REAL,
            unit TEXT,
            time_period TEXT,
            source TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Patent data table
        db.run(`CREATE TABLE IF NOT EXISTS patents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            abstract TEXT,
            patent_number TEXT,
            filing_date DATE,
            company TEXT,
            technology_area TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Analysis results table
        db.run(`CREATE TABLE IF NOT EXISTS analysis_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            analysis_type TEXT,
            result_data JSON,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    });
}

// Basic routes
// Import routes
const newsRoutesFactory = require('./routes/newsRoutes');
const marketRoutes = require('./routes/marketRoutes');
const patentRoutes = require('./routes/patentRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const NewsCollector = require('./utils/newsCollector');

// API Routes
app.use('/api/news', newsRoutesFactory(db));
app.use('/api/market', marketRoutes);
app.use('/api/patents', patentRoutes);
app.use('/api/analysis', analysisRoutes);

// Verified news endpoint (alias)
app.get('/api/news/verified', (req, res) => {
    db.all('SELECT id, title, summary, source, url, category, published_date AS date FROM news ORDER BY created_at DESC LIMIT 100', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/market-trends', (req, res) => {
    db.all('SELECT * FROM market_trends ORDER BY created_at DESC LIMIT 20', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/analysis', (req, res) => {
    db.all('SELECT * FROM analysis_results ORDER BY created_at DESC LIMIT 10', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Initialize data collector
const dataCollector = new DataCollectionController(db);
const newsCollector = new NewsCollector(db);

// Run a one-time news collection at startup (non-blocking)
(async () => {
    try {
        console.log('Running initial news collection...');
        await newsCollector.collectAndStore();
        console.log('Initial news collection done');
    } catch (err) {
        console.error('Initial news collection failed:', err.message || err);
    }
})();

// Schedule data collection (every hour)
cron.schedule('0 * * * *', async () => {
    console.log('Running hourly data collection...');
    try {
        await dataCollector.collectAllData();
        console.log('Hourly data collection completed');
    } catch (error) {
        console.error('Error in hourly data collection:', error);
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});