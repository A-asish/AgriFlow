import { useState } from 'react';
export function useConfirmDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState({
        onConfirm: async () => { },
        title: 'Confirm Action',
        message: 'Are you sure you want to proceed?',
        confirmText: 'Confirm',
        cancelText: 'Cancel'
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const showConfirm = (options) => {
        setConfig({
            title: options.title || 'Confirm Action',
            message: options.message || 'Are you sure you want to proceed?',
            confirmText: options.confirmText || 'Confirm',
            cancelText: options.cancelText || 'Cancel',
            onConfirm: options.onConfirm,
            onCancel: options.onCancel
        });
        setIsOpen(true);
    };
    const handleConfirm = async () => {
        setIsProcessing(true);
        try {
            await config.onConfirm();
            setIsOpen(false);
        }
        catch (error) {
            console.error('Confirm action failed:', error);
        }
        finally {
            setIsProcessing(false);
        }
    };
    const handleCancel = () => {
        config.onCancel?.();
        setIsOpen(false);
    };
    const closeConfirm = () => {
        setIsOpen(false);
    };
    return {
        isOpen,
        isProcessing,
        config,
        showConfirm,
        handleConfirm,
        handleCancel,
        closeConfirm
    };
}
