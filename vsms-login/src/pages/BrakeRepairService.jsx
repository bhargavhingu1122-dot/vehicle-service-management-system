import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './BrakeRepairService.css';

const BrakeRepairService = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const includes = [
    { title: 'Brake Pad Replacement', icon: 'ph-brackets-square', desc: 'Installation of high-performance ceramic or semi-metallic pads.' },
    { title: 'Brake Disc Check', icon: 'ph-circle-dashed', desc: 'Thorough inspection of rotors for thinning, warping, or scoring.' },
    { title: 'Brake Fluid Check', icon: 'ph-drop-half', desc: 'Testing moisture levels and topping up or flushing the system.' },
    { title: 'System Diagnosis', icon: 'ph-stethoscope', desc: 'Full electronic and mechanical scan of the ABS and braking circuit.' },
    { title: 'Brake Cleaning', icon: 'ph-sparkle', desc: 'Removing brake dust and debris to prevent squeaking and improve grip.' },
  ];

  const benefits = [
    { title: 'Ensures Safety', icon: 'ph-shield-check', color: '#ef4444' },
    { title: 'Quick Response', icon: 'ph-timer', color: '#fbbf24' },
    { title: 'Smooth Driving', icon: 'ph-wave-sine', color: '#007aff' },
    { title: 'Prevents Major Repairs', icon: 'ph-wrench', color: '#af52de' },
  ];

  const processSteps = [
    { label: 'Inspection', icon: 'ph-magnifying-glass' },
    { label: 'Pad Check', icon: 'ph-selection-all' },
    { label: 'Fluid Check', icon: 'ph-drop' },
    { label: 'Replacement', icon: 'ph-arrows-clockwise' },
    { label: 'Testing', icon: 'ph-speedometer' },
  ];

  const warnings = [
    { label: 'Noise', icon: 'ph-speaker-high' },
    { label: 'Delay', icon: 'ph-hourglass-high' },
    { label: 'Vibrations', icon: 'ph-activity' },
    { label: 'Warning light', icon: 'ph-warning' },
  ];

  return (
    <div className="br-page">
      {/* Back Button */}
      <Link to="/" className="br-back-btn">
        <i className="ph-bold ph-arrow-left"></i> Home
      </Link>

      {/* Hero Section */}
      <header className="br-hero">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="br-hero-content"
        >
          <div className="br-badge">Critical for your safety</div>
          <h1 className="br-title">Professional Brake Repair & <span>Safety Check</span></h1>
          <p className="br-subtitle">Ensure maximum safety with reliable braking performance, providing you with the stopping power you need in every situation.</p>
          <div className="br-hero-gfx">
            <i className="ph-duotone ph-warning-circle br-hero-icon"></i>
            <div className="br-glow-bg"></div>
          </div>
        </motion.div>
      </header>

      {/* Quick Details */}
      <section className="br-details-bar glass-panel">
        <div className="br-detail-item">
          <i className="ph-bold ph-clock"></i>
          <div>
            <span>Time Required</span>
            <p>1 – 2 Hours</p>
          </div>
        </div>
        <div className="br-detail-item">
          <i className="ph-bold ph-currency-inr"></i>
          <div>
            <span>Estimated Cost</span>
            <p>₹1500 – ₹5000</p>
          </div>
        </div>
        <div className="br-detail-item">
          <i className="ph-bold ph-calendar"></i>
          <div>
            <span>Recommended</span>
            <p>Every 10,000 km</p>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="br-section">
        <h2 className="br-section-title">What's Included</h2>
        <div className="br-includes-grid">
          {includes.map((item, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -5 }}
              className="br-include-card glass-panel"
            >
              <i className={`ph-duotone ${item.icon}`}></i>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why It Matters */}
      <section className="br-section br-benefits-section">
        <h2 className="br-section-title">Why It Matters</h2>
        <div className="br-benefits-grid">
          {benefits.map((benefit, idx) => (
            <motion.div 
              key={idx}
              className="br-benefit-card glass-panel"
              style={{ '--accent': benefit.color }}
            >
              <i className={`ph-bold ${benefit.icon}`}></i>
              <h3>{benefit.title}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Service Process */}
      <section className="br-section">
        <h2 className="br-section-title">Service Process</h2>
        <div className="br-process-timeline">
          {processSteps.map((step, idx) => (
            <div key={idx} className="br-process-step">
              <div className="br-step-icon">
                <i className={`ph-bold ${step.icon}`}></i>
              </div>
              <p>{step.label}</p>
              {idx < processSteps.length - 1 && <div className="br-step-connector"></div>}
            </div>
          ))}
        </div>
      </section>

      {/* When to Get */}
      <section className="br-section br-warnings-container">
        <h2 className="br-section-title">When Should You Get This?</h2>
        <div className="br-warnings-grid">
          {warnings.map((w, idx) => (
            <div key={idx} className="br-warning-card glass-panel">
              <div className="br-warning-icon">
                <i className="ph-bold ph-warning-circle"></i>
              </div>
              <div className="br-warning-content">
                <i className={`ph-bold ${w.icon}`}></i>
                <p>{w.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Did You Know */}
      <section className="br-did-you-know glass-panel">
        <div className="br-dyk-content">
          <i className="ph-fill ph-lightbulb"></i>
          <p><strong>Did You Know?</strong> Worn brake pads can increase stopping distance by up to 40%.</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="br-final-cta">
        <h2>Drive safely with perfectly functioning brakes</h2>
        <Link to="/login" className="br-cta-btn">
          Login to Book Brake Service <i className="ph-bold ph-arrow-right"></i>
        </Link>
      </section>

      <footer className="br-footer">
        &copy; 2026 Vehicle Care VSMS. All rights reserved.
      </footer>
    </div>
  );
};

export default BrakeRepairService;
