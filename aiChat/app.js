// AI 对话助手应用
class AIChatAssistant {
    constructor() {
        this.messages = [];
        this.chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
        this.currentChatId = null;
        this.settings = JSON.parse(localStorage.getItem('settings')) || {
            apiProvider: 'claude',
            apiKey: '',
            apiUrl: '',
            model: 'claude-3-5-sonnet-20241022',
            systemPrompt: '你是一个有用的AI助手，始终以友好和专业的方式回答问题。',
            temperature: 0.7,
            maxTokens: 4096
        };

        this.init();
    }

    init() {
        this.initElements();
        this.initEventListeners();
        this.renderChatHistory();
        this.loadSettings();

        // 自动调整输入框高度
        this.autoResizeTextarea();
    }

    initElements() {
        this.messagesContainer = document.getElementById('messages');
        this.userInput = document.getElementById('userInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.settingsModal = document.getElementById('settingsModal');
        this.chatHistoryContainer = document.getElementById('chatHistory');
    }

    initEventListeners() {
        // 发送消息
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // 输入框变化
        this.userInput.addEventListener('input', () => {
            this.sendBtn.disabled = !this.userInput.value.trim();
            this.autoResizeTextarea();
        });

        // 设置弹窗
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.openSettings();
        });

        document.getElementById('closeSettings').addEventListener('click', () => {
            this.closeSettings();
        });

        document.getElementById('cancelSettings').addEventListener('click', () => {
            this.closeSettings();
        });

        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettings();
        });

        // API提供商标签
        document.getElementById('apiProvider').addEventListener('change', (e) => {
            const apiUrlGroup = document.getElementById('apiUrlGroup');
            apiUrlGroup.style.display = e.target.value === 'custom' ? 'block' : 'none';

            // 更新默认模型
            const modelInput = document.getElementById('model');
            switch(e.target.value) {
                case 'claude':
                    modelInput.value = 'claude-3-5-sonnet-20241022';
                    break;
                case 'openai':
                    modelInput.value = 'gpt-4o';
                    break;
                case 'ollama':
                    modelInput.value = 'llama3.2';
                    break;
            }
        });

        // 点击弹窗外部关闭
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettings();
            }
        });

        // 新建对话
        document.getElementById('newChatBtn').addEventListener('click', () => {
            this.newChat();
        });
    }

    autoResizeTextarea() {
        this.userInput.style.height = 'auto';
        this.userInput.style.height = Math.min(this.userInput.scrollHeight, 200) + 'px';
    }

    async sendMessage() {
        const content = this.userInput.value.trim();
        if (!content || this.sendBtn.disabled) return;

        // 检查API Key
        if (!this.settings.apiKey && this.settings.apiProvider !== 'ollama') {
            this.showNotification('请先在设置中配置 API Key', 'error');
            this.openSettings();
            return;
        }

        // 创建新对话或添加到现有对话
        if (!this.currentChatId) {
            this.currentChatId = Date.now().toString();
            this.chatHistory.unshift({
                id: this.currentChatId,
                title: content.substring(0, 30) + (content.length > 30 ? '...' : ''),
                messages: [],
                timestamp: Date.now()
            });
        }

        // 添加用户消息
        const userMessage = { role: 'user', content };
        this.messages.push(userMessage);
        this.addMessageToUI('user', content);

        // 清空输入框
        this.userInput.value = '';
        this.sendBtn.disabled = true;
        this.autoResizeTextarea();

        // 显示加载状态
        this.sendBtn.classList.add('loading');

        // 创建助手消息占位符
        const assistantMessageId = this.addMessageToUI('assistant', '', true);

        try {
            // 调用API
            await this.callAIAPI(assistantMessageId);
        } catch (error) {
            this.updateMessageContent(assistantMessageId, `**错误：** ${error.message}`);
            this.sendBtn.classList.remove('loading');
        }
    }

    async callAIAPI(messageId) {
        const { apiProvider, apiKey, model, systemPrompt, temperature, maxTokens } = this.settings;

        let apiUrl, headers, body;

        switch (apiProvider) {
            case 'claude':
                apiUrl = 'https://api.anthropic.com/v1/messages';
                headers = {
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json'
                };
                body = {
                    model,
                    max_tokens: parseInt(maxTokens),
                    system: systemPrompt,
                    messages: this.messages.map(m => ({ role: m.role, content: m.content })),
                    stream: true
                };
                break;

            case 'openai':
                apiUrl = 'https://api.openai.com/v1/chat/completions';
                headers = {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                };
                body = {
                    model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...this.messages.map(m => ({ role: m.role, content: m.content }))
                    ],
                    temperature: parseFloat(temperature),
                    max_tokens: parseInt(maxTokens),
                    stream: true
                };
                break;

            case 'ollama':
                apiUrl = 'http://localhost:11434/api/chat';
                headers = {
                    'Content-Type': 'application/json'
                };
                body = {
                    model: model || 'llama3.2',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...this.messages.map(m => ({ role: m.role, content: m.content }))
                    ],
                    stream: true
                };
                break;

            case 'custom':
                apiUrl = this.settings.apiUrl;
                headers = {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                };
                body = {
                    model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...this.messages.map(m => ({ role: m.role, content: m.content }))
                    ],
                    temperature: parseFloat(temperature),
                    max_tokens: parseInt(maxTokens),
                    stream: true
                };
                break;
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API 请求失败: ${response.status} - ${error}`);
        }

        // 处理流式响应
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;

                    try {
                        const json = JSON.parse(data);
                        let content = '';

                        if (apiProvider === 'claude') {
                            if (json.type === 'content_block_delta') {
                                content = json.delta?.text || '';
                            }
                        } else {
                            // OpenAI, Ollama, Custom
                            content = json.choices?.[0]?.delta?.content || json.message?.content || '';
                        }

                        if (content) {
                            fullContent += content;
                            this.updateMessageContent(messageId, fullContent);
                        }
                    } catch (e) {
                        // 忽略解析错误
                    }
                }
            }
        }

        // 保存助手消息
        this.messages.push({ role: 'assistant', content: fullContent });

        // 更新对话历史
        this.updateChatHistory();

        this.sendBtn.classList.remove('loading');
    }

    addMessageToUI(role, content, isLoading = false) {
        const messageId = 'msg-' + Date.now();

        // 如果是第一条消息，移除欢迎消息
        const welcomeMessage = this.messagesContainer.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        messageDiv.id = messageId;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = role === 'user' ? '你' : 'AI';

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';

        if (isLoading) {
            messageContent.innerHTML = '<div class="streaming-indicator"><span></span><span></span><span></span></div>';
        } else if (content) {
            messageContent.innerHTML = this.formatMessage(content);
        }

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        this.messagesContainer.appendChild(messageDiv);

        // 滚动到底部
        this.scrollToBottom();

        return messageId;
    }

    updateMessageContent(messageId, content) {
        const messageEl = document.getElementById(messageId);
        if (messageEl) {
            const contentEl = messageEl.querySelector('.message-content');
            contentEl.innerHTML = this.formatMessage(content);
            this.scrollToBottom();
        }
    }

    formatMessage(content) {
        // 简单的markdown格式化
        let formatted = content
            // 代码块
            .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
            // 行内代码
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // 粗体
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            // 斜体
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            // 链接
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color: #7c3aed;">$1</a>')
            // 换行
            .replace(/\n/g, '<br>');

        return formatted;
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    openSettings() {
        // 加载当前设置
        document.getElementById('apiProvider').value = this.settings.apiProvider;
        document.getElementById('apiKey').value = this.settings.apiKey;
        document.getElementById('apiUrl').value = this.settings.apiUrl || '';
        document.getElementById('model').value = this.settings.model;
        document.getElementById('systemPrompt').value = this.settings.systemPrompt;
        document.getElementById('temperature').value = this.settings.temperature;
        document.getElementById('maxTokens').value = this.settings.maxTokens;

        // 显示/隐藏API URL
        document.getElementById('apiUrlGroup').style.display =
            this.settings.apiProvider === 'custom' ? 'block' : 'none';

        this.settingsModal.classList.add('active');
    }

    closeSettings() {
        this.settingsModal.classList.remove('active');
    }

    saveSettings() {
        this.settings = {
            apiProvider: document.getElementById('apiProvider').value,
            apiKey: document.getElementById('apiKey').value,
            apiUrl: document.getElementById('apiUrl').value,
            model: document.getElementById('model').value,
            systemPrompt: document.getElementById('systemPrompt').value,
            temperature: parseFloat(document.getElementById('temperature').value),
            maxTokens: parseInt(document.getElementById('maxTokens').value)
        };

        localStorage.setItem('settings', JSON.stringify(this.settings));
        this.closeSettings();
        this.showNotification('设置已保存', 'success');
    }

    loadSettings() {
        // 设置已从localStorage加载到构造函数
    }

    renderChatHistory() {
        this.chatHistoryContainer.innerHTML = '';

        this.chatHistory.forEach(chat => {
            const item = document.createElement('div');
            item.className = 'chat-history-item';
            if (chat.id === this.currentChatId) {
                item.classList.add('active');
            }

            const title = document.createElement('div');
            title.className = 'chat-history-item-title';
            title.textContent = chat.title;

            item.appendChild(title);
            item.addEventListener('click', () => this.loadChat(chat.id));

            this.chatHistoryContainer.appendChild(item);
        });
    }

    loadChat(chatId) {
        const chat = this.chatHistory.find(c => c.id === chatId);
        if (!chat) return;

        this.currentChatId = chatId;
        this.messages = [...chat.messages];

        // 清空当前消息
        this.messagesContainer.innerHTML = '';

        // 显示消息
        chat.messages.forEach(msg => {
            this.addMessageToUI(msg.role, msg.content);
        });

        this.renderChatHistory();
    }

    updateChatHistory() {
        const chat = this.chatHistory.find(c => c.id === this.currentChatId);
        if (chat) {
            chat.messages = [...this.messages];
            chat.timestamp = Date.now();
        }

        localStorage.setItem('chatHistory', JSON.stringify(this.chatHistory));
        this.renderChatHistory();
    }

    newChat() {
        this.currentChatId = null;
        this.messages = [];
        this.messagesContainer.innerHTML = `
            <div class="welcome-message">
                <h1>欢迎使用 AI 对话助手</h1>
                <p>开始新的对话</p>
            </div>
        `;
        this.renderChatHistory();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: ${type === 'error' ? '#ef4444' : '#22c55e'};
            color: white;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
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

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new AIChatAssistant();
});
