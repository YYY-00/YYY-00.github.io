// 缓存管理系统
class APICache {
    constructor() {
        this.cache = new Map();
        this.timestamps = new Map();
    }

    // 生成缓存键
    generateKey(endpoint, params) {
        return `${endpoint}:${JSON.stringify(params)}`;
    }

    // 获取缓存数据
    get(endpoint, params = {}) {
        const key = this.generateKey(endpoint, params);

        if (!this.cache.has(key)) {
            return null;
        }

        const timestamp = this.timestamps.get(key);
        const now = Date.now();

        // 检查缓存是否过期
        if (now - timestamp > CONFIG.CACHE_DURATION) {
            this.delete(endpoint, params);
            return null;
        }

        return this.cache.get(key);
    }

    // 设置缓存数据
    set(endpoint, params = {}, data) {
        const key = this.generateKey(endpoint, params);
        this.cache.set(key, data);
        this.timestamps.set(key, Date.now());

        // 限制缓存大小（最多100个条目）
        if (this.cache.size > 100) {
            this.cleanup();
        }
    }

    // 删除缓存
    delete(endpoint, params = {}) {
        const key = this.generateKey(endpoint, params);
        this.cache.delete(key);
        this.timestamps.delete(key);
    }

    // 清理最老的缓存条目
    cleanup() {
        let oldestKey = null;
        let oldestTime = Infinity;

        for (const [key, timestamp] of this.timestamps.entries()) {
            if (timestamp < oldestTime) {
                oldestTime = timestamp;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.cache.delete(oldestKey);
            this.timestamps.delete(oldestKey);
        }
    }

    // 清空所有缓存
    clear() {
        this.cache.clear();
        this.timestamps.clear();
    }

    // 获取缓存统计信息
    getStats() {
        return {
            size: this.cache.size,
            entries: Array.from(this.cache.keys())
        };
    }
}

// 创建全局缓存实例
const cache = new APICache();

// 带缓存的API调用包装器
async function cachedFetch(fetchFn, endpoint, params = {}) {
    // 尝试从缓存获取
    const cached = cache.get(endpoint, params);
    if (cached) {
        console.log(`Cache hit: ${endpoint}`);
        return cached;
    }

    // 缓存未命中，执行API调用
    console.log(`Cache miss: ${endpoint}`);
    const data = await fetchFn(params);

    // 存入缓存
    cache.set(endpoint, params, data);

    return data;
}
