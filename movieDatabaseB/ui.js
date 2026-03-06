// UI 管理
class UI {
    constructor() {
        this.currentPage = 'home';
        this.movieDataCache = new Map();
    }

    // 显示加载状态
    showLoading() {
        document.getElementById('loadingSpinner').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingSpinner').style.display = 'none';
    }

    // 切换页面
    showPage(pageName) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        const targetPage = document.getElementById(pageName + 'Page');
        if (targetPage) {
            targetPage.classList.add('active');
        }

        this.currentPage = pageName;
        window.scrollTo(0, 0);
    }

    // 创建电影卡片
    createMovieCard(movie, showAddButton = false) {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.dataset.movieId = movie.id;

        const posterUrl = api.getImageUrl(movie.poster_path, 'POSTER', 'MEDIUM');

        let html = `
            <img src="${posterUrl}" alt="${movie.title}" class="movie-poster" loading="lazy">
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <div class="movie-rating">
                    <span class="star">★</span>
                    <span>${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                </div>
        `;

        if (showAddButton) {
            const isInWatchlist = watchlist.isInWatchlist(movie.id);
            html += `
                <button class="add-to-watchlist-btn ${isInWatchlist ? 'in-watchlist' : ''}" data-movie-id="${movie.id}">
                    ${isInWatchlist ? '✓ 已添加' : '+ 添加'}
                </button>
            `;
        }

        html += `
            </div>
        `;

        card.innerHTML = html;
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('add-to-watchlist-btn')) {
                this.showMovieDetails(movie.id);
            }
        });

        if (showAddButton) {
            const addBtn = card.querySelector('.add-to-watchlist-btn');
            addBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleWatchlist(movie, addBtn);
            });
        }

        return card;
    }

    // 显示电影详情
    async showMovieDetails(movieId) {
        this.showLoading();

        try {
            // 检查缓存
            let movieDetails = this.movieDataCache.get(movieId);

            if (!movieDetails) {
                // 获取电影详情
                const [details, credits, videos] = await Promise.all([
                    api.getMovieDetails(movieId),
                    api.getMovieCredits(movieId),
                    api.getMovieVideos(movieId)
                ]);

                movieDetails = {
                    ...details,
                    cast: credits.cast,
                    crew: credits.crew,
                    videos: videos.results
                };

                // 缓存数据
                this.movieDataCache.set(movieId, movieDetails);
            }

            this.renderMovieDetails(movieDetails);
            this.showPage('details');

        } catch (error) {
            console.error('Error loading movie details:', error);
            this.showError('加载电影详情失败，请稍后重试。');
        } finally {
            this.hideLoading();
        }
    }

    // 渲染电影详情
    renderMovieDetails(movie) {
        const container = document.getElementById('movieDetails');

        const posterUrl = api.getImageUrl(movie.poster_path, 'POSTER', 'LARGE');
        const backdropUrl = api.getImageUrl(movie.backdrop_path, 'BACKDROP', 'LARGE');
        const isInWatchlist = watchlist.isInWatchlist(movie.id);

        // 查找预告片
        const trailer = movie.videos?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
        const trailerEmbed = trailer
            ? `<div class="trailer-container"><iframe src="https://www.youtube.com/embed/${trailer.key}" allowfullscreen></iframe></div>`
            : '<div class="no-trailer">暂无预告片</div>';

        // 类型标签
        const genreTags = movie.genres?.map(g =>
            `<span class="genre-tag">${g.name}</span>`
        ).join('') || '';

        // 导演信息
        const director = movie.crew?.find(c => c.job === 'Director');

        // 演员
        const castHtml = movie.cast?.slice(0, 12).map(actor => {
            const photoUrl = api.getImageUrl(actor.profile_path, 'PROFILE', 'MEDIUM');
            return `
                <div class="cast-card">
                    <img src="${photoUrl}" alt="${actor.name}" class="cast-photo" loading="lazy">
                    <div class="cast-name">${actor.name}</div>
                    <div class="cast-character">${actor.character}</div>
                </div>
            `;
        }).join('') || '<p>暂无演员信息</p>';

        container.innerHTML = `
            <div class="movie-details">
                <div>
                    <img src="${posterUrl}" alt="${movie.title}" class="movie-details-poster">
                </div>
                <div class="movie-details-content">
                    <h1>${movie.title}</h1>

                    <div class="movie-meta">
                        <div class="meta-item">
                            <span class="star">★</span>
                            <span>${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</span>
                        </div>
                        ${movie.release_date ? `<div class="meta-item">📅 ${movie.release_date.split('-')[0]}</div>` : ''}
                        ${movie.runtime ? `<div class="meta-item">⏱ ${movie.runtime}分钟</div>` : ''}
                        ${director ? `<div class="meta-item">🎬 导演: ${director.name}</div>` : ''}
                    </div>

                    <div class="genres">
                        ${genreTags}
                    </div>

                    <button class="add-to-watchlist-btn ${isInWatchlist ? 'in-watchlist' : ''}" id="detailsWatchlistBtn">
                        ${isInWatchlist ? '✓ 已在观影列表' : '+ 添加到观影列表'}
                    </button>

                    ${movie.overview ? `
                        <div class="overview">
                            <h3>剧情简介</h3>
                            <p>${movie.overview}</p>
                        </div>
                    ` : ''}
                </div>
            </div>

            ${trailer ? `
                <div class="details-section">
                    <h2>🎬 预告片</h2>
                    ${trailerEmbed}
                </div>
            ` : ''}

            ${castHtml ? `
                <div class="details-section">
                    <h2>🎭 演员</h2>
                    <div class="cast-grid">
                        ${castHtml}
                    </div>
                </div>
            ` : ''}
        `;

        // 绑定观影列表按钮事件
        const watchlistBtn = document.getElementById('detailsWatchlistBtn');
        watchlistBtn.addEventListener('click', () => {
            this.toggleWatchlist(movie, watchlistBtn);
        });
    }

    // 切换观影列表状态
    toggleWatchlist(movie, button) {
        const isInWatchlist = watchlist.toggle(movie);

        if (isInWatchlist) {
            button.textContent = '✓ 已添加';
            button.classList.add('in-watchlist');
            this.showToast(`已将《${movie.title}》添加到观影列表`);
        } else {
            button.textContent = '+ 添加';
            button.classList.remove('in-watchlist');
            this.showToast(`已将《${movie.title}》从观影列表移除`);
        }

        // 更新导航栏计数
        this.updateWatchlistCount();
    }

    // 更新观影列表计数
    updateWatchlistCount() {
        const count = watchlist.getCount();
        document.getElementById('watchlistCount').textContent = count;
    }

    // 显示搜索结果
    showSearchResults(results) {
        const container = document.getElementById('searchResults');

        if (!results || results.length === 0) {
            container.innerHTML = '<div class="search-result-item"><p>未找到相关电影</p></div>';
        } else {
            container.innerHTML = results.map(movie => {
                const posterUrl = api.getImageUrl(movie.poster_path, 'POSTER', 'SMALL');
                const year = movie.release_date ? movie.release_date.split('-')[0] : '未知';

                return `
                    <div class="search-result-item" data-movie-id="${movie.id}">
                        <img src="${posterUrl}" alt="${movie.title}" class="search-result-poster">
                        <div class="search-result-info">
                            <div class="search-result-title">${movie.title}</div>
                            <div class="search-result-meta">
                                ${year} · 评分: ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            // 添加点击事件
            container.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const movieId = parseInt(item.dataset.movieId);
                    this.showMovieDetails(movieId);
                    container.classList.remove('show');
                    document.getElementById('searchInput').value = '';
                });
            });
        }

        container.classList.add('show');
    }

    // 隐藏搜索结果
    hideSearchResults() {
        document.getElementById('searchResults').classList.remove('show');
    }

    // 显示提示消息
    showToast(message) {
        // 简单的提示实现
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: var(--accent-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--radius);
            box-shadow: var(--shadow-large);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // 显示错误消息
    showError(message) {
        this.showToast(message);
    }

    // 渲染空的收藏列表状态
    renderEmptyState(container, message, icon = '📋') {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">${icon}</div>
                <h3>${message}</h3>
            </div>
        `;
    }
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 创建全局 UI 实例
const ui = new UI();
