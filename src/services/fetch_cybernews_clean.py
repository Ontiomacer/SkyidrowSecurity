from cybernews.cybernews import CyberNews
import json
from datetime import datetime
import os

news_fetcher = CyberNews()
news_items = news_fetcher.get_news('security')

formatted_news = []
for article in news_items:
    formatted_news.append({
        "title": article.get("headlines", "").strip(),
        "summary": article.get("fullNews", "").strip(),
        "link": article.get("newsURL", "").strip(),
        "fetched_at": datetime.utcnow().isoformat() + "Z"
    })

output_path = "src/services/cybernews_articles.json"
os.makedirs(os.path.dirname(output_path), exist_ok=True)

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(formatted_news, f, indent=2, ensure_ascii=False)

print("✓ CyberNews articles exported successfully to:", output_path)
