import { mkdirSync, cpSync } from "node:fs";

mkdirSync("dist", { recursive: true });

cpSync("manifest.json", "dist/manifest.json");
