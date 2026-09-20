import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PieChart, Pie, XAxis, YAxis, CartesianGrid, 
    Tooltip as RechartsTooltip, ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import './AdminDashboard.css';
import InvoiceView from '../components/InvoiceView';

// --- STANDALONE MODAL COMPONENTS (Outside main function for performance) ---

const AssignMechanicModal = ({ isOpen, onClose, selectedRequest, mechanics, onAssign, mechanicSearch, setMechanicSearch }) => {
    if (!isOpen || !selectedRequest) return null;

    const filteredMechanics = (mechanics || []).filter(m => 
        (m.fullName || '').toLowerCase().includes(mechanicSearch.toLowerCase()) ||
        (m.specialization || []).some(s => (s || '').toLowerCase().includes(mechanicSearch.toLowerCase()))
    );

    return (
        <div className="admin-modal-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="assign-modal-content">
                <div className="modal-header">
                    <h3>Assign Mechanic</h3>
                    <button className="close-modal" onClick={onClose}><i className="ph-bold ph-x"></i></button>
                </div>
                <p className="modal-subtitle">Select a technician for {selectedRequest.serviceType}</p>
                
                <div className="modal-search mb-3">
                    <i className="ph-bold ph-magnifying-glass"></i>
                    <input 
                        type="text" 
                        placeholder="Search by name or skill..." 
                        value={mechanicSearch}
                        onChange={(e) => setMechanicSearch(e.target.value)}
                    />
                </div>

                {filteredMechanics.some(m => (m.activeJobsCount || 0) >= 3) && (
                    <div className="modal-warning-notice">
                        <i className="ph-bold ph-warning"></i>
                        <span>Technicians at maximum capacity (3 active jobs) cannot receive new assignments.</span>
                    </div>
                )}

                <div className="mechanic-selector-list">
                    {filteredMechanics.map(mech => {
                        const isBusy = (mech.activeJobsCount || 0) >= 3; 
                        const isOnline = true;
                        
                        return (
                            <div 
                                key={mech._id} 
                                className={`mech-select-card ${isBusy ? 'busy' : ''} ${!isOnline ? 'offline' : ''}`}
                                onClick={() => !isBusy && isOnline && onAssign(mech._id)}
                            >
                                <div className="mech-select-info">
                                    <div className="m-avatar-sm">{mech.fullName.charAt(0)}</div>
                                    <div className="m-details">
                                        <strong>{mech.fullName}</strong>
                                        <span>{mech.specialization?.[0] || 'Expert'} • {mech.experience || '5'} yrs exp</span>
                                        <span className={`active-jobs-badge ${isBusy ? 'limit-reached' : ''}`}>
                                            Active Jobs: {mech.activeJobsCount || 0}/3
                                        </span>
                                    </div>
                                </div>
                                <div className="mech-select-status">
                                    <span className={`status-dot ${isBusy ? 'busy' : isOnline ? 'online' : 'offline'}`}></span>
                                    <span>{isBusy ? 'At Capacity' : isOnline ? 'Available' : 'Offline'}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
};

const EditPriceModal = ({ isOpen, onClose, editingService, onSave }) => {
    const [localPrice, setLocalPrice] = useState('');

    useEffect(() => {
        if (editingService) setLocalPrice(editingService.price);
    }, [editingService]);

    if (!isOpen || !editingService) return null;

    return (
        <div className="admin-modal-overlay">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="assign-modal-content">
                <div className="modal-header">
                    <h3>Update Service Price</h3>
                    <button className="close-modal" onClick={onClose}><i className="ph-bold ph-x"></i></button>
                </div>
                <div className="p-4">
                    <div className="editing-service-preview mb-4">
                        <div className="p-card-icon mb-2"><i className={`ph-bold ${editingService.icon}`}></i></div>
                        <h4>{editingService.name}</h4>
                        <p className="text-muted">Current: ₹{editingService.price.toLocaleString()}</p>
                    </div>
                    
                    <div className="input-group-modern mb-4">
                        <label>New Price (₹)</label>
                        <input 
                            type="number" 
                            placeholder="Enter new price..." 
                            value={localPrice}
                            onChange={(e) => setLocalPrice(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <button className="btn-primary-glow w-100" onClick={() => onSave(editingService._id, localPrice)}>
                        Save Price Changes
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const AdminDashboard = () => {
    const [activeSection, setActiveSectionState] = useState(() => localStorage.getItem('admin_section') || 'dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [liveStats, setLiveStats] = useState({
        revenue: 12450000,
        requests: 42,
        customers: 1248
    });
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [data, setData] = useState({ customers: [], mechanics: [], requests: [] });
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [toast, setToast] = useState(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [mechanicSearch, setMechanicSearch] = useState('');
    const [activeRequestTab, setActiveRequestTab] = useState('all');
    const [requestSearch, setRequestSearch] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [services, setServices] = useState([]);
    const [invoices, setInvoices] = useState([]); // New state for real records
    const [messages, setMessages] = useState([]); // Contact Us Messages
    const [selectedInvoiceId, setSelectedInvoiceId] = useState(null); // Added for Invoice View
    const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [adminUser, setAdminUser] = useState(() => {
        const userStr = localStorage.getItem('admin_user');
        return userStr ? JSON.parse(userStr) : null;
    });
    const [isSearching, setIsSearching] = useState(false);
    const navigate = useNavigate();

    const setActiveSection = (section) => {
        localStorage.setItem('admin_section', section);
        setActiveSectionState(section);
    };

    useEffect(() => {
        // --- Auth Setup: Read role-specific key to prevent data cross-contamination ---
        const userStr = localStorage.getItem('admin_user');
        if (!userStr) {
            navigate('/admin-login');
            return;
        }
        const user = JSON.parse(userStr);

        // Role guard: only Admin can access this panel
        if (user.role && user.role !== 'Admin') {
            navigate('/admin-login');
            return;
        }

        setAdminUser(user);
        // Keep role-specific key in sync
        localStorage.setItem('admin_user', JSON.stringify(user));
        fetchAdminData();
        loadAdminNotifications(user.id || user._id);
    }, [navigate]);

    const loadAdminNotifications = async (userId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/notifications/${userId}`);
            if (res.ok) {
                const data = await res.json();
                setNotifications(data || []);
            }
        } catch (err) {
            console.error("Error fetching admin notifications:", err);
        }
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const fetchAdminData = async () => {
        setIsLoading(true);
        try {
            const [userRes, reqRes, invRes, msgRes] = await Promise.allSettled([
                fetch('http://localhost:5000/api/admin/users'),
                fetch('http://localhost:5000/api/admin/service-requests'),
                fetch('http://localhost:5000/api/admin/invoices'),
                fetch('http://localhost:5000/api/messages')
            ]);

            let userData = { customers: [], mechanics: [] };
            let requestsData = [];
            let invoicesData = [];

            if (userRes.status === 'fulfilled' && userRes.value.ok) {
                userData = await userRes.value.json();
            }

            if (reqRes.status === 'fulfilled' && reqRes.value.ok) {
                requestsData = await reqRes.value.json();
            }

            if (invRes.status === 'fulfilled' && invRes.value.ok) {
                invoicesData = await invRes.value.json();
            }

            if (msgRes && msgRes.status === 'fulfilled' && msgRes.value.ok) {
                const msgs = await msgRes.value.json();
                setMessages(msgs || []);
            }

            setData({
                customers: userData.customers || [],
                mechanics: userData.mechanics || [],
                requests: requestsData || []
            });
            setInvoices(invoicesData || []);
            
            // Fetch Services
            await fetchServices();
        } catch (error) {
            console.error('Critical failure in admin data sync:', error);
            showToast('Failed to sync with database');
        } finally {
            setIsLoading(false);
        }
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

    const handleAssignMechanic = async (mechanicId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/service-requests/${selectedRequest._id}/assign`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mechanicId })
            });

            if (response.ok) {
                showToast('Mechanic assigned successfully');
                setIsAssignModalOpen(false);
                setSelectedRequest(null);
                fetchAdminData();
            } else {
                const errData = await response.json().catch(() => ({}));
                showToast(errData.message || 'Failed to assign mechanic');
            }
        } catch (err) {
            showToast('Error connecting to server');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;
        
        try {
            const response = await fetch(`http://localhost:5000/api/admin/user/${userId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                showToast('User deleted successfully');
                fetchAdminData();
                if (selectedDetail?.data?._id === userId) setSelectedDetail(null);
            } else {
                showToast('Failed to delete user');
            }
        } catch (err) {
            showToast('Error connecting to server');
        }
    };

    const handleUpdateUser = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/user/${selectedDetail.data._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData)
            });

            if (response.ok) {
                showToast('Profile updated successfully');
                setIsEditing(false);
                setSelectedDetail(null);
                fetchAdminData();
            } else {
                showToast('Failed to update profile');
            }
        } catch (err) {
            showToast('Error saving changes');
        }
    };

    const handleUpdatePrice = async (serviceId, priceToUpdate) => {
        if (!priceToUpdate || isNaN(priceToUpdate)) {
            showToast('Please enter a valid price');
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:5000/api/admin/services/${serviceId}/price`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ price: priceToUpdate })
            });

            if (response.ok) {
                const updated = await response.json();
                
                // Optimistic Local Update to avoid re-fetch lag
                setServices(prev => prev.map(s => s._id === updated._id ? updated : s));
                
                showToast(`Price updated`);
                setIsPriceModalOpen(false);
                setEditingService(null);
            } else {
                showToast('Failed to update price');
            }
        } catch (err) {
            showToast('Error saving changes');
        }
    };

    // Simulated Live Updates
    useEffect(() => {
        const interval = setInterval(() => {
            setLiveStats(prev => ({
                ...prev,
                revenue: prev.revenue + Math.floor(Math.random() * 500),
                requests: prev.requests + (Math.random() > 0.8 ? 1 : 0)
            }));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'ph-squares-four' },
        { id: 'customers', label: 'Customers', icon: 'ph-users' },
        { id: 'mechanics', label: 'Mechanics', icon: 'ph-user-gear' },
        { id: 'requests', label: 'Service Requests', icon: 'ph-activity' },
        { id: 'pricing', label: 'Service Pricing', icon: 'ph-tag' },
        { id: 'records', label: 'Service Records', icon: 'ph-archive' },
        { id: 'reviews', label: 'Reviews', icon: 'ph-star' },
        { id: 'messages', label: 'Messages', icon: 'ph-envelope-simple' },
    ];

    // Mock Data for UI
    const revenueData = [
        { name: 'Mon', revenue: 45000, target: 40000 }, { name: 'Tue', revenue: 52000, target: 40000 },
        { name: 'Wed', revenue: 48000, target: 40000 }, { name: 'Thu', revenue: 61000, target: 40000 },
        { name: 'Fri', revenue: 55000, target: 40000 }, { name: 'Sat', revenue: 67000, target: 40000 },
        { name: 'Sun', revenue: 42000, target: 40000 },
    ];

    const neonPalette = ['#007aff', '#af52de', '#00c7be', '#ffcc00', '#ff3b30', '#5856d6', '#ff2d55', '#5ac8fa'];

    const serviceDistribution = useMemo(() => {
        if (!services.length) return [];

        return services.map(s => {
            const count = data.requests.filter(r => r.serviceType === s.name).length;
            return { name: s.name, value: count || 0 };
        });
    }, [services, data.requests]);

    const COLORS = neonPalette; 

    const activityTimeline = useMemo(() => {
        const getIconForStatus = (status) => {
            switch (status) {
                case 'Pending': return 'ph-plus-circle';
                case 'Accepted': return 'ph-user-plus';
                case 'In Service': return 'ph-wrench';
                case 'Completed': return 'ph-check-circle';
                default: return 'ph-activity';
            }
        };

        const getStatusAction = (status) => {
            switch (status) {
                case 'Pending': return 'New Service Request';
                case 'Accepted': return 'Mechanic Assigned';
                case 'In Service': return 'Service Started';
                case 'Completed': return 'Service Finalized';
                default: return 'Status Update';
            }
        };

        const timeAgo = (dateStr) => {
            const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
            let interval = seconds / 31536000;
            if (interval > 1) return Math.floor(interval) + "y ago";
            interval = seconds / 2592000;
            if (interval > 1) return Math.floor(interval) + "mo ago";
            interval = seconds / 86400;
            if (interval > 1) return Math.floor(interval) + "d ago";
            interval = seconds / 3600;
            if (interval > 1) return Math.floor(interval) + "h ago";
            interval = seconds / 60;
            if (interval > 1) return Math.floor(interval) + "m ago";
            return Math.floor(seconds) + "s ago";
        };

        return data.requests
            .slice(0, 5) // Show top 5 recent activities
            .map(r => ({
                user: r.customerId?.fullName || 'Unknown',
                act: getStatusAction(r.status),
                role: r.status === 'Accepted' ? 'Mechanic' : 'Customer',
                time: timeAgo(r.createdAt),
                icon: getIconForStatus(r.status)
            }));
    }, [data.requests]);
    
    const filteredResults = useMemo(() => {
        if (!searchQuery.trim()) return { mechanics: [], customers: [], requests: [], navigation: [] };
        const q = searchQuery.toLowerCase();
        
        // Navigation Quick Links
        const sections = [
            { id: 'mechanics', label: 'Mechanics / Staff Members', icon: 'ph-user-gear' },
            { id: 'customers', label: 'Customers / User List', icon: 'ph-users' },
            { id: 'requests', label: 'Service Requests', icon: 'ph-activity' },
            { id: 'pricing', label: 'Service Pricing', icon: 'ph-tag' },
            { id: 'records', label: 'Service Records / Invoices', icon: 'ph-archive' },
            { id: 'reviews', label: 'System Reviews', icon: 'ph-star' }
        ];

        return {
            navigation: sections.filter(s => s.label.toLowerCase().includes(q) || s.id.includes(q)),
            mechanics: (data.mechanics || []).filter(m => 
                m.fullName?.toLowerCase().includes(q) || 
                m.email?.toLowerCase().includes(q) ||
                (m.specialization || []).some(s => s?.toLowerCase().includes(q))
            ).slice(0, 5),
            customers: (data.customers || []).filter(c => 
                c.fullName?.toLowerCase().includes(q) || 
                c.email?.toLowerCase().includes(q) ||
                c.phone?.includes(q)
            ).slice(0, 5),
            requests: (data.requests || []).filter(r => 
                r.serviceType?.toLowerCase().includes(q) ||
                r.status?.toLowerCase().includes(q) ||
                r.customerId?.fullName?.toLowerCase().includes(q) ||
                r.mechanicId?.fullName?.toLowerCase().includes(q)
            ).slice(0, 5)
        };
    }, [searchQuery, data]);

    useEffect(() => {
        if (searchQuery) {
            setIsSearching(true);
            const timer = setTimeout(() => setIsSearching(false), 600);
            return () => clearTimeout(timer);
        } else {
            setIsSearching(false);
        }
    }, [searchQuery]);

    // --- Render Functions for Sections ---

    const renderDashboard = () => (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="admin-content-section">
            {/* Row 1: Standardized Stats Grid (4 Cards) */}
            <div className="admin-stats-grid-4 mb-5">
                {[
                    { label: 'Total Customers', value: liveStats.customers.toLocaleString(), trend: '+12%', up: true, icon: 'ph-users' },
                    { label: 'Total Mechanics', value: '84', trend: '+2', up: true, icon: 'ph-user-gear' },
                    { label: 'Active Requests', value: liveStats.requests, trend: '+3', up: true, icon: 'ph-activity' },
                    { label: 'Completed Services', value: '15.6k', trend: '+5.2%', up: true, icon: 'ph-check-circle' },
                ].map((stat, i) => (
                    <div key={i} className="admin-glass-card admin-stat-card-compact" onClick={() => setActiveSection(stat.label.toLowerCase().includes('request') ? 'requests' : stat.label.toLowerCase().includes('customer') ? 'customers' : 'dashboard')}>
                        <div className="stat-card-inner">
                            <div className="stat-icon-row">
                                <i className={`ph-bold ${stat.icon}`}></i>
                                <span className={`trend-badge-compact ${stat.up ? 'trend-up' : 'trend-down'}`}>
                                    {stat.up ? '↑' : '↓'} {stat.trend}
                                </span>
                            </div>
                            <div className="stat-value-compact">
                                <motion.span animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 0.3 }}>
                                    {stat.value}
                                </motion.span>
                            </div>
                            <div className="stat-label-compact">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Revenue card removed as requested */}


            {/* Row 4: Performance Charts */}
            <div className="admin-charts-grid">
                <div className="admin-glass-card chart-full-width">
                    <div className="chart-header">
                        <h3>Weekly Revenue Performance</h3>
                        <div className="navbar-icon-btn"><i className="ph-bold ph-dots-three-outline"></i></div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={revenueData}>
                            <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ff3b30" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#ff3b30" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#555555" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis hide />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="revenue" stroke="#ff3b30" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="admin-glass-card">
                    <div className="chart-header">
                        <h3>Service Distribution</h3>
                        <i className="ph-bold ph-chart-pie" style={{ color: '#af52de', fontSize: '1.2rem' }}></i>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie 
                                data={serviceDistribution} 
                                dataKey="value" 
                                innerRadius={60} 
                                outerRadius={80} 
                                paddingAngle={5} 
                                stroke="none"
                                animationBegin={200}
                                label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                                labelLine={false}
                            >
                                {serviceDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip 
                                contentStyle={{ backgroundColor: '#112240', border: 'none', borderRadius: '12px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="admin-glass-card">
                    <div className="chart-header">
                        <h3>System Activity Timeline</h3>
                    </div>
                    <div className="recent-activity-list">
                        {activityTimeline.length > 0 ? activityTimeline.map((item, i) => (
                            <div key={i} className="activity-item">
                                <div className="activity-icon-sm"><i className={`ph-bold ${item.icon}`}></i></div>
                                <div className="activity-info">
                                    <strong>{item.user}</strong>
                                    <span>{item.act}</span>
                                </div>
                                <div className="activity-meta">
                                    <span className="time-text">{item.time}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="p-4 text-center text-muted">No recent activity</div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const renderCustomers = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-content-section">
            <div className="section-header-row mb-4">
                <h2>Manage Customers</h2>
                <div className="header-actions">
                   <div className="search-box-glass">
                       <i className="ph-bold ph-magnifying-glass"></i>
                       <input type="text" placeholder="Search customers..." />
                   </div>
                </div>
            </div>
            <div className="admin-glass-card no-padding">
                <table className="admin-data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Contact</th>
                            <th>Vehicles</th>
                            <th>Total Services</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(data.customers || []).map((u, i) => (
                            <tr key={u._id || i} onClick={() => { setSelectedDetail({ type: 'customer', data: u }); setIsEditing(false); setEditData(u); }}>
                                <td className="col-name">
                                    <div className="user-table-cell">
                                        <div className="user-details">
                                            <strong className="user-name-bold">{u.fullName || 'Unknown'}</strong>
                                            <span className="user-email-muted">{u.email || 'No Email'}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="col-contact text-muted">{u.phone || 'N/A'}</td>
                                <td className="col-vehicles">{u.vehiclesCount || 0} Vehicles</td>
                                <td className="col-services">{u.servicesCount || 0} Jobs</td>
                                <td className="col-status">
                                    <div className="badge-center-wrapper">
                                        <span className={`status-tag active`}>Active</span>
                                    </div>
                                </td>
                                <td className="col-actions">
                                    <div className="action-row-centered">
                                        <button className="icon-btn-sm" onClick={(e) => { e.stopPropagation(); setSelectedDetail({ type: 'customer', data: u }); setIsEditing(true); setEditData(u); }}><i className="ph-bold ph-pencil-simple"></i></button>
                                        <button className="icon-btn-sm danger" onClick={(e) => { e.stopPropagation(); handleDeleteUser(u._id); }}><i className="ph-bold ph-trash"></i></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );

    const renderMechanics = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-content-section">
            <div className="section-header-row mb-4">
                <h2>Staff Members</h2>
            </div>
            <div className="admin-glass-card no-padding">
                <table className="admin-data-table mechanic-data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Contact</th>
                            <th>Skills</th>
                            <th>Experience</th>
                            <th>Availability</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(data.mechanics || []).map((m, i) => (
                            <tr key={m._id || i} onClick={() => { setSelectedDetail({ type: 'mechanic', data: m }); setIsEditing(false); setEditData(m); }}>
                                <td className="col-name">
                                    <div className="user-table-cell">
                                        <div className="avatar-sm"> {(m.fullName || '?').charAt(0)} </div>
                                        <div className="user-details">
                                            <strong className="user-name-bold">{m.fullName || 'Mechanic'}</strong>
                                            <span className="user-email-muted">{m.email || 'N/A'}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="col-contact text-muted">{m.phone || 'N/A'}</td>
                                <td className="col-skills">
                                    <div className="skills-inline-list">
                                        {Array.isArray(m.specialization) ? (
                                            m.specialization.length > 0 ? (
                                                m.specialization.map((spec, idx) => (
                                                    <span key={idx} className="skill-pill-sm">{spec}</span>
                                                ))
                                            ) : (
                                                <span className="skill-pill-sm">General</span>
                                            )
                                        ) : (
                                            <span className="skill-pill-sm">{m.specialization || 'General'}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="col-exp">{m.experience || '0'} Years</td>
                                <td className="col-avail">
                                    <div className="badge-center-wrapper">
                                        {(m.activeJobsCount || 0) >= 3 ? (
                                            <span className="avail-badge busy">At Capacity ({m.activeJobsCount}/3)</span>
                                        ) : (
                                            <span className="avail-badge online">Available ({m.activeJobsCount || 0}/3)</span>
                                        )}
                                    </div>
                                </td>
                                <td className="col-status">
                                    <div className="badge-center-wrapper">
                                        <span className="status-tag active">Active</span>
                                    </div>
                                </td>
                                <td className="col-actions">
                                    <div className="action-row-centered">
                                        <button className="icon-btn-sm" onClick={(e) => { e.stopPropagation(); setSelectedDetail({ type: 'mechanic', data: m }); setIsEditing(true); setEditData(m); }}><i className="ph-bold ph-pencil-simple"></i></button>
                                        <button className="icon-btn-sm danger" onClick={(e) => { e.stopPropagation(); handleDeleteUser(m._id); }}><i className="ph-bold ph-trash"></i></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );

    const renderRequests = () => {
        const filteredRequests = (data.requests || []).filter(r => 
            activeRequestTab === 'all' || (r.status || '').toLowerCase() === activeRequestTab.toLowerCase()
        ).filter(r => 
            (r.serviceType || '').toLowerCase().includes(requestSearch.toLowerCase()) ||
            (r.customerId?.fullName || '').toLowerCase().includes(requestSearch.toLowerCase()) ||
            (r._id || '').includes(requestSearch)
        );

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-content-section">
                <div className="section-header-row mb-4">
                    <h2>Service Monitoring Board</h2>
                    <div className="request-controls">
                        <div className="search-box-glass sm">
                            <i className="ph-bold ph-magnifying-glass"></i>
                            <input type="text" placeholder="Search ID or Name..." value={requestSearch} onChange={(e) => setRequestSearch(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="request-tabs mb-4">
                    {['all', 'pending', 'accepted', 'in service', 'completed'].map(tab => (
                        <button 
                            key={tab} 
                            className={`tab-pill ${activeRequestTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveRequestTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="service-requests-grid">
                    {filteredRequests.length > 0 ? filteredRequests.map((req) => (
                        <motion.div key={req._id} layout className="service-card-glass">
                            <div className="s-card-header">
                                <span className="s-type">{req.serviceType || 'Unknown Service'}</span>
                                <span className={`status-badge-modern ${(req.status || 'Pending').toLowerCase().replace(' ', '-')}`}>
                                    {req.status === 'Accepted' ? 'Assigned' : req.status === 'In Service' ? 'In Progress' : (req.status || 'Pending')}
                                </span>
                            </div>
                            <div className="s-card-body">
                                <div className="s-info-group">
                                    <label><i className="ph-bold ph-user"></i> Customer</label>
                                    <div className="s-val">
                                        <strong>{req.customerId?.fullName}</strong>
                                        <span>{req.customerId?.phone}</span>
                                    </div>
                                </div>
                                <div className="s-info-group">
                                    <label><i className="ph-bold ph-car"></i> Vehicle</label>
                                    <div className="s-val">{req.vehicleId?.brand} {req.vehicleId?.model} ({req.vehicleId?.plate})</div>
                                </div>
                                <div className="s-info-group">
                                    <label><i className="ph-bold ph-warning-circle"></i> Issue</label>
                                    <p className="s-desc">{req.issueDescription}</p>
                                </div>
                                <div className="s-time-row">
                                    <span><i className="ph-bold ph-calendar"></i> {req.appointmentDate}</span>
                                    <span><i className="ph-bold ph-clock"></i> {req.appointmentTime}</span>
                                </div>
                            </div>
                            <div className="s-card-footer">
                                <div className="s-id-meta">
                                    <span className="s-id">ID: #{(req._id || '').slice(-6).toUpperCase()}</span>
                                    <span className="s-date">{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'New'}</span>
                                </div>
                                {req.status === 'Pending' ? (
                                    <button className="btn-assign-action" onClick={() => { setSelectedRequest(req); setIsAssignModalOpen(true); }}>
                                        Assign Mechanic
                                    </button>
                                ) : (
                                    <div className="assigned-mech-info">
                                        <i className="ph-bold ph-wrench"></i>
                                        <span>{req.mechanicId?.fullName || 'Assigned'}</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )) : (
                        <div className="no-requests-placeholder">
                            <i className="ph-bold ph-clipboard-text"></i>
                            <p>No service requests found in this category.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };

    const renderPricing = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-content-section">
             <div className="section-header-row mb-4">
                <h2>Service Inventory & Pricing</h2>
            </div>
            <div className="pricing-cards-grid">
                {services.map((s, i) => (
                    <div key={s._id || i} className="admin-glass-card price-card">
                        <div className="p-card-icon"><i className={`ph-bold ${s.icon}`}></i></div>
                        <h3>{s.name}</h3>
                        <p>{s.itemsCount} check-points included</p>
                        <div className="p-card-footer">
                            <span className="price-tag">₹{s.price.toLocaleString()}</span>
                            <button 
                                className="edit-btn" 
                                onClick={() => {
                                    setEditingService(s);
                                    setIsPriceModalOpen(true);
                                }}
                            >
                                <i className="ph-bold ph-pencil"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );

    const renderRecords = () => {
        if (selectedInvoiceId) {
            return (
                <div style={{ padding: '0 2rem' }}>
                     <InvoiceView invoiceId={selectedInvoiceId} onBack={() => setSelectedInvoiceId(null)} />
                </div>
            );
        }

        const paidInvoices = invoices.filter(inv => inv.status === 'Paid');

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-content-section">
                <div className="section-header-row mb-4">
                    <h2>System Service Records</h2>
                    <span className="text-muted">{paidInvoices.length} total records</span>
                </div>
                <div className="records-timeline">
                    {paidInvoices.length > 0 ? paidInvoices.map((inv, i) => (
                        <div key={inv._id || i} className="admin-glass-card record-row">
                            <div className="record-date">
                                {new Date(inv.generatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className="record-main-info">
                                <div className="record-ids">
                                    <strong>INV-{(inv._id || '').slice(-6).toUpperCase()}</strong>
                                    <span>
                                        {inv.requestId?.vehicleId?.brand} {inv.requestId?.vehicleId?.model} 
                                        (Owner: {inv.customerId?.fullName || 'Unknown'})
                                    </span>
                                </div>
                                <div className="record-meta">
                                    <span>Mechanic: {inv.requestId?.mechanicId?.fullName || 'N/A'}</span>
                                    <strong className="success-text">₹{(inv.amount || 0).toLocaleString()}</strong>
                                </div>
                            </div>
                            <button className="view-log-btn" onClick={() => setSelectedInvoiceId(inv._id)}>
                                View Logs
                            </button>
                        </div>
                    )) : (
                        <div className="no-requests-placeholder">
                            <i className="ph-bold ph-archive"></i>
                            <p>No paid service records found yet.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };





    const renderReviews = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-content-section">
             <div className="section-header-row mb-4">
                <h2>Customer Feedback Portfolio</h2>
            </div>
            <div className="reviews-masonry">
                {[
                    { name: 'Rahul Mehta', role: 'Sedan Owner', city: 'Ahmedabad', rating: 4, text: '"The transparency is unmatched. I could track my car alignment live. Professional and trustworthy service every time!"' },
                    { name: 'Priya Sharma', role: 'Hatchback Owner', city: 'Mumbai', rating: 5, text: '"Excellent doorstep pickup and drop. The cost estimator was spot on. Highly recommend for any hatchback owner looking for quality."' },
                    { name: 'Arjun Patel', role: 'SUV Owner', city: 'Vadodara', rating: 3.5, text: '"Best SUV service center in town. The team is certified and the turnaround time was faster than expected. Very satisfied!"' },
                    { name: 'Kunal Shah', role: 'Sedan Owner', city: 'Ahmedabad', rating: 4.5, text: '"Overall service was very good and timely. Pickup was smooth, just a small delay in status updates, but everything else was perfect."' },
                    { name: 'Neha Desai', role: 'Luxury Car Owner', city: 'Ahmedabad', rating: 3.9, text: '"Impressed with the professionalism and quality of work. My car felt like new after servicing. Definitely using this again."' }
                ].map((rev, i) => (
                    <div key={i} className="admin-glass-card review-card">
                        <div className="rev-header">
                            <div className="r-stars"> 
                                {[1, 2, 3, 4, 5].map((star) => {
                                    if (rev.rating >= star) return <i key={star} className="ph-fill ph-star"></i>;
                                    if (rev.rating > star - 1) return <i key={star} className="ph-fill ph-star-half"></i>;
                                    return <i key={star} className="ph-bold ph-star text-muted"></i>;
                                })}
                            </div>
                            <span className="rev-from">by {rev.name}</span>
                        </div>
                        <p>{rev.text}</p>
                        <div className="rev-footer">
                            <span>{rev.role} | <strong>{rev.city}</strong></span>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );



    const handleDeleteMessage = async (msgId) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/messages/${msgId}`, { method: 'DELETE' });
            if (res.ok) {
                setMessages(prev => prev.filter(m => m._id !== msgId));
                showToast('Message deleted');
            }
        } catch (err) {
            showToast('Error deleting message');
        }
    };

    const renderMessages = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="admin-content-section">
            <div className="section-header-row mb-4">
                <h2>Contact Form Messages</h2>
            </div>
            <div className="admin-glass-card no-padding">
                <table className="admin-data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Message</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {messages.map(m => (
                            <tr key={m._id}>
                                <td className="col-name"><strong className="user-name-bold">{m.name}</strong></td>
                                <td className="col-contact text-muted">{m.email}</td>
                                <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={m.message}>{m.message}</td>
                                <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                                <td className="col-actions">
                                    <div className="action-row-centered">
                                        <button className="icon-btn-sm danger" onClick={(e) => { e.stopPropagation(); handleDeleteMessage(m._id); }}>
                                            <i className="ph-bold ph-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {messages.length === 0 && (
                            <tr><td colSpan="5" className="text-center p-4">No messages found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );

    const renderActiveSection = () => {
        switch (activeSection) {
            case 'dashboard': return renderDashboard();
            case 'messages': return renderMessages();
            case 'customers': return renderCustomers();
            case 'mechanics': return renderMechanics();
            case 'requests': return renderRequests();
            case 'pricing': return renderPricing();
            case 'records': return renderRecords();
            case 'reviews': return renderReviews();
            case 'profile': return renderProfile();
            default: return renderDashboard();
        }
    }

    const renderProfile = () => (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="admin-content-section p-0">
            <div className="admin-profile-container">
                {/* 1. Top Profile Section - Horizontal Layout */}
                <div className="profile-hero-card admin-glass-card">
                    <div className="profile-hero-main">
                        {/* Left: Avatar + Identity */}
                        <div className="profile-identity-section">
                            <div className="profile-avatar-large">
                                S
                                <div className="online-indicator"></div>
                            </div>
                            <div className="profile-text-info">
                                <h1 className="profile-name-bold">Sneha Parmar</h1>
                                <div className="profile-identity-meta">
                                    <span className="role-badge-premium">Super Admin</span>
                                    <span className="profile-email-lighter"><i className="ph-bold ph-envelope"></i> vehiclecare2354@gmail.com</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Small Stats */}
                        <div className="profile-hero-stats">
                            <div className="p-stat"><strong>{data.customers.length.toLocaleString()}</strong><span>Active Users</span></div>
                            <div className="p-stat"><strong>{data.mechanics.length.toLocaleString()}</strong><span>Team Members</span></div>
                            <div className="p-stat"><strong>{data.requests.length.toLocaleString()}</strong><span>Total Jobs</span></div>
                        </div>
                    </div>
                </div>

                {/* Grid for Details */}
                <div className="profile-details-grid">
                    {/* 3. Security Section */}
                    <div className="admin-glass-card info-card">
                        <div className="card-header-simple">
                            <h3><i className="ph-bold ph-shield-check"></i> Security & Access</h3>
                        </div>
                        <div className="info-rows-container">
                            <div className="info-row-item">
                                <span className="row-label">Account Status</span>
                                <span className="status-tag verified">Verified</span>
                            </div>
                            <div className="info-row-item">
                                <span className="row-label">Two-Factor Auth</span>
                                <span className="status-tag disabled">Disabled</span>
                            </div>
                            <div className="info-row-item">
                                <span className="row-label">Last Login</span>
                                <span className="row-value">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                        </div>
                        <div className="card-footer-action">
                            <button className="btn-admin-primary-sm">
                                <i className="ph-bold ph-lock-key"></i> Change Password
                            </button>
                        </div>
                    </div>

                    {/* 4. System Information */}
                    <div className="admin-glass-card info-card">
                        <div className="card-header-simple">
                            <h3><i className="ph-bold ph-info"></i> System Information</h3>
                        </div>
                        <div className="info-rows-container">
                            <div className="info-row-item">
                                <span className="row-label">System Version</span>
                                <span className="row-value-bold">v2.4.0-pro</span>
                            </div>
                            <div className="info-row-item">
                                <span className="row-label">Database Connection</span>
                                <span className="row-value-bold text-success">Connected</span>
                            </div>
                            <div className="info-row-item">
                                <span className="row-label">Deployment</span>
                                <span className="row-value-bold">Production</span>
                            </div>
                            <div className="info-row-item">
                                <span className="row-label">Server Status</span>
                                <span className="row-value-bold">Operational</span>
                            </div>
                        </div>
                        <div className="card-footer-action">
                            <button className="btn-admin-secondary-sm">
                                <i className="ph-bold ph-notebook"></i> View Logs
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="admin-chart-tooltip">
                    <p>{`₹${payload[0].value.toLocaleString()}`}</p>
                </div>
            );
        }
        return null;
    };

    if (!adminUser || adminUser.role !== 'Admin') return null;

    return (
        <div className="admin-panel-container">
            {/* Cinematic Background */}
            <video autoPlay muted loop playsInline className="admin-video-background">
                <source src="/Car_Video_2.mp4" type="video/mp4" />
            </video>
            <div className="admin-overlay"></div>

            <div className="admin-layout-wrapper">
                {/* Sidebar */}
                <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                    <div className="sidebar-logo-section">
                        <img src="/logo.png" alt="Logo" className="sidebar-logo-img" />
                        <span className="sidebar-logo-title">VEHICLE CARE</span>
                    </div>

                    <nav className="admin-nav">
                        {menuItems.map(item => (
                            <button
                                key={item.id}
                                className={`admin-nav-item ${activeSection === item.id ? 'active' : ''}`}
                                onClick={() => setActiveSection(item.id)}
                            >
                                <i className={`ph-bold ${item.icon}`}></i>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="admin-sidebar-footer">
                        <button className="admin-logout-btn" onClick={() => {
                            // Only remove this panel's session — do NOT touch mechanic_user or customer_user
                            localStorage.removeItem('admin_user');
                            localStorage.removeItem('admin_section');
                            navigate('/admin-login');
                        }}>
                            <i className="ph-bold ph-sign-out"></i> Log Out
                        </button>
                    </div>
                </aside>

                {/* Main Viewport */}
                <main className="admin-main-content">
                    <header className="admin-top-navbar">
                        <div className="navbar-left">
                            {/* Feature names and toggle removed as requested */}
                        </div>

                        <div className="navbar-actions">
                            <button 
                                className="view-website-btn" 
                                onClick={() => navigate('/?from=admin')}
                                title="View Live Website"
                            >
                                <i className="ph-bold ph-globe"></i>
                                <span>View Website</span>
                            </button>

                            <div className="search-container-header d-none d-lg-flex">
                                <i className={`ph-bold ${isSearching ? 'ph-spinner searching-spin' : 'ph-magnifying-glass'}`}></i>
                                <input 
                                    type="text" 
                                    placeholder="Search Panel & Website..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <>
                                        <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                                            <i className="ph-bold ph-x-circle"></i>
                                        </button>
                                        <div className="search-results-popover">
                                            {/* Navigation Section */}
                                            {filteredResults.navigation.length > 0 && (
                                                <div className="search-group">
                                                    <span>Quick Links</span>
                                                    {filteredResults.navigation.map(s => (
                                                        <div key={s.id} className="search-item navigation-item" onClick={() => {setActiveSection(s.id); setSearchQuery('');}}>
                                                            <i className={`ph-bold ${s.icon}`}></i>
                                                            <div className="si-text">
                                                                <strong>{s.label}</strong>
                                                                <small>Jump to panel section</small>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Mechanics Section */}
                                            {filteredResults.mechanics.length > 0 && (
                                                <div className="search-group">
                                                    <span>Staff Members</span>
                                                    {filteredResults.mechanics.map(m => (
                                                        <div key={m._id} className="search-item" onClick={() => {setActiveSection('mechanics'); setSearchQuery('');}}>
                                                            <i className="ph-bold ph-user-gear"></i>
                                                            <div className="si-text">
                                                                <strong>{m.fullName}</strong>
                                                                <small>{m.specialization?.[0] || 'Technical Staff'}</small>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Customers Section */}
                                            {filteredResults.customers.length > 0 && (
                                                <div className="search-group">
                                                    <span>Customers</span>
                                                    {filteredResults.customers.map(c => (
                                                        <div key={c._id} className="search-item" onClick={() => {setActiveSection('customers'); setSearchQuery('');}}>
                                                            <i className="ph-bold ph-users"></i>
                                                            <div className="si-text">
                                                                <strong>{c.fullName}</strong>
                                                                <small>{c.email}</small>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Requests Section */}
                                            {filteredResults.requests.length > 0 && (
                                                <div className="search-group">
                                                    <span>Service Requests</span>
                                                    {filteredResults.requests.map(r => (
                                                        <div key={r._id} className="search-item" onClick={() => {setActiveSection('requests'); setSearchQuery('');}}>
                                                            <i className="ph-bold ph-activity"></i>
                                                            <div className="si-text">
                                                                <strong>{r.serviceType}</strong>
                                                                <small>{r.customerId?.fullName} • {r.status}</small>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Empty State */}
                                            {filteredResults.mechanics.length === 0 && 
                                             filteredResults.customers.length === 0 && 
                                             filteredResults.requests.length === 0 && (
                                                <div className="search-empty-state">
                                                    <i className="ph-bold ph-magnifying-glass"></i>
                                                    <p>No results found for "{searchQuery}"</p>
                                                    <span>Try searching for names, emails, or services</span>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="notification-trigger" onClick={() => setShowNotifications(!showNotifications)}>
                                <div className="navbar-icon-btn">
                                    <i className="ph-bold ph-bell"></i>
                                    {notifications.some(n => !n.read) && <span className="notif-badge"></span>}
                                </div>
                                
                                <AnimatePresence>
                                    {showNotifications && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }} 
                                            animate={{ opacity: 1, y: 0 }} 
                                            exit={{ opacity: 0, y: 10 }}
                                            className="notification-dropdown"
                                        >
                                            <div className="notif-header">
                                                <h4>Notifications</h4>
                                                <button onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}>Mark all read</button>
                                            </div>
                                            <div className="notif-list">
                                                {/* Merge real notifications with derived activities for a unified feed */}
                                                {[
                                                    ...notifications,
                                                    ...activityTimeline.map((act, i) => ({
                                                        _id: `act-${i}`,
                                                        title: act.act,
                                                        message: `${act.user}: ${act.act} for vehicle`,
                                                        createdAt: new Date(), // Just dynamic for UI
                                                        read: false,
                                                        icon: act.icon,
                                                        isActivity: true
                                                    }))
                                                ].length > 0 ? [
                                                    ...notifications,
                                                    ...activityTimeline.map((act, i) => ({
                                                        _id: `act-${i}`,
                                                        title: act.act,
                                                        message: `${act.user} (${act.role})`,
                                                        createdAt: new Date(), 
                                                        read: false,
                                                        icon: act.icon,
                                                        isActivity: true
                                                    }))
                                                ].slice(0, 10).map((n) => (
                                                    <div key={n._id} className={`notif-item ${!n.read ? 'unread' : ''}`} style={{ opacity: n.read ? 0.6 : 1 }}>
                                                        <div className="notif-icon" style={{ background: n.isActivity ? 'rgba(255, 59, 48, 0.1)' : '' }}>
                                                            <i className={`ph-bold ${n.icon || (n.title.includes('Job') || n.title.includes('Service') ? 'ph-wrench' : n.title.includes('Payment') ? 'ph-currency-inr' : 'ph-bell')}`}></i>
                                                        </div>
                                                        <div className="notif-content">
                                                            <strong>{n.title}</strong>
                                                            <p>{n.message}</p>
                                                            <span>{n.isActivity ? 'Recent Activity' : new Date(n.createdAt).toLocaleTimeString()}</span>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div className="p-4 text-center" style={{ opacity: 0.5 }}>No new notifications</div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div 
                                className={`admin-profile-badge-simple ${activeSection === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveSection('profile')}
                                style={{ cursor: 'pointer' }}
                            >
                                <i className="ph-bold ph-user-circle"></i>
                            </div>
                        </div>
                    </header>

                    <div className="admin-viewport">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {renderActiveSection()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>

            {/* Detail Side Panel */}
            <AnimatePresence>
                {selectedDetail && (
                    <>
                       <motion.div 
                           initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                           className="detail-overlay" onClick={() => setSelectedDetail(null)} 
                       />
                       <motion.div 
                           initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                           transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                           className="detail-slide-panel"
                       >
                           <div className="panel-header">
                               <h3>{selectedDetail.type === 'request' ? 'Service Details' : 'Customer Profile'}</h3>
                               <button onClick={() => setSelectedDetail(null)}><i className="ph-bold ph-x"></i></button>
                           </div>
                           <div className="panel-content">
                               {selectedDetail.type === 'request' && (
                                   <div className="request-detail-view">
                                       <div className="detail-hero">
                                           <div className="id-badge">{selectedDetail.data.id}</div>
                                           <h2>{selectedDetail.data.car}</h2>
                                           <span className="customer-name">{selectedDetail.data.user}</span>
                                       </div>
                                       <div className="detail-meta-grid">
                                           <div className="meta-box"><span>Service Type</span><strong>{selectedDetail.data.svc}</strong></div>
                                           <div className="meta-box"><span>Technician</span><strong>{selectedDetail.data.mech}</strong></div>
                                           <div className="meta-box"><span>Status</span><strong className="status-highlight">{selectedDetail.data.status}</strong></div>
                                           <div className="meta-box"><span>Priority</span><strong className="priority-highlight">{selectedDetail.data.pri}</strong></div>
                                       </div>
                                       <div className="detail-actions">
                                           <button className="btn-primary-glow w-100 mb-3" onClick={() => showToast('Status Updated Successfully')}>Update Status</button>
                                           <button className="btn-secondary-outline w-100">Assign New Mechanic</button>
                                       </div>
                                   </div>
                               )}
                               {(selectedDetail.type === 'customer' || selectedDetail.type === 'mechanic') && (
                                    <div className="customer-detail-view">
                                        {!isEditing ? (
                                            <>
                                                <div className="detail-hero">
                                                    <div className="avatar-lg">{selectedDetail.data.fullName.charAt(0)}</div>
                                                    <h2>{selectedDetail.data.fullName}</h2>
                                                    <span className="customer-name">{selectedDetail.data.email}</span>
                                                </div>
                                                <div className="info-list">
                                                    <div className="info-row"><i className="ph-bold ph-identification-card"></i> <span>Role: {selectedDetail.data.role}</span></div>
                                                    <div className="info-row"><i className="ph-bold ph-phone"></i> <span>{selectedDetail.data.phone || 'No phone provided'}</span></div>
                                                    <div className="info-row"><i className="ph-bold ph-calendar"></i> <span>Joined: {new Date(selectedDetail.data.createdAt).toLocaleDateString()}</span></div>
                                                </div>
                                                <button className="btn-primary-glow w-100 mt-4" onClick={() => { setIsEditing(true); setEditData(selectedDetail.data); }}>Edit Profile</button>
                                            </>
                                        ) : (
                                            <div className="edit-form-panel">
                                                <h4 className="mb-4">Edit {selectedDetail.data.role} Profile</h4>
                                                <div className="input-group-modern mb-3">
                                                    <label>Full Name</label>
                                                    <input type="text" value={editData.fullName} onChange={(e) => setEditData({...editData, fullName: e.target.value})} />
                                                </div>
                                                <div className="input-group-modern mb-3">
                                                    <label>Email Address</label>
                                                    <input type="email" value={editData.email} onChange={(e) => setEditData({...editData, email: e.target.value})} />
                                                </div>
                                                <div className="input-group-modern mb-4">
                                                    <label>Phone Number</label>
                                                    <input type="text" value={editData.phone} onChange={(e) => setEditData({...editData, phone: e.target.value})} />
                                                </div>
                                                <div className="edit-actions">
                                                    <button className="btn-primary-glow w-100 mb-3" onClick={handleUpdateUser}>Save Changes</button>
                                                    <button className="btn-secondary-outline w-100" onClick={() => setIsEditing(false)}>Cancel</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                           </div>
                       </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Toast Feedback */}
            <AnimatePresence>
                {toast && (
                    <motion.div 
                       initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                       className="admin-toast-success"
                    >
                        <i className="ph-fill ph-check-circle"></i>
                        <span>{toast}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <AssignMechanicModal 
                isOpen={isAssignModalOpen} 
                onClose={() => setIsAssignModalOpen(false)} 
                selectedRequest={selectedRequest}
                mechanics={data.mechanics}
                onAssign={handleAssignMechanic}
                mechanicSearch={mechanicSearch}
                setMechanicSearch={setMechanicSearch}
            />
            <EditPriceModal 
                isOpen={isPriceModalOpen} 
                onClose={() => setIsPriceModalOpen(false)} 
                editingService={editingService}
                onSave={handleUpdatePrice}
            />
        </div>
    );
};

export default AdminDashboard;
