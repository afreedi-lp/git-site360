#!/usr/bin/env node

/**
 * map-files-to-urls.js
 * 
 * Maps changed files from a GitHub PR to the Lighthouse URLs that should be tested.
 * 
 * Usage:
 *   node scripts/map-files-to-urls.js '<json-array-of-filenames>'
 * 
 * Example:
 *   node scripts/map-files-to-urls.js '["src/pages/Home/index.jsx","src/components/Header.jsx"]'
 * 
 * Output:
 *   - Prints the URL list as a JSON array to stdout
 *   - Sets GITHUB_OUTPUT if running in GitHub Actions
 */

const fs = require('fs');
const path = require('path');

// ─── Load Config ────────────────────────────────────────────────────────────────

const CONFIG_PATH = path.resolve(__dirname, '..', 'route-map.config.json');

function loadConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('❌ Error: Could not load route-map.config.json');
    console.error(`   Expected at: ${CONFIG_PATH}`);
    console.error(`   ${err.message}`);
    process.exit(1);
  }
}

// ─── Map Files to URLs ─────────────────────────────────────────────────────────

function mapFilesToUrls(changedFiles, config) {
  const { routeMap, sharedPaths = [], defaultUrls = ['/'], baseUrl = 'http://localhost:3000' } = config;
  const urls = new Set();
  let testAllPages = false;

  for (const file of changedFiles) {
    // Check if the file is in a shared path (affects all pages)
    for (const sharedPath of sharedPaths) {
      if (file.startsWith(sharedPath) || file.includes(sharedPath)) {
        testAllPages = true;
        break;
      }
    }

    if (testAllPages) break;

    // Check against specific route mappings
    for (const [srcPath, urlPath] of Object.entries(routeMap)) {
      if (file.startsWith(srcPath)) {
        urls.add(urlPath);
      }
    }
  }

  // If shared components changed, test ALL mapped routes
  if (testAllPages) {
    const allUrls = Object.values(routeMap);
    allUrls.forEach(url => urls.add(url));
  }

  // If no URLs matched, use defaults
  if (urls.size === 0) {
    defaultUrls.forEach(url => urls.add(url));
  }

  // Convert to full URLs
  const fullUrls = Array.from(urls).map(u =>
    u.startsWith('http') ? u : `${baseUrl}${u.startsWith('/') ? u : '/' + u}`
  );

  return fullUrls;
}

// ─── Filter Relevant Files ──────────────────────────────────────────────────────

function filterRelevantFiles(files) {
  // Only consider source files that could affect page rendering
  const relevantExtensions = ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.less', '.svg', '.json'];
  const excludePatterns = [
    /^\.github\//,
    /^\.vscode\//,
    /\/__tests__\//,
    /\.test\./,
    /\.spec\./,
    /\.stories\./,
    /^README/i,
    /^LICENSE/i,
    /^CHANGELOG/i,
    /^\.eslint/,
    /^\.prettier/,
    /^jest\./,
  ];

  return files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    if (!relevantExtensions.includes(ext)) return false;
    if (excludePatterns.some(pattern => pattern.test(file))) return false;
    return true;
  });
}

// ─── Main ───────────────────────────────────────────────────────────────────────

function main() {
  // Parse input: expect a JSON array of filenames as the first argument
  const input = process.argv[2];

  if (!input) {
    console.error('❌ Usage: node map-files-to-urls.js \'<json-array-of-filenames>\'');
    console.error('   Example: node map-files-to-urls.js \'["src/pages/Home/index.jsx"]\'');
    process.exit(1);
  }

  let changedFiles;
  try {
    changedFiles = JSON.parse(input);
    if (!Array.isArray(changedFiles)) {
      throw new Error('Input must be a JSON array');
    }
  } catch (err) {
    console.error(`❌ Error parsing input: ${err.message}`);
    process.exit(1);
  }

  const config = loadConfig();

  // Filter to only relevant source files
  const relevantFiles = filterRelevantFiles(changedFiles);

  console.log(`📁 Total changed files: ${changedFiles.length}`);
  console.log(`🔍 Relevant source files: ${relevantFiles.length}`);

  if (relevantFiles.length > 0) {
    console.log('   Files considered:');
    relevantFiles.forEach(f => console.log(`     - ${f}`));
  }

  // Map to URLs
  const urls = mapFilesToUrls(relevantFiles, config);

  console.log(`\n🌐 URLs to test (${urls.length}):`);
  urls.forEach(url => console.log(`   → ${url}`));

  // Output for GitHub Actions
  const urlsJson = JSON.stringify(urls);

  // Write to GITHUB_OUTPUT if available
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `urls=${urlsJson}\n`);
    console.log('\n✅ URLs written to GITHUB_OUTPUT');
  }

  // Always print the JSON to stdout for piping
  console.log(`\n::set-output name=urls::${urlsJson}`);

  // Also write a flat list for easier consumption
  const urlPathsJson = JSON.stringify(
    urls.map(u => {
      try { return new URL(u).pathname; } catch { return u; }
    })
  );
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `url_paths=${urlPathsJson}\n`);
  }
}

main();
