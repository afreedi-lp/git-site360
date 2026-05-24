const steps = [
  { icon: '📥', title: 'PR Opened', text: 'A pull request is opened or updated targeting the main branch.' },
  { icon: '🧹', title: 'Lint Check', text: 'ESLint scans all changed files for syntax errors and code quality issues.' },
  { icon: '🔨', title: 'Build Check', text: 'The project is compiled to catch import errors and type mismatches.' },
  { icon: '📂', title: 'File Detection', text: 'Changed files are mapped to page URLs using the route map config.' },
  { icon: '⚡', title: 'Lighthouse Audit', text: 'Performance metrics (LCP, FCP, CLS, TBT) are tested on affected pages.' },
  { icon: '✅', title: 'Decision', text: 'PRs passing all checks are approved; failing PRs get detailed rejection reports.' },
];

function About() {
  return (
    <div className="page" id="page-about">
      <section className="hero" style={{ paddingBottom: '40px' }}>
        <div className="container">
          <span className="hero-badge">ℹ️ About</span>
          <h1 className="hero-title">
            How <span className="gradient-text">Git Auditer</span> Works
          </h1>
          <p className="hero-subtitle">
            An end-to-end automated pipeline that ensures every line of code
            meets your quality and performance standards before merging.
          </p>
        </div>
      </section>

      {/* About Content */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="about-content">
            <div className="about-visual">
              <span className="visual-icon">🔍</span>
            </div>
            <div className="about-text">
              <h2 className="section-title" style={{ marginBottom: '20px' }}>
                Automated Quality Gates
              </h2>
              <p>
                Git Auditer integrates directly with GitHub Actions to provide
                a comprehensive PR review pipeline. No manual setup per-PR —
                every pull request is automatically audited the moment it's created.
              </p>
              <p>
                The system intelligently detects which pages are affected by the
                code changes and runs targeted Lighthouse audits, saving CI time
                while maintaining thorough coverage.
              </p>
              <ul className="feature-list">
                <li><span className="icon">✦</span> Zero-config for standard React projects</li>
                <li><span className="icon">✦</span> Smart page detection from file changes</li>
                <li><span className="icon">✦</span> Strict Core Web Vitals enforcement</li>
                <li><span className="icon">✦</span> Professional email notifications</li>
                <li><span className="icon">✦</span> Detailed markdown reports on PRs</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pipeline Steps */}
      <section className="section">
        <div className="container">
          <div className="section-header center">
            <p className="section-label">Pipeline</p>
            <h2 className="section-title">The Audit Pipeline</h2>
            <p className="section-desc">
              Six sequential steps that validate every aspect of your code changes.
            </p>
          </div>

          <div className="grid-3">
            {steps.map((step, i) => (
              <div className={`card animate-in delay-${(i % 3) + 1}`} key={step.title}>
                <div className="card-icon">{step.icon}</div>
                <h3 className="card-title">
                  <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>0{i + 1}</span>
                  {step.title}
                </h3>
                <p className="card-desc">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Thresholds */}
      <section className="section">
        <div className="container">
          <div className="section-header center">
            <p className="section-label">Standards</p>
            <h2 className="section-title">Performance Thresholds</h2>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">≥ 90</div>
              <div className="stat-label">Performance Score</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">≤ 2.5s</div>
              <div className="stat-label">LCP</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">≤ 1.8s</div>
              <div className="stat-label">FCP</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">≤ 0.1</div>
              <div className="stat-label">CLS</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">≤ 200ms</div>
              <div className="stat-label">TBT</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
