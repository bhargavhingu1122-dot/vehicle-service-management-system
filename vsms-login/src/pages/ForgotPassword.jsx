import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './ForgotPassword.css';
import API from '../services/api';

const ForgotPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const passedEmail = location.state?.email || '';

    const [step, setStep] = useState(1); // 1: Email, 2: OTP
    const [email, setEmail] = useState(passedEmail);
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOTP = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setIsLoading(true);
        try {
            const { data } = await API.post('/forgot-password', { email });
            alert(data.message || 'Reset code sent to your email.');
            setStep(2);
        } catch (error) {
            alert(error.message || 'Error connecting to server');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { data } = await API.post('/verify-otp', { email, code: otp });
            // Navigate to reset page with email and code as state
            navigate('/reset-password', { state: { email, code: otp } });
        } catch (error) {
            alert(error.message || 'Invalid or expired reset code');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="forgot-password-page">
            <Link to="/login" className="back-btn">
                <i className="ph-bold ph-arrow-left"></i> Back to Login
            </Link>

            <div className="forgot-password-card">
                <div className="brand-logo">
                    <img src="/logo.png" alt="Logo" className="nav-logo-img" />
                    Vehicle Care
                </div>

                <div className="header">
                    <h2>{step === 1 ? 'Forgot Password?' : 'Enter Reset Code'}</h2>
                    <p>
                        {step === 1
                            ? "Enter your registered email and we'll send you a 4-digit code to reset your password."
                            : `We've sent a 4-digit reset code to ${email}. Please enter it below.`
                        }
                    </p>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleSendOTP}>
                        <div className="input-group">
                            <input
                                type="email"
                                placeholder="Enter an Email"
                                value={email}
                                onChange={(e) => !passedEmail && setEmail(e.target.value)}
                                required
                                readOnly={!!passedEmail}
                                className={passedEmail ? 'readonly-input' : ''}
                                autoComplete="email"
                            />
                            <i className="ph ph-envelope-simple input-icon"></i>
                        </div>
                        {passedEmail && (
                            <p className="lock-notice">
                                <i className="ph ph-lock"></i> Locked to login account.
                                <Link to="/login" className="switch-link"> Change?</Link>
                            </p>
                        )}
                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {isLoading ? 'Sending Code...' : 'Send Reset Code'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP}>
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="4-Digit Code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength="4"
                                required
                                className="otp-input"
                            />
                            <i className="ph ph-shield-check input-icon"></i>
                        </div>
                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {isLoading ? 'Verifying...' : 'Verify Code'}
                        </button>
                        <div className="resend-container">
                            <button type="button" className="btn-link" onClick={handleSendOTP} disabled={isLoading}>
                                {isLoading ? 'Sending...' : 'Resend Code'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
