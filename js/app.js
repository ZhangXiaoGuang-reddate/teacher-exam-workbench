/* ============================================
   教资备考工作台 - 主入口
   ============================================ */

const App = {
  init() {
    // 初始化主题
    Theme.init();

    // 初始化导航
    Navigation.init();

    // 初始化猫咪
    CatMascot.init();

    // 初始化各模块
    PlanningModule.init();
    DailyPlanModule.init();
    PomodoroModule.init();
    SubjectStudyModule.init();
    ScheduleModule.init();
    MoodModule.init();
    CountdownModule.init();
    StatisticsModule.init();
    AIAssistantModule.init();
    SettingsModule.init();

    // 首页
    this.renderHome();
    Router.register('home', () => this.renderHome());

    // 教资官网模块
    this.initOfficialSite();

    // 默认导航到首页
    Router.navigate('home');

    // 每日提醒
    this.checkDailyReminder();

    // 快捷键
    this.bindShortcuts();

    console.log('📚 教资备考工作台已就绪');
  },

  renderHome() {
    const page = document.getElementById('page-home');
    const tasks = Store.get('dailyTasks');
    const incomplete = tasks.filter(t => !t.completed).length;
    const stats = Store.get('studyStats');

    page.innerHTML = `
      <div class="home-welcome">
        <h2>📚 教资备考工作台</h2>
        <p>高效备考，轻松拿证！一站式管理你的教资备考计划</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card" onclick="Router.navigate('dailyPlan')" style="cursor:pointer">
          <div class="stat-card-value">${incomplete}</div>
          <div class="stat-card-label">📋 待完成任务</div>
        </div>
        <div class="stat-card" onclick="Router.navigate('statistics')" style="cursor:pointer">
          <div class="stat-card-value">${Utils.formatDuration(stats.totalMinutes)}</div>
          <div class="stat-card-label">📚 累计学习</div>
        </div>
        <div class="stat-card" onclick="Router.navigate('countdown')" style="cursor:pointer">
          <div class="stat-card-value">${Utils.daysBetween(Utils.today(), Utils.getExamDate())}</div>
          <div class="stat-card-label">⏳ 距离笔试</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-value">${Store.get('moodRecords')[Utils.today()] || '—'}</div>
          <div class="stat-card-label">💭 今日心情</div>
        </div>
      </div>

      <div class="home-grid">
        ${[
          { id: 'planning', icon: '🗺️', title: '备考规划', desc: '45天冲刺计划 · 小学/中学可选' },
          { id: 'dailyPlan', icon: '📋', title: '每日计划', desc: '添加/管理今日学习任务' },
          { id: 'pomodoro', icon: '🍅', title: '番茄计时', desc: '专注学习 · 默认120分钟' },
          { id: 'subjectStudy', icon: '📚', title: '科目学习', desc: '口诀背诵 · 大题默写 · 专项练习' },
          { id: 'schedule', icon: '⏰', title: '作息规划', desc: '自定义工作/休息日作息' },
          { id: 'mood', icon: '💭', title: '情绪记录', desc: '每日心情打卡 · 备考日记' },
          { id: 'countdown', icon: '⏳', title: '时间提醒', desc: '笔试倒计时 · 自定义节点' },
          { id: 'statistics', icon: '📊', title: '数据统计', desc: '学习时长 · 各科占比 · 完成率' },
          { id: 'aiAssistant', icon: '🤖', title: 'AI助手', desc: 'Deepseek知识点问答' },
          { id: 'officialSite', icon: '🏫', title: '教资官网', desc: '准考证打印 · 考场查询' },
          { id: 'settings', icon: '⚙️', title: '系统设置', desc: '主题 · 番茄钟 · 通知' },
        ].map(item => `
          <div class="home-card" onclick="Router.navigate('${item.id}')">
            <div class="home-card-icon">${item.icon}</div>
            <div class="home-card-info">
              <h3>${item.title}</h3>
              <p>${item.desc}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  initOfficialSite() {
    const page = document.getElementById('page-officialSite');
    if (!page) {
      const pc = document.getElementById('pageContent');
      const div = document.createElement('div');
      div.className = 'page';
      div.id = 'page-officialSite';
      div.dataset.page = 'officialSite';
      pc.appendChild(div);
    }

    Router.register('officialSite', () => {
      const p = document.getElementById('page-officialSite');
      p.innerHTML = `
        <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:20px">🏫 教资官网</h2>

        <div class="card mb-4">
          <div class="card-header"><span class="card-title">🔗 快捷入口</span></div>
          <div class="official-links">
            <div class="official-card" onclick="window.open('https://ntce.neea.edu.cn/', '_blank')">
              <div class="official-card-icon">🏛️</div>
              <div>
                <h4>NTCE 官网</h4>
                <p>中国教育考试网 · 教资考试官方平台</p>
              </div>
            </div>
            <div class="official-card" onclick="window.open('https://ntce.neea.edu.cn/html1/folder/16013/15-1.htm', '_blank')">
              <div class="official-card-icon">🖨️</div>
              <div>
                <h4>准考证打印</h4>
                <p>考前一周开放打印</p>
              </div>
            </div>
            <div class="official-card" onclick="window.open('https://ntce.neea.edu.cn/html1/folder/1508/206-1.htm', '_blank')">
              <div class="official-card-icon">📊</div>
              <div>
                <h4>成绩查询</h4>
                <p>考后约一个月开放查询</p>
              </div>
            </div>
            <div class="official-card" onclick="window.open('https://ntce.neea.edu.cn/html1/category/1507/1145-1.htm', '_blank')">
              <div class="official-card-icon">📝</div>
              <div>
                <h4>考试大纲</h4>
                <p>各科考试大纲下载</p>
              </div>
            </div>
            <div class="official-card" onclick="window.open('https://ntce.neea.edu.cn/html1/folder/1508/208-1.htm', '_blank')">
              <div class="official-card-icon">📋</div>
              <div>
                <h4>报名入口</h4>
                <p>笔试/面试报名</p>
              </div>
            </div>
            <div class="official-card" onclick="window.open('https://ntce.neea.edu.cn/html1/folder/1507/1076-1.htm', '_blank')">
              <div class="official-card-icon">❓</div>
              <div>
                <h4>常见问题</h4>
                <p>报名条件 · 考试流程</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><span class="card-title">📅 重要时间节点</span></div>
          <div style="display:flex;flex-direction:column;gap:8px">
            <div class="event-item">
              <div class="event-info">
                <h4>📝 笔试报名</h4>
                <p>预计2025年7月初</p>
              </div>
              <span class="badge badge-warning">即将开始</span>
            </div>
            <div class="event-item">
              <div class="event-info">
                <h4>🖨️ 准考证打印</h4>
                <p>考前一周（2025年9月初）</p>
              </div>
              <span class="badge badge-primary">待通知</span>
            </div>
            <div class="event-item">
              <div class="event-info">
                <h4>📝 笔试考试</h4>
                <p>2025年9月13日</p>
              </div>
              <span class="badge badge-danger">倒计时中</span>
            </div>
            <div class="event-item">
              <div class="event-info">
                <h4>📊 成绩查询</h4>
                <p>考后约一个月</p>
              </div>
              <span class="badge badge-primary">待公布</span>
            </div>
          </div>
        </div>
      `;
    });
  },

  checkDailyReminder() {
    const notifications = Store.get('notifications');
    if (!notifications.enabled || !notifications.dailyReminder) return;

    const lastReminder = localStorage.getItem('teacher_last_daily_reminder');
    const today = Utils.today();
    if (lastReminder === today) return;

    const hour = new Date().getHours();
    if (hour >= 8 && hour <= 10) {
      const tasks = Store.get('dailyTasks');
      const incomplete = tasks.filter(t => !t.completed).length;
      if (incomplete > 0) {
        Utils.sendNotification('📚 今日学习提醒', `还有 ${incomplete} 项任务待完成，加油！`);
      }
      localStorage.setItem('teacher_last_daily_reminder', today);
    }
  },

  bindShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K: 聚焦搜索或AI
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        Router.navigate('aiAssistant');
      }
    });
  },
};

// 启动应用
document.addEventListener('DOMContentLoaded', () => App.init());
