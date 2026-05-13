export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NP', {
        style: 'currency',
        currency: 'NPR',
        minimumFractionDigits: 0,
    }).format(amount).replace('NPR', 'Rs.');
};
export const formatDate = (dateString) => {
    if (!dateString)
        return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};
export const getColorByStatus = (status) => {
    const s = status?.toLowerCase();
    if (['active', 'completed', 'success', 'good', 'elite'].includes(s))
        return 'emerald';
    if (['pending', 'processing', 'treatment', 'fair', 'pro'].includes(s))
        return 'amber';
    if (['inactive', 'cancelled', 'failed', 'poor', 'urgent', 'high'].includes(s))
        return 'rose';
    if (['low', 'medium'].includes(s))
        return 'blue';
    return 'slate';
};
export const getInitials = (name) => {
    if (!name)
        return '?';
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();
};
