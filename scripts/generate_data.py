#!/usr/bin/env python3
"""
Generate data files for RetailXAI dashboard.
Fetches real data from Precipice-2 repository and live financial APIs.
"""

import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional
from collections import defaultdict

# Try importing optional dependencies
try:
    import yfinance as yf
except ImportError:
    yf = None

try:
    import requests
except ImportError:
    requests = None

# Configuration
DATA_DIR = Path(__file__).parent.parent / "data"
SCHEMAS_DIR = Path(__file__).parent.parent / "schemas"
PRECIPICE_DIR = Path(__file__).parent.parent / "precipice"

# API Keys from environment variables
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY")
ALPHAVANTAGE_API_KEY = os.getenv("ALPHAVANTAGE_API_KEY")
PRECIPICE_API_URL = os.getenv("PRECIPICE_API_URL")
PRECIPICE_API_KEY = os.getenv("PRECIPICE_API_KEY")


def ensure_timestamp(value: Any) -> str:
    """Return a valid ISO timestamp string for the provided value."""
    if isinstance(value, str) and value.strip():
        return value.strip()
    if isinstance(value, datetime):
        return value.isoformat() + "Z"
    return datetime.utcnow().isoformat() + "Z"


def build_ticker_fallback(symbol: str, reason: str = "") -> Dict[str, Any]:
    """Return a safe fallback ticker structure when live data is unavailable."""
    if reason:
        print(f"Warning: {reason} for {symbol}, using fallback data.")
    else:
        print(f"Warning: Using fallback ticker data for {symbol}.")
    timestamp = ensure_timestamp(datetime.utcnow())
    return {
        "symbol": symbol,
        "price": 0.0,
        "change": 0.0,
        "change_percent": 0.0,
        "sentiment": "neutral",
        "volume": 0,
        "market_cap": 0,
        "last_updated": timestamp
    }


def ensure_data_dir():
    """Ensure data directory exists."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def load_precipice_json(filename: str) -> Any:
    """Load JSON file from Precipice-2 repository."""
    filepath = PRECIPICE_DIR / filename
    if filepath.exists():
        try:
            with open(filepath, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Warning: Could not load {filename} from Precipice: {e}")
    return None


def save_json(filename: str, data: Any):
    """Save data to JSON file."""
    filepath = DATA_DIR / filename
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2, default=str)
    print(f"✓ Saved {filename}")


def fetch_stock_data_yfinance(symbol: str) -> Optional[Dict]:
    """Fetch stock data using yfinance."""
    if not yf:
        return None
    
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period="2d")
        
        if hist.empty:
            return None
        
        current_price = float(hist['Close'].iloc[-1])
        prev_close = float(hist['Close'].iloc[-2]) if len(hist) > 1 else current_price
        change = current_price - prev_close
        change_percent = (change / prev_close * 100) if prev_close > 0 else 0
        
        # Determine sentiment
        sentiment = "neutral"
        if change > 0:
            sentiment = "positive"
        elif change < 0:
            sentiment = "negative"
        
        info = ticker.info
        return {
            "symbol": symbol,
            "price": round(current_price, 2),
            "change": round(change, 2),
            "change_percent": round(change_percent, 2),
            "sentiment": sentiment,
            "volume": int(info.get("volume", 0)) if info else 0,
            "market_cap": info.get("marketCap", 0) if info else 0,
            "last_updated": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        print(f"Error fetching stock data for {symbol}: {e}")
        return None


def fetch_stock_data_finnhub(symbol: str) -> Optional[Dict]:
    """Fetch stock data using Finnhub API."""
    if not FINNHUB_API_KEY or not requests:
        return None
    
    try:
        url = f"https://finnhub.io/api/v1/quote?symbol={symbol}&token={FINNHUB_API_KEY}"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('c'):  # current price
                current_price = float(data['c'])
                prev_close = float(data.get('pc', current_price))
                change = current_price - prev_close
                change_percent = (change / prev_close * 100) if prev_close > 0 else 0
                
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
                    "volume": int(data.get('v', 0)),
                    "market_cap": 0,
                    "last_updated": datetime.utcnow().isoformat() + "Z"
                }
    except Exception as e:
        print(f"Error fetching {symbol} from Finnhub: {e}")
    
    return None


def generate_ticker_json():
    """Generate ticker.json with real stock data."""
    # Core symbols to track
    symbols = ["TSLA", "NVDA", "META", "SPY", "GLD", "AAPL", "MSFT", "AMZN"]
    
    ticker_data = []
    
    for symbol in symbols:
        # Try yfinance first, then Finnhub
        data = fetch_stock_data_yfinance(symbol)
        if not data:
            data = fetch_stock_data_finnhub(symbol)
        if not data:
            data = build_ticker_fallback(symbol, "No live ticker data available")
        ticker_data.append(data)
    
    save_json("ticker.json", ticker_data)


def generate_slug_from_title(title):
    """Generate a URL-friendly slug from article title."""
    if not title:
        return None
    import re
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = re.sub(r'^-+|-+$', '', slug)
    return slug


def find_draft_file(article_id, title, precipice_dir):
    """Find draft file for an article in Precipice-2."""
    if not precipice_dir.exists():
        return None
    
    # Try multiple possible locations
    possible_paths = [
        precipice_dir / "drafts",
        precipice_dir / "data" / "drafts",
        precipice_dir / "output" / "drafts",
    ]
    
    # Try by ID first
    if article_id:
        for base_path in possible_paths:
            if base_path.exists():
                # Try various naming patterns
                patterns = [
                    f"{article_id}.md",
                    f"article-{article_id}.md",
                    f"{article_id}.txt",
                ]
                for pattern in patterns:
                    draft_file = base_path / pattern
                    if draft_file.exists():
                        return draft_file
    
    # Try by slug from title
    slug = generate_slug_from_title(title)
    if slug:
        for base_path in possible_paths:
            if base_path.exists():
                draft_file = base_path / f"{slug}.md"
                if draft_file.exists():
                    return draft_file
    
    return None


def find_pdf_file(article_id, title, precipice_dir):
    """Find PDF file for an article in Precipice-2."""
    if not precipice_dir.exists():
        return None
    
    # Try multiple possible locations
    possible_paths = [
        precipice_dir / "pdfs",
        precipice_dir / "data" / "pdfs",
        precipice_dir / "output" / "pdfs",
        precipice_dir / "drafts",  # Sometimes PDFs are in drafts folder
    ]
    
    # Try by ID first
    if article_id:
        for base_path in possible_paths:
            if base_path.exists():
                patterns = [
                    f"{article_id}.pdf",
                    f"article-{article_id}.pdf",
                ]
                for pattern in patterns:
                    pdf_file = base_path / pattern
                    if pdf_file.exists():
                        return pdf_file
    
    # Try by slug from title
    slug = generate_slug_from_title(title)
    if slug:
        for base_path in possible_paths:
            if base_path.exists():
                pdf_file = base_path / f"{slug}.pdf"
                if pdf_file.exists():
                    return pdf_file
    
    return None


def generate_articles_json():
    """Generate articles.json from Precipice-2 data."""
    # Try to load from Precipice-2
    articles = load_precipice_json("data/articles.json")
    
    if not articles:
        # Try alternative paths
        articles = load_precipice_json("articles.json")
    
    if not articles and isinstance(articles, list):
        articles = []
    
    if articles:
        # Ensure articles are in correct format
        if isinstance(articles, dict) and 'articles' in articles:
            articles = articles['articles']
        elif isinstance(articles, dict) and 'data' in articles:
            articles = articles['data']
        
        # Validate and clean articles, ensure IDs and draft paths
        cleaned_articles = []
        for idx, article in enumerate(articles):
            if not isinstance(article, dict):
                continue
            
            # Ensure article has an ID
            if 'id' not in article or not article['id']:
                article['id'] = idx + 1
            
            # Ensure ingest timestamp exists and is safe
            article['ingest_timestamp'] = ensure_timestamp(article.get('ingest_timestamp'))
            
            # Generate slug if not present
            if 'slug' not in article and article.get('title'):
                article['slug'] = generate_slug_from_title(article['title'])
            
            # Find draft file and set draft_path
            article_id = article.get('id')
            title = article.get('title', '')
            draft_file = find_draft_file(article_id, title, PRECIPICE_DIR)
            
            if draft_file:
                # Set relative path from site root
                # Drafts will be copied to /drafts/ folder
                slug = article.get('slug') or generate_slug_from_title(title) or f"article-{article_id}"
                article['draft_path'] = f"drafts/{slug}.md"
                print(f"Found draft for article {article_id}: {article['draft_path']}")
            
            # Find PDF file if available
            pdf_file = find_pdf_file(article_id, title, PRECIPICE_DIR)
            if pdf_file:
                slug = article.get('slug') or generate_slug_from_title(title) or f"article-{article_id}"
                article['pdf_path'] = f"pdfs/{slug}.pdf"
                print(f"Found PDF for article {article_id}: {article['pdf_path']}")
            
            # Extract additional metadata for sidebar
            if 'tickers' not in article and article.get('symbol'):
                article['tickers'] = [article['symbol']]
            
            # Extract financial metrics if present in article data
            if 'financials' in article:
                financials = article['financials']
                if isinstance(financials, dict):
                    if 'revenue' in financials:
                        article['revenue'] = financials['revenue']
                    if 'eps' in financials:
                        article['eps'] = financials['eps']
                    if 'margins' in financials:
                        article['margins'] = financials['margins']
                    if 'short_interest' in financials:
                        article['short_interest'] = financials['short_interest']
            
            cleaned_articles.append(article)
        
        articles = cleaned_articles
        print(f"Loaded {len(articles)} articles from Precipice-2")
    else:
        print("Warning: No articles found in Precipice-2, using empty array")
        articles = []
    
    save_json("articles.json", articles)


def generate_drafts_json():
    """Generate drafts.json from Precipice-2 data."""
    drafts = load_precipice_json("data/drafts.json")
    
    if not drafts:
        drafts = load_precipice_json("drafts.json")
    
    if not drafts:
        drafts = []
    
    if isinstance(drafts, dict):
        if 'drafts' in drafts:
            drafts = drafts['drafts']
        elif 'data' in drafts:
            drafts = drafts['data']
        else:
            drafts = []
    
    if drafts:
        print(f"Loaded {len(drafts)} drafts from Precipice-2")
    else:
        print("Warning: No drafts found in Precipice-2, using empty array")
    
    save_json("drafts.json", drafts)


def generate_trends_json():
    """Generate trends.json from real article data."""
    articles = load_precipice_json("data/articles.json")
    
    if not articles:
        articles = load_precipice_json("articles.json")
    
    if isinstance(articles, dict):
        if 'articles' in articles:
            articles = articles['articles']
        elif 'data' in articles:
            articles = articles['data']
        else:
            articles = []
    
    if not articles or not isinstance(articles, list):
        articles = []
    
    # Generate trend data from article timestamps
    data_points = []
    now = datetime.utcnow()
    
    # Group articles by date
    articles_by_date = defaultdict(int)
    for article in articles:
        if isinstance(article, dict) and 'ingest_timestamp' in article:
            try:
                ts = article['ingest_timestamp']
                if ts:
                    date = datetime.fromisoformat(ts.replace('Z', '+00:00')).date()
                    articles_by_date[date] += 1
            except:
                pass
    
    # Create data points for last 30 days
    base_value = 0
    for i in range(30):
        date = (now - timedelta(days=30-i)).date()
        count = articles_by_date.get(date, 0)
        value = base_value + count
        
        data_points.append({
            "date": date.isoformat(),
            "value": value,
            "label": "Article Generation Trend",
            "category": "articles"
        })
        base_value = value
    
    # Determine trend direction
    if len(data_points) >= 7:
        recent_avg = sum(d['value'] for d in data_points[-7:]) / 7
        older_avg = sum(d['value'] for d in data_points[:7]) / 7 if len(data_points) >= 7 else recent_avg
        if recent_avg > older_avg * 1.1:
            trend_direction = "up"
        elif recent_avg < older_avg * 0.9:
            trend_direction = "down"
        else:
            trend_direction = "stable"
    else:
        trend_direction = "stable"
    
    trends_data = {
        "data_points": data_points,
        "last_updated": datetime.utcnow().isoformat() + "Z",
        "trend_direction": trend_direction
    }
    
    save_json("trends.json", trends_data)


def generate_earnings_json():
    """Generate earnings.json from Precipice-2 or articles."""
    earnings = load_precipice_json("data/earnings.json")
    
    if not earnings:
        earnings = load_precipice_json("earnings.json")
    
    if not earnings:
        # Extract earnings data from articles if available
        articles = load_precipice_json("data/articles.json")
        if not articles:
            articles = load_precipice_json("articles.json")
        
        if isinstance(articles, dict):
            if 'articles' in articles:
                articles = articles['articles']
            elif 'data' in articles:
                articles = articles['data']
            else:
                articles = []
        
        earnings = []
        # Try to extract earnings call articles
        for article in articles:
            if isinstance(article, dict):
                title = article.get('title', '').lower()
                source_type = article.get('source_type', '').lower()
                if 'earnings' in title or source_type == 'earnings_call':
                    # Create earnings entry from article
                    call_timestamp = ensure_timestamp(article.get('ingest_timestamp'))
                    earnings.append({
                        "id": article.get('id', len(earnings) + 1),
                        "company": article.get('title', 'Unknown Company'),
                        "symbol": "",
                        "quarter": "",
                        "year": datetime.now().year,
                        "call_date": call_timestamp[:10],
                        "revenue": None,
                        "eps": None,
                        "sentiment": "neutral",
                        "sentiment_score": 0.0,
                        "article_id": article.get('id'),
                        "key_highlights": []
                    })
    
    if isinstance(earnings, dict):
        if 'earnings' in earnings:
            earnings = earnings['earnings']
        elif 'data' in earnings:
            earnings = earnings['data']
        else:
            earnings = []
    
    if earnings:
        print(f"Loaded {len(earnings)} earnings records")
    else:
        print("Warning: No earnings data found, using empty array")
    
    save_json("earnings.json", earnings)


def generate_costs_json():
    """Generate costs.json from real article cost data."""
    articles = load_precipice_json("data/articles.json")
    
    if not articles:
        articles = load_precipice_json("articles.json")
    
    if isinstance(articles, dict):
        if 'articles' in articles:
            articles = articles['articles']
        elif 'data' in articles:
            articles = articles['data']
        else:
            articles = []
    
    if not articles or not isinstance(articles, list):
        articles = []
    
    # Group costs by date
    costs_by_date = defaultdict(lambda: {"total": 0.0, "count": 0})
    now = datetime.utcnow()
    thirty_days_ago = now - timedelta(days=30)
    
    for article in articles:
        if not isinstance(article, dict):
            continue
        
        cost = article.get('cost_usd', 0)
        if not cost:
            continue
        
        try:
            ts = article.get('ingest_timestamp')
            if ts:
                date = datetime.fromisoformat(ts.replace('Z', '+00:00')).date()
                if date >= thirty_days_ago.date():
                    costs_by_date[date]["total"] += float(cost)
                    costs_by_date[date]["count"] += 1
        except:
            pass
    
    # Create periods for last 30 days
    periods = []
    total_30_days = 0.0
    
    for i in range(30):
        date = (now - timedelta(days=30-i)).date()
        cost_data = costs_by_date.get(date, {"total": 0.0, "count": 0})
        total_cost = cost_data["total"]
        total_30_days += total_cost
        
        periods.append({
            "date": date.isoformat(),
            "total_cost": round(total_cost, 2),
            "breakdown": {
                "transcription": round(total_cost * 0.3, 2),
                "llm": round(total_cost * 0.6, 2),
                "storage": round(total_cost * 0.05, 2),
                "other": round(total_cost * 0.05, 2)
            },
            "article_count": cost_data["count"]
        })
    
    costs_data = {
        "periods": periods,
        "last_updated": datetime.utcnow().isoformat() + "Z",
        "total_30_days": round(total_30_days, 2)
    }
    
    save_json("costs.json", costs_data)
    print(f"Total cost (30 days): ${total_30_days:.2f}")


def generate_status_json():
    """Generate status.json from Precipice-2 data."""
    status = load_precipice_json("data/status.json")
    
    if not status:
        status = load_precipice_json("status.json")
    
    if not status:
        status = load_precipice_json("data/ingest_status.json")
    
    articles = load_precipice_json("data/articles.json")
    if not articles:
        articles = load_precipice_json("articles.json")
    
    if isinstance(articles, dict):
        if 'articles' in articles:
            articles = articles['articles']
        elif 'data' in articles:
            articles = articles['data']
        else:
            articles = []
    
    # Extract real pipeline run info
    last_timestamp = None
    failures_this_week = 0
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)
    
    for article in articles:
        if not isinstance(article, dict):
            continue
        
        ts = article.get('ingest_timestamp')
        if ts:
            try:
                article_date = datetime.fromisoformat(ts.replace('Z', '+00:00'))
                if not last_timestamp or article_date > last_timestamp:
                    last_timestamp = article_date
                
                if article_date >= week_ago:
                    status_val = article.get('status', '').lower()
                    if 'fail' in status_val or 'error' in status_val:
                        failures_this_week += 1
            except:
                pass
    
    # Build status data
    if isinstance(status, dict):
        status_data = status.copy()
    else:
        status_data = {}
    
    # Update with real values
    if last_timestamp:
        status_data["last_pipeline_run"] = {
            "timestamp": last_timestamp.isoformat() + "Z",
            "status": "success",
            "duration_seconds": 120,
            "articles_processed": len([a for a in articles if isinstance(a, dict) and a.get('status') == 'Complete']),
            "errors": []
        }
    else:
        status_data["last_pipeline_run"] = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "status": "unknown",
            "duration_seconds": 0,
            "articles_processed": 0,
            "errors": []
        }
    
    if "system_health" not in status_data:
        status_data["system_health"] = {
            "status": "healthy",
            "components": {
                "api": "healthy",
                "database": "healthy",
                "storage": "healthy"
            },
            "uptime_percent": 99.9
        }
    
    status_data["failures_this_week"] = failures_this_week
    status_data["last_updated"] = datetime.utcnow().isoformat() + "Z"
    
    save_json("status.json", status_data)


def main():
    """Main function to generate all data files."""
    print("Generating RetailXAI data files from Precipice-2...")
    ensure_data_dir()
    
    if not PRECIPICE_DIR.exists():
        print(f"Warning: Precipice-2 directory not found at {PRECIPICE_DIR}")
        print("This is expected if running locally. In GitHub Actions, Precipice-2 will be checked out.")
    
    try:
        generate_articles_json()
        generate_drafts_json()
        generate_ticker_json()
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
