// ===== UI Components =====

/**
 * Movie Card Component
 * @param {Object} movie - Movie data
 * @param {boolean} inWatchlist - Whether movie is in watchlist
 * @returns {HTMLElement} Movie card element
 */
function createMovieCard(movie, inWatchlist = false) {
    const card = DOM.create('div', { className: 'movie-card' });
    card.dataset.movieId = movie.id;

    // Poster
    const poster = DOM.create('img', {
        className: 'movie-poster',
        src: getImageUrl(movie.poster_path, 'w500'),
        alt: movie.title,
        loading: 'lazy'
    });
    card.appendChild(poster);

    // Watchlist button
    const watchlistBtn = DOM.create('button', {
        className: `watchlist-btn ${inWatchlist ? 'in-watchlist' : ''}`,
        'aria-label': 'Add to watchlist'
    }, inWatchlist ? '♥' : '♡');
    watchlistBtn.dataset.action = 'toggle-watchlist';
    card.appendChild(watchlistBtn);

    // Content
    const content = DOM.create('div', { className: 'movie-card-content' });

    const title = DOM.create('h3', { className: 'movie-title' }, movie.title);
    content.appendChild(title);

    const info = DOM.create('div', { className: 'movie-info' });

    const year = DOM.create('span', {}, formatDate(movie.release_date, 'year'));
    info.appendChild(year);

    const rating = DOM.create('div', { className: 'movie-rating' });
    rating.innerHTML = `⭐ <span>${movie.vote_average?.toFixed(1) || 'N/A'}</span>`;
    info.appendChild(rating);

    content.appendChild(info);
    card.appendChild(content);

    return card;
}

/**
 * Movie Detail Component
 * @param {Object} movie - Movie details data
 * @param {Object} credits - Movie credits data
 * @param {Object} videos - Movie videos data
 * @param {boolean} inWatchlist - Whether movie is in watchlist
 * @returns {HTMLElement} Movie detail element
 */
function createMovieDetail(movie, credits, videos, inWatchlist = false) {
    const detail = DOM.create('div', { className: 'movie-detail' });

    // Header with backdrop
    const header = DOM.create('div', { className: 'movie-detail-header' });

    const backdrop = DOM.create('img', {
        className: 'movie-detail-backdrop',
        src: getImageUrl(movie.backdrop_path, 'original'),
        alt: movie.title
    });
    header.appendChild(backdrop);

    const overlay = DOM.create('div', { className: 'movie-detail-overlay' });

    const poster = DOM.create('img', {
        className: 'movie-detail-poster',
        src: getImageUrl(movie.poster_path, 'w500'),
        alt: movie.title
    });
    overlay.appendChild(poster);

    const info = DOM.create('div', { className: 'movie-detail-info' });

    const title = DOM.create('h1', {}, movie.title);
    info.appendChild(title);

    const meta = DOM.create('div', { className: 'movie-detail-meta' });

    if (movie.release_date) {
        const year = DOM.create('span', {}, formatDate(movie.release_date, 'year'));
        meta.appendChild(year);
    }

    if (movie.runtime) {
        const runtime = DOM.create('span', {}, formatRuntime(movie.runtime));
        meta.appendChild(runtime);
    }

    info.appendChild(meta);

    const rating = DOM.create('div', { className: 'movie-detail-rating' });
    rating.innerHTML = `⭐ ${movie.vote_average?.toFixed(1) || 'N/A'}`;
    info.appendChild(rating);

    // Watchlist button
    const watchlistBtn = DOM.create('button', {
        className: `watchlist-btn ${inWatchlist ? 'in-watchlist' : ''}`,
        style: 'position: relative; width: auto; padding: 0.75rem 1.5rem; border-radius: 25px; margin-top: 1rem; font-size: 1rem;'
    }, inWatchlist ? '♥ 已在观影列表' : '♡ 添加到观影列表');
    watchlistBtn.dataset.action = 'toggle-watchlist';
    info.appendChild(watchlistBtn);

    overlay.appendChild(info);
    header.appendChild(overlay);
    detail.appendChild(header);

    // Content
    const content = DOM.create('div', { className: 'movie-detail-content' });

    // Overview
    const overview = DOM.create('div', { className: 'movie-detail-overview' });
    overview.innerHTML = `<h3>剧情简介</h3><p>${movie.overview || '暂无简介'}</p>`;
    content.appendChild(overview);

    // Sections
    const sections = DOM.create('div', { className: 'movie-detail-sections' });

    // Genres
    if (movie.genres && movie.genres.length > 0) {
        const genresSection = DOM.create('div', { className: 'movie-detail-section' });
        genresSection.innerHTML = '<h3>类型</h3>';
        const genresList = DOM.create('div', { className: 'genres-list' });
        movie.genres.forEach(genre => {
            const genreTag = DOM.create('span', { className: 'genre-tag' }, genre.name);
            genresList.appendChild(genreTag);
        });
        genresSection.appendChild(genresList);
        sections.appendChild(genresSection);
    }

    // Cast
    if (credits && credits.cast && credits.cast.length > 0) {
        const castSection = DOM.create('div', { className: 'movie-detail-section' });
        castSection.innerHTML = '<h3>演员</h3>';
        const castList = DOM.create('div', { className: 'cast-list' });

        credits.cast.slice(0, 12).forEach(person => {
            const castItem = DOM.create('div', { className: 'cast-item' });
            const img = person.profile_path
                ? getImageUrl(person.profile_path, 'w185')
                : 'https://via.placeholder.com/185x185?text=No+Image';
            castItem.innerHTML = `
                <img src="${img}" alt="${person.name}">
                <h4>${person.name}</h4>
                <p>${person.character}</p>
            `;
            castList.appendChild(castItem);
        });

        castSection.appendChild(castList);
        sections.appendChild(castSection);
    }

    // Crew
    if (credits && credits.crew && credits.crew.length > 0) {
        const crewSection = DOM.create('div', { className: 'movie-detail-section' });
        crewSection.innerHTML = '<h3>剧组</h3>';
        const crewList = DOM.create('div', { className: 'crew-list' });

        const keyCrew = credits.crew.filter(person =>
            ['Director', 'Screenplay', 'Producer', 'Writer'].includes(person.job)
        ).slice(0, 8);

        keyCrew.forEach(person => {
            const crewItem = DOM.create('div', { className: 'crew-item' });
            const img = person.profile_path
                ? getImageUrl(person.profile_path, 'w185')
                : 'https://via.placeholder.com/185x185?text=No+Image';
            crewItem.innerHTML = `
                <img src="${img}" alt="${person.name}">
                <h4>${person.name}</h4>
                <p>${person.job}</p>
            `;
            crewList.appendChild(crewItem);
        });

        crewSection.appendChild(crewList);
        sections.appendChild(crewSection);
    }

    // Videos/Trailers
    if (videos && videos.results && videos.results.length > 0) {
        const videosSection = DOM.create('div', { className: 'movie-detail-section' });
        videosSection.innerHTML = '<h3>预告片</h3>';
        const videosList = DOM.create('div', { className: 'videos-list' });

        const trailers = videos.results.filter(v =>
            v.type === 'Trailer' || v.type === 'Teaser'
        ).slice(0, 3);

        trailers.forEach(video => {
            const videoItem = DOM.create('div', { className: 'video-item' });
            videoItem.innerHTML = `<iframe src="${getYouTubeUrl(video.key)}" allowfullscreen></iframe>`;
            videosList.appendChild(videoItem);
        });

        // If no trailers, use first video
        if (trailers.length === 0 && videos.results[0]) {
            const videoItem = DOM.create('div', { className: 'video-item' });
            videoItem.innerHTML = `<iframe src="${getYouTubeUrl(videos.results[0].key)}" allowfullscreen></iframe>`;
            videosList.appendChild(videoItem);
        }

        videosSection.appendChild(videosList);
        sections.appendChild(videosSection);
    }

    content.appendChild(sections);
    detail.appendChild(content);

    return detail;
}

/**
 * Search Result Item Component
 * @param {Object} movie - Movie data
 * @returns {HTMLElement} Search result item element
 */
function createSearchResultItem(movie) {
    const item = DOM.create('div', { className: 'search-result-item' });
    item.dataset.movieId = movie.id;

    const img = DOM.create('img', {
        src: getImageUrl(movie.poster_path, 'w92'),
        alt: movie.title
    });
    item.appendChild(img);

    const info = DOM.create('div', { className: 'search-result-info' });

    const title = DOM.create('h3', {}, truncateText(movie.title, 40));
    info.appendChild(title);

    const details = DOM.create('p', {}, `${formatDate(movie.release_date, 'year')} • ⭐ ${movie.vote_average?.toFixed(1) || 'N/A'}`);
    info.appendChild(details);

    item.appendChild(info);

    return item;
}

/**
 * Render movie grid
 * @param {HTMLElement} container - Container element
 * @param {Array} movies - Array of movie objects
 * @param {WatchlistManager} watchlistManager - Watchlist manager instance
 */
function renderMovieGrid(container, movies, watchlistManager) {
    container.innerHTML = '';

    movies.forEach(movie => {
        const inWatchlist = watchlistManager.isInWatchlist(movie.id);
        const card = createMovieCard(movie, inWatchlist);
        container.appendChild(card);
    });
}

/**
 * Render watchlist
 * @param {HTMLElement} container - Container element
 * @param {Array} movies - Array of movie objects
 */
function renderWatchlist(container, movies) {
    container.innerHTML = '';

    if (movies.length === 0) {
        return;
    }

    movies.forEach(movie => {
        const card = createMovieCard(movie, true);
        container.appendChild(card);
    });
}

/**
 * Render search results
 * @param {HTMLElement} container - Search results container
 * @param {Array} movies - Array of movie objects
 */
function renderSearchResults(container, movies) {
    container.innerHTML = '';

    if (movies.length === 0) {
        container.classList.remove('active');
        return;
    }

    movies.forEach(movie => {
        const item = createSearchResultItem(movie);
        container.appendChild(item);
    });

    container.classList.add('active');
}

/**
 * Update watchlist button on movie cards
 * @param {number} movieId - Movie ID
 * @param {boolean} inWatchlist - Whether movie is in watchlist
 */
function updateWatchlistButtons(movieId, inWatchlist) {
    const buttons = document.querySelectorAll(`[data-movie-id="${movieId}"] .watchlist-btn`);
    buttons.forEach(btn => {
        if (inWatchlist) {
            btn.classList.add('in-watchlist');
            btn.innerHTML = btn.classList.contains('movie-detail-info') ? '♥ 已在观影列表' : '♥';
        } else {
            btn.classList.remove('in-watchlist');
            btn.innerHTML = '♡';
        }
    });
}
