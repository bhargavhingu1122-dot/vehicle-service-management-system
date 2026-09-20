import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './CustomerDashboard.css';
import BookServicePage from './BookServicePage';
import MyServicesPage from './MyServicesPage';
import ServiceHistoryPage from './ServiceHistoryPage';
import InvoicesPage from './InvoicesPage';
import ProfilePage from './ProfilePage';
import { fetchCustomerServices, fetchVehicles, addVehicle, fetchNotifications, markNotificationAsRead, clearNotifications } from '../services/api';

const CustomerDashboard = () => {
    const [activeSection, setActiveSectionState] = useState(() => localStorage.getItem('customer_section') || 'dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showLogoutMessage, setShowLogoutMessage] = useState(false);
    const [stats, setStats] = useState({ active: 0, total: 0 });
    const [currentUser, setCurrentUser] = useState(() => {
        const userStr = localStorage.getItem('customer_user');
        return userStr ? JSON.parse(userStr) : null;
    });
    const [notifications, setNotifications] = useState([]);
    const [targetedService, setTargetedService] = useState(null);
    const navigate = useNavigate();

    const setActiveSection = (section) => {
        localStorage.setItem('customer_section', section);
        setActiveSectionState(section);
    };

    useEffect(() => {
        // --- Auth Setup: Read role-specific key to prevent data cross-contamination ---
        const userStr = localStorage.getItem('customer_user');
        console.log("CustomerDashboard Auth Check - userStr:", userStr);
        if (!userStr) {
            console.log("CustomerDashboard redirecting because no userStr found.");
            navigate('/login');
            return;
        }
        const user = JSON.parse(userStr);

        // Role guard: if stored user is not a Customer, they have no business here
        if (user.role && user.role !== 'Customer') {
            console.log("CustomerDashboard redirecting because role mismatch:", user.role);
            navigate('/login', { state: { message: 'Please log in as a Customer to access this panel.' } });
            return;
        }

        const normalizedUser = { ...user, id: user.id || user._id };
        setCurrentUser(normalizedUser);
        // Keep role-specific key in sync
        localStorage.setItem('customer_user', JSON.stringify(user));

        const updateFromStorage = () => {
            const freshUserStr = localStorage.getItem('customer_user');
            if (freshUserStr) {
                const freshUser = JSON.parse(freshUserStr);
                setCurrentUser({ ...freshUser, id: freshUser.id || freshUser._id });
            }
        };
        window.addEventListener('storage', updateFromStorage);

        // --- Fetch Stats ---
        const loadDashboardData = async () => {
            try {
                const { data: services } = await fetchCustomerServices(user.id);
                const active = services.filter(s => s.status !== 'Completed').length;
                setStats({ active, total: services.length });

                // --- Fetch Real Notifications ---
                const { data: notifs } = await fetchNotifications(user.id);
                setNotifications(notifs || []);
                
                // --- Optional: Seed a dummy vehicle if none exist for testing ---
                const { data: vehicles } = await fetchVehicles(user.id);
                if (vehicles.length === 0) {
                    await addVehicle({
                        ownerId: user.id,
                        name: 'Tesla Model S',
                        plate: 'MH-01-VC-2024',
                        brand: 'Tesla'
                    });
                }
            } catch (err) {
                console.error("Error loading dashboard data:", err);
            }
        };

        if (user.id) loadDashboardData();
        return () => window.removeEventListener('storage', updateFromStorage);
    }, [navigate, activeSection]);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'ph-house-line' },
        { id: 'book', label: 'Book Service', icon: 'ph-calendar-plus' },
        { id: 'services', label: 'My Services', icon: 'ph-wrench' },
        { id: 'history', label: 'Service History', icon: 'ph-clock-counter-clockwise' },
        { id: 'invoices', label: 'Invoices', icon: 'ph-file-text' },
    ];

    const vehicles = [
        { id: 1, name: 'Tesla Model S', plate: 'MH-01-AB-1234', brand: 'Tesla' },
        { id: 2, name: 'BMW M4', plate: 'GJ-05-XY-5678', brand: 'BMW' },
    ];

    const serviceTypes = [
        { id: 'general', name: 'General Service', icon: 'ph-gear-six', desc: 'Full vehicle checkup' },
        { id: 'repair', name: 'Repair', icon: 'ph-wrench', desc: 'Fix specific issues' },
        { id: 'oil', name: 'Oil Change', icon: 'ph-drop', desc: 'Synthetic oil replacement' },
        { id: 'custom', name: 'Custom Issue', icon: 'ph-warning-circle', desc: 'Describe your problem' },
    ];

    // --- Section Renderers ---

    const renderDashboard = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="page-container"
        >
            <div className="dashboard-page-header">
                <h1>Customer Dashboard</h1>
                <p>Manage your vehicles and active services below.</p>
            </div>

            <div className="stats-grid">
                <div className="glass-card stat-card-premium">
                    <div className="stat-icon"><i className="ph-bold ph-activity"></i></div>
                    <div className="stat-info">
                        <h3>{stats.active.toString().padStart(2, '0')}</h3>
                        <p>Active Services</p>
                    </div>
                </div>
                <div className="glass-card stat-card-premium">
                    <div className="stat-icon"><i className="ph-bold ph-calendar-check"></i></div>
                    <div className="stat-info">
                        <h3>01</h3>
                        <p>Upcoming Appointments</p>
                    </div>
                </div>
                <div className="glass-card stat-card-premium">
                    <div className="stat-icon"><i className="ph-bold ph-check-circle"></i></div>
                    <div className="stat-info">
                        <h3>{stats.total.toString().padStart(2, '0')}</h3>
                        <p>Total Services Done</p>
                    </div>
                </div>
                <div className="glass-card stat-card-premium">
                    <div className="stat-icon"><i className="ph-bold ph-credit-card"></i></div>
                    <div className="stat-info">
                        <h3>₹0</h3>
                        <p>Pending Payments</p>
                    </div>
                </div>
            </div>

            <div className="actions-section">
                <h2 className="section-title">Quick Actions</h2>
                <div className="quick-actions-grid">
                    <div className="glass-card action-card" onClick={() => setActiveSection('book')}>
                        <div className="action-details">
                            <h3>Book New Service</h3>
                            <p>Schedule a maintenance or repair session</p>
                        </div>
                        <div className="action-btn"><i className="ph-bold ph-plus"></i></div>
                    </div>
                    <div className="glass-card action-card" onClick={() => setActiveSection('services')}>
                        <div className="action-details">
                            <h3>Track Service</h3>
                            <p>Check the real-time status of your vehicle</p>
                        </div>
                        <div className="action-btn"><i className="ph-bold ph-crosshair"></i></div>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const renderBookService = () => (
        <BookServicePage 
            onComplete={(service) => {
                if (service) {
                    setTargetedService(service);
                } else {
                    setTargetedService(null);
                }
                setActiveSection('services');
            }} 
            userId={currentUser?.id} 
        />
    );

    const renderMyServices = () => (
        <MyServicesPage 
            onTrack={() => setActiveSection('tracker')} 
            onBook={() => setActiveSection('book')} 
            userId={currentUser?.id}
            targetedService={targetedService}
            onClearTarget={() => setTargetedService(null)}
        />
    );


    const renderHistory = () => (
        <ServiceHistoryPage onBook={() => setActiveSection('book')} userId={currentUser?.id} />
    );

    const renderInvoices = () => (
        <InvoicesPage onBook={() => setActiveSection('book')} userId={currentUser?.id} />
    );

    const renderProfile = () => (
        <ProfilePage userId={currentUser?.id} />
    );

    const renderNotifications = () => {
        const handleMarkAllRead = async () => {
             // In a real app we'd have a 'mark all read' API, for now we mark sequentially or just clear
             setNotifications(notifications.map(n => ({...n, read: true})));
        };

        const handleClearAll = async () => {
            try {
                await clearNotifications(currentUser.id);
                setNotifications([]);
            } catch (err) {
                console.error("Clear notifications failed:", err);
            }
        };

        const handleReadOne = async (id) => {
            try {
                await markNotificationAsRead(id);
                setNotifications(notifications.map(n => n._id === id ? {...n, read: true} : n));
            } catch (err) {
                console.error("Mark read failed:", err);
            }
        };

        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="page-container"
            >
                <div className="welcome-section d-flex justify-content-between align-items-center">
                    <div>
                        <h1>Notifications</h1>
                        <p>Stay updated with your vehicle services and system news.</p>
                    </div>
                    <div className="d-flex gap-3">
                        <button className="btn-secondary-outline py-2 px-4" onClick={handleMarkAllRead}>Mark as read</button>
                        <button className="btn-primary-red py-2 px-4" onClick={handleClearAll}>Clear all</button>
                    </div>
                </div>

                <div className="notifications-list d-flex flex-column gap-3">
                    {notifications.length > 0 ? (
                        notifications.map(notif => (
                            <div key={notif._id} className={`glass-card notif-card ${notif.read ? 'read' : 'unread'}`} onClick={() => !notif.read && handleReadOne(notif._id)} style={{ cursor: 'pointer' }}>
                                <div className="notif-icon-box">
                                    <i className={`ph-fill ${notif.title.includes('Job') || notif.title.includes('Service') ? 'ph-wrench' : 'ph-megaphone'}`}></i>
                                </div>
                                <div className="notif-info">
                                    <h3>{notif.title}</h3>
                                    <p>{notif.message}</p>
                                </div>
                                <span className="notif-time">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-5">
                            <i className="ph ph-bell-slash text-secondary mb-3" style={{ fontSize: '3rem' }}></i>
                            <p className="text-secondary">No notifications yet.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard': return renderDashboard();
            case 'book': return renderBookService();
            case 'services': return renderMyServices();
            case 'history': return renderHistory();
            case 'invoices': return renderInvoices();
            case 'profile': return renderProfile();
            case 'notifications': return renderNotifications();
            default: return renderDashboard();
        }
    };

    if (!currentUser || currentUser.role !== 'Customer') return null;

    return (
        <div className="customer-dashboard-container">
            {/* Sidebar */}
            <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <img src="/logo.png" alt="Vehicle Care" className="dashboard-logo-img" />
                    <div className="dashboard-logo-text">
                        <span className="dashboard-logo-title">Vehicle Care</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                            onClick={() => {
                                setActiveSection(item.id);
                                setIsMobileMenuOpen(false);
                            }}
                        >
                            <i className={`ph-bold ${item.icon}`}></i>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={() => {
                        // Only remove this panel's session — do NOT touch admin_user or mechanic_user
                        localStorage.removeItem('customer_user');
                        localStorage.removeItem('customer_section');
                        setShowLogoutMessage(true);
                        setTimeout(() => navigate('/'), 2000);
                    }}>
                        <i className="ph-bold ph-sign-out"></i>
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
            )}

            {/* Main Content Area */}
            <main className="main-content">
                <header className="top-header">
                    <div className="header-left">
                        <button className="toggle-sidebar d-md-none" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            <i className="ph-bold ph-list"></i>
                        </button>
                        <div className="topbar-welcome-badge">
                            Welcome back, {currentUser?.fullName?.split(' ')[0] || 'User'} 👋
                        </div>
                    </div>

                    <div className="header-right">
                        <button
                            className="header-icon-btn"
                            onClick={() => setActiveSection('notifications')}
                            title="Notifications"
                        >
                            <i className="ph-bold ph-bell"></i>
                            {notifications.filter(n => !n.read).length > 0 && <span className="notif-badge"></span>}
                        </button>

                        <button
                            className="header-icon-btn profile-trigger"
                            onClick={() => setActiveSection('profile')}
                            title="My Profile"
                        >
                            <i className="ph-bold ph-user"></i>
                        </button>
                    </div>
                </header>

                <div className="dynamic-content-wrapper">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Logout Overlay */}
            <AnimatePresence>
                {showLogoutMessage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="logout-overlay"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="glass-card logout-modal"
                        >
                            <i className="ph-fill ph-check-circle logout-icon"></i>
                            <h2>Logged Out Successfully</h2>
                            <p>Redirecting to Homepage...</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomerDashboard;
