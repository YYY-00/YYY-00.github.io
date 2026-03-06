/**
 * Event Booking System - Utility Functions
 */

app.utils = {
  /**
   * Generate a unique ID
   * @param {string} prefix - ID prefix
   * @returns {string} Unique ID
   */
  generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Generate a UUID v4
   * @returns {string} UUID
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  /**
   * Format currency
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code (default: USD)
   * @returns {string} Formatted currency
   */
  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  /**
   * Format date
   * @param {Date|string|number} date - Date to format
   * @param {object} options - Intl.DateTimeFormat options
   * @returns {string} Formatted date
   */
  formatDate(date, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(new Date(date));
  },

  /**
   * Format time
   * @param {Date|string|number} date - Date to format
   * @param {string} timeZone - Time zone (optional)
   * @returns {string} Formatted time
   */
  formatTime(date, timeZone) {
    const options = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      ...(timeZone && { timeZone })
    };
    return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
  },

  /**
   * Format date and time
   * @param {Date|string|number} date - Date to format
   * @param {string} timeZone - Time zone (optional)
   * @returns {string} Formatted date and time
   */
  formatDateTime(date, timeZone) {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      ...(timeZone && { timeZone })
    };
    return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
  },

  /**
   * Debounce function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in ms
   * @returns {Function} Debounced function
   */
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle function
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in ms
   * @returns {Function} Throttled function
   */
  throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Deep clone object
   * @param {*} obj - Object to clone
   * @returns {*} Cloned object
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));

    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }
    return cloned;
  },

  /**
   * Get query parameter from URL
   * @param {string} name - Parameter name
   * @returns {string|null} Parameter value
   */
  getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  },

  /**
   * Set query parameter in URL
   * @param {string} name - Parameter name
   * @param {string} value - Parameter value
   */
  setQueryParam(name, value) {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.pushState({}, '', url);
  },

  /**
   * Remove query parameter from URL
   * @param {string} name - Parameter name
   */
  removeQueryParam(name) {
    const url = new URL(window.location);
    url.searchParams.delete(name);
    window.history.pushState({}, '', url);
  },

  /**
   * Show toast notification
   * @param {string} message - Message to display
   * @param {string} type - Type: success, error, warning, info
   * @param {number} duration - Duration in ms
   */
  toast(message, type = 'info', duration = 3000) {
    // Remove existing toast if any
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-message">${message}</span>
        <button class="toast-close">&times;</button>
      </div>
    `;

    // Add styles if not already present
    if (!document.querySelector('#toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        .toast-notification {
          position: fixed;
          bottom: 20px;
          right: 20px;
          min-width: 300px;
          max-width: 500px;
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .toast-success { background: #d1fae5; color: #065f46; border-left: 4px solid #10b981; }
        .toast-error { background: #fee2e2; color: #991b1b; border-left: 4px solid #ef4444; }
        .toast-warning { background: #fef3c7; color: #92400e; border-left: 4px solid #f59e0b; }
        .toast-info { background: #dbeafe; color: #1e40af; border-left: 4px solid #3b82f6; }
        .toast-content { display: flex; justify-content: space-between; align-items: center; }
        .toast-close { background: none; border: none; font-size: 24px; cursor: pointer; color: inherit; }
      `;
      document.head.appendChild(style);
    }

    // Add close functionality
    toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());

    document.body.appendChild(toast);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => toast.remove(), duration);
    }
  },

  /**
   * Download data as file
   * @param {string} data - Data to download
   * @param {string} filename - Filename
   * @param {string} type - MIME type
   */
  download(data, filename, type = 'text/plain') {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  },

  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @returns {Promise<boolean>} Success
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return true;
      } catch (fallbackErr) {
        document.body.removeChild(textarea);
        return false;
      }
    }
  },

  /**
   * Escape HTML to prevent XSS
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   */
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * Truncate text
   * @param {string} str - String to truncate
   * @param {number} length - Max length
   * @param {string} suffix - Suffix to add (default: ...)
   * @returns {string} Truncated string
   */
  truncate(str, length, suffix = '...') {
    if (str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
  },

  /**
   * Get user's time zone
   * @returns {string} Time zone identifier
   */
  getTimeZone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  },

  /**
   * Check if date is today
   * @param {Date|string|number} date - Date to check
   * @returns {boolean} True if today
   */
  isToday(date) {
    const d = new Date(date);
    const today = new Date();
    return d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
  },

  /**
   * Parse seat identifier (e.g., "A15" -> row: A, seat: 15)
   * @param {string} seatId - Seat identifier
   * @returns {object} Parsed seat info
   */
  parseSeatId(seatId) {
    const match = seatId.match(/^([A-Z]+)(\d+)$/);
    if (!match) return null;
    return {
      row: match[1],
      number: parseInt(match[2], 10),
      id: seatId
    };
  },

  /**
   * Validate email address
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid
   */
  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  /**
   * Localized number formatting
   * @param {number} num - Number to format
   * @param {object} options - Intl.NumberFormat options
   * @returns {string} Formatted number
   */
  formatNumber(num, options = {}) {
    return new Intl.NumberFormat('en-US', options).format(num);
  },

  /**
   * Calculate percentage
   * @param {number} value - Value
   * @param {number} total - Total
   * @returns {number} Percentage
   */
  calculatePercentage(value, total) {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }
};
