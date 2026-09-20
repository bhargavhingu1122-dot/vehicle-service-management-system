import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import './Login.css';

const Login = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [detectedRole, setDetectedRole] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const infoMessage = location.state?.message;

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim(),
                    password: password.trim()
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Write ONLY to the role-specific key — never to the shared 'user' key
                // This prevents session conflicts when multiple panels are open simultaneously
                if (data.user.role === 'Customer') {
                    localStorage.setItem('customer_user', JSON.stringify(data.user));
                } else if (data.user.role === 'Mechanic') {
                    localStorage.setItem('mechanic_user', JSON.stringify(data.user));
                } else if (data.user.role === 'Admin') {
                    localStorage.setItem('admin_user', JSON.stringify(data.user));
                }

                setIsLoading(false);
                setIsSuccess(true);
                setDetectedRole(data.user.role);

                setTimeout(() => {
                    setIsSuccess(false);
                    setDetectedRole(null);
                    
                    if (data.user.role === 'Customer') {
                        if (location.state?.redirectTo) {
                            localStorage.setItem('customer_section', location.state.redirectTo);
                        }
                        navigate('/customer-dashboard');
                    } else if (data.user.role === 'Mechanic') {
                        navigate('/mechanic-dashboard');
                    } else if (data.user.role === 'Admin') {
                        navigate('/admin-dashboard');
                    }
                }, 2000);
            } else {
                setIsLoading(false);
                alert(data.message || 'Login failed');
            }
        } catch (error) {
            setIsLoading(false);
            alert('Could not connect to the server. Please ensure the backend is running.');
            console.error('Login error:', error);
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            try {
                // Fetch user info from Google's userInfo endpoint using the access token
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const googleUser = await userInfoRes.json();

                // Send Google user data to backend
                const response = await fetch('http://localhost:5000/api/google-auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fullName: googleUser.name,
                        email: googleUser.email,
                        googleId: googleUser.sub
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    // Write ONLY to the role-specific key — never to the shared 'user' key
                    if (data.user.role === 'Admin') {
                        localStorage.setItem('admin_user', JSON.stringify(data.user));
                    } else if (data.user.role === 'Mechanic') {
                        localStorage.setItem('mechanic_user', JSON.stringify(data.user));
                    } else {
                        localStorage.setItem('customer_user', JSON.stringify(data.user));
                    }

                    setIsLoading(false);
                    setIsSuccess(true);
                    setDetectedRole(data.user.role);

                    setTimeout(() => {
                        setIsSuccess(false);
                        setDetectedRole(null);

                        if (data.user.role === 'Admin') {
                            navigate('/admin-dashboard');
                        } else if (data.user.role === 'Mechanic') {
                            navigate('/mechanic-dashboard');
                        } else {
                            if (location.state?.redirectTo) {
                                localStorage.setItem('customer_section', location.state.redirectTo);
                            }
                            navigate('/customer-dashboard');
                        }
                    }, 2000);
                } else {
                    setIsLoading(false);
                    alert(data.message || 'Google Auth failed');
                }
            } catch (error) {
                setIsLoading(false);
                alert('Connection error with Google services');
                console.error(error);
            }
        },
        onError: () => {
            setIsLoading(false);
            alert('Google Login Failed');
        }
    });

    const handleGoogleLogin = () => {
        setIsLoading(true);
        googleLogin();
    };

    return (
        <div className="login-page">
            <Link to="/" className="login-back-btn">
                <i className="ph-bold ph-arrow-left"></i> Home
            </Link>

            <div className="login-card">

                <div className="login-brand-logo">
                    <img src="/logo.png" alt="Logo" className="nav-brand-img" />
                    Vehicle Care
                </div>

                <div className="login-header">
                    <h2>Welcome Back</h2>
                    <p>
                        {isSuccess && detectedRole ? (
                            <>Logged in as <strong>{detectedRole}</strong></>
                        ) : (
                            "Sign in to manage your vehicles and service schedules."
                        )}
                    </p>
                </div>

                {infoMessage && (
                    <div className="login-info-message">
                        <i className="ph-fill ph-info"></i>
                        <span>{infoMessage}</span>
                    </div>
                )}

                <form onSubmit={handleLogin}>

                    <div className="login-input-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter an Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                        <i className="ph-fill ph-envelope login-input-icon"></i>
                    </div>

                    <div className="login-input-group">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Enter a Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                        <i className="ph-fill ph-lock login-input-icon"></i>
                        <button
                            type="button"
                            className="login-password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            <i className={`ph ${showPassword ? 'ph-eye-slash' : 'ph-eye'}`}></i>
                        </button>
                        <Link
                            to="/forgot-password"
                            state={{ email }}
                            title="reset-password"
                            className="login-forgot-link"
                        >
                            Forgot?
                        </Link>
                    </div>

                    <div className="login-form-options">
                        <label className="login-custom-checkbox">
                            <input type="checkbox" defaultChecked />
                            <span className="login-checkmark"></span>
                            Keep me signed in
                        </label>
                    </div>

                    <button
                        type="submit"
                        className={`login-btn-primary ${isSuccess ? 'login-success' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <><i className="ph ph-spinner-gap" style={{ animation: 'spin 1s linear infinite', fontSize: '1.2rem' }}></i> Authenticating...</>
                        ) : isSuccess ? (
                            <><i className="ph-bold ph-check"></i> Success!</>
                        ) : (
                            <>Sign In <i className="ph-bold ph-arrow-right"></i></>
                        )}
                    </button>
                </form>

                <div className="login-divider">OR CONTINUE WITH</div>

                <div className="login-social-logins">
                    <button className="login-btn-social" type="button" onClick={handleGoogleLogin} disabled={isLoading}>
                        {/* <i className="ph-fill ph-google-logo" style={{ fontSize: '1.2rem' }}></i>  */}
                        Continue with Google
                    </button>
                </div>

                <div className="login-signup-link">
                    New to Vehicle Care? <Link to="/register">Create an account</Link>
                    <div style={{ marginTop: '0.8rem', fontSize: '0.85rem' }}>
                        Are you an Administrator? <Link to="/admin-login" style={{ color: '#ff3b30', fontWeight: '600' }}>Admin Portal</Link>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;

