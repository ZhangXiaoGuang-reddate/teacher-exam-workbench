/* ============================================
   全局状态管理 (Store)
   ============================================ */

const Store = {
  _data: {
    // 主题
    theme: localStorage.getItem('teacher_theme') || 'system',

    // 当前页面
    currentPage: 'home',

    // 备考规划
    examLevel: localStorage.getItem('teacher_exam_level') || 'primary', // primary | middle
    planStartDate: localStorage.getItem('teacher_plan_start') || null,
    planPhases: JSON.parse(localStorage.getItem('teacher_plan_phases') || 'null'),

    // 每日计划
    dailyTasks: JSON.parse(localStorage.getItem('teacher_daily_tasks') || '[]'),

    // 番茄计时
    pomodoroDuration: parseInt(localStorage.getItem('teacher_pomodoro_duration') || '120'),
    pomodoroHistory: JSON.parse(localStorage.getItem('teacher_pomodoro_history') || '[]'),

    // 科目学习
    currentSubject: 'subject1', // subject1 | subject2
    mnemonics: JSON.parse(localStorage.getItem('teacher_mnemonics') || '[]'),
    quizRecords: JSON.parse(localStorage.getItem('teacher_quiz_records') || '[]'),

    // 作息规划
    scheduleWorkday: JSON.parse(localStorage.getItem('teacher_schedule_workday') || '{"wake":"07:00","sleep":"23:00","slots":[{"time":"08:00","label":"早读背诵","icon":"📖"},{"time":"09:00","label":"科目一学习","icon":"📝"},{"time":"11:00","label":"练习题","icon":"✏️"},{"time":"14:00","label":"科目二学习","icon":"📚"},{"time":"16:00","label":"真题演练","icon":"📋"},{"time":"19:00","label":"复习巩固","icon":"🔄"},{"time":"21:00","label":"整理笔记","icon":"📓"}]}'),
    scheduleWeekend: JSON.parse(localStorage.getItem('teacher_schedule_weekend') || '{"wake":"08:00","sleep":"23:30","slots":[{"time":"09:00","label":"背诵复习","icon":"📖"},{"time":"10:30","label":"科目一复习","icon":"📝"},{"time":"14:00","label":"科目二复习","icon":"📚"},{"time":"16:00","label":"模拟考试","icon":"📋"},{"time":"20:00","label":"错题回顾","icon":"🔄"}]}'),

    // 情绪记录
    moodRecords: JSON.parse(localStorage.getItem('teacher_mood_records') || '{}'),
    moodJournal: JSON.parse(localStorage.getItem('teacher_mood_journal') || '{}'),

    // 时间提醒
    customEvents: JSON.parse(localStorage.getItem('teacher_custom_events') || '[]'),

    // 学习统计
    studyStats: JSON.parse(localStorage.getItem('teacher_study_stats') || '{"totalMinutes":0,"subject1Minutes":0,"subject2Minutes":0,"completedTasks":0,"totalTasks":0}'),

    // AI助手
    aiMessages: JSON.parse(localStorage.getItem('teacher_ai_messages') || '[]'),
    aiApiKey: localStorage.getItem('teacher_ai_api_key') || '',

    // 系统设置
    notifications: JSON.parse(localStorage.getItem('teacher_notifications') || '{"enabled":true,"pomodoroEnd":true,"dailyReminder":true,"countdownReminder":true}'),
    pomodoroAutoStart: localStorage.getItem('teacher_pomodoro_auto_start') === 'true',
  },

  _listeners: {},

  get(key) {
    return this._data[key];
  },

  set(key, value) {
    this._data[key] = value;
    this._persist(key, value);
    this._notify(key, value);
  },

  _persist(key, value) {
    const persistMap = {
      theme: () => localStorage.setItem('teacher_theme', value),
      examLevel: () => localStorage.setItem('teacher_exam_level', value),
      planStartDate: () => localStorage.setItem('teacher_plan_start', value),
      planPhases: () => localStorage.setItem('teacher_plan_phases', JSON.stringify(value)),
      dailyTasks: () => localStorage.setItem('teacher_daily_tasks', JSON.stringify(value)),
      pomodoroDuration: () => localStorage.setItem('teacher_pomodoro_duration', value),
      pomodoroHistory: () => localStorage.setItem('teacher_pomodoro_history', JSON.stringify(value)),
      mnemonics: () => localStorage.setItem('teacher_mnemonics', JSON.stringify(value)),
      quizRecords: () => localStorage.setItem('teacher_quiz_records', JSON.stringify(value)),
      scheduleWorkday: () => localStorage.setItem('teacher_schedule_workday', JSON.stringify(value)),
      scheduleWeekend: () => localStorage.setItem('teacher_schedule_weekend', JSON.stringify(value)),
      moodRecords: () => localStorage.setItem('teacher_mood_records', JSON.stringify(value)),
      moodJournal: () => localStorage.setItem('teacher_mood_journal', JSON.stringify(value)),
      customEvents: () => localStorage.setItem('teacher_custom_events', JSON.stringify(value)),
      studyStats: () => localStorage.setItem('teacher_study_stats', JSON.stringify(value)),
      aiMessages: () => localStorage.setItem('teacher_ai_messages', JSON.stringify(value)),
      aiApiKey: () => localStorage.setItem('teacher_ai_api_key', value),
      notifications: () => localStorage.setItem('teacher_notifications', JSON.stringify(value)),
      pomodoroAutoStart: () => localStorage.setItem('teacher_pomodoro_auto_start', value),
    };
    if (persistMap[key]) persistMap[key]();
  },

  on(key, callback) {
    if (!this._listeners[key]) this._listeners[key] = [];
    this._listeners[key].push(callback);
  },

  off(key, callback) {
    if (!this._listeners[key]) return;
    this._listeners[key] = this._listeners[key].filter(cb => cb !== callback);
  },

  _notify(key, value) {
    if (this._listeners[key]) {
      this._listeners[key].forEach(cb => cb(value));
    }
  },

  // 便捷方法
  toggleTaskComplete(taskId) {
    const tasks = this.get('dailyTasks');
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx === -1) return;
    tasks[idx].completed = !tasks[idx].completed;
    this.set('dailyTasks', [...tasks]);
    this._updateStats();
  },

  addTask(text) {
    const tasks = this.get('dailyTasks');
    const task = { id: Date.now().toString(), text, completed: false, createdAt: new Date().toISOString() };
    this.set('dailyTasks', [...tasks, task]);
    this._updateStats();
    return task;
  },

  removeTask(taskId) {
    const tasks = this.get('dailyTasks').filter(t => t.id !== taskId);
    this.set('dailyTasks', tasks);
    this._updateStats();
  },

  _updateStats() {
    const tasks = this.get('dailyTasks');
    const completed = tasks.filter(t => t.completed).length;
    const stats = this.get('studyStats');
    stats.completedTasks = completed;
    stats.totalTasks = tasks.length;
    this.set('studyStats', { ...stats });
  },

  addStudyTime(minutes, subject) {
    const stats = this.get('studyStats');
    stats.totalMinutes += minutes;
    if (subject === 'subject1') stats.subject1Minutes += minutes;
    if (subject === 'subject2') stats.subject2Minutes += minutes;
    this.set('studyStats', { ...stats });
  },

  getIncompleteTaskCount() {
    return this.get('dailyTasks').filter(t => !t.completed).length;
  },

  getTodayMood() {
    const today = new Date().toISOString().split('T')[0];
    return this.get('moodRecords')[today] || null;
  },
};
