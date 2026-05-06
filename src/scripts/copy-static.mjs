import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  watch,
} from "node:fs";
import { join } from "node:path";

const DIST_DIR = "dist";
const PUBLIC_DIR = "public";
const MANIFEST_FILE = "manifest.json";
const isWatchMode = process.argv.includes("--watch");

function copyFile(source, target) {
  if (!existsSync(source)) return;
  mkdirSync(join(target, ".."), { recursive: true });
  cpSync(source, target);
}

function copyDirectoryContents(sourceDir, targetDir) {
  if (!existsSync(sourceDir)) return;

  mkdirSync(targetDir, { recursive: true });

  for (const entry of readdirSync(sourceDir)) {
    const source = join(sourceDir, entry);
    const target = join(targetDir, entry);

    if (statSync(source).isDirectory()) {
      cpSync(source, target, { recursive: true });
    } else {
      copyFile(source, target);
    }
  }
}

function copyStatic() {
  mkdirSync(DIST_DIR, { recursive: true });
  copyDirectoryContents(PUBLIC_DIR, DIST_DIR);
  copyFile(MANIFEST_FILE, join(DIST_DIR, MANIFEST_FILE));
  console.log("[copy-static] static files copied to dist");
}

copyStatic();

if (isWatchMode) {
  let timer;

  const scheduleCopy = () => {
    clearTimeout(timer);
    timer = setTimeout(copyStatic, 100);
  };

  if (existsSync(PUBLIC_DIR)) {
    watch(PUBLIC_DIR, { recursive: true }, scheduleCopy);
  }

  if (existsSync(MANIFEST_FILE)) {
    watch(MANIFEST_FILE, scheduleCopy);
  }

  console.log("[copy-static] watching manifest.json and public/");
}
