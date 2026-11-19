// Leonida Trophy Guide — hand-in program for the gta6-trophy-guide-01 bounty.
//
// What this program does, in one breath: it takes the finished guide (the
// static files in app/, plus the screenshots/ renders of them) and lays them
// out in the hand-in folder, then writes dossier.json there — the summary the
// judge reads — using the vendored make.fun library, which is the only
// non-stdlib import allowed. Run it with plain Node 22:
//
//   MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Outside the grader the MAKEFUN_OUTPUT_DIR variable stands in for /output.
// The grader runs this program twice and expects byte-identical results, so
// nothing here depends on the clock, on randomness, or on what was already
// in the destination: the destination is cleared and rebuilt from scratch
// on every run. vendor/makefun-frontend.ts is left exactly as the kit
// shipped it; the scorer rebuilds the dossier from its own copy and the
// two must match byte for byte.

import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const handInDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// Start clean so a stale file from an earlier run can never leak into a
// hand-in, and so the two grader runs always produce the same bytes.
rmSync(handInDir, { recursive: true, force: true });
mkdirSync(handInDir, { recursive: true });

// The guide itself, then its screenshots, then the dossier that describes
// both. The caps below mirror the scorer's own limits: at most 4 screenshots
// and 256 KiB each, at most 993 files and 48 MiB under app/, and a dossier
// text of at most 160 KiB.
cpSync(join(repoRoot, "app"), join(handInDir, "app"), { recursive: true });
cpSync(join(repoRoot, "screenshots"), join(handInDir, "screenshots"), { recursive: true });

const dossierOptions = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

writeFileSync(join(handInDir, "dossier.json"), buildDossier(handInDir, dossierOptions));
