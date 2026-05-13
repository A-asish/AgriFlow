// auth.api.ts
import api from '@/services/api';
export const authService = {
    // Registration - Remove /api/ prefix
    register: (data) => api.post('auth/register/', data),
    // Login - Remove /api/ prefix
    login: (email, password) => api.post('auth/login/', { email, password }),
    // Profile
    getProfile: (id) => {
        if (id) {
            return api.get(`auth/profile/${id}/`);
        }
        return api.get('auth/profile/');
    },
    // Update profile
    updateProfile: (id, data) => api.patch(`auth/profile/${id}/`, data),
    // Email verification
    verifyEmail: (token) => api.get(`auth/verify-email/?token=${token}`),
    resendVerification: (email) => api.post('auth/resend-verification/', { email }),
    // Password reset
    requestPasswordReset: (email) => api.post('auth/password-reset/', { email }),
    confirmPasswordReset: (data) => api.post('auth/password-reset/confirm/', data),
    changePassword: (data) => api.post('auth/change-password/', data),
    // Logout
    logout: (refresh) => api.post('auth/logout/', { refresh }),
    // Token refresh
    refreshToken: (refresh) => api.post('auth/token/refresh/', { refresh }),
    // Account management
    deleteAccount: () => api.delete('auth/delete-account/'),
    // Terms
    checkTerms: () => api.get('auth/check-terms/'),
    acceptTerms: () => api.post('auth/accept-terms/'),
};
export default authService;
