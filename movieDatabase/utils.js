// ===== Utility Functions =====

/**
 * Debounce function - delays function execution until after wait time has elapsed
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * LocalStorage helper functions
 */
const Storage = {
    /**
     * Get item from localStorage
     * @param {string} key - Storage key
     * @returns {*} Parsed data or null
     */
    get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    },

    /**
     * Set item in localStorage
     * @param {string} key - Storage key
     * @param {*} value - Value to store (will be JSON stringified)
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error writing to localStorage:', error);
        }
    },

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    }
};

/**
 * API Response Cache
 */
class APICache {
    constructor(defaultTTL = 5 * 60 * 1000) { // 5 minutes default TTL
        this.cache = new Map();
        this.defaultTTL = defaultTTL;
        this.loadCache();
    }

    /**
     * Load cache from localStorage
     */
    loadCache() {
        const savedCache = Storage.get('api_cache');
        if (savedCache) {
            const now = Date.now();
            for (const [key, value] of Object.entries(savedCache)) {
                if (value.expiry > now) {
                    this.cache.set(key, value);
                }
            }
        }
    }

    /**
     * Save cache to localStorage
     */
    saveCache() {
        const cacheObj = {};
        this.cache.forEach((value, key) => {
            cacheObj[key] = value;
        });
        Storage.set('api_cache', cacheObj);
    }

    /**
     * Get cached response
     * @param {string} key - Cache key
     * @returns {*} Cached data or null
     */
    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            this.saveCache();
            return null;
        }

        return item.data;
    }

    /**
     * Set cache with TTL
     * @param {string} key - Cache key
     * @param {*} data - Data to cache
     * @param {number} ttl - Time to live in milliseconds
     */
    set(key, data, ttl = this.defaultTTL) {
        this.cache.set(key, {
            data,
            expiry: Date.now() + ttl
        });
        this.saveCache();
    }

    /**
     * Clear all cache
     */
    clear() {
        this.cache.clear();
        Storage.remove('api_cache');
    }

    /**
     * Clear specific cache key
     * @param {string} key - Cache key to clear
     */
    clearKey(key) {
        this.cache.delete(key);
        this.saveCache();
    }
}

/**
 * DOM helper functions
 */
const DOM = {
    /**
     * Create element with attributes
     * @param {string} tag - HTML tag
     * @param {Object} attrs - Attributes object
     * @param {string|HTMLElement} content - Content
     * @returns {HTMLElement} Created element
     */
    create(tag, attrs = {}, content = null) {
        const element = document.createElement(tag);

        for (const [key, value] of Object.entries(attrs)) {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                for (const [dataKey, dataValue] of Object.entries(value)) {
                    element.dataset[dataKey] = dataValue;
                }
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else {
                element.setAttribute(key, value);
            }
        }

        if (content) {
            if (typeof content === 'string') {
                element.innerHTML = content;
            } else if (content instanceof HTMLElement) {
                element.appendChild(content);
            }
        }

        return element;
    },

    /**
     * Add event listener with delegation support
     * @param {HTMLElement|string} target - Target element or selector
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     * @param {string} delegate - Delegate selector (optional)
     */
    on(target, event, handler, delegate = null) {
        const element = typeof target === 'string'
            ? document.querySelector(target)
            : target;

        if (delegate) {
            element.addEventListener(event, (e) => {
                const matched = e.target.closest(delegate);
                if (matched && element.contains(matched)) {
                    handler.call(matched, e);
                }
            });
        } else {
            element.addEventListener(event, handler);
        }
    }
};

/**
 * Format date
 * @param {string} dateString - Date string
 * @param {string} format - Format type ('short', 'long', 'year')
 * @returns {string} Formatted date
 */
function formatDate(dateString, format = 'short') {
    if (!dateString) return '未知';

    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    switch (format) {
        case 'year':
            return year.toString();
        case 'long':
            return `${year}年${month}月${day}日`;
        case 'short':
        default:
            return `${year}-${month}-${day}`;
    }
}

/**
 * Format runtime
 * @param {number} minutes - Runtime in minutes
 * @returns {string} Formatted runtime
 */
function formatRuntime(minutes) {
    if (!minutes) return '未知';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`;
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds
 */
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, duration);
    }
}

/**
 * Show/hide loading spinner
 * @param {boolean} show - Show or hide spinner
 */
function toggleLoading(show = true) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        if (show) {
            spinner.classList.remove('hidden');
        } else {
            spinner.classList.add('hidden');
        }
    }
}

/**
 * Truncate text
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength = 100) {
    if (!text) return '';
    return text.length > maxLength
        ? text.substring(0, maxLength) + '...'
        : text;
}

/**
 * Get image URL
 * @param {string} path - Image path
 * @param {string} size - Size ('w500', 'w780', 'original')
 * @returns {string} Full image URL
 */
function getImageUrl(path, size = 'w500') {
    if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
    return `https://image.tmdb.org/t/p/${size}${path}`;
}

/**
 * Get YouTube embed URL from video key
 * @param {string} key - YouTube video key
 * @returns {string} YouTube embed URL
 */
function getYouTubeUrl(key) {
    return `https://www.youtube.com/embed/${key}`;
}
