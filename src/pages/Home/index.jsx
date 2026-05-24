import { Link } from 'react-router-dom';

const features = [
  {
    icon: '🧹',
    title: 'Lint & Syntax Check',
    desc: 'Automatically runs ESLint on every PR to catch syntax errors, unused variables, and code quality issues before they reach production.',
  },
  {
    icon: '🔨',
    title: 'Build Validation',
    desc: 'Ensures the project compiles successfully with zero errors. Catches import issues, type errors, and broken dependencies.',
  },
  {
    icon: '⚡',
    title: 'Performance Audit',
    desc: 'Runs Lighthouse CI on affected pages to validate LCP, FCP, CLS, and TBT against strict thresholds — only fast code ships.',
  },
  {
    icon: '🗺️',
    title: 'Smart Page Detection',
    desc: 'Maps changed files to specific page URLs. Shared component changes trigger full-site testing automatically.',
  },
  {
    icon: '✅',
    title: 'Auto Approve / Reject',
    desc: 'Passing PRs are automatically approved with a detailed report. Failing PRs get changes requested with exact failure reasons.',
  },
  {
    icon: '📧',
    title: 'Email Notifications',
    desc: 'Admin receives a professional HTML email with PR details and performance metrics whenever a PR is approved.',
  },
];

const stats = [
  { value: '< 2.5s', label: 'LCP Threshold' },
  { value: '≥ 90', label: 'Perf Score' },
  { value: '< 0.1', label: 'CLS Threshold' },
  { value: '3x', label: 'Runs per URL' },
];

function Home() {
  return (
    <div className="page" id="page-home">
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <span className="hero-badge">🚀 Automated PR Reviews</span>
          <h1 className="hero-title">
            Ship <span className="gradient-text">Faster</span> Without<br />
            Breaking <span className="gradient-text">Performance</span>
          </h1>
          <p className="hero-subtitle">
            Git Auditer automatically validates every Pull Request for build errors,
            code quality, and Core Web Vitals — so you can merge with confidence.
          </p>
          <div className="hero-actions">
            <Link to="/dashboard" className="btn btn-primary" id="hero-cta-dashboard">
              📊 View Dashboard
            </Link>
            <Link to="/about" className="btn btn-secondary" id="hero-cta-about">
              Learn More →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <div className={`stat-card animate-in delay-${i + 1}`} key={stat.label}>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="container">
          <div className="section-header center">
            <p className="section-label">Features</p>
            <h2 className="section-title">Everything You Need for PR Quality</h2>
            <p className="section-desc">
              A complete pipeline that checks code quality, validates builds, and
              audits performance — all triggered automatically on every PR.
            </p>
          </div>

          <div className="grid-3">
            {features.map((feature, i) => (
              <div className={`card animate-in delay-${(i % 3) + 1}`} key={feature.title}>
                <div className="card-icon">{feature.icon}</div>
                <h3 className="card-title">{feature.title}</h3>
                <p className="card-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="section-title">Ready to automate your PR reviews?</h2>
          <p className="section-desc" style={{ margin: '0 auto 32px' }}>
            Set up Git Auditer in under 5 minutes. Just add the workflow files and configure your thresholds.
          </p>
          <Link to="/contact" className="btn btn-primary" id="cta-contact">
            Get Started →
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
