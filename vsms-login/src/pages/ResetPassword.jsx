import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './ResetPassword.css';
import API from '../services/api';

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { email, code } = location.state || {};

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!email || !code) {
        return (
            <div className="reset-password-page">
                <div className="reset-password-card">
                    <i className="ph ph-warning-circle" style={{ fontSize: '3rem', color: 'var(--accent-red)', marginBottom: '20px' }}></i>
                    <h3>Invalid Session</h3>
                    <p style={{ marginBottom: '25px', opacity: 0.8 }}>Please start the reset process again to ensure your security.</p>
                    <Link to="/forgot-password" title="Forgot Password Page" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Go Back</Link>
                </div>
            </div>
        );
    }

    const handleReset = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            await API.post('/reset-password', { email, code, newPassword });
            setIsSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            alert(error.message || 'Error connecting to server');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="reset-password-page">
            <div className="reset-password-card">
                <div className="brand-logo">
                    <img src="/logo.png" alt="Logo" className="nav-brand-img" />
                    Vehicle Care
                </div>

                <div className="header">
                    <h2>New Password</h2>
                    <p>Create a strong password for <strong>{email}</strong></p>
                </div>

                {isSuccess ? (
                    <div className="success-message">
                        <i className="ph-bold ph-check-circle"></i>
                        <h3>Password Changed!</h3>
                        <p>Redirecting you to login page...</p>
                    </div>
                ) : (
                    <form onSubmit={handleReset}>
                        <div className="input-group">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter a Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                            />
                            <i className="ph ph-lock-key input-icon"></i>
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <i className={`ph ${showPassword ? 'ph-eye-slash' : 'ph-eye'}`}></i>
                            </button>
                        </div>

                        <div className="input-group">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirm Your Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                            />
                            <i className="ph ph-shield-check input-icon"></i>
                        </div>

                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {isLoading ? 'Updating...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
