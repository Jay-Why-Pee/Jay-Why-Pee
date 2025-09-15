import json
import time
import requests
from bs4 import BeautifulSoup
from datetime import datetime

def crawl_news_data():
    """웹사이트에서 뉴스 데이터를 크롤링합니다."""
    url = "https://news.google.com/search?q=%EC%A0%84%EA%B8%B0%EC%B0%A8%20%EB%AA%A8%ED%84%B0%20%EA%B8%B0%EC%88%A0&hl=ko&gl=KR&ceid=KR%3Ako"

    try:
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        news_list = []
        articles = soup.select('div.pT6mwb')
        
        for article in articles[:10]:
            try:
                title_elem = article.select_one('h3.ipQwMb > a')
                link_elem = title_elem
                summary_elem = article.select_one('span.xBbh9')
                source_elem = article.select_one('div.sv9sFf > a')

                title = title_elem.get_text(strip=True) if title_elem else "제목 없음"
                link = 'https://news.google.com' + link_elem['href'].lstrip('.') if link_elem and 'href' in link_elem.attrs else "#"
                summary = summary_elem.get_text(strip=True) if summary_elem else "요약 없음"
                source = source_elem.get_text(strip=True) if source_elem else "출처 없음"

                news_item = {
                    "title": title,
                    "summary": summary,
                    "source": source,
                    "link": link,
                    "timestamp": datetime.now().isoformat()
                }
                news_list.append(news_item)
            except Exception as e:
                print(f"기사 처리 중 오류 발생: {e}")
                continue
        
        if not news_list:
            print("경고: 크롤링 결과, 기사를 하나도 찾지 못했습니다. 기존 파일을 유지합니다.")
            return None
            
        return news_list
        
    except requests.exceptions.RequestException as e:
        print(f"웹사이트 접속 오류: {e}")
        return None

def get_mock_graph_data():
    """그래프 데이터와 출처 정보를 반환합니다."""
    return {
        "yearly_market_size": {
            "labels": ["2022", "2023", "2024", "2025(예상)"],
            "data": [1000, 1200, 1500, 1800],
            "source": "출처: 글로벌 시장 보고서"
        },
        "country_market_share": {
            "labels": ["중국", "한국", "미국", "독일", "기타"],
            "data": [45, 20, 15, 10, 10],
            "source": "출처: Statista"
        },
        "company_market_share": {
            "labels": ["LG전자", "보쉬", "덴소", "기타"],
            "data": [30, 25, 20, 25],
            "source": "출처: 각사 공시자료"
        }
    }

def main():
    """뉴스 데이터와 그래프 데이터를 수집하여 JSON 파일로 저장합니다."""
    print("뉴스 및 그래프 데이터 수집을 시작합니다...")
    
    news_data = crawl_news_data()
    
    # 크롤링에 실패하여 None이 반환된 경우, JSON 파일을 덮어쓰지 않습니다.
    if news_data is None:
        print("크롤링 실패. 기존 news_data.json 파일을 유지합니다.")
        return
    
    data = {
        "last_updated": datetime.now().isoformat(),
        "news": news_data,
        "graphs": get_mock_graph_data()
    }
    
    with open("news_data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    
    print("데이터 수집 완료. news_data.json 파일이 업데이트되었습니다.")

if __name__ == "__main__":
    main()
