/* ============================================
   左侧导航栏模块
   ============================================ */

const Navigation = {
  menuItems: [
    { section: '学习工具', items: [
      { id: 'planning', label: '规划中心', icon: '🗺️', desc: '45天冲刺计划' },
      { id: 'dailyPlan', label: '每日计划', icon: '📋', desc: '今日学习任务' },
      { id: 'pomodoro', label: '番茄计时', icon: '🍅', desc: '专注学习计时' },
      { id: 'subjectStudy', label: '科目学习', icon: '📚', desc: '科目一/科目二' },
    ]},
    { section: '记忆训练', items: [
      { id: 'mnemonic', label: '口诀背诵', icon: '💡', desc: '记忆口诀库' },
      { id: 'dictation', label: '大题默写', icon: '✍️', desc: '默写练习' },
    ]},
    { section: '生活管理', items: [
      { id: 'schedule', label: '作息规划', icon: '⏰', desc: '每日作息安排' },
      { id: 'mood', label: '情绪记录', icon: '💭', desc: '心情打卡' },
      { id: 'countdown', label: '时间提醒', icon: '⏳', desc: '考试倒计时' },
      { id: 'statistics', label: '数据统计', icon: '📊', desc: '学习数据分析' },
    ]},
    { section: '更多', items: [
      { id: 'aiAssistant', label: 'AI助手', icon: '🤖', desc: 'Deepseek问答' },
      { id: 'officialSite', label: '教资官网', icon: '🏫', desc: '准考证打印' },
      { id: 'settings', label: '系统设置', icon: '⚙️', desc: '个性化配置' },
    ]},
  ],

  init() {
    this.render();
    this.bindEvents();
  },

  render() {
    const nav = document.getElementById('sidebarNav');
    let html = '';

    this.menuItems.forEach(section => {
      html += `<div class="nav-section"><div class="nav-section-title">${section.section}</div>`;
      section.items.forEach(item => {
        html += `
          <button class="nav-item" data-page="${item.id}" title="${item.desc}">
            <span class="nav-item-icon">${item.icon}</span>
            <span>${item.label}</span>
          </button>
        `;
      });
      html += '</div>';
    });

    nav.innerHTML = html;
  },

  bindEvents() {
    // 导航点击
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const pageId = item.dataset.page;
        // 口诀背诵和大题默写导航到科目学习页面
        if (pageId === 'mnemonic' || pageId === 'dictation') {
          Router.navigate('subjectStudy', { tab: pageId });
        } else {
          Router.navigate(pageId);
        }
      });
    });

    // 移动端菜单切换
    document.getElementById('menuToggle').addEventListener('click', () => {
      document.getElementById('sidebar').classList.add('open');
      document.getElementById('sidebarOverlay').classList.add('show');
    });

    document.getElementById('sidebarClose').addEventListener('click', () => {
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('sidebarOverlay').classList.remove('show');
    });

    document.getElementById('sidebarOverlay').addEventListener('click', () => {
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('sidebarOverlay').classList.remove('show');
    });
  },
};
