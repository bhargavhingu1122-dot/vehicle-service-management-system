import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Check if the user is actually an Admin
                if (data.user.role !== 'Admin') {
                    setIsLoading(false);
                    alert("Access Denied: You do not have administrative privileges.");
                    return;
                }

                setIsLoading(false);
                setIsSuccess(true);

                // Save session under ONLY the admin-specific key
                // Never write to the shared 'user' key to prevent overwriting other active panel sessions
                localStorage.setItem('admin_user', JSON.stringify(data.user));

                setTimeout(() => {
                    navigate('/admin-dashboard');
                }, 1500);
            } else {
                setIsLoading(false);
                alert(data.message || 'Login failed');
            }
        } catch (error) {
            setIsLoading(false);
            alert('Could not connect to the server. Please ensure the backend is running.');
            console.error('Admin Login error:', error);
        }
    };

    return (
        <div className="admin-login-page">
            <Link to="/" className="admin-back-btn">
                <i className="ph-bold ph-arrow-left"></i> Home
            </Link>

            <div className="admin-login-card">
                <div className="admin-brand-logo">
                    <i className="ph-fill ph-shield-checkered"></i>
                    Admin Portal
                </div>

                <div className="admin-header">
                    <h2>Secure Access</h2>
                    <p>Enter administrative credentials to access the management console.</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="admin-input-group">
                        <input
                            type="email"
                            placeholder="Enter an Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                        <i className="ph ph-envelope-simple admin-input-icon"></i>
                    </div>

                    <div className="admin-input-group">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter a Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                        <i className="ph ph-lock-key admin-input-icon"></i>
                        <button
                            type="button"
                            className="admin-password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            <i className={`ph ${showPassword ? 'ph-eye-slash' : 'ph-eye'}`}></i>
                        </button>
                    </div>

                    <button
                        type="submit"
                        className={`admin-btn-primary ${isSuccess ? 'admin-success' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <><i className="ph ph-spinner-gap spin-anim"></i> Authenticating...</>
                        ) : isSuccess ? (
                            <><i className="ph-bold ph-check"></i> Authorized</>
                        ) : (
                            <>Login to Console <i className="ph-bold ph-arrow-right"></i></>
                        )}
                    </button>
                </form>

                <div className="admin-footer-text">
                    This is a protected administrative area. Authorized access only.
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
