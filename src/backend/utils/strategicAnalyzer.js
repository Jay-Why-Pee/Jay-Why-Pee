const db = require('./databaseManager');

class StrategicAnalyzer {
    constructor() {
        this.db = db;
    }

    // SWOT 분석 수행
    async performSWOTAnalysis() {
        try {
            const [marketData, techData, competitorData] = await Promise.all([
                this.analyzeMarketFactors(),
                this.analyzeTechnologyFactors(),
                this.analyzeCompetitiveFactors()
            ]);

            const swot = {
                strengths: this.identifyStrengths(marketData, techData),
                weaknesses: this.identifyWeaknesses(marketData, techData),
                opportunities: this.identifyOpportunities(marketData, competitorData),
                threats: this.identifyThreats(marketData, competitorData)
            };

            // 분석 결과 저장
            await this.saveAnalysisResult('SWOT', swot);
            return swot;
        } catch (error) {
            console.error('Error performing SWOT analysis:', error);
            throw error;
        }
    }

    // 시장 기회 분석
    async analyzeMarketOpportunities() {
        try {
            const [marketTrends, techTrends, regionalData] = await Promise.all([
                this.getMarketTrends(),
                this.getTechnologyTrends(),
                this.getRegionalMarketData()
            ]);

            const opportunities = {
                growth_markets: this.identifyGrowthMarkets(marketTrends),
                emerging_technologies: this.identifyEmergingTechnologies(techTrends),
                regional_opportunities: this.identifyRegionalOpportunities(regionalData)
            };

            await this.saveAnalysisResult('MARKET_OPPORTUNITIES', opportunities);
            return opportunities;
        } catch (error) {
            console.error('Error analyzing market opportunities:', error);
            throw error;
        }
    }

    // 전략 제안 생성
    async generateStrategicRecommendations() {
        try {
            const [swot, opportunities, competitorAnalysis] = await Promise.all([
                this.getSWOTAnalysis(),
                this.getMarketOpportunities(),
                this.getCompetitorAnalysis()
            ]);

            const recommendations = {
                market_strategy: this.formulateMarketStrategy(swot, opportunities),
                technology_strategy: this.formulateTechnologyStrategy(swot, competitorAnalysis),
                competitive_strategy: this.formulateCompetitiveStrategy(swot, competitorAnalysis),
                action_items: this.generateActionItems(swot, opportunities)
            };

            await this.saveAnalysisResult('STRATEGIC_RECOMMENDATIONS', recommendations);
            return recommendations;
        } catch (error) {
            console.error('Error generating strategic recommendations:', error);
            throw error;
        }
    }

    // 분석 결과 저장
    async saveAnalysisResult(analysisType, data) {
        try {
            const query = `
                INSERT INTO analysis_results (analysis_type, result_data)
                VALUES (?, ?)
            `;
            await this.db.run(query, [analysisType, JSON.stringify(data)]);
        } catch (error) {
            console.error('Error saving analysis result:', error);
            throw error;
        }
    }

    // 시장 요인 분석
    async analyzeMarketFactors() {
        const query = `
            SELECT * FROM market_trends 
            WHERE created_at >= date('now', '-1 year')
        `;
        return await this.db.all(query);
    }

    // 기술 요인 분석
    async analyzeTechnologyFactors() {
        const query = `
            SELECT * FROM patents 
            WHERE filing_date >= date('now', '-2 years')
        `;
        return await this.db.all(query);
    }

    // 경쟁 요인 분석
    async analyzeCompetitiveFactors() {
        const query = `
            SELECT company, COUNT(*) as patent_count
            FROM patents
            GROUP BY company
            ORDER BY patent_count DESC
        `;
        return await this.db.all(query);
    }

    // SWOT 분석 결과 조회
    async getSWOTAnalysis() {
        const query = `
            SELECT result_data 
            FROM analysis_results 
            WHERE analysis_type = 'SWOT'
            ORDER BY created_at DESC 
            LIMIT 1
        `;
        const result = await this.db.get(query);
        return result ? JSON.parse(result.result_data) : null;
    }

    // 시장 기회 분석 결과 조회
    async getMarketOpportunities() {
        const query = `
            SELECT result_data 
            FROM analysis_results 
            WHERE analysis_type = 'MARKET_OPPORTUNITIES'
            ORDER BY created_at DESC 
            LIMIT 1
        `;
        const result = await this.db.get(query);
        return result ? JSON.parse(result.result_data) : null;
    }

    // 경쟁사 분석 결과 조회
    async getCompetitorAnalysis() {
        const query = `
            SELECT result_data 
            FROM analysis_results 
            WHERE analysis_type = 'COMPETITION_ANALYSIS'
            ORDER BY created_at DESC 
            LIMIT 1
        `;
        const result = await this.db.get(query);
        return result ? JSON.parse(result.result_data) : null;
    }
}

module.exports = StrategicAnalyzer;