// 主应用程序
class MovieApp {
    constructor() {
        this.currentPage = 1;
        this.isLoading = false;
        this.currentEndpoint = null;
        this.init();
    }

    async init() {
        // 初始化深色模式
        this.initDarkMode();

        // 设置事件监听器
        this.setupEventListeners();

        // 加载主页内容
        await this.loadHomeContent();

        // 更新观影列表计数
        ui.updateWatchlistCount();
    }

    // 初始化深色模式
    initDarkMode() {
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode === 'true' || (!savedMode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.body.classList.add('dark-mode');
            this.updateDarkModeIcon(true);
        } else {
            this.updateDarkModeIcon(false);
        }
    }

    // 更新深色模式图标
    updateDarkModeIcon(isDark) {
        const icon = document.getElementById('darkModeIcon');
        icon.textContent = isDark ? '☀️' : '🌙';
    }

    // 切换深色模式
    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        this.updateDarkModeIcon(isDark);
    }

    // 设置事件监听器
    setupEventListeners() {
        // 深色模式切换
        document.getElementById('darkModeBtn').addEventListener('click', () => {
            this.toggleDarkMode();
        });

        // 观影列表按钮
        document.getElementById('watchlistBtn').addEventListener('click', () => {
            this.showWatchlist();
        });

        // 推荐按钮
        document.getElementById('recommendationsBtn').addEventListener('click', () => {
            this.showRecommendations();
        });

        // 返回按钮
        document.getElementById('backBtn').addEventListener('click', () => {
            ui.showPage('home');
        });

        document.getElementById('watchlistBackBtn').addEventListener('click', () => {
            ui.showPage('home');
        });

        document.getElementById('recommendationsBackBtn').addEventListener('click', () => {
            ui.showPage('home');
        });

        // 搜索功能（使用防抖）
        const searchInput = document.getElementById('searchInput');
        const debouncedSearch = debounce(async (query) => {
            await this.handleSearch(query);
        }, CONFIG.DEBOUNCE_DELAY);

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length > 0) {
                debouncedSearch(query);
            } else {
                ui.hideSearchResults();
            }
        });

        // 点击页面其他地方隐藏搜索结果
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-box')) {
                ui.hideSearchResults();
            }
        });

        // 横向滚动按钮
        this.setupScrollButtons();

        // 设置无限滚动（针对推荐和观影列表页面）
        this.setupInfiniteScroll();
    }

    // 设置横向滚动按钮
    setupScrollButtons() {
        document.querySelectorAll('.scroll-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.target;
                const container = document.getElementById(targetId + 'Movies');
                const scrollAmount = container.offsetWidth * 0.8;

                if (btn.classList.contains('scroll-left')) {
                    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                } else {
                    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                }
            });
        });
    }

    // 设置无限滚动
    setupInfiniteScroll() {
        const options = {
            root: null,
            rootMargin: '100px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isLoading) {
                    const trigger = entry.target;

                    if (trigger.dataset.page === 'watchlist') {
                        // 观影列表不支持分页（因为是本地数据）
                    } else if (trigger.dataset.page === 'recommendations') {
                        this.loadMoreRecommendations();
                    }
                }
            });
        }, options);

        // 创建观察点
        const createTrigger = (pageName) => {
            const trigger = document.createElement('div');
            trigger.className = 'infinite-scroll-trigger';
            trigger.dataset.page = pageName;
            return trigger;
        };

        // 为不同页面添加观察点
        const watchlistContainer = document.getElementById('watchlistMovies');
        const recommendationsContainer = document.getElementById('recommendationMovies');

        // 我们会在显示页面时动态设置观察器
    }

    // 加载主页内容
    async loadHomeContent() {
        ui.showLoading();

        try {
            // 使用缓存的API调用
            const [popular, topRated, upcoming] = await Promise.all([
                cachedFetch((params) => api.getPopularMovies(params.page), '/movie/popular', { page: 1 }),
                cachedFetch((params) => api.getTopRatedMovies(params.page), '/movie/top_rated', { page: 1 }),
                cachedFetch((params) => api.getUpcomingMovies(params.page), '/movie/upcoming', { page: 1 })
            ]);

            this.renderMovieSection('popularMovies', popular.results);
            this.renderMovieSection('topRatedMovies', topRated.results);
            this.renderMovieSection('upcomingMovies', upcoming.results);

        } catch (error) {
            console.error('Error loading home content:', error);
            ui.showError('加载内容失败，请检查网络连接');
        } finally {
            ui.hideLoading();
        }
    }

    // 渲染电影区块
    renderMovieSection(containerId, movies) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        movies.forEach(movie => {
            const card = ui.createMovieCard(movie);
            container.appendChild(card);
        });
    }

    // 处理搜索
    async handleSearch(query) {
        if (query.length < 2) return;

        try {
            const results = await api.searchMovies(query);
            ui.showSearchResults(results.results);
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    // 显示观影列表
    showWatchlist() {
        const container = document.getElementById('watchlistMovies');
        const movies = watchlist.getAll();

        if (movies.length === 0) {
            ui.renderEmptyState(container, '您的观影列表是空的', '📋');
        } else {
            container.innerHTML = '';
            movies.forEach(movie => {
                const card = ui.createMovieCard(movie, true);
                container.appendChild(card);
            });
        }

        ui.showPage('watchlist');
    }

    // 显示推荐
    async showRecommendations() {
        const watchlistMovies = watchlist.getAll();

        if (watchlistMovies.length === 0) {
            const container = document.getElementById('recommendationMovies');
            ui.renderEmptyState(container, '添加一些电影到观影列表，我们将为您推荐', '🎯');
            ui.showPage('recommendations');
            return;
        }

        ui.showLoading();
        this.currentPage = 1;
        this.isLoading = true;

        try {
            const container = document.getElementById('recommendationMovies');
            container.innerHTML = '';

            // 添加推荐理由
            const reason = recommendationEngine.getRecommendationReason(watchlistMovies);
            const genreStats = recommendationEngine.getGenreStats();

            const reasonDiv = document.createElement('div');
            reasonDiv.className = 'recommendation-reason';
            reasonDiv.innerHTML = `
                <p>${reason}</p>
                ${genreStats.length > 0 ? `
                    <div class="genre-stats">
                        ${genreStats.map(g => `
                            <span class="genre-stat">${g.name}: ${g.count}部</span>
                        `).join('')}
                    </div>
                ` : ''}
            `;
            container.appendChild(reasonDiv);

            // 获取推荐电影
            const data = await recommendationEngine.getRecommendations(watchlistMovies, this.currentPage);

            if (data.results.length === 0) {
                const grid = document.createElement('div');
                grid.className = 'movie-grid';
                grid.innerHTML = '<div class="empty-state"><p>暂无更多推荐</p></div>';
                container.appendChild(grid);
            } else {
                const grid = document.createElement('div');
                grid.className = 'movie-grid';
                data.results.forEach(movie => {
                    const card = ui.createMovieCard(movie, true);
                    grid.appendChild(card);
                });
                container.appendChild(grid);

                // 添加加载更多触发器
                if (data.page < data.total_pages) {
                    const trigger = document.createElement('div');
                    trigger.id = 'recommendationsTrigger';
                    trigger.className = 'infinite-scroll-trigger';
                    trigger.dataset.page = 'recommendations';
                    container.appendChild(trigger);

                    // 设置观察器
                    this.setupRecommendationsObserver();
                }
            }

            this.currentEndpoint = 'recommendations';
            this.totalPages = data.total_pages;

            ui.showPage('recommendations');

        } catch (error) {
            console.error('Error loading recommendations:', error);
            ui.showError('加载推荐失败');
        } finally {
            this.isLoading = false;
            ui.hideLoading();
        }
    }

    // 设置推荐观察器
    setupRecommendationsObserver() {
        const trigger = document.getElementById('recommendationsTrigger');
        if (!trigger) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isLoading && this.currentPage < this.totalPages) {
                    this.loadMoreRecommendations();
                }
            });
        }, { rootMargin: '100px' });

        observer.observe(trigger);
    }

    // 加载更多推荐
    async loadMoreRecommendations() {
        if (this.isLoading || this.currentPage >= this.totalPages) return;

        this.isLoading = true;
        this.currentPage++;

        const loadingDiv = document.getElementById('recommendationsLoading');
        loadingDiv.style.display = 'flex';

        try {
            const watchlistMovies = watchlist.getAll();
            const data = await recommendationEngine.getRecommendations(watchlistMovies, this.currentPage);

            const grid = document.querySelector('#recommendationMovies .movie-grid');
            if (grid) {
                data.results.forEach(movie => {
                    const card = ui.createMovieCard(movie, true);
                    grid.appendChild(card);
                });
            }

            // 移除旧的触发器并创建新的
            const oldTrigger = document.getElementById('recommendationsTrigger');
            if (oldTrigger) {
                oldTrigger.remove();
            }

            if (this.currentPage < this.totalPages) {
                const container = document.getElementById('recommendationMovies');
                const trigger = document.createElement('div');
                trigger.id = 'recommendationsTrigger';
                trigger.className = 'infinite-scroll-trigger';
                trigger.dataset.page = 'recommendations';
                container.appendChild(trigger);

                this.setupRecommendationsObserver();
            }

        } catch (error) {
            console.error('Error loading more recommendations:', error);
        } finally {
            this.isLoading = false;
            loadingDiv.style.display = 'none';
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    // 检查API密钥
    if (CONFIG.API_KEY === 'YOUR_TMDB_API_KEY') {
        alert('请在 config.js 中设置您的 TMDB API 密钥！\n\n您可以在这里免费获取: https://www.themoviedb.org/settings/api');
        return;
    }

    // 创建并启动应用
    const app = new MovieApp();

    // 将app实例暴露到全局，方便调试
    window.movieApp = app;
});
