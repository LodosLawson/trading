
import sys
import os
from dotenv import load_dotenv

# Load env variables
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(env_path)

# Add current dir to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services import market_data

def test_apify():
    print("--- Testing Apify News Feed ---")
    key = os.getenv("APIFY_API_KEY")
    if not key:
        print("ERROR: APIFY_API_KEY not found.")
        return

    print(f"Key loaded: {key[:5]}...")
    
    print("Fetching news...")
    try:
        news = market_data.fetch_market_news(query="Crypto Bitcoin")
        print(f"Found {len(news)} items.")
        if news:
            print("First Item:")
            print(news[0])
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_apify()
