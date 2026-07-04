// AuthContext.tsx
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authService } from '@/features/auth/services/auth.api';
import { getApiErrorMessage } from '@/shared/utils/apiError';
const AuthContext = createContext(undefined);

/** Preserve role flags when profile API omits them (e.g. after page refresh). */
function mergeUserProfile(fetchedUser, existingUser) {
    if (!fetchedUser) return existingUser ?? null;
    return {
        ...fetchedUser,
        is_admin: fetchedUser.is_admin ?? existingUser?.is_admin ?? false,
        is_farmer: fetchedUser.is_farmer ?? existingUser?.is_farmer ?? false,
    };
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            const storedUser = localStorage.getItem('user');
            const parsedUser = storedUser ? JSON.parse(storedUser) : null;
            authService.getProfile(parsedUser?.id)
                .then((res) => {
                let profileUser = null;
                if (res.data?.success) {
                    profileUser = res.data.data;
                }
                else if (res.data?.data) {
                    profileUser = res.data.data;
                }
                else if (res.data) {
                    profileUser = res.data;
                }
                if (profileUser) {
                    const mergedUser = mergeUserProfile(profileUser, parsedUser);
                    setUser(mergedUser);
                    localStorage.setItem('user', JSON.stringify(mergedUser));
                }
            })
                .catch((err) => {
                console.warn('Could not fetch profile:', err.response?.status);
            })
                .finally(() => setLoading(false));
        }
        else {
            setLoading(false);
        }
    }, []);
    const login = useCallback(async (email, password) => {
        try {
            const res = await authService.login(email, password);
            localStorage.setItem('access_token', res.data.access);
            localStorage.setItem('refresh_token', res.data.refresh);
            let loggedInUser = null;
            if (res.data.user) {
                loggedInUser = res.data.user;
                setUser(loggedInUser);
                localStorage.setItem('user', JSON.stringify(loggedInUser));
            }
            const redirectPath = loggedInUser?.is_admin ? '/admin/dashboard' : '/dashboard';
            return {
                success: true,
                user: loggedInUser || undefined,
                redirectPath
            };
        }
        catch (err) {
            console.error('Login error:', err.response?.data);
            return {
                success: false,
                message: getApiErrorMessage(err, 'Unable to sign in. Please check your email and password.'),
            };
        }
    }, []);
    // COMPLETELY FIXED REGISTER FUNCTION
    const register = useCallback(async (data) => {
        try {
            console.log('📤 Sending registration request to backend:', data);
            const response = await authService.register(data);
            console.log('📥 Raw response:', response);
            console.log('📥 Response status:', response.status);
            console.log('📥 Response data:', response.data);
            // SUCCESS: Status 201 means Created - Registration successful!
            if (response.status === 201) {
                console.log('✅ Registration successful! Status 201');
                // Extract message from response
                let message = 'Registration successful! Please check your email to verify your account.';
                if (response.data?.message) {
                    message = response.data.message;
                }
                else if (response.data?.detail) {
                    message = response.data.detail;
                }
                return {
                    success: true,
                    message: message,
                    user: response.data?.user || null
                };
            }
            // Status 200 might also be success depending on your backend
            if (response.status === 200 && response.data?.success === true) {
                console.log('✅ Registration successful! Status 200 with success=true');
                return {
                    success: true,
                    message: response.data.message || 'Registration successful! Please verify your email.',
                    user: response.data.user
                };
            }
            // If we get here, something unexpected happened
            console.warn('⚠️ Unexpected response structure:', response);
            return {
                success: false,
                message: response.data?.message || 'Registration failed. Please try again.',
                errors: response.data?.errors
            };
        }
        catch (err) {
            console.error('❌ Registration error caught:', err);
            console.error('❌ Error response:', err.response);
            console.error('❌ Error status:', err.response?.status);
            console.error('❌ Error data:', err.response?.data);
            // Handle validation errors (400)
            if (err.response?.status === 400) {
                const errorData = err.response.data;
                // Check for field-specific errors
                if (errorData && typeof errorData === 'object') {
                    // If there are field errors
                    if (errorData.errors || (Object.keys(errorData).length > 0 && !errorData.detail && !errorData.message)) {
                        const errors = errorData.errors || errorData;
                        return {
                            success: false,
                            message: 'Please check the form for errors.',
                            errors: errors
                        };
                    }
                    // Single error message
                    const errorMessage = getApiErrorMessage(
                        { response: { data: errorData } },
                        'Registration failed. Please check your information.',
                    );
                    return {
                        success: false,
                        message: errorMessage,
                        errors: { detail: [errorMessage] }
                    };
                }
            }
            // Network or other errors
            return {
                success: false,
                message: getApiErrorMessage(
                    err,
                    'Network error. Please check your connection and try again.',
                ),
            };
        }
    }, []);
    const logout = useCallback(async () => {
        const refresh = localStorage.getItem('refresh_token');
        if (refresh) {
            try {
                await authService.logout(refresh);
            }
            catch (e) {
                console.warn('Logout error:', e);
            }
        }
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setUser(null);
    }, []);
    const refreshProfile = useCallback(async () => {
        try {
            const stored = localStorage.getItem('user');
            const parsed = stored ? JSON.parse(stored) : null;
            const profileId = user?.id || parsed?.id;
            if (!profileId) return;
            const res = await authService.getProfile(profileId);
            let profileUser = null;
            if (res.data?.success) {
                profileUser = res.data.data;
            }
            else if (res.data?.data) {
                profileUser = res.data.data;
            }
            if (profileUser) {
                const mergedUser = mergeUserProfile(profileUser, parsed);
                setUser(mergedUser);
                localStorage.setItem('user', JSON.stringify(mergedUser));
            }
        }
        catch (e) {
            console.warn('Could not refresh profile:', e);
        }
    }, [user?.id]);
    const value = useMemo(() => ({
        user,
        loading,
        isAuthenticated: !!user && !!localStorage.getItem('access_token'),
        login,
        register,
        logout,
        refreshProfile,
    }), [user, loading, login, register, logout, refreshProfile]);
    return (<AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>);
}
