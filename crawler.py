import json
import time
import random
from datetime import datetime

#
# 참고: 이 스크립트는 크롤링 로직을 시뮬레이션하기 위한 모의 데이터 생성 예제입니다.
# 실제 웹사이트에서 데이터를 수집하려면 requests, beautifulsoup4 등의 라이브러리를 사용해
# 크롤링 코드를 직접 작성해야 합니다.
#

def get_mock_news_data():
    """모의 뉴스 데이터를 생성합니다."""
    news_titles = [
        "테슬라, 새로운 모터 기술 특허 출원",
        "LG전자, 전기차 모터 시장 점유율 확대",
        "2025년 글로벌 EV 모터 시장 규모 1.5배 성장 전망",
        "중국 B사를 넘어선 한국의 A사, 전기차 모터 기술 혁신",
        "글로벌 EV 모터 시장, 기술 경쟁 심화"
    ]
    news_sources = ["구글 뉴스", "네이버 뉴스", "특허청"]
    
    news_list = []
    for i in range(10):
        news = {
            "title": random.choice(news_titles),
            "summary": "전기차 모터 시장의 최신 동향에 대한 심층 분석 기사입니다. 주요 기업들의 기술 개발 현황과 시장 경쟁 구도를 다룹니다.",
            "source": random.choice(news_sources),
            "link": "https://www.example.com/news/" + str(int(time.time())) + str(i),
            "timestamp": datetime.now().isoformat()
        }
        news_list.append(news)
    return news_list

def get_mock_graph_data():
    """모의 그래프 데이터를 생성합니다."""
    return {
        "yearly_market_size": {
            "labels": ["2022", "2023", "2024", "2025(예상)"],
            "data": [1000, 1200, 1500, 1800]
        },
        "country_market_share": {
            "labels": ["중국", "한국", "미국", "독일", "기타"],
            "data": [45, 20, 15, 10, 10]
        },
        "company_market_share": {
            "labels": ["LG전자", "보쉬", "덴소", "기타"],
            "data": [30, 25, 20, 25]
        }
    }

def main():
    """뉴스 데이터와 그래프 데이터를 수집하여 JSON 파일로 저장합니다."""
    print("뉴스 및 그래프 데이터 수집을 시작합니다...")
    data = {
        "news": get_mock_news_data(),
        "graphs": get_mock_graph_data()
    }
    
    # news_data.json 파일에 데이터 저장
    with open("news_data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    
    print("데이터 수집 완료. news_data.json 파일이 업데이트되었습니다.")

if __name__ == "__main__":
    main()
