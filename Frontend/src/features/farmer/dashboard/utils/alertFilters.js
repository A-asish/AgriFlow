// src/features/farmer/dashboard/utils/alertFilters.js

export const applyAlertFilters = (alerts, filters) => {
    let filtered = [...alerts];
    
    // Filter by source
    if (filters.source && filters.source !== 'all') {
        filtered = filtered.filter(alert => alert.source === filters.source);
    }
    
    // Filter by priority
    if (filters.priority && filters.priority !== 'all') {
        filtered = filtered.filter(alert => alert.priority === filters.priority);
    }
    
    // Filter by due date
    if (filters.dueDate && filters.dueDate !== 'all') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + 7);
        
        const monthEnd = new Date(today);
        monthEnd.setMonth(today.getMonth() + 1);
        
        filtered = filtered.filter(alert => {
            if (!alert.dueDate) return false;
            const dueDate = new Date(alert.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            
            switch (filters.dueDate) {
                case 'overdue':
                    return dueDate < today;
                case 'today':
                    return dueDate.getTime() === today.getTime();
                case 'upcoming':
                    return dueDate > today && dueDate <= weekEnd;
                case 'this_week':
                    return dueDate >= today && dueDate <= weekEnd;
                case 'this_month':
                    return dueDate >= today && dueDate <= monthEnd;
                default:
                    return true;
            }
        });
    }
    
    // ✅ Apply sorting
    if (filters.sort === 'priority') {
        const priorityOrder = { critical: 1, urgent: 2, high: 3, medium: 4, low: 5 };
        filtered.sort((a, b) => (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99));
    } 
    else if (filters.sort === 'date_newest') {
        // ✅ LATEST FIRST (newest to oldest)
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } 
    else if (filters.sort === 'date_oldest') {
        // Oldest first
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    
    return filtered;
};

export const paginateAlerts = (items, currentPage, itemsPerPage) => {
    const total = items.length;
    const totalPages = Math.ceil(total / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, total);
    
    return {
        items: items.slice(startIndex, endIndex),
        total,
        totalPages,
        currentPage,
        startIndex: startIndex + 1,
        endIndex,
    };
};