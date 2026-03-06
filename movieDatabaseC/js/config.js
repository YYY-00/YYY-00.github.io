// TMDB API 配置
// 请在 https://www.themoviedb.org/settings/api 注册并获取免费的 API Key
export const config = {
    // ===== 请在此处添加你的 TMDB API Key =====
    apiKey: 'YOUR_TMDB_API_KEY_HERE',
    // ========================================

    // API 基础 URL
    apiBaseUrl: 'https://api.themoviedb.org/3',

    // 图片基础 URL
    imageBaseUrl: 'https://image.tmdb.org/t/p',

    // 图片尺寸配置
    imageSizes: {
        poster: 'w500',
        backdrop: 'w1280',
        profile: 'w185',
        still: 'w300'
    },

    // YouTube 嵌入 URL
    youtubeEmbedUrl: 'https://www.youtube.com/embed/'
};

// 图片 URL 生成辅助函数
export function getImageUrl(path, type = 'poster') {
    if (!path) return null;
    const size = config.imageSizes[type] || config.imageSizes.poster;
    return `${config.imageBaseUrl}/${size}${path}`;
}

// 验证 API Key 是否已配置
export function isApiKeyConfigured() {
    return config.apiKey && config.apiKey !== 'YOUR_TMDB_API_KEY_HERE';
}

// 获取 API Key（带验证）
export function getApiKey() {
    if (!isApiKeyConfigured()) {
        throw new Error(
            'TMDB API Key 未配置。请在 js/config.js 中添加你的 API Key。\n' +
            '注册地址: https://www.themoviedb.org/settings/api'
        );
    }
    return config.apiKey;
}
