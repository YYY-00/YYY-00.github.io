import { getApiKey, config } from './config.js';
import { cachedFetch } from './cache.js';

/**
 * TMDB API 类
 * 封装所有 TMDB API 调用
 */
export class TMDBApi {
    constructor() {
        this.apiKey = getApiKey();
        this.baseUrl = config.apiBaseUrl;
    }

    /**
     * 构建完整的 API URL
     * @param {string} endpoint - API 端点
     * @param {Object} params - 查询参数
     * @returns {string} 完整 URL
     */
    buildUrl(endpoint, params = {}) {
        const url = new URL(`${this.baseUrl}${endpoint}`);
        url.searchParams.append('api_key', this.apiKey);
        url.searchParams.append('language', 'zh-CN');

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, value.toString());
            }
        });

        return url.toString();
    }

    /**
     * 通用 API 请求方法
     * @param {string} endpoint - API 端点
     * @param {Object} params - 查询参数
     * @param {string} cacheKey - 缓存键
     * @param {number} ttl - 缓存时间（毫秒）
     * @returns {Promise} API 响应数据
     */
    async request(endpoint, params = {}, cacheKey = null, ttl = 3600000) {
        const url = this.buildUrl(endpoint, params);

        try {
            // 生成缓存键（如果未提供）
            const key = cacheKey || `tmdb_${endpoint}_${JSON.stringify(params)}`;

            const data = await cachedFetch(url, {}, key, ttl);
            return data;
        } catch (error) {
            console.error(`API 请求失败: ${endpoint}`, error);
            throw error;
        }
    }

    /**
     * 获取热门电影（每日）
     * @param {number} page - 页码
     * @returns {Promise} 热门电影列表
     */
    async getTrending(page = 1) {
        return this.request('/trending/movie/day', { page });
    }

    /**
     * 获取评分最高的电影
     * @param {number} page - 页码
     * @returns {Promise} 评分最高电影列表
     */
    async getTopRated(page = 1) {
        return this.request('/movie/top_rated', { page });
    }

    /**
     * 获取即将上映的电影
     * @param {number} page - 页码
     * @returns {Promise} 即将上映电影列表
     */
    async getUpcoming(page = 1) {
        return this.request('/movie/upcoming', { page });
    }

    /**
     * 搜索电影
     * @param {string} query - 搜索关键词
     * @param {number} page - 页码
     * @returns {Promise} 搜索结果
     */
    async searchMovies(query, page = 1) {
        return this.request('/search/movie', { query, page }, null, 1800000); // 30分钟缓存
    }

    /**
     * 获取电影详情
     * @param {number} id - 电影 ID
     * @returns {Promise} 电影详情
     */
    async getMovieDetails(id) {
        return this.request(`/movie/${id}`, {}, null, 86400000); // 24小时缓存
    }

    /**
     * 获取电影演员和剧组信息
     * @param {number} id - 电影 ID
     * @returns {Promise} 演员和剧组信息
     */
    async getMovieCredits(id) {
        return this.request(`/movie/${id}/credits`);
    }

    /**
     * 获取电影预告片
     * @param {number} id - 电影 ID
     * @returns {Promise} 预告片列表
     */
    async getMovieVideos(id) {
        return this.request(`/movie/${id}/videos`);
    }

    /**
     * 获取类似电影
     * @param {number} id - 电影 ID
     * @param {number} page - 页码
     * @returns {Promise} 类似电影列表
     */
    async getSimilarMovies(id, page = 1) {
        return this.request(`/movie/${id}/similar`, { page });
    }

    /**
     * 获取电影推荐
     * @param {number} id - 电影 ID
     * @param {number} page - 页码
     * @returns {Promise} 推荐电影列表
     */
    async getMovieRecommendations(id, page = 1) {
        return this.request(`/movie/${id}/recommendations`, { page });
    }

    /**
     * 获取演员详情
     * @param {number} id - 演员 ID
     * @returns {Promise} 演员详情
     */
    async getPersonDetails(id) {
        return this.request(`/person/${id}`);
    }

    /**
     * 获取演员参演作品
     * @param {number} id - 演员 ID
     * @returns {Promise} 参演作品列表
     */
    async getPersonCredits(id) {
        return this.request(`/person/${id}/movie_credits`);
    }

    /**
     * 按类型发现电影
     * @param {Object} options - 选项
     * @param {number} options.with_genres - 类型 ID（逗号分隔）
     * @param {number} options.page - 页码
     * @param {string} options.sort_by - 排序方式
     * @param {number} options.vote_average_gte - 最低评分
     * @param {string} options.vote_count_gte - 最低投票数
     * @returns {Promise} 电影列表
     */
    async discoverMovies(options = {}) {
        return this.request('/discover/movie', options);
    }

    /**
     * 获取电影类型列表
     * @returns {Promise} 类型列表
     */
    async getGenres() {
        return this.request('/genre/movie/list', {}, 'tmdb_genres', 86400000); // 24小时缓存
    }

    /**
     * 获取电影完整的详细信息
     * @param {number} id - 电影 ID
     * @returns {Promise} 完整的电影信息
     */
    async getCompleteMovieInfo(id) {
        try {
            const [details, credits, videos] = await Promise.all([
                this.getMovieDetails(id),
                this.getMovieCredits(id),
                this.getMovieVideos(id)
            ]);

            return {
                ...details,
                credits,
                videos
            };
        } catch (error) {
            console.error('获取电影完整信息失败:', error);
            throw error;
        }
    }

    /**
     * 获取多个电影的基本信息
     * @param {Array<number>} ids - 电影 ID 数组
     * @returns {Promise<Array>} 电影信息数组
     */
    async getMultipleMovies(ids) {
        const promises = ids.map(id => this.getMovieDetails(id));
        return Promise.all(promises);
    }
}

// 创建全局 API 实例
export const tmdbApi = new TMDBApi();

/**
 * API 错误处理
 */
export class APIError extends Error {
    constructor(message, statusCode = null, response = null) {
        super(message);
        this.name = 'APIError';
        this.statusCode = statusCode;
        this.response = response;
    }

    static fromResponse(response) {
        return new APIError(
            `API 请求失败: ${response.status} ${response.statusText}`,
            response.status,
            response
        );
    }
}

/**
 * 处理 API 错误
 * @param {Error} error - 错误对象
 * @returns {string} 用户友好的错误消息
 */
export function handleAPIError(error) {
    if (error instanceof APIError) {
        switch (error.statusCode) {
            case 401:
                return 'API 密钥无效，请检查配置';
            case 404:
                return '请求的资源不存在';
            case 429:
                return '请求过于频繁，请稍后再试';
            case 500:
                return '服务器错误，请稍后再试';
            default:
                return error.message || '未知错误';
        }
    }

    if (error.message.includes('API Key 未配置')) {
        return error.message;
    }

    return '网络请求失败，请检查网络连接';
}

/**
 * 检查 API 是否可用
 * @returns {Promise<boolean>} 是否可用
 */
export async function checkAPIAvailable() {
    try {
        await tmdbApi.getTrending(1);
        return true;
    } catch {
        return false;
    }
}
