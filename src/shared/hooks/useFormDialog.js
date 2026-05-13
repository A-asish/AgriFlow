import { useState } from 'react';
export function useFormDialog(options) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(options.initialData || {});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const openAdd = () => {
        setIsEditing(false);
        setFormData(options.initialData || {});
        setErrors({});
        setIsOpen(true);
    };
    const openEdit = (data) => {
        setIsEditing(true);
        setFormData(data);
        setErrors({});
        setIsOpen(true);
    };
    const close = () => {
        setIsOpen(false);
        setIsEditing(false);
        setFormData(options.initialData || {});
        setErrors({});
    };
    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await options.onSubmit(formData);
            setIsOpen(false);
            options.onSuccess?.();
        }
        catch (err) {
            console.error('Form submission error:', err);
            if (err.response?.data) {
                setErrors(err.response.data);
            }
            options.onError?.(err);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const setField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field when user types
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };
    return {
        isOpen,
        isEditing,
        isSubmitting,
        formData,
        errors,
        openAdd,
        openEdit,
        close,
        handleSubmit,
        setField,
        setFormData,
        setErrors
    };
}
