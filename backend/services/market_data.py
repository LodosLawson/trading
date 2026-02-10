import os
import requests
from typing import Dict, List, Any

# Mock Data for Prototype (Fallback)
MOCK_INSIGHTS = [
    {
        "headline": "Tesla (TSLA) için 3. Seviye Risk Uyarısı: Otonom Sürüş Davası",
        "impact_score": -7.5,
        "chain_reaction": ["TSLA: %4 Düşüş Riski", "ARKK ETF: %2 Düşüş Riski"],
        "ai_mentor_advice": "Dikkat Can, volatilite çok yüksek."
    }
]

def fetch_market_news(query: str = "Finance Investing Stock Market") -> List[Dict[str, Any]]:
    """
    Fetches real-time news from Google News via Apify.
    """
    api_key = os.getenv("APIFY_API_KEY")
    if not api_key:
        print("APIFY_API_KEY missing, using mock.")
        return []

    # Apify Google News Scraper (unofficial/google-news-scraper)
    # Actor ID: "l2t0l4u2k0c2-google-news-scraper" or similar. 
    # We will use the 'google-news-scraper' by 'apify' or 'epctex' depending on stability.
    # Switch to 'apify/google-search-scraper' as it is more reliable/persistent.
    url = f"https://api.apify.com/v2/acts/apify~google-search-scraper/run-sync-get-dataset-items?token={api_key}"
    
    payload = {
        "queries": query + " news", # Append 'news' to approximate news search
        "resultsPerPage": 10,
        "maxPagesPerQuery": 1,
    }
    
    try:
        response = requests.post(url, json=payload)
        if response.status_code != 200:
             print(f"Apify Status: {response.status_code} {response.reason}")
             # print(response.text) # Commented out to avoid UnicodeEncodeError on Windows
        response.raise_for_status()
        data = response.json()
        
        # Normalize data from Google Search Scraper
        # Output is a list of result pages. Each page has 'organicResults'.
        news_items = []
        for page in data:
            results = page.get("organicResults", [])
            for item in results:
                news_items.append({
                    "title": item.get("title"),
                    "link": item.get("url"),
                    "source": "Google Search", # Search scraper doesn't always give source name cleanly
                    "published_at": item.get("date") or "Just Now" # Extract date if available
                })
        
        # --- AI ENRICHMENT ---
        # Analyze top 3 items to save tokens/time
        from services import ai_agent
        for i in range(min(3, len(news_items))):
            item = news_items[i]
            print(f"Analyzing: {item['title'][:30]}...")
            analysis = ai_agent.analyze_market_news(item['title'])
            item.update(analysis) # Merge impact_score, reasoning, affected_assets, etc.

        return news_items[:10] # Limit to 10 total
    except Exception as e:
        print(f"Apify Error: {e}")
        return []


def get_market_summary() -> Dict[str, Any]:
    """
    Fetches news and generates a market summary.
    """
    news = fetch_market_news()
    headlines = [item['title'] for item in news]
    
    from services import ai_agent
    summary = ai_agent.generate_market_summary(headlines)
    return summary
