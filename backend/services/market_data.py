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


def fetch_crypto_prices(vs_currency: str = "usd", per_page: int = 100) -> List[Dict[str, Any]]:
    """
    Fetches live crypto prices from CoinGecko (free, no API key required).
    Returns top coins sorted by market cap.
    """
    url = "https://api.coingecko.com/api/v3/coins/markets"
    params = {
        "vs_currency": vs_currency,
        "order": "market_cap_desc",
        "per_page": per_page,
        "page": 1,
        "sparkline": True,
        "price_change_percentage": "1h,24h,7d"
    }

    try:
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        data = response.json()

        coins = []
        for coin in data:
            coins.append({
                "id": coin.get("id"),
                "symbol": coin.get("symbol", "").upper(),
                "name": coin.get("name"),
                "image": coin.get("image"),
                "current_price": coin.get("current_price"),
                "market_cap": coin.get("market_cap"),
                "market_cap_rank": coin.get("market_cap_rank"),
                "total_volume": coin.get("total_volume"),
                "price_change_24h": coin.get("price_change_24h"),
                "price_change_percentage_24h": coin.get("price_change_percentage_24h"),
                "price_change_percentage_1h": coin.get("price_change_percentage_1h_in_currency"),
                "price_change_percentage_7d": coin.get("price_change_percentage_7d_in_currency"),
                "circulating_supply": coin.get("circulating_supply"),
                "total_supply": coin.get("total_supply"),
                "ath": coin.get("ath"),
                "ath_change_percentage": coin.get("ath_change_percentage"),
                "sparkline_7d": coin.get("sparkline_in_7d", {}).get("price", []),
                "last_updated": coin.get("last_updated"),
            })
        return coins
    except Exception as e:
        print(f"CoinGecko Error: {e}")
        return []
