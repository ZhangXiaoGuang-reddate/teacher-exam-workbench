/* ============================================
   番茄计时模块
   ============================================ */

const PomodoroModule = {
  timer: null,
  remainingSeconds: 0,
  isRunning: false,
  isPaused: false,
  totalSeconds: 0,
  currentSubject: 'subject1',

  init() {
    const page = document.getElementById('page-pomodoro');
    if (!page) {
      const pc = document.getElementById('pageContent');
      const div = document.createElement('div');
      div.className = 'page';
      div.id = 'page-pomodoro';
      div.dataset.page = 'pomodoro';
      pc.appendChild(div);
    }
    Router.register('pomodoro', () => this.render());
  },

  render() {
    const duration = Store.get('pomodoroDuration');
    this.totalSeconds = duration * 60;
    if (!this.isRunning) {
      this.remainingSeconds = this.totalSeconds;
    }

    const progress = this.totalSeconds > 0 ? ((this.totalSeconds - this.remainingSeconds) / this.totalSeconds) * 100 : 0;
    const circumference = 2 * Math.PI * 95;

    const page = document.getElementById('page-pomodoro');
    page.innerHTML = `
      <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:20px">🍅 番茄计时</h2>

      <div class="card">
        <div class="pomodoro-container">
          <div class="pomodoro-timer">
            <svg class="pomodoro-circle" viewBox="0 0 220 220">
              <circle class="pomodoro-circle-bg" cx="110" cy="110" r="95"/>
              <circle class="pomodoro-circle-progress" cx="110" cy="110" r="95"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${circumference * (1 - progress / 100)}"/>
            </svg>
            <div class="pomodoro-time" id="pomodoroDisplay">${Utils.formatTimer(this.remainingSeconds)}</div>
          </div>

          <div class="pomodoro-label">
            ${this.isRunning && !this.isPaused ? '专注学习中...' : this.isPaused ? '已暂停' : '准备开始'}
          </div>

          <div class="pomodoro-controls">
            ${!this.isRunning ? `
              <button class="btn btn-primary btn-lg" onclick="PomodoroModule.start()">▶ 开始学习</button>
            ` : this.isPaused ? `
              <button class="btn btn-primary btn-lg" onclick="PomodoroModule.resume()">▶ 继续</button>
              <button class="btn btn-secondary btn-lg" onclick="PomodoroModule.stop()">⏹ 结束</button>
            ` : `
              <button class="btn btn-secondary btn-lg" onclick="PomodoroModule.pause()">⏸ 暂停</button>
              <button class="btn btn-danger btn-lg" onclick="PomodoroModule.stop()">⏹ 结束</button>
            `}
          </div>

          <div class="pomodoro-presets">
            <span style="font-size:0.8rem;color:var(--color-text-muted);display:flex;align-items:center;margin-right:4px">时长：</span>
            ${[25, 45, 60, 90, 120, 150].map(m => `
              <button class="pomodoro-preset ${duration === m ? 'active' : ''}" onclick="PomodoroModule.setDuration(${m})" ${this.isRunning ? 'disabled' : ''}>${m}分钟</button>
            `).join('')}
          </div>

          <div style="margin-top:16px;display:flex;justify-content:center;gap:8px;align-items:center">
            <span style="font-size:0.85rem;color:var(--color-text-muted)">关联科目：</span>
            <select class="select" style="width:auto" id="pomodoroSubject" onchange="PomodoroModule.currentSubject=this.value">
              <option value="subject1" ${this.currentSubject === 'subject1' ? 'selected' : ''}>科目一</option>
              <option value="subject2" ${this.currentSubject === 'subject2' ? 'selected' : ''}>科目二</option>
            </select>
          </div>
        </div>
      </div>

      <div class="card mt-4">
        <div class="card-header"><span class="card-title">📜 计时记录</span></div>
        <div id="pomodoroHistory">
          ${this.renderHistory()}
        </div>
      </div>
    `;

    // 更新进度环
    if (this.isRunning) {
      this.updateDisplay();
    }
  },

  renderHistory() {
    const history = Store.get('pomodoroHistory');
    const today = Utils.today();
    const todayHistory = history.filter(h => h.date === today);

    if (todayHistory.length === 0) {
      return '<div class="empty-state"><div class="empty-state-icon">⏱️</div><p class="empty-state-text">今天还没有计时记录</p></div>';
    }

    return todayHistory.map(h => `
      <div class="flex items-center justify-between" style="padding:8px 0;border-bottom:1px solid var(--color-border-light)">
        <span style="font-size:0.85rem">${h.subject === 'subject1' ? '科目一' : '科目二'} - ${Utils.formatDuration(h.minutes)}</span>
        <span style="font-size:0.8rem;color:var(--color-text-muted)">${h.time}</span>
      </div>
    `).join('');
  },

  setDuration(minutes) {
    if (this.isRunning) return;
    Store.set('pomodoroDuration', minutes);
    this.totalSeconds = minutes * 60;
    this.remainingSeconds = this.totalSeconds;
    this.render();
  },

  start() {
    this.isRunning = true;
    this.isPaused = false;
    if (this.remainingSeconds === 0) {
      this.totalSeconds = Store.get('pomodoroDuration') * 60;
      this.remainingSeconds = this.totalSeconds;
    }
    this.render();
    this.tick();

    if (Store.get('notifications').enabled) {
      Utils.requestNotificationPermission();
    }
  },

  pause() {
    this.isPaused = true;
    clearInterval(this.timer);
    this.render();
  },

  resume() {
    this.isPaused = false;
    this.render();
    this.tick();
  },

  stop() {
    Utils.confirm('结束计时', '确定要结束当前番茄计时吗？已学习的时间会被记录。').then(confirmed => {
      if (!confirmed) return;
      clearInterval(this.timer);
      const elapsedMinutes = Math.floor((this.totalSeconds - this.remainingSeconds) / 60);
      if (elapsedMinutes > 0) {
        this.recordSession(elapsedMinutes);
      }
      this.isRunning = false;
      this.isPaused = false;
      this.remainingSeconds = Store.get('pomodoroDuration') * 60;
      this.totalSeconds = this.remainingSeconds;
      this.render();
    });
  },

  tick() {
    this.timer = setInterval(() => {
      if (this.remainingSeconds <= 0) {
        clearInterval(this.timer);
        this.complete();
        return;
      }
      this.remainingSeconds--;
      this.updateDisplay();
    }, 1000);
  },

  updateDisplay() {
    const display = document.getElementById('pomodoroDisplay');
    const progress = document.getElementById('pomodoroCircleProgress');
    if (!display) return;

    display.textContent = Utils.formatTimer(this.remainingSeconds);

    if (progress) {
      const circumference = 2 * Math.PI * 95;
      const pct = ((this.totalSeconds - this.remainingSeconds) / this.totalSeconds) * 100;
      progress.style.strokeDashoffset = circumference * (1 - pct / 100);
    }
  },

  complete() {
    const duration = Store.get('pomodoroDuration');
    this.recordSession(duration);
    this.isRunning = false;
    this.isPaused = false;
    this.remainingSeconds = duration * 60;
    this.totalSeconds = this.remainingSeconds;

    // 自动标记第一个未完成任务为完成
    const tasks = Store.get('dailyTasks');
    const firstIncomplete = tasks.find(t => !t.completed);
    if (firstIncomplete) {
      Store.toggleTaskComplete(firstIncomplete.id);
    }

    this.render();

    // 通知
    if (Store.get('notifications').pomodoroEnd) {
      Utils.sendNotification('🍅 番茄计时完成！', `已完成${duration}分钟学习，太棒了！`);
    }
    Utils.showToast(`🎉 番茄计时完成！已学习${duration}分钟`, 'success');

    // 完成动画
    const container = document.querySelector('.pomodoro-container');
    if (container) container.classList.add('pomodoro-complete');
    setTimeout(() => {
      const c = document.querySelector('.pomodoro-container');
      if (c) c.classList.remove('pomodoro-complete');
    }, 600);
  },

  recordSession(minutes) {
    const history = Store.get('pomodoroHistory');
    const now = new Date();
    history.push({
      date: Utils.today(),
      time: `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`,
      minutes,
      subject: this.currentSubject,
    });
    Store.set('pomodoroHistory', history);
    Store.addStudyTime(minutes, this.currentSubject);
  },
};
