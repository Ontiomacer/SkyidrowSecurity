import json
from cybernews.cybernews import CyberNews

def fetch_cybernews_articles(news_type='security', limit=10):
    cn = CyberNews()
    articles = cn.get_news(news_type)
    formatted = [
        {
            'id': str(a.get('id', '')),
            'title': a.get('headlines', ''),
            'summary': a.get('fullNews', ''),
            'url': a.get('newsURL', ''),
            'date': a.get('newsDate', ''),
            'image': a.get('newsImgURL', ''),
            'source': a.get('author', 'CyberNews'),
        }
        for a in articles[:limit]
    ]
    return json.dumps(formatted)

if __name__ == "__main__":
    print(fetch_cybernews_articles('security', 10))
