import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ServiceHistoryPage.css';
import { fetchCustomerServices } from '../services/api';

const ServiceHistoryPage = ({ onBook, userId }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [historyData, setHistoryData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadHistory = async () => {
            if (!userId) return;
            setIsLoading(true);
            try {
                const { data } = await fetchCustomerServices(userId);
                const completed = data.filter(s => s.status === 'Completed').map(item => ({
                    ...item,
                    id: item._id,
                    vehicle: item.vehicleId?.name,
                    plate: item.vehicleId?.plate,
                    type: item.serviceType,
                    description: item.issueDescription,
                    date: item.appointmentDate,
                    time: item.appointmentTime,
                    month: new Date(item.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' })
                }));
                setHistoryData(completed);
            } catch (err) {
                console.error("Error loading service history:", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadHistory();
    }, [userId]);

    const filteredHistory = historyData.filter(item => {
        const matchesSearch = item.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.type.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (activeFilter === 'All') return matchesSearch;
        const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
        if (activeFilter === 'This Month') return matchesSearch && item.month === currentMonth;
        if (activeFilter === 'Last 3 Months') {
            // Simplified logic for "Last 3 Months" filter
            return matchesSearch; 
        }
        return matchesSearch;
    });

    // Grouping logic
    const groupedHistory = filteredHistory.reduce((groups, item) => {
        const month = item.month;
        if (!groups[month]) {
            groups[month] = [];
        }
        groups[month].push(item);
        return groups;
    }, {});


    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="service-history-wrapper"
        >
            <header className="history-page-header">
                <div className="header-text">
                    <h1>Service History</h1>
                    <p>View all your completed vehicle services.</p>
                </div>
            </header>

            <div className="history-controls glass-panel">
                <div className="search-box-v">
                    <i className="ph-bold ph-magnifying-glass"></i>
                    <input 
                        type="text" 
                        placeholder="Search vehicle or service..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-pills-v">
                    {['All', 'This Month', 'Last 3 Months'].map(f => (
                        <button 
                            key={f} 
                            className={`filter-pill-v ${activeFilter === f ? 'active' : ''}`}
                            onClick={() => setActiveFilter(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="history-list-container">
                <AnimatePresence mode="popLayout">
                    {Object.keys(groupedHistory).length > 0 ? (
                        Object.entries(groupedHistory).map(([month, items]) => (
                            <div key={month} className="month-group">
                                <h3 className="month-header">{month}</h3>
                                <div className="cards-stack">
                                    {items.map((service) => (
                                        <motion.div 
                                            key={service.id}
                                            layout
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="history-card-h glass-panel"
                                        >
                                            <div className="card-left">
                                                <div className="v-icon-box-v">
                                                    <i className="ph-bold ph-car"></i>
                                                </div>
                                                <div className="v-label">
                                                    <h4>{service.vehicle}</h4>
                                                    <span>{service.plate}</span>
                                                </div>
                                            </div>

                                            <div className="card-mid">
                                                <div className="svc-type-v">
                                                    <span className="type-name">{service.type}</span>
                                                    <span className="status-dot"></span>
                                                    <span className="completed-badge-v">Completed</span>
                                                </div>
                                                <p className="svc-desc-v">{service.description}</p>
                                            </div>

                                            <div className="card-right">
                                                <div className="date-time-v">
                                                    <div className="meta-pair">
                                                        <i className="ph-bold ph-calendar"></i>
                                                        <span>{service.date}</span>
                                                    </div>
                                                    <div className="meta-pair secondary">
                                                        <span>{service.time}</span>
                                                    </div>
                                                </div>
                                            </div>


                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="history-empty-state glass-panel">
                            <i className="ph-bold ph-clock-counter-clockwise"></i>
                            <h3>No history found</h3>
                            <p>You haven't completed any services yet or your search didn't match.</p>
                            <button className="cta-btn-v" onClick={onBook}>Book New Service</button>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default ServiceHistoryPage;
