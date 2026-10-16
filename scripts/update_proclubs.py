
#!/usr/bin/env python3
"""Fetch public EA FC 27 Pro Clubs data for TTDM United."""
import json
import os
import sys
import time
from datetime import datetime, timezone
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

BASE = "https://proclubs.ea.com/api/fc/"
CLUB_NAME = os.environ.get("FC_CLUB_NAME", "TTDM United")
CLUB_ID = os.environ.get("FC_CLUB_ID", "155779")
PLATFORM = os.environ.get("FC_PLATFORM", "common-gen5")
OUTPUT = "proclubs.json"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/131.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-GB,en;q=0.9",
    "Origin": "https://www.ea.com",
    "Referer": (
        "https://www.ea.com/en-gb/games/ea-sports-fc/"
        "clubs/overview?clubId=155779&platform=common-gen5"
    ),
}


def get_json(endpoint, params):
    query = urlencode({"platform": PLATFORM, **params})
    request = Request(BASE + endpoint + "?" + query, headers=HEADERS)

    try:
        with urlopen(request, timeout=25) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        if exc.code == 403:
            raise RuntimeError(
                "EA returned HTTP 403 Forbidden. The EA API is blocking "
                "this request from GitHub Actions; changing the club ID "
                "will not fix that. Try again later or use another data source."
            ) from exc
        raise RuntimeError(
            f"EA returned HTTP {exc.code} for {endpoint}."
        ) from exc
    except URLError as exc:
        raise RuntimeError(
            f"Could not connect to EA for {endpoint}: {exc.reason}"
        ) from exc
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise RuntimeError(
            f"EA returned invalid JSON for {endpoint}."
        ) from exc


def as_int(value, default=0):
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return default


def first(item, *keys, default=""):
    if not isinstance(item, dict):
        return default
    for key in keys:
        if item.get(key) is not None and item.get(key) != "":
            return item[key]
    return default


def main():
    print(
        f"Fetching {CLUB_NAME}, club ID {CLUB_ID}, "
        f"platform {PLATFORM}"
    )

    time.sleep(1)
    overall_response = get_json(
        "clubs/overallStats", {"clubIds": CLUB_ID}
    )
    overall = (
        overall_response[0]
        if isinstance(overall_response, list) and overall_response
        else {}
    )

    time.sleep(1)
    member_response = get_json(
        "members/stats", {"clubId": CLUB_ID}
    )
    members = (
        member_response.get("members", [])
        if isinstance(member_response, dict)
        else []
    )

    time.sleep(1)
    match_response = get_json(
        "clubs/matches",
        {"clubIds": CLUB_ID, "matchType": "leagueMatch"},
    )

    if isinstance(match_response, dict):
        matches = match_response.get(
            CLUB_ID, match_response.get("matches", [])
        )
        if isinstance(matches, dict):
            matches = list(matches.values())
    elif isinstance(match_response, list):
        matches = match_response
    else:
        matches = []

    recent = []
    for match in matches[:5]:
        if not isinstance(match, dict):
            continue

        clubs = match.get("clubs", {})
        home = clubs.get(CLUB_ID, {}) if isinstance(clubs, dict) else {}
        if not home:
            home = match.get(CLUB_ID, {})
        if not isinstance(home, dict):
            home = match

        goals = as_int(first(home, "goals", "goalsFor",
                             default=first(match, "goals")))
        against = as_int(first(
            home, "goalsAgainst", "opponentGoals",
            default=first(match, "goalsAgainst")
        ))

        opponent = first(
            match, "opponentName", "opponentClubName",
            default="Opponent"
        )
        if isinstance(clubs, dict):
            for other_id, other in clubs.items():
                if other_id != CLUB_ID and isinstance(other, dict):
                    opponent = first(
                        other, "name", "clubName",
                        default=f"Club {other_id}"
                    )
                    break

        timestamp = as_int(first(
            match, "timestamp", "matchDate",
            default=first(home, "timestamp")
        ))
        result = "DRAW" if goals == against else (
            "WIN" if goals > against else "LOSS"
        )
        recent.append({
            "opponent": str(opponent),
            "goals": goals,
            "goalsAgainst": against,
            "result": result,
            "timestamp": timestamp,
        })

    clean_members = []
    for member in members:
        if not isinstance(member, dict):
            continue
        clean_members.append({
            "name": str(first(member, "name", default="Unknown player")),
            "position": str(first(
                member, "favoritePosition", "position", default="—"
            ) or "—").upper(),
            "gamesPlayed": as_int(first(member, "gamesPlayed")),
            "goals": as_int(first(member, "goals")),
            "assists": as_int(first(member, "assists")),
            "rating": first(
                member, "ratingAve", "averageRating", default="—"
            ) or "—",
        })

    clean_members.sort(
        key=lambda player: (
            -player["goals"], -player["assists"],
            player["name"].casefold()
        )
    )

    payload = {
        "configured": True,
        "clubName": CLUB_NAME,
        "clubId": CLUB_ID,
        "platform": PLATFORM,
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "stats": {
            "wins": as_int(first(overall, "wins")),
            "draws": as_int(first(overall, "ties", "draws")),
            "losses": as_int(first(overall, "losses")),
            "goals": as_int(first(overall, "goals")),
            "goalsAgainst": as_int(first(overall, "goalsAgainst")),
            "gamesPlayed": as_int(first(overall, "gamesPlayed")),
            "skillRating": first(overall, "skillRating", default="—"),
            "currentDivision": first(overall, "currentDivision", default="—"),
        },
        "players": clean_members,
        "matches": recent,
    }

    with open(OUTPUT, "w", encoding="utf-8") as file:
        json.dump(payload, file, ensure_ascii=False, indent=2)

    print(
        f"Published {CLUB_NAME} (ID {CLUB_ID}): "
        f"{len(clean_members)} players, {len(recent)} recent matches."
    )


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"Pro Clubs data sync failed: {exc}", file=sys.stderr)
        sys.exit(1)
