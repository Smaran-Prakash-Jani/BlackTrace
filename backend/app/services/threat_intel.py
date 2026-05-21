"""
Threat Intelligence Service.
Queries real external threat intel sources where available.
Falls back to structured simulation when APIs are unavailable.

Sources:
  1. OpenPhish live feed (free, no API key required)
  2. VirusTotal API (optional, key-gated)
  3. Google Safe Browsing API (optional, key-gated)
  4. WHOIS domain age analysis (real query via python-whois)
  5. DNS resolution check (via dnspython)
"""
import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional
import httpx
import dns.resolver
import dns.exception
import whois
from app.config import VIRUSTOTAL_API_KEY, GOOGLE_SAFE_BROWSING_API_KEY

logger = logging.getLogger(__name__)

OPENPHISH_FEED_URL = "https://openphish.com/feed.txt"
_openphish_cache: set[str] = set()
_openphish_cache_domains: set[str] = set()
_openphish_fetched_at: Optional[datetime] = None
CACHE_TTL_SECONDS = 3600  # refresh feed every hour


async def _refresh_openphish_cache():
    """Fetch the OpenPhish feed and cache domain entries."""
    global _openphish_cache, _openphish_cache_domains, _openphish_fetched_at

    now = datetime.now(timezone.utc)
    if _openphish_fetched_at:
        elapsed = (now - _openphish_fetched_at).total_seconds()
        if elapsed < CACHE_TTL_SECONDS:
            return  # cache still fresh

    try:
        import tldextract
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(OPENPHISH_FEED_URL)
            if resp.status_code == 200:
                urls = {line.strip() for line in resp.text.splitlines() if line.strip()}
                domains = set()
                for u in urls:
                    ext = tldextract.extract(u)
                    if ext.registered_domain:
                        domains.add(ext.registered_domain.lower())
                _openphish_cache = urls
                _openphish_cache_domains = domains
                _openphish_fetched_at = now
                logger.info(f"OpenPhish feed refreshed: {len(urls)} entries")
    except Exception as e:
        logger.warning(f"OpenPhish feed fetch failed: {e}")


async def check_openphish(url: str, registered_domain: str) -> dict:
    """Check URL/domain against the OpenPhish live feed."""
    await _refresh_openphish_cache()

    # Direct URL match
    url_match = url in _openphish_cache or url.rstrip("/") in _openphish_cache

    # Domain match (broader — catches all URLs from a malicious domain)
    domain_match = registered_domain.lower() in _openphish_cache_domains

    if url_match:
        return {
            "source": "OpenPhish",
            "matched": True,
            "match_type": "url",
            "score": 60,
            "detail": "This exact URL appears in the OpenPhish active phishing feed.",
        }
    if domain_match:
        return {
            "source": "OpenPhish",
            "matched": True,
            "match_type": "domain",
            "score": 45,
            "detail": "This domain hosts URLs listed in the OpenPhish active phishing feed.",
        }

    feed_available = _openphish_fetched_at is not None
    return {
        "source": "OpenPhish",
        "matched": False,
        "score": 0,
        "detail": "Not found in OpenPhish feed." if feed_available else "OpenPhish feed unavailable — could not verify.",
    }


async def check_virustotal(url: str) -> dict:
    """Query VirusTotal URL analysis API (requires API key)."""
    if not VIRUSTOTAL_API_KEY:
        return {"source": "VirusTotal", "available": False, "score": 0, "detail": "API key not configured."}

    import base64
    url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")
    api_url = f"https://www.virustotal.com/api/v3/urls/{url_id}"
    headers = {"x-apikey": VIRUSTOTAL_API_KEY}

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(api_url, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                stats = data.get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
                malicious = stats.get("malicious", 0)
                suspicious = stats.get("suspicious", 0)
                total = sum(stats.values()) or 1

                score = min(malicious * 8 + suspicious * 4, 60)
                return {
                    "source": "VirusTotal",
                    "available": True,
                    "matched": malicious > 0 or suspicious > 0,
                    "malicious_engines": malicious,
                    "suspicious_engines": suspicious,
                    "total_engines": total,
                    "score": score,
                    "detail": f"{malicious} malicious / {suspicious} suspicious detections out of {total} engines.",
                }
            elif resp.status_code == 404:
                return {"source": "VirusTotal", "available": True, "matched": False, "score": 0, "detail": "URL not previously analyzed by VirusTotal."}
    except Exception as e:
        logger.warning(f"VirusTotal API error: {e}")

    return {"source": "VirusTotal", "available": False, "score": 0, "detail": "VirusTotal API request failed."}


async def check_google_safe_browsing(url: str) -> dict:
    """Query Google Safe Browsing API (requires API key)."""
    if not GOOGLE_SAFE_BROWSING_API_KEY:
        return {"source": "Google Safe Browsing", "available": False, "score": 0, "detail": "API key not configured."}

    api_url = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={GOOGLE_SAFE_BROWSING_API_KEY}"
    payload = {
        "client": {"clientId": "blacktrace", "clientVersion": "1.0"},
        "threatInfo": {
            "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url}],
        },
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(api_url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                matches = data.get("matches", [])
                if matches:
                    threat_types = list({m.get("threatType", "") for m in matches})
                    return {
                        "source": "Google Safe Browsing",
                        "available": True,
                        "matched": True,
                        "threat_types": threat_types,
                        "score": 60,
                        "detail": f"Listed by Google Safe Browsing as: {', '.join(threat_types)}",
                    }
                return {"source": "Google Safe Browsing", "available": True, "matched": False, "score": 0, "detail": "Not flagged by Google Safe Browsing."}
    except Exception as e:
        logger.warning(f"Google Safe Browsing API error: {e}")

    return {"source": "Google Safe Browsing", "available": False, "score": 0, "detail": "API request failed."}


def get_domain_age(registered_domain: str) -> dict:
    """
    Query WHOIS to determine domain registration age.
    Returns age in days and structured metadata.
    """
    try:
        w = whois.whois(registered_domain)
        creation_date = w.creation_date

        if isinstance(creation_date, list):
            creation_date = creation_date[0]

        if creation_date:
            if creation_date.tzinfo is None:
                creation_date = creation_date.replace(tzinfo=timezone.utc)
            age_days = (datetime.now(timezone.utc) - creation_date).days
            registrar = w.registrar or "Unknown"
            return {
                "available": True,
                "creation_date": creation_date.isoformat(),
                "age_days": age_days,
                "registrar": registrar,
                "expiration_date": w.expiration_date.isoformat() if w.expiration_date and not isinstance(w.expiration_date, list) else None,
            }
    except Exception as e:
        logger.warning(f"WHOIS lookup failed for {registered_domain}: {e}")

    return {"available": False, "age_days": None, "registrar": None}


def get_domain_age_score(domain_age_result: dict) -> dict:
    """Compute risk score from domain age."""
    if not domain_age_result.get("available"):
        return {"score": 5, "finding": {
            "type": "domain_age_unknown",
            "label": "Domain Age Unavailable",
            "detail": "WHOIS data is unavailable or protected. Cannot verify domain registration date.",
            "weight": 5,
            "severity": "low",
        }}

    age_days = domain_age_result["age_days"]

    if age_days < 7:
        score, severity = 30, "critical"
        desc = f"registered just {age_days} day(s) ago"
    elif age_days < 30:
        score, severity = 20, "high"
        desc = f"registered {age_days} days ago"
    elif age_days < 90:
        score, severity = 10, "medium"
        desc = f"registered {age_days} days ago"
    else:
        return {"score": 0, "finding": None}

    return {
        "score": score,
        "finding": {
            "type": "new_domain",
            "label": "Newly Registered Domain",
            "detail": (
                f"Domain was {desc}. Freshly registered domains are a primary indicator "
                f"of phishing infrastructure — attackers register new domains to avoid reputation blacklists."
            ),
            "weight": score,
            "severity": severity,
        }
    }


def check_dns_resolution(host: str) -> dict:
    """Check if the domain resolves in DNS and gather basic IP info."""
    try:
        resolver = dns.resolver.Resolver()
        resolver.timeout = 4
        resolver.lifetime = 4
        answers = resolver.resolve(host, "A")
        ips = [str(r) for r in answers]
        return {"resolves": True, "ips": ips}
    except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
        return {"resolves": False, "ips": [], "note": "Domain does not resolve (NXDOMAIN)"}
    except Exception as e:
        return {"resolves": None, "ips": [], "note": str(e)}


async def run_all_threat_intel(url: str, parsed_url: dict) -> dict:
    """
    Run all threat intelligence checks in parallel.
    Returns aggregated results with combined score.
    """
    registered_domain = parsed_url.get("registered_domain", "")
    host = parsed_url.get("host", "")

    # Run async checks concurrently
    openphish_task = check_openphish(url, registered_domain)
    vt_task = check_virustotal(url)
    gsb_task = check_google_safe_browsing(url)

    openphish_result, vt_result, gsb_result = await asyncio.gather(
        openphish_task, vt_task, gsb_task
    )

    # Run sync checks (WHOIS + DNS) in executor to avoid blocking
    loop = asyncio.get_event_loop()
    domain_age = await loop.run_in_executor(None, get_domain_age, registered_domain)
    dns_result = await loop.run_in_executor(None, check_dns_resolution, host)

    age_score_data = get_domain_age_score(domain_age)

    # Aggregate findings and score
    intel_findings = []
    intel_score = 0

    for result in [openphish_result, vt_result, gsb_result]:
        if result.get("matched"):
            intel_score += result.get("score", 0)
            intel_findings.append({
                "type": "threat_intel_match",
                "label": f"Listed by {result['source']}",
                "detail": result.get("detail", ""),
                "weight": result.get("score", 0),
                "severity": "critical",
            })

    if age_score_data.get("score", 0) > 0 and age_score_data.get("finding"):
        intel_score += age_score_data["score"]
        intel_findings.append(age_score_data["finding"])

    # DNS non-resolution is itself suspicious (possible typosquatting registered but unused)
    if dns_result.get("resolves") is False:
        pass  # NXDOMAIN — domain doesn't exist, might mean URL is fabricated

    return {
        "score": intel_score,
        "findings": intel_findings,
        "sources": {
            "openphish": openphish_result,
            "virustotal": vt_result,
            "google_safe_browsing": gsb_result,
        },
        "domain_age": domain_age,
        "dns": dns_result,
    }
