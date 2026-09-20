import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts';
import './HomeSections.css';

// Constants & Data
const services = [
  { id: 1, name: 'Periodic Service', icon: 'ph-wrench', color: '#007aff', desc: 'Comprehensive multi-point inspection and maintenance' },
  { id: 2, name: 'Oil Change', icon: 'ph-drop', color: '#af52de', desc: 'Premium synthetic oil and filter replacement' },
  { id: 3, name: 'AC Repair', icon: 'ph-snowflake', color: '#007aff', desc: 'Blower cleaning and refrigerant gas top-up' },
  { id: 4, name: 'Brake Repair', icon: 'ph-stop-circle', color: '#af52de', desc: 'Safety-first brake pad and disc inspection' },
  { id: 5, name: 'Battery Replacement', icon: 'ph-battery-charging', color: '#007aff', desc: 'High-performance battery health check and replacement' },
  { id: 6, name: 'Car Wash', icon: 'ph-sparkle', color: '#af52de', desc: 'Professional exterior foam wash and interior cleaning' },
  { id: 7, name: 'Wheel Alignment & Balancing', icon: 'ph-arrows-out-line-horizontal', color: '#007aff', desc: 'Improve driving stability and extend tyre life with precise alignment' }
];

const analyticsData = {
  monthly: [
    { name: 'Jan', count: 120 }, { name: 'Feb', count: 180 }, { name: 'Mar', count: 250 },
    { name: 'Apr', count: 220 }, { name: 'May', count: 300 }, { name: 'Jun', count: 400 },
  ],
  distribution: [
    { name: 'Periodic Service', value: 30 }, { name: 'Oil Change', value: 20 },
    { name: 'AC Repair', value: 15 }, { name: 'Brake Repair', value: 15 },
    { name: 'Battery', value: 10 }, { name: 'Others', value: 10 }
  ],
  growth: [
    { month: 'Jan', users: 500 }, { month: 'Feb', users: 800 }, { month: 'Mar', users: 1500 },
    { month: 'Apr', users: 2200 }, { month: 'May', users: 3500 }, { month: 'Jun', users: 5000 },
  ],
  stats: [
    { label: 'Total Services', value: '15,000+', icon: 'ph-wrench', color: '#007aff', glow: 'rgba(0, 122, 255, 0.4)' },
    { label: 'Active Customers', value: '5,000+', icon: 'ph-users', color: '#af52de', glow: 'rgba(175, 82, 222, 0.4)' },
    { label: 'Services Today', value: '120', icon: 'ph-calendar-check', color: '#00c7be', glow: 'rgba(0, 199, 190, 0.4)' },
    { label: 'Satisfaction Rate', value: '98%', icon: 'ph-smiley-wink', color: '#ffcc00', glow: 'rgba(255, 204, 0, 0.4)' }
  ]
};

const neonPalette = ['#007aff', '#af52de', '#00c7be', '#ffcc00', '#ff3b30', '#5856d6'];

const carCategories = {
  'Hatchback': {
    multiplier: 1.0,
    models: ['Maruti Swift', 'Maruti Baleno', 'Hyundai i10', 'Hyundai i20', 'Tata Tiago', 'Tata Altroz', 'Renault Kwid']
  },
  'Sedan': {
    multiplier: 1.2,
    models: ['Honda City', 'Hyundai Verna', 'Maruti Ciaz', 'Skoda Slavia', 'Volkswagen Virtus']
  },
  'SUV': {
    multiplier: 1.5,
    models: ['Hyundai Creta', 'Kia Seltos', 'Tata Nexon', 'Mahindra XUV300', 'Mahindra XUV700', 'Maruti Brezza', 'Toyota Urban Cruiser', 'MG Astor']
  },
  'Luxury': {
    multiplier: 2.0,
    models: ['Toyota Fortuner', 'BMW 3 Series', 'Audi A4', 'Mercedes C-Class']
  }
};

const serviceBasePrices = {
  'Periodic Service': 2000,
  'Oil Change': 1000,
  'AC Repair': 1500,
  'Brake Repair': 1800,
  'Battery Replacement': 4500,
  'Car Wash': 500,
  'Wheel Alignment & Balancing': 1200
};

const pieColors = ['#007aff', '#af52de', '#5856d6', '#00c7be'];

// Section 1: Hero
const NewHeroSection = () => (
  <section className="hs-hero">
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="hs-hero-content"
    >
      <h1 className="hs-hero-title">Smart Vehicle Service <span>Experience</span></h1>
      <p className="hs-hero-subtitle">Track, Book, and Manage Your Car Service in Real-Time</p>
      <div className="hs-hero-buttons">
        <Link to="/register" className="hs-btn-primary">Book Service <i className="ph-bold ph-calendar-plus"></i></Link>
        <Link to="/login" state={{ message: "you have to log in for track your service Status ...", redirectTo: "services" }} className="hs-btn-secondary">
          Track Status <i className="ph-bold ph-crosshair"></i>
        </Link>
      </div>
    </motion.div>
    <div className="hs-hero-gfx">
      <div className="hs-car-container">
        {/* Animated 3D illusion car placeholder */}
        <i className="ph-duotone ph-car hs-car-icon"></i>
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="hs-floating-card card-1"
        >
          <i className="ph-fill ph-check-circle"></i> Service Completed
        </motion.div>
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="hs-floating-card card-2"
        >
          <i className="ph-fill ph-wrench"></i> In Progress...
        </motion.div>
      </div>
    </div>
  </section>
);

// Section 2: Interactive Service Tracker Demo
const ServiceTracker = () => {
  const [activeStep, setActiveStep] = useState(0);

  const trackerSteps = [
    {
      label: 'Booking Confirmed',
      icon: 'ph-check-square-offset',
      desc: 'Your service request has been received and confirmed by our team.'
    },
    {
      label: 'Pickup Scheduled',
      icon: 'ph-car-profile',
      desc: 'Our executive will pick up your vehicle from your location at the scheduled time.'
    },
    {
      label: 'Service in Progress',
      icon: 'ph-wrench',
      desc: 'Our certified technicians are currently working on your vehicle using premium parts.'
    },
    {
      label: 'Quality Check',
      icon: 'ph-flask',
      desc: 'A thorough multi-point inspection is being conducted to ensure everything is perfect.'
    },
    {
      label: 'Delivered',
      icon: 'ph-confetti',
      desc: 'Your vehicle has been serviced and delivered back to you in pristine condition.'
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % trackerSteps.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [trackerSteps.length]);

  return (
    <section className="hs-section hs-tracker-demo">
      <div className="hs-tracker-header">
        <h2 className="hs-section-title">Real-Time Service Tracking <i className="ph-bold ph-radar hs-title-icon"></i></h2>
        <p className="hs-section-subtext">Track every step of your vehicle service with live updates</p>
      </div>

      <div className="hs-tracker-container glass-panel">
        <div className="hs-progress-track">
          {/* Background Line */}
          <div className="hs-progress-line-bg"></div>

          {/* Multi-color Animated Progress */}
          <motion.div
            className="hs-progress-line-fill"
            initial={{ width: '0%' }}
            animate={{ width: `${(activeStep / (trackerSteps.length - 1)) * 100}%` }}
            transition={{ duration: 1, ease: "easeInOut" }}
          ></motion.div>

          {/* Animated Car with Trail and Glow */}
          <motion.div
            className="hs-moving-car"
            animate={{ left: `${(activeStep / (trackerSteps.length - 1)) * 100}%` }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
            {/* Soft Glow Trail */}
            <div className="car-trail-glow"></div>
            
            {/* The SVG Car */}
            <svg className="sleek-car-svg" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 28C15 26 18 25 25 25C32 25 55 24 70 24C85 24 92 27 92 30V34H10V30L15 28Z" fill="url(#carGradient)" />
              <path d="M25 25L30 14C32 10 38 8 45 8H65C72 8 78 12 80 18L85 25" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <circle cx="22" cy="34" r="4" fill="#333" stroke="white" strokeWidth="1" />
              <circle cx="78" cy="34" r="4" fill="#333" stroke="white" strokeWidth="1" />
              <defs>
                <linearGradient id="carGradient" x1="10" y1="34" x2="92" y2="24" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#0fb9b1" />
                  <stop offset="1" stopColor="#4b7bec" />
                </linearGradient>
              </defs>
            </svg>
            
            <div className="car-active-glow"></div>
          </motion.div>

          <div className="hs-tracker-steps-wrapper">
            {trackerSteps.map((step, idx) => (
              <div
                key={idx}
                className={`hs-demo-step ${idx <= activeStep ? 'active' : ''} ${idx === activeStep ? 'current' : ''} ${idx < activeStep ? 'completed' : ''}`}
              >
                {/* Radial Glow behind active step */}
                {idx === activeStep && <div className="step-bg-glow"></div>}

                <div className="hs-step-node">
                  <div className="node-pulse"></div>
                  <div className="node-glass-ring"></div>
                  <i className={`ph-bold ${step.icon}`}></i>
                </div>
                <span className="step-label">{step.label}</span>

              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hs-tracker-cta">
        <p>Login to track your service in real-time</p>
        <Link to="/login" state={{ message: "Please log in to track your service status.", redirectTo: "services" }} className="hs-tracker-btn">
          Track Your Vehicle <i className="ph-bold ph-arrow-right"></i>
        </Link>
      </div>
    </section>
  );
};

// Section 3: Service Cards
const ServiceCards = () => (
  <section id="services" className="hs-section hs-services">
    <h2 className="hs-section-title">Premium Services <i className="ph-bold ph-wrench hs-title-icon"></i></h2>
    <div className="hs-services-grid">
      {services.map((svc) => (
        <motion.div
          whileHover={{ y: -10, scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
          key={svc.id}
          className="hs-service-card"
        >
          <div className="hs-service-icon" style={{ color: svc.color }}>
            <i className={`ph-duotone ${svc.icon}`}></i>
          </div>
          <h3>{svc.name}</h3>
          <p className="hs-service-desc">{svc.desc}</p>
          {svc.name === 'Periodic Service' ? (
            <Link to="/periodic-service" className="hs-view-btn">View Details <i className="ph-bold ph-arrow-right"></i></Link>
          ) : svc.name === 'Oil Change' ? (
            <Link to="/oil-change-service" className="hs-view-btn">View Details <i className="ph-bold ph-arrow-right"></i></Link>
          ) : svc.name === 'AC Repair' ? (
            <Link to="/ac-repair-service" className="hs-view-btn">View Details <i className="ph-bold ph-arrow-right"></i></Link>
          ) : svc.name === 'Brake Repair' ? (
            <Link to="/brake-repair-service" className="hs-view-btn">View Details <i className="ph-bold ph-arrow-right"></i></Link>
          ) : svc.name === 'Battery Replacement' ? (
            <Link to="/battery-service" className="hs-view-btn">View Details <i className="ph-bold ph-arrow-right"></i></Link>
          ) : svc.name === 'Car Wash' ? (
            <Link to="/car-wash-service" className="hs-view-btn">View Details <i className="ph-bold ph-arrow-right"></i></Link>
          ) : svc.name === 'Wheel Alignment & Balancing' ? (
            <Link to="/services/wheel-alignment" className="hs-view-btn">View Details <i className="ph-bold ph-arrow-right"></i></Link>
          ) : (
            <button className="hs-view-btn">View Details <i className="ph-bold ph-arrow-right"></i></button>
          )}
        </motion.div>
      ))}
    </div>
  </section>
);

// Section 4: Cost Estimator
const CostEstimator = () => {
  const [cost, setCost] = useState(0);
  const [category, setCategory] = useState('');
  const [model, setModel] = useState('');
  const [serviceType, setServiceType] = useState('');

  useEffect(() => {
    if (category && model && serviceType) {
      const basePrice = serviceBasePrices[serviceType] || 1000;
      const multiplier = carCategories[category]?.multiplier || 1.0;
      setCost(Math.round(basePrice * multiplier));
    } else {
      setCost(0);
    }
  }, [category, model, serviceType]);

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setModel(''); // Reset model when category changes
  };

  return (
    <section className="hs-section hs-estimator">
      <div className="hs-estimator-container">
        <div className="hs-est-header">
          <h2 className="hs-section-title">Service Cost Estimator <i className="ph-fill ph-coins hs-gold-coin"></i></h2>
          <p className="hs-section-subtext">Get an instant estimate for your vehicle service</p>
        </div>

        <div className="hs-estimator-grid">
          <div className="hs-est-form glass-panel">
            <div className="hs-category-pills">
              {Object.keys(carCategories).map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`hs-pill ${category === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="hs-est-controls">
              <div className="hs-input-group">
                <label>Select Car Model</label>
                <select
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  className="hs-input"
                  disabled={!category}
                >
                  <option value="">{category ? `Select ${category}...` : 'Select Category First'}</option>
                  {category && carCategories[category].models.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="hs-input-group">
                <label>Select Service</label>
                <select
                  value={serviceType}
                  onChange={e => setServiceType(e.target.value)}
                  className="hs-input"
                >
                  <option value="">Select Service...</option>
                  {services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="hs-est-result glass-panel">
            <div className="result-content">
              <span className="hs-est-title">Estimated Service Price</span>
              <motion.div
                key={cost}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="hs-cost-display"
              >
                <span className="currency">₹</span>
                <span className="amount">{cost.toLocaleString('en-IN')}</span>
              </motion.div>
              <p className="price-note">*Final price may vary based on exact vehicle condition.</p>

              <Link to="/register" className="hs-est-book-btn">
                Book This Service <i className="ph-bold ph-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Section 5: Analytics
const AnalyticsSection = () => (
  <section className="hs-section hs-analytics">
    <div className="hs-analytics-header">
      <h2 className="hs-section-title">
        Performance & Analytics
        <i className="ph-bold ph-trend-up hs-title-icon"></i>
      </h2>
      <p className="hs-section-subtext">Real-time data at your fingertips</p>
    </div>

    {/* Top Stats Cards */}
    <div className="hs-stats-grid">
      {analyticsData.stats.map((stat, idx) => (
        <motion.div
          key={idx}
          whileHover={{ y: -5, boxShadow: `0 10px 40px ${stat.glow}` }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.1 }}
          className="hs-stat-card glass-panel"
        >
          <div className="hs-stat-icon" style={{ background: `${stat.color}22`, color: stat.color }}>
            <i className={`ph-bold ${stat.icon}`}></i>
          </div>
          <div className="hs-stat-info">
            <p>{stat.label}</p>
            <motion.h3
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              {stat.value}
            </motion.h3>
          </div>
        </motion.div>
      ))}
    </div>

    <div className="hs-charts-grid">
      {/* Monthly Services - Bar Chart */}
      <div className="hs-chart-card glass-panel">
        <div className="hs-chart-header">
          <h3>Monthly Services</h3>
          <i className="ph-bold ph-calendar"></i>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData.monthly} margin={{ top: 30, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#007aff" stopOpacity={1} />
                <stop offset="100%" stopColor="#af52de" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" stroke="#8892b0" axisLine={false} tickLine={false} />
            <RechartsTooltip
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ backgroundColor: '#112240', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
            />
            <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={35}>
              <LabelList dataKey="count" position="top" fill="#ffffff" fontSize={12} offset={10} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Service Distribution - Donut Chart */}
      <div className="hs-chart-card glass-panel">
        <div className="hs-chart-header">
          <h3>Service Distribution</h3>
          <i className="ph-bold ph-chart-pie"></i>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={analyticsData.distribution}
              dataKey="value"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              stroke="none"
              animationBegin={200}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {analyticsData.distribution.map((_, index) => (
                <Cell key={`cell-${index}`} fill={neonPalette[index % neonPalette.length]} />
              ))}
            </Pie>
            <RechartsTooltip
              contentStyle={{ backgroundColor: '#112240', border: 'none', borderRadius: '12px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Customer Growth - Area Chart */}
      <div className="hs-chart-card glass-panel chart-full">
        <div className="hs-chart-header">
          <h3>Customer Growth</h3>
          <i className="ph-bold ph-users-three"></i>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={analyticsData.growth} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00c7be" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00c7be" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" stroke="#8892b0" axisLine={false} tickLine={false} />
            <YAxis stroke="#8892b0" axisLine={false} tickLine={false} />
            <RechartsTooltip
              contentStyle={{ backgroundColor: '#112240', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
            />
            <Area
              type="monotone"
              dataKey="users"
              stroke="#00c7be"
              strokeWidth={4}
              fill="url(#growthGradient)"
              dot={{ r: 6, fill: '#00c7be', strokeWidth: 3, stroke: '#fff' }}
              activeDot={{ r: 8, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>

  </section>
);

// Section 6: Before/After Slider
const BeforeAfterSlider = () => {
  const [sliderPos, setSliderPos] = useState(50);

  useEffect(() => {
    // Subtle demo wiggle on load
    const timer = setTimeout(() => {
      setSliderPos(60);
      setTimeout(() => setSliderPos(50), 800);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="hs-section hs-slider-section">
      <h2 className="hs-section-title">Visual Transformation <i className="ph-bold ph-sparkle hs-title-icon"></i></h2>
      <p className="hs-section-subtext">Experience visible transformation with our expert services</p>

      <div className="hs-slider-outer">
        <div className="hs-slider-container">
          {/* Base Image (Clean) */}
          <div
            className="hs-image-full after"
            style={{ backgroundImage: "url('/Clean_Car.jpeg')" }}
          >
            <div className="hs-slider-label after">After</div>
          </div>

          {/* Top Image (Dirty) - Clipped */}
          <div
            className="hs-image-full before"
            style={{
              backgroundImage: "url('/Dirty_Car.jpeg')",
              clipPath: `inset(0 ${100 - sliderPos}% 0 0)`
            }}
          >
            <div className="hs-slider-label before">Before</div>
          </div>

          <input
            type="range" min="0" max="100" value={sliderPos}
            onChange={(e) => setSliderPos(e.target.value)}
            className="hs-slider-input"
          />

          <div className="hs-slider-line" style={{ left: `${sliderPos}%` }}>
            <div className="hs-slider-handle">
              <i className="ph-bold ph-arrows-left-right"></i>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

// Section 7: Features
const FeaturesSection = () => {
  const features = [
    { title: 'Free Pickup & Drop', icon: 'ph-truck', color: '#007aff' },
    { title: 'Certified Mechanics', icon: 'ph-certificate', color: '#af52de' },
    { title: 'Affordable Pricing', icon: 'ph-tag', color: '#007aff' },
    { title: 'Real-time Tracking', icon: 'ph-broadcast', color: '#af52de' }
  ];
  return (
    <section className="hs-section hs-features">
      <h2 className="hs-section-title">Why Choose Us <i className="ph-bold ph-shield-check hs-title-icon"></i></h2>
      <div className="hs-features-grid">
        {features.map((f, i) => (
          <motion.div whileHover={{ scale: 1.05 }} key={i} className="hs-feature-card glass-panel">
            <i
              className={`ph-bold ${f.icon}`}
              style={{
                color: f.color,
                filter: `drop-shadow(0 0 10px ${f.color}66)`
              }}
            ></i>
            <h3>{f.title}</h3>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// Helper for animated counts
const CountUp = ({ end, duration = 2, suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [end, duration]);

  return <>{count.toLocaleString()}{suffix}</>;
};

// Section 8: Reviews
const ReviewsAndTrust = () => {
  const testimonials = [
    {
      name: 'Rahul Mehta',
      role: 'Sedan Owner',
      city: 'Ahmedabad',
      rating: 4,
      text: '"The transparency is unmatched. I could track my car alignment live. Professional and trustworthy service every time!"'
    },
    {
      name: 'Priya Sharma',
      role: 'Hatchback Owner',
      city: 'Mumbai',
      rating: 5,
      text: '"Excellent doorstep pickup and drop. The cost estimator was spot on. Highly recommend for any hatchback owner looking for quality."'
    },
    {
      name: 'Arjun Patel',
      role: 'SUV Owner',
      city: 'Vadodara',
      rating: 3.5,
      text: '"Best SUV service center in town. The team is certified and the turnaround time was faster than expected. Very satisfied!"'
    },
    {
      name: 'Kunal Shah',
      role: 'Sedan Owner',
      city: 'Ahmedabad',
      rating: 4.5,
      text: '"Overall service was very good and timely. Pickup was smooth, just a small delay in status updates, but everything else was perfect."'
    },
    {
      name: 'Neha Desai',
      role: 'Luxury Car Owner',
      city: 'Ahmedabad',
      rating: 3.9,
      text: '"Impressed with the professionalism and quality of work. My car felt like new after servicing. Definitely using this again."'
    }
  ];

  const [idx, setIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setIdx((prev) => (prev + 1) % testimonials.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isPaused, testimonials.length]);

  return (
    <section className="hs-section hs-reviews-trust">
      <div className="hs-trust-metrics">
        <div className="hs-metric">
          <i className="ph-bold ph-users-three hs-metric-icon"></i>
          <h3 className="glow-text"><CountUp end={10000} suffix="+" /></h3>
          <p>Happy Customers</p>
        </div>
        <div className="hs-metric">
          <i className="ph-bold ph-wrench hs-metric-icon"></i>
          <h3 className="glow-text"><CountUp end={15000} suffix="+" /></h3>
          <p>Services Completed</p>
        </div>
        <div className="hs-metric">
          <i className="ph-bold ph-map-pin hs-metric-icon"></i>
          <h3 className="glow-text"><CountUp end={15} suffix="+" /></h3>
          <p>Service Centers</p>
        </div>
        <div className="hs-metric">
          <i className="ph-bold ph-smiley-wink hs-metric-icon"></i>
          <h3 className="glow-text"><CountUp end={90} suffix="%" /></h3>
          <p>Customer Satisfaction</p>
        </div>
      </div>

      <div
        className="hs-reviews-container"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="hs-reviews-carousel glass-panel"
          >
            <div className="hs-stars">
              {[1, 2, 3, 4, 5].map((star) => {
                const rating = testimonials[idx].rating;
                if (rating >= star) return <i key={star} className="ph-fill ph-star"></i>;
                if (rating > star - 1) return <i key={star} className="ph-fill ph-star-half"></i>;
                return <i key={star} className="ph-bold ph-star"></i>;
              })}
            </div>


            <p className="hs-review-text">{testimonials[idx].text}</p>

            <div className="hs-reviewer">
              <strong>{testimonials[idx].name}</strong>
              <span>{testimonials[idx].role} | {testimonials[idx].city}</span>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="hs-slider-dots">
          {testimonials.map((_, i) => (
            <div
              key={i}
              className={`hs-dot ${i === idx ? 'active' : ''}`}
              onClick={() => setIdx(i)}
            />
          ))}
        </div>
      </div>

    </section>
  );
};

// Section 10: User Roles
const UserRolesAndCTA = () => {
  const [activeTab, setActiveTab] = useState('customer');
  return (
    <section className="hs-section hs-roles-cta">
      <h2 className="hs-section-title">Seamless For Everyone</h2>
      <div className="hs-roles-tabs">
        <button className={`hs-tab ${activeTab === 'customer' ? 'active' : ''}`} onClick={() => setActiveTab('customer')}>Customer</button>
        <button className={`hs-tab ${activeTab === 'mechanic' ? 'active' : ''}`} onClick={() => setActiveTab('mechanic')}>Mechanic</button>
        <button className={`hs-tab ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>Admin</button>
      </div>
      <div className="hs-role-content-wrapper">
        <AnimatePresence mode="wait">
          {activeTab === 'customer' && (
            <motion.div
              key="customer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="hs-role-card glass-panel"
            >
              <div className="hs-role-header">
                <i className="ph-bold ph-user hs-role-icon"></i>
                <h3>Customer Access</h3>
              </div>
              <p className="hs-role-tagline">Complete control over your vehicle's health.</p>
              <ul className="hs-role-features">
                <li><i className="ph-bold ph-check-circle"></i> Book and manage services</li>
                <li><i className="ph-bold ph-check-circle"></i> Track service status</li>
                <li><i className="ph-bold ph-check-circle"></i> Transparent pricing</li>
              </ul>
            </motion.div>
          )}

          {activeTab === 'mechanic' && (
            <motion.div
              key="mechanic"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="hs-role-card glass-panel"
            >
              <div className="hs-role-header">
                <i className="ph-bold ph-wrench hs-role-icon"></i>
                <h3>Mechanic Portal</h3>
              </div>
              <p className="hs-role-tagline">Streamlined tools for efficient repairs.</p>
              <ul className="hs-role-features">
                <li><i className="ph-bold ph-check-circle"></i> View assigned tasks</li>
                <li><i className="ph-bold ph-check-circle"></i> Update service progress</li>
                <li><i className="ph-bold ph-check-circle"></i> Manage workload</li>
              </ul>
            </motion.div>
          )}

          {activeTab === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="hs-role-card glass-panel"
            >
              <div className="hs-role-header">
                <i className="ph-bold ph-shield-star hs-role-icon"></i>
                <h3>Administrator Dashboard</h3>
              </div>
              <p className="hs-role-tagline">Complete oversight of the service center.</p>
              <ul className="hs-role-features">
                <li><i className="ph-bold ph-check-circle"></i> Monitor all services</li>
                <li><i className="ph-bold ph-check-circle"></i> View analytics</li>
                <li><i className="ph-bold ph-check-circle"></i> Manage users and inventory</li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

// Section 11: Mechanic CTA
const MechanicCTASection = () => {
  const benefits = [
    { title: 'Stable Earnings', icon: 'ph-currency-circle-dollar', color: '#00c7be' },
    { title: 'Flexible Work', icon: 'ph-clock-user', color: '#af52de' },
    { title: 'Smart Dashboard', icon: 'ph-monitor', color: '#007aff' },
    { title: 'Career Growth', icon: 'ph-trend-up', color: '#ffcc00' }
  ];

  return (
    <section className="hs-section hs-mechanic-cta">
      <div className="hs-mechanic-header">
        <h2 className="hs-section-title">Join as a Professional Mechanic <i className="ph-bold ph-wrench hs-title-icon"></i></h2>
        <p className="hs-section-subtext">Grow your career by working with a smart vehicle service platform</p>
      </div>

      <div className="hs-mechanic-content glass-panel">
        <div className="hs-mechanic-benefits">
          <h3 className="hs-mechanic-subtitle">
            Why join us as Mechanic <i className="ph-bold ph-wrench hs-title-icon" style={{ fontSize: '1.6rem', marginLeft: '10px' }}></i>
          </h3>
          <div className="hs-mechanic-grid">
            {benefits.map((b, i) => (
              <motion.div whileHover={{ y: -5, scale: 1.05 }} key={i} className="hs-mechanic-card">
                <i className={`ph-bold ${b.icon}`} style={{ color: b.color, filter: `drop-shadow(0 0 10px ${b.color}66)` }}></i>
                <h4>{b.title}</h4>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="hs-mechanic-info">
          <div className="hs-mechanic-list-box">
            <h3 className="hs-mechanic-subtitle">What You'll Do</h3>
            <ul className="hs-role-features">
              <li><i className="ph-bold ph-check-circle" style={{ color: '#00c7be' }}></i> Accept service requests</li>
              <li><i className="ph-bold ph-check-circle" style={{ color: '#00c7be' }}></i> Update progress</li>
              <li><i className="ph-bold ph-check-circle" style={{ color: '#00c7be' }}></i> Perform maintenance</li>
              <li><i className="ph-bold ph-check-circle" style={{ color: '#00c7be' }}></i> Ensure quality service</li>
            </ul>
          </div>

          <div className="hs-mechanic-list-box">
            <h3 className="hs-mechanic-subtitle">Requirements</h3>
            <ul className="hs-role-features">
              <li><i className="ph-bold ph-check-circle" style={{ color: '#af52de' }}></i> Mechanical knowledge</li>
              <li><i className="ph-bold ph-check-circle" style={{ color: '#af52de' }}></i> Service experience</li>
              <li><i className="ph-bold ph-check-circle" style={{ color: '#af52de' }}></i> Basic verification</li>
              <li><i className="ph-bold ph-check-circle" style={{ color: '#af52de' }}></i> Quality commitment</li>
            </ul>
          </div>
        </div>

        <div className="hs-mechanic-action">
          <p className="hs-trust-footer-text">Trusted by skilled mechanics across multiple service centers</p>
          <Link to="/register" state={{ role: 'Mechanic' }} className="hs-btn-primary hs-mechanic-btn">Register as Mechanic</Link>
        </div>
      </div>
    </section>
  );
};

// Section 12: Footer
const FooterSection = () => (
  <footer id="contact" className="hs-footer">
    <div className="hs-footer-content">
      {/* Column 1: Brand */}
      <div className="hs-footer-brand">
        <h3>Vehicle Care</h3>
        <p>Smart vehicle service platform for seamless management and real-time tracking</p>
        <div className="hs-socials">
          <a href="#" className="social-instagram"><i className="ph-fill ph-instagram-logo"></i></a>
          <a href="#" className="social-linkedin"><i className="ph-fill ph-linkedin-logo"></i></a>
          <a href="#" className="social-twitter"><i className="ph-fill ph-twitter-logo"></i></a>
        </div>
      </div>

      {/* Column 2: Quick Links */}
      <div className="hs-footer-links">
        <h4>Quick Links</h4>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/#services">Services</a></li>
          <li><a href="/about">About Us</a></li>
          <li><a href="/contact">Contact</a></li>
          <li><a href="/login">Log In</a></li>
          <li><a href="/register">Register</a></li>
        </ul>
      </div>

      {/* Column 3: Services */}
      <div className="hs-footer-links">
        <h4>Services</h4>
        <ul>
          <li><a href="/periodic-service">Periodic Service</a></li>
          <li><a href="/oil-change-service">Oil Change</a></li>
          <li><a href="/ac-repair-service">AC Repair</a></li>
          <li><a href="/brake-repair-service">Brake Repair</a></li>
          <li><a href="/battery-service">Battery Replacement</a></li>
          <li><a href="/car-wash-service">Car Wash</a></li>
          <li><a href="/services/wheel-alignment">Wheel Alignment</a></li>
        </ul>
      </div>

      {/* Column 4: Contact Info */}
      <div className="hs-footer-contact">
        <h4>Contact Info</h4>
        <ul>
          <li><i className="ph-fill ph-map-pin"></i> Ahmedabad, India</li>
          <li><i className="ph-fill ph-envelope"></i> vehiclecare23@gmail.com</li>
          <li><i className="ph-fill ph-phone"></i> +91 88664 28966</li>
        </ul>
      </div>
    </div>

    {/* Bottom Bar */}
    <div className="hs-footer-bottom">
      <p>&copy; 2026 Vehicle Care. All rights reserved.</p>
      <div className="hs-footer-legal">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
      </div>
    </div>
  </footer>
);

const HomeSections = () => {
  return (
    <div className="hs-container">
      <NewHeroSection />
      <ServiceTracker />
      <ServiceCards />
      <CostEstimator />
      <AnalyticsSection />
      <BeforeAfterSlider />
      <FeaturesSection />
      <ReviewsAndTrust />
      <UserRolesAndCTA />
      <MechanicCTASection />
      <FooterSection />

    </div>
  );
};

export default HomeSections;
