const MarketAnalyzer = require('./marketAnalyzer');
const TechnologyAnalyzer = require('./technologyAnalyzer');
const StrategicAnalyzer = require('./strategicAnalyzer');

class AnalysisController {
    constructor() {
        this.marketAnalyzer = new MarketAnalyzer();
        this.technologyAnalyzer = new TechnologyAnalyzer();
        this.strategicAnalyzer = new StrategicAnalyzer();
    }

    // 종합 분석 실행
    async runCompleteAnalysis() {
        try {
            console.log('Starting complete analysis...');

            // 병렬로 기본 분석 실행
            const [marketAnalysis, techAnalysis] = await Promise.all([
                this.analyzeMarketData(),
                this.analyzeTechnologyData()
            ]);

            // 전략적 분석 실행
            const strategicAnalysis = await this.performStrategicAnalysis();

            console.log('Complete analysis finished successfully');

            return {
                market: marketAnalysis,
                technology: techAnalysis,
                strategy: strategicAnalysis
            };
        } catch (error) {
            console.error('Error in complete analysis:', error);
            throw error;
        }
    }

    // 시장 데이터 분석
    async analyzeMarketData() {
        console.log('Analyzing market data...');
        try {
            const [growthRate, marketShare, positioning] = await Promise.all([
                this.marketAnalyzer.analyzeGrowthRate(),
                this.marketAnalyzer.analyzeMarketShare(),
                this.marketAnalyzer.analyzeCompetitorPositioning()
            ]);

            return {
                growth_rate: growthRate,
                market_share: marketShare,
                competitor_positioning: positioning
            };
        } catch (error) {
            console.error('Error in market analysis:', error);
            throw error;
        }
    }

    // 기술 데이터 분석
    async analyzeTechnologyData() {
        console.log('Analyzing technology data...');
        try {
            const [trends, maturity, portfolios] = await Promise.all([
                this.technologyAnalyzer.analyzeTechnologyTrends(),
                this.technologyAnalyzer.analyzeTechnologyMaturity(),
                this.technologyAnalyzer.analyzeCompanyPortfolios()
            ]);

            return {
                trends,
                maturity,
                company_portfolios: portfolios
            };
        } catch (error) {
            console.error('Error in technology analysis:', error);
            throw error;
        }
    }

    // 전략적 분석 수행
    async performStrategicAnalysis() {
        console.log('Performing strategic analysis...');
        try {
            const [swot, opportunities, recommendations] = await Promise.all([
                this.strategicAnalyzer.performSWOTAnalysis(),
                this.strategicAnalyzer.analyzeMarketOpportunities(),
                this.strategicAnalyzer.generateStrategicRecommendations()
            ]);

            return {
                swot,
                market_opportunities: opportunities,
                strategic_recommendations: recommendations
            };
        } catch (error) {
            console.error('Error in strategic analysis:', error);
            throw error;
        }
    }
}

module.exports = new AnalysisController();