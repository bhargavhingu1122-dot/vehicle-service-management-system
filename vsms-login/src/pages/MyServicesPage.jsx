import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './MyServicesPage.css';
import { fetchCustomerServices, fetchServiceUpdates } from '../services/api';

const MyServicesPage = ({ onBook, userId, targetedService, onClearTarget }) => {
    const [view, setView] = useState('list'); // 'list' or 'detail'
    const [selectedService, setSelectedService] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');
    const [services, setServices] = useState([]);
    const [timeline, setTimeline] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Refs to track current state inside the polling interval (avoids stale closures)
    const viewRef = useRef(view);
    const selectedServiceRef = useRef(selectedService);
    useEffect(() => { viewRef.current = view; }, [view]);
    useEffect(() => { selectedServiceRef.current = selectedService; }, [selectedService]);

    useEffect(() => {
        const loadServices = async (isPolling = false) => {
            if (!userId) return;
            if (!isPolling) setIsLoading(true);
            try {
                const { data } = await fetchCustomerServices(userId);
                setServices(data);
                
                // Keep the selected service in sync using refs to avoid stale closure
                if (viewRef.current === 'detail' && selectedServiceRef.current) {
                    const freshService = data.find(s => s._id === selectedServiceRef.current._id);
                    if (freshService) {
                        setSelectedService(freshService);
                    }
                }

                // If we have a targeted service but it's partially populated (e.g. results of a POST),
                // find the full populated version from the re-fetched list
                if (targetedService) {
                    const fullService = data.find(s => s._id === targetedService._id);
                    if (fullService) {
                        setSelectedService(fullService);
                        setView('detail');
                        onClearTarget();
                    }
                }
            } catch (err) {
                console.error("Error loading services:", err);
            } finally {
                if (!isPolling) setIsLoading(false);
            }
        };

        loadServices();

        // Poll every 15 seconds so mechanic status updates are reflected automatically
        const intervalId = setInterval(() => loadServices(true), 15000);
        return () => clearInterval(intervalId);
    }, [userId, targetedService, onClearTarget]); // removed 'view' to keep polling consistent

    useEffect(() => {
        if (view !== 'detail' || !selectedService) return;

        const loadTimeline = async () => {
            try {
                const { data } = await fetchServiceUpdates(selectedService._id);
                setTimeline(data);
            } catch (err) {
                console.error("Error loading timeline:", err);
            }
        };

        loadTimeline();

        // Also poll the timeline every 15 seconds when in detail view
        const intervalId = setInterval(loadTimeline, 15000);
        return () => clearInterval(intervalId);
    }, [view, selectedService?._id]); // depend on _id only to avoid infinite loops

    const filteredServices = services.filter(service => {
        if (activeFilter === 'All') return service.status !== 'Completed';
        if (activeFilter === 'In Progress') return service.status === 'In Service' || service.status === 'Accepted' || service.status === 'Pending';
        if (activeFilter === 'Completed') return service.status === 'Completed';
        return true;
    });

    const getStatusClass = (status) => {
        switch (status) {
            case 'In Service': return 'status-in-progress';
            case 'Accepted': return 'status-accepted';
            case 'Pending': return 'status-pending';
            case 'Completed': return 'status-completed';
            default: return 'status-pending';
        }
    };

    const handleViewDetails = (service) => {
        setSelectedService(service);
        setView('detail');
    };

    const renderListView = () => (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="services-list-view"
        >
            <div className="services-header">
                <div className="header-text">
                    <h1>My Services</h1>
                    <p>Track and manage your vehicle services.</p>
                </div>
                <div className="filter-tabs">
                    {['All', 'In Progress', 'Completed'].map(filter => (
                        <button 
                            key={filter}
                            className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            <div className="services-grid">
                <AnimatePresence mode="popLayout">
                    {filteredServices.length > 0 ? (
                        filteredServices.map((service) => (
                            <motion.div 
                                key={service._id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="overview-service-card"
                                onClick={() => handleViewDetails(service)}
                            >
                                <div className="overview-card-header">
                                    <div className="v-info">
                                        <h3>{service.vehicleId?.name}</h3>
                                        <span className="v-plate">{service.vehicleId?.plate}</span>
                                    </div>
                                    <span className={`v-status-badge ${getStatusClass(service.status)}`}>
                                        {service.status}
                                    </span>
                                </div>

                                <div className="overview-card-body">
                                    <h4 className="v-type">{service.serviceType}</h4>
                                    <p className="v-desc">{service.issueDescription}</p>
                                </div>

                                <div className="overview-card-footer">
                                    <div className="v-meta">
                                        <i className="ph-bold ph-calendar"></i>
                                        <span>{service.appointmentDate} • {service.appointmentTime}</span>
                                    </div>
                                    <span className="v-link">View Details <i className="ph-bold ph-arrow-right"></i></span>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="empty-state-overview">
                            <i className="ph ph-wrench"></i>
                            <h3>No active services found</h3>
                            <button className="book-shortcut-btn" onClick={onBook}>Book a Service</button>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );

    const renderDetailView = () => {
        const trackerSteps = [
            { label: 'Booked', icon: 'ph-calendar-check', key: 'Pending' },
            { label: 'Accepted', icon: 'ph-user-check', key: 'Accepted' },
            { label: 'In Service', icon: 'ph-wrench', key: 'In Service' },
            { label: 'Completed', icon: 'ph-check-circle', key: 'Completed' }
        ];

        // Map status to step index (0-3)
        const currentStepIdx = trackerSteps.findIndex(s => s.key === selectedService.status);
        const progressPercent = (currentStepIdx / (trackerSteps.length - 1)) * 100;

        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="service-tracking-dashboard"
            >
                {/* Header Section */}
                <div className="tracking-header">
                    <button className="back-link-btn" onClick={() => setView('list')}>
                        <i className="ph-bold ph-arrow-left"></i> Back to My Services
                    </button>
                    <div className="tracking-title-info">
                        <div className="title-left">
                            <span className="live-badge-glow"><i className="ph-bold ph-broadcast" style={{marginRight: '6px'}}></i>LIVE TRACKING</span>
                            <h1>{selectedService.serviceType}</h1>
                            <p className="vehicle-subtitle">{selectedService.vehicleId?.name} • {selectedService.vehicleId?.plate}</p>
                            <span className="helper-text">Track your service in real-time</span>
                        </div>
                        <div className="service-id-tag">ID: {selectedService._id.substring(selectedService._id.length-8).toUpperCase()}</div>
                    </div>
                </div>

                {/* Main Tracker Section (Horizontal) */}
                <div className="horizontal-tracker-block glass-panel">
                    <div className="hs-progress-track">
                        <div className="hs-progress-line-bg"></div>
                        <motion.div 
                            className="hs-progress-line-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                        ></motion.div>

                        {/* Animated Car Icon */}
                        <motion.div 
                            className="hs-moving-car"
                            initial={{ left: 0 }}
                            animate={{ left: `${progressPercent}%` }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                        >
                            <i className="ph-fill ph-car"></i>
                            <div className="car-glow"></div>
                        </motion.div>

                        <div className="hs-tracker-steps-wrapper">
                            {trackerSteps.map((step, idx) => {
                                const isCompleted = idx < currentStepIdx;
                                const isActive = idx === currentStepIdx;
                                const isUpcoming = idx > currentStepIdx;

                                return (
                                    <div key={idx} className={`hs-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isUpcoming ? 'upcoming' : ''}`}>
                                        <div className="hs-step-node">
                                            {isCompleted && <i className="ph-bold ph-check"></i>}
                                            {isActive && <div className="node-pulse"></div>}
                                            {!isCompleted && !isActive && <i className={`ph-bold ${step.icon}`}></i>}
                                        </div>
                                        <span className="step-label">{step.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Live Status & Activity Section */}
                <div className="tracking-mid-section">
                    {/* Status Card */}
                    <div className="live-status-card glass-panel">
                        <div className="card-label">Current Status</div>
                        <div className="status-display">
                            <h2 className="glow-text-red">{selectedService.status}</h2>
                            <p>Your vehicle is currently {selectedService.status.toLowerCase()}.</p>
                        </div>
                        <div className="status-meta-grid">
                            <div className="meta-item">
                                <label>Estimated Completion</label>
                                <span>{selectedService.status === 'Completed' ? 'Service Finished' : 'Calculating...'}</span>
                            </div>
                            <div className="meta-item">
                                <label>Appointment Date</label>
                                <span>{selectedService.appointmentDate}</span>
                            </div>
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="live-activity-feed glass-panel">
                        <div className="card-label">Live Activity Feed</div>
                        <div className="activity-list-v">
                            {timeline.length > 0 ? timeline.map((item, idx) => (
                                <div key={idx} className="activity-item-v done">
                                    <div className="activity-dot-v"></div>
                                    <div className="activity-info-v">
                                        <strong>{item.statusLabel}</strong>
                                        <p>{item.description}</p>
                                        <span className="activity-time-v">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            )) : <p className="text-secondary p-3">No updates yet.</p>}
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Details & Actions */}
                <div className="tracking-bottom-section">
                    <div className="service-info-mini-card glass-panel">
                        <div className="card-label">Service Details</div>
                        <div className="mini-details-grid">
                            <div className="mini-item">
                                <label>Service Type</label>
                                <p>{selectedService.serviceType}</p>
                            </div>
                            <div className="mini-item">
                                <label>Appointment</label>
                                <p>{selectedService.appointmentDate} at {selectedService.appointmentTime}</p>
                            </div>
                            <div className="mini-item full-width">
                                <label>Issue Description</label>
                                <p>{selectedService.issueDescription}</p>
                            </div>
                        </div>
                    </div>

                    <div className="tracking-actions-card glass-panel">
                        <div className="card-label">Actions</div>
                        <div className="action-buttons-grid">
                            <button className="hs-action-btn primary">
                                <i className="ph-bold ph-chat-circle"></i> Contact Support
                            </button>
                            <button className="hs-action-btn ghost" onClick={() => setView('list')}>
                                <i className="ph-bold ph-arrow-u-up-left"></i> Back to My Services
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="my-services-wrapper">
            <AnimatePresence mode="wait">
                {view === 'list' ? renderListView() : renderDetailView()}
            </AnimatePresence>
        </div>
    );
};

export default MyServicesPage;
