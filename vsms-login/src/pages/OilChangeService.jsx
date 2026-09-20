import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './OilChangeService.css';

const OilChangeService = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const includes = [
    { title: 'Engine Oil Replacement', icon: 'ph-drop', desc: 'Drain old oil and refill with premium synthetic oil.' },
    { title: 'Oil Filter Replacement', icon: 'ph-funnel', desc: 'New high-efficiency filter to keep oil clean longer.' },
    { title: 'Engine Inspection', icon: 'ph-magnifying-glass', desc: 'Visual check for leaks, cracks, or worn components.' },
    { title: 'Fluid Top-up', icon: 'ph-test-tube', desc: 'Brake fluid, coolant, and washer fluid levels checked.' },
    { title: 'Engine Cleaning', icon: 'ph-sparkle', desc: 'External degreasing and cleaning of the engine bay.' },
  ];

  const benefits = [
    { title: 'Reduces Engine Wear', icon: 'ph-shield-check', color: '#007aff' },
    { title: 'Improves Performance', icon: 'ph-gauge', color: '#af52de' },
    { title: 'Better Fuel Efficiency', icon: 'ph-leaf', color: '#007aff' },
    { title: 'Prevents Overheating', icon: 'ph-thermometer-hot', color: '#af52de' },
  ];

  const processSteps = [
    { label: 'Drain Oil', icon: 'ph-drop-half' },
    { label: 'Replace Filter', icon: 'ph-funnel' },
    { label: 'Add New Oil', icon: 'ph-drop' },
    { label: 'Check Leaks', icon: 'ph-eye' },
    { label: 'Final Test', icon: 'ph-fast-forward' },
  ];

  const warnings = [
    { label: 'Engine noise', icon: 'ph-speaker-high' },
    { label: 'Dirty oil', icon: 'ph-paint-brush-broad' },
    { label: 'Low mileage', icon: 'ph-gauge' },
    { label: 'Warning light', icon: 'ph-warning' },
  ];

  return (
    <div className="oc-page">
      {/* Back Button */}
      <Link to="/" className="oc-back-btn">
        <i className="ph-bold ph-arrow-left"></i> Home
      </Link>

      {/* Hero Section */}
      <header className="oc-hero">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="oc-hero-content"
        >
          <div className="oc-badge">Essential for engine health</div>
          <h1 className="oc-title">Professional <span>Oil Change Service</span></h1>
          <p className="oc-subtitle">Keep your engine smooth, efficient, and long-lasting with high-quality oil replacement designed for ultimate protection.</p>
          <div className="oc-hero-gfx">
            <i className="ph-duotone ph-drop oc-hero-icon"></i>
            <div className="oc-glow-bg"></div>
          </div>
        </motion.div>
      </header>

      {/* Quick Details */}
      <section className="oc-details-bar glass-panel">
        <div className="oc-detail-item">
          <i className="ph-bold ph-clock"></i>
          <div>
            <span>Time Required</span>
            <p>30 – 60 Minutes</p>
          </div>
        </div>
        <div className="oc-detail-item">
          <i className="ph-bold ph-currency-inr"></i>
          <div>
            <span>Estimated Cost</span>
            <p>₹800 – ₹2500</p>
          </div>
        </div>
        <div className="oc-detail-item">
          <i className="ph-bold ph-calendar"></i>
          <div>
            <span>Recommended</span>
            <p>5,000 – 10,000 km</p>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="oc-section">
        <h2 className="oc-section-title">What's Included</h2>
        <div className="oc-includes-grid">
          {includes.map((item, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -5 }}
              className="oc-include-card glass-panel"
            >
              <i className={`ph-duotone ${item.icon}`}></i>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why It Matters */}
      <section className="oc-section oc-benefits-section">
        <h2 className="oc-section-title">Why It Matters</h2>
        <div className="oc-benefits-grid">
          {benefits.map((benefit, idx) => (
            <motion.div 
              key={idx}
              className="oc-benefit-card glass-panel"
              style={{ '--accent': benefit.color }}
            >
              <i className={`ph-bold ${benefit.icon}`}></i>
              <h3>{benefit.title}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Service Process */}
      <section className="oc-section">
        <h2 className="oc-section-title">Service Process</h2>
        <div className="oc-process-timeline">
          {processSteps.map((step, idx) => (
            <div key={idx} className="oc-process-step">
              <div className="oc-step-icon">
                <i className={`ph-bold ${step.icon}`}></i>
              </div>
              <p>{step.label}</p>
              {idx < processSteps.length - 1 && <div className="oc-step-connector"></div>}
            </div>
          ))}
        </div>
      </section>

      {/* When to Get */}
      <section className="oc-section oc-warnings-container">
        <h2 className="oc-section-title">When Should You Get This?</h2>
        <div className="oc-warnings-grid">
          {warnings.map((w, idx) => (
            <div key={idx} className="oc-warning-card glass-panel">
              <div className="oc-warning-icon">
                <i className="ph-bold ph-warning-circle"></i>
              </div>
              <div className="oc-warning-content">
                <i className={`ph-bold ${w.icon}`}></i>
                <p>{w.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Did You Know */}
      <section className="oc-did-you-know glass-panel">
        <div className="oc-dyk-content">
          <i className="ph-fill ph-lightbulb"></i>
          <p><strong>Did You Know?</strong> Fresh oil can improve fuel efficiency by up to 2–3%.</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="oc-final-cta">
        <h2>Give your engine the care it deserves</h2>
        <Link to="/login" className="oc-cta-btn">
          Login to Book Oil Change <i className="ph-bold ph-arrow-right"></i>
        </Link>
      </section>

      <footer className="oc-footer">
        &copy; 2026 Vehicle Care VSMS. All rights reserved.
      </footer>
    </div>
  );
};

export default OilChangeService;
