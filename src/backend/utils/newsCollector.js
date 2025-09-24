const fetch = require('node-fetch');
const Parser = require('rss-parser');

class NewsCollector {
    constructor(db, options = {}) {
        this.db = db;
        this.newsApiKey = options.newsApiKey || process.env.NEWSAPI_KEY;
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
            console.log(`Validating URL: ${url}`);
            // Try HEAD first
            const head = await fetch(url, { 
                method: 'HEAD', 
                redirect: 'follow',
                timeout: 5000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; NewsCollector/1.0)'
                }
            });
            if (head.ok) {
                console.log(`URL validated via HEAD: ${url}`);
                return true;
            }

            // Fallback to GET if HEAD fails
            console.log(`HEAD failed, trying GET: ${url}`);
            const get = await fetch(url, { 
                method: 'GET', 
                redirect: 'follow',
                timeout: 5000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; NewsCollector/1.0)'
                }
            });
            const isValid = get.ok;
            console.log(`URL ${isValid ? 'validated' : 'invalid'} via GET: ${url}`);
            return isValid;
        } catch (err) {
            console.error(`URL validation failed for ${url}:`, err.message);
            return false;
        }
    }

    async fetchFromNewsApi(query) {
        if (!this.newsApiKey) {
            console.log('No NewsAPI key provided, skipping NewsAPI source');
            return [];
        }

        console.log(`Fetching from NewsAPI with query: ${query}`);
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&pageSize=10&sortBy=relevancy&apiKey=${this.newsApiKey}`;
        
        try {
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; NewsCollector/1.0)'
                }
            });
            
            if (!res.ok) {
                console.error(`NewsAPI request failed: ${res.status} ${res.statusText}`);
                return [];
            }

            const data = await res.json();
            console.log(`Retrieved ${data.articles?.length || 0} articles from NewsAPI`);
            
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
        console.log(`Fetching from Google News RSS with query: ${query}`);
        const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
        
        try {
            const feed = await this.parser.parseURL(feedUrl);
            console.log(`Retrieved ${feed.items?.length || 0} items from RSS feed`);
            
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
        
        return 'tech';  // default category
    }

    async saveArticle(article) {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO news (
                    title, summary, source, url, category, published_date
                ) VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(url) DO UPDATE SET
                    title = ?,
                    summary = ?,
                    source = ?,
                    category = ?,
                    published_date = ?,
                    updated_at = CURRENT_TIMESTAMP
            `;
            
            this.db.run(
                query,
                [
                    article.title,
                    article.summary,
                    article.source,
                    article.url,
                    article.category,
                    article.date,
                    // Values for UPDATE clause
                    article.title,
                    article.summary,
                    article.source,
                    article.category,
                    article.date
                ],
                function(err) {
                    if (err) {
                        console.error('Error saving article:', err.message);
                        reject(err);
                    } else {
                        console.log(`Article saved/updated: ${article.title}`);
                        resolve(this.lastID);
                    }
                }
            );
        });
    }

    async collectAndStore() {
        console.log('Starting news collection...');
        const results = new Set();
        
        // Collect from all queries
        for (const query of this.queries) {
            // Try NewsAPI
            try {
                const fromNewsApi = await this.fetchFromNewsApi(query);
                fromNewsApi.forEach(article => results.add(JSON.stringify(article)));
            } catch (e) {
                console.error('Error collecting from NewsAPI:', e.message);
            }

            // Try RSS
            try {
                const fromRss = await this.fetchFromGoogleRss(query);
                fromRss.forEach(article => results.add(JSON.stringify(article)));
            } catch (e) {
                console.error('Error collecting from RSS:', e.message);
            }
        }

        console.log(`Collected ${results.size} unique articles, validating URLs...`);
        
        // Process and store valid articles
        const articles = Array.from(results).map(str => JSON.parse(str));
        let savedCount = 0;
        
        for (const article of articles) {
            if (!article.url) {
                console.log('Skipping article without URL');
                continue;
            }

            const isValid = await this.validateUrl(article.url);
            if (!isValid) {
                console.log(`Skipping article with invalid URL: ${article.url}`);
                continue;
            }

            try {
                await this.saveArticle(article);
                savedCount++;
            } catch (err) {
                console.error(`Failed to save article: ${article.title}`, err.message);
            }
        }

        console.log(`News collection completed. Saved ${savedCount} articles.`);
        return savedCount;
    }

    async getVerifiedNews() {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT * FROM news ORDER BY published_date DESC LIMIT 50`,
                [],
                (err, rows) => {
                    if (err) {
                        console.error('Error fetching verified news:', err.message);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }
}

module.exports = NewsCollector;