import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Home.css';
import HomeSections from '../components/home/HomeSections';

const Home = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showAdminBack, setShowAdminBack] = useState(false);
    const [activeSection, setActiveSection] = useState('home');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        // Check if coming from admin or if already in admin mode this session
        if (params.get('from') === 'admin') {
            sessionStorage.setItem('isAdminPreview', 'true');
            setShowAdminBack(true);
        } else if (sessionStorage.getItem('isAdminPreview') === 'true') {
            setShowAdminBack(true);
        }
    }, [location]);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const servicesSection = document.getElementById('services');
            const contactSection = document.getElementById('contact');

            let current = 'home';
            // Adjust offset to trigger slightly before reaching the section
            if (servicesSection && scrollY >= servicesSection.offsetTop - 200) {
                current = 'services';
            }
            if (contactSection && scrollY >= contactSection.offsetTop - 500) {
                current = 'contact';
            }
            setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleBackToAdmin = () => {
        sessionStorage.removeItem('isAdminPreview');
        navigate('/admin-dashboard');
    };

    return (
        <div className="home-page">
            {/* Cinematic Background Video */}
            <video autoPlay muted loop playsInline className="home-video-background">
                <source src="/Car_Video_2.mp4" type="video/mp4" />
            </video>

            {/* Dark 60-75% Overlay */}
            <div className="home-overlay"></div>

            <nav className="dashboard-nav-top">
                <Link to="/" className="home-logo-container">
                    <img src="/logo.png" alt="Vehicle Care Logo" className="nav-logo-img" />
                    <div className="home-logo-text">
                        <span className="home-logo-title">Vehicle Care</span>
                    </div>
                </Link>

                <div className="nav-menu-container">
                    <ul className="nav-menu">
                        <li>
                            <a href="#" className={`nav-link ${activeSection === 'home' ? 'active' : ''}`} onClick={(e) => {
                                e.preventDefault();
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}>Home</a>
                        </li>
                        <li>
                            <a href="#services" className={`nav-link ${activeSection === 'services' ? 'active' : ''}`} onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                            }}>Services</a>
                        </li>
                        <li>
                            <Link to="/about" className="nav-link">About</Link>
                        </li>
                        <li>
                            <Link to="/contact" className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>Contact</Link>
                        </li>
                    </ul>

                    <Link to="/login" className="nav-login-btn">
                        Login
                    </Link>
                </div>

                {showAdminBack && (
                    <button
                        className="admin-back-icon-btn"
                        onClick={handleBackToAdmin}
                        title="Back to Admin Panel"
                    >
                        <i className="ph-bold ph-shield-check"></i>
                    </button>
                )}
            </nav>


            {/* UI Content Wrapper with Animation */}
            <div className="delayed-ui-reveal">

                <div className="home-hero-container">
                    <div className="home-hero-content">
                        <div className="home-hero-text-section">
                            <div className="home-badge">Next-Generation platform</div>
                            <h1 className="home-hero-title">Precision Driving <span>Digital Mastery.</span></h1>
                            <p className="home-hero-subtitle">Experience real-time diagnostics, automated workflows, and predictive vehicle maintenance designed exclusively for elite automotive enthusiasts.</p>
                            <Link to="/register" className="home-cta-btn">
                                Access System <i className="ph-bold ph-arrow-right"></i>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Injected Premium Home Sections */}
                <HomeSections />
            </div>
        </div>
    );
};

export default Home;
