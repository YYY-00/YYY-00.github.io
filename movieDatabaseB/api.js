// TMDB API Service
class TMDBAPI {
    constructor() {
        this.config = window.CONFIG;
    }

    async fetch(endpoint, params = {}) {
        const url = new URL(this.config.BASE_URL + endpoint);
        url.searchParams.append('api_key', this.config.API_KEY);
        url.searchParams.append('language', 'zh-CN');

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, value);
            }
        });

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async getPopularMovies(page = 1) {
        return this.fetch(this.config.ENDPOINTS.POPULAR, { page });
    }

    async getTopRatedMovies(page = 1) {
        return this.fetch(this.config.ENDPOINTS.TOP_RATED, { page });
    }

    async getUpcomingMovies(page = 1) {
        return this.fetch(this.config.ENDPOINTS.UPCOMING, { page });
    }

    async searchMovies(query, page = 1) {
        return this.fetch(this.config.ENDPOINTS.SEARCH, { query, page });
    }

    async getMovieDetails(movieId) {
        return this.fetch(this.config.ENDPOINTS.DETAILS + movieId);
    }

    async getMovieCredits(movieId) {
        return this.fetch(this.config.ENDPOINTS.CREDITS.replace('{}', movieId));
    }

    async getMovieVideos(movieId) {
        return this.fetch(this.config.ENDPOINTS.VIDEOS.replace('{}', movieId));
    }

    async getMovieRecommendations(movieId, page = 1) {
        return this.fetch(this.config.ENDPOINTS.RECOMMENDATIONS.replace('{}', movieId), { page });
    }

    async discoverMovies(params) {
        return this.fetch(this.config.ENDPOINTS.DISCOVER, params);
    }

    getImageUrl(path, size = 'POSTER', sizeType = 'MEDIUM') {
        if (!path) return 'https://via.placeholder.com/342x513?text=No+Image';
        const sizeConfig = this.config.IMAGE_SIZES[size];
        return `${this.config.IMAGE_BASE_URL}/${sizeConfig[sizeType]}${path}`;
    }
}

// 防抖函数
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

// 创建全局 API 实例
const api = new TMDBAPI();
