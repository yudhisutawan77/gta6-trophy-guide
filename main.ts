// Leonida trophy guide — hand-in script for gta6-trophy-guide-01.
//
// This script assembles the submission folder for the judge. It copies the
// finished guide (the static files under app/) and its rendered screenshots
// (screenshots/) into the hand-in folder, then asks the vendored make.fun
// helper to write dossier.json — the summary the judge reads — into that
// same folder. Run it with plain Node 22, for example:
//
//   MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The grader sets MAKEFUN_OUTPUT_DIR to its own /output and runs this script
// twice, expecting byte-identical results, so nothing here reads the clock,
// rolls dice, or depends on what the destination already contains.
//
// One deliberate choice: the hand-in folder is created with mkdirSync but
// never deleted. In the grader /output is a mounted directory, and removing
// a mount point fails with "Device or resource busy", which would crash the
// run before any output is produced. Building on top of whatever is already
// there is safe here because every path we write (app/, screenshots/,
// dossier.json) is fully overwritten by the copies below, so no stale file
// from an earlier run can leak into the hand-in. The only non-stdlib import
// is the vendored make.fun library, which must be left untouched — the
// scorer rebuilds dossier.json from its own copy and the two must agree.

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

// Folder this script lives in, and the folder the judge collects from.
const guideRoot = dirname(fileURLToPath(import.meta.url));
const handIn = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

mkdirSync(handIn, { recursive: true });

// Copy the guide first, then make room for its screenshots and copy those
// in when the folder is present. The first screenshot by name is the cover.
cpSync(join(guideRoot, "app"), join(handIn, "app"), { recursive: true });
mkdirSync(join(handIn, "screenshots"), { recursive: true });
if (existsSync(join(guideRoot, "screenshots"))) {
  cpSync(join(guideRoot, "screenshots"), join(handIn, "screenshots"), { recursive: true });
}

// Caps the scorer enforces: at most 4 screenshots at 256 KiB each, at most
// 993 files and 48 MiB under app/, and a dossier text of at most 160 KiB.
const dossierCaps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

writeFileSync(join(handIn, "dossier.json"), buildDossier(handIn, dossierCaps));
