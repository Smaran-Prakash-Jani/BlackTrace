"""
Domain Entropy Analyzer.
Uses Shannon entropy + vowel ratio + digit presence to detect
algorithmically-generated or randomized domain names (DGA-style).

Real mathematical analysis — not hardcoded thresholds applied to strings.
"""
import math
from collections import Counter


def shannon_entropy(text: str) -> float:
    """Compute Shannon entropy of a string (bits per character)."""
    if not text:
        return 0.0
    counts = Counter(text.lower())
    total = len(text)
    return -sum((c / total) * math.log2(c / total) for c in counts.values())


def analyze_entropy(parsed_url: dict) -> dict:
    """
    Analyze the domain label's entropy characteristics.
    Returns a score contribution and finding dict.

    Why entropy matters:
    - Human-chosen domain names contain recognizable words with natural character distributions.
    - DGA (Domain Generation Algorithm) domains have high entropy and low vowel ratios.
    - Combines three signals: Shannon entropy, vowel-to-letter ratio, digit presence.
    """
    domain_label = parsed_url.get("domain_label", "")

    if not domain_label or len(domain_label) < 4:
        return {"score": 0, "finding": None}

    entropy = shannon_entropy(domain_label)

    # Vowel / consonant analysis
    vowels = set("aeiou")
    letters = [c for c in domain_label.lower() if c.isalpha()]
    digits = [c for c in domain_label if c.isdigit()]

    vowel_count = sum(1 for c in letters if c in vowels)
    vowel_ratio = vowel_count / len(letters) if letters else 0.0

    # Signal aggregation
    high_entropy = entropy >= 3.5
    low_vowels = vowel_ratio < 0.25 and len(letters) >= 5
    has_digits = len(digits) >= 2

    suspicious_signal_count = sum([high_entropy, low_vowels, has_digits])

    if suspicious_signal_count == 0:
        return {"score": 0, "finding": None}

    # Score based on combined signals
    if suspicious_signal_count >= 3:
        score = 25
        severity = "high"
        summary = "All three entropy signals triggered: high Shannon entropy, low vowel ratio, and digits embedded in domain name."
    elif suspicious_signal_count == 2:
        score = 15
        severity = "medium"
        signals = []
        if high_entropy:
            signals.append(f"high Shannon entropy ({entropy:.2f} bits)")
        if low_vowels:
            signals.append(f"low vowel ratio ({vowel_ratio:.0%})")
        if has_digits:
            signals.append(f"{len(digits)} digit(s) in domain label")
        summary = f"Two entropy signals triggered: {' and '.join(signals)}."
    else:
        score = 8
        severity = "low"
        if high_entropy:
            summary = f"Shannon entropy is elevated ({entropy:.2f} bits), suggesting a non-dictionary domain."
        elif low_vowels:
            summary = f"Low vowel ratio ({vowel_ratio:.0%}) may indicate a randomly generated domain."
        else:
            summary = f"Digits ({len(digits)}) found embedded in domain label."

    return {
        "score": score,
        "finding": {
            "type": "domain_entropy",
            "label": "Algorithmically-Generated Domain Suspected",
            "detail": (
                f"Domain '{domain_label}': entropy={entropy:.2f} bits, "
                f"vowel ratio={vowel_ratio:.0%}, digits={len(digits)}. "
                f"{summary}"
            ),
            "weight": score,
            "severity": severity,
            "meta": {
                "entropy": round(entropy, 3),
                "vowel_ratio": round(vowel_ratio, 3),
                "digit_count": len(digits),
            }
        }
    }
