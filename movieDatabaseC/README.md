# 电影数据库应用

一个功能完整的电影数据库应用，使用 TMDB (The Movie Database) API 作为数据源。

## 功能特点

- 🎬 **电影浏览**: 热门电影、评分最高、即将上映三个板块
- 🔍 **智能搜索**: 带防抖的电影搜索功能
- 📖 **详情查看**: 完整的电影详情、演员、剧组、预告片
- 📝 **观影列表**: 本地存储的个人观影列表管理
- 🎯 **智能推荐**: 基于观影偏好的推荐引擎
- 🌙 **深色模式**: 支持深色/浅色主题切换
- ♾️ **无限滚动**: 自动加载更多内容
- 💾 **本地缓存**: 提升加载速度

## 技术栈

- **前端框架**: 纯 HTML/CSS/JavaScript (原生 Web 技术栈)
- **样式**: Tailwind CSS (CDN 引入)
- **数据存储**: localStorage (观影列表和缓存)
- **API**: TMDB API v3

## 快速开始

### 1. 获取 TMDB API Key

1. 访问 [TMDB](https://www.themoviedb.org/)
2. 注册账号并登录
3. 前往 [API 设置](https://www.themoviedb.org/settings/api)
4. 申请免费的开发者 API Key

### 2. 配置 API Key

打开 `js/config.js` 文件，将你的 API Key 替换到下面的位置：

```javascript
export const config = {
    // ===== 请在此处添加你的 TMDB API Key =====
    apiKey: 'YOUR_TMDB_API_KEY_HERE',
    // ========================================
    // ...
};
```

### 3. 运行应用

由于使用了 ES6 模块，需要使用 HTTP 服务器运行：

```bash
# 使用 Python
python -m http.server 8000

# 使用 Node.js
npx serve .

# 使用 PHP
php -S localhost:8000
```

然后访问 http://localhost:8000

## 项目结构

```
电影数据库/
├── index.html          # 主页面
├── styles.css          # 自定义样式
├── js/
│   ├── config.js       # TMDB API 配置
│   ├── api.js          # API 调用封装
│   ├── cache.js        # 缓存管理
│   ├── components.js   # UI 组件
│   ├── app.js          # 主应用逻辑
│   └── utils.js        # 工具函数
├── .gitignore         # Git 忽略文件
└── README.md          # 项目说明
```

## 核心功能说明

### 电影浏览
- **热门电影**: 每日热门电影列表
- **评分最高**: 按评分排序的电影
- **即将上映**: 即将上映的电影

### 搜索功能
- 支持电影标题搜索
- 300ms 防抖延迟
- 实时显示搜索结果

### 电影详情
- 高清海报和背景图
- 评分、时长、类型等信息
- 完整的演员列表
- 导演和编剧信息
- YouTube 预告片播放

### 观影列表
- 添加/移除电影
- 本地 localStorage 存储
- 查看统计数据
- 按类型筛选

### 推荐引擎
- 基于观影历史分析
- 类型偏好计算
- 智能推荐算法

### 深色模式
- 支持 CSS 变量主题
- 自动检测系统偏好
- 本地保存用户选择

## API 使用

应用使用了以下 TMDB API 端点：

- `/trending/movie/day` - 每日热门电影
- `/movie/top_rated` - 评分最高电影
- `/movie/upcoming` - 即将上映电影
- `/search/movie` - 搜索电影
- `/movie/{id}` - 电影详情
- `/movie/{id}/credits` - 演员和剧组
- `/movie/{id}/videos` - 预告片
- `/discover/movie` - 按类型发现电影

## 缓存策略

- API 响应默认缓存 1 小时
- 搜索结果缓存 30 分钟
- 电影详情缓存 24 小时
- 自动清理过期缓存

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

需要支持以下特性：
- ES6 模块
- Fetch API
- LocalStorage
- Intersection Observer
- CSS 变量

## 注意事项

1. **API Key 安全**: 不要将配置了 API Key 的 config.js 文件上传到公共仓库
2. **API 限制**: TMDB 免费 API 有请求频率限制
3. **HTTPS**: 部署到生产环境时建议使用 HTTPS
4. **跨域**: 本地开发时使用 HTTP 服务器避免跨域问题

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 致谢

- [TMDB](https://www.themoviedb.org/) - 提供电影数据 API
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
