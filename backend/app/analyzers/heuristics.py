"""
URL Heuristics Analyzer.
Detects suspicious patterns in URL structure, keywords, and formatting.
Real analysis — not hardcoded results.
"""
import re
from typing import NamedTuple

# Phishing-associated keywords commonly found in malicious URLs
SUSPICIOUS_KEYWORDS = {
    # Credential harvesting
    "login", "signin", "sign-in", "logon", "log-in",
    "verify", "verification", "validate", "confirm",
    "account", "accounts", "update", "secure", "security",
    "authenticate", "authentication",
    # Financial lures
    "bank", "banking", "payment", "pay", "billing", "invoice",
    "transaction", "transfer", "wire",
    # Urgency triggers
    "urgent", "alert", "warning", "suspended", "limited",
    "blocked", "unauthorized", "restricted", "unusual",
    # Action prompts
    "reset", "recover", "restore", "unlock", "reactivate",
    "click", "submit", "download", "free", "offer", "prize",
    "winner", "reward", "claim",
    # Common phishing targets
    "password", "credential", "ssn", "social-security",
    "credit-card", "creditcard",
}

# URL shortening services (redirect obfuscators)
URL_SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly",
    "buff.ly", "short.link", "rb.gy", "is.gd", "v.gd",
    "cutt.ly", "tiny.cc", "shorte.st", "adf.ly",
}


class HeuristicResult(NamedTuple):
    score: int
    findings: list[dict]


def analyze_heuristics(parsed_url: dict) -> HeuristicResult:
    """
    Run heuristic analysis on a parsed URL dict (from url_parser.parse_url).
    Returns a score contribution and a list of finding dicts.
    """
    score = 0
    findings = []

    url_lower = parsed_url["normalized"].lower()
    path_lower = parsed_url["path"].lower()
    host_lower = parsed_url["host"].lower()
    registered_domain = parsed_url["registered_domain"].lower()

    # --- 1. Suspicious keyword detection (path + host combined) ---
    search_surface = host_lower + " " + path_lower + " " + parsed_url["query_string"].lower()
    matched_keywords = [kw for kw in SUSPICIOUS_KEYWORDS if kw in search_surface]
    if matched_keywords:
        kw_score = min(len(matched_keywords) * 10, 30)
        score += kw_score
        findings.append({
            "type": "suspicious_keywords",
            "label": "Phishing Keywords Detected",
            "detail": f"Found {len(matched_keywords)} suspicious keyword(s): {', '.join(matched_keywords[:5])}",
            "weight": kw_score,
            "severity": "medium" if kw_score < 20 else "high",
        })

    # --- 2. URL shortener detection ---
    if registered_domain in URL_SHORTENERS:
        score += 15
        findings.append({
            "type": "url_shortener",
            "label": "URL Shortener Detected",
            "detail": f"Domain '{registered_domain}' is a known URL shortener. Destination is obfuscated.",
            "weight": 15,
            "severity": "medium",
        })

    # --- 3. IP address used as host ---
    if parsed_url["is_ip_address"]:
        score += 20
        findings.append({
            "type": "ip_host",
            "label": "IP Address Used as Host",
            "detail": f"The URL uses a raw IP address ({parsed_url['host']}) instead of a domain name. Legitimate services rarely do this.",
            "weight": 20,
            "severity": "high",
        })

    # --- 4. Excessive subdomain depth (> 3 levels) ---
    subdomain_levels = parsed_url["subdomain_levels"]
    if subdomain_levels >= 3:
        score += 15
        findings.append({
            "type": "excessive_subdomains",
            "label": "Excessive Subdomain Depth",
            "detail": f"{subdomain_levels} subdomain levels detected. Deep subdomain chains are used to spoof legitimate domains.",
            "weight": 15,
            "severity": "medium",
        })

    # --- 5. Abnormally long URL ---
    url_length = parsed_url["url_length"]
    if url_length > 200:
        score += 10
        findings.append({
            "type": "long_url",
            "label": "Abnormally Long URL",
            "detail": f"URL is {url_length} characters long. Excessively long URLs often hide malicious parameters.",
            "weight": 10,
            "severity": "low",
        })
    elif url_length > 100:
        score += 5
        findings.append({
            "type": "long_url",
            "label": "Long URL",
            "detail": f"URL is {url_length} characters long.",
            "weight": 5,
            "severity": "low",
        })

    # --- 6. Percent-encoded characters abuse ---
    encoded_count = parsed_url["encoded_char_count"]
    if encoded_count >= 5:
        score += 10
        findings.append({
            "type": "encoded_chars",
            "label": "Heavy URL Encoding",
            "detail": f"{encoded_count} percent-encoded characters found. This can be used to obfuscate malicious content.",
            "weight": 10,
            "severity": "medium",
        })

    # --- 7. Excessive query parameters ---
    param_count = parsed_url["query_param_count"]
    if param_count >= 6:
        score += 10
        findings.append({
            "type": "excessive_params",
            "label": "Excessive Query Parameters",
            "detail": f"{param_count} query parameters found. May be used to track victims or obscure intent.",
            "weight": 10,
            "severity": "low",
        })

    # --- 8. @ symbol in URL (username obfuscation) ---
    if "@" in url_lower:
        score += 15
        findings.append({
            "type": "at_symbol",
            "label": "@ Symbol in URL",
            "detail": "The '@' symbol can redirect to a different host, creating a visual deception (e.g., evil.com@legit.com).",
            "weight": 15,
            "severity": "high",
        })

    # --- 9. Double slash in path (path confusion) ---
    if "//" in path_lower:
        score += 5
        findings.append({
            "type": "double_slash_path",
            "label": "Double Slash in Path",
            "detail": "Double slashes in the URL path can confuse URL parsers.",
            "weight": 5,
            "severity": "low",
        })

    # --- 10. Hyphens in domain label (common phishing pattern) ---
    domain_label = parsed_url["domain_label"]
    hyphen_count = domain_label.count("-")
    if hyphen_count >= 2:
        score += 8
        findings.append({
            "type": "hyphenated_domain",
            "label": "Heavily Hyphenated Domain",
            "detail": f"Domain '{domain_label}' contains {hyphen_count} hyphens. Phishing domains often hyphenate brand names (e.g., 'paypal-secure-login').",
            "weight": 8,
            "severity": "medium",
        })

    return HeuristicResult(score=score, findings=findings)
