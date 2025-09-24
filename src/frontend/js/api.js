// API 엔드포인트 설정
const API_BASE_URL = 'http://localhost:3000/api';

// API 요청 함수들
const api = {
    // 뉴스 데이터 가져오기
    async getNews(category = null, limit = 20, offset = 0) {
        const params = new URLSearchParams({ limit, offset });
        if (category) params.append('category', category);
        const response = await fetch(`${API_BASE_URL}/news?${params}`);
        return await response.json();
    },

    // 시장 데이터 가져오기
    async getMarketTrends(period = null) {
        const params = new URLSearchParams();
        if (period) params.append('period', period);
        const response = await fetch(`${API_BASE_URL}/market?${params}`);
        return await response.json();
    },

    // 특허 데이터 가져오기
    async getPatents(company = null, limit = 20, offset = 0) {
        const params = new URLSearchParams({ limit, offset });
        if (company) params.append('company', company);
        const response = await fetch(`${API_BASE_URL}/patents?${params}`);
        return await response.json();
    },

    // 분석 결과 가져오기
    async getAnalysis(type) {
        const response = await fetch(`${API_BASE_URL}/analysis/${type}`);
        return await response.json();
    }
};

// 이벤트 버스 - 컴포넌트 간 통신
const eventBus = {
    listeners: {},
    
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    },

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
};

// 데이터 상태 관리
const store = {
    state: {
        news: [],
        marketTrends: [],
        patents: [],
        analysis: null,
        loading: false,
        error: null
    },

    async fetchData() {
        try {
            this.state.loading = true;
            this.state.error = null;

            // 병렬로 데이터 가져오기
            const [news, marketTrends, patents, analysis] = await Promise.all([
                api.getNews(),
                api.getMarketTrends(),
                api.getPatents(),
                api.getAnalysis('swot')
            ]);

            this.state.news = news;
            this.state.marketTrends = marketTrends;
            this.state.patents = patents;
            this.state.analysis = analysis;

            eventBus.emit('dataUpdated', this.state);
        } catch (error) {
            this.state.error = error.message;
            eventBus.emit('error', error);
        } finally {
            this.state.loading = false;
            eventBus.emit('loadingChanged', this.state.loading);
        }
    },

    // 주기적 데이터 업데이트 설정
    startAutoUpdate(interval = 60000) {
        setInterval(() => this.fetchData(), interval);
    }
};

// 데이터 포맷팅 유틸리티
const utils = {
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    formatNumber(number) {
        return new Intl.NumberFormat('ko-KR').format(number);
    },

    formatPercentage(number) {
        return `${Number(number).toFixed(1)}%`;
    }
};

// 전역 설정
window.APP = {
    api,
    eventBus,
    store,
    utils
};