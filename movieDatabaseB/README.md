# 🎬 电影数据库应用

一个功能完整的电影数据库应用，使用 TMDB API 构建，具有现代化的 UI 和丰富的功能。

## ✨ 功能特性

### 🏠 主页
- **热门电影** - 浏览当前最受欢迎的电影
- **评分最高** - 查看影评人评分最高的电影
- **即将上映** - 探索即将上映的电影
- 每个板块都支持横向滚动浏览

### 🔍 智能搜索
- 实时搜索功能
- 300ms 防抖优化，减少 API 调用
- 显示电影评分和发行年份
- 点击搜索结果直接查看详情

### 📄 电影详情页
- 高质量电影海报和背景图
- 评分、发行日期、时长等元信息
- 剧情简介
- 类型标签
- 演员和剧组信息
- 嵌入式 YouTube 预告片

### 📋 观影列表
- 添加/移除电影到个人观影列表
- 使用 localStorage 持久化存储
- 实时更新计数器
- 支持批量浏览

### 🎯 智能推荐引擎
- 基于您的观影列表分析电影类型偏好
- 智能推荐符合您口味的电影
- 显示推荐理由和类型统计
- 无限滚动加载更多推荐

### 🌙 深色模式
- 完整的深色主题支持
- 平滑过渡动画
- 自动保存用户偏好
- 支持系统主题检测

### ⚡ 性能优化
- API 响应缓存（5分钟有效期）
- 懒加载图片
- 防抖搜索
- 无限滚动
- 响应式设计

## 🚀 快速开始

### 1. 获取 TMDB API 密钥

1. 访问 [TMDB](https://www.themoviedb.org/)
2. 注册账号
3. 前往 [API 设置](https://www.themoviedb.org/settings/api)
4. 申请 API 密钥（选择 "Developer" 类型）

### 2. 配置应用

编辑 `config.js` 文件，将 `YOUR_TMDB_API_KEY` 替换为您的 API 密钥：

```javascript
const CONFIG = {
    API_KEY: 'your_actual_api_key_here', // 替换这里
    // ... 其他配置
};
```

### 3. 运行应用

由于使用 ES6 模块，您需要一个本地服务器：

#### 使用 Python:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### 使用 Node.js (http-server):
```bash
npx http-server -p 8000
```

#### 使用 VS Code Live Server:
1. 安装 Live Server 扩展
2. 右键点击 `index.html`
3. 选择 "Open with Live Server"

然后在浏览器中访问 `http://localhost:8000`

## 📁 项目结构

```
电影数据库/
├── index.html          # 主 HTML 文件
├── styles.css          # 样式表（包含深色模式）
├── config.js           # 配置和常量
├── api.js              # TMDB API 服务
├── cache.js            # API 缓存系统
├── recommendations.js  # 推荐引擎
├── watchlist.js        # 观影列表管理
├── ui.js               # UI 渲染和交互
├── main.js             # 主应用逻辑
└── README.md           # 本文件
```

## 🎨 技术栈

- **纯 HTML/CSS/JavaScript** - 无框架依赖
- **TMDB API** - 电影数据源
- **LocalStorage** - 数据持久化
- **CSS Variables** - 主题切换
- **Intersection Observer** - 无限滚动
- **Fetch API** - 网络请求

## 🔧 配置选项

在 `config.js` 中，您还可以自定义：

```javascript
const CONFIG = {
    API_KEY: 'your_key',           // TMDB API 密钥
    DEBOUNCE_DELAY: 300,          // 搜索防抖延迟（毫秒）
    CACHE_DURATION: 5 * 60 * 1000 // 缓存持续时间（毫秒）
};
```

## 📱 响应式设计

应用完全适配各种屏幕尺寸：
- 📱 手机（< 768px）
- 📱 平板（768px - 1024px）
- 💻 桌面（> 1024px）

## 🌐 浏览器兼容性

支持所有现代浏览器：
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 🐛 故障排除

### API 错误
- 确保 API 密钥正确配置
- 检查网络连接
- 查看 TMDB API 状态

### 图片不显示
- TMDB 图片服务器可能需要一些时间响应
- 检查广告拦截插件

### 观影列表丢失
- 确保浏览器支持 LocalStorage
- 不要使用无痕模式
- 清除浏览器缓存会删除数据

## 📝 许可证

本项目仅用于学习和演示目的。TMDB API 使用其自己的服务条款。

## 🤝 贡献

欢迎提交问题和改进建议！

## 📞 联系

如有问题或建议，请创建 Issue。

---

享受探索电影世界的乐趣！🍿🎬
