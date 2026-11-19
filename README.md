# Leonida Trophy Guide — GTA VI

[![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/yudhisutawan77/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/yudhisutawan77/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI: every trophy with its official name, description and grade, a guide in our own words with its sources cited beside it, a five-phase roadmap to the Platinum, a warning for the one missable trophy, and a checklist that saves your progress in the browser and can be exported and imported again.

## How it works

Open `app/index.html` in any browser, or serve `app/` with any static file server (`node serve.ts` serves it on http://localhost:8080). No build step, no network: the only file the app fetches is its own `app/data/trophies.json`, and the only thing it stores is your progress in `localStorage`.

- **Progress to Platinum** — a live count (X of 55), percentage bar, and earned counts by grade.
- **Roadmap to the Platinum** — five phases in play order, built only from the official descriptions: story, partner and exploration, stranger strands, activities and races, then collectibles, robberies and clean-up.
- **Missable warning** — Positive Mental Attitude is the list's one missable trophy: a Chapter 1 meditation spot is reported to disappear after that chapter, and the game has no mission replay, so the guide tells you to meditate there first and keep a manual save at the start of every chapter.
- **Checklist** — tick a trophy off and it stays ticked across reloads; search by name, mission or keyword; filter by kind (story, missable, collectibles, activities, online) and by grade; export progress to JSON and import it back.
- **Spoiler hiding** — on by default: story trophy names and descriptions stay hidden until you earn them (or turn the setting off).
- **Cited guides** — every trophy's guide names its sources beside it, with clickable links. GTA VI launches 19 November 2026, so where an official description gives no unlock method, the guide says so honestly instead of inventing one.

## Honesty note

Names, descriptions and grades are shown exactly as published in the 55-trophy list (Exophase list, reported by Push Square on 18 November 2026; 1 Platinum, 2 Gold, 6 Silver, 46 Bronze; 28 hidden; no online trophies). Guides are written for this entry from those descriptions. Counts and steps that appear in a guide are either stated in the description itself or attributed to a named source next to the guide.

## Files

- `app/index.html`, `app/style.css`, `app/app.js` — the guide (original design, no Rockstar logo, artwork or game screenshots).
- `app/data/trophies.json` — all 55 trophies: official name, description, grade, kind, missable flag, guide and sources.
- `screenshots/` — four renders of the guide at 1280×800 (see `shots.json`).
- `main.ts` — hands the entry in: copies `app/` and `screenshots/` to the output folder and writes `dossier.json` with the vendored make.fun library.
- `serve.ts` — tiny static server for local testing.

## Verifying it locally

```sh
node serve.ts            # serves app/ on http://localhost:8080
MAKEFUN_OUTPUT_DIR=out node main.ts   # hands the entry in to out/
```

Check that the checklist ticks survive a reload, that export/import round-trips, that the spoiler toggle hides story trophies until earned, and that the page works with the network off.

## Bounty

Built for the [GTA 6 trophy guide bounty on make.fun](https://make.fun/bounty/gta6-trophy-guide-01) (`gta6-trophy-guide-01`).

## License

MIT — see `LICENSE`.
