/* ============================================
   猫咪吉祥物 - 任务激励
   ============================================ */

const CatMascot = {
  init() {
    this.render();
    this.update();
    Store.on('dailyTasks', () => this.update());
  },

  render() {
    // 桌面端
    const catStatus = document.getElementById('catStatus');
    catStatus.innerHTML = `
      <div class="cat-container" id="catContainer">
        <span class="cat-emoji" id="catEmoji">🐱</span>
        <span class="cat-text" id="catText">加油备考!</span>
      </div>
      <div class="cat-status-tooltip" id="catTooltip"></div>
    `;

    // 移动端
    const catMobile = document.getElementById('catStatusMobile');
    catMobile.innerHTML = `
      <div class="cat-container" id="catContainerMobile">
        <span class="cat-emoji" id="catEmojiMobile">🐱</span>
        <span class="cat-text" id="catTextMobile">加油!</span>
      </div>
    `;

    document.getElementById('catContainer').addEventListener('click', () => {
      Router.navigate('dailyPlan');
    });
  },

  update() {
    const tasks = Store.get('dailyTasks');
    const incomplete = tasks.filter(t => !t.completed).length;
    const total = tasks.length;

    const states = [
      { emoji: '😿', text: '好饿...快学习!', bowl: '🍽️', threshold: Infinity },  // 很多未完成
      { emoji: '😾', text: '还有任务哦!', bowl: '🥣', threshold: 3 },
      { emoji: '🐱', text: '加油备考!', bowl: '🍚', threshold: 1 },
      { emoji: '😸', text: '做得不错!', bowl: '🐟', threshold: 0 },
      { emoji: '😻', text: '全部完成!', bowl: '🎉', threshold: -1 },
    ];

    let state;
    if (total === 0) {
      state = states[2]; // 默认状态
    } else if (incomplete === 0) {
      state = states[4]; // 全部完成
    } else if (incomplete <= 1) {
      state = states[3];
    } else if (incomplete <= 3) {
      state = states[2];
    } else {
      state = states[1];
    }

    // 更新桌面端
    document.getElementById('catEmoji').textContent = state.emoji;
    document.getElementById('catText').textContent = `${state.text} (${total - incomplete}/${total})`;

    // 更新移动端
    document.getElementById('catEmojiMobile').textContent = state.emoji;
    document.getElementById('catTextMobile').textContent = `${total - incomplete}/${total}`;

    // 全部完成时庆祝
    if (incomplete === 0 && total > 0) {
      document.getElementById('catEmoji').classList.add('cat-celebrate');
      setTimeout(() => document.getElementById('catEmoji').classList.remove('cat-celebrate'), 1000);
    }

    // 更新tooltip
    const tooltip = document.getElementById('catTooltip');
    if (tasks.length === 0) {
      tooltip.innerHTML = '<div class="empty-state" style="padding:12px"><span class="empty-state-icon">📝</span><p style="font-size:0.8rem;margin:0">还没有添加任务哦~</p></div>';
    } else {
      tooltip.innerHTML = tasks.slice(0, 5).map(t => `
        <div class="task-item" style="padding:4px 0;border:none">
          <span class="task-dot ${t.completed ? 'done' : 'pending'}"></span>
          <span style="font-size:0.8rem;flex:1;${t.completed ? 'text-decoration:line-through;opacity:0.5' : ''}">${Utils.escapeHtml(t.text)}</span>
        </div>
      `).join('') + (tasks.length > 5 ? `<div style="font-size:0.75rem;color:var(--color-text-muted);text-align:center;padding-top:4px">还有${tasks.length - 5}项...</div>` : '');
    }
  },
};
