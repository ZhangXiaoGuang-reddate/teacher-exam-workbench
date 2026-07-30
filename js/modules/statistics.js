/* ============================================
   数据统计模块
   ============================================ */

const StatisticsModule = {
  init() {
    const page = document.getElementById('page-statistics');
    if (!page) {
      const pc = document.getElementById('pageContent');
      const div = document.createElement('div');
      div.className = 'page';
      div.id = 'page-statistics';
      div.dataset.page = 'statistics';
      pc.appendChild(div);
    }
    Router.register('statistics', () => this.render());
  },

  render() {
    const stats = Store.get('studyStats');
    const tasks = Store.get('dailyTasks');
    const history = Store.get('pomodoroHistory');

    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 本周学习时长
    const weekMinutes = this.getWeekStudyMinutes(history);
    const weekData = this.getWeekData(history);

    // 科目占比
    const subject1Pct = stats.totalMinutes > 0 ? Math.round((stats.subject1Minutes / stats.totalMinutes) * 100) : 0;
    const subject2Pct = stats.totalMinutes > 0 ? Math.round((stats.subject2Minutes / stats.totalMinutes) * 100) : 0;

    const page = document.getElementById('page-statistics');
    page.innerHTML = `
      <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:20px">📊 数据统计</h2>

      <!-- 概览卡片 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card-value">${Utils.formatDuration(stats.totalMinutes)}</div>
          <div class="stat-card-label">📚 总学习时长</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-value">${completedTasks}/${totalTasks}</div>
          <div class="stat-card-label">✅ 任务完成</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-value">${completionRate}%</div>
          <div class="stat-card-label">📈 完成率</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-value">${Utils.formatDuration(weekMinutes)}</div>
          <div class="stat-card-label">📅 本周学习</div>
        </div>
      </div>

      <!-- 本周学习时长柱状图 -->
      <div class="chart-container">
        <div class="chart-title">📊 本周每日学习时长</div>
        <div class="chart-bars">
          ${weekData.map(d => `
            <div class="chart-bar-wrapper">
              <div class="chart-bar-value">${d.minutes > 0 ? Utils.formatDuration(d.minutes) : ''}</div>
              <div class="chart-bar" style="height:${Math.min(d.minutes / 2, 180)}px"></div>
              <div class="chart-bar-label">${d.label}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 科目占比 -->
      <div class="chart-container">
        <div class="chart-title">📈 各科学习占比</div>
        ${stats.totalMinutes > 0 ? `
          <div class="donut-chart">
            <svg viewBox="0 0 180 180" width="180" height="180">
              <circle cx="90" cy="90" r="70" fill="none" stroke="var(--color-bg-hover)" stroke-width="25"/>
              <circle cx="90" cy="90" r="70" fill="none" stroke="var(--color-primary)" stroke-width="25"
                stroke-dasharray="${(subject1Pct / 100) * 440} 440" stroke-dashoffset="0"/>
              <circle cx="90" cy="90" r="70" fill="none" stroke="#a855f7" stroke-width="25"
                stroke-dasharray="${(subject2Pct / 100) * 440} 440"
                stroke-dashoffset="${-((subject1Pct / 100) * 440)}"/>
            </svg>
            <div class="donut-center">
              <div class="donut-center-value">${stats.totalMinutes}</div>
              <div class="donut-center-label">总分钟</div>
            </div>
          </div>
          <div class="donut-legend">
            <div class="donut-legend-item"><span class="donut-legend-dot" style="background:var(--color-primary)"></span>科目一 ${subject1Pct}%</div>
            <div class="donut-legend-item"><span class="donut-legend-dot" style="background:#a855f7"></span>科目二 ${subject2Pct}%</div>
          </div>
        ` : `
          <div class="empty-state"><div class="empty-state-icon">📊</div><p class="empty-state-text">还没有学习数据</p></div>
        `}
      </div>

      <!-- 任务统计 -->
      <div class="chart-container">
        <div class="chart-title">📋 任务完成统计</div>
        <div style="display:flex;align-items:center;gap:16px">
          <div style="flex:1">
            <div class="progress-bar" style="height:12px;border-radius:6px">
              <div class="progress-fill" style="width:${completionRate}%;height:12px;border-radius:6px"></div>
            </div>
          </div>
          <span style="font-weight:600;font-size:1.1rem">${completionRate}%</span>
        </div>
        <div class="flex justify-between mt-2 text-sm text-muted">
          <span>已完成 ${completedTasks} 项</span>
          <span>共 ${totalTasks} 项</span>
        </div>
      </div>
    `;
  },

  getWeekStudyMinutes(history) {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const mondayStr = monday.toISOString().split('T')[0];

    return history
      .filter(h => h.date >= mondayStr)
      .reduce((sum, h) => sum + h.minutes, 0);
  },

  getWeekData(history) {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    const labels = ['一', '二', '三', '四', '五', '六', '日'];
    const data = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const minutes = history.filter(h => h.date === dateStr).reduce((sum, h) => sum + h.minutes, 0);
      data.push({ label: labels[i], minutes, isToday: dateStr === Utils.today() });
    }

    return data;
  },
};
