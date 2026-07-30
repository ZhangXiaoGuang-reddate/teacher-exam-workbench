/* ============================================
   每日计划模块
   ============================================ */

const DailyPlanModule = {
  init() {
    const page = document.getElementById('page-dailyPlan');
    if (!page) {
      const pc = document.getElementById('pageContent');
      const div = document.createElement('div');
      div.className = 'page';
      div.id = 'page-dailyPlan';
      div.dataset.page = 'dailyPlan';
      pc.appendChild(div);
    }
    Router.register('dailyPlan', () => this.render());
    Store.on('dailyTasks', () => this.render());
  },

  render() {
    const tasks = Store.get('dailyTasks');
    const completed = tasks.filter(t => t.completed).length;
    const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

    const page = document.getElementById('page-dailyPlan');
    page.innerHTML = `
      <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:20px">📋 每日计划</h2>

      <div class="card mb-4">
        <div class="card-header">
          <span class="card-title">今日进度</span>
          <span class="badge ${progress === 100 ? 'badge-success' : 'badge-primary'}">${completed}/${tasks.length} 已完成</span>
        </div>
        <div class="progress-bar mb-2">
          <div class="progress-fill" style="width:${progress}%"></div>
        </div>
        <span class="text-sm text-muted">${progress === 100 ? '🎉 全部完成！太棒了！' : progress > 0 ? `完成率 ${progress}%，继续加油！` : '今天还没有开始学习哦~'}</span>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">任务列表</span>
        </div>

        <div class="task-list" id="taskList">
          ${tasks.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state-icon">📝</div>
              <p class="empty-state-text">还没有添加今日任务</p>
              <p class="text-sm text-muted">在下方输入框中添加你的学习任务吧</p>
            </div>
          ` : tasks.map(t => `
            <div class="task-item ${t.completed ? 'completed' : ''}" data-id="${t.id}">
              <div class="task-checkbox ${t.completed ? 'checked' : ''}" onclick="DailyPlanModule.toggleTask('${t.id}')"></div>
              <span class="task-text">${Utils.escapeHtml(t.text)}</span>
              <div class="task-actions">
                <button class="btn btn-sm btn-icon btn-secondary" onclick="DailyPlanModule.removeTask('${t.id}')" title="删除">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="task-add">
          <input type="text" class="input" id="taskInput" placeholder="例如：背诵科目二10道练习题..." onkeydown="if(event.key==='Enter')DailyPlanModule.addTask()">
          <button class="btn btn-primary" onclick="DailyPlanModule.addTask()">添加任务</button>
        </div>
      </div>
    `;

    // 聚焦输入框
    setTimeout(() => {
      const input = document.getElementById('taskInput');
      if (input) input.focus();
    }, 100);
  },

  addTask() {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();
    if (!text) {
      Utils.showToast('请输入任务内容', 'error');
      return;
    }
    Store.addTask(text);
    input.value = '';
    Utils.showToast('任务已添加', 'success');
  },

  toggleTask(taskId) {
    Store.toggleTaskComplete(taskId);
    const tasks = Store.get('dailyTasks');
    const task = tasks.find(t => t.id === taskId);
    if (task && task.completed) {
      Utils.showToast('✅ 任务完成！', 'success');
    }
  },

  removeTask(taskId) {
    Utils.confirm('删除任务', '确定要删除这个任务吗？').then(confirmed => {
      if (confirmed) {
        Store.removeTask(taskId);
        Utils.showToast('任务已删除', 'info');
      }
    });
  },
};
