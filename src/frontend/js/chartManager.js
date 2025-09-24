// 차트 공통 설정과 유틸리티 모듈
class ChartManager {
    // 차트에서 사용할 색상 팔레트
    static colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#E7E9ED', '#2ECC71',
        '#3498DB', '#9B59B6', '#F1C40F', '#E67E22'
    ];

    // 시장 동향 차트 생성
    static createMarketTrendChart(ctx, data) {
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Market Growth',
                    data: data.values,
                    borderColor: this.colors[0],
                    backgroundColor: this.colors[0] + '33',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    },
                    title: {
                        display: true,
                        text: 'EV Motor Market Trends',
                        color: '#ffffff'
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#ffffff' },
                        grid: { color: '#ffffff33' }
                    },
                    y: {
                        ticks: { color: '#ffffff' },
                        grid: { color: '#ffffff33' }
                    }
                }
            }
        });
    }

    // 기술 트렌드 차트 생성
    static createTechTrendChart(ctx, data) {
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: data.datasets.map((dataset, i) => ({
                    label: dataset.label,
                    data: dataset.data,
                    borderColor: this.colors[i % this.colors.length],
                    backgroundColor: this.colors[i % this.colors.length] + '33',
                    fill: true
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Technology Adoption Trends',
                        color: '#ffffff'
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#ffffff' },
                        grid: { color: '#ffffff33' }
                    },
                    y: {
                        ticks: { color: '#ffffff' },
                        grid: { color: '#ffffff33' }
                    }
                }
            }
        });
    }

    // 특허 레이더 차트 생성
    static createPatentChart(ctx, data) {
        return new Chart(ctx, {
            type: 'radar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Patent Distribution',
                    data: data.values,
                    borderColor: this.colors[2],
                    backgroundColor: this.colors[2] + '33',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Patent Analysis',
                        color: '#ffffff'
                    }
                },
                scales: {
                    r: {
                        angleLines: {
                            color: '#ffffff33'
                        },
                        grid: {
                            color: '#ffffff33'
                        },
                        ticks: {
                            color: '#ffffff',
                            backdropColor: 'transparent'
                        },
                        pointLabels: {
                            color: '#ffffff'
                        }
                    }
                }
            }
        });
    }

    // SWOT 분석 차트 생성
    static createSwotChart(ctx, initialData) {
        return new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: ['Strengths', 'Weaknesses', 'Opportunities', 'Threats'],
                datasets: [{
                    data: initialData,
                    backgroundColor: [
                        this.colors[0] + '66',
                        this.colors[1] + '66',
                        this.colors[2] + '66',
                        this.colors[3] + '66'
                    ],
                    borderColor: [
                        this.colors[0],
                        this.colors[1],
                        this.colors[2],
                        this.colors[3]
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Strategic Analysis',
                        color: '#ffffff'
                    }
                },
                scales: {
                    r: {
                        ticks: {
                            color: '#ffffff',
                            backdropColor: 'transparent'
                        }
                    }
                }
            }
        });
    }

    // 애니메이션 효과 추가
    static addAnimation(chart, type = 'fadeIn') {
        const animations = {
            fadeIn: {
                duration: 1000,
                easing: 'easeInOutQuart'
            },
            slideIn: {
                duration: 1000,
                easing: 'easeInOutBack'
            },
            bounceIn: {
                duration: 1000,
                easing: 'easeInElastic'
            }
        };

        chart.options.animation = animations[type];
        chart.update();
    }

    // 차트 테마 변경
    static updateTheme(chart, theme) {
        const themes = {
            dark: {
                backgroundColor: '#1e1e1e',
                textColor: '#ffffff',
                gridColor: '#ffffff33'
            },
            light: {
                backgroundColor: '#ffffff',
                textColor: '#333333',
                gridColor: '#33333333'
            }
        };

        const currentTheme = themes[theme];
        
        // 플러그인 설정 업데이트
        chart.options.plugins.legend.labels.color = currentTheme.textColor;
        chart.options.plugins.title.color = currentTheme.textColor;

        // 스케일 설정 업데이트
        if (chart.options.scales) {
            Object.keys(chart.options.scales).forEach(scale => {
                chart.options.scales[scale].grid.color = currentTheme.gridColor;
                chart.options.scales[scale].ticks.color = currentTheme.textColor;
            });
        }

        chart.update();
    }

    // 반응형 레이아웃 조정
    static adjustLayout(chart, containerWidth) {
        let aspectRatio;
        if (containerWidth < 600) {
            aspectRatio = 1;  // 모바일: 정사각형
        } else if (containerWidth < 1024) {
            aspectRatio = 4/3;  // 태블릿: 4:3
        } else {
            aspectRatio = 16/9;  // 데스크톱: 16:9
        }

        chart.options.aspectRatio = aspectRatio;
        chart.update();
    }
}

// 전역 설정에 추가
window.APP.ChartManager = ChartManager;