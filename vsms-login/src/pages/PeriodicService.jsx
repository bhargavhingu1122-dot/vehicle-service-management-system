import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './PeriodicService.css';

const PeriodicService = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const includes = [
    { title: 'General Inspection', icon: 'ph-eye', desc: 'Comprehensive bumper-to-bumper vehicle checkup.' },
    { title: 'Engine Oil Check', icon: 'ph-drop', desc: 'Analysis of oil quality and level for engine health.' },
    { title: 'Brake Inspection', icon: 'ph-stop-circle', desc: 'Thorough testing of brake pads, liners, and fluid.' },
    { title: 'Air Filter Cleaning', icon: 'ph-wind', desc: 'Cleaning or replacement for optimal air intake.' },
    { title: 'Battery Health Check', icon: 'ph-battery-charging', desc: 'Voltage and terminals check for reliable starts.' },
    { title: 'Coolant Level Check', icon: 'ph-thermometer-cold', desc: 'Ensuring your engine stays at the right temperature.' },
  ];

  const benefits = [
    { title: 'Improves Performance', icon: 'ph-gauge', color: '#007aff' },
    { title: 'Saves Money', icon: 'ph-currency-circle-dollar', color: '#af52de' },
    { title: 'Increases Safety', icon: 'ph-shield-check', color: '#007aff' },
    { title: 'Better Mileage', icon: 'ph-leaf', color: '#af52de' },
  ];

  const processSteps = [
    { label: 'Inspection', icon: 'ph-magnifying-glass' },
    { label: 'Oil & Fluid Check', icon: 'ph-drop-half' },
    { label: 'Cleaning', icon: 'ph-sparkle' },
    { label: 'Testing', icon: 'ph-fast-forward' },
    { label: 'Final Check', icon: 'ph-seal-check' },
  ];

  const warnings = [
    { label: 'Low mileage', icon: 'ph-gauge' },
    { label: 'Engine noise', icon: 'ph-speaker-high' },
    { label: 'Delayed pickup', icon: 'ph-timer' },
    { label: 'Long time since service', icon: 'ph-calendar-x' },
  ];

  return (
    <div className="ps-page">
      {/* Back Button */}
      <Link to="/" className="ps-back-btn">
        <i className="ph-bold ph-arrow-left"></i> Home
      </Link>

      {/* Hero Section */}
      <header className="ps-hero">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="ps-hero-content"
        >
          <div className="ps-badge">Recommended every 6 months</div>
          <h1 className="ps-title">Complete <span>Periodic Car Service</span></h1>
          <p className="ps-subtitle">Keep your vehicle running like new with regular maintenance and expert care designed for precision and longevity.</p>
          <div className="ps-hero-gfx">
            <i className="ph-duotone ph-engine ps-hero-icon"></i>
            <div className="ps-glow-bg"></div>
          </div>
        </motion.div>
      </header>

      {/* Quick Details */}
      <section className="ps-details-bar glass-panel">
        <div className="ps-detail-item">
          <i className="ph-bold ph-clock"></i>
          <div>
            <span>Time Required</span>
            <p>2 – 3 Hours</p>
          </div>
        </div>
        <div className="ps-detail-item">
          <i className="ph-bold ph-currency-inr"></i>
          <div>
            <span>Estimated Cost</span>
            <p>₹1500 – ₹3000</p>
          </div>
        </div>
        <div className="ps-detail-item">
          <i className="ph-bold ph-calendar"></i>
          <div>
            <span>Recommended</span>
            <p>Every 6 months</p>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="ps-section">
        <h2 className="ps-section-title">What's Included</h2>
        <div className="ps-includes-grid">
          {includes.map((item, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -5 }}
              className="ps-include-card glass-panel"
            >
              <i className={`ph-duotone ${item.icon}`}></i>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why It Matters */}
      <section className="ps-section ps-benefits-section">
        <h2 className="ps-section-title">Why It Matters</h2>
        <div className="ps-benefits-grid">
          {benefits.map((benefit, idx) => (
            <motion.div 
              key={idx}
              className="ps-benefit-card glass-panel"
              style={{ '--accent': benefit.color }}
            >
              <i className={`ph-bold ${benefit.icon}`}></i>
              <h3>{benefit.title}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Service Process */}
      <section className="ps-section">
        <h2 className="ps-section-title">Service Process</h2>
        <div className="ps-process-timeline">
          {processSteps.map((step, idx) => (
            <div key={idx} className="ps-process-step">
              <div className="ps-step-icon">
                <i className={`ph-bold ${step.icon}`}></i>
              </div>
              <p>{step.label}</p>
              {idx < processSteps.length - 1 && <div className="ps-step-connector"></div>}
            </div>
          ))}
        </div>
      </section>

      {/* When Should You Get This */}
      <section className="ps-section ps-warnings-container">
        <h2 className="ps-section-title">When Should You Get This?</h2>
        <div className="ps-warnings-grid">
          {warnings.map((w, idx) => (
            <div key={idx} className="ps-warning-card glass-panel">
              <div className="ps-warning-icon">
                <i className="ph-bold ph-warning-circle"></i>
              </div>
              <div className="ps-warning-content">
                <i className={`ph-bold ${w.icon}`}></i>
                <p>{w.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Did You Know */}
      <section className="ps-did-you-know glass-panel">
        <div className="ps-dyk-content">
          <i className="ph-fill ph-lightbulb"></i>
          <p><strong>Did You Know?</strong> Regular servicing can increase your car’s lifespan by up to 30%.</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="ps-final-cta">
        <h2>Ready to give your car the care it deserves?</h2>
        <Link to="/login" className="ps-cta-btn">
          Login to Book Service <i className="ph-bold ph-arrow-right"></i>
        </Link>
      </section>

      <footer className="ps-footer">
        &copy; 2026 Vehicle Care VSMS. All rights reserved.
      </footer>
    </div>
  );
};

export default PeriodicService;
