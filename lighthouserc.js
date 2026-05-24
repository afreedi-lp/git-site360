/**
 * Lighthouse CI Configuration
 * 
 * This config is used by the PR auditor workflow to run performance tests.
 * URLs are dynamically injected based on which files changed in the PR.
 * 
 * Thresholds (Strict Mode):
 *   - Performance Score: >= 90
 *   - LCP: <= 2500ms
 *   - FCP: <= 1800ms
 *   - CLS: <= 0.1
 *   - TBT: <= 200ms
 */

const fs = require('fs');
const path = require('path');

// Load route map config for build output dir and serve settings
let config = {
  buildOutputDir: './dist',
  serveCommand: 'npx serve ./dist -l 3000 -s',
  serveReadyPattern: 'Accepting connections',
  baseUrl: 'http://localhost:3000',
};

try {
  const routeMapPath = path.resolve(__dirname, 'route-map.config.json');
  if (fs.existsSync(routeMapPath)) {
    const routeMap = JSON.parse(fs.readFileSync(routeMapPath, 'utf8'));
    config = { ...config, ...routeMap };
  }
} catch (e) {
  console.warn('Warning: Could not load route-map.config.json, using defaults.');
}

// URLs can be overridden via LHCI_URLS environment variable (JSON array)
let urls = [`${config.baseUrl}/`];
if (process.env.LHCI_URLS) {
  try {
    const parsedUrls = JSON.parse(process.env.LHCI_URLS);
    if (Array.isArray(parsedUrls) && parsedUrls.length > 0) {
      urls = parsedUrls.map(u =>
        u.startsWith('http') ? u : `${config.baseUrl}${u.startsWith('/') ? u : '/' + u}`
      );
    }
  } catch (e) {
    console.warn('Warning: Could not parse LHCI_URLS, using default URL.');
  }
}

module.exports = {
  ci: {
    collect: {
      startServerCommand: config.serveCommand,
      startServerReadyPattern: config.serveReadyPattern,
      url: urls,
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --headless --disable-gpu',
        throttling: {
          cpuSlowdownMultiplier: 2,
        },
      },
    },
    assert: {
      assertions: {
        // Core Web Vitals — Strict thresholds
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],

        // Overall performance score (0-1 scale, 0.9 = 90%)
        'categories:performance': ['error', { minScore: 0.9 }],

        // Accessibility — warn only (not a blocker)
        'categories:accessibility': ['warn', { minScore: 0.8 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
