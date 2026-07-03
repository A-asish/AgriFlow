import { getNotificationType } from '@/features/common/utils/notificationFilters';
import { getAppLanguage } from '@/shared/utils/appLanguage';

const PRIORITY_ORDER = { critical: 0, urgent: 1, high: 2, medium: 3, low: 4 };

export function normalizeReminder(activity, source) {
    const resolvedSource =
        source ??
        (getNotificationType(activity) === 'livestock' ? 'livestock' : 'crop');

    const id = activity.notification_id ?? activity.id;
    const sourceId = activity.source_id;
    
    const rawCrop = activity.crop_id ?? activity.crop;
    const cropId = (typeof rawCrop === 'object' && rawCrop !== null)
        ? (rawCrop.id ?? rawCrop.crop_id)
        : rawCrop ?? (resolvedSource === 'crop' ? sourceId : null);

    const rawAnimal = activity.animal_id ?? activity.animal;
    const animalId = (typeof rawAnimal === 'object' && rawAnimal !== null)
        ? (rawAnimal.id ?? rawAnimal.animal_id)
        : rawAnimal ?? (resolvedSource === 'livestock' ? sourceId : null);

    let actionUrl = activity.action_url;
    if (!actionUrl) {
        if (resolvedSource === 'crop' && cropId) {
            actionUrl = `/crops/${cropId}`;
        } else if (resolvedSource === 'livestock' && animalId) {
            actionUrl = `/livestock/${animalId}`;
        }
    }

    const dueDate =
        activity.due_date ??
        activity.scheduled_date ??
        activity.reminder_date ??
        activity.created_at ??
        null;

    const lang = getAppLanguage();
    const title = lang === 'np'
        ? (activity.title_np ?? activity.title ?? activity.activity_type ?? activity.type_display ?? 'स्मरणपत्र')
        : (activity.title ?? activity.activity_type ?? activity.type_display ?? 'Reminder');

    const message = lang === 'np'
        ? (activity.message_np ?? activity.description_np ?? activity.details_np ?? activity.message ?? activity.description ?? activity.details ?? '')
        : (activity.message ?? activity.description ?? activity.details ?? '');

    return {
        id,
        source: resolvedSource,
        title,
        message,
        dueDate,
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
