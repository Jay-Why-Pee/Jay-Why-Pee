const express = require('express');
const router = express.Router();
const db = require('../utils/databaseManager');

// 시장 동향 데이터 조회
router.get('/', async (req, res) => {
    try {
        const { period, region, limit = 20, offset = 0 } = req.query;
        let query = 'SELECT * FROM market_trends';
        const params = [];

        const conditions = [];
        if (period) {
            conditions.push('time_period = ?');
            params.push(period);
        }
        if (region) {
            conditions.push('region = ?');
            params.push(region);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const trends = await db.all(query, params);
        const total = await db.get('SELECT COUNT(*) as count FROM market_trends');

        res.json({
            data: trends,
            total: total.count,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 지역별 시장 규모 통계
router.get('/regional-stats', async (req, res) => {
    try {
        const stats = await db.all(`
            SELECT region, 
                   AVG(value) as average_value,
                   MAX(value) as max_value,
                   MIN(value) as min_value,
                   COUNT(*) as data_points
            FROM market_trends
            WHERE region IS NOT NULL
            GROUP BY region
            ORDER BY average_value DESC
        `);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 시간별 트렌드 분석
router.get('/trends', async (req, res) => {
    try {
        const { indicator, period = '1y' } = req.query;
        
        if (!indicator) {
            return res.status(400).json({ error: 'Indicator name is required' });
        }

        const query = `
            SELECT indicator_name, value, time_period, created_at
            FROM market_trends
            WHERE indicator_name = ?
            ORDER BY time_period ASC
        `;
        
        const trends = await db.all(query, [indicator]);
        res.json(trends);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 예측 데이터 조회
router.get('/forecasts', async (req, res) => {
    try {
        const forecasts = await db.all(`
            SELECT * FROM market_forecasts
            ORDER BY target_date ASC
        `);
        res.json(forecasts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;