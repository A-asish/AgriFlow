export const validateUsername = (username) => {
    if (!username)
        return 'Username is required';
    if (username.length < 3)
        return 'Username must be at least 3 characters';
    if (username.length > 150)
        return 'Username must be less than 150 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username))
        return 'Username can only contain letters, numbers, and underscores';
    return '';
};
export const validateEmail = (email) => {
    if (!email)
        return 'Email is required';
    const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
    if (!emailRegex.test(email))
        return 'Please enter a valid email address';
    return '';
};
export const validatePassword = (password) => {
    if (!password)
        return 'Password is required';
    if (password.length < 8)
        return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password))
        return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password))
        return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password))
        return 'Password must contain at least one number';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
        return 'Password must contain at least one special character';
    return '';
};
export const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword)
        return 'Please confirm your password';
    if (password !== confirmPassword)
        return 'Passwords do not match';
    return '';
};
export const validatePhone = (phone) => {
    if (!phone)
        return '';
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone))
        return 'Please enter a valid 10-digit phone number';
    return '';
};
export const validateAge = (dateOfBirth) => {
    if (!dateOfBirth)
        return 'Date of birth is required';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    if (age < 13)
        return 'You must be at least 13 years old to register';
    if (age > 120)
        return 'Please enter a valid date of birth';
    return '';
};
export const validateRequired = (value, fieldName) => {
    if (!value)
        return `${fieldName} is required`;
    return '';
};
export const getPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8)
        score++;
    if (password.length >= 12)
        score++;
    if (/[A-Z]/.test(password))
        score++;
    if (/[0-9]/.test(password))
        score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password))
        score++;
    if (score <= 2)
        return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3)
        return { score, label: 'Fair', color: 'bg-yellow-500' };
    if (score <= 4)
        return { score, label: 'Good', color: 'bg-blue-500' };
    return { score, label: 'Strong', color: 'bg-green-500' };
};
