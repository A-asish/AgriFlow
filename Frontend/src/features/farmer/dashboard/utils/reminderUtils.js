const PRIORITY_ORDER = { critical: 0, urgent: 1, high: 2, medium: 3, low: 4 };

export function normalizeReminder(activity, source) {
    const resolvedSource =
        source ??
        (activity.type === 'livestock' || activity.notification_type === 'livestock'
            ? 'livestock'
            : 'crop');

    const id = activity.notification_id ?? activity.id;
    const sourceId = activity.source_id;
    const cropId =
        activity.crop_id ?? activity.crop ?? (resolvedSource === 'crop' ? sourceId : null);
    const animalId =
        activity.animal_id ??
        activity.animal ??
        (resolvedSource === 'livestock' ? sourceId : null);

    let actionUrl = activity.action_url;
    if (!actionUrl) {
        if (resolvedSource === 'crop' && cropId) {
            actionUrl = `/crops/${cropId}`;
        } else if (resolvedSource === 'livestock' && animalId) {
            actionUrl = `/livestock/${animalId}`;
        }
    }

    return {
        id,
        source: resolvedSource,
        title:
            activity.title ??
            activity.activity_type ??
            activity.type_display ??
            'Reminder',
        message: activity.message ?? activity.description ?? activity.details ?? '',
        dueDate:
            activity.due_date ??
            activity.scheduled_date ??
            activity.reminder_date ??
            activity.created_at ??
            null,
        priority: activity.priority ?? 'medium',
        priorityDisplay: activity.priority_display,
        isRead: Boolean(activity.is_read),
        isCompleted: Boolean(activity.is_completed),
        cropId,
        animalId,
        cropName: activity.crop_name ?? activity.crop?.name,
        animalTag: activity.tag_number ?? activity.animal_tag ?? activity.animal?.tag_number,
        actionUrl,
        actionLabel: activity.action_label,
        createdAt: activity.created_at,
        raw: activity,
    };
}

export function sortAlertsByPriority(alerts) {
    return [...alerts].sort((a, b) => {
        const pa = PRIORITY_ORDER[a.priority] ?? 99;
        const pb = PRIORITY_ORDER[b.priority] ?? 99;
        if (pa !== pb) return pa - pb;
        const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return da - db;
    });
}
