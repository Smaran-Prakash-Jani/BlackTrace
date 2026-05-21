"""
Scan API Route.
POST /api/scan — runs the full threat analysis pipeline.
GET  /api/scan/{scan_id} — retrieve a specific scan by ID.
"""
import json
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, validator
from sqlmodel import Session

from app.scanners.risk_engine import run_full_scan
from app.ai.explainer import generate_explanation
from app.database.db import get_session
from app.database.models import ScanRecord

router = APIRouter()


class ScanRequest(BaseModel):
    url: str

    @validator("url")
    def validate_url(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("URL cannot be empty")
        if len(v) > 2048:
            raise ValueError("URL is too long (max 2048 characters)")
        return v


@router.post("/scan")
async def scan_url(request: ScanRequest, session: Session = Depends(get_session)):
    """
    Run full threat analysis on the submitted URL.
    Orchestrates all analyzers, generates explanation, persists result.
    """
    try:
        # Run analysis pipeline
        result = await run_full_scan(request.url)

        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        # Generate AI explanation
        explanation = generate_explanation(result)
        result["explanation"] = explanation

        # Persist to database
        record = ScanRecord(
            url=result["url"],
            domain=result.get("domain", ""),
            risk_score=result["risk_score"],
            risk_level=result["risk_level"],
            summary=explanation["summary"],
            indicators_json=json.dumps(result["indicators"]),
            domain_info_json=json.dumps(result["domain_info"]),
            redirects_json=json.dumps(result["redirect_chain"]),
            threat_intel_json=json.dumps(result["threat_intel"]),
            scanned_at=datetime.utcnow(),
        )
        session.add(record)
        session.commit()
        session.refresh(record)

        result["scan_id"] = record.id
        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")


@router.get("/scan/{scan_id}")
def get_scan(scan_id: int, session: Session = Depends(get_session)):
    """Retrieve a previously completed scan by ID."""
    record = session.get(ScanRecord, scan_id)
    if not record:
        raise HTTPException(status_code=404, detail="Scan not found")

    return {
        "scan_id": record.id,
        "url": record.url,
        "domain": record.domain,
        "risk_score": record.risk_score,
        "risk_level": record.risk_level,
        "summary": record.summary,
        "indicators": record.get_indicators(),
        "domain_info": record.get_domain_info(),
        "redirect_chain": record.get_redirects(),
        "threat_intel": record.get_threat_intel(),
        "scanned_at": record.scanned_at.isoformat(),
    }
