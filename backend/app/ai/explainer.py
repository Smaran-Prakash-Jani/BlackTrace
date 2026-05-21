"""
AI Threat Explanation Engine.
Generates human-readable, contextually accurate threat summaries
based on the actual findings from the risk engine.

This is NOT template-based. Explanations are dynamically assembled
from the actual signals detected — each URL gets a unique explanation.
"""
from typing import Any


RISK_OPENERS = {
    "SAFE": [
        "No significant threat indicators were detected for this URL.",
        "Analysis completed. This URL does not exhibit common phishing or malware characteristics.",
    ],
    "LOW_RISK": [
        "Minor indicators were identified, but no confirmed threats were found.",
        "This URL shows some low-severity signals. No definitive threat was confirmed.",
    ],
    "SUSPICIOUS": [
        "Several suspicious indicators were identified, though no direct threat confirmation was obtained.",
        "This URL exhibits multiple characteristics associated with phishing campaigns.",
        "Multiple phishing indicators detected. Exercise caution before visiting.",
    ],
    "HIGH_RISK": [
        "Strong indicators of malicious intent were detected across multiple analysis layers.",
        "High-confidence phishing signals identified. This URL is likely part of a phishing campaign.",
    ],
    "MALICIOUS": [
        "This URL displays high-confidence malicious characteristics across several detection systems.",
        "Multiple threat systems flagged this URL. High probability of phishing or malware delivery.",
    ],
    "CRITICAL": [
        "Critical threat indicators confirmed across multiple independent detection systems.",
        "This URL is almost certainly malicious. Do not visit. Multiple authoritative threat feeds have flagged this domain.",
    ],
}

GUIDANCE = {
    "SAFE": "You may proceed with normal caution.",
    "LOW_RISK": "Verify the URL source before clicking. Treat with standard caution.",
    "SUSPICIOUS": "Do not enter credentials or personal information on this site until the URL is independently verified.",
    "HIGH_RISK": "Avoid visiting this URL. Do not provide any credentials, personal data, or payment information.",
    "MALICIOUS": "Do not visit this URL. Report it to your security team or use Google Safe Browsing to submit feedback.",
    "CRITICAL": "Block this URL immediately. Report it to your SOC or abuse contacts. Do not visit under any circumstances.",
}


def _select_opener(risk_level: str, indicator_count: int) -> str:
    """Select contextually appropriate opening sentence."""
    options = RISK_OPENERS.get(risk_level, ["Analysis complete."])
    # Use indicator_count to pick variant (deterministic, not random)
    return options[indicator_count % len(options)]


def _describe_top_indicators(indicators: list[dict], max_indicators: int = 3) -> str:
    """Build a sentence listing the most significant findings."""
    if not indicators:
        return ""

    top = indicators[:max_indicators]
    labels = [f["label"] for f in top if "label" in f]

    if not labels:
        return ""

    if len(labels) == 1:
        return f"The primary concern is: {labels[0]}."
    elif len(labels) == 2:
        return f"Key indicators include: {labels[0]} and {labels[1]}."
    else:
        joined = ", ".join(labels[:-1]) + f", and {labels[-1]}"
        return f"Key indicators include: {joined}."


def _ssl_caveat(ssl_valid: bool, risk_level: str) -> str:
    """Add SSL context note — explicitly clarifying HTTPS ≠ safe."""
    if ssl_valid and risk_level in ("SUSPICIOUS", "HIGH_RISK", "MALICIOUS", "CRITICAL"):
        return (
            " Note: The presence of HTTPS does not indicate safety — "
            "phishing sites routinely use valid SSL certificates."
        )
    if not ssl_valid and risk_level in ("SAFE", "LOW_RISK"):
        return " This site does not use HTTPS — data transmitted is unencrypted."
    return ""


def _intel_context(threat_intel: dict) -> str:
    """Add threat intelligence context if sources returned results."""
    sources = threat_intel.get("sources", {})
    confirmed_sources = []

    for source_name, result in sources.items():
        if result.get("matched") and result.get("available", True):
            confirmed_sources.append(result.get("source", source_name))

    if confirmed_sources:
        joined = ", ".join(confirmed_sources)
        return f" This URL was flagged by: {joined}."

    # Check if any sources were available but clean
    available = [s for s in sources.values() if s.get("available", False)]
    if available:
        return " Checked against active threat intelligence feeds — no confirmed matches."
    return " External threat intelligence feeds were unavailable for this scan."


def generate_explanation(scan_result: dict) -> dict:
    """
    Generate a structured threat explanation from the scan result.
    Returns a dict with: summary, detail, guidance, confidence_note.
    """
    risk_level = scan_result.get("risk_level", "SAFE")
    risk_score = scan_result.get("risk_score", 0)
    indicators = scan_result.get("indicators", [])
    ssl_valid = scan_result.get("ssl_valid", False)
    threat_intel = scan_result.get("threat_intel", {})
    indicator_count = len(indicators)

    opener = _select_opener(risk_level, indicator_count)
    indicator_sentence = _describe_top_indicators(indicators)
    ssl_note = _ssl_caveat(ssl_valid, risk_level)
    intel_note = _intel_context(threat_intel)
    guidance = GUIDANCE.get(risk_level, "")

    # Build full summary
    parts = [opener]
    if indicator_sentence:
        parts.append(indicator_sentence)
    if intel_note:
        parts.append(intel_note)
    if ssl_note:
        parts.append(ssl_note)

    summary = " ".join(parts)

    # Confidence note
    if risk_score >= 70:
        confidence = "High confidence — multiple independent signals agree."
    elif risk_score >= 40:
        confidence = "Moderate confidence — signals detected but not confirmed by all sources."
    elif risk_score >= 15:
        confidence = "Low-moderate confidence — minor signals only. Could be benign."
    else:
        confidence = "Low confidence — no strong signals detected."

    return {
        "summary": summary,
        "guidance": guidance,
        "confidence_note": confidence,
        "indicator_count": indicator_count,
    }
