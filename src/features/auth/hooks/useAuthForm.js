// hooks/useAuthForm.ts
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { validateUsername, validateEmail, validatePassword, validateConfirmPassword, validatePhone, validateAge, validateRequired, } from '../utils/validators';
export const useAuthForm = () => {
    const { register: registerUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [apiErrors, setApiErrors] = useState({});
    const validateRegisterForm = (form) => {
        const errors = {};
        const usernameError = validateUsername(form.username);
        if (usernameError)
            errors.username = usernameError;
        const emailError = validateEmail(form.email);
        if (emailError)
            errors.email = emailError;
        const passwordError = validatePassword(form.password);
        if (passwordError)
            errors.password = passwordError;
        const confirmPasswordError = validateConfirmPassword(form.password, form.password2);
        if (confirmPasswordError)
            errors.password2 = confirmPasswordError;
        const firstNameError = validateRequired(form.first_name, 'First name');
        if (firstNameError)
            errors.first_name = firstNameError;
        const lastNameError = validateRequired(form.last_name, 'Last name');
        if (lastNameError)
            errors.last_name = lastNameError;
        const dateOfBirthError = validateAge(form.date_of_birth);
        if (dateOfBirthError)
            errors.date_of_birth = dateOfBirthError;
        const regionError = validateRequired(form.geographical_region, 'Geographical region');
        if (regionError)
            errors.geographical_region = regionError;
        const districtError = validateRequired(form.district, 'District');
        if (districtError)
            errors.district = districtError;
        const locationError = validateRequired(form.location, 'Location');
        if (locationError)
            errors.location = locationError;
        const phoneError = validatePhone(form.phone);
        if (phoneError)
            errors.phone = phoneError;
        return errors;
    };
    const handleRegister = async (formData) => {
        setLoading(true);
        setApiErrors({});
        // Prepare payload
        const payload = {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            password2: formData.password2,
            first_name: formData.first_name,
            last_name: formData.last_name,
            geographical_region: formData.geographical_region,
            location: formData.location,
            district: formData.district,
            agreed_to_terms: formData.agreed_to_terms,
            agreed_to_privacy: formData.agreed_to_privacy,
        };
        // Only add optional fields if they have values
        if (formData.phone && formData.phone.trim() !== '') {
            payload.phone = formData.phone;
        }
        if (formData.date_of_birth && formData.date_of_birth.trim() !== '') {
            payload.date_of_birth = formData.date_of_birth;
        }
        if (formData.gender && formData.gender.trim() !== '') {
            payload.gender = formData.gender;
        }
        console.log('📤 Calling registerUser with payload:', payload);
        try {
            const result = await registerUser(payload);
            console.log('📥 Register result:', result);
            if (result.success === true) {
                toast.success(result.message || 'Registration successful! Please check your email to verify your account.');
                return true;
            }
            else {
                // Handle errors from the backend
                if (result.errors) {
                    setApiErrors(result.errors);
                    // Display specific error messages
                    if (result.errors.username) {
                        const msg = Array.isArray(result.errors.username) ? result.errors.username[0] : result.errors.username;
                        toast.error(`Username: ${msg}`);
                    }
                    else if (result.errors.email) {
                        const msg = Array.isArray(result.errors.email) ? result.errors.email[0] : result.errors.email;
                        toast.error(`Email: ${msg}`);
                    }
                    else if (result.errors.phone) {
                        const msg = Array.isArray(result.errors.phone) ? result.errors.phone[0] : result.errors.phone;
                        toast.error(`Phone: ${msg}`);
                    }
                    else if (result.errors.first_name) {
                        const msg = Array.isArray(result.errors.first_name) ? result.errors.first_name[0] : result.errors.first_name;
                        toast.error(`First name: ${msg}`);
                    }
                    else if (result.errors.last_name) {
                        const msg = Array.isArray(result.errors.last_name) ? result.errors.last_name[0] : result.errors.last_name;
                        toast.error(`Last name: ${msg}`);
                    }
                    else if (result.errors.geographical_region) {
                        const msg = Array.isArray(result.errors.geographical_region) ? result.errors.geographical_region[0] : result.errors.geographical_region;
                        toast.error(`Region: ${msg}`);
                    }
                    else {
                        const firstErrorKey = Object.keys(result.errors)[0];
                        const firstErrorMessage = result.errors[firstErrorKey];
                        const errorMessage = Array.isArray(firstErrorMessage) ? firstErrorMessage[0] : firstErrorMessage;
                        toast.error(errorMessage || 'Registration failed');
                    }
                }
                else if (result.message) {
                    toast.error(result.message);
                }
                else {
                    toast.error('Registration failed. Please try again.');
                }
                return false;
            }
        }
        catch (error) {
            console.error('❌ Registration error in hook:', error);
            // Extract error from the caught exception
            if (error.response?.data) {
                const errorData = error.response.data;
                console.log('Backend error data:', errorData);
                // Handle different error formats
                if (errorData.error && typeof errorData.error === 'object') {
                    // Format: { success: false, error: { field: ["message"] } }
                    const fieldErrors = errorData.error;
                    setApiErrors(fieldErrors);
                    // Display the first error
                    const firstField = Object.keys(fieldErrors)[0];
                    if (firstField) {
                        const firstMessage = Array.isArray(fieldErrors[firstField])
                            ? fieldErrors[firstField][0]
                            : fieldErrors[firstField];
                        toast.error(`${firstField}: ${firstMessage}`);
                    }
                    else {
                        toast.error('Registration failed. Please check your information.');
                    }
                }
                else if (typeof errorData === 'object' && errorData !== null) {
                    const newApiErrors = {};
                    let firstErrorMsg = '';
                    let firstErrorField = '';
                    Object.keys(errorData).forEach(key => {
                        if (['detail', 'message', 'success'].includes(key))
                            return;
                        const msgArray = Array.isArray(errorData[key]) ? errorData[key] : [errorData[key]];
                        newApiErrors[key] = msgArray;
                        if (!firstErrorMsg) {
                            // Convert field names like 'first_name' to 'First name' for the toast
                            firstErrorField = key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                            firstErrorMsg = msgArray[0];
                        }
                    });
                    if (Object.keys(newApiErrors).length > 0) {
                        setApiErrors(newApiErrors);
                        toast.error(`${firstErrorField}: ${firstErrorMsg}`);
                    }
                    else if (errorData.detail) {
                        toast.error(errorData.detail);
                    }
                    else if (errorData.message) {
                        toast.error(errorData.message);
                    }
                    else {
                        toast.error('Registration failed. Please check your information.');
                    }
                }
                else {
                    toast.error('Registration failed. Please check your information.');
                }
            }
            else {
                toast.error(error.message || 'Something went wrong. Please try again.');
            }
            return false;
        }
        finally {
            setLoading(false);
        }
    };
    const clearApiErrors = () => {
        setApiErrors({});
    };
    return {
        loading,
        apiErrors,
        validateRegisterForm,
        handleRegister,
        clearApiErrors,
    };
};
