import api from '@/services/api';
export const adminService = {
    // Authentication
    login: (data) => api.post('/admin/auth/login/', data),
    getProfile: () => api.get('/admin/auth/profile/'),
    updateProfile: (data) => api.put('/admin/auth/profile/', data),
    changePassword: (data) => api.post('/admin/auth/change-password/', data),
    logout: (data) => api.post('/admin/auth/logout/', data),
    
    // Dashboard
    getStats: () => api.get('/admin/dashboard/stats/'),
    getFarmerTrend: () => api.get('/admin/dashboard/farmer-trend/'),
    getCropDistribution: () => api.get('/admin/dashboard/crop-distribution/'),
    getRevenueTrend: () => api.get('/admin/dashboard/revenue-trend/'),
    getTopCrops: () => api.get('/admin/dashboard/top-crops/'),
    getRecentActivities: () => api.get('/admin/dashboard/recent-activities/'),
   
    // Farmer Management
    listFarmers: (params) => api.get('/admin/farmers/', { params }),
    getFarmerDetail: (id) => api.get(`/admin/farmers/${id}/`),
    updateFarmer: (id, data) => api.put(`/admin/farmers/${id}/`, data),
    deleteFarmer: (id) => api.delete(`/admin/farmers/${id}/`),
    bulkActionFarmers: (data) => api.post('/admin/farmers/bulk-action/', data),
    exportFarmers: (params) => api.get('/admin/farmers/export/', { params, responseType: 'blob' }),
    
    // Admin User Management
    listAdmins: () => api.get('/admin/admins/'),
    createAdmin: (data) => api.post('/admin/admins/create/', data),
    deleteAdmin: (id) => api.delete(`/admin/admins/${id}/`),
    promoteFarmer: (id) => api.put(`/admin/farmers/${id}/`, { promote_to_admin: true }),

    // Crop Management
    listCrops: (params) => api.get('/admin/crops/', { params }),
    getCropDetail: (id) => api.get(`/admin/crops/${id}/`),
    deleteCrop: (id) => api.delete(`/admin/crops/${id}/`),  
    registerCrop: (data) => api.post('/admin/crops/register/', data),

    //Livestock Management
    listLivestock: (params) => api.get('/admin/livestock/', { params }),
    getLivestockDetail: (id) => api.get(`/admin/livestock/${id}/`),
    deleteLivestock: (id) => api.delete(`/admin/livestock/${id}/`),
    listAnimalTypes: () => api.get('/livestock/animal-types/'),
    
    
    // Financial Management
    getFinanceDashboard: () => api.get('/admin/finance/dashboard/'),
    getFinancialSummary: () => api.get('/admin/dashboard/stats/'),
    listFinanceTransactions: (params) => api.get('/admin/finance/transactions/', { params }),
    listTransactions: (params) => api.get('/admin/finance/transactions/', { params }),
    getRevenueByFarmer: () => api.get('/admin/finance/revenue-by-farmer/'),
    exportTransactions: (params) => api.get('/admin/finance/export/', { params, responseType: 'blob' }),

    // Livestock Management
    listLivestock: (params) => api.get('/admin/livestock/', { params }),
    getLivestockDetail: (id) => api.get(`/admin/livestock/${id}/`),
    getBreedingRecords: () => api.get('/admin/livestock/breeding-records/'),
    getMilkStats: (params) => api.get('/admin/livestock/milk-stats/', { params }),
    // Notifications
    listNotifications: (params) => api.get('/admin/notifications/', { params }),
    sendNotification: (data) => api.post('/admin/notifications/', data),
    // System Settings
    getSettings: (params) => api.get('/admin/settings/', { params }),
    createSetting: (data) => api.post('/admin/settings/', data),
    updateSetting: (id, data) => api.put(`/admin/settings/${id}/`, data),
    deleteSetting: (id) => api.delete(`/admin/settings/${id}/`),
    listCropCategories: () => api.get('/admin/settings/crop-categories/'),
    createCropCategory: (data) => api.post('/admin/settings/crop-categories/', data),
    listLivestockTypes: () => api.get('/admin/settings/livestock-types/'),
    createLivestockType: (data) => api.post('/admin/settings/livestock-types/', data),
    // Reports
    generateReport: (data) => api.post('/admin/reports/generate/', data),
    listReports: (params) => api.get('/admin/reports/history/', { params }),
    getReportHistory: (params) => api.get('/admin/reports/history/', { params }),
    deleteReport: (id) => api.delete(`/admin/reports/${id}/`),
    // Analytics
    getAnalyticsUserGrowth: (params) => api.get('/admin/analytics/user-growth/', { params }),
    getAnalyticsGeographic: () => api.get('/admin/analytics/geographic/'),
    getAnalyticsPlatformUsage: () => api.get('/admin/analytics/platform-usage/'),
    getAnalyticsRevenueByRegion: () => api.get('/admin/analytics/revenue-by-region/'),
    // Logs
    listLogs: (params) => api.get('/admin/logs/', { params }),
    
    // Admin User Management
    listAdmins: () => api.get('/admin/admins/'),
    createAdmin: (data) => api.post('/admin/admins/create/', data),
    deleteAdmin: (id) => api.delete(`/admin/admins/${id}/`),
    promoteFarmer: (id) => api.put(`/admin/farmers/${id}/`, { promote_to_admin: true }),
    
    // Knowledge Base Management
    listKnowledgeBase: (params) => api.get('crops/api/knowledge-base/', { params }),
    getKnowledgeBaseDetail: (id) => api.get(`crops/api/knowledge-base/${id}/`),
    createKnowledgeBase: (data) => api.post('crops/api/knowledge-base/', data),
    updateKnowledgeBase: (id, data) => api.put(`crops/api/knowledge-base/${id}/`, data),
    deleteKnowledgeBase: (id) => api.delete(`crops/api/knowledge-base/${id}/`),
    
    // Crop Configurations
    listCropConfigs: (params) => api.get('crops/api/crop-configs/', { params }),
    getCropConfigDetail: (id) => api.get(`crops/api/crop-configs/${id}/`),
    createCropConfig: (data) => api.post('crops/api/crop-configs/', data),
    updateCropConfig: (id, data) => api.put(`crops/api/crop-configs/${id}/`, data),
    deleteCropConfig: (id) => api.delete(`crops/api/crop-configs/${id}/`),
    
    // Crop Activity Rules
    listCropActivityRules: (params) => api.get('crops/api/crop-activity-rules/', { params }),
    getCropActivityRuleDetail: (id) => api.get(`crops/api/crop-activity-rules/${id}/`),
    createCropActivityRule: (data) => api.post('crops/api/crop-activity-rules/', data),
    updateCropActivityRule: (id, data) => api.put(`crops/api/crop-activity-rules/${id}/`, data),
    deleteCropActivityRule: (id) => api.delete(`crops/api/crop-activity-rules/${id}/`),
    
    // Options
    getCropConfigOptions: () => api.get('crops/api/crop-config-options/'),
    getAvailableCrops: () => api.get('crops/api/available-crops/'),
};
export default adminService;