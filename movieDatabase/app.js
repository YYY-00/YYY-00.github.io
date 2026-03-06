// ===== Main Application =====

/**
 * Movie Database Application
 */
class MovieDatabaseApp {
    constructor(apiKey) {
        // Initialize API and managers
        this.api = new TMDBAPI(apiKey);
        this.watchlistManager = new WatchlistManager();
        this.recommendationEngine = new RecommendationEngine(this.api, this.watchlistManager);

        // State
        this.currentPage = {
            popular: 1,
            top_rated: 1,
            upcoming: 1,
            movieList: 1
        };
        this.currentCategory = null;
        this.currentSection = 'home';
        this.currentMovieList = [];

        // Search state
        this.searchQuery = '';
        this.searchTimeout = null;

        // Initialize app
        this.init();
    }

    /**
     * Initialize application
     */
    async init() {
        this.setupTheme();
        this.setupEventListeners();
        await this.loadHomeData();
    }

    /**
     * Setup theme (dark mode)
     */
    setupTheme() {
        const savedTheme = Storage.get('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeButton(savedTheme);
    }

    /**
     * Update theme button icon
     * @param {string} theme - Theme name
     */
    updateThemeButton(theme) {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
        }
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        Storage.set('theme', newTheme);
        this.updateThemeButton(newTheme);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Theme toggle
        DOM.on('#themeToggle', 'click', () => this.toggleTheme());

        // Navigation
        DOM.on('.nav-link', 'click', (e) => {
            e.preventDefault();
            const section = e.target.dataset.section;
            this.navigateToSection(section);
        });

        // Back buttons
        DOM.on('.back-btn', 'click', () => {
            this.navigateToSection('home');
        });

        // Search with debounce
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            const debouncedSearch = debounce((query) => this.handleSearch(query), 500);
            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value.trim());
            });
        }

        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-box')) {
                const searchResults = document.getElementById('searchResults');
                if (searchResults) {
                    searchResults.classList.remove('active');
                }
            }
        });

        // Load more buttons
        DOM.on('#loadMorePopular', 'click', () => this.loadMore('popular'));
        DOM.on('#loadMoreTopRated', 'click', () => this.loadMore('top_rated'));
        DOM.on('#loadMoreUpcoming', 'click', () => this.loadMore('upcoming'));
        DOM.on('#loadMoreList', 'click', () => this.loadMore('movieList'));

        // View all buttons
        DOM.on('.view-all-btn', 'click', (e) => {
            const category = e.target.dataset.category;
            this.showCategoryList(category);
        });

        // Movie card clicks (delegation)
        DOM.on('.movie-grid', 'click', (e) => {
            const card = e.target.closest('.movie-card');
            if (card && !e.target.closest('.watchlist-btn')) {
                const movieId = parseInt(card.dataset.movieId);
                if (movieId) {
                    this.showMovieDetail(movieId);
                }
            }
        });

        // Watchlist toggle buttons (delegation)
        DOM.on('#app', 'click', (e) => {
            const watchlistBtn = e.target.closest('.watchlist-btn');
            if (watchlistBtn && watchlistBtn.dataset.action === 'toggle-watchlist') {
                const card = watchlistBtn.closest('.movie-card, .movie-detail-info');
                if (card) {
                    const movieId = parseInt(watchlistBtn.closest('[data-movie-id]')?.dataset.movieId);
                    if (movieId) {
                        this.toggleWatchlist(movieId);
                    }
                }
            }
        });

        // Search result clicks
        DOM.on('#searchResults', 'click', (e) => {
            const item = e.target.closest('.search-result-item');
            if (item) {
                const movieId = parseInt(item.dataset.movieId);
                if (movieId) {
                    this.showMovieDetail(movieId);
                    document.getElementById('searchResults').classList.remove('active');
                    document.getElementById('searchInput').value = '';
                }
            }
        });
    }

    /**
     * Navigate to section
     * @param {string} section - Section name
     */
    navigateToSection(section) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));

        // Update nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === section) {
                link.classList.add('active');
            }
        });

        // Show target section
        this.currentSection = section;

        switch (section) {
            case 'home':
                document.getElementById('homeSection').classList.remove('hidden');
                break;
            case 'watchlist':
                this.renderWatchlistSection();
                document.getElementById('watchlistSection').classList.remove('hidden');
                break;
            case 'recommendations':
                this.renderRecommendationsSection();
                document.getElementById('recommendationsSection').classList.remove('hidden');
                break;
        }
    }

    /**
     * Load home page data
     */
    async loadHomeData() {
        toggleLoading(true);

        try {
            await Promise.all([
                this.loadMovies('popular', 'popularMovies', 1),
                this.loadMovies('top_rated', 'topRatedMovies', 1),
                this.loadMovies('upcoming', 'upcomingMovies', 1)
            ]);
        } catch (error) {
            console.error('Error loading home data:', error);
            showToast('加载数据失败，请检查您的 API 密钥');
        }

        toggleLoading(false);
    }

    /**
     * Load movies by category
     * @param {string} category - Category name
     * @param {string} containerId - Container element ID
     * @param {number} page - Page number
     */
    async loadMovies(category, containerId, page) {
        try {
            let data;

            switch (category) {
                case 'popular':
                    data = await this.api.getPopular(page);
                    break;
                case 'top_rated':
                    data = await this.api.getTopRated(page);
                    break;
                case 'upcoming':
                    data = await this.api.getUpcoming(page);
                    break;
                default:
                    data = await this.api.getPopular(page);
            }

            const container = document.getElementById(containerId);
            if (container) {
                if (page === 1) {
                    container.innerHTML = '';
                }
                renderMovieGrid(container, data.results, this.watchlistManager);
            }

            return data;
        } catch (error) {
            console.error(`Error loading ${category} movies:`, error);
            throw error;
        }
    }

    /**
     * Load more movies
     * @param {string} category - Category name
     */
    async loadMore(category) {
        this.currentPage[category]++;

        if (category === 'movieList' && this.currentCategory) {
            await this.loadMovies(this.currentCategory, 'movieList', this.currentPage[category]);
        } else {
            const containerMap = {
                popular: 'popularMovies',
                top_rated: 'topRatedMovies',
                upcoming: 'upcomingMovies'
            };
            await this.loadMovies(category, containerMap[category], this.currentPage[category]);
        }
    }

    /**
     * Show category list
     * @param {string} category - Category name
     */
    async showCategoryList(category) {
        this.currentCategory = category;
        this.currentPage.movieList = 1;

        const titles = {
            popular: '热门电影',
            top_rated: '评分最高电影',
            upcoming: '即将上映电影'
        };

        document.getElementById('movieListTitle').textContent = titles[category] || '电影列表';

        // Hide home, show list
        document.getElementById('homeSection').classList.add('hidden');
        document.getElementById('movieListSection').classList.remove('hidden');

        toggleLoading(true);
        await this.loadMovies(category, 'movieList', 1);
        toggleLoading(false);
    }

    /**
     * Handle search with debounce (already handled by debounce function)
     * @param {string} query - Search query
     */
    async handleSearch(query) {
        if (!query) {
            document.getElementById('searchResults').classList.remove('active');
            return;
        }

        if (query.length < 2) {
            return;
        }

        try {
            const data = await this.api.searchMovies(query, 1);
            const container = document.getElementById('searchResults');
            renderSearchResults(container, data.results.slice(0, 8));
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    /**
     * Show movie detail
     * @param {number} movieId - Movie ID
     */
    async showMovieDetail(movieId) {
        toggleLoading(true);

        try {
            const [movie, credits, videos] = await Promise.all([
                this.api.getMovieDetails(movieId),
                this.api.getMovieCredits(movieId),
                this.api.getMovieVideos(movieId)
            ]);

            const inWatchlist = this.watchlistManager.isInWatchlist(movieId);
            const detailContainer = document.getElementById('movieDetail');
            detailContainer.innerHTML = '';
            detailContainer.appendChild(createMovieDetail(movie, credits, videos, inWatchlist));

            // Hide all sections, show detail
            document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
            document.getElementById('movieDetailSection').classList.remove('hidden');

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error('Error loading movie details:', error);
            showToast('加载电影详情失败');
        }

        toggleLoading(false);
    }

    /**
     * Toggle watchlist
     * @param {number} movieId - Movie ID
     */
    async toggleWatchlist(movieId) {
        const inWatchlist = this.watchlistManager.isInWatchlist(movieId);

        if (inWatchlist) {
            this.watchlistManager.removeMovie(movieId);
            showToast('已从观影列表中移除');
        } else {
            // Need to get basic movie info
            try {
                const movie = await this.api.getMovieDetails(movieId);
                this.watchlistManager.addMovie(movie);
                showToast('已添加到观影列表');
            } catch (error) {
                console.error('Error adding to watchlist:', error);
                showToast('添加失败');
            }
        }

        // Update UI
        const nowInWatchlist = this.watchlistManager.isInWatchlist(movieId);
        updateWatchlistButtons(movieId, nowInWatchlist);

        // Refresh watchlist section if visible
        if (this.currentSection === 'watchlist') {
            this.renderWatchlistSection();
        }
    }

    /**
     * Render watchlist section
     */
    renderWatchlistSection() {
        const watchlist = this.watchlistManager.getWatchlist();
        const container = document.getElementById('watchlist');
        const emptyMessage = document.getElementById('emptyWatchlist');

        if (watchlist.length === 0) {
            container.innerHTML = '';
            emptyMessage.style.display = 'block';
        } else {
            emptyMessage.style.display = 'none';
            renderWatchlist(container, watchlist);
        }
    }

    /**
     * Render recommendations section
     */
    async renderRecommendationsSection() {
        const container = document.getElementById('recommendations');
        const emptyMessage = document.getElementById('noRecommendations');
        const infoElement = document.getElementById('recommendationInfo');

        container.innerHTML = '';

        const recommendations = await this.recommendationEngine.getRecommendations(20);

        if (recommendations.length === 0) {
            emptyMessage.style.display = 'block';
            infoElement.textContent = '';
        } else {
            emptyMessage.style.display = 'none';
            const explanation = await this.recommendationEngine.getRecommendationExplanation();
            infoElement.textContent = explanation;
            renderMovieGrid(container, recommendations, this.watchlistManager);
        }
    }
}

// ===== Initialize App on DOM Load =====

document.addEventListener('DOMContentLoaded', () => {
    // You can get your free API key from https://www.themoviedb.org/settings/api
    const API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your TMDB API key

    if (API_KEY === 'YOUR_API_KEY_HERE') {
        // Show a modal or alert asking for API key
        const apiKey = prompt(
            '请输入您的 TMDB API 密钥:\n\n' +
            '您可以免费在 https://www.themoviedb.org/settings/api 获取'
        );

        if (apiKey) {
            window.movieApp = new MovieDatabaseApp(apiKey);
        } else {
            document.body.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 2rem;">
                    <div>
                        <h1>需要 TMDB API 密钥</h1>
                        <p>请访问 <a href="https://www.themoviedb.org/settings/api" target="_blank">TMDB</a> 获取免费 API 密钥，然后刷新页面并输入密钥。</p>
                    </div>
                </div>
            `;
        }
    } else {
        window.movieApp = new MovieDatabaseApp(API_KEY);
    }
});
