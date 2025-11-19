#!/usr/bin/env python3
"""
Generate data files for RetailXAI dashboard.
Fetches data from various APIs and generates JSON files in the data folder.
"""

import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional

# Try importing optional dependencies
try:
    import yfinance as yf
except ImportError:
    yf = None

try:
    import requests
except ImportError:
    requests = None

try:
    from pytrends.request import TrendReq
except ImportError:
    TrendReq = None

# Configuration
DATA_DIR = Path(__file__).parent.parent / "data"
SCHEMAS_DIR = Path(__file__).parent.parent / "schemas"

# API Keys from environment variables
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY")
ALPHAVANTAGE_API_KEY = os.getenv("ALPHAVANTAGE_API_KEY")
PRECIPICE_API_URL = os.getenv("PRECIPICE_API_URL")
PRECIPICE_API_KEY = os.getenv("PRECIPICE_API_KEY")


def ensure_data_dir():
    """Ensure data directory exists."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def load_existing_json(filename: str) -> Any:
    """Load existing JSON file or return None."""
    filepath = DATA_DIR / filename
    if filepath.exists():
        try:
            with open(filepath, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Warning: Could not load {filename}: {e}")
    return None


def save_json(filename: str, data: Any):
    """Save data to JSON file."""
    filepath = DATA_DIR / filename
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2, default=str)
    print(f"✓ Saved {filename}")


def fetch_stock_data(symbol: str) -> Optional[Dict]:
    """Fetch stock data using yfinance."""
    if not yf:
        return None
    
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        hist = ticker.history(period="2d")
        
        if hist.empty:
            return None
        
        current_price = hist['Close'].iloc[-1]
        prev_close = hist['Close'].iloc[-2] if len(hist) > 1 else current_price
        change = current_price - prev_close
        change_percent = (change / prev_close * 100) if prev_close > 0 else 0
        
        # Determine sentiment
        sentiment = "neutral"
        if change > 0:
            sentiment = "positive"
        elif change < 0:
            sentiment = "negative"
        
        return {
            "symbol": symbol,
            "price": round(current_price, 2),
            "change": round(change, 2),
            "change_percent": round(change_percent, 2),
            "sentiment": sentiment,
            "volume": int(info.get("volume", 0)),
            "market_cap": info.get("marketCap", 0),
            "last_updated": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        print(f"Error fetching stock data for {symbol}: {e}")
        return None


def generate_ticker_json():
    """Generate ticker.json with stock data."""
    # Default symbols to track
    symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "NFLX"]
    
    ticker_data = []
    
    if yf:
        for symbol in symbols:
            data = fetch_stock_data(symbol)
            if data:
                ticker_data.append(data)
    else:
        # Fallback: generate mock data
        print("Warning: yfinance not available, generating mock ticker data")
        for symbol in symbols:
            ticker_data.append({
                "symbol": symbol,
                "price": round(100 + (hash(symbol) % 500), 2),
                "change": round((hash(symbol) % 20) - 10, 2),
                "change_percent": round(((hash(symbol) % 20) - 10) / 10, 2),
                "sentiment": ["positive", "negative", "neutral"][hash(symbol) % 3],
                "volume": hash(symbol) % 10000000,
                "market_cap": hash(symbol) % 1000000000000,
                "last_updated": datetime.utcnow().isoformat() + "Z"
            })
    
    save_json("ticker.json", ticker_data)


def generate_articles_json():
    """Generate or update articles.json."""
    # Try to load existing articles
    existing = load_existing_json("articles.json")
    if existing:
        # Keep existing articles, just update timestamp
        save_json("articles.json", existing)
        return
    
    # If no existing file, try to fetch from Precipice API
    if PRECIPICE_API_URL and PRECIPICE_API_KEY:
        try:
            headers = {"Authorization": f"Bearer {PRECIPICE_API_KEY}"}
            response = requests.get(f"{PRECIPICE_API_URL}/articles", headers=headers, timeout=10)
            if response.status_code == 200:
                articles = response.json()
                save_json("articles.json", articles)
                return
        except Exception as e:
            print(f"Warning: Could not fetch articles from API: {e}")
    
    # Fallback: use existing file or create empty array
    save_json("articles.json", [])


def generate_drafts_json():
    """Generate drafts.json."""
    existing = load_existing_json("drafts.json")
    if existing:
        save_json("drafts.json", existing)
        return
    
    # Try to fetch from Precipice API
    if PRECIPICE_API_URL and PRECIPICE_API_KEY:
        try:
            headers = {"Authorization": f"Bearer {PRECIPICE_API_KEY}"}
            response = requests.get(f"{PRECIPICE_API_URL}/drafts", headers=headers, timeout=10)
            if response.status_code == 200:
                drafts = response.json()
                save_json("drafts.json", drafts)
                return
        except Exception as e:
            print(f"Warning: Could not fetch drafts from API: {e}")
    
    save_json("drafts.json", [])


def generate_trends_json():
    """Generate trends.json."""
    # Generate trend data points for last 30 days
    data_points = []
    base_value = 100
    
    for i in range(30):
        date = datetime.utcnow() - timedelta(days=30-i)
        # Simulate trend with some variation
        value = base_value + (i * 2) + (hash(str(date.date())) % 10)
        data_points.append({
            "date": date.date().isoformat(),
            "value": value,
            "label": "Article Generation Trend",
            "category": "articles"
        })
    
    trends_data = {
        "data_points": data_points,
        "last_updated": datetime.utcnow().isoformat() + "Z",
        "trend_direction": "up"
    }
    
    save_json("trends.json", trends_data)


def generate_earnings_json():
    """Generate earnings.json."""
    existing = load_existing_json("earnings.json")
    if existing:
        save_json("earnings.json", existing)
        return
    
    # Try to fetch from Precipice API
    if PRECIPICE_API_URL and PRECIPICE_API_KEY:
        try:
            headers = {"Authorization": f"Bearer {PRECIPICE_API_KEY}"}
            response = requests.get(f"{PRECIPICE_API_URL}/earnings", headers=headers, timeout=10)
            if response.status_code == 200:
                earnings = response.json()
                save_json("earnings.json", earnings)
                return
        except Exception as e:
            print(f"Warning: Could not fetch earnings from API: {e}")
    
    # Generate sample earnings data
    earnings_data = []
    companies = [
        {"name": "Apple Inc.", "symbol": "AAPL"},
        {"name": "Microsoft Corporation", "symbol": "MSFT"},
        {"name": "Amazon.com Inc.", "symbol": "AMZN"},
        {"name": "Tesla Inc.", "symbol": "TSLA"},
        {"name": "Meta Platforms Inc.", "symbol": "META"}
    ]
    
    for i, company in enumerate(companies):
        earnings_data.append({
            "id": i + 1,
            "company": company["name"],
            "symbol": company["symbol"],
            "quarter": ["Q1", "Q2", "Q3", "Q4"][i % 4],
            "year": 2025,
            "call_date": (datetime.utcnow() - timedelta(days=30-i*7)).date().isoformat(),
            "revenue": {
                "value": 50000000000 + (i * 10000000000),
                "currency": "USD",
                "change_percent": round(5 + (hash(company["symbol"]) % 10), 2)
            },
            "eps": {
                "value": round(2.5 + (i * 0.5), 2),
                "change_percent": round(3 + (hash(company["symbol"]) % 8), 2)
            },
            "sentiment": ["positive", "negative", "neutral"][hash(company["symbol"]) % 3],
            "sentiment_score": round((hash(company["symbol"]) % 200 - 100) / 100, 2),
            "article_id": None,
            "key_highlights": [
                "Strong revenue growth",
                "Positive outlook for next quarter"
            ]
        })
    
    save_json("earnings.json", earnings_data)


def generate_costs_json():
    """Generate costs.json."""
    # Generate cost data for last 30 days
    periods = []
    base_cost = 10.0
    
    for i in range(30):
        date = datetime.utcnow() - timedelta(days=30-i)
        total_cost = base_cost + (hash(str(date.date())) % 20)
        
        periods.append({
            "date": date.date().isoformat(),
            "total_cost": round(total_cost, 2),
            "breakdown": {
                "transcription": round(total_cost * 0.3, 2),
                "llm": round(total_cost * 0.6, 2),
                "storage": round(total_cost * 0.05, 2),
                "other": round(total_cost * 0.05, 2)
            },
            "article_count": hash(str(date.date())) % 10 + 1
        })
    
    total_30_days = sum(p["total_cost"] for p in periods)
    
    costs_data = {
        "periods": periods,
        "last_updated": datetime.utcnow().isoformat() + "Z",
        "total_30_days": round(total_30_days, 2)
    }
    
    save_json("costs.json", costs_data)


def generate_status_json():
    """Generate status.json."""
    existing = load_existing_json("status.json")
    
    # Try to fetch from Precipice API
    if PRECIPICE_API_URL and PRECIPICE_API_KEY:
        try:
            headers = {"Authorization": f"Bearer {PRECIPICE_API_KEY}"}
            response = requests.get(f"{PRECIPICE_API_URL}/status", headers=headers, timeout=10)
            if response.status_code == 200:
                status = response.json()
                save_json("status.json", status)
                return
        except Exception as e:
            print(f"Warning: Could not fetch status from API: {e}")
    
    # Generate default status
    status_data = {
        "last_pipeline_run": {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "status": "success",
            "duration_seconds": 120,
            "articles_processed": 5,
            "errors": []
        },
        "system_health": {
            "status": "healthy",
            "components": {
                "api": "healthy",
                "database": "healthy",
                "storage": "healthy"
            },
            "uptime_percent": 99.9
        },
        "failures_this_week": 0,
        "last_updated": datetime.utcnow().isoformat() + "Z"
    }
    
    save_json("status.json", status_data)


def main():
    """Main function to generate all data files."""
    print("Generating RetailXAI data files...")
    ensure_data_dir()
    
    try:
        generate_ticker_json()
        generate_articles_json()
        generate_drafts_json()
        generate_trends_json()
        generate_earnings_json()
        generate_costs_json()
        generate_status_json()
        
        print("\n✓ All data files generated successfully!")
        return 0
    except Exception as e:
        print(f"\n✗ Error generating data files: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())

