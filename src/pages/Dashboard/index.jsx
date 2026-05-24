import { useState } from 'react';

const mockPRs = [
  {
    id: 142,
    title: 'Add hero animation to landing page',
    branch: 'feat/hero-animation → main',
    author: 'sarah-dev',
    status: 'pass',
    score: 94,
    lcp: 1850,
    cls: 0.04,
    time: '3 mins ago',
  },
  {
    id: 141,
    title: 'Refactor dashboard chart components',
    branch: 'refactor/charts → main',
    author: 'john.doe',
    status: 'pass',
    score: 91,
    lcp: 2200,
    cls: 0.08,
    time: '28 mins ago',
  },
  {
    id: 140,
    title: 'Add unoptimized background video',
    branch: 'feat/video-bg → main',
    author: 'newbie123',
    status: 'fail',
    score: 62,
    lcp: 4800,
    cls: 0.32,
    time: '1 hour ago',
  },
  {
    id: 139,
    title: 'Update footer links and socials',
    branch: 'fix/footer-links → main',
    author: 'alex.m',
    status: 'pass',
    score: 97,
    lcp: 980,
    cls: 0.01,
    time: '2 hours ago',
  },
  {
    id: 138,
    title: 'Integrate heavy analytics SDK',
    branch: 'feat/analytics → main',
    author: 'data-team',
    status: 'fail',
    score: 71,
    lcp: 3600,
    cls: 0.05,
    time: '5 hours ago',
  },
];

const overallMetrics = [
  { name: 'Average Performance Score', value: 92, max: 100, threshold: 90, status: 'good' },
  { name: 'Average LCP', value: 1.8, max: 4, threshold: 2.5, unit: 's', status: 'good' },
  { name: 'Average CLS', value: 0.06, max: 0.5, threshold: 0.1, status: 'good' },
  { name: 'Average TBT', value: 165, max: 500, threshold: 200, unit: 'ms', status: 'good' },
];

function Dashboard() {
  const [filter, setFilter] = useState('all');

  const filteredPRs = filter === 'all'
    ? mockPRs
    : mockPRs.filter(pr => pr.status === filter);

  const passCount = mockPRs.filter(p => p.status === 'pass').length;
  const failCount = mockPRs.filter(p => p.status === 'fail').length;

  return (
    <div className="page" id="page-dashboard">
      <section className="hero" style={{ paddingBottom: '20px' }}>
        <div className="container">
          <span className="hero-badge">📊 Dashboard</span>
          <h1 className="hero-title">
            PR <span className="gradient-text">Audit Dashboard</span>
          </h1>
          <p className="hero-subtitle">
            Real-time overview of pull request audits, performance metrics, and approval status.
          </p>
        </div>
      </section>

      {/* Stats Row */}
      <section className="section" style={{ paddingTop: 0, paddingBottom: '40px' }}>
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{mockPRs.length}</div>
              <div className="stat-label">Total PRs Audited</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ background: 'linear-gradient(135deg, #00d4aa, #2ecc71)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{passCount}</div>
              <div className="stat-label">Approved</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ background: 'linear-gradient(135deg, #ff6b9d, #e74c3c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{failCount}</div>
              <div className="stat-label">Rejected</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{Math.round((passCount / mockPRs.length) * 100)}%</div>
              <div className="stat-label">Pass Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Overview */}
      <section className="section" style={{ paddingTop: 0, paddingBottom: '40px' }}>
        <div className="container">
          <div className="card" style={{ padding: '36px' }}>
            <h3 className="section-title" style={{ fontSize: '20px', marginBottom: '28px' }}>
              ⚡ Performance Overview
            </h3>
            {overallMetrics.map(metric => (
              <div className="metric-bar" key={metric.name}>
                <div className="metric-header">
                  <span className="metric-name">{metric.name}</span>
                  <span className="metric-value">
                    {metric.value}{metric.unit || ''}
                  </span>
                </div>
                <div className="metric-track">
                  <div
                    className={`metric-fill ${metric.status}`}
                    style={{ width: `${(metric.value / metric.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PR Table */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="dashboard-header">
            <h3 className="section-title" style={{ fontSize: '20px', margin: 0 }}>
              📋 Recent PR Audits
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['all', 'pass', 'fail'].map(f => (
                <button
                  key={f}
                  className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                  onClick={() => setFilter(f)}
                  id={`filter-${f}`}
                >
                  {f === 'all' ? '🔍 All' : f === 'pass' ? '✅ Passed' : '❌ Failed'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="pr-table" id="pr-audit-table">
              <thead>
                <tr>
                  <th>Pull Request</th>
                  <th>Author</th>
                  <th>Score</th>
                  <th>LCP</th>
                  <th>CLS</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredPRs.map(pr => (
                  <tr key={pr.id}>
                    <td>
                      <div className="pr-title-cell">
                        <span className="pr-name">#{pr.id} {pr.title}</span>
                        <span className="pr-branch">{pr.branch}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>@{pr.author}</td>
                    <td>
                      <span style={{
                        fontWeight: 700,
                        color: pr.score >= 90 ? 'var(--accent-secondary)' : 'var(--accent-pink)'
                      }}>
                        {pr.score}
                      </span>
                    </td>
                    <td style={{
                      color: pr.lcp <= 2500 ? 'var(--accent-secondary)' : 'var(--accent-pink)',
                      fontWeight: 600,
                    }}>
                      {pr.lcp}ms
                    </td>
                    <td style={{
                      color: pr.cls <= 0.1 ? 'var(--accent-secondary)' : 'var(--accent-pink)',
                      fontWeight: 600,
                    }}>
                      {pr.cls}
                    </td>
                    <td>
                      <span className={`status-badge ${pr.status}`}>
                        {pr.status === 'pass' ? '✅ Approved' : '❌ Rejected'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{pr.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
