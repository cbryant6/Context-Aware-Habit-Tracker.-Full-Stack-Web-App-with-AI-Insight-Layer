/**
 * Security check script — scans the codebase for potential secret leaks.
 *
 * Run: npm run security-check
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

const SECRET_PATTERNS = [
  { name: "Supabase service role key", pattern: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/ },
  { name: "Anthropic API key", pattern: /sk-ant-[A-Za-z0-9_-]{20,}/ },
  { name: "Generic API key assignment", pattern: /(?:api_key|apikey|secret_key|(?<!DEMO_)password)\s*[:=]\s*["'][A-Za-z0-9_\-/.]{20,}["']/i },
  { name: "AWS access key", pattern: /AKIA[0-9A-Z]{16}/ },
  { name: "Private key block", pattern: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/ },
];

const IGNORED_DIRS = new Set(["node_modules", ".next", ".git", ".vercel"]);
const ALLOWED_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".sql", ".css", ".md"]);

let issues = 0;

function scanFile(filePath: string) {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  for (const { name, pattern } of SECRET_PATTERNS) {
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        console.error(`  ❌ ${name} found in ${filePath}:${i + 1}`);
        issues++;
      }
    }
  }
}

function scanDir(dir: string) {
  for (const entry of readdirSync(dir)) {
    if (IGNORED_DIRS.has(entry) || entry.startsWith(".env")) continue;
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (ALLOWED_EXTENSIONS.has(extname(entry))) {
      scanFile(fullPath);
    }
  }
}

console.log("🔒 Running security check...\n");

// 1. Check .gitignore includes env files
const gitignore = readFileSync(".gitignore", "utf-8");
if (!gitignore.includes(".env")) {
  console.error("  ❌ .gitignore does not exclude .env files");
  issues++;
} else {
  console.log("  ✅ .gitignore excludes .env files");
}

// 2. Check .env.example exists and contains no real values
try {
  const envExample = readFileSync(".env.example", "utf-8");
  for (const { name, pattern } of SECRET_PATTERNS) {
    if (pattern.test(envExample)) {
      console.error(`  ❌ ${name} found in .env.example — should only contain placeholders`);
      issues++;
    }
  }
  console.log("  ✅ .env.example exists with placeholder values");
} catch {
  console.error("  ❌ .env.example not found — add one so contributors know which env vars are needed");
  issues++;
}

// 3. Scan source files for hardcoded secrets
console.log("  🔍 Scanning source files for hardcoded secrets...");
scanDir("src");
scanDir("scripts");
if (issues === 0) {
  console.log("  ✅ No hardcoded secrets found in source files");
}

// Summary
console.log("");
if (issues > 0) {
  console.error(`❌ Security check failed with ${issues} issue(s)\n`);
  process.exit(1);
} else {
  console.log("✅ All security checks passed\n");
}
