import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchUserProfile, updateUserProfile, changeUserPassword } from '../services/api';
import './ProfilePage.css';

const ProfilePage = ({ userId }) => {
    const [userProfile, setUserProfile] = useState({ fullName: '', email: '', phone: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Notifications
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    
    // Modals
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    
    // Password Form
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    // Initial Load
    useEffect(() => {
        const loadInitialData = async () => {
            if (!userId) return;
            setIsLoading(true);
            try {
                const userRes = await fetchUserProfile(userId);
                setUserProfile({
                    fullName: userRes.data.fullName || '',
                    email: userRes.data.email || '',
                    phone: userRes.data.phone || ''
                });
            } catch (err) {
                showToast('Failed to load profile data', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        loadInitialData();
    }, [userId]);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    // Handlers
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateUserProfile(userId, userProfile);
            // Update local storage so dashboard header name matches, using role-specific key only
            const currentUser = JSON.parse(localStorage.getItem('customer_user'));
            if (currentUser) {
                localStorage.setItem('customer_user', JSON.stringify({ ...currentUser, fullName: userProfile.fullName, email: userProfile.email }));
                window.dispatchEvent(new Event('storage'));
            }
            showToast('Profile updated successfully!');
        } catch (err) {
            showToast('Failed to update profile', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }
        try {
            await changeUserPassword(userId, { 
                currentPassword: passwordForm.currentPassword, 
                newPassword: passwordForm.newPassword 
            });
            showToast('Password changed successfully!');
            setIsPasswordModalOpen(false);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            showToast(err.message || 'Failed to change password', 'error');
        }
    };

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                <div style={{ padding: '20px', color: 'rgba(255,255,255,0.5)', fontSize: '1.2rem' }}>
                    <i className="ph-bold ph-spinner-gap" style={{ animation: 'spin 1s linear infinite' }}></i> Loading Profile...
                </div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="page-container profile-wrapper">
            <AnimatePresence>
                {toast.show && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`notification-banner ${toast.type}`}>
                        <i className={`ph-fill ${toast.type === 'success' ? 'ph-check-circle' : 'ph-warning-circle'}`}></i>
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Account Settings */}
            <div className="glass-panel profile-main-card">
                <div className="profile-section-header">
                    <h2><i className="ph-bold ph-user-circle"></i> Account Information</h2>
                </div>
                <form className="form-grid" onSubmit={handleProfileUpdate}>
                    <div className="form-group-full" style={{ display: 'flex', gap: '30px', alignItems: 'center', marginBottom: '30px', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="profile-avatar">
                            {userProfile.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="profile-user-info">
                            <h3 style={{ fontSize: '1.8rem', letterSpacing: '-0.5px' }}>{userProfile.fullName || 'User Profile'}</h3>
                            <span style={{ fontSize: '1.1rem' }}>{userProfile.email || 'user@example.com'}</span>
                        </div>
                    </div>
                    
                    <div className="form-group-p">
                        <label>Full Name</label>
                        <input type="text" className="glass-input" required value={userProfile.fullName} onChange={(e) => setUserProfile({...userProfile, fullName: e.target.value})} />
                    </div>
                    <div className="form-group-p">
                        <label>Phone Number</label>
                        <input type="text" className="glass-input" placeholder="+91 XXXXX XXXXX" value={userProfile.phone} onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})} />
                    </div>
                    <div className="form-group-p form-group-full">
                        <label>Email Address</label>
                        <input type="email" className="glass-input" required value={userProfile.email} onChange={(e) => setUserProfile({...userProfile, email: e.target.value})} />
                    </div>

                    <div className="form-group-full form-actions" style={{ display: 'flex', gap: '15px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <button type="submit" className="action-btn-primary hover-glow" disabled={isSaving}>
                            {isSaving ? <><i className="ph-bold ph-spinner-gap" style={{ animation: 'spin 1s linear infinite' }}></i> Saving...</> : <><i className="ph-bold ph-floppy-disk"></i> Save Profile Info</>}
                        </button>
                        <button type="button" className="action-btn-secondary" onClick={() => setIsPasswordModalOpen(true)}>
                            <i className="ph-bold ph-lock-key"></i> Change Password
                        </button>
                    </div>
                </form>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {/* Password Modal */}
                {isPasswordModalOpen && (
                    <div className="profile-modal-overlay">
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="profile-modal-content">
                            <div className="modal-header-p">
                                <h2><i className="ph-bold ph-shield-check" style={{ color: 'var(--accent-red)' }}></i> Change Password</h2>
                                <button type="button" className="btn-close" onClick={() => setIsPasswordModalOpen(false)}><i className="ph-bold ph-x"></i></button>
                            </div>
                            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div className="form-group-p">
                                    <label>Current Password</label>
                                    <input type="password" required className="glass-input" value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} />
                                </div>
                                <div className="form-group-p">
                                    <label>New Password</label>
                                    <input type="password" required className="glass-input" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} />
                                </div>
                                <div className="form-group-p">
                                    <label>Confirm New Password</label>
                                    <input type="password" required className="glass-input" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} />
                                </div>
                                <div className="modal-form-actions">
                                    <button type="button" className="action-btn-secondary" style={{ padding: '10px 20px' }} onClick={() => setIsPasswordModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="action-btn-primary" style={{ padding: '10px 20px' }}>Update Password</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ProfilePage;
