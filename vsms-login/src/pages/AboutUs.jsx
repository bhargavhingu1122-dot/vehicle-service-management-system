import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './AboutUs.css';

const AboutUs = () => {
    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    const stats = [
        { label: 'Users', value: 10000, suffix: '+' },
        { label: 'Services', value: 15000, suffix: '+' },
        { label: 'Centers', value: 25, suffix: '+' }
    ];

    // Simple counter component logic (inline for compactness)
    const Counter = ({ value, suffix }) => {
        const [count, setCount] = React.useState(0);

        React.useEffect(() => {
            let start = 0;
            const end = value;
            const duration = 2000;
            const increment = end / (duration / 16);

            const timer = setInterval(() => {
                start += increment;
                if (start >= end) {
                    setCount(end);
                    clearInterval(timer);
                } else {
                    setCount(Math.floor(start));
                }
            }, 16);

            return () => clearInterval(timer);
        }, [value]);

        return <span>{count.toLocaleString()}{suffix}</span>;
    };

    return (
        <div className="about-page">
            {/* Cinematic Background Video (from Home) */}
            <video autoPlay muted loop playsInline className="about-video-background">
                <source src="/Car_Video_2.mp4" type="video/mp4" />
            </video>

            {/* Dark Overlay */}
            <div className="about-overlay"></div>

            {/* Background Effects */}
            <div className="about-glow glow-1"></div>
            <div className="about-glow glow-2"></div>

            <nav className="about-nav">
                <Link to="/" className="about-logo">
                    <img src="/logo.png" alt="Logo" />
                    <span>Vehicle Care</span>
                </Link>

                <div className="nav-menu-container">
                    <ul className="nav-menu">
                        <li><Link to="/" className="nav-link">Home</Link></li>
                        <li><Link to="/#services" className="nav-link">Services</Link></li>
                        <li><Link to="/about" className="nav-link active">About</Link></li>
                        <li><Link to="/contact" className="nav-link">Contact</Link></li>
                    </ul>
                    <Link to="/login" className="nav-login-btn">
                        Login
                    </Link>
                </div>
            </nav>

            <motion.div
                className="about-container"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* SECTION 1: HERO */}
                <motion.section className="about-hero" variants={itemVariants}>
                    <h1 className="about-hero-title">Smarter Vehicle Service Starts Here</h1>
                    <p className="about-hero-subtitle">Fast. Transparent. Reliable.</p>
                </motion.section>

                {/* SECTION 2: ABOUT STATEMENT */}
                <motion.section className="about-statement-wrap" variants={itemVariants}>
                    <div className="about-statement">
                        <ul>
                            <li>Vehicle Care is a modern Vehicle Service Management System designed to simplify and digitize the entire service process.</li>
                            <li>We connect customers, mechanics, and administrators into one unified platform, enabling real-time tracking, structured workflows, and better communication.</li>
                            <li>Our system reduces delays, improves transparency, and ensures a smoother, faster vehicle servicing experience.</li>
                        </ul>
                    </div>
                </motion.section>

                {/* SECTION 3: KEY HIGHLIGHTS */}
                <motion.section className="about-highlights" variants={containerVariants}>
                    <motion.div className="highlight-card card-blue" variants={itemVariants}>
                        <i className="ph-bold ph-broadcast" style={{ color: '#007aff' }}></i>
                        <span>⚡ Real-Time Tracking</span>
                    </motion.div>
                    <motion.div className="highlight-card card-purple" variants={itemVariants}>
                        <i className="ph-bold ph-currency-circle-dollar" style={{ color: '#af52de' }}></i>
                        <span>💰 Transparent Pricing</span>
                    </motion.div>
                    <motion.div className="highlight-card card-cyan" variants={itemVariants}>
                        <i className="ph-bold ph-gear-six" style={{ color: '#00c7be' }}></i>
                        <span>🔧 Smart Workflow</span>
                    </motion.div>
                    <motion.div className="highlight-card card-red" variants={itemVariants}>
                        <i className="ph-bold ph-users-three" style={{ color: '#ff3b30' }}></i>
                        <span>👥 Multi-User System</span>
                    </motion.div>
                </motion.section>

                {/* SECTION 4: MINI STATS */}
                <motion.section className="about-stats" variants={itemVariants}>
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-item">
                            <span className="stat-value">
                                <Counter value={stat.value} suffix={stat.suffix} />
                            </span>
                            <span className="stat-label">{stat.label}</span>
                        </div>
                    ))}
                </motion.section>

                {/* SECTION 5: FINAL CTA */}
                <motion.section className="about-cta" variants={itemVariants}>
                    <p className="about-cta-text">Built for Speed. Designed for Trust.</p>
                </motion.section>
            </motion.div>
        </div>
    );
};

export default AboutUs;
