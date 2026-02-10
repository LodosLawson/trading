
import sys
import os
from dotenv import load_dotenv

# Ensure .env is loaded BEFORE importing ai_agent which uses the key at module level
# Assuming we are running this from the root or backend, let's find the .env
# If running from backend/test_ai_agent.py, .env is in the same dir.
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(env_path)

# Add the current directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services import ai_agent

def test_ai_trader():
    print("--- Testing AI Financial Trader Persona ---")
    
    # Check if key is loaded
    key = os.getenv("GOOGLE_API_KEY")
    if not key:
        print("ERROR: GOOGLE_API_KEY not found in environment.")
        return
    else:
        print(f"Key loaded: {key[:5]}...{key[-5:]}")
    
    # Test 1: Simple Chat
    print("\n[Test 1] Chat Interaction:")
    query = "I see a bullish divergence on the RSI for BTC, but volume is declining. What's your take?"
    print(f"User: {query}")
    try:
        response = ai_agent.chat_with_finance_expert(query)
        print(f"AI Response:\n{response}")
    except Exception as e:
        print(f"Error: {e}")

    # Test 2: Market News Analysis
    print("\n[Test 2] News Analysis:")
    headline = "Federal Reserve announces surprise 50bps rate cut amidst rising inflation concerns."
    print(f"Headline: {headline}")
    try:
        analysis = ai_agent.analyze_market_news(headline)
        import json
        print(f"AI Analysis:\n{json.dumps(analysis, indent=2)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_ai_trader()
