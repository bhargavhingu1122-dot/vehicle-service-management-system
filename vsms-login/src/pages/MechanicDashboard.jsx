import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './MechanicDashboard.css';
import { 
    fetchMechanicRequests, 
    updateServiceStatus, 
    saveServiceNotes, 
    fetchNotifications, 
    markNotificationAsRead,
    fetchUserProfile,
    updateUserProfile
} from '../services/api';
import InvoiceView from '../components/InvoiceView';

const SPECIALIZATION_OPTIONS = [
    "General Service", "Engine Repair", "Electrical Repair", 
    "AC Service & Repair", "Brake & Suspension", "Transmission Repair", 
    "Battery Service", "Oil & Fluid Service", "Tyre & Wheel Service", 
    "Diagnostic Specialist"
];

const MechanicDashboard = () => {
    const [activeSection, setActiveSectionState] = useState(() => localStorage.getItem('mechanic_section') || 'dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showLogoutMessage, setShowLogoutMessage] = useState(false);
    const [currentUser, setCurrentUser] = useState(() => {
        const userStr = localStorage.getItem('mechanic_user');
        return userStr ? JSON.parse(userStr) : null;
    });
    const [billForm, setBillForm] = useState({ service: 0, parts: 0, additional: 0 });
    
    // Live Data State
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedReqId, setSelectedReqId] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);
    const [serviceNotes, setServiceNotes] = useState('');
    const [selectedInvoiceReqId, setSelectedInvoiceReqId] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileToast, setProfileToast] = useState({ show: false, message: '', type: 'success' });
    const [services, setServices] = useState([]);

    const navigate = useNavigate();

    const setActiveSection = (section) => {
        localStorage.setItem('mechanic_section', section);
        setActiveSectionState(section);
    };

    useEffect(() => {
        // --- Auth Setup: Read role-specific key to prevent data cross-contamination ---
        const userStr = localStorage.getItem('mechanic_user');
        if (!userStr) {
            navigate('/login');
            return;
        }
        const user = JSON.parse(userStr);

        // Role guard: if stored user is not a Mechanic, redirect to login
        if (user.role && user.role !== 'Mechanic') {
            navigate('/login', { state: { message: 'Please log in as a Mechanic to access this panel.' } });
            return;
        }

        const normalizedUser = { ...user, id: user.id || user._id };
        setCurrentUser(normalizedUser);
        // Keep role-specific key in sync
        localStorage.setItem('mechanic_user', JSON.stringify(user));
        
        if (normalizedUser.id) {
            fetchMechanicData(normalizedUser.id);
            loadNotifications(normalizedUser.id);
            fetchServices();

            // Set up polling for real-time updates
            const intervalId = setInterval(() => {
                fetchMechanicData(normalizedUser.id, true);
                loadNotifications(normalizedUser.id, true);
            }, 10000); // Check every 10 seconds

            return () => clearInterval(intervalId);
        }
    }, [navigate]);

    const loadNotifications = async (userId, isPolling = false) => {
        try {
            const { data } = await fetchNotifications(userId);
            if (isPolling && data) {
                setNotifications(prev => {
                    // Check for new unread notifications that aren't in the previous state
                    const newNotifs = data.filter(n => !n.read && !prev.find(p => p._id === n._id));
                    if (newNotifs.length > 0) {
                        // Trigger a toast for the first new notification
                        showToast(`🔔 New Alert: ${newNotifs[0].title}`, 'success');
                    }
                    return data;
                });
            } else {
                setNotifications(data || []);
            }
        } catch (err) {
            console.error("Error loading notifications:", err);
        }
    };

    const showToast = (message, type = 'success') => {
        setProfileToast({ show: true, message, type });
        setTimeout(() => setProfileToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const fetchServices = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/services');
            if (res.ok) {
                const data = await res.json();
                setServices(data || []);
            }
        } catch (err) {
            console.error("Error fetching services:", err);
        }
    };

    const loadFullProfile = async () => {
        if (!currentUser?.id) return;
        try {
            const { data } = await fetchUserProfile(currentUser.id);
            // Ensure specialization is an array
            const normalizedData = {
                ...data,
                specialization: Array.isArray(data.specialization) ? data.specialization : (data.specialization ? [data.specialization] : [])
            };
            setProfileData(normalizedData);
        } catch (err) {
            console.error("Error loading profile:", err);
            showToast("Failed to load profile", "error");
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsSavingProfile(true);
        try {
            const { data } = await updateUserProfile(currentUser.id, profileData);
            showToast("Profile updated successfully!");
            
            // Sync all fields back to main state and local storage
            const updatedUser = { 
                ...currentUser, 
                fullName: data.user.fullName, 
                email: data.user.email,
                phone: data.user.phone,
                address: data.user.address,
                specialization: data.user.specialization,
                experience: data.user.experience
            };
            
            // Sync updated fields back to mechanic-specific storage ONLY
            // Never write to the shared 'user' key to keep other sessions intact
            localStorage.setItem('mechanic_user', JSON.stringify(updatedUser));
            setCurrentUser(updatedUser);
            setProfileData(data.user);

            // Close the profile drawer after a short delay to acknowledge success
            setTimeout(() => {
                setIsProfileOpen(false);
            }, 500);
        } catch (err) {
            console.error("Save error:", err);
            showToast(err.message || "Failed to update profile", "error");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleToggleSpecialization = (spec) => {
        setProfileData(prev => {
            const current = prev.specialization || [];
            const updated = current.includes(spec)
                ? current.filter(s => s !== spec)
                : [...current, spec];
            return { ...prev, specialization: updated };
        });
    };

    const handleMarkRead = async (id) => {
        try {
            await markNotificationAsRead(id);
            setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error("Error marking read:", err);
        }
    };

    const fetchMechanicData = async (mechanicId, isPolling = false) => {
        if (!isPolling) setIsLoading(true);
        try {
            const { data } = await fetchMechanicRequests(mechanicId);
            setRequests(data || []);
        } catch (err) {
            console.error("Error fetching mechanic data:", err);
        } finally {
            if (!isPolling) setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (reqId, newStatus) => {
        if (!reqId) {
            window.alert("Please select a vehicle first");
            return;
        }
        setIsUpdating(true);
        try {
            await updateServiceStatus(reqId, { 
                status: newStatus,
                statusLabel: `Update: ${newStatus}`,
                description: `Mechanic updated service status to ${newStatus}`,
                // Pass bill form data if completing
                ...(newStatus === 'Completed' && {
                    serviceCharges: billForm.service,
                    partsCost: billForm.parts,
                    additionalCharges: billForm.additional
                })
            });
            await fetchMechanicData(currentUser.id);
            window.alert(`Status updated to ${newStatus}`);
            if (newStatus === 'Completed') setActiveSection('history');
        } catch (err) {
            console.error("Status update failed:", err);
            window.alert("Failed to update status");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSaveNotes = async () => {
        if (!selectedReqId) {
            window.alert("Please select a vehicle first");
            return;
        }
        try {
            await saveServiceNotes(selectedReqId, serviceNotes);
            window.alert("Notes saved successfully");
            await fetchMechanicData(currentUser.id);
        } catch (err) {
            window.alert("Failed to save notes");
        }
    };

    const handleGenerateInvoice = async () => {
        if (!selectedReqId) {
            window.alert("Please select a vehicle first");
            return;
        }
        if (window.confirm("This will complete the service and generate a final bill. Proceed?")) {
            await handleStatusUpdate(selectedReqId, 'Completed');
        }
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'ph-house-line' },
        { id: 'assigned', label: 'Assigned Requests', icon: 'ph-clipboard-text' },
        { id: 'status', label: 'Update Status', icon: 'ph-arrows-clockwise' },
        { id: 'notes', label: 'Service Notes', icon: 'ph-note-pencil' },
        { id: 'bill', label: 'Generate Bill', icon: 'ph-receipt' },
        { id: 'history', label: 'History', icon: 'ph-clock-counter-clockwise' }
    ];

    // Derived stats from live requests
    const stats = {
        assigned: requests.filter(r => r.status === 'Accepted' || r.status === 'Pending').length,
        inProgress: requests.filter(r => r.status === 'In Service').length,
        completed: requests.filter(r => r.status === 'Completed').length
    };

    // Filter requests for different sections
    const activeRequests = requests.filter(r => r.status !== 'Completed');
    const historyItems = requests.filter(r => r.status === 'Completed');

    const renderDashboard = () => (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="page-container">
            <div className="dashboard-page-header">
                <h1>Mechanic Dashboard</h1>
                <p>Welcome back, {currentUser?.fullName}. Manage your assigned service tasks below.</p>
            </div>

            {isLoading ? (
                <div className="text-center py-5">
                    <i className="ph-bold ph-spinner-gap spin" style={{ fontSize: '2rem', color: 'var(--accent-red)' }}></i>
                    <p className="mt-3">Loading your assignments...</p>
                </div>
            ) : (
                <div className="stats-grid">
                    <div className="glass-card stat-card-premium">
                        <div className="stat-icon"><i className="ph-bold ph-clipboard-text"></i></div>
                        <div className="stat-info">
                            <h3>{stats.assigned.toString().padStart(2, '0')}</h3>
                            <p>Assigned Requests</p>
                        </div>
                    </div>
                    <div className="glass-card stat-card-premium">
                        <div className="stat-icon"><i className="ph-bold ph-wrench"></i></div>
                        <div className="stat-info">
                            <h3>{stats.inProgress.toString().padStart(2, '0')}</h3>
                            <p>In Progress</p>
                        </div>
                    </div>
                    <div className="glass-card stat-card-premium">
                        <div className="stat-icon"><i className="ph-bold ph-check-circle"></i></div>
                        <div className="stat-info">
                            <h3>{stats.completed.toString().padStart(2, '0')}</h3>
                            <p>Completed</p>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );

    const renderAssignedRequests = () => (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-container">
            <div className="dashboard-page-header">
                <h1>Assigned Requests</h1>
                <p>Manage and track the vehicles currently assigned to you.</p>
            </div>
            
            {isLoading ? (
                <div className="text-center py-5">Fetching assignments...</div>
            ) : activeRequests.length === 0 ? (
                <div className="empty-state text-center py-5 glass-card">
                    <i className="ph-bold ph-info" style={{fontSize: '3rem', opacity: 0.5}}></i>
                    <h3>No Active Assignments</h3>
                    <p>Wait for New Jobs to be assigned by Admin.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {activeRequests.map(req => (
                        <div key={req._id} className="glass-card" style={{ padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                            <div>
                                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem' }}>{req.vehicleId?.name || 'Unknown Vehicle'}</h3>
                                <p style={{ margin: '0 0 5px 0', color: 'rgba(255,255,255,0.7)' }}><i className="ph-bold ph-user" style={{marginRight: '8px'}}></i>{req.customerId?.fullName || 'Customer'}</p>
                                <p style={{ margin: '0 0 5px 0', color: 'rgba(255,255,255,0.7)' }}><i className="ph-bold ph-calendar" style={{marginRight: '8px'}}></i>{req.appointmentDate}</p>
                                <p style={{ margin: '0 0 5px 0', color: 'rgba(255,255,255,0.7)' }}><i className="ph-bold ph-warning-circle" style={{marginRight: '8px'}}></i>Issue: {req.serviceType}</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'flex-end', minWidth: '150px' }}>
                                <span className={`status-badge-premium ${req.status.toLowerCase().replace(' ', '-')}`}>
                                    {req.status === 'Accepted' ? 'Assigned' : req.status}
                                </span>
                                <button className="action-btn-primary" onClick={() => { setSelectedReqId(req._id); setActiveSection('status'); }} style={{ width: '100%', padding: '10px 20px' }}>
                                    Update Job
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );

    const renderUpdateStatus = () => {
        const currentReq = requests.find(r => r._id === selectedReqId);
        
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-container profile-wrapper" style={{ minHeight: 'auto' }}>
                <div className="dashboard-page-header">
                    <h1>Update Status</h1>
                    <p>Modify the current repair stage of a vehicle.</p>
                </div>
                <div className="glass-panel profile-main-card">
                    <div className="form-group-p" style={{ marginBottom: '25px' }}>
                        <label>Select Active Job</label>
                        <select 
                            className="glass-input" 
                            style={{ WebkitAppearance: 'none', appearance: 'none' }}
                            value={selectedReqId}
                            onChange={(e) => setSelectedReqId(e.target.value)}
                        >
                            <option value="">Choose a vehicle...</option>
                            {activeRequests.map(req => (
                                <option key={req._id} value={req._id} style={{color: '#000'}}>{req.vehicleId?.name} - {req.customerId?.fullName}</option>
                            ))}
                        </select>
                    </div>
                    {selectedReqId && (
                        <>
                            <div className="form-group-p" style={{ marginBottom: '30px' }}>
                                <label>Repair Lifecycle Status</label>
                                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '10px' }}>
                                    <button 
                                        className={`action-btn-${currentReq?.status === 'Accepted' ? 'primary' : 'secondary'}`} 
                                        style={{ flex: 1 }}
                                        onClick={() => handleStatusUpdate(selectedReqId, 'Accepted')}
                                        disabled={isUpdating || currentReq?.status === 'In Service' || currentReq?.status === 'Completed'}
                                        title={currentReq?.status === 'In Service' ? "Cannot revert from In Progress" : ""}
                                    >Assigned</button>
                                    <button 
                                        className={`action-btn-${currentReq?.status === 'In Service' ? 'primary' : 'secondary'}`} 
                                        style={{ flex: 1 }}
                                        onClick={() => handleStatusUpdate(selectedReqId, 'In Service')}
                                        disabled={isUpdating || currentReq?.status === 'Completed'}
                                    >In Progress</button>
                                    <button 
                                        className={`action-btn-${currentReq?.status === 'Completed' ? 'primary' : 'secondary'}`} 
                                        style={{ flex: 1 }}
                                        onClick={() => {
                                            window.alert("Please generate a bill to complete this service.");
                                            setActiveSection('bill');
                                        }}
                                        disabled={isUpdating}
                                    >Mark Completed</button>
                                </div>
                            </div>
                            <div className="alert-info glass" style={{padding: '15px', borderRadius: '10px', fontSize: '0.9rem', opacity: 0.8, border: '1px solid rgba(255,255,255,0.1)'}}>
                                <i className="ph-bold ph-info" style={{marginRight: '10px'}}></i>
                                Updating to 'Completed' requires generating a final bill.
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        );
    };

    const renderServiceNotes = () => (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-container profile-wrapper" style={{ minHeight: 'auto' }}>
            <div className="dashboard-page-header">
                <h1>Service Notes</h1>
                <p>Document technical issues, repairs made, and recommendations.</p>
            </div>
            <div className="glass-panel profile-main-card">
                <div className="form-group-p" style={{ marginBottom: '25px' }}>
                    <label>Select Vehicle</label>
                    <select 
                        className="glass-input" 
                        style={{ WebkitAppearance: 'none', appearance: 'none' }}
                        value={selectedReqId}
                        onChange={(e) => {
                            setSelectedReqId(e.target.value);
                            const req = requests.find(r => r._id === e.target.value);
                            setServiceNotes(req?.notes || '');
                        }}
                    >
                        <option value="" disabled>Choose a vehicle...</option>
                        {activeRequests.map(req => (
                            <option key={req._id} value={req._id} style={{color: '#000'}}>{req.vehicleId?.name} - {req.customerId?.fullName}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group-p" style={{ marginBottom: '25px' }}>
                    <label>Mechanic Notes</label>
                    <textarea 
                        className="glass-input" 
                        rows="6" 
                        placeholder="Enter findings, substituted parts, and next steps..." 
                        style={{ resize: 'vertical' }}
                        value={serviceNotes}
                        onChange={(e) => setServiceNotes(e.target.value)}
                    ></textarea>
                </div>
                <div className="form-group-full form-actions" style={{ marginTop: 'auto' }}>
                    <button className="action-btn-primary" onClick={handleSaveNotes}><i className="ph-bold ph-floppy-disk"></i> Save Notes</button>
                </div>
            </div>
        </motion.div>
    );

    const renderGenerateBill = () => {
        const total = Number(billForm.service) + Number(billForm.parts) + Number(billForm.additional);
        
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-container profile-wrapper" style={{ minHeight: 'auto' }}>
                <div className="dashboard-page-header">
                    <h1>Generate Bill</h1>
                    <p>Create an invoice for completed repair services.</p>
                </div>
                <div className="glass-panel profile-main-card">
                    <div className="form-grid">
                        <div className="form-group-full">
                            <label className="text-secondary d-block mb-2" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>Select Vehicle</label>
                            <select 
                                className="glass-input" 
                                style={{ WebkitAppearance: 'none', appearance: 'none' }}
                                value={selectedReqId}
                                onChange={(e) => {
                                    const reqId = e.target.value;
                                    setSelectedReqId(reqId);
                                    
                                    // Auto-fill service charges based on request's serviceType
                                    const request = requests.find(r => r._id === reqId);
                                    if (request && services.length > 0) {
                                        const serviceInfo = services.find(s => s.name === request.serviceType);
                                        if (serviceInfo) {
                                            setBillForm(prev => ({ ...prev, service: serviceInfo.price }));
                                        }
                                    }
                                }}
                            >
                                <option value="">Choose a vehicle...</option>
                                {activeRequests.map(req => (
                                    <option key={req._id} value={req._id} style={{color: '#000'}}>{req.vehicleId?.name} - {req.customerId?.fullName}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="form-group-p">
                            <label>Service Charges (₹)</label>
                            <input type="number" className="glass-input" placeholder="e.g. 1500" value={billForm.service} onChange={(e) => setBillForm({ ...billForm, service: e.target.value })} />
                        </div>
                        <div className="form-group-p">
                            <label>Parts Cost (₹)</label>
                            <input type="number" className="glass-input" placeholder="e.g. 5000" value={billForm.parts} onChange={(e) => setBillForm({ ...billForm, parts: e.target.value })} />
                        </div>
                        <div className="form-group-full">
                            <label className="text-secondary d-block mb-2" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>Additional Charges (₹)</label>
                            <input type="number" className="glass-input" placeholder="e.g. 200" value={billForm.additional} onChange={(e) => setBillForm({ ...billForm, additional: e.target.value })} />
                        </div>
                        
                        <div className="form-group-full" style={{ padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', marginTop: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)' }}>Total Amount</h3>
                                <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--accent-red)' }}>₹{total.toLocaleString()}</h2>
                            </div>
                        </div>

                        <div className="form-group-full form-actions" style={{ marginTop: '20px' }}>
                            <button className="action-btn-primary hover-glow" style={{ width: '100%' }} onClick={handleGenerateInvoice}>
                                <i className="ph-bold ph-receipt"></i> Generate Invoice & Complete
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    const renderHistory = () => {
        if (selectedInvoiceReqId) {
            return (
                <div className="page-container" style={{ padding: '0 2rem' }}>
                    <InvoiceView requestId={selectedInvoiceReqId} onBack={() => setSelectedInvoiceReqId(null)} showDownload={false} />
                </div>
            );
        }

        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-container">
                <div className="dashboard-page-header">
                    <h1>Service History</h1>
                    <p>Log of all vehicles repaired and marked as completed.</p>
                </div>
                {historyItems.length === 0 ? (
                    <div className="empty-state text-center py-5 glass-card">
                        <p>No completed services in your history yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {historyItems.map(item => (
                            <div key={item._id} className="glass-card" style={{ padding: '20px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem' }}>{item.vehicleId?.name}</h3>
                                    <p style={{ margin: '0 0 5px 0', color: 'rgba(255,255,255,0.7)' }}><i className="ph-bold ph-user" style={{marginRight: '8px'}}></i>{item.customerId?.fullName}</p>
                                    <p style={{ margin: '0', color: 'rgba(255,255,255,0.7)' }}><i className="ph-bold ph-calendar-check" style={{marginRight: '8px'}}></i>{item.appointmentDate}</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <span style={{ padding: '6px 15px', background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.3)', fontWeight: '600' }}>
                                        <i className="ph-bold ph-check-circle" style={{marginRight: '5px'}}></i>Completed
                                    </span>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button className="action-btn-secondary" style={{ padding: '8px 15px', fontSize: '0.9rem' }} title="View Notes" onClick={() => { setSelectedReqId(item._id); setActiveSection('notes'); }}><i className="ph-bold ph-note"></i></button>
                                        <button className="action-btn-secondary" style={{ padding: '8px 15px', fontSize: '0.9rem' }} title="View Bill" onClick={() => setSelectedInvoiceReqId(item._id)}><i className="ph-bold ph-receipt"></i></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        );
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard': return renderDashboard();
            case 'assigned': return renderAssignedRequests();
            case 'status': return renderUpdateStatus();
            case 'notes': return renderServiceNotes();
            case 'bill': return renderGenerateBill();
            case 'history': return renderHistory();
            default: return renderDashboard();
        }
    };

    if (!currentUser || currentUser.role !== 'Mechanic') return null;

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
                        // Only remove this panel's session — do NOT touch admin_user or customer_user
                        localStorage.removeItem('mechanic_user');
                        localStorage.removeItem('mechanic_section');
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
                            Welcome back, {currentUser?.fullName?.split(' ')[0] || 'Mechanic'} 👋
                        </div>
                    </div>

                    <div className="header-right">
                        <div style={{ position: 'relative' }}>
                            <button className="header-icon-btn" title="Notifications" onClick={() => setShowNotifDropdown(!showNotifDropdown)}>
                                <i className="ph-bold ph-bell"></i>
                                {notifications.filter(n => !n.read).length > 0 && <span className="notif-badge"></span>}
                            </button>
                            
                            <AnimatePresence>
                                {showNotifDropdown && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="glass-card notification-dropdown"
                                        style={{ position: 'absolute', top: '100%', right: 0, width: '320px', zIndex: 1000, marginTop: '10px', padding: '15px' }}
                                    >
                                        <h4 style={{ margin: '0 0 15px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>Notifications</h4>
                                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                            {notifications.length === 0 ? (
                                                <p style={{ textAlign: 'center', opacity: 0.6, padding: '20px 0' }}>No notifications</p>
                                            ) : (
                                                notifications.map(n => (
                                                    <div key={n._id} className={`notif-item ${n.read ? 'read' : 'unread'}`} style={{ padding: '10px', borderRadius: '8px', marginBottom: '8px', background: n.read ? 'transparent' : 'rgba(255,0,0,0.1)', cursor: 'pointer' }} onClick={() => handleMarkRead(n._id)}>
                                                        <strong style={{ display: 'block', fontSize: '0.9rem' }}>{n.title}</strong>
                                                        <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', opacity: 0.8 }}>{n.message}</p>
                                                        <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{new Date(n.createdAt).toLocaleString()}</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <button 
                            className="header-icon-btn profile-trigger" 
                            title="My Profile" 
                            onClick={() => {
                                setIsProfileOpen(true);
                                loadFullProfile();
                            }}
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

                {/* Profile Drawer Component */}
                <AnimatePresence>
                    {isProfileOpen && (
                        <>
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="profile-drawer-overlay"
                                onClick={() => setIsProfileOpen(false)}
                            />
                            <motion.div 
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="profile-drawer-content glass-card"
                            >
                                <div className="drawer-header">
                                    <div className="drawer-header-left">
                                        <div className="drawer-avatar">
                                            {currentUser?.fullName?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="drawer-user-meta">
                                            <h3>{currentUser?.fullName}</h3>
                                            <span>Mechanic ID: #{currentUser?.id?.slice(-6).toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <button className="drawer-close-btn" onClick={() => setIsProfileOpen(false)}>
                                        <i className="ph-bold ph-x"></i>
                                    </button>
                                </div>

                                <div className="drawer-body">
                                    <AnimatePresence>
                                        {profileToast.show && (
                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`drawer-toast ${profileToast.type}`}>
                                                <i className={`ph-fill ${profileToast.type === 'success' ? 'ph-check-circle' : 'ph-warning-circle'}`}></i>
                                                {profileToast.message}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {!profileData ? (
                                        <div className="drawer-loading">
                                            <i className="ph-bold ph-spinner-gap ph-spin"></i>
                                            <p>Loading Profile...</p>
                                        </div>
                                    ) : (
                                        <form className="drawer-form" onSubmit={handleProfileUpdate}>
                                            <div className="drawer-section">
                                                <h4><i className="ph-bold ph-user"></i> Personal Information</h4>
                                                <div className="drawer-field">
                                                    <label>Full Name</label>
                                                    <input 
                                                        type="text" 
                                                        className="glass-input" 
                                                        value={profileData.fullName} 
                                                        onChange={e => setProfileData({...profileData, fullName: e.target.value})}
                                                        required
                                                    />
                                                </div>
                                                <div className="drawer-field">
                                                    <label>Email Address</label>
                                                    <input 
                                                        type="email" 
                                                        className="glass-input" 
                                                        value={profileData.email} 
                                                        disabled
                                                    />
                                                </div>
                                                <div className="drawer-field">
                                                    <label>Phone Number</label>
                                                    <input 
                                                        type="text" 
                                                        className="glass-input" 
                                                        value={profileData.phone} 
                                                        onChange={e => setProfileData({...profileData, phone: e.target.value})}
                                                        placeholder="+91 XXXXX XXXXX"
                                                    />
                                                </div>
                                                <div className="drawer-field">
                                                    <label>Address</label>
                                                    <textarea 
                                                        className="glass-input" 
                                                        value={profileData.address || ''} 
                                                        onChange={e => setProfileData({...profileData, address: e.target.value})}
                                                        placeholder="Residential address"
                                                        rows="2"
                                                    />
                                                </div>
                                            </div>

                                            <div className="drawer-section">
                                                <h4><i className="ph-bold ph-briefcase"></i> Professional Details</h4>
                                                <div className="drawer-field">
                                                    <label>Specializations (Select all that apply)</label>
                                                    <div className="specialization-tag-grid">
                                                        {SPECIALIZATION_OPTIONS.map(opt => {
                                                            const isSelected = profileData.specialization?.includes(opt);
                                                            return (
                                                                <button
                                                                    key={opt}
                                                                    type="button"
                                                                    className={`spec-tag ${isSelected ? 'selected' : ''}`}
                                                                    onClick={() => handleToggleSpecialization(opt)}
                                                                >
                                                                    {isSelected && <i className="ph-bold ph-check"></i>}
                                                                    {opt}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                                <div className="drawer-field">
                                                    <label>Experience (Years)</label>
                                                    <input 
                                                        type="text" 
                                                        className="glass-input" 
                                                        value={profileData.experience || ''} 
                                                        onChange={e => setProfileData({...profileData, experience: e.target.value})}
                                                        placeholder="e.g. 5"
                                                    />
                                                </div>
                                            </div>

                                            <div className="drawer-actions">
                                                <button type="submit" className="action-btn-primary" disabled={isSavingProfile}>
                                                    {isSavingProfile ? <i className="ph-bold ph-spinner-gap ph-spin"></i> : <i className="ph-bold ph-floppy-disk"></i>}
                                                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
                                                </button>
                                                <button type="button" className="drawer-logout-btn" onClick={() => setShowLogoutMessage(true)}>
                                                    <i className="ph-bold ph-sign-out"></i> Sign Out
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
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

            {/* Profile Toast Notification */}
            <AnimatePresence>
                {profileToast.show && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 20, x: '-50%' }}
                        className={`profile-toast-fixed ${profileToast.type}`}
                        style={{
                            position: 'fixed',
                            bottom: '30px',
                            left: '50%',
                            zIndex: 10000,
                            padding: '12px 24px',
                            borderRadius: '12px',
                            background: 'rgba(20, 20, 20, 0.9)',
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${profileToast.type === 'success' ? '#4caf50' : '#f44336'}`,
                            color: 'white',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '0.95rem',
                            fontWeight: '500'
                        }}
                    >
                        <i className={`ph-bold ${profileToast.type === 'success' ? 'ph-check-circle' : 'ph-warning-circle'}`} 
                           style={{ color: profileToast.type === 'success' ? '#4caf50' : '#f44336', fontSize: '1.2rem' }}>
                        </i>
                        {profileToast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MechanicDashboard;
