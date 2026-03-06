// TMDB API Configuration
const CONFIG = {
    API_KEY: 'YOUR_TMDB_API_KEY', // 请替换为你的 TMDB API 密钥
    BASE_URL: 'https://api.themoviedb.org/3',
    IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
    YOUTUBE_BASE_URL: 'https://www.youtube.com/embed/',
    DEBOUNCE_DELAY: 300,
    CACHE_DURATION: 5 * 60 * 1000, // 5分钟缓存
};

// 图片尺寸
const IMAGE_SIZES = {
    POSTER: {
        SMALL: 'w154',
        MEDIUM: 'w342',
        LARGE: 'w500',
        ORIGINAL: 'original'
    },
    BACKDROP: {
        SMALL: 'w300',
        MEDIUM: 'w780',
        LARGE: 'w1280',
        ORIGINAL: 'original'
    },
    PROFILE: {
        SMALL: 'w45',
        MEDIUM: 'w185',
        LARGE: 'h632'
    }
};

// API 端点
const ENDPOINTS = {
    POPULAR: '/movie/popular',
    TOP_RATED: '/movie/top_rated',
    UPCOMING: '/movie/upcoming',
    SEARCH: '/search/movie',
    DETAILS: '/movie/',
    CREDITS: '/movie/{}/credits',
    VIDEOS: '/movie/{}/videos',
    RECOMMENDATIONS: '/movie/{}/recommendations',
    DISCOVER: '/discover/movie'
};
