import { Link } from 'react-router-dom'
import './Products.css'

const products = [
  {
    id: 'smartpay',
    name: 'SmartPay',
    subtitle: 'Payroll System',
    tagline: 'Automate Every Payroll. Never Miss a Compliance Deadline.',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #1e40af, #3b82f6)',
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <line x1="2" y1="10" x2="22" y2="10"/>
        <circle cx="7" cy="15" r="1"/>
        <line x1="10" y1="15" x2="14" y2="15"/>
      </svg>
    ),
    description: 'SmartPay is Malaysia\'s most comprehensive payroll software — built to handle the complexity of EPF, SOCSO, EIS, and PCB compliance automatically, so your HR team can focus on people, not paperwork.',
    features: [
      { title: 'Automated Salary Calculation', desc: 'Full salary, deductions, and allowances calculated accurately in minutes' },
      { title: 'EPF, SOCSO, EIS & PCB', desc: 'Auto-updated statutory contributions — always compliant with KWSP, PERKESO, and LHDN' },
      { title: 'Bonus & Overtime Management', desc: 'Flexible bonus structures and overtime rates for all employee categories' },
      { title: 'Bank Payment Files', desc: 'Generate ready-to-upload files for Maybank, CIMB, Public Bank, and all major banks' },
      { title: 'EA Form & e-Data PCB', desc: 'One-click generation of EA Forms and e-Data submission files for tax filing' },
      { title: 'Multi-Company Support', desc: 'Manage multiple legal entities and payroll groups from a single dashboard' },
    ],
  },
  {
    id: 'smartime',
    name: 'Smartime',
    subtitle: 'Time & Attendance',
    tagline: 'Real-Time Attendance Tracking Across All Your Locations.',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #0e7490, #06b6d4)',
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
        <path d="M8 2.5A9.96 9.96 0 0 1 12 2"/>
      </svg>
    ),
    description: 'Smartime is a powerful time and attendance platform that supports face recognition, fingerprint, RFID card, and mobile clock-in — all feeding into a unified dashboard with real-time visibility.',
    features: [
      { title: 'Face Recognition Attendance', desc: 'Touchless, mask-tolerant face recognition for hygienic and accurate attendance' },
      { title: 'Fingerprint & Card Clock-In', desc: 'Biometric fingerprint and RFID/IC card options for every workplace environment' },
      { title: 'Mobile Clock-In via SmartGoGo', desc: 'GPS-verified mobile attendance for remote and field workers' },
      { title: 'Multi-Branch & Multi-Shift', desc: 'Configure unlimited locations, departments, and shift schedules from one system' },
      { title: 'Real-Time Dashboard', desc: 'Live attendance status, late arrivals, and absentee alerts for managers' },
      { title: 'Overtime & Claim Calculation', desc: 'Automatic OT tracking linked directly to your payroll for accurate processing' },
    ],
  },
  {
    id: 'smartgogo',
    name: 'SmartGoGo',
    subtitle: 'Mobile HR App',
    tagline: 'HR in the Palm of Your Hand — Anywhere, Anytime.',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #5b21b6, #8b5cf6)',
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2"/>
        <line x1="12" y1="18" x2="12.01" y2="18"/>
        <circle cx="12" cy="18" r="0.5" fill="currentColor"/>
      </svg>
    ),
    description: 'SmartGoGo is the employee-facing mobile app that puts attendance, leave, claims, and payslips at everyone\'s fingertips — reducing HR admin while improving the employee experience.',
    features: [
      { title: 'GPS-Based Mobile Attendance', desc: 'Clock in/out with location verification — ideal for field staff and remote teams' },
      { title: 'Leave Application & Approval', desc: 'Apply for leave on mobile; managers approve or reject instantly with notifications' },
      { title: 'Expense Claims', desc: 'Submit claims with photo receipts and track approval status in real time' },
      { title: 'E-Payslip Access', desc: 'Employees view and download their payslips securely — no more printing needed' },
      { title: 'Shift Scheduling', desc: 'View assigned shifts and swap requests directly through the app' },
      { title: 'Push Notifications', desc: 'Instant alerts for approvals, rejections, payroll processing, and announcements' },
    ],
  },
  {
    id: 'vms',
    name: 'VMS',
    subtitle: 'Visitor Management System',
    tagline: 'Professional Visitor Control from Reception to Exit.',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #065f46, #10b981)',
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        <polyline points="20 6 22 8 26 4" transform="translate(-6 0)"/>
      </svg>
    ),
    description: 'The Smart Touch Visitor Management System digitises your visitor registration process — replacing paper logbooks with a secure, trackable, and professional system for modern workplaces.',
    features: [
      { title: 'QR Code Self-Registration', desc: 'Visitors pre-register via QR link and scan in on arrival — no queue at reception' },
      { title: 'Kiosk & Mobile VMS', desc: 'Tablet kiosk at reception or mobile-based check-in for flexible deployment' },
      { title: 'Host Notification', desc: 'Automatic SMS or app alert to the host employee when their visitor arrives' },
      { title: 'Photo Capture & Badge Printing', desc: 'Capture visitor photos and print visitor badges automatically on arrival' },
      { title: 'Access Tracking & Audit Log', desc: 'Full log of all visitor movements — who visited, when, and which areas accessed' },
      { title: 'Blacklist & Watchlist', desc: 'Flag restricted visitors and prevent unauthorised access with alerts' },
    ],
  },
  {
    id: 'canteen',
    name: 'Canteen',
    subtitle: 'Canteen Management System',
    tagline: 'Control Every Meal. Eliminate Subsidy Fraud.',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #92400e, #f59e0b)',
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11l19-9-9 19-2-8-8-2z"/>
      </svg>
    ),
    description: 'The Smart Touch Canteen Management System gives HR and facilities teams complete control over employee meal entitlements — from face recognition at the counter to automated subsidy reporting.',
    features: [
      { title: 'Meal Entitlement Control', desc: 'Configure daily, weekly, or per-meal allowances for each employee category' },
      { title: 'Face / Card / QR Consumption', desc: 'Multiple verification methods at the canteen counter for fast, accurate deduction' },
      { title: 'Subsidy Management', desc: 'Define company subsidy rules and auto-calculate employee vs company portions' },
      { title: 'Fraud Prevention', desc: 'Prevent sharing, over-claiming, and ghost consumption with biometric verification' },
      { title: 'Menu & Pricing Control', desc: 'Manage canteen menus, prices, and daily specials through the admin panel' },
      { title: 'Reporting Dashboard', desc: 'Daily consumption reports, cost analysis, and subsidy summaries for payroll' },
    ],
  },
  {
    id: 'dormitory',
    name: 'Dormitory',
    subtitle: 'Dormitory & Hostel Management',
    tagline: 'End-to-End Worker Accommodation Compliance.',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #7f1d1d, #ef4444)',
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    description: 'Designed for manufacturers and employers managing foreign worker hostels, the Dormitory Management System ensures compliance with Malaysian labour housing regulations while simplifying day-to-day operations.',
    features: [
      { title: 'Worker Registration & Bed Allocation', desc: 'Register workers and assign rooms or beds with full occupancy tracking' },
      { title: 'Attendance & Access Monitoring', desc: 'Biometric check-in/out at dormitory gates for security and curfew compliance' },
      { title: 'Compliance Reporting', desc: 'Generate reports required by JTKSM, CIDB, and other regulatory bodies' },
      { title: 'Maintenance & Incident Tracking', desc: 'Log maintenance requests and incidents with resolution tracking' },
      { title: 'Utility Billing', desc: 'Track electricity and water usage per room and deduct from payroll if required' },
      { title: 'Worker Movement Records', desc: 'Full audit trail of entries, exits, and overnight absences' },
    ],
  },
  {
    id: 'biometric',
    name: 'Biometric Solutions',
    subtitle: 'Hardware & Access Control',
    tagline: 'Industry-Grade Biometric Hardware — Supplied & Supported Locally.',
    color: '#64748b',
    gradient: 'linear-gradient(135deg, #1e293b, #475569)',
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
    ),
    description: 'Smart Touch supplies, installs, and supports a full range of biometric and access control hardware — from facial recognition terminals to barrier gates — all integrated with our software platform.',
    features: [
      { title: 'Face Recognition Terminals', desc: 'Touchless, AI-powered devices with mask detection — suitable for all industries' },
      { title: 'Fingerprint Readers', desc: 'High-speed optical and capacitive fingerprint scanners for accurate ID' },
      { title: 'RFID Card Systems', desc: 'Compatible with ISO 14443 and EM4100 cards and fobs' },
      { title: 'Swing Barriers & Turnstiles', desc: 'Physical access barriers for controlled entry to production floors and offices' },
      { title: 'Door Access Control', desc: 'Networked door controllers with tamper alarms and remote management' },
      { title: 'Cloud-Connected Hardware', desc: 'All devices sync in real time to SmartPay and Smartime over LAN or 4G' },
    ],
  },
]

export default function Products() {
  return (
    <div className="products-page">
      {/* Page hero */}
      <section className="page-hero">
        <div className="page-hero-bg" />
        <div className="container page-hero-content">
          <span className="section-label">Our Products</span>
          <h1 className="page-hero-title">Complete Workforce Management Suite</h1>
          <p className="page-hero-desc">
            Seven integrated products covering every aspect of HR and workforce operations — from payroll to biometric hardware. All built to work together.
          </p>
          <Link to="/contact" className="btn-primary">
            Request a Demo
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* Products */}
      <section className="section products-detail">
        <div className="container">
          {products.map((p, i) => (
            <div key={p.id} className={`product-detail-card ${i % 2 === 1 ? 'reverse' : ''}`}>
              <div className="product-detail-visual" style={{ background: p.gradient }}>
                <div className="product-visual-icon">
                  {p.icon}
                </div>
                <div className="product-visual-name">{p.name}</div>
                <div className="product-visual-sub">{p.subtitle}</div>
                <div className="product-visual-deco" />
              </div>
              <div className="product-detail-info">
                <span className="product-detail-badge" style={{ color: p.color, background: `${p.color}14` }}>
                  {p.subtitle}
                </span>
                <h2 className="product-detail-name">{p.name}</h2>
                <p className="product-detail-tagline">{p.tagline}</p>
                <p className="product-detail-desc">{p.description}</p>
                <div className="product-features-grid">
                  {p.features.map((f) => (
                    <div key={f.title} className="feature-item">
                      <div className="feature-check" style={{ background: `${p.color}18`, color: p.color }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <strong>{f.title}</strong>
                        <p>{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/contact" className="btn-primary" style={{ marginTop: 8 }}>
                  Get a Demo
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="section products-bottom-cta">
        <div className="container">
          <div className="bottom-cta-inner">
            <h2>Not sure which products you need?</h2>
            <p>Our team will assess your workflow and recommend the right combination for your business size and industry.</p>
            <div className="bottom-cta-actions">
              <Link to="/contact" className="btn-primary">Talk to Our Team</Link>
              <a href="tel:+60733889903" className="btn-outline">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.39 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.79a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16c.1.31.17.63.19.92z"/>
                </svg>
                +607-388 9903
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
