const db = require('./databaseManager');

class TechnologyAnalyzer {
    constructor() {
        this.db = db;
    }

    // 기술 트렌드 분석
    async analyzeTechnologyTrends() {
        try {
            const query = `
                SELECT 
                    technology_area,
                    strftime('%Y', filing_date) as year,
                    COUNT(*) as patent_count
                FROM patents
                WHERE technology_area IS NOT NULL
                GROUP BY technology_area, year
                ORDER BY year DESC, patent_count DESC
            `;
            
            const data = await this.db.all(query);
            return this.processTechnologyTrends(data);
        } catch (error) {
            console.error('Error analyzing technology trends:', error);
            throw error;
        }
    }

    // 기술 성숙도 분석
    async analyzeTechnologyMaturity() {
        try {
            const query = `
                SELECT 
                    technology_area,
                    COUNT(*) as total_patents,
                    MIN(filing_date) as first_patent,
                    MAX(filing_date) as latest_patent,
                    COUNT(DISTINCT company) as company_count
                FROM patents
                WHERE technology_area IS NOT NULL
                GROUP BY technology_area
            `;
            
            const data = await this.db.all(query);
            return this.calculateMaturityScores(data);
        } catch (error) {
            console.error('Error analyzing technology maturity:', error);
            throw error;
        }
    }

    // 기업별 기술 포트폴리오 분석
    async analyzeCompanyPortfolios() {
        try {
            const query = `
                SELECT 
                    company,
                    technology_area,
                    COUNT(*) as patent_count
                FROM patents
                WHERE company IS NOT NULL 
                AND technology_area IS NOT NULL
                GROUP BY company, technology_area
                ORDER BY company, patent_count DESC
            `;
            
            const data = await this.db.all(query);
            return this.processPortfolioData(data);
        } catch (error) {
            console.error('Error analyzing company portfolios:', error);
            throw error;
        }
    }

    // 기술 트렌드 데이터 처리
    processTechnologyTrends(data) {
        const trends = {};
        
        data.forEach(item => {
            if (!trends[item.technology_area]) {
                trends[item.technology_area] = {
                    technology: item.technology_area,
                    yearlyTrend: {},
                    growth_rate: 0
                };
            }
            trends[item.technology_area].yearlyTrend[item.year] = item.patent_count;
        });

        // 성장률 계산
        Object.values(trends).forEach(tech => {
            const years = Object.keys(tech.yearlyTrend).sort();
            if (years.length >= 2) {
                const oldestYear = years[0];
                const latestYear = years[years.length - 1];
                const growth = ((tech.yearlyTrend[latestYear] - tech.yearlyTrend[oldestYear]) /
                              tech.yearlyTrend[oldestYear] * 100).toFixed(2);
                tech.growth_rate = growth;
            }
        });

        return Object.values(trends);
    }

    // 기술 성숙도 점수 계산
    calculateMaturityScores(data) {
        const maxPatents = Math.max(...data.map(item => item.total_patents));
        const maxCompanies = Math.max(...data.map(item => item.company_count));
        
        return data.map(tech => {
            const age = this.calculateTechnologyAge(tech.first_patent);
            const patentScore = (tech.total_patents / maxPatents) * 100;
            const adoptionScore = (tech.company_count / maxCompanies) * 100;
            
            return {
                ...tech,
                age_years: age,
                patent_score: patentScore.toFixed(2),
                adoption_score: adoptionScore.toFixed(2),
                maturity_score: ((age * 0.3) + (patentScore * 0.4) + (adoptionScore * 0.3)).toFixed(2)
            };
        });
    }

    // 기술 포트폴리오 데이터 처리
    processPortfolioData(data) {
        const portfolios = {};
        
        data.forEach(item => {
            if (!portfolios[item.company]) {
                portfolios[item.company] = {
                    company: item.company,
                    technologies: {},
                    total_patents: 0,
                    diversity_score: 0
                };
            }
            
            portfolios[item.company].technologies[item.technology_area] = item.patent_count;
            portfolios[item.company].total_patents += item.patent_count;
        });

        // 다양성 점수 계산
        Object.values(portfolios).forEach(company => {
            const techCount = Object.keys(company.technologies).length;
            const totalTechs = new Set(data.map(item => item.technology_area)).size;
            company.diversity_score = ((techCount / totalTechs) * 100).toFixed(2);
        });

        return Object.values(portfolios);
    }

    // 기술 나이 계산 (년)
    calculateTechnologyAge(firstPatentDate) {
        const first = new Date(firstPatentDate);
        const now = new Date();
        return Math.floor((now - first) / (1000 * 60 * 60 * 24 * 365));
    }
}

module.exports = TechnologyAnalyzer;