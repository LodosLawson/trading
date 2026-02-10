import google.generativeai as genai
import os
import json
from typing import Dict, Any, List

# Configure API
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Model Configuration
GENERATION_CONFIG = {
    "temperature": 0.4, # Lower temperature for analytical precision
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
}

# The Persona Prompt
FINANCE_EXPERT_SYSTEM_INSTRUCTION = """
You are an advanced AI Financial Expert and Proprietary Trader named 'MarketMind'.
Your capabilities include deep technical analysis, quantitative modeling, and behavioral finance analysis.

Your Core Directives:
1.  **Analyze with Precision:** When given market data or news, do not just summarize. dissect it. Look for second and third-order effects.
2.  **Think in Probabilities:** Trading is about risk/reward. valid setups have clear entry, invalidation (stop loss), and target levels.
3.  **Identify Algorithms:** comment on potential algorithmic price action (e.g., liquidity sweeps, stop runs, inefficiencies).
4.  **Behavioral Analysis:** Identify market sentiment (Fear/Greed) and potential traps (Bull/Bear traps).
5.  **Output Impact:** Always provide a 'Sentiment Score' (-10 to +10) and a 'Conviction Level' (Low, Medium, High).

Tone:
- Professional, concise, and objective.
- Use distinct financial terminology correctly (e.g., 'mean reversion', 'delta neutral', 'gamma squeeze').
- Do not hedge your language excessively; be decisive based on the data provided.
"""

model = genai.GenerativeModel(
    model_name="gemini-2.0-flash", # Using a capable model
    generation_config=GENERATION_CONFIG,
    system_instruction=FINANCE_EXPERT_SYSTEM_INSTRUCTION
)

def analyze_market_news(headline: str, context: str = "") -> Dict[str, Any]:
    """
    Analyzes a specific news headline using the Finance Expert persona.
    Returns structured JSON-like data (parsed from text).
    """
    prompt = f"""
    Analyze the following news headline for a trader:
    Headline: "{headline}"
    Context: {context}

    Output valid JSON only with the following key-value pairs:
    - "impact_score": (number between -10 and +10)
    - "reasoning": (concise explanation of the score, max 2 sentences)
    - "affected_assets": (list of strings, e.g., ["BTC", "ETH"])
    - "chain_reaction": (list of strings describing 2nd order effects)
    - "trade_suggestion": (short actionable advice)
    """
    
    try:
        response = model.generate_content(prompt)
        # Simple cleanup to ensure we get dictionary-like structure
        # In production, use structured output or Pydantic parsers
        import json
        text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(text)
    except Exception as e:
        print(f"AI Error: {e}")
        return {
            "impact_score": 0,
            "reasoning": "AI Analysis Failed",
            "affected_assets": [],
            "chain_reaction": [],
            "trade_suggestion": "Monitor manually."
        }

chat_session = model.start_chat(history=[])

def chat_with_finance_expert(user_message: str) -> str:
    """
    Interactive chat function for the user to talk to the Finance Expert.
    """
    try:
        response = chat_session.send_message(user_message)
        return response.text
    except Exception as e:
        return f"System Error: {e}"

def generate_market_summary(headlines: List[str]) -> Dict[str, Any]:
    """
    Synthesizes a list of headlines into a cohesive market summary.
    """
    if not headlines:
        return {"sentiment": "Neutral", "takeaways": [], "signal": "Wait"}

    prompt = f"""
    As 'MarketMind', analyze these recent headlines and provide a market summary:
    Headlines: {json.dumps(headlines)}

    Output valid JSON:
    - "sentiment": "Bullish" | "Bearish" | "Neutral" | "Volatile"
    - "signal": "Buy Dip" | "Sell Rallies" | "Hold" | "Wait"
    - "takeaways": (List of 3 short, punchy bullet points summarizing the key market drivers)
    """
    
    try:
        response = model.generate_content(prompt)
        text = response.text.replace("```json", "").replace("```", "").strip()
        import json
        return json.loads(text)
    except Exception as e:
        print(f"AI Summary Error: {e}")
        return {
            "sentiment": "Unknown",
            "signal": "Caution",
            "takeaways": ["Insufficient data for summary."]
        }
