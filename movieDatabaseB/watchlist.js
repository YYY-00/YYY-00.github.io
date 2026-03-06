// 观影列表管理
class Watchlist {
    constructor() {
        this.storageKey = 'movieWatchlist';
        this.watchlist = this.load();
    }

    // 从 localStorage 加载观影列表
    load() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading watchlist:', error);
            return [];
        }
    }

    // 保存到 localStorage
    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.watchlist));
        } catch (error) {
            console.error('Error saving watchlist:', error);
        }
    }

    // 添加电影到观影列表
    add(movie) {
        if (!this.isInWatchlist(movie.id)) {
            this.watchlist.push({
                id: movie.id,
                title: movie.title,
                poster_path: movie.poster_path,
                vote_average: movie.vote_average,
                release_date: movie.release_date,
                genres: movie.genres || [],
                addedAt: new Date().toISOString()
            });
            this.save();
            return true;
        }
        return false;
    }

    // 从观影列表移除电影
    remove(movieId) {
        const index = this.watchlist.findIndex(m => m.id === movieId);
        if (index !== -1) {
            this.watchlist.splice(index, 1);
            this.save();
            return true;
        }
        return false;
    }

    // 检查电影是否在观影列表中
    isInWatchlist(movieId) {
        return this.watchlist.some(m => m.id === movieId);
    }

    // 切换电影在观影列表中的状态
    toggle(movie) {
        if (this.isInWatchlist(movie.id)) {
            this.remove(movie.id);
            return false;
        } else {
            this.add(movie);
            return true;
        }
    }

    // 获取观影列表
    getAll() {
        return this.watchlist;
    }

    // 获取观影列表数量
    getCount() {
        return this.watchlist.length;
    }

    // 清空观影列表
    clear() {
        this.watchlist = [];
        this.save();
    }

    // 获取按类型分组的统计
    getGenreStats() {
        const genreMap = new Map();

        this.watchlist.forEach(movie => {
            if (movie.genres) {
                movie.genres.forEach(genre => {
                    const count = genreMap.get(genre.name) || 0;
                    genreMap.set(genre.name, count + 1);
                });
            }
        });

        return Array.from(genreMap.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }
}

// 创建全局观影列表实例
const watchlist = new Watchlist();
