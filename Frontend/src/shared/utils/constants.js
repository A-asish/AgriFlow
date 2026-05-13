export const APP_NAME = 'AgriFlow';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.agriflow.com';
export const CROP_STAGES = [
    { value: 'seeding', label: 'Seeding' },
    { value: 'vegetative', label: 'Vegetative' },
    { value: 'flowering', label: 'Flowering' },
    { value: 'harvest', label: 'Harvest' },
];
export const TRANSACTION_CATEGORIES = [
    'Seeds',
    'Fertilizer',
    'Pesticide',
    'Labor',
    'Equipment',
    'Feed',
    'Veterinary',
    'Sales',
    'Other',
];
