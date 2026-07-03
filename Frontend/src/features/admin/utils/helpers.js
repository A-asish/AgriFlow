// src/features/admin/utils/helpers.js

// Format currency with K, L, Cr suffixes for compact display
export const formatCompactCurrency = (amount) => {
  if (!amount && amount !== 0) return 'Rs. 0';
  
  const num = Number(amount);
  
  if (num === 0) return 'Rs. 0';
  
  if (num >= 10000000) {
    return `Rs. ${(num / 10000000).toFixed(1)}Cr`;
  }
  if (num >= 1000000) {
    return `Rs. ${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 100000) {
    return `Rs. ${(num / 100000).toFixed(1)}L`;
  }
  if (num >= 1000) {
    return `Rs. ${(num / 1000).toFixed(1)}K`;
  }
  
  return `Rs. ${num.toLocaleString('en-IN')}`;
};

// Format currency with Intl (full format for detailed views)
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'Rs. 0';
  
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('NPR', 'Rs.');
};

// Format number with K, L, Cr suffixes (for counts like farmers, crops, etc.)
export const formatCompactNumber = (num) => {
  if (!num && num !== 0) return '0';
  
  const number = Number(num);
  
  if (number === 0) return '0';
  
  if (number >= 10000000) {
    return `${(number / 10000000).toFixed(1)}Cr`;
  }
  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  }
  if (number >= 100000) {
    return `${(number / 100000).toFixed(1)}L`;
  }
  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}K`;
  }
  
  return number.toString();
};

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '-';
  }
};

// Format date with time
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
};

// Get color by status (for badges)
export const getColorByStatus = (status) => {
  const s = status?.toLowerCase();
  if (['active', 'completed', 'success', 'good', 'elite'].includes(s)) return 'emerald';
  if (['pending', 'processing', 'treatment', 'fair', 'pro'].includes(s)) return 'amber';
  if (['inactive', 'cancelled', 'failed', 'poor', 'urgent', 'high'].includes(s)) return 'rose';
  if (['low', 'medium'].includes(s)) return 'blue';
  if (['harvested', 'done'].includes(s)) return 'purple';
  return 'slate';
};

// Get color class by status
export const getStatusColorClass = (status) => {
  const color = getColorByStatus(status);
  const colors = {
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    rose: 'bg-rose-100 text-rose-700 border-rose-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  return colors[color] || colors.slate;
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Get random color for avatar
export const getAvatarColor = (name) => {
  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
    'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
    'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
    'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
  ];
  
  if (!name) return colors[0];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0;
  }
  return colors[Math.abs(hash) % colors.length];
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Format percentage
export const formatPercentage = (value) => {
  if (!value && value !== 0) return '0%';
  return `${Math.round(value)}%`;
};

// Calculate percentage change
export const calculatePercentageChange = (current, previous) => {
  if (!previous || previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Format phone number (Nepali format)
export const formatPhoneNumber = (phone) => {
  if (!phone) return '-';
  const cleaned = phone.toString().replace(/\D/g, '');
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  return phone;
};

// Get file size in readable format
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Capitalize first letter of each word
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Check if a string is a valid UUID
export const isValidUUID = (str) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Debounce function for search inputs
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};