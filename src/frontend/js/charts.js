// 차트 설정 및 생성을 위한 유틸리티
const ChartManager = {
    // 차트 기본 설정
    defaultOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#ffffff'
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: '#ffffff'
                }
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: '#ffffff'
                }
            }
        }
    },

    // 시장 트렌드 차트 생성
    createMarketTrendChart(ctx, data) {
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: '시장 규모 (십억 달러)',
                    data: data.values,
                    borderColor: '#007AFF',
                    backgroundColor: 'rgba(0, 122, 255, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: this.defaultOptions
        });
    },

    // 기술 트렌드 차트 생성
    createTechTrendChart(ctx, data) {
        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: data.datasets.map((dataset, index) => ({
                    label: dataset.label,
                    data: dataset.data,
                    backgroundColor: this.getColor(index),
                    borderColor: this.getColor(index),
                    borderWidth: 1
                }))
            },
            options: {
                ...this.defaultOptions,
                scales: {
                    x: {
                        stacked: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    },
                    y: {
                        stacked: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    }
                }
            }
        });
    },

    // 특허 동향 차트 생성
    createPatentChart(ctx, data) {
        return new Chart(ctx, {
            type: 'radar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: '특허 출원 수',
                    data: data.values,
                    backgroundColor: 'rgba(88, 86, 214, 0.2)',
                    borderColor: 'rgba(88, 86, 214, 1)',
                    pointBackgroundColor: 'rgba(88, 86, 214, 1)'
                }]
            },
            options: {
                ...this.defaultOptions,
                scales: {
                    r: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        pointLabels: {
                            color: '#ffffff'
                        }
                    }
                }
            }
        });
    },

    // SWOT 분석 차트 생성
    createSwotChart(ctx, data) {
        return new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: ['강점', '약점', '기회', '위협'],
                datasets: [{
                    data: data,
                    backgroundColor: [
                        'rgba(52, 199, 89, 0.6)',   // 강점
                        'rgba(255, 59, 48, 0.6)',   // 약점
                        'rgba(0, 122, 255, 0.6)',   // 기회
                        'rgba(255, 149, 0, 0.6)'    // 위협
                    ]
                }]
            },
            options: {
                ...this.defaultOptions,
                scales: {
                    r: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    },

    // 차트 색상 팔레트
    colors: [
        '#007AFF', // blue
        '#5856D6', // indigo
        '#FF2D55', // pink
        '#FF3B30', // red
        '#FF9500', // orange
        '#34C759', // green
        '#5AC8FA', // teal
        '#AF52DE'  // purple
    ],

    // 색상 가져오기
    getColor(index) {
        return this.colors[index % this.colors.length];
    }
};

// 테스트용 샘플 데이터
const sampleData = {
    marketTrends: {
        '2020': 100,
        '2021': 150,
        '2022': 220,
        '2023': 310,
        '2024': 450,
        '2025': 580
    },
    techTrends: [
        { technology: 'Permanent Magnet', year: '2020', count: 45 },
        { technology: 'Permanent Magnet', year: '2021', count: 60 },
        { technology: 'Permanent Magnet', year: '2022', count: 80 },
        { technology: 'Induction Motor', year: '2020', count: 30 },
        { technology: 'Induction Motor', year: '2021', count: 40 },
        { technology: 'Induction Motor', year: '2022', count: 55 },
        { technology: 'Reluctance Motor', year: '2020', count: 15 },
        { technology: 'Reluctance Motor', year: '2021', count: 25 },
        { technology: 'Reluctance Motor', year: '2022', count: 35 }
    ],
    patents: {
        'Motor Design': 75,
        'Control Systems': 60,
        'Materials': 45,
        'Manufacturing': 55,
        'Cooling Systems': 40,
        'Power Electronics': 65
    },
    marketDistribution: {
        'North America': 35,
        'Europe': 30,
        'Asia Pacific': 25,
        'China': 8,
        'Rest of World': 2
    },
    analysis: {
        swot: {
            strengths: [
                'High efficiency',
                'Compact design',
                'Cost effective'
            ],
            weaknesses: [
                'Temperature sensitivity',
                'Complex control'
            ],
            opportunities: [
                'Growing EV market',
                'Government incentives',
                'Technology advances'
            ],
            threats: [
                'Supply chain issues',
                'Raw material costs'
            ]
        }
    }
};

// 차트 초기화 및 테스트 데이터 로드
document.addEventListener('DOMContentLoaded', () => {
    // APP 네임스페이스가 설정되어 있는지 확인
    if (!window.APP) {
        console.error('APP namespace not initialized');
        return;
    }

    // 차트 대시보드 초기화
    const dashboard = new APP.ChartDashboard();

    // 테스트 데이터로 차트 업데이트
    APP.eventBus.emit('dataUpdated', sampleData);

    // 이벤트 리스너 테스트
    APP.eventBus.on('chartClick', (data) => {
        console.log('Chart clicked:', data);
    });

    APP.eventBus.on('chartHover', (data) => {
        console.log('Chart hover:', data);
    });

    // 창 크기 변경 시 차트 레이아웃 조정
    window.addEventListener('resize', () => {
        Object.values(dashboard.charts).forEach(chart => {
            if (chart.chart) {
                APP.ChartManager.adjustLayout(
                    chart.chart,
                    chart.container.clientWidth
                );
            }
        });
    });

    console.log('Charts initialized with sample data');
});

// 전역 설정에 추가
window.APP.ChartManager = ChartManager;