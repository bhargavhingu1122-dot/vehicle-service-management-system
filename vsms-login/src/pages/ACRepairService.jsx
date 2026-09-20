import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './ACRepairService.css';

const ACRepairService = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const includes = [
    { title: 'AC Cooling Check', icon: 'ph-thermometer-cold', desc: 'Comprehensive measurement of vent temperature and cooling efficiency.' },
    { title: 'Gas Refill', icon: 'ph-wind', desc: 'Top-up or full replacement of refrigerant gas to restore peak performance.' },
    { title: 'Blower Inspection', icon: 'ph-fan', desc: 'Cleaning and testing the blower motor for optimal airflow.' },
    { title: 'AC Filter Cleaning', icon: 'ph-funnel', desc: 'Removing dust and allergens from the cabin filter for fresh air.' },
    { title: 'Leak Detection', icon: 'ph-magnifying-glass', desc: 'Pressure testing and visual checks for any refrigerant leaks.' },
  ];

  const benefits = [
    { title: 'Better Cooling Performance', icon: 'ph-snowflake', color: '#007aff' },
    { title: 'Improved Air Quality', icon: 'ph-plant', color: '#4ade80' },
    { title: 'Efficient System', icon: 'ph-lightning', color: '#fbbf24' },
    { title: 'Prevents Major Damage', icon: 'ph-shield-check', color: '#f87171' },
  ];

  const processSteps = [
    { label: 'Inspection', icon: 'ph-clipboard-text' },
    { label: 'Gas Check', icon: 'ph-gauge' },
    { label: 'Leak Detection', icon: 'ph-flashlight' },
    { label: 'Filter Cleaning', icon: 'ph-broom' },
    { label: 'Testing', icon: 'ph-check-circle' },
  ];

  const warnings = [
    { label: 'Weak cooling', icon: 'ph-thermometer' },
    { label: 'Bad smell', icon: 'ph-warning-octagon' },
    { label: 'Noise', icon: 'ph-speaker-slash' },
    { label: 'No cooling', icon: 'ph-x-circle' },
  ];

  return (
    <div className="ac-page">
      {/* Back Button */}
      <Link to="/" className="ac-back-btn">
        <i className="ph-bold ph-arrow-left"></i> Home
      </Link>

      {/* Hero Section */}
      <header className="ac-hero">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="ac-hero-content"
        >
          <div className="ac-badge">Perfect for summer driving</div>
          <h1 className="ac-title">Car AC Repair & <span>Cooling Service</span></h1>
          <p className="ac-subtitle">Stay cool and comfortable with efficient air conditioning performance, ensuring every drive is a breath of fresh, chilled air.</p>
          <div className="ac-hero-gfx">
            <i className="ph-duotone ph-snowflake ac-hero-icon"></i>
            <div className="ac-glow-bg"></div>
          </div>
        </motion.div>
      </header>

      {/* Quick Details */}
      <section className="ac-details-bar glass-panel">
        <div className="ac-detail-item">
          <i className="ph-bold ph-clock"></i>
          <div>
            <span>Time Required</span>
            <p>1 – 2 Hours</p>
          </div>
        </div>
        <div className="ac-detail-item">
          <i className="ph-bold ph-currency-inr"></i>
          <div>
            <span>Estimated Cost</span>
            <p>₹1200 – ₹4000</p>
          </div>
        </div>
        <div className="ac-detail-item">
          <i className="ph-bold ph-calendar"></i>
          <div>
            <span>Recommended</span>
            <p>Before Summer</p>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="ac-section">
        <h2 className="ac-section-title">What's Included</h2>
        <div className="ac-includes-grid">
          {includes.map((item, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -5 }}
              className="ac-include-card glass-panel"
            >
              <i className={`ph-duotone ${item.icon}`}></i>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why It Matters */}
      <section className="ac-section ac-benefits-section">
        <h2 className="ac-section-title">Why It Matters</h2>
        <div className="ac-benefits-grid">
          {benefits.map((benefit, idx) => (
            <motion.div 
              key={idx}
              className="ac-benefit-card glass-panel"
              style={{ '--accent': benefit.color }}
            >
              <i className={`ph-bold ${benefit.icon}`}></i>
              <h3>{benefit.title}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Service Process */}
      <section className="ac-section">
        <h2 className="ac-section-title">Service Process</h2>
        <div className="ac-process-timeline">
          {processSteps.map((step, idx) => (
            <div key={idx} className="ac-process-step">
              <div className="ac-step-icon">
                <i className={`ph-bold ${step.icon}`}></i>
              </div>
              <p>{step.label}</p>
              {idx < processSteps.length - 1 && <div className="ac-step-connector"></div>}
            </div>
          ))}
        </div>
      </section>

      {/* When to Get */}
      <section className="ac-section ac-warnings-container">
        <h2 className="ac-section-title">When Should You Get This?</h2>
        <div className="ac-warnings-grid">
          {warnings.map((w, idx) => (
            <div key={idx} className="ac-warning-card glass-panel">
              <div className="ac-warning-icon">
                <i className="ph-bold ph-warning-circle"></i>
              </div>
              <div className="ac-warning-content">
                <i className={`ph-bold ${w.icon}`}></i>
                <p>{w.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Did You Know */}
      <section className="ac-did-you-know glass-panel">
        <div className="ac-dyk-content">
          <i className="ph-fill ph-lightbulb"></i>
          <p><strong>Did You Know?</strong> Clogged AC filters can reduce cooling efficiency by up to 30%.</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="ac-final-cta">
        <h2>Enjoy a cool and comfortable ride every time</h2>
        <Link to="/login" className="ac-cta-btn">
          Login to Book AC Service <i className="ph-bold ph-arrow-right"></i>
        </Link>
      </section>

      <footer className="ac-footer">
        &copy; 2026 Vehicle Care VSMS. All rights reserved.
      </footer>
    </div>
  );
};

export default ACRepairService;
