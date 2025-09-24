class NewsAnalyzer {
    constructor(articles) {
        this.articles = articles;
    }

    // 키워드 빈도수 분석
    analyzeKeywords(text) {
        const keywords = text.toLowerCase().match(/\b\w+\b/g) || [];
        const frequency = {};
        keywords.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
        });
        return frequency;
    }

    // 기술 트렌드 분석
    analyzeTechTrends() {
        const trends = [];
        const techKeywords = {
            'silicon carbide': '실리콘 카바이드',
            'sic': 'SiC',
            'permanent magnet': '영구자석',
            'pmsm': 'PMSM',
            'efficiency': '효율',
            'thermal management': '열관리',
            'power density': '전력밀도',
            'inverter': '인버터',
            'battery': '배터리',
            'charging': '충전',
            'semiconductor': '반도체',
            'ai': 'AI',
            'automation': '자동화'
        };

        // 기술 관련 기사 필터링
        const techArticles = this.articles.filter(article => 
            article.category === 'tech' || 
            article.title.toLowerCase().includes('technology') ||
            article.title.toLowerCase().includes('innovation')
        );

        // 키워드 빈도 분석
        const keywordCounts = {};
        techArticles.forEach(article => {
            const text = `${article.title} ${article.summary}`.toLowerCase();
            Object.keys(techKeywords).forEach(keyword => {
                if (text.includes(keyword)) {
                    keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
                }
            });
        });

        // 상위 3개 트렌드 추출
        const topTrends = Object.entries(keywordCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        // 트렌드 정보 구성
        topTrends.forEach(([keyword, count]) => {
            const articles = techArticles.filter(article => 
                (article.title + article.summary)
                .toLowerCase()
                .includes(keyword)
            );

            if (articles.length > 0) {
                const trend = {
                    keyword: techKeywords[keyword] || keyword,
                    summary: this.generateTrendSummary(articles, keyword),
                    count: count
                };
                trends.push(trend);
            }
        });

        return trends;
    }

    // 시장 인사이트 분석
    analyzeMarketInsights() {
        const insights = [];
        const marketArticles = this.articles.filter(article => 
            article.category === 'market' ||
            article.title.toLowerCase().includes('market') ||
            article.title.toLowerCase().includes('industry') ||
            article.title.toLowerCase().includes('growth')
        );

        // 시장 규모 관련 정보 추출
        const marketSizeInsight = this.extractMarketSizeInfo(marketArticles);
        if (marketSizeInsight) insights.push(marketSizeInsight);

        // 지역별 시장 동향
        const regionalInsight = this.analyzeRegionalTrends(marketArticles);
        if (regionalInsight) insights.push(regionalInsight);

        // 성장 요인 분석
        const growthInsight = this.analyzeGrowthFactors(marketArticles);
        if (growthInsight) insights.push(growthInsight);

        // 경쟁 동향 분석
        const competitionInsight = this.analyzeCompetitionTrends(marketArticles);
        if (competitionInsight) insights.push(competitionInsight);

        return insights;
    }

    // 시장 성장 예측 분석
    analyzeMarketForecast() {
        const forecast = {
            current: {},
            future: {},
            cagr: null,
            trends: []
        };

        const marketArticles = this.articles.filter(article => 
            article.category === 'market' ||
            article.title.toLowerCase().includes('forecast') ||
            article.title.toLowerCase().includes('growth') ||
            article.title.toLowerCase().includes('market')
        );

        // 현재 시장 규모 추출
        const currentSizeRegex = /(\$?\d+(\.\d+)?\s*(billion|million|B|M))/i;
        marketArticles.forEach(article => {
            const match = (article.title + article.summary).match(currentSizeRegex);
            if (match) {
                const value = this.normalizeMarketSize(match[0]);
                if (value) forecast.current.size = value;
            }
        });

        // 미래 시장 규모 예측
        const futureRegex = /(\d{4}|\d{2}).+?(\$?\d+(\.\d+)?\s*(billion|million|B|M))/i;
        marketArticles.forEach(article => {
            const match = (article.title + article.summary).match(futureRegex);
            if (match) {
                const year = match[1].length === 2 ? '20' + match[1] : match[1];
                const value = this.normalizeMarketSize(match[2]);
                if (value) {
                    forecast.future = {
                        year: parseInt(year),
                        size: value
                    };
                }
            }
        });

        // CAGR 추출
        const cagrRegex = /CAGR\D*(\d+(\.\d+)?%)/i;
        marketArticles.forEach(article => {
            const match = (article.title + article.summary).match(cagrRegex);
            if (match) {
                forecast.cagr = parseFloat(match[1]);
            }
        });

        return forecast;
    }

    // 트렌드 요약 생성
    generateTrendSummary(articles, keyword) {
        const relevantSentences = [];
        articles.forEach(article => {
            const text = `${article.title}. ${article.summary}`;
            const sentences = text.split(/[.!?]+/).filter(s => s.length > 0);
            sentences.forEach(sentence => {
                if (sentence.toLowerCase().includes(keyword)) {
                    relevantSentences.push(sentence.trim());
                }
            });
        });

        if (relevantSentences.length === 0) return '';

        // 가장 대표적인 문장 선택
        return relevantSentences[0];
    }

    // 시장 규모 정보 추출
    extractMarketSizeInfo(articles) {
        const sizeRegex = /(\$?\d+(\.\d+)?\s*(billion|million|B|M))/i;
        const matches = articles
            .map(article => (article.title + article.summary).match(sizeRegex))
            .filter(match => match !== null);

        if (matches.length > 0) {
            return {
                type: 'market_size',
                title: '시장 규모',
                content: `전기차 모터 시장 규모는 ${this.normalizeMarketSize(matches[0][0])}에 달할 것으로 예상됩니다.`
            };
        }
        return null;
    }

    // 지역별 시장 동향 분석
    analyzeRegionalTrends(articles) {
        const regions = {
            china: '중국',
            europe: '유럽',
            usa: '미국',
            korea: '한국',
            japan: '일본'
        };

        const regionalMentions = {};
        Object.keys(regions).forEach(region => {
            const count = articles.filter(article => 
                (article.title + article.summary)
                .toLowerCase()
                .includes(region)
            ).length;
            if (count > 0) regionalMentions[regions[region]] = count;
        });

        if (Object.keys(regionalMentions).length > 0) {
            const topRegions = Object.entries(regionalMentions)
                .sort((a, b) => b[1] - a[1])
                .map(([region]) => region)
                .slice(0, 3);

            return {
                type: 'regional',
                title: '지역별 동향',
                content: `${topRegions.join(', ')} 시장이 성장을 주도하고 있습니다.`
            };
        }
        return null;
    }

    // 성장 요인 분석
    analyzeGrowthFactors(articles) {
        const growthFactors = new Set();
        const factors = {
            'government': '정부 정책 지원',
            'subsidy': '보조금',
            'technology': '기술 혁신',
            'cost': '비용 절감',
            'demand': '수요 증가',
            'infrastructure': '인프라 확충'
        };

        articles.forEach(article => {
            const text = (article.title + article.summary).toLowerCase();
            Object.entries(factors).forEach(([key, value]) => {
                if (text.includes(key)) growthFactors.add(value);
            });
        });

        if (growthFactors.size > 0) {
            return {
                type: 'growth_factors',
                title: '성장 동력',
                content: `주요 성장 동력: ${Array.from(growthFactors).join(', ')}`
            };
        }
        return null;
    }

    // 경쟁 동향 분석
    analyzeCompetitionTrends(articles) {
        const companies = new Set();
        articles.forEach(article => {
            const text = (article.title + article.summary).toLowerCase();
            ['tesla', 'byd', 'volkswagen', 'gm', 'hyundai', 'samsung', 'lg'].forEach(company => {
                if (text.includes(company)) companies.add(company.toUpperCase());
            });
        });

        if (companies.size > 0) {
            return {
                type: 'competition',
                title: '기업 동향',
                content: `주요 참여 기업: ${Array.from(companies).join(', ')}`
            };
        }
        return null;
    }

    // 시장 규모 정규화
    normalizeMarketSize(sizeStr) {
        const value = parseFloat(sizeStr.replace(/[^\d.]/g, ''));
        const unit = sizeStr.toLowerCase();
        
        if (unit.includes('billion') || unit.includes('b')) {
            return `$${value}B`;
        } else if (unit.includes('million') || unit.includes('m')) {
            return `$${(value/1000).toFixed(2)}B`;
        }
        return null;
    }
}

module.exports = NewsAnalyzer;