import feedparser
import json
from datetime import datetime

rss_feeds = {
    "Electrek": "https://electrek.co/feed",
    "InsideEVs": "https://insideevs.com/rss/articles/all",
    "ChargedEVs": "https://chargedevs.com/feed",
    "CleanTechnica": "https://cleantechnica.com/category/car-reviews/feed",
    "NaverNews": "http://newssearch.naver.com/search.naver?where=rss&sort_type=1&query=EV모터"
}

def fetch_rss_news():
    news_data = []
    for source, url in rss_feeds.items():
        feed = feedparser.parse(url)
        for entry in feed.entries[:5]:
            news_item = {
                "source": source,
                "title": entry.get("title", ""),
                "link": entry.get("link", ""),
                "published": entry.get("published", ""),
                "summary": entry.get("summary", "")
            }
            news_data.append(news_item)
    return news_data

news_items = fetch_rss_news()
output = {
    "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    "news": news_items
}

with open("ev_motor_news.json", "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)
