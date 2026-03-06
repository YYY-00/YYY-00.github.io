import { generateId } from './utils.js';

/**
 * 缓存管理器
 * 使用 localStorage 实现 API 响应缓存
 */
export class CacheManager {
    constructor(prefix = 'movie_db_cache_') {
        this.prefix = prefix;
        this.defaultTTL = 3600000; // 默认缓存时间：1小时（毫秒）
        this.init();
    }

    /**
     * 初始化缓存
     */
    init() {
        try {
            // 清理过期缓存
            this.cleanExpired();
        } catch (error) {
            console.warn('缓存初始化失败:', error);
        }
    }

    /**
     * 生成缓存键
     * @param {string} key - 原始键
     * @returns {string} 缓存键
     */
    getCacheKey(key) {
        return `${this.prefix}${key}`;
    }

    /**
     * 设置缓存
     * @param {string} key - 缓存键
     * @param {*} value - 缓存值
     * @param {number} ttl - 存活时间（毫秒）
     */
    set(key, value, ttl = this.defaultTTL) {
        try {
            const cacheItem = {
                id: generateId(),
                data: value,
                timestamp: Date.now(),
                ttl: ttl,
                expiresAt: Date.now() + ttl
            };
            localStorage.setItem(this.getCacheKey(key), JSON.stringify(cacheItem));
            return true;
        } catch (error) {
            console.warn('缓存设置失败:', error);
            return false;
        }
    }

    /**
     * 获取缓存
     * @param {string} key - 缓存键
     * @returns {*} 缓存值或 null
     */
    get(key) {
        try {
            const cacheKey = this.getCacheKey(key);
            const item = localStorage.getItem(cacheKey);

            if (!item) return null;

            const cacheItem = JSON.parse(item);

            // 检查是否过期
            if (Date.now() > cacheItem.expiresAt) {
                this.remove(key);
                return null;
            }

            return cacheItem.data;
        } catch (error) {
            console.warn('缓存读取失败:', error);
            return null;
        }
    }

    /**
     * 移除缓存
     * @param {string} key - 缓存键
     */
    remove(key) {
        try {
            localStorage.removeItem(this.getCacheKey(key));
            return true;
        } catch (error) {
            console.warn('缓存删除失败:', error);
            return false;
        }
    }

    /**
     * 检查缓存是否存在且未过期
     * @param {string} key - 缓存键
     * @returns {boolean} 是否有效
     */
    has(key) {
        return this.get(key) !== null;
    }

    /**
     * 清空所有缓存
     */
    clear() {
        try {
            const keys = this.getAllKeys();
            keys.forEach(key => localStorage.removeItem(key));
            return true;
        } catch (error) {
            console.warn('缓存清空失败:', error);
            return false;
        }
    }

    /**
     * 获取所有缓存键
     * @returns {string[]} 缓存键数组
     */
    getAllKeys() {
        try {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.prefix)) {
                    keys.push(key);
                }
            }
            return keys;
        } catch (error) {
            console.warn('获取缓存键失败:', error);
            return [];
        }
    }

    /**
     * 清理过期缓存
     */
    cleanExpired() {
        try {
            const keys = this.getAllKeys();
            const now = Date.now();

            keys.forEach(key => {
                try {
                    const item = localStorage.getItem(key);
                    if (item) {
                        const cacheItem = JSON.parse(item);
                        if (now > cacheItem.expiresAt) {
                            localStorage.removeItem(key);
                        }
                    }
                } catch {
                    // 解析失败，删除该缓存项
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.warn('清理过期缓存失败:', error);
        }
    }

    /**
     * 获取缓存统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        try {
            const keys = this.getAllKeys();
            let totalSize = 0;
            let itemCount = 0;

            keys.forEach(key => {
                const item = localStorage.getItem(key);
                if (item) {
                    totalSize += item.length;
                    itemCount++;
                }
            });

            return {
                itemCount,
                totalSize,
                totalSizeKB: (totalSize / 1024).toFixed(2),
                oldestItem: this.getOldestItem(),
                newestItem: this.getNewestItem()
            };
        } catch (error) {
            console.warn('获取缓存统计失败:', error);
            return {
                itemCount: 0,
                totalSize: 0,
                totalSizeKB: '0'
            };
        }
    }

    /**
     * 获取最早的缓存项
     */
    getOldestItem() {
        const keys = this.getAllKeys();
        let oldest = null;
        let oldestTimestamp = Infinity;

        keys.forEach(key => {
            try {
                const item = localStorage.getItem(key);
                if (item) {
                    const cacheItem = JSON.parse(item);
                    if (cacheItem.timestamp < oldestTimestamp) {
                        oldestTimestamp = cacheItem.timestamp;
                        oldest = key.replace(this.prefix, '');
                    }
                }
            } catch {}
        });

        return oldest;
    }

    /**
     * 获取最新的缓存项
     */
    getNewestItem() {
        const keys = this.getAllKeys();
        let newest = null;
        let newestTimestamp = -Infinity;

        keys.forEach(key => {
            try {
                const item = localStorage.getItem(key);
                if (item) {
                    const cacheItem = JSON.parse(item);
                    if (cacheItem.timestamp > newestTimestamp) {
                        newestTimestamp = cacheItem.timestamp;
                        newest = key.replace(this.prefix, '');
                    }
                }
            } catch {}
        });

        return newest;
    }

    /**
     * 为 API 请求生成缓存键
     * @param {string} endpoint - API 端点
     * @param {Object} params - 请求参数
     * @returns {string} 缓存键
     */
    generateApiCacheKey(endpoint, params = {}) {
        const paramsString = Object.keys(params)
            .sort()
            .map(key => `${key}=${JSON.stringify(params[key])}`)
            .join('&');
        return `api_${endpoint}_${paramsString}`;
    }
}

// 创建全局缓存实例
export const cache = new CacheManager();

/**
 * 带缓存的 fetch 请求
 * @param {string} url - 请求 URL
 * @param {Object} options - fetch 选项
 * @param {string} cacheKey - 缓存键
 * @param {number} ttl - 缓存时间
 * @returns {Promise} Promise 对象
 */
export async function cachedFetch(url, options = {}, cacheKey = null, ttl = 3600000) {
    // 如果提供了缓存键，先尝试从缓存读取
    if (cacheKey) {
        const cached = cache.get(cacheKey);
        if (cached) {
            return cached;
        }
    }

    // 发起请求
    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // 如果提供了缓存键，将结果存入缓存
    if (cacheKey) {
        cache.set(cacheKey, data, ttl);
    }

    return data;
}
