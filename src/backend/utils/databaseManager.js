const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class DatabaseManager {
    constructor() {
        this.db = null;
        this.dbPath = path.join(__dirname, '../../database.sqlite');
    }

    // 데이터베이스 연결
    connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Error connecting to database:', err);
                    reject(err);
                } else {
                    console.log('Connected to SQLite database');
                    this.initializeTables()
                        .then(resolve)
                        .catch(reject);
                }
            });
        });
    }

    // 테이블 초기화
    async initializeTables() {
        const tables = {
            news: `
                CREATE TABLE IF NOT EXISTS news (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    summary TEXT,
                    source TEXT,
                    url TEXT NOT NULL,
                    category TEXT,
                    published_date DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(url)
                )
            `,
            market_trends: `
                CREATE TABLE IF NOT EXISTS market_trends (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    indicator_name TEXT NOT NULL,
                    value REAL,
                    unit TEXT,
                    time_period TEXT,
                    source TEXT,
                    region TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `,
            patents: `
                CREATE TABLE IF NOT EXISTS patents (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    abstract TEXT,
                    patent_number TEXT UNIQUE,
                    filing_date DATE,
                    company TEXT,
                    technology_area TEXT,
                    status TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `,
            analysis_results: `
                CREATE TABLE IF NOT EXISTS analysis_results (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    analysis_type TEXT NOT NULL,
                    result_data JSON,
                    parameters JSON,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `,
            market_forecasts: `
                CREATE TABLE IF NOT EXISTS market_forecasts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    forecast_type TEXT NOT NULL,
                    target_date DATE,
                    predicted_value REAL,
                    confidence_level REAL,
                    methodology TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `
        };

        for (const [tableName, query] of Object.entries(tables)) {
            await this.run(query);
            await this.createIndexes(tableName);
        }
    }

    // 인덱스 생성
    async createIndexes(tableName) {
        const indexes = {
            news: [
                'CREATE INDEX IF NOT EXISTS idx_news_date ON news(published_date)',
                'CREATE INDEX IF NOT EXISTS idx_news_category ON news(category)'
            ],
            market_trends: [
                'CREATE INDEX IF NOT EXISTS idx_trends_indicator ON market_trends(indicator_name)',
                'CREATE INDEX IF NOT EXISTS idx_trends_period ON market_trends(time_period)'
            ],
            patents: [
                'CREATE INDEX IF NOT EXISTS idx_patents_date ON patents(filing_date)',
                'CREATE INDEX IF NOT EXISTS idx_patents_company ON patents(company)'
            ],
            analysis_results: [
                'CREATE INDEX IF NOT EXISTS idx_analysis_type ON analysis_results(analysis_type)'
            ],
            market_forecasts: [
                'CREATE INDEX IF NOT EXISTS idx_forecast_date ON market_forecasts(target_date)',
                'CREATE INDEX IF NOT EXISTS idx_forecast_type ON market_forecasts(forecast_type)'
            ]
        };

        if (indexes[tableName]) {
            for (const indexQuery of indexes[tableName]) {
                await this.run(indexQuery);
            }
        }
    }

    // SQL 쿼리 실행
    run(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(query, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    // 단일 결과 조회
    get(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(query, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // 다중 결과 조회
    all(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // 데이터베이스 백업
    async backup() {
        const backupPath = path.join(__dirname, '../../backups', 
            `backup-${new Date().toISOString().slice(0,10)}.sqlite`);
        
        return new Promise((resolve, reject) => {
            const backup = this.db.backup(backupPath);
            
            backup.step(-1, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Backup completed successfully');
                    resolve();
                }
            });
        });
    }

    // 데이터베이스 연결 종료
    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Database connection closed');
                    resolve();
                }
            });
        });
    }
}

module.exports = new DatabaseManager();