import { Link } from 'react-router-dom'
import './Home.css'

const stats = [
  { value: '2,500+', label: 'Companies Served' },
  { value: '20+', label: 'Years Experience' },
  { value: '2', label: 'Countries — MY & SG' },
  { value: '100%', label: 'Statutory Compliant' },
]

const products = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <line x1="2" y1="10" x2="22" y2="10"/>
      </svg>
    ),
    color: '#3b82f6',
    name: 'SmartPay',
    subtitle: 'Payroll System',
    description: 'Fully automated payroll with built-in statutory compliance for EPF, SOCSO, EIS, and PCB.',
    features: ['Automated salary & deduction', 'EPF, SOCSO, EIS & PCB', 'Bank payment files', 'EA Form & e-Data PCB'],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    color: '#06b6d4',
    name: 'Smartime',
    subtitle: 'Time & Attendance',
    description: 'Multi-method time tracking with real-time dashboards, shift scheduling, and overtime management.',
    features: ['Face & fingerprint recognition', 'Mobile & card clock-in', 'Multi-branch & shift support', 'Overtime tracking'],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2"/>
        <line x1="12" y1="18" x2="12.01" y2="18"/>
      </svg>
    ),
    color: '#8b5cf6',
    name: 'SmartGoGo',
    subtitle: 'Mobile HR App',
    description: 'GPS-powered mobile app for attendance, leave, claims, and e-payslip — anywhere, anytime.',
    features: ['GPS-based mobile clock-in', 'Leave & approval workflow', 'Claims submission', 'E-payslip access'],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    color: '#10b981',
    name: 'VMS',
    subtitle: 'Visitor Management',
    description: 'Smart visitor registration with QR code entry, host notifications, and complete access audit trails.',
    features: ['QR self-registration', 'Host notification alerts', 'Access tracking & logs', 'Kiosk & mobile options'],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    color: '#f59e0b',
    name: 'Canteen',
    subtitle: 'Canteen Management',
    description: 'Control meal entitlements and consumption via face, card, or QR with subsidy and fraud prevention.',
    features: ['Meal entitlement control', 'Face/card/QR consumption', 'Subsidy management', 'Fraud prevention'],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M9 9h6v6H9z"/>
        <path d="M9 3v6M15 3v6M9 15v6M15 15v6M3 9h6M15 9h6M3 15h6M15 15h6"/>
      </svg>
    ),
    color: '#ef4444',
    name: 'Dormitory',
    subtitle: 'Dormitory Management',
    description: 'End-to-end worker accommodation management with registration, access control, and compliance reporting.',
    features: ['Worker registration & beds', 'Attendance monitoring', 'Compliance reporting', 'Maintenance tracking'],
  },
]

const whyUs = [
  {
    icon: '🏆',
    title: '20+ Years of Expertise',
    desc: 'Founded in 2004 with roots dating back to 1995, we have decades of deep domain knowledge in Malaysian HR compliance.',
  },
  {
    icon: '⚖️',
    title: '100% Statutory Compliant',
    desc: 'Automatically updated for every change to EPF, SOCSO, EIS, PCB, and Labour Law — you never miss a compliance update.',
  },
  {
    icon: '🔗',
    title: 'Fully Integrated Suite',
    desc: 'Payroll, attendance, leave, and mobile HR work seamlessly together — no more double entry or data silos.',
  },
  {
    icon: '🤝',
    title: 'Dedicated Local Support',
    desc: 'Based in Johor with support teams across Malaysia. Real people, real answers — not just ticketing systems.',
  },
]

const clients = ['Gardenia', 'Coca-Cola', 'Samsung', 'Volvo', "Levi's", 'Panasonic', 'Shell', 'Nestle']

export default function Home() {
  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-shape hero-shape-1" />
          <div className="hero-shape hero-shape-2" />
          <div className="hero-shape hero-shape-3" />
        </div>
        <div className="container hero-content">
          <div className="hero-badge">
            <span className="badge-dot" />
            Trusted by 2,500+ Companies in Malaysia & Singapore
          </div>
          <h1 className="hero-title">
            Malaysia's Most Trusted<br />
            <span>Workforce Management</span><br />
            Platform
          </h1>
          <p className="hero-desc">
            Integrated Payroll, HRMS &amp; Time Attendance software — built for Malaysian compliance, designed for modern businesses. Automate your entire HR workflow from a single platform.
          </p>
          <div className="hero-cta">
            <Link to="/contact" className="btn-primary">
              Get a Free Demo
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link to="/products" className="btn-ghost">Explore Products</Link>
          </div>
          <div className="hero-stats">
            {stats.map((s) => (
              <div key={s.label} className="hero-stat">
                <span className="hero-stat-value">{s.value}</span>
                <span className="hero-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-scroll-hint">
          <div className="scroll-indicator" />
        </div>
      </section>

      {/* Clients bar */}
      <section className="clients-bar">
        <div className="container">
          <p className="clients-label">Trusted by leading companies across Malaysia</p>
          <div className="clients-list">
            {clients.map((c) => (
              <span key={c} className="client-name">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="section products-section">
        <div className="container">
          <div className="section-header center">
            <span className="section-label">Our Solutions</span>
            <h2 className="section-title">Everything Your Workforce Needs,<br /><span>In One Platform</span></h2>
            <p className="section-subtitle">From payroll to biometrics, every product is built to work together and keep you compliant.</p>
          </div>
          <div className="products-grid">
            {products.map((p) => (
              <div key={p.name} className="product-card">
                <div className="product-icon" style={{ background: `${p.color}18`, color: p.color }}>
                  {p.icon}
                </div>
                <div className="product-badge" style={{ background: `${p.color}15`, color: p.color }}>
                  {p.subtitle}
                </div>
                <h3 className="product-name">{p.name}</h3>
                <p className="product-desc">{p.description}</p>
                <ul className="product-features">
                  {p.features.map((f) => (
                    <li key={f}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="7" fill={p.color} fillOpacity="0.15"/>
                        <path d="M4 7l2 2 4-4" stroke={p.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/products" className="product-link" style={{ color: p.color }}>
                  Learn more
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>
            ))}
          </div>
          <div className="products-cta">
            <Link to="/products" className="btn-outline">View All Products &amp; Features</Link>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="why-section">
        <div className="container">
          <div className="why-inner">
            <div className="why-left">
              <span className="section-label">Why Smart Touch?</span>
              <h2 className="section-title">Built for Malaysia.<br /><span>Trusted for 20+ Years.</span></h2>
              <p className="section-subtitle">
                We've been helping Malaysian businesses manage their workforce since 2004 — long before "HR software" was a buzzword.
              </p>
              <Link to="/about" className="btn-primary" style={{ marginTop: 32 }}>
                Our Story
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
            <div className="why-right">
              {whyUs.map((w) => (
                <div key={w.title} className="why-card">
                  <span className="why-icon">{w.icon}</span>
                  <div>
                    <h4>{w.title}</h4>
                    <p>{w.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">2,500<span>+</span></span>
              <span className="stat-label">Factories, Offices &amp; Condominiums</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">20<span>+</span></span>
              <span className="stat-label">Years of Continuous Innovation</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">2</span>
              <span className="stat-label">Countries — Malaysia &amp; Singapore</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">7<span>+</span></span>
              <span className="stat-label">Integrated Product Modules</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-text">
              <h2>Ready to Transform Your HR?</h2>
              <p>Join 2,500+ Malaysian companies that trust Smart Touch to manage their workforce. Get a personalised demo today — no commitment required.</p>
            </div>
            <div className="cta-actions">
              <Link to="/contact" className="btn-primary">
                Schedule a Free Demo
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <a href="tel:+60733889903" className="btn-ghost">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.39 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.79a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16c.1.31.17.63.19.92z"/>
                </svg>
                Call Us Now
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
