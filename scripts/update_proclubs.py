#!/usr/bin/env python3
"""Fetch public EA FC 27 Pro Clubs data for TTDM United and publish a static JSON snapshot."""
import json
import os
import sys
import time
from datetime import datetime, timezone
from urllib.parse import urlencode
from urllib.request import Request, urlopen

BASE = "https://proclubs.ea.com/api/fc/"
PLATFORM = os.environ.get("FC_PLATFORM", "common-gen5")
CLUB_NAME = os.environ.get("FC_CLUB_NAME", "TTDM United")
OUTPUT = "proclubs.json"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Origin": "https://www.ea.com",
    "Referer": "https://www.ea.com/",
}


def get_json(endpoint, params):
    url = BASE + endpoint + "?" + urlencode({"platform": PLATFORM, **params})
    request = Request(url, headers=HEADERS)
    with urlopen(request, timeout=25) as response:
        return json.loads(response.read().decode("utf-8"))


def as_int(value, default=0):
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return default


def first(item, *keys, default=""):
    for key in keys:
        if item.get(key) is not None and item.get(key) != "":
            return item[key]
    return default


def main():
    results = get_json("allTimeLeaderboard/search", {"clubName": CLUB_NAME, "maxResultCount": "50"})
    if not isinstance(results, list):
        raise RuntimeError("EA returned an unexpected club search response")
    exact = [r for r in results if str(first(r.get("clubInfo", {}), "name", default=first(r, "clubName", "name"))).strip().casefold() == CLUB_NAME.casefold()]
    if not exact:
        # Don't silently show a different club if EA's search did not find an exact match.
        payload = {"configured": False, "clubName": CLUB_NAME, "platform": PLATFORM, "message": f'Could not find an exact club named "{CLUB_NAME}" on {PLATFORM}. Check the club name/platform or set FC_CLUB_ID in the workflow.', "updatedAt": datetime.now(timezone.utc).isoformat()}
        with open(OUTPUT, "w", encoding="utf-8") as f: json.dump(payload, f, ensure_ascii=False, indent=2)
        print(payload["message"])
        return
    if len(exact) > 1:
        raise RuntimeError(f"EA returned multiple exact matches for {CLUB_NAME}; configure a club ID to avoid choosing the wrong team")
    found = exact[0]
    club_id = str(first(found, "clubId", default=first(found.get("clubInfo", {}), "clubId")))
    if not club_id:
        raise RuntimeError("EA search result did not contain a club ID")

    time.sleep(1)
    overall_response = get_json("clubs/overallStats", {"clubIds": club_id})
    overall = (overall_response[0] if isinstance(overall_response, list) and overall_response else {})
    time.sleep(1)
    member_response = get_json("members/stats", {"clubId": club_id})
    members = member_response.get("members", []) if isinstance(member_response, dict) else []
    time.sleep(1)
    match_response = get_json("clubs/matches", {"clubIds": club_id, "matchType": "leagueMatch"})

    # EA's match response is commonly a list of records; tolerate the keyed raw form too.
    if isinstance(match_response, dict):
        matches = match_response.get(club_id, match_response.get("matches", []))
        if isinstance(matches, dict): matches = list(matches.values())
    elif isinstance(match_response, list):
        matches = match_response
    else:
        matches = []
    recent = []
    for match in matches[:5]:
        if not isinstance(match, dict): continue
        home = match.get("clubs", {}).get(club_id, {}) if isinstance(match.get("clubs"), dict) else {}
        if not home:
            home = match.get(club_id, {}) if isinstance(match.get(club_id), dict) else match
        goals = as_int(first(home, "goals", "goalsFor", default=first(match, "goals")))
        against = as_int(first(home, "goalsAgainst", "opponentGoals", default=first(match, "goalsAgainst")))
        opponent = first(match, "opponentName", "opponentClubName", default="Opponent")
        if isinstance(match.get("clubs"), dict):
            for other_id, other in match["clubs"].items():
                if other_id != club_id and isinstance(other, dict):
                    opponent = first(other, "name", "clubName", default=opponent)
                    if opponent == "Opponent": opponent = f"Club {other_id}"
                    break
        timestamp = as_int(first(match, "timestamp", "matchDate", default=first(home, "timestamp")))
        result = "DRAW" if goals == against else ("WIN" if goals > against else "LOSS")
        recent.append({"opponent": str(opponent), "goals": goals, "goalsAgainst": against, "result": result, "timestamp": timestamp})

    clean_members = []
    for member in members:
        if not isinstance(member, dict): continue
        clean_members.append({
            "name": str(first(member, "name", default="Unknown player")),
            "position": str(first(member, "favoritePosition", "position", default="—") or "—").upper(),
            "gamesPlayed": as_int(first(member, "gamesPlayed")),
            "goals": as_int(first(member, "goals")),
            "assists": as_int(first(member, "assists")),
            "rating": first(member, "ratingAve", "averageRating", default="—") or "—",
        })
    clean_members.sort(key=lambda p: (-p["goals"], -p["assists"], p["name"].casefold()))

    payload = {
        "configured": True, "clubName": str(first(found.get("clubInfo", {}), "name", default=first(found, "clubName", "name", default=CLUB_NAME))),
        "clubId": club_id, "platform": PLATFORM, "updatedAt": datetime.now(timezone.utc).isoformat(),
        "stats": {"wins": as_int(first(overall, "wins", default=first(found, "wins"))), "draws": as_int(first(overall, "ties", "draws", default=first(found, "ties"))), "losses": as_int(first(overall, "losses", default=first(found, "losses"))), "goals": as_int(first(overall, "goals", default=first(found, "goals"))), "goalsAgainst": as_int(first(overall, "goalsAgainst", default=first(found, "goalsAgainst"))), "gamesPlayed": as_int(first(overall, "gamesPlayed", default=first(found, "gamesPlayed"))), "skillRating": first(overall, "skillRating", default="—"), "currentDivision": first(found, "currentDivision", default="—")},
        "players": clean_members, "matches": recent,
    }
    with open(OUTPUT, "w", encoding="utf-8") as f: json.dump(payload, f, ensure_ascii=False, indent=2)
    print(f"Published data for {payload['clubName']} (club ID {club_id}), {len(clean_members)} squad members")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"Pro Clubs data sync failed: {exc}", file=sys.stderr)
        sys.exit(1)
