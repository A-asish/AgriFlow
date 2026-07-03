// src/features/settings/components/SecurityTab.jsx

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { ResponsiveDialog } from '@/shared/components/ui/ResponsiveDialog';
import { toast } from 'sonner';
import { Lock, LogOut, Trash2, Loader2, Shield, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authService } from '@/features/auth/services/auth.api';
import { getApiErrorMessage } from '@/shared/utils/apiError';

const SectionHeader = ({ icon: Icon, title, className = 'text-blue-600 bg-blue-50' }) => (
    <div className="flex items-center gap-3 mb-6">
        <div className={`p-2.5 rounded-xl ${className}`}>
            <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
    </div>
);

// ✅ MOVED OUTSIDE - Now it's a stable component
const PasswordField = ({ 
    value, 
    onChange, 
    label, 
    showPassword, 
    setShowPassword,
    autoComplete,
    placeholder,
    error,
    isValid,
    required = true,
}) => (
    <div className="space-y-2">
        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <div className="relative">
            <Input
                type={showPassword ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                className={`h-12 rounded-xl input-field pr-12 ${
                    error ? 'border-red-500 focus:ring-red-500' : 
                    isValid ? 'border-green-500 focus:ring-green-500' : ''
                }`}
                autoComplete={autoComplete}
                placeholder={placeholder}
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
);

const SecurityTab = ({ logout, navigate }) => {
    const { t } = useLanguage();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        old_password: '',
        new_password: '',
        new_password2: '',
    });
    const [changingPassword, setChangingPassword] = useState(false);

    // Password visibility states
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showDeletePassword, setShowDeletePassword] = useState(false);

    // Validation errors
    const [oldPasswordError, setOldPasswordError] = useState('');
    const [newPasswordError, setNewPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    // Basic password validation
    const validatePassword = (password) => {
        if (!password) return 'Password is required';
        if (password.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(password)) return 'Must contain at least one uppercase letter';
        if (!/[a-z]/.test(password)) return 'Must contain at least one lowercase letter';
        if (!/[0-9]/.test(password)) return 'Must contain at least one number';
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Must contain at least one special character';
        return '';
    };

    // Real-time validation for old password
    useEffect(() => {
        if (passwordForm.old_password.length > 0 && passwordForm.old_password.length < 6) {
            setOldPasswordError('Password must be at least 6 characters');
        } else {
            setOldPasswordError('');
        }
    }, [passwordForm.old_password]);

    // Real-time validation for new password
    useEffect(() => {
        if (passwordForm.new_password.length > 0) {
            const error = validatePassword(passwordForm.new_password);
            setNewPasswordError(error);
        } else {
            setNewPasswordError('');
        }
    }, [passwordForm.new_password]);

    // Real-time validation for confirm password
    useEffect(() => {
        if (passwordForm.new_password2.length > 0) {
            if (passwordForm.new_password2 !== passwordForm.new_password) {
                setConfirmPasswordError('Passwords do not match');
            } else {
                setConfirmPasswordError('');
            }
        } else {
            setConfirmPasswordError('');
        }
    }, [passwordForm.new_password2, passwordForm.new_password]);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        // Final validation
        if (!passwordForm.old_password) {
            toast.error('Current password is required');
            return;
        }
        if (passwordForm.old_password.length < 6) {
            toast.error('Current password must be at least 6 characters');
            return;
        }
        if (newPasswordError) {
            toast.error('Please fix the new password errors');
            return;
        }
        if (confirmPasswordError) {
            toast.error('Passwords do not match');
            return;
        }

        setChangingPassword(true);
        try {
            const res = await authService.changePassword(passwordForm);
            if (res.data?.success === false) {
                toast.error(res.data?.error || t('common.error'));
                return;
            }
            toast.success(t('auth.passwordResetSuccess'));
            setPasswordForm({ old_password: '', new_password: '', new_password2: '' });
            setOldPasswordError('');
            setNewPasswordError('');
            setConfirmPasswordError('');
        } catch (error) {
            toast.error(getApiErrorMessage(error, t('common.error')));
        } finally {
            setChangingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            toast.error(t('settings.passwordRequired'));
            return;
        }

        setDeleteLoading(true);
        try {
            await authService.deleteAccount(deletePassword);
            toast.success(t('settings.accountDeleted'));
            await logout();
            navigate('/auth');
        } catch (error) {
            toast.error(getApiErrorMessage(error, t('common.error')));
            setDeletePassword('');
        } finally {
            setDeleteLoading(false);
            setShowDeleteDialog(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/auth');
        } catch (error) {
            toast.error(getApiErrorMessage(error, t('common.error')));
        }
    };

    // Check if form is valid
    const isFormValid = () => {
        return passwordForm.old_password.length >= 6 &&
               passwordForm.new_password.length >= 8 &&
               passwordForm.new_password2.length >= 8 &&
               !newPasswordError &&
               !confirmPasswordError &&
               passwordForm.new_password === passwordForm.new_password2;
    };

    return (
        <>
            <div className="space-y-6">
                {/* Change Password */}
                <div className="farm-card">
                    <SectionHeader icon={Lock} title={t('settings.changePassword')} className="text-blue-600 bg-blue-50" />
                    <p className="text-sm text-muted-foreground mb-6">{t('settings.changePasswordDescription')}</p>
                    <form onSubmit={handleChangePassword} className="space-y-5 max-w-xl">
                        {/* Old Password */}
                        <PasswordField
                            value={passwordForm.old_password}
                            onChange={(e) => setPasswordForm((prev) => ({ ...prev, old_password: e.target.value }))}
                            label={t('auth.password')}
                            showPassword={showOldPassword}
                            setShowPassword={setShowOldPassword}
                            autoComplete="current-password"
                            placeholder="Enter current password"
                            error={oldPasswordError}
                            isValid={passwordForm.old_password.length >= 6 && !oldPasswordError}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* New Password */}
                            <PasswordField
                                value={passwordForm.new_password}
                                onChange={(e) => setPasswordForm((prev) => ({ ...prev, new_password: e.target.value }))}
                                label={t('auth.newPassword')}
                                showPassword={showNewPassword}
                                setShowPassword={setShowNewPassword}
                                autoComplete="new-password"
                                placeholder="Enter new password"
                                error={newPasswordError}
                                isValid={passwordForm.new_password.length >= 8 && !newPasswordError}
                            />

                            {/* Confirm Password */}
                            <PasswordField
                                value={passwordForm.new_password2}
                                onChange={(e) => setPasswordForm((prev) => ({ ...prev, new_password2: e.target.value }))}
                                label={t('auth.confirmPassword')}
                                showPassword={showConfirmPassword}
                                setShowPassword={setShowConfirmPassword}
                                autoComplete="new-password"
                                placeholder="Confirm new password"
                                error={confirmPasswordError}
                                isValid={passwordForm.new_password2.length >= 8 && !confirmPasswordError && passwordForm.new_password === passwordForm.new_password2}
                            />
                        </div>

                        <Button 
                            type="submit" 
                            disabled={changingPassword || !isFormValid()} 
                            className="rounded-xl h-11 gap-2"
                        >
                            {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                            {t('settings.changePassword')}
                        </Button>
                    </form>
                </div>

                {/* Logout */}
                <div className="farm-card border-amber-200/60 bg-amber-50/30">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <LogOut className="w-5 h-5 text-amber-700 shrink-0" />
                            <div>
                                <p className="font-semibold text-foreground">{t('settings.logout')}</p>
                                <p className="text-sm text-muted-foreground">{t('settings.logoutDescription')}</p>
                            </div>
                        </div>
                        <Button variant="outline" onClick={handleLogout} className="rounded-xl h-11 shrink-0">
                            {t('settings.logout')}
                        </Button>
                    </div>
                </div>

                {/* Delete Account */}
                <div className="farm-card border-red-200/60 bg-red-50/30">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Trash2 className="w-5 h-5 text-red-600 shrink-0" />
                            <div>
                                <p className="font-semibold text-red-900">{t('settings.deleteAccount')}</p>
                                <p className="text-sm text-red-700/80">{t('settings.deleteAccountDescription')}</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(true)}
                            className="rounded-xl h-11 border-red-300 text-red-600 hover:bg-red-100 shrink-0"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t('settings.delete')}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Delete Account Dialog */}
            <ResponsiveDialog
                isOpen={showDeleteDialog}
                onClose={() => {
                    setShowDeleteDialog(false);
                    setDeletePassword('');
                    setShowDeletePassword(false);
                }}
                title={t('settings.confirmDelete')}
                maxWidth="sm"
            >
                <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{t('settings.deleteWarning')}</p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {t('settings.enterPassword')}
                        </Label>
                        <div className="relative">
                            <Input
                                type={showDeletePassword ? 'text' : 'password'}
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                className={`h-12 rounded-xl pr-12 ${
                                    deletePassword.length >= 6 ? 'border-green-500' : ''
                                }`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleDeleteAccount();
                                }}
                                placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowDeletePassword(!showDeletePassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showDeletePassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            onClick={handleDeleteAccount}
                            disabled={deleteLoading || !deletePassword}
                            className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl h-11"
                        >
                            {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                            {t('settings.deleteAccount')}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowDeleteDialog(false);
                                setDeletePassword('');
                                setShowDeletePassword(false);
                            }}
                            className="flex-1 rounded-xl h-11"
                        >
                            {t('common.cancel')}
                        </Button>
                    </div>
                </div>
            </ResponsiveDialog>
        </>
    );
};

export default SecurityTab;