/**
 * Format currency (Yang) with proper separators
 */
export function formatCurrency(amount) {
    return new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Format currency compactly (e.g., 1.5M, 20k)
 */
export function formatCompactCurrency(amount) {
    if (amount >= 1000000000) {
        return `${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
        return `${(amount / 1000).toFixed(1)}k`;
    }
    return amount.toString();
}

/**
 * Format time in seconds to readable format
 */
export function formatTime(seconds) {
    if (seconds >= 60) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        return `${minutes}m ${secs}s`;
    }
    return `${seconds.toFixed(1)}s`;
}
