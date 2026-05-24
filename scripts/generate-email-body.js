#!/usr/bin/env node

/**
 * generate-email-body.js
 * 
 * Generates a professional HTML email body for PR approval notifications.
 * 
 * Usage:
 *   node scripts/generate-email-body.js \
 *     --pr-number 42 \
 *     --pr-title "Add dashboard page" \
 *     --pr-author "johndoe" \
 *     --pr-url "https://github.com/org/repo/pull/42" \
 *     --repo "org/repo" \
 *     --branch "feature/dashboard -> main" \
 *     --report-file ".lighthouseci/report.md" \
 *     --lighthouse-url "https://storage.googleapis.com/..."
 * 
 * Output:
 *   - Writes email HTML to stdout
 *   - Writes email.html file to .lighthouseci/ directory
 */

const fs = require('fs');
const path = require('path');

// ─── Parse CLI Arguments ────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 2) {
    const key = argv[i].replace(/^--/, '').replace(/-/g, '_');
    const value = argv[i + 1];
    args[key] = value;
  }
  return args;
}

// ─── Generate Email HTML ────────────────────────────────────────────────────────

function generateEmailHtml(params) {
  const {
    pr_number = '?',
    pr_title = 'Pull Request',
    pr_author = 'unknown',
    pr_url = '#',
    repo = 'unknown/repo',
    branch = 'feature -> main',
    report_file,
    lighthouse_url = '',
  } = params;

  // Read performance report if available
  let reportContent = '';
  if (report_file && fs.existsSync(report_file)) {
    reportContent = fs.readFileSync(report_file, 'utf8');
  }

  // Try to read the JSON report for structured data
  let metricsHtml = '';
  const reportJsonPath = report_file
    ? path.join(path.dirname(report_file), 'report.json')
    : null;

  if (reportJsonPath && fs.existsSync(reportJsonPath)) {
    try {
      const reportData = JSON.parse(fs.readFileSync(reportJsonPath, 'utf8'));
      const urlMetrics = reportData.urlMetrics || {};

      for (const [url, metrics] of Object.entries(urlMetrics)) {
        const urlPath = (() => {
          try { return new URL(url).pathname; } catch { return url; }
        })();

        metricsHtml += `
          <tr style="background-color: #1a1a2e;">
            <td colspan="3" style="padding: 12px 16px; color: #e94560; font-weight: 600; font-size: 14px; border-bottom: 1px solid #16213e;">
              📄 ${urlPath}
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 16px; border-bottom: 1px solid #16213e; color: #c4c4c4;">Performance Score</td>
            <td style="padding: 10px 16px; border-bottom: 1px solid #16213e; color: #ffffff; font-weight: 600;">${metrics['performance-score']}</td>
            <td style="padding: 10px 16px; border-bottom: 1px solid #16213e; color: ${metrics['performance-score'] >= 90 ? '#0cce6b' : '#e94560'};">${metrics['performance-score'] >= 90 ? '✅ Pass' : '❌ Fail'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 16px; border-bottom: 1px solid #16213e; color: #c4c4c4;">LCP</td>
            <td style="padding: 10px 16px; border-bottom: 1px solid #16213e; color: #ffffff; font-weight: 600;">${metrics['largest-contentful-paint']}ms</td>
            <td style="padding: 10px 16px; border-bottom: 1px solid #16213e; color: ${metrics['largest-contentful-paint'] <= 2500 ? '#0cce6b' : '#e94560'};">${metrics['largest-contentful-paint'] <= 2500 ? '✅ Pass' : '❌ Fail'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 16px; border-bottom: 1px solid #16213e; color: #c4c4c4;">FCP</td>
            <td style="padding: 10px 16px; border-bottom: 1px solid #16213e; color: #ffffff; font-weight: 600;">${metrics['first-contentful-paint']}ms</td>
            <td style="padding: 10px 16px; border-bottom: 1px solid #16213e; color: ${metrics['first-contentful-paint'] <= 1800 ? '#0cce6b' : '#e94560'};">${metrics['first-contentful-paint'] <= 1800 ? '✅ Pass' : '❌ Fail'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 16px; border-bottom: 1px solid #16213e; color: #c4c4c4;">CLS</td>
            <td style="padding: 10px 16px; border-bottom: 1px solid #16213e; color: #ffffff; font-weight: 600;">${metrics['cumulative-layout-shift']}</td>
            <td style="padding: 10px 16px; border-bottom: 1px solid #16213e; color: ${metrics['cumulative-layout-shift'] <= 0.1 ? '#0cce6b' : '#e94560'};">${metrics['cumulative-layout-shift'] <= 0.1 ? '✅ Pass' : '❌ Fail'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 16px; border-bottom: 1px solid #16213e; color: #c4c4c4;">TBT</td>
            <td style="padding: 10px 16px; border-bottom: 1px solid #16213e; color: #ffffff; font-weight: 600;">${metrics['total-blocking-time']}ms</td>
            <td style="padding: 10px 16px; border-bottom: 1px solid #16213e; color: ${metrics['total-blocking-time'] <= 200 ? '#0cce6b' : '#e94560'};">${metrics['total-blocking-time'] <= 200 ? '✅ Pass' : '❌ Fail'}</td>
          </tr>`;
      }
    } catch (e) {
      // Fallback: use plain text report
      metricsHtml = `
        <tr>
          <td colspan="3" style="padding: 16px; color: #c4c4c4; white-space: pre-wrap; font-family: monospace; font-size: 12px;">
            ${reportContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
          </td>
        </tr>`;
    }
  }

  const lighthouseLinkHtml = lighthouse_url
    ? `<a href="${lighthouse_url}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea, #764ba2); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 8px;">📊 View Full Lighthouse Report</a>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 640px; margin: 0 auto; padding: 24px;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0cce6b, #0a9d51); border-radius: 16px 16px 0 0; padding: 32px 24px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
        ✅ Pull Request Approved
      </h1>
      <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">
        All automated checks passed successfully
      </p>
    </div>

    <!-- PR Details -->
    <div style="background-color: #16213e; padding: 24px; border-left: 1px solid #1a1a3e; border-right: 1px solid #1a1a3e;">
      <h2 style="margin: 0 0 16px; color: #e94560; font-size: 18px; font-weight: 600;">
        📋 Pull Request Details
      </h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #8892b0; font-size: 13px; width: 120px;">Repository</td>
          <td style="padding: 8px 0; color: #ffffff; font-size: 13px; font-weight: 500;">${repo}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #8892b0; font-size: 13px;">PR Number</td>
          <td style="padding: 8px 0; color: #ffffff; font-size: 13px; font-weight: 500;">#${pr_number}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #8892b0; font-size: 13px;">Title</td>
          <td style="padding: 8px 0; color: #ffffff; font-size: 13px; font-weight: 500;">${pr_title}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #8892b0; font-size: 13px;">Author</td>
          <td style="padding: 8px 0; color: #ffffff; font-size: 13px; font-weight: 500;">@${pr_author}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #8892b0; font-size: 13px;">Branch</td>
          <td style="padding: 8px 0; color: #ffffff; font-size: 13px; font-weight: 500;">${branch}</td>
        </tr>
      </table>
    </div>

    <!-- Performance Metrics -->
    <div style="background-color: #0f3460; padding: 24px; border-left: 1px solid #1a1a3e; border-right: 1px solid #1a1a3e;">
      <h2 style="margin: 0 0 16px; color: #e94560; font-size: 18px; font-weight: 600;">
        ⚡ Performance Metrics
      </h2>
      <table style="width: 100%; border-collapse: collapse; background-color: #16213e; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background-color: #1a1a2e;">
            <th style="padding: 12px 16px; text-align: left; color: #8892b0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e94560;">Metric</th>
            <th style="padding: 12px 16px; text-align: left; color: #8892b0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e94560;">Value</th>
            <th style="padding: 12px 16px; text-align: left; color: #8892b0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e94560;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${metricsHtml || `
          <tr>
            <td colspan="3" style="padding: 16px; color: #c4c4c4; text-align: center;">
              Detailed metrics available in the full Lighthouse report
            </td>
          </tr>`}
        </tbody>
      </table>
    </div>

    <!-- Actions -->
    <div style="background-color: #16213e; padding: 24px; text-align: center; border-left: 1px solid #1a1a3e; border-right: 1px solid #1a1a3e;">
      <a href="${pr_url}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #e94560, #c23152); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
        🔗 View Pull Request on GitHub
      </a>
      <br><br>
      ${lighthouseLinkHtml}
    </div>

    <!-- Footer -->
    <div style="background-color: #0a0a1a; border: 1px solid #1a1a3e; border-radius: 0 0 16px 16px; padding: 20px 24px; text-align: center;">
      <p style="margin: 0; color: #5a6075; font-size: 12px;">
        🤖 This email was sent automatically by <strong style="color: #8892b0;">Git Auditer</strong>
      </p>
      <p style="margin: 6px 0 0; color: #3a3f50; font-size: 11px;">
        Automated PR review pipeline • ${new Date().toISOString().split('T')[0]}
      </p>
    </div>

  </div>
</body>
</html>`;
}

// ─── Main ───────────────────────────────────────────────────────────────────────

function main() {
  const args = parseArgs(process.argv);
  const html = generateEmailHtml(args);

  // Write to file
  const outputDir = args.report_file
    ? path.dirname(args.report_file)
    : '.lighthouseci';

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'email.html');
  fs.writeFileSync(outputPath, html, 'utf8');
  console.error(`📧 Email HTML written to: ${outputPath}`);

  // Also output to stdout for piping
  console.log(html);

  // Set GitHub Actions output
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `email_file=${outputPath}\n`);
  }
}

main();
