import asyncio
import json
import os
from pathlib import Path

from TikTokLive import TikTokLiveClient

USERNAME = os.getenv("TIKTOK_USERNAME", "DannyMacF1").lstrip("@")
STATUS_FILE = Path("status.json")

async def main():
    live = False
    try:
        client = TikTokLiveClient(unique_id=f"@{USERNAME}")
        live = bool(await asyncio.wait_for(client.is_live(), timeout=25))
    except Exception as exc:
        # Fail closed: never publish a LIVE banner when the status check fails.
        print(f"LIVE status check failed; publishing offline-safe status: {type(exc).__name__}: {exc}")
        live = False

    data = {
        "live": live,
        "username": USERNAME,
    }
    STATUS_FILE.write_text(json.dumps(data, indent=2) + "\\n", encoding="utf-8")
    print(f"@{USERNAME}: {'LIVE' if live else 'not confirmed live'}")

if __name__ == "__main__":
    asyncio.run(main())
