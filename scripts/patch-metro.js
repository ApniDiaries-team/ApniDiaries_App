// scripts/patch-metro.js
// Run via postinstall to fix Windows D:\ ESM loader bug in metro-config
// Safe to run on all platforms — no-ops on non-Windows

const fs = require("fs");
const path = require("path");

const candidates = [
  path.join(
    __dirname,
    "..",
    "node_modules",
    "metro-config",
    "src",
    "loadConfig.js",
  ),
  path.join(
    __dirname,
    "..",
    "node_modules",
    "metro-config",
    "build",
    "loadConfig.js",
  ),
];

let patched = false;

for (const filePath of candidates) {
  if (!fs.existsSync(filePath)) continue;

  let src = fs.readFileSync(filePath, "utf8");

  if (src.includes("_ptfu_patched")) {
    console.log("[patch-metro] Already patched:", filePath);
    patched = true;
    continue;
  }

  if (!src.includes("await import(")) {
    continue;
  }

  // Prepend the URL helper
  src =
    `// _ptfu_patched\nconst { pathToFileURL: _ptfu } = require('url');\n` +
    src;

  // Replace all await import(someVar) with Windows-safe version
  src = src.replace(/await import\(([^)]+)\)/g, (match, arg) => {
    const trimmed = arg.trim();
    return `await import(process.platform === 'win32' && typeof ${trimmed} === 'string' && !${trimmed}.startsWith('file:') ? _ptfu(${trimmed}).href : ${trimmed})`;
  });

  fs.writeFileSync(filePath, src, "utf8");
  console.log("[patch-metro] ✅ Patched:", filePath);
  patched = true;
}

if (!patched) {
  console.log(
    "[patch-metro] Nothing to patch (metro-config not found or no dynamic imports).",
  );
}
