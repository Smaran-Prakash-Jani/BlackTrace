"""
Suspicious TLD Detector.
Checks the domain's TLD against known high-risk top-level domains.
"""

# High-risk TLDs frequently abused in phishing campaigns.
# Source: APWG eCrime reports + SpamHaus TLD risk analysis.
SUSPICIOUS_TLDS = {
    # Free/cheap TLDs heavily abused
    "xyz": 25,
    "tk": 25,
    "ml": 20,
    "ga": 20,
    "cf": 20,
    "gq": 20,
    # Frequently seen in phishing
    "cyou": 25,
    "top": 20,
    "click": 25,
    "buzz": 20,
    "shop": 15,
    "live": 12,
    "online": 12,
    "site": 12,
    "website": 12,
    "space": 10,
    "fun": 10,
    "icu": 20,
    "bar": 15,
    "vip": 15,
    "uno": 15,
    "rest": 10,
    "link": 10,
    "work": 10,
    "host": 10,
    "win": 15,
    "loan": 20,
    "download": 20,
    "stream": 15,
    "gdn": 15,
    "racing": 20,
    "trade": 15,
}

# Legitimately suspicious because they're unusual for normal services
MODERATELY_SUSPICIOUS_TLDS = {
    "info", "biz", "mobi", "name", "pro",
    "webcam", "date", "faith", "review", "bid",
}


def analyze_tld(parsed_url: dict) -> dict:
    """
    Analyze the TLD of the domain.
    Returns a score contribution and finding dict (or None if clean).
    """
    tld = parsed_url.get("tld", "").lower().strip(".")

    if tld in SUSPICIOUS_TLDS:
        score = SUSPICIOUS_TLDS[tld]
        return {
            "score": score,
            "finding": {
                "type": "suspicious_tld",
                "label": f"High-Risk TLD (.{tld})",
                "detail": (
                    f"The .{tld} TLD is frequently associated with phishing campaigns and low-cost "
                    f"domain registrations. Threat intelligence datasets consistently flag domains "
                    f"under .{tld} at elevated rates."
                ),
                "weight": score,
                "severity": "high" if score >= 20 else "medium",
            }
        }

    if tld in MODERATELY_SUSPICIOUS_TLDS:
        score = 8
        return {
            "score": score,
            "finding": {
                "type": "unusual_tld",
                "label": f"Uncommon TLD (.{tld})",
                "detail": (
                    f"The .{tld} TLD is uncommon for established services. "
                    f"While not inherently malicious, it warrants additional scrutiny."
                ),
                "weight": score,
                "severity": "low",
            }
        }

    return {"score": 0, "finding": None}
