import { tmdbApi } from './api.js';
import { cache } from './cache.js';
import { getImageUrl } from './config.js';
import { ui, infiniteScroll, SearchComponent } from './components.js';
import { debounce, formatDate } from './utils.js';

/**
 * 观影列表管理器
 */
class WatchlistManager {
    constructor() {
        this.storageKey = 'movie_watchlist';
        this.watchlist = this.load();
    }

    /**
     * 从 localStorage 加载观影列表
     */
    load() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('加载观影列表失败:', error);
            return [];
        }
    }

    /**
     * 保存到 localStorage
     */
    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.watchlist));
            return true;
        } catch (error) {
            console.error('保存观影列表失败:', error);
            return false;
        }
    }

    /**
     * 添加电影到观影列表
     * @param {Object} movie - 电影对象
     */
    add(movie) {
        // 检查是否已存在
        if (this.has(movie.id)) {
            return false;
        }

        const watchlistItem = {
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
            release_date: movie.release_date,
            genres: movie.genres?.map(g => g.name) || [],
            addedAt: new Date().toISOString()
        };

        this.watchlist.push(watchlistItem);
        this.save();
        return true;
    }

    /**
     * 从观影列表移除电影
     * @param {number} movieId - 电影 ID
     */
    remove(movieId) {
        const index = this.watchlist.findIndex(m => m.id === movieId);
        if (index > -1) {
            this.watchlist.splice(index, 1);
            this.save();
            return true;
        }
        return false;
    }

    /**
     * 检查电影是否在观影列表中
     * @param {number} movieId - 电影 ID
     */
    has(movieId) {
        return this.watchlist.some(m => m.id === movieId);
    }

    /**
     * 获取所有电影
     */
    getAll() {
        return [...this.watchlist];
    }

    /**
     * 获取统计信息
     */
    getStats() {
        const total = this.watchlist.length;

        // 本月新增
        const now = new Date();
        const thisMonth = this.watchlist.filter(m => {
            const addedDate = new Date(m.addedAt);
            return addedDate.getMonth() === now.getMonth() &&
                   addedDate.getFullYear() === now.getFullYear();
        }).length;

        // 最喜爱的类型
        const genreCount = {};
        this.watchlist.forEach(movie => {
            movie.genres?.forEach(genre => {
                genreCount[genre] = (genreCount[genre] || 0) + 1;
            });
        });

        const topGenre = Object.entries(genreCount)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || '暂无';

        return { total, thisMonth, topGenre };
    }

    /**
     * 获取类型频率
     */
    getGenreFrequency() {
        const genreCount = {};
        this.watchlist.forEach(movie => {
            movie.genres?.forEach(genre => {
                genreCount[genre] = (genreCount[genre] || 0) + 1;
            });
        });
        return genreCount;
    }

    /**
     * 清空列表
     */
    clear() {
        this.watchlist = [];
        this.save();
    }
}

/**
 * 推荐引擎
 */
class RecommendationEngine {
    constructor(watchlistManager, api) {
        this.watchlistManager = watchlistManager;
        this.api = api;
    }

    /**
     * 生成推荐
     * @param {number} limit - 推荐数量
     */
    async generate(limit = 20) {
        const genreFrequency = this.watchlistManager.getGenreFrequency();

        if (Object.keys(genreFrequency).length === 0) {
            // 如果没有观影列表，返回热门电影
            const trending = await this.api.getTrending();
            return trending.results.slice(0, limit);
        }

        // 按类型频率排序
        const sortedGenres = Object.entries(genreFrequency)
            .sort((a, b) => b[1] - a[1])
            .map(([genre]) => genre);

        // 获取类型列表
        const genresData = await this.api.getGenres();
        const genreMap = {};
        genresData.genres.forEach(g => {
            genreMap[g.name] = g.id;
        });

        // 为每个类型获取推荐电影
        const recommendations = [];
        const watchedIds = new Set(this.watchlistManager.getAll().map(m => m.id));

        for (const genreName of sortedGenres.slice(0, 3)) {
            const genreId = genreMap[genreName];
            if (!genreId) continue;

            try {
                const results = await this.api.discoverMovies({
                    with_genres: genreId,
                    sort_by: 'vote_average.desc',
                    'vote_average.gte': 7,
                    'vote_count.gte': 100,
                    page: 1
                });

                // 过滤已观看的电影并按相关性排序
                const genreRecommendations = results.results
                    .filter(movie => !watchedIds.has(movie.id))
                    .map(movie => ({
                        ...movie,
                        relevance: this.calculateRelevance(movie, genreFrequency)
                    }))
                    .sort((a, b) => b.relevance - a.relevance)
                    .slice(0, 10);

                recommendations.push(...genreRecommendations);

                if (recommendations.length >= limit) break;
            } catch (error) {
                console.error(`获取类型 ${genreName} 的推荐失败:`, error);
            }
        }

        return recommendations.slice(0, limit);
    }

    /**
     * 计算电影相关性分数
     * @param {Object} movie - 电影对象
     * @param {Object} genreFrequency - 类型频率
     */
    calculateRelevance(movie, genreFrequency) {
        let score = 0;

        // 基于评分
        score += (movie.vote_average || 0) * 10;

        // 基于类型匹配
        movie.genre_ids?.forEach(id => {
            // 这里简化处理，实际需要类型 ID 到名称的映射
            score += 5;
        });

        // 基于发布日期（较新的电影加分）
        if (movie.release_date) {
            const releaseYear = new Date(movie.release_date).getFullYear();
            const currentYear = new Date().getFullYear();
            if (releaseYear >= currentYear - 5) {
                score += 10;
            }
        }

        return score;
    }
}

/**
 * 主应用类
 */
class MovieApp {
    constructor() {
        this.watchlist = new WatchlistManager();
        this.recommendations = new RecommendationEngine(this.watchlist, tmdbApi);
        this.search = null;
        this.pages = {
            trending: 1,
            topRated: 1,
            upcoming: 1
        };
        this.isLoading = false;

        this.init();
    }

    async init() {
        // 初始化主题
        this.initTheme();

        // 初始化路由
        this.initRouter();

        // 初始化搜索
        this.initSearch();

        // 检查 API 配置
        try {
            await tmdbApi.getTrending(1);
        } catch (error) {
            ui.showToast('请先配置 TMDB API Key', 'error');
            console.error(error);
        }

        // 监听主题切换
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    /**
     * 初始化主题
     */
    initTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        let theme = savedTheme || (prefersDark ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', theme);

        this.updateThemeIcon(theme);
    }

    /**
     * 切换主题
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    /**
     * 更新主题图标
     */
    updateThemeIcon(theme) {
        const icon = document.querySelector('.theme-icon');
        if (icon) {
            icon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    /**
     * 初始化路由
     */
    initRouter() {
        window.addEventListener('hashchange', () => {
            this.handleRoute();
        });

        // 初始路由
        this.handleRoute();
    }

    /**
     * 处理路由
     */
    async handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        const mainContent = document.getElementById('mainContent');

        // 清理旧的无限滚动观察器
        infiniteScroll.unobserveAll();

        // 清理搜索
        this.search?.clear();

        ui.showLoading();

        try {
            if (hash === '/') {
                await this.renderHomePage(mainContent);
            } else if (hash === '/watchlist') {
                await this.renderWatchlistPage(mainContent);
            } else if (hash === '/recommendations') {
                await this.renderRecommendationsPage(mainContent);
            } else if (hash.startsWith('/movie/')) {
                const movieId = parseInt(hash.split('/')[2]);
                await this.renderMovieDetailPage(mainContent, movieId);
            } else {
                await this.renderHomePage(mainContent);
            }
        } catch (error) {
            console.error('路由处理错误:', error);
            ui.showToast('页面加载失败', 'error');
        } finally {
            ui.hideLoading();
        }
    }

    /**
     * 初始化搜索
     */
    initSearch() {
        this.search = new SearchComponent({
            api: tmdbApi,
            components: ui,
            debounceTime: 300
        });
    }

    /**
     * 渲染首页
     */
    async renderHomePage(container) {
        container.innerHTML = '<p class="text-center text-gray-500">加载中...</p>';

        try {
            const [trending, topRated, upcoming] = await Promise.all([
                tmdbApi.getTrending(this.pages.trending),
                tmdbApi.getTopRated(this.pages.topRated),
                tmdbApi.getUpcoming(this.pages.upcoming)
            ]);

            container.innerHTML = '';

            // 热门电影板块
            const trendingSection = ui.createMovieSection({
                title: '🔥 热门电影',
                id: 'trending',
                movies: trending.results,
                showMore: true
            });
            container.appendChild(trendingSection);

            // 评分最高板块
            const topRatedSection = ui.createMovieSection({
                title: '⭐ 评分最高',
                id: 'top_rated',
                movies: topRated.results,
                showMore: true
            });
            container.appendChild(topRatedSection);

            // 即将上映板块
            const upcomingSection = ui.createMovieSection({
                title: '🎬 即将上映',
                id: 'upcoming',
                movies: upcoming.results,
                showMore: true
            });
            container.appendChild(upcomingSection);

            // 设置无限滚动
            this.setupInfiniteScroll();
        } catch (error) {
            console.error('加载首页失败:', error);
            container.innerHTML = '<div class="empty-state"><p>加载失败，请检查网络连接</p></div>';
        }
    }

    /**
     * 设置无限滚动
     */
    setupInfiniteScroll() {
        const sections = ['trending', 'top_rated', 'upcoming'];

        sections.forEach(section => {
            const trigger = document.getElementById(`trigger-${section}`);
            if (!trigger) return;

            infiniteScroll.observe(section, trigger, async () => {
                if (this.isLoading) return;
                this.isLoading = true;

                try {
                    this.pages[section]++;

                    let data;
                    switch (section) {
                        case 'trending':
                            data = await tmdbApi.getTrending(this.pages.trending);
                            break;
                        case 'top_rated':
                            data = await tmdbApi.getTopRated(this.pages.topRated);
                            break;
                        case 'upcoming':
                            data = await tmdbApi.getUpcoming(this.pages.upcoming);
                            break;
                    }

                    const grid = document.getElementById(`grid-${section}`);
                    data.results.forEach(movie => {
                        const card = ui.createMovieCard(movie);
                        grid.appendChild(card);
                    });

                    // 如果没有更多结果，停止观察
                    if (data.results.length === 0 || data.page >= data.total_pages) {
                        infiniteScroll.unobserve(section);
                    }
                } catch (error) {
                    console.error(`加载更多 ${section} 失败:`, error);
                } finally {
                    this.isLoading = false;
                }
            });
        });
    }

    /**
     * 渲染观影列表页
     */
    async renderWatchlistPage(container) {
        const watchlist = this.watchlist.getAll();

        container.innerHTML = '';

        if (watchlist.length === 0) {
            container.appendChild(
                ui.createEmptyState('📝', '还没有添加任何电影<br>去首页发现好电影吧！')
            );
            return;
        }

        // 显示统计信息
        const stats = this.watchlist.getStats();
        const statsGrid = ui.createStatsGrid(stats);
        container.appendChild(statsGrid);

        // 显示观影列表
        const grid = document.createElement('div');
        grid.className = 'watchlist-grid';

        watchlist.forEach(movie => {
            const card = ui.createWatchlistCard(movie);

            // 绑定移除按钮
            card.querySelector('.btn-remove').addEventListener('click', () => {
                if (confirm(`确定要从观影列表中移除《${movie.title}》吗？`)) {
                    this.watchlist.remove(movie.id);
                    ui.showToast('已从观影列表移除');
                    this.renderWatchlistPage(container);
                }
            });

            grid.appendChild(card);
        });

        container.appendChild(grid);
    }

    /**
     * 渲染推荐页
     */
    async renderRecommendationsPage(container) {
        container.innerHTML = '<p class="text-center text-gray-500">生成推荐中...</p>';

        try {
            const recommendations = await this.recommendations.generate(20);

            container.innerHTML = '';

            if (recommendations.length === 0) {
                container.appendChild(
                    ui.createEmptyState('💡', '暂无推荐<br>先去添加一些喜欢的电影吧！')
                );
                return;
            }

            const section = ui.createMovieSection({
                title: '🎯 为你推荐',
                id: 'recommendations',
                movies: recommendations
            });

            container.appendChild(section);
        } catch (error) {
            console.error('生成推荐失败:', error);
            container.innerHTML = '<div class="empty-state"><p>推荐生成失败，请稍后再试</p></div>';
        }
    }

    /**
     * 渲染电影详情页
     */
    async renderMovieDetailPage(container, movieId) {
        if (!movieId) {
            container.innerHTML = '<div class="empty-state"><p>电影 ID 无效</p></div>';
            return;
        }

        try {
            const movieData = await tmdbApi.getCompleteMovieInfo(movieId);
            const isInWatchlist = this.watchlist.has(movieId);

            const detailPage = ui.createMovieDetailPage(movieData, isInWatchlist);
            container.innerHTML = '';
            container.appendChild(detailPage);

            // 绑定观影列表按钮
            const toggleBtn = document.getElementById('watchlistToggle');
            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => {
                    this.toggleWatchlist(movieData.details, toggleBtn);
                });
            }
        } catch (error) {
            console.error('加载电影详情失败:', error);
            container.innerHTML = '<div class="empty-state"><p>电影详情加载失败</p></div>';
        }
    }

    /**
     * 切换观影列表状态
     */
    toggleWatchlist(movie, button) {
        const isInWatchlist = this.watchlist.has(movie.id);

        if (isInWatchlist) {
            if (confirm(`确定要从观影列表中移除《${movie.title}》吗？`)) {
                this.watchlist.remove(movie.id);
                button.textContent = '➕ 添加到观影列表';
                ui.showToast('已从观影列表移除');
            }
        } else {
            this.watchlist.add(movie);
            button.textContent = '❌ 从观影列表移除';
            ui.showToast('已添加到观影列表');
        }
    }

    /**
     * 显示帮助信息
     */
    showHelp() {
        ui.showToast(
            '请访问 https://www.themoviedb.org/settings/api 获取免费的 API Key\n' +
            '然后将 API Key 配置到 js/config.js 文件中',
            'info'
        );
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    new MovieApp();
});
