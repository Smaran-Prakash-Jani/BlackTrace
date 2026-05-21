# BLACKTRACE — Product Requirements Document (PRD)

## Product Name
BlackTrace

## Product Type
AI-powered phishing and malicious URL intelligence platform.

---

# 1. Vision

BlackTrace is a modern cybersecurity intelligence platform designed to detect phishing, malicious URLs, suspicious domains, and unsafe websites using layered threat analysis.

The goal is to create a platform that feels like a premium AI-native security product instead of a basic URL checker.

BlackTrace should combine:
- threat intelligence
- behavioral analysis
- modern AI-assisted security explanations
- enterprise-grade UX
- real-time scanning workflows

The product should feel:
- calm
- intelligent
- trustworthy
- premium
- minimal
- technical but approachable

---

# 2. Core Goals

## Primary Goals
- Detect suspicious and malicious URLs
- Explain WHY a URL is dangerous
- Provide understandable cybersecurity insights
- Create a premium portfolio-grade SaaS product
- Demonstrate frontend + backend + AI system architecture skills

## Secondary Goals
- Build a reusable threat analysis engine
- Enable future browser extension integration
- Support public scanning APIs in future versions
- Add real-time monitoring later

---

# 3. Target Users

## Primary Users
- Students learning cybersecurity
- Recruiters evaluating technical skills
- Developers
- Security enthusiasts
- Startup founders

## Secondary Users
- Small teams
- Researchers
- Awareness/training users

---

# 4. Product Positioning

BlackTrace should position itself as:

> “An AI-native cybersecurity intelligence platform for phishing detection and URL risk analysis.”

NOT:
- a hacking tool
- a penetration testing tool
- a gimmicky cyberpunk dashboard

---

# 5. Design Philosophy

## Design Direction
Minimal enterprise SaaS.

Inspired by:
- Linear
- Vercel
- Stripe
- Tailscale
- Raycast
- Notion
- Retool
- Cloudflare

## Visual Principles
- spacious layouts
- soft shadows
- minimal glow
- elegant typography
- subtle animations
- clean dashboard spacing
- matte dark backgrounds
- restrained accent colors

## Avoid
- excessive neon
- cyberpunk clutter
- matrix visuals
- glowing borders everywhere
- fake “hacker movie” aesthetics

---

# 6. Core Features

## 6.1 URL Scanner

### User Flow
1. User pastes a URL
2. System validates URL
3. Threat analysis begins
4. Progressive scan stages appear
5. Final risk analysis shown

### Scan States
- analyzing URL
- checking reputation
- inspecting redirects
- scanning domain intelligence
- generating threat analysis

---

## 6.2 Threat Analysis Engine

### Detection Systems

#### URL Heuristics
Analyze:
- suspicious keywords
- excessive subdomains
- URL length
- encoded characters
- query parameter abuse
- URL shorteners
- IP-based domains

#### Suspicious TLD Detection
Flag domains using:
- .xyz
- .cyou
- .top
- .click
- .buzz
- .shop
- .tk
- .gq

#### Entropy Detection
Detect random-looking domains.

Examples:
- zudfye.cyou
- xk12f-login.xyz

#### Brand Impersonation Detection
Detect typosquatting:
- paypa1.com
- g00gle-login.net
- micr0softverify.org

#### Domain Intelligence
Analyze:
- domain age
- registrar
- DNS records
- IP information
- hosting region
- disposable domain patterns

#### Redirect Analysis
Detect:
- redirect chains
- suspicious redirect depth
- hidden redirect behavior

---

## 6.3 Threat Intelligence Integrations

### APIs
- VirusTotal
- Google Safe Browsing
- OpenPhish
- PhishTank
- AbuseIPDB

### Fallback
If APIs unavailable:
- simulate realistic responses
- maintain believable scan flow

---

## 6.4 Risk Scoring Engine

### Risk Categories
- SAFE
- LOW RISK
- SUSPICIOUS
- HIGH RISK
- MALICIOUS
- CRITICAL

### Weighted Scoring
Examples:
- suspicious TLD → +25
- blacklist match → +50
- high entropy → +20
- redirect abuse → +15
- valid SSL → -5 only

IMPORTANT:
HTTPS must NEVER automatically mark a website safe.

---

## 6.5 Threat Explanation Engine

The platform must explain:
- what triggered detection
- why the URL is risky
- what the user should do next

Example:

“No confirmed malware detected, but several phishing indicators were identified.”

---

## 6.6 Screenshot & Behavioral Analysis

### Features
- website screenshot capture
- login form detection
- iframe detection
- suspicious JS detection
- hidden element detection

### Tools
- Playwright
- Headless browser automation

---

## 6.7 Scan History

Store:
- scanned URL
- timestamp
- risk score
- scan status
- threats detected
- screenshot

### Features
- search
- filter
- sort
- export

---

## 6.8 Dashboard Analytics

Display:
- total scans
- suspicious scans
- malicious scans
- common attack patterns
- scan activity graphs

---

## 6.9 AI Security Assistant

### Capabilities
- explain phishing threats
- simplify technical terms
- provide cyber safety guidance
- educate users

---

## 6.10 Exportable Reports

Generate downloadable:
- PDF reports
- threat summaries
- scan logs

---

# 7. Frontend Requirements

## UI Style
- premium
- minimal
- spacious
- modern
- smooth

## UI Components
- large search bar
- elegant scan states
- subtle transitions
- modern cards
- confidence bars
- thin dividers
- muted typography

## Animations
- soft motion
- smooth hover states
- progressive loading
- skeleton loaders

---

# 8. Backend Requirements

## Architecture

### Suggested Stack
Frontend:
- Next.js
- TailwindCSS

Backend:
- FastAPI
- Python

Database:
- PostgreSQL

Cache:
- Redis

Queue:
- Celery / Background Workers

Automation:
- Playwright

Deployment:
- Vercel
- Railway / Render

---

# 9. Backend Architecture

## Suggested Structure

```txt
backend/
 ├── app/
 │   ├── routes/
 │   ├── scanners/
 │   ├── analyzers/
 │   ├── services/
 │   ├── ai/
 │   ├── utils/
 │   ├── database/
 │   └── models/
 ├── workers/
 ├── tests/
 └── main.py
```

---

# 10. Security Principles

## Must Follow
- never falsely guarantee safety
- avoid binary safe/dangerous logic
- provide confidence explanations
- prioritize transparency

## Example
Instead of:
“SAFE”

Use:
“No known threats detected at this time.”

---

# 11. Future Roadmap

## Phase 1
- URL heuristics
- scan UI
- risk scoring
- history

## Phase 2
- VirusTotal integration
- Google Safe Browsing
- screenshots

## Phase 3
- AI threat analysis
- phishing classification
- behavior detection

## Phase 4
- browser extension
- public APIs
- real-time monitoring
- SOC dashboard

---

# 12. Success Criteria

The product should:
- look premium
- feel realistic
- provide believable analysis
- demonstrate strong engineering skills
- impress recruiters
- showcase AI + backend + cybersecurity understanding



# README.md

# BlackTrace

AI-powered phishing and malicious URL intelligence platform.

BlackTrace analyzes URLs using layered threat analysis, domain intelligence, behavioral detection, and threat reputation systems to identify suspicious or malicious websites.

---

# Features

- AI-assisted phishing detection
- URL heuristic analysis
- Suspicious TLD detection
- Entropy analysis
- Brand impersonation detection
- Redirect analysis
- Threat intelligence integrations
- Screenshot & behavioral scanning
- Risk scoring engine
- Human-readable threat explanations
- Scan history dashboard
- Exportable PDF reports

---

# Tech Stack

## Frontend
- Next.js
- TailwindCSS
- Framer Motion

## Backend
- FastAPI
- Python
- PostgreSQL
- Redis
- Celery

## Security APIs
- VirusTotal
- Google Safe Browsing
- OpenPhish
- PhishTank

## Automation
- Playwright

---

# Project Structure

```txt
frontend/
backend/

backend/
 ├── app/
 │   ├── routes/
 │   ├── scanners/
 │   ├── analyzers/
 │   ├── services/
 │   ├── ai/
 │   ├── utils/
 │   ├── database/
 │   └── models/
 ├── workers/
 ├── tests/
 └── main.py
```

---

# Core Detection Systems

## URL Heuristics
- suspicious keywords
- excessive subdomains
- URL length analysis
- encoded characters
- suspicious parameters

## Domain Intelligence
- WHOIS analysis
- domain age
- DNS analysis
- IP lookup
- registrar reputation

## Threat Intelligence
- VirusTotal
- Google Safe Browsing
- OpenPhish
- PhishTank

## Behavioral Analysis
- redirects
- login forms
- hidden iframes
- suspicious JavaScript

---

# Risk Categories

- SAFE
- LOW RISK
- SUSPICIOUS
- HIGH RISK
- MALICIOUS
- CRITICAL

---

# UI Philosophy

BlackTrace is designed to feel:
- modern
- minimal
- premium
- calm
- intelligent

Inspired by:
- Linear
- Vercel
- Stripe
- Tailscale
- Retool

---

# Getting Started

## Install Dependencies

```bash
npm install
```

## Run Frontend

```bash
npm run dev
```

## Run Backend

```bash
uvicorn main:app --reload
```

---

# Future Improvements

- browser extension
- live threat feeds
- AI phishing classifier
- SOC dashboard
- websocket scan updates
- public API access

---

# Disclaimer

BlackTrace is designed for educational and defensive cybersecurity purposes only.

It should not be used for offensive or malicious activities.

