"""
Redirect Chain Analyzer.
Follows HTTP redirects asynchronously and analyzes the chain for suspicious patterns.
Uses real HTTP calls — not simulated.
"""
import asyncio
import httpx
from urllib.parse import urlparse
import tldextract


MAX_REDIRECT_DEPTH = 10
REQUEST_TIMEOUT = 8.0


async def trace_redirect_chain(url: str) -> dict:
    """
    Asynchronously follow HTTP redirect chain up to MAX_REDIRECT_DEPTH.
    Returns the chain, final URL, depth, and cross-domain hop count.
    """
    chain = []
    current_url = url
    seen_urls = set()

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        )
    }

    try:
        async with httpx.AsyncClient(
            follow_redirects=False,
            timeout=REQUEST_TIMEOUT,
            headers=headers,
        ) as client:
            for _ in range(MAX_REDIRECT_DEPTH):
                if current_url in seen_urls:
                    chain.append({"url": current_url, "status": None, "note": "redirect loop detected"})
                    break
                seen_urls.add(current_url)

                try:
                    resp = await client.head(current_url)
                    status = resp.status_code
                    chain.append({"url": current_url, "status": status})

                    if status in (301, 302, 303, 307, 308):
                        location = resp.headers.get("location", "")
                        if not location:
                            break
                        # Handle relative redirects
                        if location.startswith("/"):
                            parsed = urlparse(current_url)
                            location = f"{parsed.scheme}://{parsed.netloc}{location}"
                        current_url = location
                    else:
                        break

                except (httpx.ConnectError, httpx.TimeoutException, httpx.InvalidURL):
                    chain.append({"url": current_url, "status": None, "note": "connection failed"})
                    break

    except Exception:
        pass

    return _analyze_chain(chain)


def _analyze_chain(chain: list) -> dict:
    """Analyze the redirect chain for suspicious characteristics."""
    if not chain:
        return {
            "chain": [],
            "depth": 0,
            "final_url": None,
            "cross_domain_hops": 0,
            "score": 0,
            "finding": None,
        }

    depth = len(chain) - 1
    final_url = chain[-1]["url"] if chain else None

    # Count cross-domain hops
    cross_domain_hops = 0
    prev_domain = None
    for step in chain:
        ext = tldextract.extract(step["url"])
        curr_domain = ext.registered_domain
        if prev_domain and curr_domain and curr_domain != prev_domain:
            cross_domain_hops += 1
        prev_domain = curr_domain

    # Scoring
    score = 0
    finding = None

    if depth >= 4:
        score = 20
        severity = "high"
        detail = (
            f"Redirect chain is {depth} hops deep with {cross_domain_hops} cross-domain redirect(s). "
            f"Deep redirect chains are commonly used to obscure the final phishing destination "
            f"and evade URL-based filtering."
        )
    elif depth >= 2:
        score = 10
        severity = "medium"
        detail = (
            f"Redirect chain is {depth} hop(s) deep with {cross_domain_hops} cross-domain redirect(s). "
            f"Multiple redirects can be used to obscure the final destination."
        )
    elif depth == 1 and cross_domain_hops >= 1:
        score = 5
        severity = "low"
        detail = f"Single cross-domain redirect detected. Final destination: {final_url}"
    
    if score > 0:
        finding = {
            "type": "redirect_chain",
            "label": f"Redirect Chain Detected ({depth} hop{'s' if depth != 1 else ''})",
            "detail": detail,
            "weight": score,
            "severity": severity,
        }

    return {
        "chain": chain,
        "depth": depth,
        "final_url": final_url,
        "cross_domain_hops": cross_domain_hops,
        "score": score,
        "finding": finding,
    }
