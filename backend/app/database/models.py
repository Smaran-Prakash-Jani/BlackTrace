"""
Database models for BlackTrace.
Using SQLModel (SQLAlchemy + Pydantic hybrid) for clean typed models.
"""
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field
import json


class ScanRecord(SQLModel, table=True):
    """Persisted scan result record."""
    __tablename__ = "scan_records"

    id: Optional[int] = Field(default=None, primary_key=True)
    url: str = Field(index=True)
    domain: str = Field(default="")
    risk_score: int = Field(default=0)
    risk_level: str = Field(default="UNKNOWN")  # SAFE | LOW_RISK | SUSPICIOUS | HIGH_RISK | MALICIOUS | CRITICAL
    summary: str = Field(default="")
    indicators_json: str = Field(default="[]")   # serialized list of indicator dicts
    domain_info_json: str = Field(default="{}")  # serialized domain metadata
    redirects_json: str = Field(default="[]")    # serialized redirect chain
    threat_intel_json: str = Field(default="{}")  # serialized threat intel results
    scanned_at: datetime = Field(default_factory=datetime.utcnow)

    def get_indicators(self) -> list:
        try:
            return json.loads(self.indicators_json)
        except Exception:
            return []

    def get_domain_info(self) -> dict:
        try:
            return json.loads(self.domain_info_json)
        except Exception:
            return {}

    def get_redirects(self) -> list:
        try:
            return json.loads(self.redirects_json)
        except Exception:
            return []

    def get_threat_intel(self) -> dict:
        try:
            return json.loads(self.threat_intel_json)
        except Exception:
            return {}
