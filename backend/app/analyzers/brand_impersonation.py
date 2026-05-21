"""
Brand Impersonation Detector.
Uses Levenshtein edit distance (via rapidfuzz) and character substitution
normalization to detect typosquatting and domain spoofing.

Real algorithmic analysis using edit distance — not regex matching.
"""
from rapidfuzz.distance import Levenshtein
from rapidfuzz import fuzz

# Comprehensive list of frequently impersonated brands
KNOWN_BRANDS = {
    # Tech giants
    "google", "gmail", "youtube", "googleapis",
    "microsoft", "outlook", "hotmail", "xbox", "azure",
    "apple", "icloud", "itunes",
    "amazon", "aws",
    "facebook", "instagram", "whatsapp", "meta",
    "twitter", "x",
    "linkedin",
    "netflix",
    "adobe",
    "zoom",
    "slack",
    "discord",
    "dropbox",
    "github",
    "gitlab",
    # Financial
    "paypal",
    "stripe",
    "square",
    "chase",
    "wellsfargo",
    "bankofamerica",
    "citibank",
    "hsbc",
    "barclays",
    "revolut",
    "coinbase",
    "binance",
    # E-commerce / services
    "ebay",
    "shopify",
    "etsy",
    "walmart",
    "target",
    "fedex",
    "ups",
    "dhl",
    "usps",
    "steam",
    "epic",
    "roblox",
    "spotify",
}

# Leet-speak / homoglyph substitutions commonly used in typosquatting
LEET_SUBSTITUTIONS = str.maketrans({
    "0": "o",
    "1": "i",
    "3": "e",
    "4": "a",
    "5": "s",
    "7": "t",
    "@": "a",
    "$": "s",
})


def normalize_domain(domain: str) -> str:
    """Apply leet-speak normalization to expose typosquatting."""
    return domain.lower().translate(LEET_SUBSTITUTIONS)


def analyze_brand_impersonation(parsed_url: dict) -> dict:
    """
    Check if the domain label or subdomains impersonate a known brand.
    Uses three detection strategies:
    1. Exact brand name contained in domain/subdomain
    2. Levenshtein edit distance ≤ 2 (typosquatting)
    3. Edit distance on leet-normalized domain
    """
    domain_label = parsed_url.get("domain_label", "").lower()
    subdomain = parsed_url.get("subdomain", "").lower()
    registered_domain = parsed_url.get("registered_domain", "").lower()

    if not domain_label:
        return {"score": 0, "finding": None}

    normalized_domain = normalize_domain(domain_label)

    # Strategy 1: Brand name embedded in domain (but not identical — that would be legit)
    for brand in KNOWN_BRANDS:
        if brand in domain_label and brand != domain_label:
            score = 30
            return {
                "score": score,
                "finding": {
                    "type": "brand_impersonation",
                    "label": f"Brand Name Embedded in Domain",
                    "detail": (
                        f"The domain '{registered_domain}' contains the brand name '{brand}' "
                        f"but is not the official domain. This is a common phishing technique "
                        f"to make URLs appear legitimate at a glance."
                    ),
                    "weight": score,
                    "severity": "high",
                    "meta": {"matched_brand": brand, "technique": "embedded_brand"},
                }
            }

    # Strategy 2: Brand name in subdomain (e.g., paypal.evil.com)
    for brand in KNOWN_BRANDS:
        if brand in subdomain:
            score = 35
            return {
                "score": score,
                "finding": {
                    "type": "brand_impersonation",
                    "label": f"Brand Name Used as Subdomain",
                    "detail": (
                        f"'{brand}' appears as a subdomain of '{registered_domain}'. "
                        f"Attackers use brand names in subdomains to create convincing-looking URLs "
                        f"(e.g., paypal.attacker.com)."
                    ),
                    "weight": score,
                    "severity": "critical",
                    "meta": {"matched_brand": brand, "technique": "brand_in_subdomain"},
                }
            }

    # Strategy 3: Levenshtein edit distance (typosquatting)
    best_match = None
    best_distance = float("inf")
    best_ratio = 0

    for brand in KNOWN_BRANDS:
        # Skip very short brand names to avoid false positives
        if len(brand) < 4:
            continue

        # Check both original and leet-normalized versions
        dist_original = Levenshtein.distance(domain_label, brand)
        dist_normalized = Levenshtein.distance(normalized_domain, brand)
        dist = min(dist_original, dist_normalized)

        ratio = fuzz.ratio(normalized_domain, brand)

        if dist < best_distance or (dist == best_distance and ratio > best_ratio):
            best_distance = dist
            best_match = brand
            best_ratio = ratio

    if best_match and best_distance <= 2 and domain_label != best_match:
        # Extra guard: don't flag if domain is much shorter (avoid false positives on short names)
        len_diff = abs(len(domain_label) - len(best_match))
        if len_diff <= 3:
            score = 40 if best_distance == 1 else 25
            severity = "critical" if best_distance == 1 else "high"
            return {
                "score": score,
                "finding": {
                    "type": "brand_impersonation",
                    "label": f"Typosquatting Detected — '{best_match}'",
                    "detail": (
                        f"Domain '{domain_label}' has an edit distance of {best_distance} from "
                        f"'{best_match}' (similarity: {best_ratio:.0f}%). "
                        f"This matches the typosquatting pattern where attackers register "
                        f"near-identical domains to deceive users."
                    ),
                    "weight": score,
                    "severity": severity,
                    "meta": {
                        "matched_brand": best_match,
                        "edit_distance": best_distance,
                        "similarity": best_ratio,
                        "technique": "typosquatting",
                    },
                }
            }

    return {"score": 0, "finding": None}
