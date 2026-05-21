"""
Analytics API Route.
GET /api/analytics — aggregated stats for the dashboard.
"""
from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func, col
from collections import defaultdict
from app.database.db import get_session
from app.database.models import ScanRecord
from datetime import datetime, timedelta

router = APIRouter()


@router.get("/analytics")
def get_analytics(session: Session = Depends(get_session)):
    """Return dashboard analytics: counts, risk distribution, daily activity."""
    all_scans = session.exec(select(ScanRecord)).all()

    total = len(all_scans)
    if total == 0:
        return {
            "total_scans": 0,
            "risk_distribution": {},
            "daily_activity": [],
            "average_score": 0,
            "threat_rate": 0,
        }

    # Risk level distribution
    risk_dist: dict[str, int] = defaultdict(int)
    for scan in all_scans:
        risk_dist[scan.risk_level] += 1

    # Threat rate (suspicious or worse)
    threat_levels = {"SUSPICIOUS", "HIGH_RISK", "MALICIOUS", "CRITICAL"}
    threats = sum(1 for s in all_scans if s.risk_level in threat_levels)
    threat_rate = round((threats / total) * 100, 1) if total else 0

    # Average score
    avg_score = round(sum(s.risk_score for s in all_scans) / total, 1)

    # Daily activity for last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    daily: dict[str, dict] = defaultdict(lambda: {"date": "", "total": 0, "threats": 0})

    for scan in all_scans:
        if scan.scanned_at >= thirty_days_ago:
            day = scan.scanned_at.strftime("%Y-%m-%d")
            daily[day]["date"] = day
            daily[day]["total"] += 1
            if scan.risk_level in threat_levels:
                daily[day]["threats"] += 1

    daily_list = sorted(daily.values(), key=lambda x: x["date"])

    return {
        "total_scans": total,
        "risk_distribution": dict(risk_dist),
        "daily_activity": daily_list,
        "average_score": avg_score,
        "threat_rate": threat_rate,
        "safe_count": risk_dist.get("SAFE", 0),
        "low_risk_count": risk_dist.get("LOW_RISK", 0),
        "suspicious_count": risk_dist.get("SUSPICIOUS", 0),
        "high_risk_count": risk_dist.get("HIGH_RISK", 0),
        "malicious_count": risk_dist.get("MALICIOUS", 0),
        "critical_count": risk_dist.get("CRITICAL", 0),
    }
