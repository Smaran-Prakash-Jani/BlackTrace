"""
URL parsing utilities using tldextract for accurate TLD/domain/subdomain decomposition.
"""
from urllib.parse import urlparse, parse_qs
import tldextract
import re


def parse_url(raw_url: str) -> dict:
    """
    Parse a URL into its components. Adds scheme if missing.
    Returns a structured dict of all URL components.
    """
    url = raw_url.strip()
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    parsed = urlparse(url)
    extracted = tldextract.extract(url)

    subdomain = extracted.subdomain
    domain_label = extracted.domain       # e.g. "google"
    tld = extracted.suffix                # e.g. "com" or "co.uk"
    registered_domain = extracted.registered_domain  # e.g. "google.com"
    fqdn = extracted.fqdn                 # e.g. "www.google.com"

    path = parsed.path
    query_string = parsed.query
    query_params = parse_qs(query_string)
    fragment = parsed.fragment

    # Check if host is a raw IP address
    ip_pattern = re.compile(
        r"^(\d{1,3}\.){3}\d{1,3}$"
    )
    is_ip_address = bool(ip_pattern.match(parsed.hostname or ""))

    # Count subdomain levels
    subdomain_levels = len(subdomain.split(".")) if subdomain else 0

    # Percent-encoded character count in the full URL
    encoded_char_count = len(re.findall(r"%[0-9a-fA-F]{2}", url))

    return {
        "original": raw_url,
        "normalized": url,
        "scheme": parsed.scheme,
        "host": parsed.hostname or "",
        "subdomain": subdomain,
        "domain_label": domain_label,
        "tld": tld,
        "registered_domain": registered_domain,
        "fqdn": fqdn,
        "path": path,
        "query_string": query_string,
        "query_params": query_params,
        "query_param_count": len(query_params),
        "fragment": fragment,
        "url_length": len(url),
        "is_ip_address": is_ip_address,
        "subdomain_levels": subdomain_levels,
        "encoded_char_count": encoded_char_count,
    }
