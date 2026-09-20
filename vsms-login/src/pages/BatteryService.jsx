import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './BatteryService.css';

const BatteryService = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const includes = [
    { title: 'Battery Health Check', icon: 'ph-battery-charging', desc: 'Testing cold cranking amps (CCA) and overall health and voltage.' },
    { title: 'Battery Replacement', icon: 'ph-battery-high', desc: 'Installation of a high-quality, long-lasting battery suited for your car.' },
    { title: 'Charging System Test', icon: 'ph-lightning-slash', desc: 'Checking the alternator and starter motor for proper electrical output.' },
    { title: 'Terminal Cleaning', icon: 'ph-sparkle', desc: 'Removing corrosion from terminals to ensure a perfect electrical connection.' },
    { title: 'Electrical Inspection', icon: 'ph-magnifying-glass', desc: 'Full scan of the electrical circuit to identify parasitic drains.' },
  ];

  const benefits = [
    { title: 'Reliable Start', icon: 'ph-key', color: '#4ade80' },
    { title: 'Stable Power Supply', icon: 'ph-lightning', color: '#fbbf24' },
    { title: 'Avoid Breakdowns', icon: 'ph-truck', color: '#f87171' },
    { title: 'Improved Performance', icon: 'ph-trend-up', color: '#007aff' },
  ];

  const processSteps = [
    { label: 'Inspection', icon: 'ph-clipboard-text' },
    { label: 'Voltage Test', icon: 'ph-gauge' },
    { label: 'Removal', icon: 'ph-trash' },
    { label: 'Installation', icon: 'ph-download-simple' },
    { label: 'Testing', icon: 'ph-check-circle' },
  ];

  const warnings = [
    { label: 'Not starting', icon: 'ph-prohibit' },
    { label: 'Dim lights', icon: 'ph-lightbulb' },
    { label: 'Electrical issues', icon: 'ph-circuitry' },
    { label: 'Old battery', icon: 'ph-hourglass-low' },
  ];

  return (
    <div className="bat-page">
      {/* Back Button */}
      <Link to="/" className="bat-back-btn">
        <i className="ph-bold ph-arrow-left"></i> Home
      </Link>

      {/* Hero Section */}
      <header className="bat-hero">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bat-hero-content"
        >
          <div className="bat-badge">Power your drive with confidence</div>
          <h1 className="bat-title">Car Battery Replacement & <span>Health Check</span></h1>
          <p className="bat-subtitle">Ensure reliable starts and uninterrupted performance with a healthy battery, keeping your vehicle's heart beating strong.</p>
          <div className="bat-hero-gfx">
            <i className="ph-duotone ph-battery-charging bat-hero-icon"></i>
            <div className="bat-glow-bg"></div>
          </div>
        </motion.div>
      </header>

      {/* Quick Details */}
      <section className="bat-details-bar glass-panel">
        <div className="bat-detail-item">
          <i className="ph-bold ph-clock"></i>
          <div>
            <span>Time Required</span>
            <p>30 – 60 Minutes</p>
          </div>
        </div>
        <div className="bat-detail-item">
          <i className="ph-bold ph-currency-inr"></i>
          <div>
            <span>Estimated Cost</span>
            <p>₹3000 – ₹8000</p>
          </div>
        </div>
        <div className="bat-detail-item">
          <i className="ph-bold ph-calendar"></i>
          <div>
            <span>Recommended</span>
            <p>Every 2–3 Years</p>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="bat-section">
        <h2 className="bat-section-title">What's Included</h2>
        <div className="bat-includes-grid">
          {includes.map((item, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -5 }}
              className="bat-include-card glass-panel"
            >
              <i className={`ph-duotone ${item.icon}`}></i>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why It Matters */}
      <section className="bat-section bat-benefits-section">
        <h2 className="bat-section-title">Why It Matters</h2>
        <div className="bat-benefits-grid">
          {benefits.map((benefit, idx) => (
            <motion.div 
              key={idx}
              className="bat-benefit-card glass-panel"
              style={{ '--accent': benefit.color }}
            >
              <i className={`ph-bold ${benefit.icon}`}></i>
              <h3>{benefit.title}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Service Process */}
      <section className="bat-section">
        <h2 className="bat-section-title">Service Process</h2>
        <div className="bat-process-timeline">
          {processSteps.map((step, idx) => (
            <div key={idx} className="bat-process-step">
              <div className="bat-step-icon">
                <i className={`ph-bold ${step.icon}`}></i>
              </div>
              <p>{step.label}</p>
              {idx < processSteps.length - 1 && <div className="bat-step-connector"></div>}
            </div>
          ))}
        </div>
      </section>

      {/* When to Get */}
      <section className="bat-section bat-warnings-container">
        <h2 className="bat-section-title">When Should You Get This?</h2>
        <div className="bat-warnings-grid">
          {warnings.map((w, idx) => (
            <div key={idx} className="bat-warning-card glass-panel">
              <div className="bat-warning-icon">
                <i className="ph-bold ph-warning-circle"></i>
              </div>
              <div className="bat-warning-content">
                <i className={`ph-bold ${w.icon}`}></i>
                <p>{w.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Did You Know */}
      <section className="bat-did-you-know glass-panel">
        <div className="bat-dyk-content">
          <i className="ph-fill ph-lightbulb"></i>
          <p><strong>Did You Know?</strong> Extreme temperatures can reduce battery life by up to 30%.</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bat-final-cta">
        <h2>Never let your car run out of power</h2>
        <Link to="/login" className="bat-cta-btn">
          Login to Replace Battery <i className="ph-bold ph-arrow-right"></i>
        </Link>
      </section>

      <footer className="bat-footer">
        &copy; 2026 Vehicle Care VSMS. All rights reserved.
      </footer>
    </div>
  );
};

export default BatteryService;
