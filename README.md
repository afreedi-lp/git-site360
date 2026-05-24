# 🔍 Git Auditer

**Automated GitHub PR Review Pipeline for React Projects**

Git Auditer is a GitHub Actions workflow that automatically validates Pull Requests by checking for build/lint errors and running Lighthouse performance audits. Passing PRs are auto-approved with admin email notification; failing PRs are rejected with detailed reasons.

---

## 🎯 What It Does

```
PR Opened/Updated → target branch
      │
      ▼
  ┌─────────────┐
  │  ESLint      │──── ❌ Reject with lint errors
  │  Check       │
  └──────┬──────┘
         │ ✅
         ▼
  ┌─────────────┐
  │  Build       │──── ❌ Reject with build errors
  │  Check       │
  └──────┬──────┘
         │ ✅
         ▼
  ┌─────────────┐
  │  Detect      │
  │  Changed     │── Maps files → page URLs
  │  Files       │
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  Lighthouse  │──── ❌ Reject with performance report
  │  CI Audit    │
  └──────┬──────┘
         │ ✅
         ▼
  ┌─────────────┐     ┌─────────────┐
  │  ✅ Approve  │────▶│  📧 Email   │
  │  PR          │     │  Admin      │
  └─────────────┘     └─────────────┘
```

### Performance Thresholds (Strict)

| Metric | Threshold | Standard |
|--------|-----------|----------|
| Performance Score | ≥ 90 | Lighthouse |
| LCP (Largest Contentful Paint) | ≤ 2,500ms | Core Web Vitals |
| FCP (First Contentful Paint) | ≤ 1,800ms | Lighthouse |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | Core Web Vitals |
| TBT (Total Blocking Time) | ≤ 200ms | Lighthouse |

---

## 🚀 Quick Setup

### 1. Copy Files to Your React Project

Copy these files into the root of your React project repository:

```bash
# From this repo, copy:
.github/workflows/pr-auditor.yml
lighthouserc.js
route-map.config.json
scripts/map-files-to-urls.js
scripts/parse-lighthouse-results.js
scripts/generate-email-body.js
```

### 2. Configure GitHub Secrets

Go to your repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret | Description | Example |
|--------|-------------|---------|
| `MAIL_USERNAME` | SMTP email address | `your-email@gmail.com` |
| `MAIL_PASSWORD` | SMTP password (Gmail: use App Password) | `abcd efgh ijkl mnop` |
| `ADMIN_EMAIL` | Admin email to notify on approval | `admin@company.com` |

#### Gmail App Password Setup

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled
3. Go to **App passwords** (search "App passwords" in account settings)
4. Generate a new app password for "Mail"
5. Use this 16-character password as `MAIL_PASSWORD`

### 3. Configure Route Map

Edit `route-map.config.json` to match your project's page structure:

```json
{
  "routeMap": {
    "src/pages/Home": "/",
    "src/pages/About": "/about",
    "src/pages/Dashboard": "/dashboard"
  },
  "sharedPaths": [
    "src/components/",
    "src/layouts/",
    "src/hooks/",
    "src/context/",
    "src/utils/",
    "src/styles/",
    "src/App."
  ],
  "defaultUrls": ["/"],
  "baseUrl": "http://localhost:3000",
  "buildOutputDir": "./build",
  "serveCommand": "npx serve ./build -l 3000 -s",
  "serveReadyPattern": "Accepting connections"
}
```

**Key settings:**

- **`routeMap`**: Maps source file path prefixes to the page URL that should be tested. When a file matching a prefix is changed, the corresponding URL is tested.
- **`sharedPaths`**: File path prefixes that affect ALL pages (e.g., shared components, hooks). If any file in these paths is changed, ALL routes are tested.
- **`buildOutputDir`**: Change to `./dist` if using Vite.
- **`serveCommand`**: Change `./build` to `./dist` if using Vite.

### 4. Change Target Branch (Optional)

By default, the workflow triggers on PRs targeting the `main` branch. To change this, edit `.github/workflows/pr-auditor.yml`:

```yaml
on:
  pull_request:
    branches:
      - main        # ← Change this to your target branch
      - develop     # ← Add more branches if needed
```

---

## 📂 Project Structure

```
your-react-project/
├── .github/
│   └── workflows/
│       └── pr-auditor.yml          # Main workflow
├── scripts/
│   ├── map-files-to-urls.js        # Maps changed files → URLs
│   ├── parse-lighthouse-results.js # Parses Lighthouse results
│   └── generate-email-body.js      # Generates approval email
├── lighthouserc.js                 # Lighthouse CI config
├── route-map.config.json           # File → route mapping
└── ... (your React project files)
```

---

## ⚙️ Customization

### Adjust Performance Thresholds

Edit `lighthouserc.js` to change the thresholds:

```javascript
assertions: {
  'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],   // Relax LCP to 3s
  'categories:performance': ['error', { minScore: 0.8 }],            // Lower to 80
  'cumulative-layout-shift': ['warn', { maxNumericValue: 0.25 }],    // Warn instead of error
}
```

**Assertion levels:**
- `'error'` — Fails the audit (blocks PR)
- `'warn'` — Shows a warning but doesn't block
- `'off'` — Disables the check

### Add More Pages

Simply add entries to the `routeMap` in `route-map.config.json`:

```json
{
  "routeMap": {
    "src/pages/Home": "/",
    "src/pages/Settings": "/settings",
    "src/features/billing": "/billing"
  }
}
```

### Use with Vite Projects

Update `route-map.config.json`:

```json
{
  "buildOutputDir": "./dist",
  "serveCommand": "npx serve ./dist -l 3000 -s"
}
```

### Use a Different Email Provider

Edit the email step in `pr-auditor.yml`:

```yaml
# For Outlook/Office 365
server_address: smtp.office365.com
server_port: 587

# For custom SMTP
server_address: mail.yourdomain.com
server_port: 465
```

---

## 🔧 Troubleshooting

### "Resource not accessible by integration"

The default `GITHUB_TOKEN` can't approve PRs created by GitHub Actions itself. Solutions:
1. Use a **Personal Access Token (PAT)** stored as `PAT_TOKEN` secret
2. Replace `${{ secrets.GITHUB_TOKEN }}` with `${{ secrets.PAT_TOKEN }}` in the workflow

### Lighthouse results are inconsistent

- Lighthouse runs 3 times and uses the median to reduce variance
- CI environments can be slower than local machines — consider relaxing thresholds slightly
- Add `--throttling.cpuSlowdownMultiplier=1` to reduce CPU throttling

### Build fails but works locally

- Ensure `package-lock.json` is committed (required by `npm ci`)
- Check Node.js version matches (workflow uses Node 20)
- Run `npm ci && npm run build` locally to reproduce

### ESLint "Cannot find module" errors

- Ensure all ESLint plugins are in `package.json` dependencies
- Run `npx eslint --print-config src/App.js` locally to verify config

### Email not sending

- For Gmail: Ensure you're using an **App Password**, not your regular password
- Check that 2-Step Verification is enabled on your Google account
- Verify `MAIL_USERNAME` and `MAIL_PASSWORD` secrets are set correctly

---

## 📊 What the PR Comment Looks Like

### On Approval ✅
```
## ✅ Automated Review — All Checks Passed!

| Check | Status |
|-------|--------|
| 🧹 ESLint | ✅ Passed |
| 🔨 Build | ✅ Passed |
| ⚡ Performance | ✅ Passed |

> 🤖 This PR has been automatically approved by Git Auditer.
```

### On Rejection ❌
```
## ❌ Automated Review — Changes Requested

| Check | Status |
|-------|--------|
| 🧹 ESLint | ✅ Passed |
| 🔨 Build | ✅ Passed |
| ⚡ Performance | ❌ Failed |

### ⚡ Performance Issues
- ❌ /dashboard: LCP = 3200ms (threshold: ≤ 2500ms)
- ❌ /dashboard: Performance Score = 78 (threshold: ≥ 90)
```

---

## 📝 License

MIT — Feel free to use and modify for your projects.
