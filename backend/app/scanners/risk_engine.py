"""
Risk Scoring Engine.
Aggregates scores from all analyzers into a final weighted risk score.
Produces structured scan results with categorized risk level.
"""
import asyncio
import json
from datetime import datetime

from app.utils.url_parser import parse_url
from app.analyzers.heuristics import analyze_heuristics
from app.analyzers.tld_detector import analyze_tld
from app.analyzers.entropy import analyze_entropy
from app.analyzers.brand_impersonation import analyze_brand_impersonation
from app.analyzers.redirect import trace_redirect_chain
from app.services.threat_intel import run_all_threat_intel


# Risk level thresholds
RISK_THRESHOLDS = [
    (15,  "SAFE",       "No significant threat indicators detected."),
    (30,  "LOW_RISK",   "Minor indicators present. No confirmed threats."),
    (50,  "SUSPICIOUS", "Multiple suspicious indicators identified."),
    (70,  "HIGH_RISK",  "Strong phishing or malware indicators detected."),
    (85,  "MALICIOUS",  "High-confidence malicious or phishing site."),
    (101, "CRITICAL",   "Multiple critical threat confirmations. Do not visit."),
]

RISK_LEVEL_ORDER = ["SAFE", "LOW_RISK", "SUSPICIOUS", "HIGH_RISK", "MALICIOUS", "CRITICAL"]


def score_to_risk_level(score: int) -> tuple[str, str]:
    for threshold, level, desc in RISK_THRESHOLDS:
        if score < threshold:
            return level, desc
    return "CRITICAL", "Multiple critical threat confirmations."


async def run_full_scan(url: str) -> dict:
    """
    Orchestrate all analyzers, aggregate scores, produce full scan result.
    All async analyzers run concurrently for speed.
    """
    # --- Parse URL ---
    try:
        parsed = parse_url(url)
    except Exception as e:
        return {"error": f"Invalid URL: {e}", "url": url}

    # --- Run concurrent async analyzers ---
    redirect_task = trace_redirect_chain(parsed["normalized"])
    intel_task = run_all_threat_intel(parsed["normalized"], parsed)

    redirect_result, intel_result = await asyncio.gather(redirect_task, intel_task)

    # --- Run sync analyzers (fast, no I/O) ---
    heuristic_result = analyze_heuristics(parsed)
    tld_result = analyze_tld(parsed)
    entropy_result = analyze_entropy(parsed)
    brand_result = analyze_brand_impersonation(parsed)

    # --- Aggregate all scores ---
    total_score = 0
    all_findings = []

    total_score += heuristic_result.score
    all_findings.extend(heuristic_result.findings)

    if tld_result["score"]:
        total_score += tld_result["score"]
    if tld_result["finding"]:
        all_findings.append(tld_result["finding"])

    if entropy_result["score"]:
        total_score += entropy_result["score"]
    if entropy_result["finding"]:
        all_findings.append(entropy_result["finding"])

    if brand_result["score"]:
        total_score += brand_result["score"]
    if brand_result["finding"]:
        all_findings.append(brand_result["finding"])

    if redirect_result["score"]:
        total_score += redirect_result["score"]
    if redirect_result["finding"]:
        all_findings.append(redirect_result["finding"])

    # Threat intel (WHOIS age, OpenPhish, VirusTotal, GSB)
    total_score += intel_result["score"]
    all_findings.extend(intel_result["findings"])

    # Cap at 100
    total_score = min(total_score, 100)

    risk_level, risk_description = score_to_risk_level(total_score)

    # --- SSL check (simple: HTTPS = minor positive signal) ---
    ssl_valid = parsed["scheme"] == "https"
    if ssl_valid and total_score > 10:
        total_score = max(total_score - 5, 0)

    # --- Build domain info ---
    domain_info = {
        "registered_domain": parsed["registered_domain"],
        "domain_label": parsed["domain_label"],
        "tld": parsed["tld"],
        "subdomain": parsed["subdomain"],
        "is_ip_address": parsed["is_ip_address"],
        "ssl_valid": ssl_valid,
        "dns": intel_result.get("dns", {}),
        "whois": intel_result.get("domain_age", {}),
        "ip_addresses": intel_result.get("dns", {}).get("ips", []),
    }

    # --- Sort findings by weight descending ---
    all_findings.sort(key=lambda f: f.get("weight", 0), reverse=True)

    return {
        "url": url,
        "normalized_url": parsed["normalized"],
        "domain": parsed["registered_domain"],
        "risk_score": total_score,
        "risk_level": risk_level,
        "risk_description": risk_description,
        "indicators": all_findings,
        "indicator_count": len(all_findings),
        "domain_info": domain_info,
        "redirect_chain": redirect_result.get("chain", []),
        "redirect_depth": redirect_result.get("depth", 0),
        "threat_intel": {
            "sources": intel_result.get("sources", {}),
        },
        "scanned_at": datetime.utcnow().isoformat(),
        "ssl_valid": ssl_valid,
    }
