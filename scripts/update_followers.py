#!/usr/bin/env python3
"""Best-effort follower-count updater using TikTok's public profile page."""
import json, os, re, sys
from datetime import datetime, timezone
from pathlib import Path
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
URL = "https://www.tiktok.com/@DannyMacF1"
OUT = ROOT / "followers.json"

def main():
    request = urllib.request.Request(URL, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept-Language": "en-GB,en;q=0.9",
    })
    try:
        with urllib.request.urlopen(request, timeout=25) as response:
            html = response.read().decode("utf-8", "replace")
        # TikTok embeds the public profile data in its page JSON. Do not guess a count.
        patterns = [
            r'"followerCount"\s*:\s*(\d+)',
            r'\\?"followerCount\\?"\s*:\s*(\d+)',
        ]
        matches = []
        for pattern in patterns:
            matches.extend(re.findall(pattern, html))
        if not matches:
            raise RuntimeError("TikTok did not expose a followerCount in the returned page")
        count = int(matches[0])
        if count < 0:
            raise RuntimeError("Invalid follower count")
        payload = {
            "username": "DannyMacF1",
            "followers": count,
            "updatedAt": datetime.now(timezone.utc).isoformat(),
            "source": "TikTok public profile page",
        }
        OUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
        print(f"Updated follower count: {count:,}")
    except Exception as exc:
        print(f"Could not refresh TikTok follower count: {exc}", file=sys.stderr)
        # Keep the previous snapshot if TikTok blocks scraping or changes its page.
        if not OUT.exists():
            OUT.write_text(json.dumps({"username":"DannyMacF1","followers":None,"updatedAt":None,"source":"TikTok public profile page"}, indent=2)+"\n", encoding="utf-8")
        sys.exit(1)

if __name__ == "__main__":
    main()
