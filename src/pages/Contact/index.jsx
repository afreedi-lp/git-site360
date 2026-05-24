import { useState } from 'react';

function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="page" id="page-contact">
      <section className="hero" style={{ paddingBottom: '20px' }}>
        <div className="container">
          <span className="hero-badge">💬 Contact</span>
          <h1 className="hero-title">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="hero-subtitle">
            Have questions about setting up Git Auditer? Need help with custom thresholds?
            We'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="grid-2">
            {/* Form */}
            <div className="card animate-in" style={{ padding: '40px' }}>
              <h3 className="section-title" style={{ fontSize: '22px', marginBottom: '28px' }}>
                Send a Message (modified)
              </h3>

              {submitted ? (
                <div style={{
                  textAlign: 'center',
                  padding: '48px 0',
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                  <h4 style={{ fontSize: '20px', marginBottom: '8px' }}>Message Sent!</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} id="contact-form">
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">Name</label>
                    <input
                      className="form-input"
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Your name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">Email</label>
                    <input
                      className="form-input"
                      type="email"
                      id="email"
                      name="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="message">Message</label>
                    <textarea
                      className="form-textarea"
                      id="message"
                      name="message"
                      placeholder="Tell us what you need help with..."
                      value={form.message}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" id="submit-contact" style={{ width: '100%', justifyContent: 'center' }}>
                    Send Message →
                  </button>
                </form>
              )}
            </div>

            {/* Info */}
            <div>
              <div className="card animate-in delay-1" style={{ marginBottom: '20px' }}>
                <div className="card-icon">📧</div>
                <h3 className="card-title">Email</h3>
                <p className="card-desc">support@gitauditer.dev</p>
              </div>
              <div className="card animate-in delay-2" style={{ marginBottom: '20px' }}>
                <div className="card-icon">🐙</div>
                <h3 className="card-title">GitHub</h3>
                <p className="card-desc">github.com/git-auditer</p>
              </div>
              <div className="card animate-in delay-3">
                <div className="card-icon">📖</div>
                <h3 className="card-title">Documentation</h3>
                <p className="card-desc">Read the setup guide in the README to get started in under 5 minutes.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
