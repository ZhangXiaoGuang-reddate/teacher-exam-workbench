/* ============================================
   作息规划模块
   ============================================ */

const ScheduleModule = {
  currentType: 'workday',

  init() {
    const page = document.getElementById('page-schedule');
    if (!page) {
      const pc = document.getElementById('pageContent');
      const div = document.createElement('div');
      div.className = 'page';
      div.id = 'page-schedule';
      div.dataset.page = 'schedule';
      pc.appendChild(div);
    }
    Router.register('schedule', () => this.render());
  },

  render() {
    const schedule = this.currentType === 'workday'
      ? Store.get('scheduleWorkday')
      : Store.get('scheduleWeekend');

    const page = document.getElementById('page-schedule');
    page.innerHTML = `
      <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:20px">⏰ 作息规划</h2>

      <div class="schedule-day-type mb-4">
        <button class="schedule-day-btn ${this.currentType === 'workday' ? 'active' : ''}" onclick="ScheduleModule.switchType('workday')">
          📅 工作日
        </button>
        <button class="schedule-day-btn ${this.currentType === 'weekend' ? 'active' : ''}" onclick="ScheduleModule.switchType('weekend')">
          🛋️ 休息日
        </button>
      </div>

      <div class="card mb-4">
        <div class="card-header">
          <span class="card-title">🌅 基础时间</span>
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">🌞 起床时间</label>
            <input type="time" class="input" id="wakeTime" value="${schedule.wake}" onchange="ScheduleModule.updateBaseTime()">
          </div>
          <div class="form-group">
            <label class="form-label">🌙 入睡时间</label>
            <input type="time" class="input" id="sleepTime" value="${schedule.sleep}" onchange="ScheduleModule.updateBaseTime()">
          </div>
        </div>
        <div class="text-sm text-muted mt-2">
          💤 建议睡眠时长：${this.calcSleepHours(schedule.wake, schedule.sleep)}
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">📋 日程安排</span>
          <button class="btn btn-sm btn-primary" onclick="ScheduleModule.addSlot()">+ 添加时段</button>
        </div>
        <div class="schedule-timeline" id="scheduleTimeline">
          ${schedule.slots.map((s, i) => `
            <div class="schedule-item">
              <span class="schedule-time">${s.time}</span>
              <span class="schedule-icon">${s.icon}</span>
              <span class="schedule-label">${Utils.escapeHtml(s.label)}</span>
              <button class="btn btn-sm btn-icon btn-secondary" onclick="ScheduleModule.removeSlot(${i})" title="删除">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  switchType(type) {
    this.currentType = type;
    this.render();
  },

  calcSleepHours(wake, sleep) {
    const w = wake.split(':').map(Number);
    const s = sleep.split(':').map(Number);
    let hours = (24 - s[0] - s[1] / 60) + w[0] + w[1] / 60;
    if (hours > 24) hours -= 24;
    return `${Math.floor(hours)}小时${Math.round((hours % 1) * 60)}分钟`;
  },

  updateBaseTime() {
    const wake = document.getElementById('wakeTime').value;
    const sleep = document.getElementById('sleepTime').value;
    const schedule = this.currentType === 'workday'
      ? Store.get('scheduleWorkday')
      : Store.get('scheduleWeekend');
    schedule.wake = wake || schedule.wake;
    schedule.sleep = sleep || schedule.sleep;
    if (this.currentType === 'workday') {
      Store.set('scheduleWorkday', { ...schedule });
    } else {
      Store.set('scheduleWeekend', { ...schedule });
    }
    this.render();
  },

  addSlot() {
    const modal = Utils.showModal('添加日程', `
      <div class="form-group">
        <label class="form-label">时间</label>
        <input type="time" class="input" id="newSlotTime">
      </div>
      <div class="form-group">
        <label class="form-label">图标</label>
        <div style="display:flex;gap:8px;flex-wrap:wrap" id="iconPicker">
          ${['📖','📝','📚','✏️','📋','🔄','📓','💻','🏃','🍽️','☕','🎯'].map(icon => `
            <span style="font-size:1.5rem;cursor:pointer;padding:4px" onclick="document.getElementById('newSlotIcon').value='${icon}';document.querySelectorAll('#iconPicker span').forEach(s=>s.style.background='');event.target.style.background='var(--color-primary-soft)';event.target.style.borderRadius='var(--radius-sm)'">${icon}</span>
          `).join('')}
        </div>
        <input type="hidden" class="input" id="newSlotIcon" value="📖">
      </div>
      <div class="form-group">
        <label class="form-label">活动名称</label>
        <input type="text" class="input" id="newSlotLabel" placeholder="如：早读背诵">
      </div>
      <button class="btn btn-primary" id="saveSlotBtn">保存</button>
    `);
    document.getElementById('saveSlotBtn').onclick = () => {
      const time = document.getElementById('newSlotTime').value;
      const icon = document.getElementById('newSlotIcon').value;
      const label = document.getElementById('newSlotLabel').value.trim();
      if (!time || !label) {
        Utils.showToast('请填写完整信息', 'error');
        return;
      }
      const schedule = this.currentType === 'workday'
        ? Store.get('scheduleWorkday')
        : Store.get('scheduleWeekend');
      schedule.slots.push({ time, icon, label });
      schedule.slots.sort((a, b) => a.time.localeCompare(b.time));
      if (this.currentType === 'workday') {
        Store.set('scheduleWorkday', { ...schedule });
      } else {
        Store.set('scheduleWeekend', { ...schedule });
      }
      modal.close();
      this.render();
      Utils.showToast('日程已添加', 'success');
    };
  },

  removeSlot(index) {
    const schedule = this.currentType === 'workday'
      ? Store.get('scheduleWorkday')
      : Store.get('scheduleWeekend');
    schedule.slots.splice(index, 1);
    if (this.currentType === 'workday') {
      Store.set('scheduleWorkday', { ...schedule });
    } else {
      Store.set('scheduleWeekend', { ...schedule });
    }
    this.render();
    Utils.showToast('日程已删除', 'info');
  },
};
