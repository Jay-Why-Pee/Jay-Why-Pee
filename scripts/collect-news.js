const fetch = require('node-fetch');
const Parser = require('rss-parser');
const fs = require('fs').promises;
const path = require('path');

class NewsCollector {
    constructor() {
        this.newsApiKey = process.env.NEWSAPI_KEY;
        this.parser = new Parser();
        this.queries = [
            'electric vehicle motor technology',
            'ev motor manufacturing innovation',
            'tesla rare earth motor',
            'ev motor market trends',
            'electric vehicle drivetrain advances'
        ];
    }

    async validateUrl(url) {
        try {
            const head = await fetch(url, { 
                method: 'HEAD', 
                redirect: 'follow',
                timeout: 5000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; NewsCollector/1.0)'
                }
            });
            if (head.ok) return true;

            const get = await fetch(url, { 
                method: 'GET', 
                redirect: 'follow',
                timeout: 5000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; NewsCollector/1.0)'
                }
            });
            return get.ok;
        } catch (err) {
            return false;
        }
    }

    async fetchFromNewsApi(query) {
        if (!this.newsApiKey) {
            console.log('No NewsAPI key provided, skipping NewsAPI source');
            return [];
        }

        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&pageSize=10&sortBy=relevancy&apiKey=${this.newsApiKey}`;
        
        try {
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; NewsCollector/1.0)'
                }
            });
            
            if (!res.ok) return [];

            const data = await res.json();
            
            return (data.articles || []).map(a => ({
                title: a.title,
                summary: a.description || a.content || '',
                source: (a.source && a.source.name) || '',
                date: a.publishedAt ? a.publishedAt.split('T')[0] : '',
                url: a.url,
                category: this.categorizeArticle(a.title + ' ' + (a.description || ''))
            }));
        } catch (err) {
            console.error('Error fetching from NewsAPI:', err.message);
            return [];
        }
    }

    async fetchFromGoogleRss(query) {
        const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
        
        try {
            const feed = await this.parser.parseURL(feedUrl);
            
            return (feed.items || []).map(item => ({
                title: item.title,
                summary: item.contentSnippet || '',
                source: item.source || new URL(item.link).hostname,
                date: item.isoDate ? item.isoDate.split('T')[0] : '',
                url: item.link,
                category: this.categorizeArticle(item.title + ' ' + (item.contentSnippet || ''))
            }));
        } catch (err) {
            console.error('Error fetching from Google News RSS:', err.message);
            return [];
        }
    }

    categorizeArticle(content) {
        content = content.toLowerCase();
        
        if (content.includes('breaking') || 
            content.includes('announces') || 
            content.includes('just in')) {
            return 'breaking';
        }
        
        if (content.includes('korea') || 
            content.includes('hyundai') || 
            content.includes('samsung') || 
            content.includes('lg')) {
            return 'korea';
        }
        
        if (content.includes('technology') || 
            content.includes('innovation') || 
            content.includes('development')) {
            return 'tech';
        }
        
        if (content.includes('market') || 
            content.includes('industry') || 
            content.includes('growth')) {
            return 'market';
        }
        
        return 'tech';
    }

    async collectNews() {
        console.log('Starting news collection...');
        const results = new Set();
        
        for (const query of this.queries) {
            try {
                const fromNewsApi = await this.fetchFromNewsApi(query);
                fromNewsApi.forEach(article => results.add(JSON.stringify(article)));
            } catch (e) {
                console.error('Error collecting from NewsAPI:', e.message);
            }

            try {
                const fromRss = await this.fetchFromGoogleRss(query);
                fromRss.forEach(article => results.add(JSON.stringify(article)));
            } catch (e) {
                console.error('Error collecting from RSS:', e.message);
            }
        }

        console.log(`Collected ${results.size} unique articles, validating URLs...`);
        
        const articles = Array.from(results).map(str => JSON.parse(str));
        const validArticles = [];
        
        for (const article of articles) {
            if (!article.url) continue;

            const isValid = await this.validateUrl(article.url);
            if (!isValid) continue;

            validArticles.push(article);
        }

        console.log(`News collection completed. Found ${validArticles.length} valid articles.`);
        return validArticles;
    }
}

async function main() {
    try {
        // Create data directory if it doesn't exist
        await fs.mkdir(path.join(__dirname, '..', 'data'), { recursive: true });
        
        // Collect news
        const collector = new NewsCollector();
        const articles = await collector.collectNews();
        
        // Save to JSON file
        const filePath = path.join(__dirname, '..', 'data', 'news.json');
        await fs.writeFile(filePath, JSON.stringify({
            lastUpdated: new Date().toISOString(),
            articles: articles
        }, null, 2));
        
        console.log('News data saved successfully');
    } catch (error) {
        console.error('Error running news collection:', error);
        process.exit(1);
    }
}

main();