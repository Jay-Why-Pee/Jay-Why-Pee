const express = require('express');
const router = express.Router();
const db = require('../utils/databaseManager');

// SWOT 분석 결과 조회
router.get('/swot', async (req, res) => {
    try {
        const analysis = await db.get(`
            SELECT * FROM analysis_results 
            WHERE analysis_type = 'SWOT'
            ORDER BY created_at DESC 
            LIMIT 1
        `);
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 시장 기회 분석 결과
router.get('/opportunities', async (req, res) => {
    try {
        const analysis = await db.get(`
            SELECT * FROM analysis_results 
            WHERE analysis_type = 'MARKET_OPPORTUNITIES'
            ORDER BY created_at DESC 
            LIMIT 1
        `);
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 기술 트렌드 분석
router.get('/tech-trends', async (req, res) => {
    try {
        const analysis = await db.get(`
            SELECT * FROM analysis_results 
            WHERE analysis_type = 'TECH_TRENDS'
            ORDER BY created_at DESC 
            LIMIT 1
        `);
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 경쟁사 분석 결과
router.get('/competition', async (req, res) => {
    try {
        const analysis = await db.get(`
            SELECT * FROM analysis_results 
            WHERE analysis_type = 'COMPETITION_ANALYSIS'
            ORDER BY created_at DESC 
            LIMIT 1
        `);
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;