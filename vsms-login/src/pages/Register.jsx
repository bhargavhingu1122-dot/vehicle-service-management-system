import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import './Register.css';

const Register = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [isDev, setIsDev] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: location.state?.role || 'Customer'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const setRole = (role) => {
        setFormData(prev => ({
            ...prev,
            role: role
        }));
    };

    const handleSendVerification = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!formData.email || !formData.fullName || !formData.password) {
            alert("Please fill all fields first");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/send-registration-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email })
            });
            const data = await response.json();
            if (response.ok) {
                if (data.isDev) {
                    setIsDev(true);
                    alert('Developer Tip: ' + data.message);
                }
                setIsVerifying(true);
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('Error connecting to server');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyAndRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // 1. Verify OTP first
            const verifyRes = await fetch('http://localhost:5000/api/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, code: otpCode })
            });

            if (!verifyRes.ok) {
                const verifyData = await verifyRes.json();
                alert(verifyData.message || 'Invalid verification code');
                setIsLoading(false);
                return;
            }

            // 2. Proceed to Register
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role
                })
            });

            const data = await response.json();

            if (response.ok) {
                setIsLoading(false);
                setIsSuccess(true);
                // Revert state back after fake success redirect delay
                setTimeout(() => {
                    setIsSuccess(false);
                    navigate('/login', { state: { message: 'Registration successful! Please login to continue.' } });
                }, 2000);
            } else {
                setIsLoading(false);
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            setIsLoading(false);
            alert('Could not connect to the server. Please ensure the backend is running.');
            console.error('Registration error:', error);
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            try {
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const googleUser = await userInfoRes.json();

                const response = await fetch('http://localhost:5000/api/google-auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fullName: googleUser.name,
                        email: googleUser.email,
                        googleId: googleUser.sub,
                        role: formData.role
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    setIsLoading(false);
                    setIsSuccess(true);
                    setTimeout(() => {
                        setIsSuccess(false);
                        navigate('/login', { state: { message: 'Registration successful! Please login to continue.' } });
                    }, 2000);
                } else {
                    setIsLoading(false);
                    alert(data.message || 'Google Auth failed');
                }
            } catch (error) {
                setIsLoading(false);
                alert('Connection error');
            }
        },
        onError: () => {
            setIsLoading(false);
            alert('Google Register Failed');
        }
    });

    const handleGoogleRegister = () => {
        setIsLoading(true);
        googleLogin();
    };

    return (
        <div className="register-page">
            <Link to="/" className="register-back-btn">
                <i className="ph-bold ph-arrow-left"></i> Home
            </Link>

            <div className="register-card">

                <div className="register-brand-logo">
                    <img src="/logo.png" alt="Logo" className="nav-brand-img" />
                    Vehicle Care
                </div>


                <div className="register-header">
                    <h2>Create Account</h2>
                    <p>Join as <strong>{formData.role}</strong> and experience smart vehicle management.</p>
                </div>

                <form onSubmit={handleVerifyAndRegister}>

                    <div className="register-input-group">
                        <input
                            type="text"
                            name="fullName"
                            placeholder="Full Name"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                        <i className="ph-fill ph-user register-input-icon"></i>
                    </div>

                    <div className="register-input-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter an Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            autoComplete="email"
                        />
                        <i className="ph-fill ph-envelope register-input-icon"></i>
                    </div>

                    <div className="register-input-group">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Enter a Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            autoComplete="new-password"
                        />
                        <i className="ph-fill ph-lock register-input-icon"></i>
                        <button
                            type="button"
                            className="register-password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            <i className={`ph ${showPassword ? 'ph-eye-slash' : 'ph-eye'}`}></i>
                        </button>
                    </div>

                    <div className="register-input-group">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                        <i className="ph-fill ph-shield-check register-input-icon"></i>
                        <button
                            type="button"
                            className="register-password-toggle"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            <i className={`ph ${showConfirmPassword ? 'ph-eye-slash' : 'ph-eye'}`}></i>
                        </button>
                    </div>

                    <div className="register-form-options">
                        <label className="register-custom-checkbox">
                            <input type="checkbox" required />
                            <span className="register-checkmark"></span>
                            I agree to the Terms & Conditions
                        </label>
                    </div>

                    {!isVerifying ? (
                        <button
                            type="button"
                            className="register-btn-primary"
                            onClick={handleSendVerification}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Sending Code...' : 'Verify Email to Register'}
                        </button>
                    ) : (
                        <div className="verification-section">
                            <p className="verification-note">
                                <i className="ph-bold ph-info"></i>
                                We've sent a 4-digit code to <strong>{formData.email}</strong>.
                            </p>
                            <div className="register-input-group verification-group">
                                <input
                                    type="text"
                                    placeholder="----"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value)}
                                    maxLength="4"
                                    required
                                    className="verification-otp-input"
                                />
                                <i className="ph-fill ph-shield-check register-input-icon"></i>
                            </div>
                            <button
                                type="submit"
                                className={`register-btn-primary ${isSuccess ? 'register-success' : ''}`}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <><i className="ph ph-spinner-gap spin" style={{ fontSize: '1.2rem' }}></i> Verifying...</>
                                ) : isSuccess ? (
                                    <><i className="ph-bold ph-check"></i> Registration Successful!</>
                                ) : (
                                    <>Complete Registration <i className="ph-bold ph-arrow-right"></i></>
                                )}
                            </button>
                            <div className="verification-actions">
                                <button type="button" className="register-btn-link" onClick={handleSendVerification} disabled={isLoading}>
                                    {isLoading ? 'Sending...' : 'Resend Code'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>

                <div className="register-divider">OR REGISTER WITH</div>

                <div className="register-social-logins">
                    <button className="register-btn-social" type="button" onClick={handleGoogleRegister} disabled={isLoading}>
                        <i className="ph-fill ph-google-logo" style={{ fontSize: '1.2rem' }}></i> Continue with Google
                    </button>
                </div>

                <div className="register-login-link">
                    Already have an account? <Link to="/login">Login here</Link>
                </div>

            </div>
        </div>
    );
};

export default Register;
