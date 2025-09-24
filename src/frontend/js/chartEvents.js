// Chart.js를 위한 이벤트 및 데이터 관리 모듈
class EventBus {
    constructor() {
        this.events = {};
    }

    // 이벤트 리스너 등록
    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    // 이벤트 리스너 제거
    off(eventName, callback) {
        if (!this.events[eventName]) return;
        this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
    }

    // 이벤트 발생
    emit(eventName, data) {
        if (!this.events[eventName]) return;
        this.events[eventName].forEach(callback => callback(data));
    }
}

// 차트 관련 데이터 관리
class DataManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.data = {
            marketTrends: {},
            techTrends: [],
            patents: {},
            marketDistribution: {},
            analysis: {
                swot: {
                    strengths: [],
                    weaknesses: [],
                    opportunities: [],
                    threats: []
                }
            }
        };

        this.updateInterval = 3600000; // 1시간 (밀리초)
        this.initDataFetch();
    }

    // 초기 데이터 가져오기 및 주기적 업데이트 설정
    async initDataFetch() {
        await this.fetchAllData();
        setInterval(() => this.fetchAllData(), this.updateInterval);
    }

    // 모든 데이터 가져오기
    async fetchAllData() {
        try {
            const [marketData, techData, patentData, distributionData, analysisData] = await Promise.all([
                this.fetchMarketTrends(),
                this.fetchTechTrends(),
                this.fetchPatentData(),
                this.fetchMarketDistribution(),
                this.fetchAnalysisData()
            ]);

            this.updateData({
                marketTrends: marketData,
                techTrends: techData,
                patents: patentData,
                marketDistribution: distributionData,
                analysis: analysisData
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    // 시장 동향 데이터 가져오기
    async fetchMarketTrends() {
        const response = await fetch('/api/market/trends');
        return await response.json();
    }

    // 기술 트렌드 데이터 가져오기
    async fetchTechTrends() {
        const response = await fetch('/api/analysis/tech-trends');
        return await response.json();
    }

    // 특허 데이터 가져오기
    async fetchPatentData() {
        const response = await fetch('/api/patents/distribution');
        return await response.json();
    }

    // 시장 분포 데이터 가져오기
    async fetchMarketDistribution() {
        const response = await fetch('/api/market/distribution');
        return await response.json();
    }

    // 분석 데이터 가져오기
    async fetchAnalysisData() {
        const response = await fetch('/api/analysis/strategic');
        return await response.json();
    }

    // 데이터 업데이트 및 이벤트 발생
    updateData(newData) {
        Object.assign(this.data, newData);
        this.eventBus.emit('dataUpdated', this.data);
    }

    // 특정 데이터 섹션 가져오기
    getData(section) {
        return this.data[section];
    }
}

// 차트 상호작용 관리
class InteractionManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.setupInteractions();
    }

    setupInteractions() {
        // 차트 클릭 이벤트 처리
        document.querySelectorAll('canvas').forEach(canvas => {
            canvas.addEventListener('click', (event) => {
                const chart = Chart.getChart(event.target);
                if (!chart) return;

                const points = chart.getElementsAtEventForMode(
                    event, 
                    'nearest',
                    { intersect: true },
                    true
                );

                if (points.length) {
                    const firstPoint = points[0];
                    const label = chart.data.labels[firstPoint.index];
                    const value = chart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
                    
                    this.eventBus.emit('chartClick', {
                        chart: chart,
                        label: label,
                        value: value,
                        dataset: chart.data.datasets[firstPoint.datasetIndex].label
                    });
                }
            });
        });

        // 차트 호버 이벤트 처리
        document.querySelectorAll('canvas').forEach(canvas => {
            canvas.addEventListener('mousemove', (event) => {
                const chart = Chart.getChart(event.target);
                if (!chart) return;

                const points = chart.getElementsAtEventForMode(
                    event,
                    'nearest',
                    { intersect: true },
                    true
                );

                if (points.length) {
                    this.eventBus.emit('chartHover', {
                        chart: chart,
                        point: points[0]
                    });
                }
            });
        });
    }
}

// 전역 설정에 추가
window.APP = window.APP || {};
window.APP.eventBus = new EventBus();
window.APP.dataManager = new DataManager(window.APP.eventBus);
window.APP.interactionManager = new InteractionManager(window.APP.eventBus);