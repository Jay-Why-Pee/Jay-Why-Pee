const express = require('express');
const router = express.Router();
const NewsCollector = require('../utils/newsCollector');

module.exports = (db) => {
    const collector = new NewsCollector(db);

    // Get verified news
    router.get('/verified', async (req, res) => {
        try {
            const news = await collector.getVerifiedNews();
            res.json(news);
        } catch (err) {
            console.error('Error fetching verified news:', err);
            res.status(500).json({ error: 'Failed to fetch news' });
        }
    });

    // Manually trigger collection (protected endpoint)
    router.post('/collect', async (req, res) => {
        try {
            const savedCount = await collector.collectAndStore();
            res.json({ message: `Collected and saved ${savedCount} articles` });
        } catch (err) {
            console.error('Error collecting news:', err);
            res.status(500).json({ error: 'Failed to collect news' });
        }
    });

    // Get news by category
    router.get('/category/:category', async (req, res) => {
        const { category } = req.params;
        const { limit = 20, offset = 0 } = req.query;

        try {
            const news = await new Promise((resolve, reject) => {
                db.all(
                    `SELECT * FROM news WHERE category = ? ORDER BY published_date DESC LIMIT ? OFFSET ?`,
                    [category, limit, offset],
                    (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    }
                );
            });
            res.json(news);
        } catch (err) {
            console.error(`Error fetching ${category} news:`, err);
            res.status(500).json({ error: 'Failed to fetch news' });
        }
    });

    // Search news
    router.get('/search', async (req, res) => {
        const { q, limit = 20, offset = 0 } = req.query;
        
        if (!q) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        try {
            const news = await new Promise((resolve, reject) => {
                db.all(
                    `SELECT * FROM news 
                     WHERE title LIKE ? OR summary LIKE ? 
                     ORDER BY published_date DESC LIMIT ? OFFSET ?`,
                    [`%${q}%`, `%${q}%`, limit, offset],
                    (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    }
                );
            });
            res.json(news);
        } catch (err) {
            console.error('Error searching news:', err);
            res.status(500).json({ error: 'Failed to search news' });
        }
    });

    // Get news statistics
    router.get('/stats', async (req, res) => {
        try {
            const stats = await new Promise((resolve, reject) => {
                db.all(
                    `SELECT category, COUNT(*) as count 
                     FROM news 
                     GROUP BY category`,
                    [],
                    (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    }
                );
            });
            res.json(stats);
        } catch (err) {
            console.error('Error fetching news stats:', err);
            res.status(500).json({ error: 'Failed to fetch news statistics' });
        }
    });

    return router;
};