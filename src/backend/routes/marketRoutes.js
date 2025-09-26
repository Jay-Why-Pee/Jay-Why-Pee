const express = require('express');
const router = express.Router();

// 시장 동향 데이터 조회
router.get('/', async (req, res) => {
    try {
        const { period, region, limit = 20, offset = 0 } = req.query;
        
        // 임시 더미 데이터
        const trends = [
            {
                id: 1,
                indicator_name: 'Global EV Sales',
                value: 17000000,
                unit: 'units',
                time_period: '2024',
                source: 'IEA',
                region: 'Global',
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                indicator_name: 'EV Motor Market Size',
                value: 27.16,
                unit: 'billion USD',
                time_period: '2025',
                source: 'Fortune Business Insights',
                region: 'Global',
                created_at: new Date().toISOString()
            },
            {
                id: 3,
                indicator_name: 'PMSM Market Size',
                value: 28.83,
                unit: 'billion USD',
                time_period: '2025',
                source: 'The Business Research Company',
                region: 'Global',
                created_at: new Date().toISOString()
            }
        ];

        res.json({
            data: trends,
            total: trends.length,
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
        const stats = [
            { region: 'Asia Pacific', average_value: 52.91, max_value: 60, min_value: 45, data_points: 12 },
            { region: 'North America', average_value: 25.4, max_value: 30, min_value: 20, data_points: 8 },
            { region: 'Europe', average_value: 15.2, max_value: 20, min_value: 10, data_points: 6 },
            { region: 'Others', average_value: 6.5, max_value: 10, min_value: 3, data_points: 4 }
        ];
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

        // 임시 트렌드 데이터
        const trends = [
            { indicator_name: indicator, value: 19.2, time_period: '2022', created_at: '2022-12-31' },
            { indicator_name: indicator, value: 22.5, time_period: '2023', created_at: '2023-12-31' },
            { indicator_name: indicator, value: 27.0, time_period: '2024', created_at: '2024-12-31' },
            { indicator_name: indicator, value: 27.16, time_period: '2025', created_at: '2025-09-26' }
        ];
        
        res.json(trends);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 예측 데이터 조회
router.get('/forecasts', async (req, res) => {
    try {
        const forecasts = [
            {
                id: 1,
                forecast_type: 'EV Motor Market Size',
                target_date: '2026-12-31',
                predicted_value: 31.0,
                confidence_level: 85.5,
                methodology: 'Time Series Analysis'
            },
            {
                id: 2,
                forecast_type: 'EV Motor Market Size',
                target_date: '2032-12-31',
                predicted_value: 77.61,
                confidence_level: 78.2,
                methodology: 'CAGR Projection'
            }
        ];
        res.json(forecasts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;