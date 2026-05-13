export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NP', {
        style: 'currency',
        currency: 'NPR',
    }).format(amount);
};
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-NP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};
