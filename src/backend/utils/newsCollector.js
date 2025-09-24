const fetch = require('node-fetch');
const Parser = require('rss-parser');
const fs = require('fs').promises;
const path = require('path');
const translationService = require('./translationService');
const NewsAnalyzer = require('./newsAnalyzer');

class NewsCollector {
    constructor(db, options = {}) {
        this.db = db;
        this.newsApiKey = options.newsApiKey || process.env.NEWSAPI_KEY;
        this.parser = new Parser();
        this.categories = {
            breaking: ['tesla motors', 'electric vehicle manufacturing'],
            tech: ['ev motor technology', 'electric powertrain'],
            market: ['ev market', 'electric vehicle market', 'ev motor market'],
            korea: ['현대자동차 전기차', '한국 전기차', 'korean ev market']
        };
    }

    async validateUrl(url) {
        try {
            // Quick HEAD check
            const head = await fetch(url, { method: 'HEAD', redirect: 'follow' });
            if (head && head.ok) return true;

            // Fallback to GET if HEAD not supported
            const get = await fetch(url, { method: 'GET', redirect: 'follow' });
            return get && get.ok;
        } catch (err) {
            return false;
        }
    }

    async fetchFromNewsApi(category) {
        if (!this.newsApiKey) {
            console.log('NewsAPI key not provided, skipping NewsAPI fetch');
            return [];
        }

        const queries = this.categories[category];
        let articles = [];

        for (const query of queries) {
            try {
                const response = await fetch(
                    `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=10`,
                    {
                        headers: { 'X-Api-Key': this.newsApiKey }
                    }
                );

                if (!response.ok) {
                    throw new Error(`NewsAPI error: ${response.statusText}`);
                }

                const data = await response.json();
                articles = [...articles, ...data.articles];
            } catch (error) {
                console.error(`NewsAPI fetch failed for query "${query}":`, error.message);
            }
        }

        return articles;
    }

    async fetchFromGoogleRss(category) {
        const rssFeeds = {
            breaking: [
                'https://news.google.com/rss/search?q=tesla+motors+OR+electric+vehicle+manufacturing&hl=en-US&gl=US&ceid=US:en',
            ],
            tech: [
                'https://news.google.com/rss/search?q=ev+motor+technology+OR+electric+powertrain&hl=en-US&gl=US&ceid=US:en',
            ],
            market: [
                'https://news.google.com/rss/search?q=ev+market+OR+electric+vehicle+market&hl=en-US&gl=US&ceid=US:en',
            ],
            korea: [
                'https://news.google.com/rss/search?q=현대자동차+전기차+OR+한국+전기차&hl=ko&gl=KR&ceid=KR:ko',
            ]
        };

        let articles = [];

        for (const feedUrl of rssFeeds[category]) {
            try {
                const feed = await this.parser.parseURL(feedUrl);
                articles = [...articles, ...feed.items.map(item => ({
                    title: item.title,
                    summary: item.contentSnippet || item.content || '',
                    url: item.link,
                    publishedAt: item.pubDate,
                    source: {
                        name: item.creator || 'Google News'
                    }
                }))];
            } catch (error) {
                console.error(`RSS feed fetch failed for ${feedUrl}:`, error.message);
            }
        }

        return articles;
    }

    async collectAndStore() {
        const newsData = {
            articles: [],
            lastUpdated: new Date().toISOString()
        };

        for (const category of Object.keys(this.categories)) {
            let articles = [];
            
            // Try NewsAPI first if key is available
            if (this.newsApiKey) {
                articles = await this.fetchFromNewsApi(category);
            }
            
            // Fallback to RSS if no articles from NewsAPI
            if (articles.length === 0) {
                articles = await this.fetchFromGoogleRss(category);
            }

            // Validate and store articles
            for (const article of articles) {
                if (!article.url || !await this.validateUrl(article.url)) continue;

                const newsItem = {
                    title: article.title,
                    summary: article.description?.slice(0, 200) + '...',
                    url: article.url,
                    source: article.source.name,
                    category,
                    published_date: new Date(article.publishedAt).toISOString()
                };

                // Store in database
                await new Promise((resolve, reject) => {
                    this.db.run(
                        `INSERT INTO news (title, summary, source, url, category, published_date) 
                         SELECT ?,?,?,?,?,? 
                         WHERE NOT EXISTS (SELECT 1 FROM news WHERE url = ?);`,
                        [newsItem.title, newsItem.summary, newsItem.source, newsItem.url, 
                         newsItem.category, newsItem.published_date, newsItem.url],
                        function (err) {
                            if (err) return reject(err);
                            resolve();
                        }
                    );
                }).catch(console.error);

                    // Translate title and summary if not in Korean
                if (category !== 'korea') {
                    newsItem.title_kr = await translationService.translate(newsItem.title);
                    newsItem.summary_kr = await translationService.translate(newsItem.summary);
                } else {
                    newsItem.title_kr = newsItem.title;
                    newsItem.summary_kr = newsItem.summary;
                }

                // Add to news data for JSON
                newsData.articles.push({
                    ...newsItem,
                    date: new Date(newsItem.published_date).toLocaleDateString('ko-KR')
                });
            }
        }

        // Remove duplicates and sort
        newsData.articles = Array.from(
            new Map(newsData.articles.map(item => [item.url, item])).values()
        ).sort((a, b) => new Date(b.published_date) - new Date(a.published_date))
        .slice(0, 30);

        // Analyze news and generate insights
        const analyzer = new NewsAnalyzer(newsData.articles);
        newsData.insights = {
            techTrends: analyzer.analyzeTechTrends(),
            marketInsights: analyzer.analyzeMarketInsights(),
            marketForecast: analyzer.analyzeMarketForecast()
        };

        // Save to JSON file
        const dataDir = path.join(process.cwd(), 'data');
        try {
            await fs.writeFile(
                path.join(dataDir, 'news.json'),
                JSON.stringify(newsData, null, 2),
                'utf8'
            );
            console.log('News data successfully written to news.json');
        } catch (error) {
            console.error('Error writing news.json:', error);
        }

        return true;
    }
}

module.exports = NewsCollector;