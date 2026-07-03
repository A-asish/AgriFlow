// src/features/farmer/crops/services/crops.api.js

import api from '@/services/api';

export const cropsService = {
    // Crop CRUD
    listCrops: () => api.get('/crops/'),
    createCrop: (data) => api.post('/crops/', data),
    getCrop: (id) => api.get(`/crops/${id}/`),
    updateCrop: (id, data) => api.patch(`/crops/${id}/`, data),
    deleteCrop: (id) => api.delete(`/crops/${id}/`),

    getAvailableCrops: () => api.get('/crops/available-crops/'),
    getCropVarieties: (cropName) => api.get(`/crops/crop-varieties/?crop_name=${encodeURIComponent(cropName)}`),
    
    // Fertilizers
    listFertilizers: (cropId) => cropId ? api.get(`/crops/${cropId}/fertilizers/`) : api.get('/crops/fertilizers/'),
    addFertilizer: (cropId, data) => api.post(`/crops/${cropId}/fertilizers/`, data),
    getFertilizer: (id) => api.get(`/crops/fertilizers/${id}/`),
    updateFertilizer: (id, data) => api.patch(`/crops/fertilizers/${id}/`, data),
    deleteFertilizer: (id) => api.delete(`/crops/fertilizers/${id}/`),
    
    // Pesticides
    listPesticides: (cropId) => cropId ? api.get(`/crops/${cropId}/pesticides/`) : api.get('/crops/pesticides/'),
    addPesticide: (cropId, data) => api.post(`/crops/${cropId}/pesticides/`, data),
    getPesticide: (id) => api.get(`/crops/pesticides/${id}/`),
    updatePesticide: (id, data) => api.patch(`/crops/pesticides/${id}/`, data),
    deletePesticide: (id) => api.delete(`/crops/pesticides/${id}/`),
    
    // Labor
    listLabor: (cropId) => cropId ? api.get(`/crops/${cropId}/labor/`) : api.get('/crops/labor/'),
    addLabor: (cropId, data) => api.post(`/crops/${cropId}/labor/`, data),
    getLabor: (id) => api.get(`/crops/labor/${id}/`),
    updateLabor: (id, data) => api.patch(`/crops/labor/${id}/`, data),
    deleteLabor: (id) => api.delete(`/crops/labor/${id}/`),
    
    // Harvests
    listHarvests: (cropId) => cropId ? api.get(`/crops/${cropId}/harvests/`) : api.get('/crops/harvests/'),
    addHarvest: (cropId, data) => api.post(`/crops/${cropId}/harvests/`, data),
    getHarvest: (id) => api.get(`/crops/harvests/${id}/`),
    updateHarvest: (id, data) => api.patch(`/crops/harvests/${id}/`, data),
    deleteHarvest: (id) => api.delete(`/crops/harvests/${id}/`),
    
    // Incomes
    listIncomes: (cropId) => cropId ? api.get(`/crops/${cropId}/incomes/`) : api.get('/crops/incomes/'),
    addIncome: (cropId, data) => api.post(`/crops/${cropId}/incomes/`, data),
    getIncome: (id) => api.get(`/crops/incomes/${id}/`),
    updateIncome: (id, data) => api.patch(`/crops/incomes/${id}/`, data),
    deleteIncome: (id) => api.delete(`/crops/incomes/${id}/`),
    
    // Expenses
    listExpenses: (cropId) => cropId ? api.get(`/crops/${cropId}/expenses/`) : api.get('/crops/expenses/'),
    addExpense: (cropId, data) => api.post(`/crops/${cropId}/expenses/`, data),
    getExpense: (id) => api.get(`/crops/expenses/${id}/`),
    updateExpense: (id, data) => api.patch(`/crops/expenses/${id}/`, data),
    deleteExpense: (id) => api.delete(`/crops/expenses/${id}/`),
    
    // Recommendations
    recommend: (data) => api.post('/crops/recommend/', data),
    getRecommendationHistory: () => api.get('/crops/recommend/history/'),
    deleteRecommendationHistory: (id) => api.delete(`/crops/recommend/history/${id}/`),
    getRecommendationDetail: (id) => api.get(`/crops/recommend/history/${id}/`),
    deleteRecommendationDetail: (id) => api.delete(`/crops/recommend/history/${id}/`),
    
    listKnowledgeBase: (params) => api.get('/crops/api/knowledge-base/', { params }),
    getKnowledgeBaseById: (id) => api.get(`/crops/api/knowledge-base/${id}/`),
    searchKnowledgeBase: (query) => api.get('/crops/api/knowledge-base/', { params: { search: query } }),
};

export default cropsService;