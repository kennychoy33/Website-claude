import { Link } from 'react-router-dom'
import './About.css'

const timeline = [
  {
    year: '1995',
    title: 'The Beginning',
    desc: 'Founder Kenny Choy developed a payroll and attendance system for 1,000+ employees — planting the seed for Smart Touch Technology.',
  },
  {
    year: '2004',
    title: 'Smart Touch Founded',
    desc: 'Smart Touch Technology Sdn Bhd (638440-D) was formally established in Johor, Malaysia, with a mission to transform HR through technology.',
  },
  {
    year: '2009',
    title: 'BAS — Biometric Launch',
    desc: 'Launched the Biometric Authentication System (BAS) — an industry-first facial recognition attendance platform for Malaysian enterprises.',
  },
  {
    year: '2014',
    title: 'GST & Compliance Expansion',
    desc: 'Enhanced SmartPay to support GST and statutory compliance changes, cementing our reputation as Malaysia\'s payroll compliance leader.',
  },
  {
    year: '2020',
    title: 'SmartGoGo Mobile App',
    desc: 'Launched SmartGoGo — a mobile-first HR platform for GPS attendance, leave management, and e-payslip access during the remote work era.',
  },
  {
    year: '2024',
    title: '20 Years & Growing',
    desc: 'Celebrating 20 years of continuous innovation with 2,500+ clients across Malaysia and Singapore — and expanding our cloud-based product suite.',
  },
]

const values = [
  {
    icon: '🎯',
    title: 'Precision',
    desc: 'Every calculation, every compliance update, every payroll run — accuracy is non-negotiable. Our clients trust their livelihood to our software.',
  },
  {
    icon: '💡',
    title: 'Innovation',
    desc: 'From pioneering face recognition attendance in Malaysia to building mobile HR apps, we\'ve always been ahead of the curve.',
  },
  {
    icon: '🤝',
    title: 'Partnership',
    desc: 'We don\'t just sell software — we become your HR technology partner. Our support team is reachable, responsive, and genuinely helpful.',
  },
  {
    icon: '🏛️',
    title: 'Compliance',
    desc: 'Malaysian labour law and statutory requirements are complex. We handle every update so you never have to worry about non-compliance.',
  },
]

export default function About() {
  return (
    <div className="about-page">
      {/* Page hero */}
      <section className="page-hero about-hero">
        <div className="page-hero-bg" />
        <div className="container page-hero-content">
          <span className="section-label" style={{ color: '#93c5fd', background: 'rgba(147,197,253,0.12)', borderColor: 'rgba(147,197,253,0.2)' }}>Our Story</span>
          <h1 className="page-hero-title">Built in Malaysia.<br />Trusted for 20+ Years.</h1>
          <p className="page-hero-desc">
            Smart Touch Technology has been at the forefront of workforce management innovation since 2004 — helping thousands of Malaysian businesses automate HR, stay compliant, and focus on what matters most.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section mv-section">
        <div className="container">
          <div className="mv-grid">
            <div className="mv-card mission">
              <div className="mv-icon">🎯</div>
              <h3>Our Mission</h3>
              <p>
                To deliver connected, intelligent workforce management ecosystems that empower businesses to operate with precision, compliance, and confidence — through technology that simply works.
              </p>
            </div>
            <div className="mv-card vision">
              <div className="mv-icon">🔭</div>
              <h3>Our Vision</h3>
              <p>
                To be Southeast Asia's most trusted HR technology partner — building the infrastructure that modern businesses rely on to manage their most important asset: their people.
              </p>
            </div>
            <div className="mv-card philosophy">
              <div className="mv-icon">💬</div>
              <h3>Our Philosophy</h3>
              <p>
                "Smart Touch is not just about automation — it's about delivering trust through precision." Every product we build reflects a commitment to accuracy, reliability, and the human element of HR.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="founder-section">
        <div className="container">
          <div className="founder-inner">
            <div className="founder-visual">
              <div className="founder-avatar">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div className="founder-credential">
                <span>B.S. Information Management</span>
                <span>Tamkang University, Taiwan</span>
              </div>
            </div>
            <div className="founder-content">
              <span className="section-label">Our Founder</span>
              <h2 className="section-title">Kenny Choy <span>子淳</span></h2>
              <p>
                Kenny Choy founded Smart Touch Technology in 2004 after more than a decade in enterprise HR software development. His journey began in 1995 when he built a payroll and time attendance system from scratch for a company with over 1,000 employees — an experience that revealed both the complexity and the opportunity in HR technology.
              </p>
              <p>
                Armed with a degree in Information Management from Tamkang University and a deep understanding of Malaysian labour law, Kenny set out to build software that could handle the full complexity of local compliance while remaining accessible to everyday HR teams.
              </p>
              <p>
                Today, under his leadership, Smart Touch has grown from a small Johor-based operation into a regional force — serving factories, offices, and condominiums across Malaysia and Singapore with a suite of integrated HR products trusted by some of the country's most recognised brands.
              </p>
              <div className="founder-contact">
                <a href="tel:+601278833383" className="btn-outline">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.39 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.79a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16c.1.31.17.63.19.92z"/>
                  </svg>
                  012-788 3383
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section timeline-section">
        <div className="container">
          <div className="section-header center">
            <span className="section-label">Our Journey</span>
            <h2 className="section-title">Nearly <span>Three Decades</span> of Innovation</h2>
            <p className="section-subtitle">From a single payroll project in 1995 to a full workforce management suite trusted by thousands of companies.</p>
          </div>
          <div className="timeline">
            {timeline.map((t, i) => (
              <div key={t.year} className={`timeline-item ${i % 2 === 0 ? 'left' : 'right'}`}>
                <div className="timeline-content">
                  <span className="timeline-year">{t.year}</span>
                  <h4>{t.title}</h4>
                  <p>{t.desc}</p>
                </div>
                <div className="timeline-dot" />
              </div>
            ))}
            <div className="timeline-line" />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section values-section">
        <div className="container">
          <div className="section-header center">
            <span className="section-label">Our Values</span>
            <h2 className="section-title">What We <span>Stand For</span></h2>
            <p className="section-subtitle">The principles that guide every decision, every feature, and every customer interaction at Smart Touch.</p>
          </div>
          <div className="values-grid">
            {values.map((v) => (
              <div key={v.title} className="value-card">
                <span className="value-icon">{v.icon}</span>
                <h4>{v.title}</h4>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Geography */}
      <section className="geo-section">
        <div className="container">
          <div className="geo-inner">
            <div className="geo-content">
              <span className="section-label">Our Presence</span>
              <h2 className="section-title">Malaysia &amp; <span>Singapore</span></h2>
              <p>
                Headquartered in Johor, Malaysia, Smart Touch Technology serves businesses across both Malaysia and Singapore. Our proximity to our clients means faster support, better understanding of local regulatory requirements, and a genuine partnership built on trust.
              </p>
              <div className="geo-stats">
                <div className="geo-stat">
                  <strong>Johor, Malaysia</strong>
                  <span>Headquarters &amp; Support Hub</span>
                </div>
                <div className="geo-stat">
                  <strong>Malaysia-wide</strong>
                  <span>Serving all states</span>
                </div>
                <div className="geo-stat">
                  <strong>Singapore</strong>
                  <span>Regional operations</span>
                </div>
              </div>
            </div>
            <div className="geo-card">
              <div className="geo-map-placeholder">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <div className="geo-address">
                  <strong>Smart Touch Technology</strong>
                  <p>36-02 &amp; 36-03, Jalan Permas 10</p>
                  <p>Bandar Baru Permas Jaya</p>
                  <p>81750 Masai, Johor, Malaysia</p>
                  <a href="tel:+60733889903">+607-388 9903</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="section about-cta-section">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="section-title" style={{ marginBottom: 12 }}>Ready to Work With Us?</h2>
          <p className="section-subtitle" style={{ margin: '0 auto 36px' }}>
            Join 2,500+ companies that trust Smart Touch Technology to manage their workforce. Let's talk about how we can help you.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contact" className="btn-primary">
              Contact Our Team
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link to="/products" className="btn-outline">Explore Products</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
