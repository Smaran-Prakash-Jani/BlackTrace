"""
History API Route.
GET /api/history — paginated scan history with search and filter.
DELETE /api/history/{scan_id} — delete a scan record.
"""
from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select, col
from typing import Optional
from app.database.db import get_session
from app.database.models import ScanRecord

router = APIRouter()


@router.get("/history")
def get_history(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    search: Optional[str] = Query(default=None),
    risk_level: Optional[str] = Query(default=None),
    session: Session = Depends(get_session),
):
    """
    Return paginated scan history.
    Supports search by URL/domain and filtering by risk level.
    """
    query = select(ScanRecord).order_by(col(ScanRecord.scanned_at).desc())

    if search:
        search_lower = f"%{search.lower()}%"
        query = query.where(
            col(ScanRecord.url).ilike(search_lower) |
            col(ScanRecord.domain).ilike(search_lower)
        )

    if risk_level:
        query = query.where(col(ScanRecord.risk_level) == risk_level.upper())

    # Count total for pagination
    all_records = session.exec(query).all()
    total = len(all_records)

    # Apply pagination
    offset = (page - 1) * limit
    paginated = all_records[offset: offset + limit]

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit,
        "items": [
            {
                "scan_id": r.id,
                "url": r.url,
                "domain": r.domain,
                "risk_score": r.risk_score,
                "risk_level": r.risk_level,
                "summary": r.summary,
                "scanned_at": r.scanned_at.isoformat(),
            }
            for r in paginated
        ],
    }


@router.delete("/history/{scan_id}")
def delete_scan(scan_id: int, session: Session = Depends(get_session)):
    """Delete a scan record by ID."""
    record = session.get(ScanRecord, scan_id)
    if not record:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Scan not found")
    session.delete(record)
    session.commit()
    return {"deleted": True, "scan_id": scan_id}
