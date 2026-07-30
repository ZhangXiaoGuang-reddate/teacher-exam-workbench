/* ============================================
   时间提醒模块
   ============================================ */

const CountdownModule = {
  timer: null,

  init() {
    const page = document.getElementById('page-countdown');
    if (!page) {
      const pc = document.getElementById('pageContent');
      const div = document.createElement('div');
      div.className = 'page';
      div.id = 'page-countdown';
      div.dataset.page = 'countdown';
      pc.appendChild(div);
    }
    Router.register('countdown', () => this.render());
  },

  render() {
    const examDate = Utils.getExamDate();
    const now = new Date();
    const exam = new Date(examDate);
    const totalDays = Utils.daysBetween(now.toISOString().split('T')[0], examDate);
    const diffMs = exam - now;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    const customEvents = Store.get('customEvents');

    const page = document.getElementById('page-countdown');
    page.innerHTML = `
      <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:20px">⏳ 时间提醒</h2>

      <div class="card mb-4">
        <div class="countdown-hero">
          <div class="countdown-title">📝 教资笔试倒计时</div>
          <div class="countdown-number" id="countdownDays">${Math.max(0, days)}</div>
          <div class="countdown-label">天</div>
          <div class="countdown-detail">
            <div class="countdown-unit">
              <div class="countdown-unit-value" id="countdownHours">${Math.max(0, hours)}</div>
              <div class="countdown-unit-label">小时</div>
            </div>
            <div class="countdown-unit">
              <div class="countdown-unit-value" id="countdownMinutes">${Math.max(0, minutes)}</div>
              <div class="countdown-unit-label">分钟</div>
            </div>
            <div class="countdown-unit">
              <div class="countdown-unit-value" id="countdownSeconds">${Math.max(0, seconds)}</div>
              <div class="countdown-unit-label">秒</div>
            </div>
          </div>
          <div style="margin-top:16px">
            <span class="badge ${days <= 7 ? 'badge-danger' : days <= 30 ? 'badge-warning' : 'badge-primary'}">
              ${days <= 0 ? '🎉 考试日到了！' : days <= 7 ? '⏰ 冲刺阶段！' : days <= 30 ? '📚 备考关键期' : '💪 时间充裕，合理规划'}
            </span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">📌 自定义时间节点</span>
          <button class="btn btn-sm btn-primary" onclick="CountdownModule.addEvent()">+ 添加节点</button>
        </div>
        <div class="custom-events">
          ${customEvents.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state-icon">📅</div>
              <p class="empty-state-text">还没有自定义时间节点</p>
              <p class="text-sm text-muted">添加报名时间、准考证打印时间等重要节点</p>
            </div>
          ` : customEvents.map((e, i) => {
            const d = Utils.daysBetween(Utils.today(), e.date);
            return `
              <div class="event-item">
                <div class="event-info">
                  <h4>${Utils.escapeHtml(e.title)}</h4>
                  <p>${Utils.formatDate(e.date)}</p>
                </div>
                <div class="event-countdown">
                  ${d < 0 ? '已过期' : d === 0 ? '今天！' : `还有 ${d} 天`}
                </div>
                <button class="btn btn-sm btn-icon btn-secondary" onclick="CountdownModule.removeEvent(${i})" title="删除">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // 每秒更新倒计时
    this.startCountdownTick();
  },

  startCountdownTick() {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      const examDate = Utils.getExamDate();
      const exam = new Date(examDate);
      const now = new Date();
      const diffMs = exam - now;

      const daysEl = document.getElementById('countdownDays');
      const hoursEl = document.getElementById('countdownHours');
      const minutesEl = document.getElementById('countdownMinutes');
      const secondsEl = document.getElementById('countdownSeconds');

      if (daysEl) daysEl.textContent = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      if (hoursEl) hoursEl.textContent = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
      if (minutesEl) minutesEl.textContent = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));
      if (secondsEl) secondsEl.textContent = Math.max(0, Math.floor((diffMs % (1000 * 60)) / 1000));
    }, 1000);
  },

  addEvent() {
    const modal = Utils.showModal('添加时间节点', `
      <div class="form-group">
        <label class="form-label">节点名称</label>
        <input type="text" class="input" id="newEventTitle" placeholder="如：准考证打印">
      </div>
      <div class="form-group">
        <label class="form-label">日期</label>
        <input type="date" class="input" id="newEventDate">
      </div>
      <button class="btn btn-primary" id="saveEventBtn">保存</button>
    `);
    document.getElementById('saveEventBtn').onclick = () => {
      const title = document.getElementById('newEventTitle').value.trim();
      const date = document.getElementById('newEventDate').value;
      if (!title || !date) {
        Utils.showToast('请填写完整信息', 'error');
        return;
      }
      const events = Store.get('customEvents');
      events.push({ title, date, id: Utils.uid() });
      events.sort((a, b) => a.date.localeCompare(b.date));
      Store.set('customEvents', events);
      modal.close();
      this.render();
      Utils.showToast('时间节点已添加', 'success');
    };
  },

  removeEvent(index) {
    const events = Store.get('customEvents');
    events.splice(index, 1);
    Store.set('customEvents', events);
    this.render();
    Utils.showToast('节点已删除', 'info');
  },
};
