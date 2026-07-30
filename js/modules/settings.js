/* ============================================
   系统设置模块
   ============================================ */

const SettingsModule = {
  init() {
    const page = document.getElementById('page-settings');
    if (!page) {
      const pc = document.getElementById('pageContent');
      const div = document.createElement('div');
      div.className = 'page';
      div.id = 'page-settings';
      div.dataset.page = 'settings';
      pc.appendChild(div);
    }
    Router.register('settings', () => this.render());
  },

  render() {
    const notifications = Store.get('notifications');
    const pomodoroDuration = Store.get('pomodoroDuration');
    const pomodoroAutoStart = Store.get('pomodoroAutoStart');
    const theme = Store.get('theme');

    const page = document.getElementById('page-settings');
    page.innerHTML = `
      <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:20px">⚙️ 系统设置</h2>

      <!-- 主题设置 -->
      <div class="card mb-4">
        <div class="settings-section">
          <div class="settings-section-title">🎨 主题设置</div>
          <div class="settings-row">
            <div>
              <div class="settings-row-label">主题模式</div>
              <div class="settings-row-desc">选择你喜欢的界面配色</div>
            </div>
            <div class="settings-row-value">
              <div class="theme-switcher" style="background:var(--color-bg-hover);border-radius:var(--radius-sm);padding:3px;display:flex;gap:4px">
                <button class="theme-btn ${theme === 'light' ? 'active' : ''}" data-theme="light" style="padding:6px 12px;border-radius:4px;font-size:0.8rem">☀️ 亮色</button>
                <button class="theme-btn ${theme === 'dark' ? 'active' : ''}" data-theme="dark" style="padding:6px 12px;border-radius:4px;font-size:0.8rem">🌙 暗色</button>
                <button class="theme-btn ${theme === 'system' ? 'active' : ''}" data-theme="system" style="padding:6px 12px;border-radius:4px;font-size:0.8rem">💻 系统</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 番茄钟设置 -->
      <div class="card mb-4">
        <div class="settings-section">
          <div class="settings-section-title">🍅 番茄钟设置</div>
          <div class="settings-row">
            <div>
              <div class="settings-row-label">默认时长</div>
              <div class="settings-row-desc">每次番茄钟的学习时长</div>
            </div>
            <div class="settings-row-value">
              <select class="select" id="pomodoroSetting" onchange="SettingsModule.updatePomodoro(this.value)">
                ${[25, 45, 60, 90, 120, 150, 180].map(m => `
                  <option value="${m}" ${pomodoroDuration === m ? 'selected' : ''}>${m} 分钟</option>
                `).join('')}
              </select>
            </div>
          </div>
          <div class="settings-row">
            <div>
              <div class="settings-row-label">自动开始下一个番茄钟</div>
              <div class="settings-row-desc">完成后自动开始下一轮计时</div>
            </div>
            <div class="settings-row-value">
              <div class="toggle ${pomodoroAutoStart ? 'active' : ''}" id="autoStartToggle" onclick="SettingsModule.toggleAutoStart()"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 通知设置 -->
      <div class="card mb-4">
        <div class="settings-section">
          <div class="settings-section-title">🔔 通知设置</div>
          <div class="settings-row">
            <div>
              <div class="settings-row-label">启用通知</div>
              <div class="settings-row-desc">接收浏览器桌面通知</div>
            </div>
            <div class="settings-row-value">
              <div class="toggle ${notifications.enabled ? 'active' : ''}" id="notifEnabledToggle" onclick="SettingsModule.toggleNotif('enabled')"></div>
            </div>
          </div>
          <div class="settings-row">
            <div>
              <div class="settings-row-label">番茄钟完成通知</div>
              <div class="settings-row-desc">计时结束时发送通知</div>
            </div>
            <div class="settings-row-value">
              <div class="toggle ${notifications.pomodoroEnd ? 'active' : ''}" id="notifPomodoroToggle" onclick="SettingsModule.toggleNotif('pomodoroEnd')"></div>
            </div>
          </div>
          <div class="settings-row">
            <div>
              <div class="settings-row-label">每日学习提醒</div>
              <div class="settings-row-desc">每天早上提醒今日学习计划</div>
            </div>
            <div class="settings-row-value">
              <div class="toggle ${notifications.dailyReminder ? 'active' : ''}" id="notifDailyToggle" onclick="SettingsModule.toggleNotif('dailyReminder')"></div>
            </div>
          </div>
          <div class="settings-row">
            <div>
              <div class="settings-row-label">倒计时提醒</div>
              <div class="settings-row-desc">距离考试30天/7天时提醒</div>
            </div>
            <div class="settings-row-value">
              <div class="toggle ${notifications.countdownReminder ? 'active' : ''}" id="notifCountdownToggle" onclick="SettingsModule.toggleNotif('countdownReminder')"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 数据管理 -->
      <div class="card">
        <div class="settings-section">
          <div class="settings-section-title">💾 数据管理</div>
          <div class="settings-row">
            <div>
              <div class="settings-row-label">清除所有数据</div>
              <div class="settings-row-desc">重置所有学习记录和设置</div>
            </div>
            <div class="settings-row-value">
              <button class="btn btn-danger btn-sm" onclick="SettingsModule.clearAllData()">清除数据</button>
            </div>
          </div>
          <div class="settings-row">
            <div>
              <div class="settings-row-label">导出数据</div>
              <div class="settings-row-desc">备份所有学习数据为JSON文件</div>
            </div>
            <div class="settings-row-value">
              <button class="btn btn-secondary btn-sm" onclick="SettingsModule.exportData()">导出</button>
            </div>
          </div>
          <div class="settings-row">
            <div>
              <div class="settings-row-label">导入数据</div>
              <div class="settings-row-desc">从JSON文件恢复数据</div>
            </div>
            <div class="settings-row-value">
              <input type="file" accept=".json" id="importFile" style="display:none" onchange="SettingsModule.importData(this)">
              <button class="btn btn-secondary btn-sm" onclick="document.getElementById('importFile').click()">导入</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // 绑定主题按钮事件
    document.querySelectorAll('#page-settings .theme-btn').forEach(btn => {
      btn.addEventListener('click', () => Theme.apply(btn.dataset.theme));
    });
  },

  updatePomodoro(value) {
    Store.set('pomodoroDuration', parseInt(value));
    Utils.showToast(`番茄钟默认时长已设置为 ${value} 分钟`, 'success');
  },

  toggleAutoStart() {
    const val = !Store.get('pomodoroAutoStart');
    Store.set('pomodoroAutoStart', val);
    document.getElementById('autoStartToggle').classList.toggle('active', val);
    Utils.showToast(val ? '已开启自动开始' : '已关闭自动开始', 'info');
  },

  toggleNotif(key) {
    const notifications = Store.get('notifications');
    notifications[key] = !notifications[key];
    Store.set('notifications', { ...notifications });

    if (key === 'enabled' && notifications.enabled) {
      Utils.requestNotificationPermission();
    }

    const toggleMap = {
      enabled: 'notifEnabledToggle',
      pomodoroEnd: 'notifPomodoroToggle',
      dailyReminder: 'notifDailyToggle',
      countdownReminder: 'notifCountdownToggle',
    };
    const el = document.getElementById(toggleMap[key]);
    if (el) el.classList.toggle('active', notifications[key]);
  },

  async clearAllData() {
    const confirmed = await Utils.confirm('清除所有数据', '此操作将清除所有学习记录、设置和计划，此操作不可撤销。确定继续吗？');
    if (!confirmed) return;

    const keys = [
      'teacher_theme', 'teacher_exam_level', 'teacher_plan_start', 'teacher_plan_phases',
      'teacher_daily_tasks', 'teacher_pomodoro_duration', 'teacher_pomodoro_history',
      'teacher_mnemonics', 'teacher_quiz_records',
      'teacher_schedule_workday', 'teacher_schedule_weekend',
      'teacher_mood_records', 'teacher_mood_journal',
      'teacher_custom_events', 'teacher_study_stats',
      'teacher_ai_messages', 'teacher_ai_api_key',
      'teacher_notifications', 'teacher_pomodoro_auto_start',
    ];
    keys.forEach(k => localStorage.removeItem(k));

    // 重置Store
    Store._data.dailyTasks = [];
    Store._data.pomodoroHistory = [];
    Store._data.studyStats = { totalMinutes: 0, subject1Minutes: 0, subject2Minutes: 0, completedTasks: 0, totalTasks: 0 };
    Store._data.moodRecords = {};
    Store._data.moodJournal = {};
    Store._data.customEvents = [];
    Store._data.aiMessages = [];
    Store._data.mnemonics = [];
    Store._data.quizRecords = [];
    Store._data.scheduleWorkday = JSON.parse('{"wake":"07:00","sleep":"23:00","slots":[{"time":"08:00","label":"早读背诵","icon":"📖"},{"time":"09:00","label":"科目一学习","icon":"📝"},{"time":"11:00","label":"练习题","icon":"✏️"},{"time":"14:00","label":"科目二学习","icon":"📚"},{"time":"16:00","label":"真题演练","icon":"📋"},{"time":"19:00","label":"复习巩固","icon":"🔄"},{"time":"21:00","label":"整理笔记","icon":"📓"}]}');
    Store._data.scheduleWeekend = JSON.parse('{"wake":"08:00","sleep":"23:30","slots":[{"time":"09:00","label":"背诵复习","icon":"📖"},{"time":"10:30","label":"科目一复习","icon":"📝"},{"time":"14:00","label":"科目二复习","icon":"📚"},{"time":"16:00","label":"模拟考试","icon":"📋"},{"time":"20:00","label":"错题回顾","icon":"🔄"}]}');

    Utils.showToast('所有数据已清除', 'success');
    location.reload();
  },

  exportData() {
    const data = {};
    const keys = [
      'teacher_exam_level', 'teacher_plan_start', 'teacher_plan_phases',
      'teacher_daily_tasks', 'teacher_pomodoro_duration', 'teacher_pomodoro_history',
      'teacher_mnemonics', 'teacher_quiz_records',
      'teacher_schedule_workday', 'teacher_schedule_weekend',
      'teacher_mood_records', 'teacher_mood_journal',
      'teacher_custom_events', 'teacher_study_stats',
      'teacher_notifications', 'teacher_pomodoro_auto_start',
    ];
    keys.forEach(k => { data[k] = localStorage.getItem(k); });

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `教资备考数据_${Utils.today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    Utils.showToast('数据已导出', 'success');
  },

  importData(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        Object.entries(data).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            localStorage.setItem(key, value);
          }
        });
        Utils.showToast('数据导入成功，即将刷新页面', 'success');
        setTimeout(() => location.reload(), 1500);
      } catch (err) {
        Utils.showToast('文件格式错误，导入失败', 'error');
      }
    };
    reader.readAsText(file);
  },
};
