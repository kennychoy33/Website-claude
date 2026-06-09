import { useState } from 'react'
import './Contact.css'

const contactDetails = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    label: 'Our Office',
    lines: [
      '36-02 & 36-03, Jalan Permas 10,',
      'Bandar Baru Permas Jaya,',
      '81750 Masai, Johor, Malaysia',
    ],
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.39 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.79a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16c.1.31.17.63.19.92z"/>
      </svg>
    ),
    label: 'Phone',
    lines: ['+607-388 9903', '+6011-5354 9903', '+607-388 3686'],
    links: ['tel:+60733889903', 'tel:+601153549903', 'tel:+60733883686'],
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    label: 'Email',
    lines: ['sales@smartouch.com.my'],
    links: ['mailto:sales@smartouch.com.my'],
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    label: 'WhatsApp',
    lines: ['+6011-5354 9903'],
    links: ['https://wa.me/601153549903'],
  },
]

const reasons = [
  { icon: '⚡', text: 'Fast response within 1 business day' },
  { icon: '🧑‍💼', text: 'Talk directly to an HR tech consultant' },
  { icon: '🎯', text: 'Custom demo tailored to your industry' },
  { icon: '💰', text: 'No commitment — free consultation' },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', message: '', interest: '' })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email'
    if (!form.message.trim()) e.message = 'Please tell us about your needs'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setSubmitted(true)
  }

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors((er) => ({ ...er, [field]: '' }))
  }

  return (
    <div className="contact-page">
      {/* Page hero */}
      <section className="contact-hero">
        <div className="contact-hero-bg" />
        <div className="container contact-hero-content">
          <span className="section-label" style={{ color: '#93c5fd', background: 'rgba(147,197,253,0.12)', borderColor: 'rgba(147,197,253,0.2)' }}>Get In Touch</span>
          <h1 className="page-hero-title">Talk to Our Team</h1>
          <p className="page-hero-desc">
            Whether you need a demo, a quote, or just want to understand which products are right for your business — we're here to help.
          </p>
          <div className="hero-reasons">
            {reasons.map((r) => (
              <div key={r.text} className="hero-reason">
                <span>{r.icon}</span>
                <span>{r.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="contact-main">
        <div className="container">
          <div className="contact-grid">
            {/* Form */}
            <div className="contact-form-panel">
              <div className="form-header">
                <h2>Send Us a Message</h2>
                <p>Fill in the form below and one of our consultants will be in touch within 1 business day.</p>
              </div>

              {submitted ? (
                <div className="form-success">
                  <div className="success-icon">✅</div>
                  <h3>Message Received!</h3>
                  <p>Thank you for reaching out. Our team will contact you at <strong>{form.email}</strong> within 1 business day.</p>
                  <button className="btn-primary" onClick={() => { setSubmitted(false); setForm({ name: '', company: '', email: '', phone: '', message: '', interest: '' }) }}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit} noValidate>
                  <div className="form-row">
                    <div className={`form-group ${errors.name ? 'error' : ''}`}>
                      <label htmlFor="name">Full Name *</label>
                      <input
                        id="name"
                        type="text"
                        placeholder="e.g. Ahmad Razif"
                        value={form.name}
                        onChange={handleChange('name')}
                      />
                      {errors.name && <span className="error-msg">{errors.name}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="company">Company Name</label>
                      <input
                        id="company"
                        type="text"
                        placeholder="e.g. ABC Manufacturing Sdn Bhd"
                        value={form.company}
                        onChange={handleChange('company')}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className={`form-group ${errors.email ? 'error' : ''}`}>
                      <label htmlFor="email">Email Address *</label>
                      <input
                        id="email"
                        type="email"
                        placeholder="e.g. hr@company.com.my"
                        value={form.email}
                        onChange={handleChange('email')}
                      />
                      {errors.email && <span className="error-msg">{errors.email}</span>}
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        id="phone"
                        type="tel"
                        placeholder="e.g. +60 12-345 6789"
                        value={form.phone}
                        onChange={handleChange('phone')}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="interest">I'm interested in</label>
                    <select
                      id="interest"
                      value={form.interest}
                      onChange={handleChange('interest')}
                    >
                      <option value="">Select a product or service...</option>
                      <option value="smartpay">SmartPay — Payroll System</option>
                      <option value="smartime">Smartime — Time &amp; Attendance</option>
                      <option value="smartgogo">SmartGoGo — Mobile HR App</option>
                      <option value="vms">Visitor Management System</option>
                      <option value="canteen">Canteen Management</option>
                      <option value="dormitory">Dormitory Management</option>
                      <option value="biometric">Biometric Hardware</option>
                      <option value="full">Full Suite (All Products)</option>
                      <option value="other">General Enquiry</option>
                    </select>
                  </div>
                  <div className={`form-group ${errors.message ? 'error' : ''}`}>
                    <label htmlFor="message">Tell us about your needs *</label>
                    <textarea
                      id="message"
                      rows={5}
                      placeholder="Describe your company size, current HR challenges, or what you're looking for..."
                      value={form.message}
                      onChange={handleChange('message')}
                    />
                    {errors.message && <span className="error-msg">{errors.message}</span>}
                  </div>
                  <button type="submit" className="btn-primary form-submit">
                    Send Message
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <p className="form-note">We respect your privacy. Your information will never be shared with third parties.</p>
                </form>
              )}
            </div>

            {/* Contact info */}
            <div className="contact-info-panel">
              <div className="info-header">
                <h2>Contact Information</h2>
                <p>Multiple ways to reach our team during business hours.</p>
              </div>

              <div className="contact-details">
                {contactDetails.map((d) => (
                  <div key={d.label} className="contact-detail">
                    <div className="detail-icon">{d.icon}</div>
                    <div className="detail-content">
                      <strong>{d.label}</strong>
                      <div className="detail-lines">
                        {d.lines.map((line, i) => (
                          d.links ? (
                            <a key={i} href={d.links[i]} target={d.links[i].startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">{line}</a>
                          ) : (
                            <span key={i}>{line}</span>
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="contact-entities">
                <h4>Registered Entities</h4>
                <div className="entity">
                  <strong>Smart Touch Technology Sdn Bhd</strong>
                  <span>Reg. No. 638440-D</span>
                </div>
                <div className="entity">
                  <strong>E Software MSC Sdn Bhd</strong>
                  <span>Reg. No. 780687-V</span>
                </div>
                <div className="entity">
                  <strong>GST Registration</strong>
                  <span>00 833 683 456</span>
                </div>
              </div>

              <div className="contact-social">
                <h4>Follow Us</h4>
                <div className="social-links">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    YouTube
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map section */}
      <section className="map-section">
        <div className="container">
          <div className="map-wrapper">
            <div className="map-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(37,99,235,0.4)" strokeWidth="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <div>
                <p className="map-title">Smart Touch Technology</p>
                <p>36-02 &amp; 36-03, Jalan Permas 10, Bandar Baru Permas Jaya, 81750 Masai, Johor</p>
                <a
                  href="https://maps.google.com/?q=Smart+Touch+Technology+Masai+Johor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline"
                  style={{ marginTop: 16 }}
                >
                  Open in Google Maps
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
