// ===== TMDB API Wrapper with Caching =====

/**
 * TMDB API Configuration
 */
const TMDB_CONFIG = {
    baseURL: 'https://api.themoviedb.org/3',
    apiKey: 'YOUR_API_KEY_HERE', // Users should replace this with their own API key
    imageBaseURL: 'https://image.tmdb.org/t/p',
    language: 'zh-CN'
};

/**
 * TMDB API Class
 */
class TMDBAPI {
    constructor(apiKey = TMDB_CONFIG.apiKey) {
        this.apiKey = apiKey;
        this.baseURL = TMDB_CONFIG.baseURL;
        this.cache = new APICache();
    }

    /**
     * Make API request with caching
     * @param {string} endpoint - API endpoint
     * @param {Object} params - Query parameters
     * @param {number} cacheTTL - Cache time-to-live in milliseconds
     * @returns {Promise<Object>} API response data
     */
    async request(endpoint, params = {}, cacheTTL = 5 * 60 * 1000) {
        // Generate cache key
        const cacheKey = `${endpoint}?${JSON.stringify(params)}`;

        // Check cache first
        const cachedData = this.cache.get(cacheKey);
        if (cachedData) {
            return cachedData;
        }

        // Build URL
        const url = new URL(`${this.baseURL}${endpoint}`);
        url.searchParams.append('api_key', this.apiKey);
        url.searchParams.append('language', TMDB_CONFIG.language);

        for (const [key, value] of Object.entries(params)) {
            if (value !== null && value !== undefined) {
                url.searchParams.append(key, value);
            }
        }

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Cache the response
            this.cache.set(cacheKey, data, cacheTTL);

            return data;
        } catch (error) {
            console.error('TMDB API Error:', error);
            throw error;
        }
    }

    /**
     * Get trending movies
     * @param {string} timeWindow - 'day' or 'week'
     * @param {number} page - Page number
     * @returns {Promise<Object>} Trending movies data
     */
    async getTrending(timeWindow = 'week', page = 1) {
        return this.request(`/trending/movie/${timeWindow}`, { page });
    }

    /**
     * Get popular movies
     * @param {number} page - Page number
     * @returns {Promise<Object>} Popular movies data
     */
    async getPopular(page = 1) {
        return this.request('/movie/popular', { page });
    }

    /**
     * Get top rated movies
     * @param {number} page - Page number
     * @returns {Promise<Object>} Top rated movies data
     */
    async getTopRated(page = 1) {
        return this.request('/movie/top_rated', { page });
    }

    /**
     * Get upcoming movies
     * @param {number} page - Page number
     * @returns {Promise<Object>} Upcoming movies data
     */
    async getUpcoming(page = 1) {
        return this.request('/movie/upcoming', { page });
    }

    /**
     * Get now playing movies
     * @param {number} page - Page number
     * @returns {Promise<Object>} Now playing movies data
     */
    async getNowPlaying(page = 1) {
        return this.request('/movie/now_playing', { page });
    }

    /**
     * Search movies
     * @param {string} query - Search query
     * @param {number} page - Page number
     * @returns {Promise<Object>} Search results
     */
    async searchMovies(query, page = 1) {
        return this.request('/search/movie', { query, page }, 10 * 60 * 1000); // 10 min cache for search
    }

    /**
     * Get movie details
     * @param {number} movieId - Movie ID
     * @returns {Promise<Object>} Movie details
     */
    async getMovieDetails(movieId) {
        return this.request(`/movie/${movieId}`, {}, 30 * 60 * 1000); // 30 min cache for details
    }

    /**
     * Get movie credits (cast & crew)
     * @param {number} movieId - Movie ID
     * @returns {Promise<Object>} Movie credits
     */
    async getMovieCredits(movieId) {
        return this.request(`/movie/${movieId}/credits`, {}, 30 * 60 * 1000);
    }

    /**
     * Get movie videos (trailers, teasers, etc.)
     * @param {number} movieId - Movie ID
     * @returns {Promise<Object>} Movie videos
     */
    async getMovieVideos(movieId) {
        return this.request(`/movie/${movieId}/videos`, {}, 30 * 60 * 1000);
    }

    /**
     * Get movie recommendations
     * @param {number} movieId - Movie ID
     * @param {number} page - Page number
     * @returns {Promise<Object>} Recommended movies
     */
    async getMovieRecommendations(movieId, page = 1) {
        return this.request(`/movie/${movieId}/recommendations`, { page });
    }

    /**
     * Get similar movies
     * @param {number} movieId - Movie ID
     * @param {number} page - Page number
     * @returns {Promise<Object>} Similar movies
     */
    async getSimilarMovies(movieId, page = 1) {
        return this.request(`/movie/${movieId}/similar`, { page });
    }

    /**
     * Discover movies with filters
     * @param {Object} filters - Discovery filters (with_genres, sort_by, etc.)
     * @param {number} page - Page number
     * @returns {Promise<Object>} Discovered movies
     */
    async discoverMovies(filters = {}, page = 1) {
        return this.request('/discover/movie', { ...filters, page });
    }

    /**
     * Get genre list
     * @returns {Promise<Object>} Genre list
     */
    async getGenres() {
        return this.request('/genre/movie/list', {}, 24 * 60 * 60 * 1000); // 24 hour cache for genres
    }

    /**
     * Clear API cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Clear specific cache key pattern
     * @param {string} pattern - URL pattern to match
     */
    clearCachePattern(pattern) {
        for (const key of this.cache.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.clearKey(key);
            }
        }
    }
}

/**
 * Watchlist Manager
 */
class WatchlistManager {
    constructor() {
        this.storageKey = 'movie_watchlist';
        this.watchlist = this.loadWatchlist();
    }

    /**
     * Load watchlist from localStorage
     * @returns {Array} Watchlist array
     */
    loadWatchlist() {
        return Storage.get(this.storageKey) || [];
    }

    /**
     * Save watchlist to localStorage
     */
    saveWatchlist() {
        Storage.set(this.storageKey, this.watchlist);
    }

    /**
     * Get all watchlist items
     * @returns {Array} Watchlist array
     */
    getWatchlist() {
        return [...this.watchlist];
    }

    /**
     * Add movie to watchlist
     * @param {Object} movie - Movie object
     * @returns {boolean} Success status
     */
    addMovie(movie) {
        if (this.isInWatchlist(movie.id)) {
            return false;
        }

        this.watchlist.push({
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            release_date: movie.release_date,
            vote_average: movie.vote_average,
            genre_ids: movie.genre_ids || movie.genres?.map(g => g.id) || [],
            added_at: new Date().toISOString()
        });

        this.saveWatchlist();
        return true;
    }

    /**
     * Remove movie from watchlist
     * @param {number} movieId - Movie ID
     * @returns {boolean} Success status
     */
    removeMovie(movieId) {
        const index = this.watchlist.findIndex(m => m.id === movieId);

        if (index === -1) {
            return false;
        }

        this.watchlist.splice(index, 1);
        this.saveWatchlist();
        return true;
    }

    /**
     * Check if movie is in watchlist
     * @param {number} movieId - Movie ID
     * @returns {boolean} Is in watchlist
     */
    isInWatchlist(movieId) {
        return this.watchlist.some(m => m.id === movieId);
    }

    /**
     * Get genre distribution from watchlist
     * @returns {Object} Genre counts
     */
    getGenreDistribution() {
        const genreCounts = {};

        this.watchlist.forEach(movie => {
            if (movie.genre_ids) {
                movie.genre_ids.forEach(genreId => {
                    genreCounts[genreId] = (genreCounts[genreId] || 0) + 1;
                });
            }
        });

        return genreCounts;
    }

    /**
     * Get most common genres
     * @param {number} limit - Number of genres to return
     * @returns {Array} Top genre IDs
     */
    getTopGenres(limit = 3) {
        const distribution = this.getGenreDistribution();

        return Object.entries(distribution)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([genreId]) => parseInt(genreId));
    }

    /**
     * Clear watchlist
     */
    clear() {
        this.watchlist = [];
        this.saveWatchlist();
    }
}

/**
 * Recommendation Engine
 */
class RecommendationEngine {
    constructor(api, watchlistManager) {
        this.api = api;
        this.watchlistManager = watchlistManager;
        this.genreMap = new Map();
        this.loadGenres();
    }

    /**
     * Load genre mappings
     */
    async loadGenres() {
        try {
            const response = await this.api.getGenres();
            if (response.genres) {
                response.genres.forEach(genre => {
                    this.genreMap.set(genre.id, genre.name);
                }
            }
        } catch (error) {
            console.error('Error loading genres:', error);
        }
    }

    /**
     * Get genre name by ID
     * @param {number} genreId - Genre ID
     * @returns {string} Genre name
     */
    getGenreName(genreId) {
        return this.genreMap.get(genreId) || '未知';
    }

    /**
     * Get personalized recommendations based on watchlist
     * @param {number} limit - Number of recommendations
     * @returns {Promise<Array>} Recommended movies
     */
    async getRecommendations(limit = 20) {
        const watchlist = this.watchlistManager.getWatchlist();

        if (watchlist.length === 0) {
            return [];
        }

        const topGenres = this.watchlistManager.getTopGenres(3);
        const recommendedMovies = [];
        const seenIds = new Set(watchlist.map(m => m.id));

        try {
            // Discover movies by top genres
            for (const genreId of topGenres) {
                const response = await this.api.discoverMovies({
                    with_genres: genreId,
                    sort_by: 'popularity.desc',
                    'vote_count.gte': 100
                });

                if (response.results) {
                    for (const movie of response.results) {
                        if (!seenIds.has(movie.id) &&
                            !recommendedMovies.find(m => m.id === movie.id)) {
                            recommendedMovies.push({
                                ...movie,
                                recommendationReason: `基于您喜欢的${this.getGenreName(genreId)}类型电影推荐`
                            });

                            if (recommendedMovies.length >= limit) {
                                break;
                            }
                        }
                    }
                }

                if (recommendedMovies.length >= limit) {
                    break;
                }
            }

            // If we don't have enough recommendations from genres,
            // get recommendations from movies in watchlist
            if (recommendedMovies.length < limit) {
                for (const watchlistMovie of watchlist) {
                    const response = await this.api.getMovieRecommendations(watchlistMovie.id);

                    if (response.results) {
                        for (const movie of response.results) {
                            if (!seenIds.has(movie.id) &&
                                !recommendedMovies.find(m => m.id === movie.id)) {
                                recommendedMovies.push({
                                    ...movie,
                                    recommendationReason: `因为您喜欢《${watchlistMovie.title}》`
                                });

                                if (recommendedMovies.length >= limit) {
                                    break;
                                }
                            }
                        }
                    }

                    if (recommendedMovies.length >= limit) {
                        break;
                    }
                }
            }

        } catch (error) {
            console.error('Error getting recommendations:', error);
        }

        return recommendedMovies.slice(0, limit);
    }

    /**
     * Get recommendation explanation
     * @returns {Promise<string>} Explanation text
     */
    async getRecommendationExplanation() {
        const watchlist = this.watchlistManager.getWatchlist();

        if (watchlist.length === 0) {
            return '添加电影到您的观影列表，我们将根据您的喜好为您推荐电影！';
        }

        const topGenres = this.watchlistManager.getTopGenres(3);
        const genreNames = topGenres.map(id => this.getGenreName(id)).join('、');

        return `根据您观影列表中的 ${watchlist.length} 部电影，我们为您推荐 ${genreNames} 类型的电影`;
    }
}
