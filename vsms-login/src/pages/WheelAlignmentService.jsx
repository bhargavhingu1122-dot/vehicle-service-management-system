import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './WheelAlignmentService.css';

const WheelAlignmentService = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const includes = [
    { title: 'Wheel Alignment', icon: 'ph-arrows-out-line-horizontal', desc: 'Precision laser-guided alignment of all four wheels for perfect geometry.' },
    { title: 'Tyre Balancing', icon: 'ph-circle-notch', desc: 'Correcting weight imbalances in wheels to eliminate steering vibrations.' },
    { title: 'Angle Calibration', icon: 'ph-compass', desc: 'Detailed adjustment of camber, caster, and toe angles for optimal control.' },
    { title: 'Suspension Check', icon: 'ph-link', desc: 'Inspection of shocks, struts, and linkages for optimal performance.' },
    { title: 'Tyre Wear Inspection', icon: 'ph-selection-all', desc: 'Detailed analysis of wear patterns to detect early alignment issues.' },
  ];

  const benefits = [
    { title: 'Better Control', icon: 'ph-hand-pointing', color: '#007aff' },
    { title: 'Longer Tyre Life', icon: 'ph-stack', color: '#4ade80' },
    { title: 'Improved Mileage', icon: 'ph-gas-pump', color: '#fbbf24' },
    { title: 'Safer Driving', icon: 'ph-shield-check', color: '#f87171' },
  ];

  const processSteps = [
    { label: 'Inspection', icon: 'ph-clipboard-text' },
    { label: 'Measurement', icon: 'ph-ruler' },
    { label: 'Adjustment', icon: 'ph-wrench' },
    { label: 'Balancing', icon: 'ph-scales' },
    { label: 'Testing', icon: 'ph-check-circle' },
  ];

  const warnings = [
    { label: 'Pulling to one side', icon: 'ph-arrow-square-left' },
    { label: 'Uneven tyre wear', icon: 'ph-warning' },
    { label: 'Vibrations', icon: 'ph-waveform' },
    { label: 'Misaligned steering', icon: 'ph-steering-wheel' },
  ];

  return (
    <div className="wa-page">
      {/* Back Button */}
      <Link to="/" className="wa-back-btn">
        <i className="ph-bold ph-arrow-left"></i> Home
      </Link>

      {/* Hero Section */}
      <header className="wa-hero">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="wa-hero-content"
        >
          <div className="wa-badge">Essential for stable driving</div>
          <h1 className="wa-title">Wheel Alignment & <span>Balancing Service</span></h1>
          <p className="wa-subtitle">Ensure smooth driving, better control, and longer tyre life with our advanced laser alignment technology.</p>
          <div className="wa-hero-gfx">
            <i className="ph-duotone ph-arrows-out-line-horizontal wa-hero-icon"></i>
            <div className="wa-glow-bg"></div>
          </div>
        </motion.div>
      </header>

      {/* Quick Details */}
      <section className="wa-details-bar glass-panel">
        <div className="wa-detail-item">
          <i className="ph-bold ph-clock"></i>
          <div>
            <span>Time Required</span>
            <p>45 – 60 Minutes</p>
          </div>
        </div>
        <div className="wa-detail-item">
          <i className="ph-bold ph-currency-inr"></i>
          <div>
            <span>Estimated Cost</span>
            <p>₹800 – ₹2000</p>
          </div>
        </div>
        <div className="wa-detail-item">
          <i className="ph-bold ph-calendar"></i>
          <div>
            <span>Recommended</span>
            <p>Every 6 Months</p>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="wa-section">
        <h2 className="wa-section-title">What's Included</h2>
        <div className="wa-includes-grid">
          {includes.map((item, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -5 }}
              className="wa-include-card glass-panel"
            >
              <i className={`ph-duotone ${item.icon}`}></i>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why It Matters */}
      <section className="wa-section wa-benefits-section">
        <h2 className="wa-section-title">Why It Matters</h2>
        <div className="wa-benefits-grid">
          {benefits.map((benefit, idx) => (
            <motion.div 
              key={idx}
              className="wa-benefit-card glass-panel"
              style={{ '--accent': benefit.color }}
            >
              <i className={`ph-bold ${benefit.icon}`}></i>
              <h3>{benefit.title}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Service Process */}
      <section className="wa-section">
        <h2 className="wa-section-title">Service Process</h2>
        <div className="wa-process-timeline">
          {processSteps.map((step, idx) => (
            <div key={idx} className="wa-process-step">
              <div className="wa-step-icon">
                <i className={`ph-bold ${step.icon}`}></i>
              </div>
              <p>{step.label}</p>
              {idx < processSteps.length - 1 && <div className="wa-step-connector"></div>}
            </div>
          ))}
        </div>
      </section>

      {/* When to Get */}
      <section className="wa-section wa-warnings-container">
        <h2 className="wa-section-title">When Should You Get This?</h2>
        <div className="wa-warnings-grid">
          {warnings.map((w, idx) => (
            <div key={idx} className="wa-warning-card glass-panel">
              <div className="wa-warning-icon">
                <i className="ph-bold ph-info"></i>
              </div>
              <div className="wa-warning-content">
                <i className={`ph-bold ${w.icon}`}></i>
                <p>{w.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Did You Know */}
      <section className="wa-did-you-know glass-panel">
        <div className="wa-dyk-content">
          <i className="ph-fill ph-lightbulb"></i>
          <p><strong>Did You Know?</strong> Improper alignment can reduce tyre life by up to 25% and significantly reduce overall vehicle safety.</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="wa-final-cta">
        <h2>Drive smoother with perfect wheel alignment</h2>
        <Link to="/login" className="wa-cta-btn">
          Login to Book Service <i className="ph-bold ph-arrow-right"></i>
        </Link>
      </section>

      <footer className="wa-footer">
        &copy; 2026 Vehicle Care VSMS. All rights reserved.
      </footer>
    </div>
  );
};

export default WheelAlignmentService;
