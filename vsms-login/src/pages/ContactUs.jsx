import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './ContactUs.css';

const ContactUs = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.name && formData.email && formData.message) {
            try {
                const response = await fetch('http://localhost:5000/api/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                if (response.ok) {
                    setStatus('Message sent successfully!');
                    setFormData({ name: '', email: '', message: '' });
                    setTimeout(() => setStatus(''), 4000);
                } else {
                    setStatus('Failed to send message.');
                    setTimeout(() => setStatus(''), 4000);
                }
            } catch (error) {
                setStatus('Network error. Please try again.');
                setTimeout(() => setStatus(''), 4000);
            }
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <div className="contact-page">
            {/* Cinematic Background Video */}
            <video autoPlay muted loop playsInline className="about-video-background">
                <source src="/Car_Video_2.mp4" type="video/mp4" />
            </video>
            <div className="about-overlay"></div>

            {/* Glowing Orbs */}
            <div className="about-glow glow-1"></div>
            <div className="about-glow glow-2"></div>

            {/* Navigation Bar */}
            <nav className="about-nav">
                <Link to="/" className="about-logo">
                    <img src="/logo.png" alt="Logo" />
                    <span>Vehicle Care</span>
                </Link>

                <div className="nav-menu-container">
                    <ul className="nav-menu">
                        <li><Link to="/" className="nav-link">Home</Link></li>
                        <li><Link to="/#services" className="nav-link">Services</Link></li>
                        <li><Link to="/about" className="nav-link">About</Link></li>
                        <li><Link to="/contact" className="nav-link active">Contact</Link></li>
                    </ul>
                    <Link to="/login" className="nav-login-btn">Login</Link>
                </div>
            </nav>

            <motion.div
                className="contact-container"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* SECTION 1: HERO */}
                <motion.section className="contact-hero" variants={itemVariants}>
                    <h1 className="contact-hero-title">Get in Touch</h1>
                    <p className="contact-hero-subtext">We’re here to help you with your vehicle service needs.</p>
                </motion.section>

                {/* SECTION 2: CONTACT INFO + FORM */}
                <motion.section className="contact-main" variants={itemVariants}>
                    <div className="contact-info-panel">
                        <motion.div className="contact-card info-card-blue" variants={itemVariants}>
                            <i className="ph-fill ph-map-pin" style={{ color: '#007aff' }}></i>
                            <div className="contact-card-text">
                                <h3>Location</h3>
                                <p>Ahmedabad, Gujarat, India</p>
                            </div>
                        </motion.div>
                        <motion.div className="contact-card info-card-purple" variants={itemVariants}>
                            <i className="ph-fill ph-envelope-simple" style={{ color: '#af52de' }}></i>
                            <div className="contact-card-text">
                                <h3>Email</h3>
                                <p>vehiclecare2354@gmail.com</p>
                            </div>
                        </motion.div>
                        <motion.div className="contact-card info-card-red" variants={itemVariants}>
                            <i className="ph-fill ph-phone-call" style={{ color: '#ff3b30' }}></i>
                            <div className="contact-card-text">
                                <h3>Phone</h3>
                                <p>+91 88664 28966</p>
                            </div>
                        </motion.div>
                    </div>

                    <div className="contact-form-panel">
                        <form className="contact-glass-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" placeholder="Enter Name" required
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" placeholder="Enter Email" required
                                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Message</label>
                                <textarea rows="3" placeholder="How can we help..." required
                                    value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })}></textarea>
                            </div>
                            <button type="submit" className="contact-submit-btn">Send Message</button>
                            <AnimatePresence>
                                {status && (
                                    <motion.div
                                        className="contact-status-msg"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <i className="ph-bold ph-check-circle"></i> {status}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </div>
                </motion.section>



                {/* SECTION 4: FINAL LINE */}
                <motion.section className="contact-footer-line" variants={itemVariants}>
                    <p>Your vehicle, our responsibility.</p>
                </motion.section>
            </motion.div>
        </div>
    );
};

export default ContactUs;
