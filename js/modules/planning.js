/* ============================================
   备考规划模块
   ============================================ */

const PlanningModule = {
  defaultPlans: {
    primary: {
      name: '小学教资',
      phases: [
        { name: '基础夯实', days: '第1-15天', tasks: ['科目一《综合素质》教材通读', '科目二《教育教学知识与能力》教材通读', '每天记忆5个教育法律法规', '每天做10道选择题练习', '整理知识框架思维导图'] },
        { name: '强化提升', days: '第16-30天', tasks: ['重点章节深度学习', '科目一材料分析题专项', '科目二简答题背诵', '教学设计模板练习', '教育心理学重点突破'] },
        { name: '冲刺模拟', days: '第31-40天', tasks: ['真题模拟训练（每周2套）', '错题本整理复习', '高频考点背诵', '答题技巧训练', '时间管理练习'] },
        { name: '考前冲刺', days: '第41-45天', tasks: ['全真模拟考试', '查漏补缺重点回顾', '考前心态调整', '考试用品准备', '考场踩点规划'] },
      ]
    },
    middle: {
      name: '中学教资',
      phases: [
        { name: '基础夯实', days: '第1-15天', tasks: ['科目一《综合素质》系统学习', '科目二《教育知识与能力》系统学习', '科目三学科知识通读', '每天记忆10个教育理论', '建立三科知识框架'] },
        { name: '强化提升', days: '第16-30天', tasks: ['科目一作文专项训练', '科目二辨析题/简答题背诵', '科目三教学设计专项', '教育心理学重点突破', '学科专业知识深化'] },
        { name: '冲刺模拟', days: '第31-40天', tasks: ['三科真题模拟（每周各1套）', '错题分类整理', '高频考点强化记忆', '答题规范训练', '时间分配策略练习'] },
        { name: '考前冲刺', days: '第41-45天', tasks: ['全科全真模拟考试', '薄弱环节重点突破', '考前心理调适', '考试物品清单确认', '考场交通路线规划'] },
      ]
    }
  },

  init() {
    const page = document.getElementById('page-planning');
    if (!page) {
      const pc = document.getElementById('pageContent');
      const div = document.createElement('div');
      div.className = 'page';
      div.id = 'page-planning';
      div.dataset.page = 'planning';
      pc.appendChild(div);
    }
    Router.register('planning', () => this.render());
  },

  render() {
    const level = Store.get('examLevel');
    const plan = this.defaultPlans[level];
    const phases = Store.get('planPhases') || plan.phases;

    const page = document.getElementById('page-planning');
    page.innerHTML = `
      <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:20px">备考规划中心</h2>

      <div class="card mb-4">
        <div class="card-header">
          <span class="card-title">选择学段</span>
        </div>
        <div class="level-selector">
          <div class="level-option ${level === 'primary' ? 'selected' : ''}" data-level="primary" onclick="PlanningModule.selectLevel('primary')">
            <h4>🏫 小学教资</h4>
            <p>科目一 + 科目二</p>
          </div>
          <div class="level-option ${level === 'middle' ? 'selected' : ''}" data-level="middle" onclick="PlanningModule.selectLevel('middle')">
            <h4>🏫 中学教资</h4>
            <p>科目一 + 科目二 + 科目三</p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">📅 45天冲刺计划 - ${plan.name}</span>
          <button class="btn btn-sm btn-secondary" onclick="PlanningModule.resetPlan()">重置计划</button>
        </div>

        <div class="plan-actions mb-3">
          <input type="date" class="input" id="planStartDate" value="${Store.get('planStartDate') || ''}" style="max-width:200px" onchange="PlanningModule.setStartDate(this.value)">
          <span class="text-sm text-muted" style="display:flex;align-items:center">选择开始日期</span>
        </div>

        <div class="plan-timeline">
          ${phases.map((phase, i) => `
            <div class="plan-phase">
              <div class="plan-phase-header">
                <span class="plan-phase-title">📌 阶段${i + 1}：${phase.name}</span>
                <span class="plan-phase-days">${phase.days}</span>
              </div>
              <div class="plan-tasks">
                ${phase.tasks.map(t => `<span class="plan-task"><span class="task-dot"></span>${t}</span>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  selectLevel(level) {
    Store.set('examLevel', level);
    Store.set('planPhases', null);
    this.render();
    Utils.showToast(`已切换至${level === 'primary' ? '小学' : '中学'}教资备考计划`, 'success');
  },

  setStartDate(date) {
    Store.set('planStartDate', date);
    Utils.showToast('计划开始日期已更新', 'success');
  },

  resetPlan() {
    Store.set('planPhases', null);
    this.render();
    Utils.showToast('计划已重置为默认', 'info');
  },
};
