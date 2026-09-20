import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './CarWashService.css';

const CarWashService = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const includes = [
    { title: 'Exterior Wash', icon: 'ph-car', desc: 'High-pressure rinse and hand wash using premium pH-neutral shampoo.' },
    { title: 'Interior Cleaning', icon: 'ph-spray-bottle', desc: 'Deep vacuuming of carpets, seats, and mats to remove all dust and debris.' },
    { title: 'Foam Wash', icon: 'ph-waves', desc: 'Thick snow foam layer to lift dirt safely without scratching the paint.' },
    { title: 'Dashboard Polishing', icon: 'ph-sparkle', desc: 'Cleaning and UV protection dressing for a non-greasy, like-new finish.' },
    { title: 'Tyre Cleaning', icon: 'ph-circle', desc: 'Degreasing wheels and applying long-lasting tyre dresser for a deep black look.' },
  ];

  const benefits = [
    { title: 'Enhances Appearance', icon: 'ph-magic-wand', color: '#007aff' },
    { title: 'Protects Paint', icon: 'ph-shield-check', color: '#4ade80' },
    { title: 'Better Hygiene', icon: 'ph-heartbeat', color: '#f87171' },
    { title: 'Maintains Value', icon: 'ph-chart-line-up', color: '#fbbf24' },
  ];

  const processSteps = [
    { label: 'Rinse', icon: 'ph-drop' },
    { label: 'Foam Wash', icon: 'ph-cloud-snow' },
    { label: 'Interior Clean', icon: 'ph-wind' },
    { label: 'Drying', icon: 'ph-sun' },
    { label: 'Finish', icon: 'ph-check-circle' },
  ];

  const indicators = [
    { label: 'Dirty car', icon: 'ph-selection-all' },
    { label: 'Dust inside', icon: 'ph-mask-sad' },
    { label: 'After trips', icon: 'ph-map-trifold' },
    { label: 'Special occasions', icon: 'ph-confetti' },
  ];

  return (
    <div className="cw-page">
      {/* Back Button */}
      <Link to="/" className="cw-back-btn">
        <i className="ph-bold ph-arrow-left"></i> Home
      </Link>

      {/* Hero Section */}
      <header className="cw-hero">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="cw-hero-content"
        >
          <div className="cw-badge">Because your car deserves to look new</div>
          <h1 className="cw-title">Premium Car Wash & <span>Detailing Service</span></h1>
          <p className="cw-subtitle">Give your car a spotless shine inside and out with our professional-grade cleaning and detailing solutions.</p>
          <div className="cw-hero-gfx">
            <i className="ph-duotone ph-shower cw-hero-icon"></i>
            <div className="cw-glow-bg"></div>
          </div>
        </motion.div>
      </header>

      {/* Quick Details */}
      <section className="cw-details-bar glass-panel">
        <div className="cw-detail-item">
          <i className="ph-bold ph-clock"></i>
          <div>
            <span>Time Required</span>
            <p>45 – 90 Minutes</p>
          </div>
        </div>
        <div className="cw-detail-item">
          <i className="ph-bold ph-currency-inr"></i>
          <div>
            <span>Estimated Cost</span>
            <p>₹300 – ₹1500</p>
          </div>
        </div>
        <div className="cw-detail-item">
          <i className="ph-bold ph-calendar"></i>
          <div>
            <span>Recommended</span>
            <p>Every 2–4 Weeks</p>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="cw-section">
        <h2 className="cw-section-title">What's Included</h2>
        <div className="cw-includes-grid">
          {includes.map((item, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -5 }}
              className="cw-include-card glass-panel"
            >
              <i className={`ph-duotone ${item.icon}`}></i>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why It Matters */}
      <section className="cw-section cw-benefits-section">
        <h2 className="cw-section-title">Why It Matters</h2>
        <div className="cw-benefits-grid">
          {benefits.map((benefit, idx) => (
            <motion.div 
              key={idx}
              className="cw-benefit-card glass-panel"
              style={{ '--accent': benefit.color }}
            >
              <i className={`ph-bold ${benefit.icon}`}></i>
              <h3>{benefit.title}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Service Process */}
      <section className="cw-section">
        <h2 className="cw-section-title">Service Process</h2>
        <div className="cw-process-timeline">
          {processSteps.map((step, idx) => (
            <div key={idx} className="cw-process-step">
              <div className="cw-step-icon">
                <i className={`ph-bold ${step.icon}`}></i>
              </div>
              <p>{step.label}</p>
              {idx < processSteps.length - 1 && <div className="cw-step-connector"></div>}
            </div>
          ))}
        </div>
      </section>

      {/* When to Get */}
      <section className="cw-section cw-warnings-container">
        <h2 className="cw-section-title">When Should You Get This?</h2>
        <div className="cw-warnings-grid">
          {indicators.map((ind, idx) => (
            <div key={idx} className="cw-warning-card glass-panel">
              <div className="cw-warning-icon">
                <i className="ph-bold ph-info"></i>
              </div>
              <div className="cw-warning-content">
                <i className={`ph-bold ${ind.icon}`}></i>
                <p>{ind.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Did You Know */}
      <section className="cw-did-you-know glass-panel">
        <div className="cw-dyk-content">
          <i className="ph-fill ph-lightbulb"></i>
          <p><strong>Did You Know?</strong> Regular washing helps maintain paint and prevents damage from environmental contaminants.</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="cw-final-cta">
        <h2>Make your car shine like new</h2>
        <Link to="/login" className="cw-cta-btn">
          Login to Book Car Wash <i className="ph-bold ph-arrow-right"></i>
        </Link>
      </section>

      <footer className="cw-footer">
        &copy; 2026 Vehicle Care VSMS. All rights reserved.
      </footer>
    </div>
  );
};

export default CarWashService;
