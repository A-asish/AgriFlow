/**
 * Extract a human-readable message from axios error responses.
 * Handles common Django REST Framework shapes: detail, non_field_errors,
 * per-field arrays, nested { errors: { ... } }, and simple { message } / { error }.
 */
function humanizeKey(key) {
    return String(key)
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function firstFieldMessage(data) {
    if (!data || typeof data !== 'object') return '';

    if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
        const inner = firstFieldMessage(data.errors);
        if (inner) return inner;
    }

    const skip = new Set([
        'success',
        'code',
        'detail',
        'message',
        'non_field_errors',
    ]);

    for (const [key, val] of Object.entries(data)) {
        if (skip.has(key)) continue;

        if (key === 'error' && val && typeof val === 'object' && !Array.isArray(val)) {
            const inner = firstFieldMessage(val);
            if (inner) return inner;
            continue;
        }

        if (Array.isArray(val) && val.length) {
            const first = val[0];
            if (typeof first === 'string' && first.trim()) {
                return `${humanizeKey(key)}: ${first}`;
            }
        } else if (typeof val === 'string' && val.trim()) {
            return `${humanizeKey(key)}: ${val}`;
        } else if (val && typeof val === 'object' && !Array.isArray(val)) {
            const inner = firstFieldMessage(val);
            if (inner) return inner;
        }
    }
    return '';
}

export function getApiErrorMessage(error, fallback = 'Something went wrong') {
    if (!error?.response) {
        if (error?.code === 'ECONNABORTED' || error?.message?.includes?.('timeout')) {
            return 'Request timed out. Please try again.';
        }
        if (error?.message === 'Network Error') {
            return 'Network error. Check your connection and try again.';
        }
        if (typeof error?.message === 'string' && error.message) {
            return error.message;
        }
        return fallback;
    }

    const data = error.response.data;

    if (typeof data === 'string' && data.trim()) {
        return data;
    }

    if (!data || typeof data !== 'object') {
        return fallback;
    }

    if (Array.isArray(data.non_field_errors) && data.non_field_errors.length) {
        return data.non_field_errors.map(String).join(' ');
    }

    const detail = data.detail;
    if (typeof detail === 'string' && detail.trim()) {
        return detail;
    }
    if (Array.isArray(detail) && detail.length) {
        return detail.map(String).join(' ');
    }

    if (typeof data.message === 'string' && data.message.trim()) {
        return data.message;
    }
    if (typeof data.error === 'string' && data.error.trim()) {
        return data.error;
    }

    const fieldMsg = firstFieldMessage(data);
    if (fieldMsg) {
        return fieldMsg;
    }

    return fallback;
}
