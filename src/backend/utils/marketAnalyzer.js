const db = require('./databaseManager');

class MarketAnalyzer {
    constructor() {
        this.db = db;
    }

    // 시장 성장률 분석
    async analyzeGrowthRate() {
        try {
            const query = `
                SELECT 
                    strftime('%Y', time_period) as year,
                    AVG(value) as avg_value
                FROM market_trends
                WHERE indicator_name = 'market_size'
                GROUP BY year
                ORDER BY year ASC
            `;
            
            const data = await this.db.all(query);
            const growthRates = this.calculateGrowthRates(data);
            
            return {
                rawData: data,
                growthRates,
                averageGrowth: this.calculateAverageGrowth(growthRates)
            };
        } catch (error) {
            console.error('Error analyzing growth rate:', error);
            throw error;
        }
    }

    // 지역별 시장 점유율 분석
    async analyzeMarketShare() {
        try {
            const query = `
                SELECT 
                    region,
                    SUM(value) as total_value,
                    COUNT(*) as data_points
                FROM market_trends
                WHERE region IS NOT NULL
                GROUP BY region
                ORDER BY total_value DESC
            `;
            
            const data = await this.db.all(query);
            const total = data.reduce((sum, item) => sum + item.total_value, 0);
            
            return data.map(item => ({
                ...item,
                market_share: (item.total_value / total * 100).toFixed(2)
            }));
        } catch (error) {
            console.error('Error analyzing market share:', error);
            throw error;
        }
    }

    // 기업별 시장 포지셔닝 분석
    async analyzeCompetitorPositioning() {
        try {
            const query = `
                SELECT 
                    company,
                    COUNT(DISTINCT patent_number) as patent_count,
                    COUNT(DISTINCT technology_area) as tech_diversity
                FROM patents
                WHERE company IS NOT NULL
                GROUP BY company
                ORDER BY patent_count DESC
            `;
            
            const data = await this.db.all(query);
            return this.calculateCompetitorScores(data);
        } catch (error) {
            console.error('Error analyzing competitor positioning:', error);
            throw error;
        }
    }

    // 성장률 계산 헬퍼 함수
    calculateGrowthRates(data) {
        return data.slice(1).map((current, index) => ({
            year: current.year,
            growth_rate: ((current.avg_value - data[index].avg_value) / 
                          data[index].avg_value * 100).toFixed(2)
        }));
    }

    // 평균 성장률 계산
    calculateAverageGrowth(growthRates) {
        const sum = growthRates.reduce((total, item) => 
            total + parseFloat(item.growth_rate), 0);
        return (sum / growthRates.length).toFixed(2);
    }

    // 경쟁사 점수 계산
    calculateCompetitorScores(data) {
        const maxPatents = Math.max(...data.map(item => item.patent_count));
        const maxTechDiversity = Math.max(...data.map(item => item.tech_diversity));
        
        return data.map(company => ({
            ...company,
            patent_score: ((company.patent_count / maxPatents) * 100).toFixed(2),
            diversity_score: ((company.tech_diversity / maxTechDiversity) * 100).toFixed(2),
            overall_score: (((company.patent_count / maxPatents) + 
                           (company.tech_diversity / maxTechDiversity)) * 50).toFixed(2)
        }));
    }
}

module.exports = MarketAnalyzer;