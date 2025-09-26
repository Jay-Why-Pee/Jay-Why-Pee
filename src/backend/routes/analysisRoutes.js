const express = require('express');
const router = express.Router();

// SWOT 분석 결과 조회
router.get('/swot', async (req, res) => {
    try {
        // 임시 더미 데이터
        const analysis = {
            analysis_type: 'SWOT',
            result_data: {
                strengths: ['Advanced motor technology', 'Strong R&D capabilities'],
                weaknesses: ['High production costs', 'Supply chain dependencies'],
                opportunities: ['Growing EV market', 'Government incentives'],
                threats: ['Intense competition', 'Raw material price volatility']
            },
            created_at: new Date().toISOString()
        };
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 시장 기회 분석 결과
router.get('/opportunities', async (req, res) => {
    try {
        const analysis = {
            analysis_type: 'MARKET_OPPORTUNITIES',
            result_data: {
                opportunities: [
                    'Asian emerging markets growth',
                    'Solid-state battery integration',
                    'AI-powered motor control systems'
                ]
            },
            created_at: new Date().toISOString()
        };
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 기술 트렌드 분석
router.get('/tech-trends', async (req, res) => {
    try {
        const analysis = {
            analysis_type: 'TECH_TRENDS',
            result_data: {
                trends: [
                    'Silicon Carbide (SiC) inverters',
                    'Rare-earth-free motors',
                    'In-wheel motor technology',
                    'AI-based motor control'
                ]
            },
            created_at: new Date().toISOString()
        };
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 경쟁사 분석 결과
router.get('/competition', async (req, res) => {
    try {
        const analysis = {
            analysis_type: 'COMPETITION_ANALYSIS',
            result_data: {
                competitors: [
                    { name: 'Tesla', market_share: '44%', region: 'US' },
                    { name: 'BYD', market_share: '18%', region: 'China' },
                    { name: 'Hyundai Motor Group', market_share: '8%', region: 'Korea' }
                ]
            },
            created_at: new Date().toISOString()
        };
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;