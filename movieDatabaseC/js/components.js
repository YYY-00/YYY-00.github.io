import { getImageUrl } from './config.js';
import { formatDate, formatRating, formatRuntime } from './utils.js';

/**
 * UI 组件类
 */
export class UIComponents {
    constructor() {
        this.loadingStates = new Map();
    }

    /**
     * 创建电影卡片组件
     * @param {Object} movie - 电影对象
     * @returns {HTMLElement} 电影卡片元素
     */
    createMovieCard(movie) {
        const card = document.createElement('div');
        card.className = 'movie-card fade-in';
        card.dataset.movieId = movie.id;

        const posterUrl = getImageUrl(movie.poster_path);

        card.innerHTML = `
            <img src="${posterUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300"%3E%3Crect fill="%23ccc" width="200" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="20"%3E无海报%3C/text%3E%3C/svg%3E'}"
                 alt="${movie.title}"
                 class="movie-poster"
                 loading="lazy"
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 300%22%3E%3Crect fill=%22%23ccc%22 width=%22200%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22 font-size=%2220%22%3E无海报%3C/text%3E%3C/svg%3E'">
            <div class="movie-info">
                <h3 class="movie-title" title="${movie.title}">${movie.title}</h3>
                <div class="movie-meta">
                    <span class="movie-rating">${formatRating(movie.vote_average)}</span>
                    <span class="movie-year">${formatDate(movie.release_date, 'year')}</span>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            window.location.hash = `/movie/${movie.id}`;
        });

        return card;
    }

    /**
     * 创建电影板块组件
     * @param {Object} options - 选项
     * @param {string} options.title - 板块标题
     * @param {string} options.id - 板块 ID
     * @param {Array} options.movies - 电影数组
     * @param {boolean} options.showMore - 是否显示更多按钮
     * @returns {HTMLElement} 板块元素
     */
    createMovieSection(options) {
        const { title, id, movies = [], showMore = false } = options;

        const section = document.createElement('section');
        section.className = 'movie-section';
        section.id = `section-${id}`;

        section.innerHTML = `
            <div class="section-header">
                <h2 class="section-title">${title}</h2>
                ${showMore ? `<a href="#/${id}" class="nav-link">查看更多 →</a>` : ''}
            </div>
            <div class="movie-grid" id="grid-${id}"></div>
            <div class="infinite-scroll-trigger" id="trigger-${id}"></div>
        `;

        const grid = section.querySelector(`#grid-${id}`);
        movies.forEach(movie => {
            const card = this.createMovieCard(movie);
            grid.appendChild(card);
        });

        return section;
    }

    /**
     * 创建搜索结果项组件
     * @param {Object} movie - 电影对象
     * @returns {HTMLElement} 搜索结果项元素
     */
    createSearchResultItem(movie) {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.dataset.movieId = movie.id;

        const posterUrl = getImageUrl(movie.poster_path);

        item.innerHTML = `
            <img src="${posterUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 75"%3E%3Crect fill="%23ccc" width="50" height="75"/%3E%3C/svg%3E'}"
                 alt="${movie.title}"
                 class="search-result-poster">
            <div class="search-result-info">
                <h3>${movie.title}</h3>
                <p>
                    <span>⭐ ${formatRating(movie.vote_average)}</span>
                    <span> | </span>
                    <span>${formatDate(movie.release_date, 'year')}</span>
                </p>
                ${movie.overview ? `<p title="${movie.overview}">${this.truncateText(movie.overview, 80)}</p>` : ''}
            </div>
        `;

        item.addEventListener('click', () => {
            window.location.hash = `/movie/${movie.id}`;
            this.hideSearchResults();
        });

        return item;
    }

    /**
     * 显示搜索结果
     * @param {Array} movies - 电影数组
     */
    showSearchResults(movies) {
        const searchResults = document.getElementById('searchResults');
        searchResults.innerHTML = '';

        if (movies.length === 0) {
            searchResults.innerHTML = '<div class="search-results-empty" style="padding: 1rem; text-align: center; color: var(--text-secondary);">未找到相关电影</div>';
        } else {
            movies.forEach(movie => {
                const item = this.createSearchResultItem(movie);
                searchResults.appendChild(item);
            });
        }

        searchResults.classList.remove('hidden');
    }

    /**
     * 隐藏搜索结果
     */
    hideSearchResults() {
        const searchResults = document.getElementById('searchResults');
        searchResults.classList.add('hidden');
        document.getElementById('searchInput').value = '';
    }

    /**
     * 显示加载状态
     * @param {string} key - 加载状态键
     */
    showLoading(key = 'default') {
        const indicator = document.getElementById('loadingIndicator');
        if (indicator) {
            indicator.classList.remove('hidden');
        }
        this.loadingStates.set(key, true);
    }

    /**
     * 隐藏加载状态
     * @param {string} key - 加载状态键
     */
    hideLoading(key = 'default') {
        const indicator = document.getElementById('loadingIndicator');
        if (indicator) {
            indicator.classList.remove('hidden');
        }
        this.loadingStates.delete(key);

        // 如果没有正在进行的加载，隐藏指示器
        if (this.loadingStates.size === 0 && indicator) {
            indicator.classList.add('hidden');
        }
    }

    /**
     * 创建电影详情页
     * @param {Object} movieData - 完整电影数据
     * @param {boolean} isInWatchlist - 是否在观影列表中
     * @returns {HTMLElement} 详情页元素
     */
    createMovieDetailPage(movieData, isInWatchlist = false) {
        const container = document.createElement('div');
        container.className = 'detail-container fade-in';

        const { details, credits, videos } = movieData;
        const posterUrl = getImageUrl(details.poster_path);
        const backdropUrl = getImageUrl(details.backdrop_path, 'backdrop');

        // 提取主演和导演
        const cast = credits?.cast?.slice(0, 10) || [];
        const crew = credits?.crew || [];
        const directors = crew.filter(member => member.job === 'Director');
        const writers = crew.filter(member => member.department === 'Writing').slice(0, 3);

        // 获取 YouTube 预告片
        const trailers = videos?.results?.filter(
            video => video.site === 'YouTube' && video.type === 'Trailer'
        ) || [];
        const mainTrailer = trailers[0];

        container.innerHTML = `
            <div style="grid-column: 1 / -1; position: relative; margin: -2rem -2rem 2rem -2rem;">
                ${backdropUrl ? `<img src="${backdropUrl}" alt="" style="width: 100%; height: 400px; object-fit: cover; mask-image: linear-gradient(to bottom, black 50%, transparent 100%); -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);">` : ''}
            </div>

            <img src="${posterUrl || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 300 450%22%3E%3Crect fill=%22%23ccc%22 width=%22300%22 height=%22450%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22 font-size=%2230%22%3E无海报%3C/text%3E%3C/svg%3E'}"
                 alt="${details.title}"
                 class="detail-poster">

            <div class="detail-content">
                <h1>${details.title}</h1>
                ${details.tagline ? `<p style="font-style: italic; color: var(--text-secondary); margin-bottom: 1rem;">${details.tagline}</p>` : ''}

                <div class="detail-meta">
                    <span>⭐ ${formatRating(details.vote_average)} (${details.vote_count} 人评价)</span>
                    <span>|</span>
                    <span>${formatRuntime(details.runtime)}</span>
                    <span>|</span>
                    <span>${formatDate(details.release_date)}</span>
                </div>

                ${details.genres?.length > 0 ? `
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem;">
                        ${details.genres.map(genre => `<span class="detail-genre">${genre.name}</span>`).join('')}
                    </div>
                ` : ''}

                <div class="detail-actions">
                    <button class="btn btn-primary" id="watchlistToggle">
                        ${isInWatchlist ? '❌ 从观影列表移除' : '➕ 添加到观影列表'}
                    </button>
                </div>

                ${details.overview ? `
                    <div>
                        <h3 class="detail-section-title">剧情简介</h3>
                        <p class="detail-overview">${details.overview}</p>
                    </div>
                ` : ''}

                ${directors.length > 0 ? `
                    <div class="detail-section">
                        <h3 class="detail-section-title">导演</h3>
                        <p>${directors.map(d => d.name).join(', ')}</p>
                    </div>
                ` : ''}

                ${writers.length > 0 ? `
                    <div class="detail-section">
                        <h3 class="detail-section-title">编剧</h3>
                        <p>${writers.map(w => w.name).join(', ')}</p>
                    </div>
                ` : ''}

                ${cast.length > 0 ? `
                    <div class="detail-section">
                        <h3 class="detail-section-title">演员</h3>
                        <div class="cast-grid">
                            ${cast.map(person => this.createCastCard(person)).join('')}
                        </div>
                    </div>
                ` : ''}

                ${mainTrailer ? `
                    <div class="detail-section">
                        <h3 class="detail-section-title">预告片</h3>
                        <div class="video-container">
                            <iframe
                                src="https://www.youtube.com/embed/${mainTrailer.key}"
                                allowfullscreen
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
                            </iframe>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        return container;
    }

    /**
     * 创建演员卡片
     * @param {Object} person - 演员对象
     * @returns {string} HTML 字符串
     */
    createCastCard(person) {
        const photoUrl = getImageUrl(person.profile_path, 'profile');

        return `
            <div class="cast-card">
                <img src="${photoUrl || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 185 278%22%3E%3Crect fill=%22%23ccc%22 width=%22185%22 height=%22278%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3E?%3C/text%3E%3C/svg%3E'}"
                     alt="${person.name}"
                     class="cast-photo"
                     loading="lazy">
                <div class="cast-info">
                    <p class="cast-name">${person.name}</p>
                    <p class="cast-character">${person.character}</p>
                </div>
            </div>
        `;
    }

    /**
     * 创建观影列表卡片
     * @param {Object} movie - 电影对象（包含 genres）
     * @returns {HTMLElement} 卡片元素
     */
    createWatchlistCard(movie) {
        const card = document.createElement('div');
        card.className = 'watchlist-card fade-in';
        card.dataset.movieId = movie.id;

        const posterUrl = getImageUrl(movie.poster_path);

        card.innerHTML = `
            <img src="${posterUrl || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 300%22%3E%3Crect fill=%22%23ccc%22 width=%22200%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22 font-size=%2220%22%3E无海报%3C/text%3E%3C/svg%3E'}"
                 alt="${movie.title}"
                 class="watchlist-poster"
                 loading="lazy">
            <div class="watchlist-info">
                <h3 class="movie-title">${movie.title}</h3>
                <div class="movie-meta">
                    <span class="movie-rating">${formatRating(movie.vote_average)}</span>
                    <span>${formatDate(movie.release_date, 'year')}</span>
                </div>
                ${movie.genres?.length > 0 ? `
                    <div class="watchlist-genres">
                        ${movie.genres.map(g => `<span class="watchlist-genre">${g}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="watchlist-actions">
                    <button class="btn btn-sm btn-outline btn-view-details">查看详情</button>
                    <button class="btn btn-sm btn-danger btn-remove">移除</button>
                </div>
            </div>
        `;

        card.querySelector('.btn-view-details').addEventListener('click', () => {
            window.location.hash = `/movie/${movie.id}`;
        });

        return card;
    }

    /**
     * 创建空状态
     * @param {string} icon - 图标
     * @param {string} message - 消息
     * @returns {HTMLElement} 空状态元素
     */
    createEmptyState(icon, message) {
        const div = document.createElement('div');
        div.className = 'empty-state';
        div.innerHTML = `
            <div class="empty-state-icon">${icon}</div>
            <p class="empty-state-text">${message}</p>
        `;
        return div;
    }

    /**
     * 创建统计卡片
     * @param {Object} stats - 统计数据
     * @returns {HTMLElement} 统计卡片元素
     */
    createStatsGrid(stats) {
        const grid = document.createElement('div');
        grid.className = 'stats-grid';

        const statsConfig = [
            { key: 'total', label: '总观影数', icon: '🎬' },
            { key: 'thisMonth', label: '本月新增', icon: '📅' },
            { key: 'topGenre', label: '最喜爱类型', icon: '❤️' }
        ];

        statsConfig.forEach(config => {
            const card = document.createElement('div');
            card.className = 'stat-card';
            card.innerHTML = `
                <div class="stat-value">${config.icon} ${stats[config.key] || 0}</div>
                <div class="stat-label">${config.label}</div>
            `;
            grid.appendChild(card);
        });

        return grid;
    }

    /**
     * 截断文本
     * @param {string} text - 文本
     * @param {number} maxLength - 最大长度
     * @returns {string} 截断后的文本
     */
    truncateText(text, maxLength = 100) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    /**
     * 显示提示消息
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型
     */
    showToast(message, type = 'info') {
        // 移除已有的 toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%);
            background: var(--bg-card);
            border: 1px solid var(--accent-color);
            color: var(--text-primary);
            padding: 1rem 2rem;
            border-radius: 0.5rem;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            animation: slideUp 0.3s ease-out;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

/**
 * 无限滚动管理器
 */
export class InfiniteScrollManager {
    constructor(options = {}) {
        this.observers = new Map();
        this.options = {
            rootMargin: '100px',
            threshold: 0.1,
            ...options
        };
    }

    /**
     * 为元素设置无限滚动
     * @param {string} id - 标识符
     * @param {HTMLElement} triggerElement - 触发元素
     * @param {Function} callback - 加载更多回调
     */
    observe(id, triggerElement, callback) {
        // 如果已经存在观察器，先断开
        this.unobserve(id);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    callback();
                }
            });
        }, {
            rootMargin: this.options.rootMargin,
            threshold: this.options.threshold
        });

        observer.observe(triggerElement);
        this.observers.set(id, observer);
    }

    /**
     * 停止观察
     * @param {string} id - 标识符
     */
    unobserve(id) {
        const observer = this.observers.get(id);
        if (observer) {
            observer.disconnect();
            this.observers.delete(id);
        }
    }

    /**
     * 停止所有观察
     */
    unobserveAll() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
    }
}

/**
 * 搜索组件
 */
export class SearchComponent {
    constructor(options = {}) {
        this.input = options.input || document.getElementById('searchInput');
        this.api = options.api;
        this.debounceTime = options.debounceTime || 300;
        this.components = options.components;
        this.currentSearchRequestId = 0;
        this.init();
    }

    init() {
        if (!this.input) return;

        // 防抖搜索
        let debounceTimer;
        this.input.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.handleSearch();
            }, this.debounceTime);
        });

        // 点击外部隐藏结果
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.components?.hideSearchResults();
            }
        });

        // ESC 键隐藏结果
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.components?.hideSearchResults();
            }
        });
    }

    async handleSearch() {
        const query = this.input.value.trim();

        if (!query) {
            this.components?.hideSearchResults();
            return;
        }

        try {
            this.components?.showLoading('search');

            // 使用请求 ID 来忽略过时的响应
            const requestId = ++this.currentSearchRequestId;
            const results = await this.api.searchMovies(query);

            // 只处理最新的请求结果
            if (requestId === this.currentSearchRequestId) {
                this.components?.showSearchResults(results.results || []);
            }
        } catch (error) {
            console.error('搜索失败:', error);
            this.components?.showToast('搜索失败，请稍后再试', 'error');
        } finally {
            this.components?.hideLoading('search');
        }
    }

    clear() {
        this.input.value = '';
        this.components?.hideSearchResults();
    }
}

// 创建全局组件实例
export const ui = new UIComponents();
export const infiniteScroll = new InfiniteScrollManager();
