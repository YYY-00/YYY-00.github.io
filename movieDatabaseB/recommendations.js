// 推荐引擎
class RecommendationEngine {
    constructor() {
        this.genrePreferences = new Map();
        this.genreCache = new Map();
    }

    // 从观影列表分析电影类型偏好
    analyzeWatchlist(watchlist) {
        this.genrePreferences.clear();

        watchlist.forEach(movie => {
            if (movie.genres) {
                movie.genres.forEach(genre => {
                    const count = this.genrePreferences.get(genre.id) || 0;
                    this.genrePreferences.set(genre.id, {
                        id: genre.id,
                        name: genre.name,
                        count: count + 1,
                        weight: (count + 1) * 1.5 // 增加权重
                    });
                });
            }
        });

        return this.getTopGenres(3);
    }

    // 获取最受欢迎的电影类型
    getTopGenres(limit = 3) {
        return Array.from(this.genrePreferences.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }

    // 基于类型获取推荐电影
    async getRecommendations(watchlist, page = 1) {
        const topGenres = this.analyzeWatchlist(watchlist);

        if (topGenres.length === 0) {
            // 如果没有观影列表，返回热门电影作为推荐
            return api.getPopularMovies(page);
        }

        // 获取已观看电影的ID列表，避免重复推荐
        const watchedIds = new Set(watchlist.map(m => m.id));

        // 基于最喜欢的类型发现电影
        const genreIds = topGenres.map(g => g.id);

        try {
            const response = await api.discoverMovies({
                with_genres: genreIds.join(','),
                page: page,
                'vote_average.gte': 6.0, // 只推荐评分较高的电影
                'vote_count.gte': 100 // 确保有足够的评分数量
            });

            // 过滤掉已观看的电影
            response.results = response.results.filter(
                movie => !watchedIds.has(movie.id)
            );

            return response;
        } catch (error) {
            console.error('Recommendation error:', error);
            // 降级到热门电影
            return api.getPopularMovies(page);
        }
    }

    // 获取推荐理由
    getRecommendationReason(watchlist) {
        const topGenres = this.getTopGenres(3);

        if (topGenres.length === 0) {
            return "基于热门电影为您推荐";
        }

        const genreNames = topGenres.map(g => g.name).join('、');
        const totalCount = Array.from(this.genrePreferences.values())
            .reduce((sum, g) => sum + g.count, 0);

        return `基于您观看的 ${totalCount} 部电影，发现您喜欢 ${genreNames} 类型`;
    }

    // 获取类型统计信息
    getGenreStats() {
        return Array.from(this.genrePreferences.values())
            .sort((a, b) => b.count - a.count);
    }
}

// 创建全局推荐引擎实例
const recommendationEngine = new RecommendationEngine();
