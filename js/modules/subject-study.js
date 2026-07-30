/* ============================================
   科目学习模块
   ============================================ */

const SubjectStudyModule = {
  defaultMnemonics: {
    subject1: [
      { title: '教师职业道德规范', content: '三爱两人一终身 —— 爱国守法、爱岗敬业、关爱学生、教书育人、为人师表、终身学习' },
      { title: '素质教育内涵', content: '一个宗旨两个重点 —— 以提高国民素质为宗旨，以培养学生创新精神和实践能力为重点' },
      { title: '新课程改革目标', content: '六个改变 —— 课程功能、课程结构、课程内容、课程实施、课程评价、课程管理' },
    ],
    subject2: [
      { title: '教育学发展阶段', content: '萌芽-独立-多元化-深化 —— 夸美纽斯《大教学论》标志独立，赫尔巴特《普通教育学》标志科学化' },
      { title: '教学原则', content: '直启巩循理因材 —— 直观性、启发性、巩固性、循序渐进、理论联系实际、因材施教' },
      { title: '学习动机理论', content: '强化-需要-归因-自我效能 —— 行为主义强化论、马斯洛需要层次、韦纳归因理论、班杜拉自我效能感' },
    ],
  },

  defaultQuizzes: {
    subject1: [
      { question: '简述《中小学教师职业道德规范》的主要内容', hint: '从六个方面回答：爱国守法、爱岗敬业、关爱学生、教书育人、为人师表、终身学习' },
      { question: '简述素质教育的基本内涵', hint: '面向全体学生、促进学生全面发展、促进学生个性发展、培养创新精神和实践能力' },
    ],
    subject2: [
      { question: '简述教学过程的基本规律', hint: '间接经验与直接经验相结合、掌握知识与发展智力相统一、教学过程中知/情/意的统一、教师主导作用与学生主体作用相结合' },
      { question: '简述如何激发学生的学习动机', hint: '创设问题情境、控制动机水平、充分利用反馈信息、正确指导结果归因' },
    ],
  },

  init() {
    const page = document.getElementById('page-subjectStudy');
    if (!page) {
      const pc = document.getElementById('pageContent');
      const div = document.createElement('div');
      div.className = 'page';
      div.id = 'page-subjectStudy';
      div.dataset.page = 'subjectStudy';
      pc.appendChild(div);
    }
    Router.register('subjectStudy', (params) => this.render(params));
  },

  render(params) {
    const subject = Store.get('currentSubject');
    const mnemonics = Store.get('mnemonics');
    const activeTab = params?.tab || 'mnemonic';

    // 确保默认口诀存在
    if (mnemonics.length === 0) {
      const defaults = [
        ...this.defaultMnemonics.subject1.map(m => ({ ...m, subject: 'subject1' })),
        ...this.defaultMnemonics.subject2.map(m => ({ ...m, subject: 'subject2' })),
      ];
      Store.set('mnemonics', defaults);
    }

    const filteredMnemonics = Store.get('mnemonics').filter(m => m.subject === subject);

    const page = document.getElementById('page-subjectStudy');
    page.innerHTML = `
      <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:20px">📚 科目学习</h2>

      <div class="subject-tabs mb-4">
        <button class="subject-tab ${subject === 'subject1' ? 'active' : ''}" onclick="SubjectStudyModule.switchSubject('subject1')">
          📘 科目一 · 综合素质
        </button>
        <button class="subject-tab ${subject === 'subject2' ? 'active' : ''}" onclick="SubjectStudyModule.switchSubject('subject2')">
          📙 科目二 · ${Store.get('examLevel') === 'primary' ? '教育教学知识与能力' : '教育知识与能力'}
        </button>
      </div>

      <!-- 口诀背诵 -->
      <div class="card mb-4" id="mnemonicSection" style="${activeTab !== 'mnemonic' ? 'display:none' : ''}">
        <div class="card-header">
          <span class="card-title">💡 口诀背诵</span>
          <button class="btn btn-sm btn-primary" onclick="SubjectStudyModule.addMnemonic()">+ 添加口诀</button>
        </div>
        ${filteredMnemonics.length === 0 ? `
          <div class="empty-state"><div class="empty-state-icon">💡</div><p class="empty-state-text">暂无口诀，点击上方按钮添加</p></div>
        ` : filteredMnemonics.map((m, i) => `
          <div class="mnemonic-card" onclick="SubjectStudyModule.flipMnemonic(${i})">
            <h4>${Utils.escapeHtml(m.title)}</h4>
            <p id="mnemonic-${i}">${Utils.escapeHtml(m.content)}</p>
          </div>
        `).join('')}
      </div>

      <!-- 大题默写 -->
      <div class="card mb-4" id="dictationSection" style="${activeTab !== 'dictation' ? 'display:none' : ''}">
        <div class="card-header">
          <span class="card-title">✍️ 大题默写</span>
        </div>
        ${this.getQuizzes().map((q, i) => `
          <div class="quiz-card">
            <div class="quiz-question">${i + 1}. ${Utils.escapeHtml(q.question)}</div>
            <textarea class="textarea quiz-answer" placeholder="在此默写你的答案..." id="quizAnswer${i}"></textarea>
            <div style="display:flex;gap:8px">
              <button class="btn btn-sm btn-secondary" onclick="SubjectStudyModule.showHint(${i})">💡 查看提示</button>
              <button class="btn btn-sm btn-primary" onclick="SubjectStudyModule.checkAnswer(${i})">✅ 提交检查</button>
            </div>
            <div id="quizHint${i}" style="display:none;margin-top:8px;padding:8px;background:var(--color-primary-soft);border-radius:var(--radius-sm);font-size:0.85rem"></div>
            <div id="quizResult${i}" style="display:none;margin-top:8px;font-size:0.85rem"></div>
          </div>
        `).join('')}
      </div>

      <!-- 专项练习 -->
      <div class="card" id="practiceSection" style="${activeTab !== 'practice' ? 'display:none' : ''}">
        <div class="card-header">
          <span class="card-title">📝 专项练习</span>
        </div>
        <p class="text-muted">选择练习类型开始专项训练</p>
        <div class="grid-2 mt-3">
          <div class="card" style="cursor:pointer;text-align:center" onclick="Utils.showToast('选择题练习功能开发中', 'info')">
            <div style="font-size:2rem;margin-bottom:8px">📝</div>
            <h4 style="font-size:0.9rem">选择题练习</h4>
            <p style="font-size:0.8rem;color:var(--color-text-muted)">随机10题</p>
          </div>
          <div class="card" style="cursor:pointer;text-align:center" onclick="Utils.showToast('材料分析题功能开发中', 'info')">
            <div style="font-size:2rem;margin-bottom:8px">📄</div>
            <h4 style="font-size:0.9rem">材料分析题</h4>
            <p style="font-size:0.8rem;color:var(--color-text-muted)">案例练习</p>
          </div>
        </div>
      </div>

      <!-- 子导航 -->
      <div style="display:flex;gap:8px;margin-bottom:16px">
        <button class="btn btn-sm ${activeTab === 'mnemonic' ? 'btn-primary' : 'btn-secondary'}" onclick="SubjectStudyModule.switchTab('mnemonic')">💡 口诀背诵</button>
        <button class="btn btn-sm ${activeTab === 'dictation' ? 'btn-primary' : 'btn-secondary'}" onclick="SubjectStudyModule.switchTab('dictation')">✍️ 大题默写</button>
        <button class="btn btn-sm ${activeTab === 'practice' ? 'btn-primary' : 'btn-secondary'}" onclick="SubjectStudyModule.switchTab('practice')">📝 专项练习</button>
      </div>
    `;
  },

  switchSubject(subject) {
    Store.set('currentSubject', subject);
    this.render();
  },

  switchTab(tab) {
    this.render({ tab });
  },

  getQuizzes() {
    const subject = Store.get('currentSubject');
    return subject === 'subject1' ? this.defaultQuizzes.subject1 : this.defaultQuizzes.subject2;
  },

  flipMnemonic(index) {
    const el = document.getElementById(`mnemonic-${index}`);
    if (!el) return;
    el.style.transform = el.style.transform ? '' : 'scale(1.02)';
    el.style.transition = 'transform 0.2s ease';
  },

  addMnemonic() {
    const modal = Utils.showModal('添加口诀', `
      <div class="form-group">
        <label class="form-label">口诀标题</label>
        <input type="text" class="input" id="newMnemonicTitle" placeholder="如：教师职业道德规范">
      </div>
      <div class="form-group">
        <label class="form-label">口诀内容</label>
        <textarea class="textarea" id="newMnemonicContent" placeholder="输入口诀内容..."></textarea>
      </div>
      <button class="btn btn-primary" id="saveMnemonicBtn">保存</button>
    `);
    document.getElementById('saveMnemonicBtn').onclick = () => {
      const title = document.getElementById('newMnemonicTitle').value.trim();
      const content = document.getElementById('newMnemonicContent').value.trim();
      if (!title || !content) {
        Utils.showToast('请填写完整信息', 'error');
        return;
      }
      const mnemonics = Store.get('mnemonics');
      mnemonics.push({ title, content, subject: Store.get('currentSubject') });
      Store.set('mnemonics', mnemonics);
      modal.close();
      this.render();
      Utils.showToast('口诀已添加', 'success');
    };
  },

  showHint(index) {
    const quizzes = this.getQuizzes();
    const el = document.getElementById(`quizHint${index}`);
    el.textContent = `💡 提示：${quizzes[index].hint}`;
    el.style.display = 'block';
  },

  checkAnswer(index) {
    const answer = document.getElementById(`quizAnswer${index}`).value.trim();
    const el = document.getElementById(`quizResult${index}`);
    if (!answer) {
      el.innerHTML = '⚠️ 请先写下你的答案';
      el.style.color = 'var(--color-warning)';
    } else if (answer.length < 10) {
      el.innerHTML = '📝 答案太短了，请尝试写出更完整的内容';
      el.style.color = 'var(--color-text-muted)';
    } else {
      el.innerHTML = '✅ 已提交！建议对照教材检查，或使用AI助手进行批改';
      el.style.color = 'var(--color-success)';
    }
    el.style.display = 'block';

    // 记录练习
    const records = Store.get('quizRecords');
    records.push({ date: Utils.today(), subject: Store.get('currentSubject'), index, length: answer.length });
    Store.set('quizRecords', records);
  },
};
