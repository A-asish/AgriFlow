// src/features/farmer/dashboard/utils/reminderUtils.js

/**
 * Normalize a reminder/alert from the API into a consistent format for the UI
 */
export function normalizeReminder(alert, source) {
    // ✅ Debug log to see what's coming in
    console.log('🔍 normalizeReminder called:', { alert, source });
    
    if (!alert) {
        console.warn('⚠️ normalizeReminder called with null/undefined alert');
        return null;
    }

    // Determine source if not provided
    const resolvedSource = source || alert.source || 
        (alert.notification_type === 'livestock' ? 'livestock' : 'crop');

    // ✅ Simple ID mapping - use alert.id directly
    const id = alert.id || alert.notification_id || null;

    // ✅ Simple title and message
    const title = alert.title || alert.activity_type || 'Reminder';
    const message = alert.message || alert.description || alert.details || '';

    // ✅ Simple priority mapping
    const priority = alert.priority || 'medium';
    const priorityDisplay = alert.priority_display || 
        (priority === 'critical' ? 'Critical - Overdue' :
         priority === 'urgent' ? 'Urgent - Today' :
         priority === 'high' ? 'High - 1-2 days' :
         priority === 'medium' ? 'Medium - 3-4 days' :
         'Low - 5+ days');

    // ✅ Due date
    const dueDate = alert.due_date || alert.scheduled_date || alert.created_at || null;

    // ✅ Action URL
    let actionUrl = alert.action_url || null;
    if (!actionUrl && alert.source_id) {
        if (resolvedSource === 'crop') {
            actionUrl = `/crops/${alert.source_id}`;
        } else if (resolvedSource === 'livestock') {
            actionUrl = `/livestock/${alert.source_id}`;
        }
    }

    return {
        id: id,
        source: resolvedSource,
        title: title,
        message: message,
        priority: priority,
        priorityDisplay: priorityDisplay,
        dueDate: dueDate,
        isRead: alert.is_read || false,
        isCompleted: alert.is_completed || false,
        actionUrl: actionUrl,
        actionLabel: alert.action_label || 'View Details',
        createdAt: alert.created_at,
        sourceId: alert.source_id,
        cropName: alert.crop_name || alert.crop?.name,
        animalTag: alert.animal_tag || alert.animal?.tag_number,
    };
}

/**
 * Sort alerts by priority (critical first, then by due date)
 */
export function sortAlertsByPriority(alerts) {
    const priorityOrder = { critical: 0, urgent: 1, high: 2, medium: 3, low: 4 };
    
    return [...alerts].sort((a, b) => {
        const pa = priorityOrder[a.priority] ?? 99;
        const pb = priorityOrder[b.priority] ?? 99;
        if (pa !== pb) return pa - pb;
        
        const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return da - db;
    });
}