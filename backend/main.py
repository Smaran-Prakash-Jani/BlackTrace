"""
BlackTrace — FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.db import create_db_and_tables
from app.routes import scan, history, analytics

app = FastAPI(
    title="BlackTrace API",
    description="AI-native phishing and malicious URL intelligence platform.",
    version="1.0.0",
)

# CORS — allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(scan.router, prefix="/api", tags=["Scan"])
app.include_router(history.router, prefix="/api", tags=["History"])
app.include_router(analytics.router, prefix="/api", tags=["Analytics"])


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "BlackTrace API"}
