import api from '@/services/api';
export const financeService = {
    getSummary: (params = {}) => api.get('/finance/dashboard/', { params }),
    listTransactions: (params = {}) => api.get('/finance/transactions/', { params }),
    createTransaction: (data) => api.post('/finance/transactions/', data),
    getTransaction: (id) => api.get(`/finance/transactions/${id}/`),
    updateTransaction: (id, data) => api.patch(`/finance/transactions/${id}/`, data),
    deleteTransaction: (id) => api.delete(`/finance/transactions/${id}/`),
    // Budgets
    listBudgets: () => api.get('/finance/budgets/'),
    createBudget: (data) => api.post('/finance/budgets/', data),
    getBudget: (id) => api.get(`/finance/budgets/${id}/`),
    updateBudget: (id, data) => api.patch(`/finance/budgets/${id}/`, data),
    deleteBudget: (id) => api.delete(`/finance/budgets/${id}/`),
    // Categories
    listCategories: () => api.get('/finance/categories/'),
    createCategory: (data) => api.post('/finance/categories/', data),
    getCategory: (id) => api.get(`/finance/categories/${id}/`),
    updateCategory: (id, data) => api.patch(`/finance/categories/${id}/`, data),
    deleteCategory: (id) => api.delete(`/finance/categories/${id}/`),
    exportTransactions: () => api.get('/finance/export/'),
};
export default financeService;
