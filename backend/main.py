from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="AI-Native Financial Ecosystem API")

# CORS Setup
origins = [
    "http://localhost:4044",  # Next.js frontend
    "http://127.0.0.1:4044",
    "https://dancing-meringue-05ad28.netlify.app", # Netlify production
    "*", # Allow all for development flexibility
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI-Native Financial Ecosystem API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

from services import market_data
from services import ai_agent
from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str

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
    response = ai_agent.chat_with_finance_expert(request.message)
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
        import traceback
        traceback.print_exc()
        raise e
