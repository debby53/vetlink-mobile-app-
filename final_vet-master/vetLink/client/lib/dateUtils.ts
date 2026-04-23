/**
 * Date utility functions for handling Java LocalDateTime array format
 * and other date formats from the backend
 */

/**
 * Parse date value that could be in various formats:
 * - Java LocalDateTime array: [year, month, day, hour, minute, second, nano]
 * - ISO string
 * - Timestamp number
 */
export const parseDate = (dateValue: any): Date => {
    if (!dateValue) return new Date();

    // Handle array format from Java LocalDateTime: [year, month, day, hour, minute, second, nano]
    if (Array.isArray(dateValue)) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
        // month is 1-indexed in the array, but Date constructor expects 0-indexed
        return new Date(year, month - 1, day, hour, minute, second);
    }

    // Handle string or number format
    return new Date(dateValue);
};

/**
 * Format date for display (short format)
 */
export const formatDate = (dateValue: any): string => {
    try {
        const date = parseDate(dateValue);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (err) {
        console.error('Error formatting date:', err);
        return 'N/A';
    }
};

/**
 * Format date and time for display (long format)
 */
export const formatDateTime = (dateValue: any): string => {
    try {
        const date = parseDate(dateValue);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (err) {
        console.error('Error formatting date time:', err);
        return 'N/A';
    }
};

/**
 * Format date for input fields (YYYY-MM-DD)
 */
export const formatDateForInput = (dateValue: any): string => {
    try {
        const date = parseDate(dateValue);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
    } catch (err) {
        console.error('Error formatting date for input:', err);
        return '';
    }
};

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export const getRelativeTime = (dateValue: any): string => {
    try {
        const date = parseDate(dateValue);
        if (isNaN(date.getTime())) return 'N/A';

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffSec < 60) return 'just now';
        if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
        if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
        if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;

        return formatDate(dateValue);
    } catch (err) {
        console.error('Error getting relative time:', err);
        return 'N/A';
    }
};
