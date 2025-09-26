const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../..')));

// 라우트 설정 - 단순화
function setupRoutes() {
    // 분석 라우트
    const analysisRoutes = require('./routes/analysisRoutes');
    app.use('/api/analysis', analysisRoutes);

    // 마켓 라우트  
    const marketRoutes = require('./routes/marketRoutes');
    app.use('/api/market', marketRoutes);

    // 뉴스 API - 정적 데이터 사용
    app.get('/api/news', (req, res) => {
        const { category, limit = 20, offset = 0 } = req.query;
        
        // news.json 파일에서 데이터 읽기
        try {
            const newsPath = path.join(__dirname, '../../data/news.json');
            if (fs.existsSync(newsPath)) {
                const newsData = JSON.parse(fs.readFileSync(newsPath, 'utf8'));
                let articles = newsData.articles || [];
                
                // 카테고리 필터링
                if (category && category !== 'all') {
                    articles = articles.filter(article => article.category === category);
                }
                
                // 페이징
                const start = parseInt(offset);
                const end = start + parseInt(limit);
                const paginatedArticles = articles.slice(start, end);
                
                res.json({
                    data: paginatedArticles,
                    total: articles.length,
                    lastUpdated: newsData.lastUpdated,
                    limit: parseInt(limit),
                    offset: start
                });
            } else {
                res.json({ data: [], total: 0, message: 'No news data available' });
            }
        } catch (error) {
            console.error('Error reading news data:', error);
            res.status(500).json({ error: 'Failed to load news data' });
        }
    });

    // 특허 API - 더미 데이터
    app.get('/api/patents', (req, res) => {
        const patents = [
            {
                id: 1,
                title: 'Electric Motor Control System for Vehicles',
                abstract: 'System for controlling electric motors in electric vehicles...',
                patent_number: 'US20240123456',
                filing_date: '2024-03-15',
                company: 'Tesla Inc.',
                technology_area: 'Motor Control',
                status: 'Published'
            },
            {
                id: 2,
                title: 'Rare-Earth-Free Motor Design',
                abstract: 'Motor design that eliminates the need for rare earth materials...',
                patent_number: 'US20240234567',
                filing_date: '2024-05-20',
                company: 'Hyundai Motor Company',
                technology_area: 'Motor Design',
                status: 'Pending'
            }
        ];
        res.json({ data: patents, total: patents.length });
    });
}

// 정적 파일 제공 (프론트엔드)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../index.html'));
});

// 뉴스 데이터 JSON 파일 제공
app.get('/data/news.json', (req, res) => {
    const newsPath = path.join(__dirname, '../../data/news.json');
    if (fs.existsSync(newsPath)) {
        res.sendFile(newsPath);
    } else {
        res.status(404).json({ error: 'News data not found' });
    }
});

// 헬스 체크 엔드포인트
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 핸들러
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// 라우트 설정
setupRoutes();

// 서버 시작
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Dashboard available at: http://localhost:${PORT}`);
    console.log(`📡 API endpoints at: http://localhost:${PORT}/api`);
    console.log('✅ Server started in static mode');
});

module.exports = app;
