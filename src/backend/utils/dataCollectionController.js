const NewsCollector = require('./newsCollector');
const PatentCollector = require('./patentCollector');
const MarketDataCollector = require('./marketDataCollector');

class DataCollectionController {
    constructor(db) {
        this.newsCollector = new NewsCollector(db);
        this.patentCollector = new PatentCollector(db);
        this.marketDataCollector = new MarketDataCollector(db);
    }

    // 모든 데이터 수집 실행
    async collectAllData() {
        console.log('Starting data collection...');
        
        try {
            // 병렬로 데이터 수집 실행
            const [news, patents, marketData] = await Promise.all([
                this.collectNews(),
                this.collectPatents(),
                this.collectMarketData()
            ]);

            console.log('Data collection completed successfully');
            return {
                news,
                patents,
                marketData
            };
        } catch (error) {
            console.error('Error in data collection:', error);
            throw error;
        }
    }

    // 뉴스 데이터 수집
    async collectNews() {
        console.log('Collecting news data...');
        const newsApiData = await this.newsCollector.collectFromNewsAPI();
        
        // RSS 피드 목록
        const rssFeeds = [
            'https://ev-database.org/feed',
            'https://electricvehicles.com/feed',
            'https://insideevs.com/feed/'
        ];

        const rssFeedData = await Promise.all(
            rssFeeds.map(feed => this.newsCollector.collectFromRSS(feed))
        );

        return {
            newsApi: newsApiData,
            rss: rssFeedData.flat()
        };
    }

    // 특허 데이터 수집
    async collectPatents() {
        console.log('Collecting patent data...');
        return await this.patentCollector.collectPatentData();
    }

    // 시장 데이터 수집
    async collectMarketData() {
        console.log('Collecting market data...');
        return await this.marketDataCollector.collectMarketData();
    }
}

module.exports = DataCollectionController;