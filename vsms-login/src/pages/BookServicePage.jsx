import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './BookServicePage.css';
import { fetchVehicles, addVehicle, bookService } from '../services/api';

const BookServicePage = ({ onComplete, userId }) => {
    const [bookingStep, setBookingStep] = useState(1);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const morningSlots = ['09:00 AM', '10:00 AM', '11:00 AM'];
    const afternoonSlots = ['01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

    const serviceContexts = {
        'engine': {
            placeholder: "Describe your engine diagnostics issue… e.g., strange noise, overheating",
            chips: ["Engine noise", "Warning light ON", "Low performance", "Starting problem"]
        },
        'brake': {
            placeholder: "Describe your brake issue… e.g., noise while braking, brake delay",
            chips: ["Brake not working properly", "Noise while braking", "Brake pedal issue", "Vibration while braking"]
        },
        'ac': {
            placeholder: "Describe your AC issue… e.g., low cooling, bad smell",
            chips: ["AC not cooling", "Bad smell", "Low airflow"]
        },
        'battery': {
            placeholder: "Describe your battery issue… e.g., car not starting",
            chips: ["Car not starting", "Battery not charging"]
        },
        'full': {
            placeholder: "Describe your full vehicle service needs… e.g., major inspection",
            chips: ["General checkup", "Internal cleaning", "Fluid top-up"]
        },
        'default': {
            placeholder: "Describe your issue… provide as much detail as possible",
            chips: ["Strange noise", "Vibration", "Leakage", "Warning light"]
        }
    };

    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const [issueDescription, setIssueDescription] = useState('');

    const [isBooked, setIsBooked] = useState(false);
    const [bookingId, setBookingId] = useState('');
    const [bookedService, setBookedService] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newVehicle, setNewVehicle] = useState({ name: '', brand: '', plate: '', model: '', year: '', fuel: 'Petrol' });

    const steps = [
        { id: 1, label: 'Service' },
        { id: 2, label: 'Vehicle' },
        { id: 3, label: 'Schedule' },
        { id: 4, label: 'Details' },
        { id: 5, label: 'Confirm' }
    ];

    const services = [
        { id: 'full', name: 'Full Vehicle Service', desc: 'Complete inspection and maintenance', icon: 'ph-wrench' },
        { id: 'engine', name: 'Engine Diagnostics', desc: 'Advanced engine health analysis', icon: 'ph-activity' },
        { id: 'oil', name: 'Oil Change', desc: 'High-quality oil replacement service', icon: 'ph-drop' },
        { id: 'brake', name: 'Brake Service', desc: 'Brake inspection and repair', icon: 'ph-shield-check' },
        { id: 'battery', name: 'Battery Check', desc: 'Battery health and replacement', icon: 'ph-battery-charging' },
        { id: 'ac', name: 'AC Service', desc: 'Cooling system maintenance', icon: 'ph-snowflake' },
        { id: 'align', name: 'Wheel Alignment', desc: 'Precision wheel alignment service', icon: 'ph-arrows-out-cardinal' },
        { id: 'paint', name: 'Dent & Paint', desc: 'Body repair and painting', icon: 'ph-paint-brush-broad' },
        { id: 'custom', name: 'Custom Issue', desc: 'Describe your own problem', icon: 'ph-chat-teardrop-dots' },
    ];

    // Fetch Vehicles on Mount
    useEffect(() => {
        const loadVehicles = async () => {
            if (!userId) return;
            try {
                const { data } = await fetchVehicles(userId);
                setVehicles(data);
                if (data.length === 1) {
                    setSelectedVehicle(data[0]._id);
                }
            } catch (err) {
                console.error("Error loading vehicles:", err);
            }
        };
        loadVehicles();
    }, [userId]);

    // Calendar Helpers
    const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const isPastDate = (day) => {
        const dateToCheck = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dateToCheck < today;
    };
    const isToday = (day) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            currentMonth.getMonth() === today.getMonth() &&
            currentMonth.getFullYear() === today.getFullYear()
        );
    };

    const handleDateSelect = (day) => {
        if (!isPastDate(day)) {
            setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
            setSelectedTime(null); // Reset time when date changes
        }
    };

    const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    const handlePrevMonth = () => {
        const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
        const today = new Date();
        if (prev >= new Date(today.getFullYear(), today.getMonth(), 1)) {
            setCurrentMonth(prev);
        }
    };

    const handleNext = () => {
        if (bookingStep < 5) setBookingStep(bookingStep + 1);
        else handleConfirm();
    };

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            const bookingData = {
                customerId: userId,
                vehicleId: selectedVehicle,
                serviceType: services.find(s => s.id === selectedService)?.name,
                issueDescription,
                appointmentDate: selectedDate.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' }),
                appointmentTime: selectedTime
            };

            const { data } = await bookService(bookingData);
            setBookedService(data);
            setBookingId(data._id.substring(data._id.length - 6).toUpperCase());
            setIsBooked(true);
        } catch (err) {
            console.error("Booking failed:", err);
            alert("Failed to book service. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const jumpToStep = (step) => setBookingStep(step);

    const handleBack = () => {
        if (bookingStep > 1) setBookingStep(bookingStep - 1);
    };

    const handleAddVehicle = async (e) => {
        e.preventDefault();
        try {
            const { data } = await addVehicle({
                ownerId: userId,
                ...newVehicle
            });
            setVehicles([...vehicles, data]);
            setIsModalOpen(false);
            setNewVehicle({ name: '', brand: '', plate: '', model: '', year: '', fuel: 'Petrol' });
            setSelectedVehicle(data._id);
        } catch (err) {
            console.error("Error adding vehicle:", err);
            alert(err.message || "Failed to add vehicle.");
        }
    };

    const handleChipClick = (chip) => {
        setIssueDescription(prev => prev ? `${prev}, ${chip}` : chip);
    };

    const handleNextAvailableSlot = () => {
        const today = new Date();
        setSelectedDate(today);
        setSelectedTime(morningSlots[0]);
    };

    const isNextDisabled = () => {
        if (bookingStep === 1) return !selectedService;
        if (bookingStep === 2) return !selectedVehicle;
        if (bookingStep === 3) return !selectedDate || !selectedTime;
        if (bookingStep === 4) return issueDescription.length < 10;
        return false;
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentMonth);
        const firstDay = getFirstDayOfMonth(currentMonth);
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        for (let i = 1; i <= daysInMonth; i++) {
            const isSelected = selectedDate && selectedDate.getDate() === i && selectedDate.getMonth() === currentMonth.getMonth();
            days.push(
                <div
                    key={i}
                    className={`calendar-day ${isPastDate(i) ? 'disabled' : ''} ${isToday(i) ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleDateSelect(i)}
                >
                    {i}
                </div>
            );
        }
        return days;
    };

    return (
        <div className="book-service-wrapper">
            {!isBooked ? (
                <>
                    <div className="booking-header">
                        <h1 className="booking-title">Book a Service</h1>
                        <p className="booking-subtitle">Follow the simple steps to schedule your vehicle service.</p>
                    </div>

                    {/* Stepper */}
                    <div className="booking-stepper">
                        {steps.map((step) => (
                            <div key={step.id} className={`stepper-item ${bookingStep === step.id ? 'active' : ''} ${bookingStep > step.id ? 'completed' : ''}`}>
                                <div className="step-circle">
                                    {bookingStep > step.id ? <i className="ph-bold ph-check"></i> : step.id}
                                </div>
                                <span className="step-label">{step.label}</span>
                                {step.id !== 5 && <div className="step-line"></div>}
                            </div>
                        ))}
                    </div>

                    {/* Step Content */}
                    <div className="booking-content">
                        <AnimatePresence mode="wait">
                            {bookingStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="step-container"
                                >
                                    <h2 className="step-title">Select Service Type</h2>
                                    <div className="services-grid">
                                        {services.map((service) => (
                                            <div
                                                key={service.id}
                                                className={`service-card ${selectedService === service.id ? 'selected' : ''}`}
                                                onClick={() => setSelectedService(service.id)}
                                            >
                                                <div className="service-card-icon">
                                                    <i className={`ph-bold ${service.icon}`}></i>
                                                </div>
                                                <div className="service-card-info">
                                                    <h3 className="service-name">{service.name}</h3>
                                                    <p className="service-desc">{service.desc}</p>
                                                </div>
                                                {selectedService === service.id && (
                                                    <div className="selected-indicator">
                                                        <i className="ph-bold ph-check"></i>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {bookingStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="step-container"
                                >
                                    <h2 className="step-title">Select Your Vehicle</h2>
                                    
                                    {vehicles.length === 0 ? (
                                        <div className="empty-state-card glass-card">
                                            <div className="empty-state-icon">
                                                <i className="ph-bold ph-car-profile"></i>
                                                <div className="icon-pulse"></div>
                                            </div>
                                            <h3>No Vehicles Registered</h3>
                                            <p>It looks like you haven't added any vehicles to your profile yet. Please add a vehicle to start booking professional services.</p>
                                            <button className="booking-btn btn-primary btn-add-first" onClick={() => setIsModalOpen(true)}>
                                                <i className="ph-bold ph-plus"></i>
                                                Add Your First Vehicle
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="vehicles-grid">
                                            {vehicles.map((v) => (
                                                <div
                                                    key={v._id}
                                                    className={`vehicle-card ${selectedVehicle === v._id ? 'selected' : ''}`}
                                                    onClick={() => setSelectedVehicle(v._id)}
                                                >
                                                    <div className="vehicle-card-icon">
                                                        <i className={`ph-bold ${v.name.toLowerCase().includes('activa') ? 'ph-moped-front' : 'ph-car-profile'}`}></i>
                                                    </div>
                                                    <div className="vehicle-card-info">
                                                        <h3 className="vehicle-name">{v.name}</h3>
                                                        <p className="vehicle-plate">{v.plate}</p>
                                                        <div className="vehicle-tags">
                                                            <span className="tag">{v.fuel}</span>
                                                            <span className="tag">{v.year}</span>
                                                        </div>
                                                    </div>
                                                    {selectedVehicle === v._id && (
                                                        <div className="selected-indicator">
                                                            <i className="ph-bold ph-check"></i>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            <div className="vehicle-card add-new-card" onClick={() => setIsModalOpen(true)}>
                                                <div className="add-icon">
                                                    <i className="ph-bold ph-plus"></i>
                                                </div>
                                                <span>Add New Vehicle</span>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {bookingStep === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="step-container"
                                >
                                    <h2 className="step-title">Select Date & Time</h2>
                                    <div className="scheduling-split">
                                        {/* Left Side: Calendar */}
                                        <div className="calendar-panel glass-card">
                                            <div className="calendar-header">
                                                <button className="nav-btn" onClick={handlePrevMonth}><i className="ph-bold ph-caret-left"></i></button>
                                                <h3>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                                                <button className="nav-btn" onClick={handleNextMonth}><i className="ph-bold ph-caret-right"></i></button>
                                            </div>
                                            <div className="calendar-weekdays">
                                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
                                            </div>
                                            <div className="calendar-grid">
                                                {renderCalendar()}
                                            </div>
                                        </div>

                                        {/* Right Side: Time Slots */}
                                        <div className="time-panel glass-card">
                                            <div className="time-section">
                                                <h4>Morning Slots</h4>
                                                <div className="time-grid">
                                                    {morningSlots.map(time => (
                                                        <button
                                                            key={time}
                                                            className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                                                            onClick={() => setSelectedTime(time)}
                                                        >
                                                            {time}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="time-section">
                                                <h4>Afternoon Slots</h4>
                                                <div className="time-grid">
                                                    {afternoonSlots.map(time => (
                                                        <button
                                                            key={time}
                                                            className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                                                            onClick={() => setSelectedTime(time)}
                                                        >
                                                            {time}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <button className="shortcut-btn" onClick={handleNextAvailableSlot}>
                                                <i className="ph-bold ph-lightning"></i>
                                                Next Available Slot
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {bookingStep === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="step-container focused-step"
                                >
                                    <div className="step-header-group">
                                        <h2 className="step-title">Describe Your Issue</h2>
                                        <p className="step-subtitle">Provide details so we can serve you better</p>
                                    </div>

                                    <div className="details-focused-layout">
                                        <div className="textarea-wrapper">
                                            <textarea
                                                placeholder={serviceContexts[selectedService]?.placeholder || serviceContexts.default.placeholder}
                                                value={issueDescription}
                                                onChange={(e) => setIssueDescription(e.target.value)}
                                                rows="8"
                                            ></textarea>
                                            <div className="char-count">
                                                <span className={issueDescription.length < 10 ? 'warning' : 'success'}>
                                                    {issueDescription.length} characters
                                                </span>
                                                {issueDescription.length < 10 && <span className="helper-text">Minimum 10 recommended</span>}
                                            </div>
                                        </div>

                                        <div className="suggestion-chips">
                                            <p>Quick Suggestions for {services.find(s => s.id === selectedService)?.name || 'Service'}:</p>
                                            <div className="chips-grid">
                                                {(serviceContexts[selectedService]?.chips || serviceContexts.default.chips).map(chip => (
                                                    <button key={chip} className="chip" onClick={() => handleChipClick(chip)}>
                                                        <i className="ph-bold ph-plus"></i> {chip}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {bookingStep === 5 && (
                                <motion.div
                                    key="step5"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="step-container"
                                >
                                    <div className="step-header-group">
                                        <h2 className="step-title">Review & Confirm</h2>
                                        <p className="step-subtitle">Please verify your details before confirming your service</p>
                                    </div>

                                    <div className="summary-grid">
                                        {/* Service Summary */}
                                        <div className="summary-card glass-card">
                                            <div className="summary-card-header">
                                                <h3><i className="ph-bold ph-wrench"></i> Service Details</h3>
                                                <button className="edit-btn" onClick={() => jumpToStep(1)}>
                                                    <i className="ph-bold ph-pencil-simple"></i>
                                                </button>
                                            </div>
                                            <div className="summary-card-content">
                                                <div className="summary-item">
                                                    <label>Type</label>
                                                    <p>{services.find(s => s.id === selectedService)?.name}</p>
                                                </div>
                                                <div className="summary-item">
                                                    <label>Description</label>
                                                    <p className="description-text">{issueDescription}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Vehicle Summary */}
                                        <div className="summary-card glass-card">
                                            <div className="summary-card-header">
                                                <h3><i className="ph-bold ph-car"></i> Vehicle Details</h3>
                                                <button className="edit-btn" onClick={() => jumpToStep(2)}>
                                                    <i className="ph-bold ph-pencil-simple"></i>
                                                </button>
                                            </div>
                                            <div className="summary-card-content">
                                                <div className="summary-item">
                                                    <label>Vehicle</label>
                                                    <p>{vehicles.find(v => v._id === selectedVehicle)?.name}</p>
                                                </div>
                                                <div className="summary-item">
                                                    <label>Number Plate</label>
                                                    <p className="highlight-red">{vehicles.find(v => v._id === selectedVehicle)?.plate}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Schedule Summary */}
                                        <div className="summary-card glass-card">
                                            <div className="summary-card-header">
                                                <h3><i className="ph-bold ph-calendar"></i> Schedule Details</h3>
                                                <button className="edit-btn" onClick={() => jumpToStep(3)}>
                                                    <i className="ph-bold ph-pencil-simple"></i>
                                                </button>
                                            </div>
                                            <div className="summary-card-content">
                                                <div className="summary-item">
                                                    <label>Date</label>
                                                    <p>{selectedDate?.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                                </div>
                                                <div className="summary-item">
                                                    <label>Time Slot</label>
                                                    <p className="highlight-red">{selectedTime}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="confirmation-notice glass-card">
                                        <i className="ph-bold ph-info"></i>
                                        <p>Note: Final cost will be shared after inspection. All services include a complementary 24-point check.</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Navigation Footer */}
                    <div className="booking-footer">
                        <div className="selection-summary">
                            {selectedDate && selectedTime && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                    <p>Scheduled for:</p>
                                    <strong>{selectedDate.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })} at {selectedTime}</strong>
                                </motion.div>
                            )}
                        </div>
                        <div className="nav-buttons">
                            {bookingStep > 1 && (
                                <button className="booking-btn btn-secondary" onClick={handleBack}>
                                    <i className="ph-bold ph-arrow-left"></i>
                                    Back
                                </button>
                            )}
                            <button
                                className={`booking-btn btn-primary ${isNextDisabled() || isLoading ? 'disabled' : ''}`}
                                onClick={handleNext}
                                disabled={isNextDisabled() || isLoading}
                            >
                                {isLoading ? 'Processing...' : bookingStep === 5 ? 'Confirm Booking' : 'Continue'}
                                {!isLoading && bookingStep !== 5 && <i className="ph-bold ph-arrow-right"></i>}
                            </button>
                        </div>
                    </div>
                    <p className="booking-footer-note">You will receive updates via notifications.</p>
                </>
            ) : (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="success-container"
                >
                    <div className="success-icon">
                        <i className="ph-fill ph-check-circle"></i>
                    </div>
                    <h2 className="success-title">Booking Confirmed!</h2>
                    <p className="success-message">Your service has been successfully scheduled. Our team will contact you shortly.</p>
                    
                    <div className="booking-id-tag">
                        <span>Booking ID</span>
                        <strong>{bookingId}</strong>
                    </div>

                    <div className="success-actions">
                        <button className="booking-btn btn-primary" onClick={() => onComplete(bookedService)}>
                            <i className="ph-bold ph-clock-counter-clockwise"></i>
                            Track Service
                        </button>
                        <button className="booking-btn btn-secondary" onClick={() => onComplete()}>
                            <i className="ph-bold ph-house"></i>
                            Go to Dashboard
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Add Vehicle Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card modal-container"
                        >
                            <div className="modal-header">
                                <h2>Add New Vehicle</h2>
                                <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                    <i className="ph-bold ph-x"></i>
                                </button>
                            </div>
                            <form className="modal-form" onSubmit={handleAddVehicle}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Vehicle Brand</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Maruti, Honda"
                                            required
                                            value={newVehicle.brand}
                                            onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Vehicle Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Swift, Activa"
                                            required
                                            value={newVehicle.name}
                                            onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Number Plate</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. GJ01 AB 1234"
                                        required
                                        value={newVehicle.plate}
                                        onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value })}
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Model / Year</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 2022"
                                            required
                                            value={newVehicle.year}
                                            onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Fuel Type</label>
                                        <select
                                            value={newVehicle.fuel}
                                            onChange={(e) => setNewVehicle({ ...newVehicle, fuel: e.target.value })}
                                        >
                                            <option value="Petrol">Petrol</option>
                                            <option value="Diesel">Diesel</option>
                                            <option value="Electric">Electric</option>
                                            <option value="CNG">CNG</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="booking-btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="booking-btn btn-primary">Add Vehicle</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BookServicePage;
