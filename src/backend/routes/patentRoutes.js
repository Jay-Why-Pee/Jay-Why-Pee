const express = require('express');
const router = express.Router();
const db = require('../utils/databaseManager');

// 전체 특허 데이터 조회
router.get('/', async (req, res) => {
    try {
        const { company, technology, limit = 20, offset = 0 } = req.query;
        let query = 'SELECT * FROM patents';
        const params = [];

        const conditions = [];
        if (company) {
            conditions.push('company = ?');
            params.push(company);
        }
        if (technology) {
            conditions.push('technology_area = ?');
            params.push(technology);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY filing_date DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const patents = await db.all(query, params);
        const total = await db.get('SELECT COUNT(*) as count FROM patents');

        res.json({
            data: patents,
            total: total.count,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 기업별 특허 통계
router.get('/company-stats', async (req, res) => {
    try {
        const stats = await db.all(`
            SELECT company,
                   COUNT(*) as patent_count,
                   COUNT(DISTINCT technology_area) as tech_areas
            FROM patents
            WHERE company IS NOT NULL
            GROUP BY company
            ORDER BY patent_count DESC
        `);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 기술 분야별 특허 동향
router.get('/tech-trends', async (req, res) => {
    try {
        const { period = '1y' } = req.query;
        
        const query = `
            SELECT technology_area,
                   COUNT(*) as patent_count,
                   strftime('%Y', filing_date) as year
            FROM patents
            WHERE technology_area IS NOT NULL
            GROUP BY technology_area, year
            ORDER BY year DESC, patent_count DESC
        `;
        
        const trends = await db.all(query);
        res.json(trends);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;