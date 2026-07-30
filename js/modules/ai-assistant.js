/* ============================================
   AI助手模块 - Deepseek集成
   ============================================ */

const AIAssistantModule = {
  init() {
    const page = document.getElementById('page-aiAssistant');
    if (!page) {
      const pc = document.getElementById('pageContent');
      const div = document.createElement('div');
      div.className = 'page';
      div.id = 'page-aiAssistant';
      div.dataset.page = 'aiAssistant';
      pc.appendChild(div);
    }
    Router.register('aiAssistant', () => this.render());
  },

  render() {
    const messages = Store.get('aiMessages');
    const apiKey = Store.get('aiApiKey');

    const page = document.getElementById('page-aiAssistant');
    page.innerHTML = `
      <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:20px">🤖 AI助手</h2>

      <div class="card mb-4" id="apiKeyCard" style="${apiKey ? 'display:none' : ''}">
        <div class="card-header"><span class="card-title">🔑 API 配置</span></div>
        <p class="text-sm text-muted mb-3">请输入 Deepseek API Key 以使用 AI 助手功能</p>
        <div class="flex gap-3">
          <input type="password" class="input" id="apiKeyInput" placeholder="sk-...">
          <button class="btn btn-primary" onclick="AIAssistantModule.saveApiKey()">保存</button>
        </div>
        <p class="form-hint mt-2">API Key 仅保存在本地浏览器中</p>
      </div>

      <div class="ai-chat" id="aiChat" style="${!apiKey ? 'display:none' : ''}">
        <div class="ai-messages" id="aiMessages">
          ${messages.length === 0 ? `
            <div style="text-align:center;padding:40px 20px;color:var(--color-text-muted)">
              <div style="font-size:3rem;margin-bottom:12px">🤖</div>
              <p style="font-weight:500;margin-bottom:4px">Deepseek AI 助手</p>
              <p style="font-size:0.85rem">可以问我教资考试相关问题，如：</p>
              <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:8px">
                ${['综合素质考试重点', '教育心理学知识点', '教学设计怎么写', '材料分析题答题技巧'].map(q => `
                  <span class="tag" style="cursor:pointer" onclick="AIAssistantModule.quickAsk('${q}')">${q}</span>
                `).join('')}
              </div>
            </div>
          ` : messages.map(m => `
            <div class="ai-message ${m.role}">${this.formatMessage(m.content)}</div>
          `).join('')}
        </div>
        <div class="ai-input-area">
          <input type="text" class="input" id="aiInput" placeholder="输入你的问题..." onkeydown="if(event.key==='Enter')AIAssistantModule.send()">
          <button class="btn btn-primary" id="aiSendBtn" onclick="AIAssistantModule.send()">发送</button>
          <button class="btn btn-sm btn-secondary" onclick="AIAssistantModule.clearChat()" title="清空对话">🗑️</button>
        </div>
      </div>
    `;
  },

  formatMessage(content) {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      .replace(/\n/g, '<br>');
  },

  saveApiKey() {
    const key = document.getElementById('apiKeyInput').value.trim();
    if (!key) {
      Utils.showToast('请输入 API Key', 'error');
      return;
    }
    Store.set('aiApiKey', key);
    this.render();
    Utils.showToast('API Key 已保存', 'success');
  },

  quickAsk(question) {
    document.getElementById('aiInput').value = question;
    this.send();
  },

  async send() {
    const input = document.getElementById('aiInput');
    const question = input.value.trim();
    if (!question) return;

    const apiKey = Store.get('aiApiKey');
    if (!apiKey) {
      Utils.showToast('请先配置 API Key', 'error');
      return;
    }

    // 添加用户消息
    const messages = Store.get('aiMessages');
    messages.push({ role: 'user', content: question });
    Store.set('aiMessages', [...messages]);

    input.value = '';
    this.render();
    this.scrollToBottom();

    // 显示打字动画
    const msgsEl = document.getElementById('aiMessages');
    const typingEl = document.createElement('div');
    typingEl.className = 'ai-message assistant';
    typingEl.innerHTML = '<div class="ai-typing"><div class="ai-typing-dot"></div><div class="ai-typing-dot"></div><div class="ai-typing-dot"></div></div>';
    msgsEl.appendChild(typingEl);
    this.scrollToBottom();

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: '你是一位专业的教师资格考试辅导老师，擅长解答教资考试相关问题，包括综合素质、教育知识与能力、学科知识等。请用简洁清晰的中文回答，适当使用emoji和markdown格式。' },
            ...messages.map(m => ({ role: m.role, content: m.content })),
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      typingEl.remove();

      if (!response.ok) {
        throw new Error(`API错误: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.choices[0].message.content;

      messages.push({ role: 'assistant', content: reply });
      Store.set('aiMessages', [...messages]);
    } catch (err) {
      typingEl.remove();
      messages.push({ role: 'assistant', content: `❌ 请求失败：${err.message}。请检查 API Key 是否正确，以及网络连接。` });
      Store.set('aiMessages', [...messages]);
    }

    this.render();
    this.scrollToBottom();
  },

  clearChat() {
    Utils.confirm('清空对话', '确定要清空所有对话记录吗？').then(confirmed => {
      if (confirmed) {
        Store.set('aiMessages', []);
        this.render();
        Utils.showToast('对话已清空', 'info');
      }
    });
  },

  scrollToBottom() {
    setTimeout(() => {
      const el = document.getElementById('aiMessages');
      if (el) el.scrollTop = el.scrollHeight;
    }, 100);
  },
};
