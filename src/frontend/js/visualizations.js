// 시장 동향 차트
class MarketTrendChart {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.chart = null;
        this.init();
    }

    init() {
        const canvas = document.createElement('canvas');
        this.container.appendChild(canvas);
        
        // 초기 차트 생성
        this.chart = APP.ChartManager.createMarketTrendChart(canvas.getContext('2d'), {
            labels: [],
            values: []
        });
    }

    update(data) {
        const years = Object.keys(data).sort();
        const values = years.map(year => data[year]);

        this.chart.data.labels = years;
        this.chart.data.datasets[0].data = values;
        this.chart.update();
    }
}

// 기술 트렌드 차트
class TechTrendChart {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.chart = null;
        this.init();
    }

    init() {
        const canvas = document.createElement('canvas');
        this.container.appendChild(canvas);
        
        // 초기 차트 생성
        this.chart = APP.ChartManager.createTechTrendChart(canvas.getContext('2d'), {
            labels: [],
            datasets: []
        });
    }

    update(data) {
        const technologies = [...new Set(data.map(item => item.technology))];
        const years = [...new Set(data.map(item => item.year))].sort();

        const datasets = technologies.map(tech => ({
            label: tech,
            data: years.map(year => {
                const match = data.find(item => item.technology === tech && item.year === year);
                return match ? match.count : 0;
            })
        }));

        this.chart.data.labels = years;
        this.chart.data.datasets = datasets;
        this.chart.update();
    }
}

// 특허 동향 레이더 차트
class PatentRadarChart {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.chart = null;
        this.init();
    }

    init() {
        const canvas = document.createElement('canvas');
        this.container.appendChild(canvas);
        
        // 초기 차트 생성
        this.chart = APP.ChartManager.createPatentChart(canvas.getContext('2d'), {
            labels: [],
            values: []
        });
    }

    update(data) {
        const areas = Object.keys(data);
        const values = areas.map(area => data[area]);

        this.chart.data.labels = areas;
        this.chart.data.datasets[0].data = values;
        this.chart.update();
    }
}

// 지역별 시장 분포 차트
class MarketDistributionChart {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.chart = null;
        this.init();
    }

    init() {
        const canvas = document.createElement('canvas');
        this.container.appendChild(canvas);
        
        this.chart = new Chart(canvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: APP.ChartManager.colors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#ffffff'
                        }
                    }
                }
            }
        });
    }

    update(data) {
        const regions = Object.keys(data);
        const values = regions.map(region => data[region]);

        this.chart.data.labels = regions;
        this.chart.data.datasets[0].data = values;
        this.chart.update();
    }
}

// 전략적 분석 차트
class StrategicAnalysisChart {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.chart = null;
        this.init();
    }

    init() {
        const canvas = document.createElement('canvas');
        this.container.appendChild(canvas);
        
        // 초기 SWOT 차트 생성
        this.chart = APP.ChartManager.createSwotChart(canvas.getContext('2d'), [0, 0, 0, 0]);
    }

    update(data) {
        const values = [
            data.strengths.length,
            data.weaknesses.length,
            data.opportunities.length,
            data.threats.length
        ];

        this.chart.data.datasets[0].data = values;
        this.chart.update();
    }
}

// 모든 차트 컴포넌트를 관리하는 매니저
class ChartDashboard {
    constructor() {
        this.charts = {
            marketTrend: new MarketTrendChart('marketTrendChart'),
            techTrend: new TechTrendChart('techTrendChart'),
            patentRadar: new PatentRadarChart('patentRadarChart'),
            marketDistribution: new MarketDistributionChart('marketDistributionChart'),
            strategicAnalysis: new StrategicAnalysisChart('strategicAnalysisChart')
        };

        this.initEventListeners();
    }

    initEventListeners() {
        // 데이터 업데이트 이벤트 리스너
        APP.eventBus.on('dataUpdated', (data) => {
            this.updateAllCharts(data);
        });
    }

    updateAllCharts(data) {
        if (data.marketTrends) {
            this.charts.marketTrend.update(data.marketTrends);
        }
        if (data.techTrends) {
            this.charts.techTrend.update(data.techTrends);
        }
        if (data.patents) {
            this.charts.patentRadar.update(data.patents);
        }
        if (data.marketDistribution) {
            this.charts.marketDistribution.update(data.marketDistribution);
        }
        if (data.analysis && data.analysis.swot) {
            this.charts.strategicAnalysis.update(data.analysis.swot);
        }
    }
}

// 전역 설정에 추가
window.APP.ChartDashboard = ChartDashboard;