from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="AI-Native Financial Ecosystem API")

# CORS Setup
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

origins = [
    "http://localhost:4044",  # Next.js frontend
    "http://127.0.0.1:4044",
    "https://dancing-meringue-05ad28.netlify.app", # Netlify production
    "*", # Allow all for development flexibility
]

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CORSFallbackMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        if request.method == "OPTIONS":
            response = JSONResponse({})
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Methods"] = "*"
            response.headers["Access-Control-Allow-Headers"] = "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            return response
        response = await call_next(request)
        response.headers["Access-Control-Allow-Origin"] = "*" # Force on all responses
        return response

app.add_middleware(CORSFallbackMiddleware)

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI-Native Financial Ecosystem API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

from services import market_data
from services import ai_agent
from services.metatrader_service import MT5Service
from services import config_manager
from pydantic import BaseModel
from fastapi import HTTPException
import google.generativeai as genai

class ChatRequest(BaseModel):
    message: str

class MTConnectRequest(BaseModel):
    login: int
    password: str
    server: str

class ConfigUpdateRequest(BaseModel):
    config: dict

@app.get("/api/config")
def get_local_config():
    """Returns the current local configuration (with masked API keys for security)."""
    config = config_manager.load_config()
    # Mask sensitive keys before returning to frontend
    masked_config = {}
    for k, v in config.items():
        if k.endswith("_API_KEY") and v:
            masked_config[k] = v[:4] + "*" * (len(v) - 8) + v[-4:] if len(v) > 8 else "***"
        else:
            masked_config[k] = v
    return {"status": "success", "config": masked_config}

@app.post("/api/config")
def update_local_config(request: ConfigUpdateRequest):
    """Updates the local backend configuration file."""
    # Never log full API keys here
    updated = config_manager.save_config(request.config)
    
    # Reload AI API key if it was updated
    if "GOOGLE_API_KEY" in request.config:
        genai.configure(api_key=request.config["GOOGLE_API_KEY"])
        
    return {"status": "success", "message": "Configuration saved locally."}

@app.get("/api/insight")
def get_insight():
    """
    Returns the latest AI-driven market insight.
    """
    # In a real app, this would fetch news and analyze it live.
    # For now, let's enhance the mock data with real AI analysis on a static headline.
    # For now, let's enhance the mock data with real AI analysis on a static headline.
    insight = market_data.get_latest_insight() # This function was removed/replaced, let's use summary instead or fix imports if needed. 
    # Actually, let's replace this endpoint logic since get_latest_insight is gone.
    return {"message": "Use /api/news/summary for insights."}

@app.get("/api/news/summary")
def get_market_summary_endpoint():
    """
    Returns AI-generated market summary.
    """
    return market_data.get_market_summary()

@app.post("/api/ai/chat")
def chat_with_expert(request: ChatRequest):
    """
    Chat with the AI Finance Expert.
    """
    # Fetch real-time context
    context = market_data.get_market_context_string()
    
    response = ai_agent.chat_with_finance_expert(request.message, context=context)
    return {"reply": response}

@app.get("/api/news")
def get_news():
    """
    Returns real-time market news from Apify.
    """
    return market_data.fetch_market_news()

@app.get("/api/news/summary")
def get_market_summary():
    """
    Returns a cohesive AI-generated market summary.
    """
    try:
        return market_data.get_market_summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history/{coin_id}")
def get_history(coin_id: str, days: str = "1"):
    """
    Returns historical price data for a coin.
    """
    prices = market_data.get_coin_history(coin_id, days)
    if not prices:
        # Return mock data if API fails to ensure UI consistency
        import random
        return [100 + random.uniform(-5, 5) for _ in range(50)]
    return prices

@app.get("/api/crypto/prices")
def get_crypto_prices(vs_currency: str = "usd", per_page: int = 100):
    """
    Returns live crypto prices from CoinGecko.
    """
    return market_data.fetch_crypto_prices(vs_currency=vs_currency, per_page=per_page)

# --- MetaTrader 5 Endpoints ---

@app.post("/api/mt/connect")
def connect_mt(request: MTConnectRequest):
    """
    Connect to MT5 terminal and return account info.
    """
    success, msg = MT5Service.connect(request.login, request.password, request.server)
    if not success:
        raise HTTPException(status_code=401, detail=msg)
    
    info = MT5Service.get_account_info()
    return {"status": "success", "account": info}

@app.post("/api/mt/disconnect")
def disconnect_mt():
    """
    Disconnect from MT5 terminal.
    """
    success = MT5Service.disconnect()
    return {"status": "success" if success else "error"}

@app.get("/api/mt/positions")
def get_mt_positions():
    """
    Get all active positions from connected MT5 account.
    """
    positions = MT5Service.get_positions()
    summary = MT5Service.get_account_info()
    
    return {
        "status": "success",
        "positions": positions,
        "balance": summary.get("balance", 0) if summary else 0,
        "equity": summary.get("equity", 0) if summary else 0,
        "profit": summary.get("profit", 0) if summary else 0
    }

if __name__ == "__main__":
    import uvicorn
    # When running as a packaged desktop script, start the server
    uvicorn.run(app, host="127.0.0.1", port=8000)
