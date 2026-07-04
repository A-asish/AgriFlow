// src/features/admin/services/admin.api.js
//
// ⚠️  All URL paths here are RELATIVE (no leading slash).
//     The axios instance in api.js has baseURL = http://127.0.0.1:8000/api/
//     A leading slash like '/admin/...' causes axios to ignore the baseURL
//     and hit http://127.0.0.1:8000/admin/... instead of /api/admin/...

import api from '@/services/api';

export const adminService = {
    // Authentication
    login: (data) => api.post('admin/auth/login/', data),
    getProfile: () => api.get('admin/auth/profile/'),
    updateProfile: (data) => api.put('admin/auth/profile/', data),
    changePassword: (data) => api.post('admin/auth/change-password/', data),
    logout: (data) => api.post('admin/auth/logout/', data),
    
    // Dashboard
    getStats: () => api.get('admin/dashboard/stats/'),
    getFarmerTrend: () => api.get('admin/dashboard/farmer-trend/'),
    getCropDistribution: () => api.get('admin/dashboard/crop-distribution/'),
    getRevenueTrend: () => api.get('admin/dashboard/revenue-trend/'),
    getTopCrops: () => api.get('admin/dashboard/top-crops/'),
    getRecentActivities: () => api.get('admin/dashboard/recent-activities/'),
   
    // Farmer Management
    listFarmers: (params) => api.get('admin/farmers/', { params }),
    getFarmerDetail: (id) => api.get(`admin/farmers/${id}/`),
    updateFarmer: (id, data) => api.put(`admin/farmers/${id}/`, data),
    deleteFarmer: (id) => api.delete(`admin/farmers/${id}/`),
    bulkActionFarmers: (data) => api.post('admin/farmers/bulk-action/', data),
    exportFarmers: (params) => api.get('admin/farmers/export/', { params, responseType: 'blob' }),
    
    // Admin User Management
    listAdmins: () => api.get('admin/admins/'),
    createAdmin: (data) => api.post('admin/admins/create/', data),
    deleteAdmin: (id) => api.delete(`admin/admins/${id}/`),
    promoteFarmer: (id) => api.put(`admin/farmers/${id}/`, { promote_to_admin: true }),

    // Crop Management
    listCrops: (params) => api.get('admin/crops/', { params }),
    getCropDetail: (id) => api.get(`admin/crops/${id}/`),
    deleteCrop: (id) => api.delete(`admin/crops/${id}/`),  
    registerCrop: (data) => api.post('admin/crops/register/', data),

    // Livestock Management
    listLivestock: (params) => api.get('admin/livestock/', { params }),
    getLivestockDetail: (id) => api.get(`admin/livestock/${id}/`),
    deleteLivestock: (id) => api.delete(`admin/livestock/${id}/`),
    listAnimalTypes: () => api.get('admin/livestock/animal-types/'),
    
    // Financial Management
    getFinanceDashboard: () => api.get('admin/finance/dashboard/'),
    getFinancialSummary: () => api.get('admin/dashboard/stats/'),
    listFinanceTransactions: (params) => api.get('admin/finance/transactions/', { params }),
    listTransactions: (params) => api.get('admin/finance/transactions/', { params }),
    getRevenueByFarmer: () => api.get('admin/finance/revenue-by-farmer/'),
    exportTransactions: (params) => api.get('admin/finance/export/', { params, responseType: 'blob' }),

    // Livestock Management (additional)
    getBreedingRecords: () => api.get('admin/livestock/breeding-records/'),
    getMilkStats: (params) => api.get('admin/livestock/milk-stats/', { params }),
    
    // Notifications
    listNotifications: (params) => api.get('admin/notifications/', { params }),
    getNotificationDetail: (id) => api.get(`admin/notifications/${id}/`),
    sendNotification: (data) => api.post('admin/notifications/', data),
    updateNotification: (id, data) => api.put(`admin/notifications/${id}/`, data),
    deleteNotification: (id) => api.delete(`admin/notifications/${id}/`),
    markAllNotificationsAsRead: () => api.post('admin/notifications/mark-all-read/'),
    
    // System Settings
    getSettings: (params) => api.get('admin/settings/', { params }),
    createSetting: (data) => api.post('admin/settings/', data),
    updateSetting: (id, data) => api.put(`admin/settings/${id}/`, data),
    deleteSetting: (id) => api.delete(`admin/settings/${id}/`),
    listCropCategories: () => api.get('admin/settings/crop-categories/'),
    createCropCategory: (data) => api.post('admin/settings/crop-categories/', data),
    listLivestockTypes: () => api.get('admin/settings/livestock-types/'),
    createLivestockType: (data) => api.post('admin/settings/livestock-types/', data),

    // Reports
    generateReport: (data) => api.post('admin/reports/generate/', data, { responseType: 'blob' }),
    listReports: (params) => api.get('admin/reports/history/', { params }),
    getReportStats: () => api.get('admin/reports/stats/'),
    downloadReport: (id) => api.get(`admin/reports/${id}/download/`, {
        responseType: 'blob'
    }),
    getReportHistory: (params) => api.get('admin/reports/history/', { params }),
    deleteReport: (id) => api.delete(`admin/reports/${id}/`),

    // Analytics
    getAnalyticsUserGrowth: (params) => api.get('admin/analytics/user-growth/', { params }),
    getAnalyticsGeographic: () => api.get('admin/analytics/geographic/'),
    getAnalyticsPlatformUsage: () => api.get('admin/analytics/platform-usage/'),
    getAnalyticsRevenueByRegion: () => api.get('admin/analytics/revenue-by-region/'),
    
    // Logs
    listLogs: (params) => api.get('admin/logs/', { params }),
    
    // ============================================================
    // KNOWLEDGE BASE MANAGEMENT (ADMIN DEDICATED ENDPOINTS)
    // ============================================================
    
    /**
     * List all knowledge base entries with filters and pagination
     * @param {Object} params - Filter parameters
     * @param {string} params.search - Search in name_en, name_np, category
     * @param {string} params.category - Filter by category (cereal, pulse, etc.)
     * @param {string} params.season - Filter by best_season or other_seasons
     * @param {string} params.drought_tolerance - Filter by drought_tolerance
     * @param {string} params.frost_sensitive - Filter by frost_sensitive
     * @param {string} params.water_req - Filter by water_req
     * @param {number} params.page - Page number
     * @param {number} params.page_size - Items per page
     */
    listKnowledgeBase: (params) => api.get('admin/knowledge-base/', { params }),
    
    /**
     * Get single knowledge base entry with full details
     * @param {number} id - Entry ID
     */
    getKnowledgeBaseDetail: (id) => api.get(`admin/knowledge-base/${id}/`),
    
    /**
     * Create new knowledge base entry
     * @param {Object} data - Entry data
     */
    createKnowledgeBase: (data) => api.post('admin/knowledge-base/', data),
    
    /**
     * Update knowledge base entry
     * @param {number} id - Entry ID
     * @param {Object} data - Updated data
     */
    updateKnowledgeBase: (id, data) => api.put(`admin/knowledge-base/${id}/`, data),
    
    /**
     * Delete knowledge base entry
     * @param {number} id - Entry ID
     */
    deleteKnowledgeBase: (id) => api.delete(`admin/knowledge-base/${id}/`),
    
    /**
     * Bulk action on knowledge base entries
     * @param {Array} ids - Array of entry IDs
     * @param {string} action - Action to perform (delete, export)
     */
    bulkActionKnowledgeBase: (ids, action) => api.post('admin/knowledge-base/bulk-action/', { ids, action }),
    
    /**
     * Export knowledge base data
     * @param {string} format - Export format (csv, excel)
     * @param {Object} filters - Optional filters
     */
    exportKnowledgeBase: (format = 'csv', filters = {}) => {
        const params = new URLSearchParams({ format, ...filters });
        return api.get(`admin/knowledge-base/export/?${params.toString()}`, {
            responseType: 'blob'
        });
    },
    
    /**
     * Get filter options for dropdowns (categories, seasons, etc.)
     */
    getKnowledgeBaseOptions: () => api.get('admin/knowledge-base/options/'),
    
    // ============================================================
    // KNOWLEDGE BASE MANAGEMENT (PUBLIC/API ENDPOINTS - Legacy)
    // These are kept for backward compatibility but prefer admin endpoints above
    // ============================================================
    
    /**
     * @deprecated Use listKnowledgeBase instead
     */
    listKnowledgeBasePublic: (params) => api.get('crops/knowledge-base/', { params }),
    
    /**
     * @deprecated Use getKnowledgeBaseDetail instead
     */
    getKnowledgeBasePublic: (id) => api.get(`crops/knowledge-base/${id}/`),
    
    /**
     * @deprecated Use createKnowledgeBase instead
     */
    createKnowledgeBasePublic: (data) => api.post('crops/knowledge-base/', data),
    
    /**
     * @deprecated Use updateKnowledgeBase instead
     */
    updateKnowledgeBasePublic: (id, data) => api.put(`crops/knowledge-base/${id}/`, data),
    
    /**
     * @deprecated Use deleteKnowledgeBase instead
     */
    deleteKnowledgeBasePublic: (id) => api.delete(`crops/knowledge-base/${id}/`),
    
    // ============================================================
    // CROP CONFIGURATIONS
    // ============================================================
    
    listCropConfigs: (params) => api.get('crops/crop-configs/', { params }),
    getCropConfigDetail: (id) => api.get(`crops/crop-configs/${id}/`),
    createCropConfig: (data) => api.post('crops/crop-configs/', data),
    updateCropConfig: (id, data) => api.put(`crops/crop-configs/${id}/`, data),
    deleteCropConfig: (id) => api.delete(`crops/crop-configs/${id}/`),
    
    // ============================================================
    // CROP ACTIVITY RULES
    // ============================================================
    
    listCropActivityRules: (params) => api.get('crops/crop-activity-rules/', { params }),
    getCropActivityRuleDetail: (id) => api.get(`crops/crop-activity-rules/${id}/`),
    createCropActivityRule: (data) => api.post('crops/crop-activity-rules/', data),
    updateCropActivityRule: (id, data) => api.put(`crops/crop-activity-rules/${id}/`, data),
    deleteCropActivityRule: (id) => api.delete(`crops/crop-activity-rules/${id}/`),
    
    // ============================================================
    // OPTIONS & HELPERS
    // ============================================================
    
    getCropConfigOptions: () => api.get('crops/crop-config-options/'),
    getAvailableCrops: () => api.get('crops/available-crops/'),
    getCropVarieties: (params) => api.get('crops/crop-varieties/', { params }),
};

export default adminService;