# AI 对话助手

一个功能完整的 AI 对话助手界面，支持多种大模型 API 和实时流式响应。

## 功能特性

- 🚀 **实时流式响应** - 支持流式输出，实时显示 AI 生成内容
- 🤖 **多模型支持** - 支持 Claude、OpenAI、Ollama 和自定义 API
- 💬 **对话历史** - 自动保存对话历史，支持创建和切换多个对话
- 🎨 **现代UI设计** - 深色主题，响应式布局，优雅的动画效果
- ⚙️ **灵活配置** - 支持自定义系统提示词、温度、最大 Tokens 等参数
- 🔒 **本地存储** - API Key 和对话历史本地存储，保护隐私

## 快速开始

### 1. 打开应用

直接在浏览器中打开 `index.html` 文件即可使用。

### 2. 配置 API

点击左下角的 **设置** 按钮，配置你的 API：

- **Claude (Anthropic)**
  - API Key: 从 https://console.anthropic.com 获取
  - 模型: claude-3-5-sonnet-20241022（推荐）

- **OpenAI (GPT)**
  - API Key: 从 https://platform.openai.com 获取
  - 模型: gpt-4o 或 gpt-4o-mini

- **Ollama (本地模型)**
  - 无需 API Key
  - 确保 Ollama 服务运行在 http://localhost:11434

- **自定义 API**
  - 支持任何 OpenAI 兼容的 API 端点

### 3. 开始对话

配置完成后，在输入框中输入问题，按 Enter 键或点击发送按钮即可开始对话。

## 文件结构

```
ai对话助手/
├── index.html    # 主页面
├── style.css     # 样式文件
├── app.js        # 应用逻辑
└── README.md     # 说明文档
```

## 主要功能说明

### 对话管理
- 点击 **+ 新建对话** 创建新对话
- 在左侧边栏查看和切换历史对话
- 对话自动保存到浏览器本地存储

### 消息格式
- 支持 Markdown 格式渲染
- 代码块语法高亮
- 粗体、斜体、链接等格式

### 快捷操作
- `Enter` 发送消息
- `Shift + Enter` 换行
- 输入框自动调整高度

## 技术栈

- 纯 HTML5
- CSS3（使用 CSS Variables）
- 原生 JavaScript（ES6+）
- Fetch API（流式响应处理）

## 浏览器兼容性

支持所有现代浏览器：
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 注意事项

1. **API 安全**：API Key 仅保存在本地浏览器中，不会上传到任何服务器
2. **API 费用**：使用 Claude 或 OpenAI API 会产生费用，请注意控制使用量
3. **CORS 问题**：某些 API 可能有跨域限制，建议在本地服务器环境下使用

## 本地开发（可选）

如果需要本地服务器环境：

```bash
# 使用 Python
python -m http.server 8000

# 使用 Node.js
npx serve

# 使用 PHP
php -S localhost:8000
```

然后访问 http://localhost:8000

## 许可证

MIT License
