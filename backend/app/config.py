import os
from dotenv import load_dotenv

load_dotenv()

VIRUSTOTAL_API_KEY = os.getenv("VIRUSTOTAL_API_KEY", "")
GOOGLE_SAFE_BROWSING_API_KEY = os.getenv("GOOGLE_SAFE_BROWSING_API_KEY", "")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
ALIENVAULT_API_KEY = os.getenv("ALIENVAULT_API_KEY", "")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./blacktrace.db")
