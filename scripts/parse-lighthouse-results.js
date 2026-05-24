#!/usr/bin/env node

/**
 * parse-lighthouse-results.js
 * 
 * Parses Lighthouse CI result JSON files and generates a markdown performance report.
 * 
 * Usage:
 *   node scripts/parse-lighthouse-results.js [results-dir]
 * 
 * Arguments:
 *   results-dir  Path to .lighthouseci directory (default: ./.lighthouseci)
 * 
 * Output:
 *   - Prints a markdown report to stdout
 *   - Writes report to report.md in the results directory
 *   - Sets GitHub Actions outputs: report, passed, summary
 *   - Exit code 0 if all thresholds passed, 1 if any failed
 */

const fs = require('fs');
const path = require('path');

// ─── Thresholds (must match lighthouserc.js) ────────────────────────────────────

const THRESHOLDS = {
  'performance-score': { min: 90, unit: '', label: 'Performance Score' },
  'largest-contentful-paint': { max: 2500, unit: 'ms', label: 'Largest Contentful Paint (LCP)' },
  'first-contentful-paint': { max: 3000, unit: 'ms', label: 'First Contentful Paint (FCP)' },
  'cumulative-layout-shift': { max: 0.1, unit: '', label: 'Cumulative Layout Shift (CLS)' },
  'total-blocking-time': { max: 200, unit: 'ms', label: 'Total Blocking Time (TBT)' },
};

// ─── Parse Results ──────────────────────────────────────────────────────────────

function findResultFiles(dir) {
  if (!fs.existsSync(dir)) {
    console.error(`❌ Results directory not found: ${dir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(dir)
    .filter(f => f.startsWith('lhr-') && f.endsWith('.json'))
    .map(f => path.join(dir, f));

  if (files.length === 0) {
    console.error('❌ No Lighthouse result files (lhr-*.json) found');
    process.exit(1);
  }

  return files;
}

function extractMetrics(lhr) {
  const { audits, categories, requestedUrl, finalUrl } = lhr;

  return {
    url: requestedUrl || finalUrl || 'unknown',
    metrics: {
      'performance-score': Math.round((categories?.performance?.score || 0) * 100),
      'largest-contentful-paint': Math.round(audits?.['largest-contentful-paint']?.numericValue || 0),
      'first-contentful-paint': Math.round(audits?.['first-contentful-paint']?.numericValue || 0),
      'cumulative-layout-shift': parseFloat((audits?.['cumulative-layout-shift']?.numericValue || 0).toFixed(3)),
      'total-blocking-time': Math.round(audits?.['total-blocking-time']?.numericValue || 0),
    },
  };
}

function checkThresholds(metrics) {
  const results = {};
  let allPassed = true;

  for (const [key, threshold] of Object.entries(THRESHOLDS)) {
    const value = metrics[key];
    let passed;

    if (threshold.min !== undefined) {
      passed = value >= threshold.min;
    } else {
      passed = value <= threshold.max;
    }

    if (!passed) allPassed = false;

    results[key] = {
      label: threshold.label,
      value,
      threshold: threshold.min !== undefined ? `≥ ${threshold.min}` : `≤ ${threshold.max}`,
      unit: threshold.unit,
      passed,
    };
  }

  return { results, allPassed };
}

// ─── Group by URL (median of multiple runs) ─────────────────────────────────────

function groupByUrl(allResults) {
  const groups = {};

  for (const result of allResults) {
    const url = result.url;
    if (!groups[url]) groups[url] = [];
    groups[url].push(result.metrics);
  }

  // Take the median run for each URL (based on performance score)
  const medians = {};
  for (const [url, runs] of Object.entries(groups)) {
    runs.sort((a, b) => a['performance-score'] - b['performance-score']);
    const medianIndex = Math.floor(runs.length / 2);
    medians[url] = runs[medianIndex];
  }

  return medians;
}

// ─── Generate Report ────────────────────────────────────────────────────────────

function generateReport(urlMetrics) {
  let report = '';
  let overallPassed = true;
  const summaryLines = [];

  report += '## 📊 Lighthouse Performance Report\n\n';
  report += `> Tested ${Object.keys(urlMetrics).length} page(s) with 3 runs each (median shown)\n\n`;

  for (const [url, metrics] of Object.entries(urlMetrics)) {
    const { results, allPassed } = checkThresholds(metrics);

    if (!allPassed) overallPassed = false;

    const urlPath = (() => {
      try { return new URL(url).pathname; } catch { return url; }
    })();

    const statusIcon = allPassed ? '✅' : '❌';
    report += `### ${statusIcon} \`${urlPath}\`\n\n`;
    report += '| Metric | Value | Threshold | Status |\n';
    report += '|--------|-------|-----------|--------|\n';

    for (const [, result] of Object.entries(results)) {
      const icon = result.passed ? '✅' : '❌';
      const valueStr = result.unit
        ? `${result.value}${result.unit}`
        : `${result.value}`;
      const thresholdStr = result.unit
        ? `${result.threshold}${result.unit}`
        : result.threshold;

      report += `| ${result.label} | **${valueStr}** | ${thresholdStr} | ${icon} |\n`;

      if (!result.passed) {
        summaryLines.push(`❌ ${urlPath}: ${result.label} = ${valueStr} (threshold: ${thresholdStr})`);
      }
    }

    report += '\n';
  }

  // Overall verdict
  report += '---\n\n';
  if (overallPassed) {
    report += '### ✅ Overall: All performance thresholds met!\n';
  } else {
    report += '### ❌ Overall: Some performance thresholds were NOT met\n\n';
    report += '**Failed checks:**\n';
    summaryLines.forEach(line => {
      report += `- ${line}\n`;
    });
  }

  return { report, overallPassed, summaryLines };
}

// ─── Main ───────────────────────────────────────────────────────────────────────

function main() {
  const resultsDir = process.argv[2] || path.resolve(process.cwd(), '.lighthouseci');

  console.log(`📂 Reading results from: ${resultsDir}\n`);

  // Find and parse all result files
  const resultFiles = findResultFiles(resultsDir);
  console.log(`📄 Found ${resultFiles.length} result file(s)\n`);

  const allResults = resultFiles.map(file => {
    const raw = fs.readFileSync(file, 'utf8');
    const lhr = JSON.parse(raw);
    return extractMetrics(lhr);
  });

  // Group by URL and take medians
  const urlMetrics = groupByUrl(allResults);

  // Generate the report
  const { report, overallPassed, summaryLines } = generateReport(urlMetrics);

  // Print report to stdout
  console.log(report);

  // Write report file
  const reportPath = path.join(resultsDir, 'report.md');
  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`\n📝 Report written to: ${reportPath}`);

  // Set GitHub Actions outputs
  if (process.env.GITHUB_OUTPUT) {
    // Use delimiter for multiline output
    const delimiter = `REPORT_${Date.now()}`;
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `report<<${delimiter}\n${report}\n${delimiter}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `passed=${overallPassed}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `summary=${summaryLines.join(' | ')}\n`);
  }

  // Write report to a separate file for easy reading in other steps
  const reportJsonPath = path.join(resultsDir, 'report.json');
  fs.writeFileSync(reportJsonPath, JSON.stringify({
    passed: overallPassed,
    report,
    summaryLines,
    urlMetrics,
    timestamp: new Date().toISOString(),
  }, null, 2), 'utf8');

  // Exit with appropriate code
  process.exit(overallPassed ? 0 : 1);
}

main();
