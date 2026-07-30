/* ============================================
   情绪记录模块
   ============================================ */

const MoodModule = {
  moodEmojis: ['😊', '😄', '😐', '😔', '😤', '😰'],

  init() {
    const page = document.getElementById('page-mood');
    if (!page) {
      const pc = document.getElementById('pageContent');
      const div = document.createElement('div');
      div.className = 'page';
      div.id = 'page-mood';
      div.dataset.page = 'mood';
      pc.appendChild(div);
    }
    Router.register('mood', () => this.render());
  },

  render() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = Utils.today();
    const moodRecords = Store.get('moodRecords');
    const moodJournal = Store.get('moodJournal');

    const daysInMonth = Utils.daysInMonth(year, month);
    const firstDayOfWeek = new Date(year, month, 1).getDay();

    let calendarHtml = '<div class="mood-weekday">日</div><div class="mood-weekday">一</div><div class="mood-weekday">二</div><div class="mood-weekday">三</div><div class="mood-weekday">四</div><div class="mood-weekday">五</div><div class="mood-weekday">六</div>';

    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarHtml += '<div class="mood-day"></div>';
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hasMood = moodRecords[dateStr];
      const isToday = dateStr === today;
      calendarHtml += `
        <div class="mood-day ${isToday ? 'today' : ''} ${hasMood ? 'has-mood' : ''}" onclick="MoodModule.selectDate('${dateStr}')">
          <span class="day-num">${d}</span>
          ${hasMood ? `<span class="mood-emoji">${hasMood}</span>` : ''}
        </div>
      `;
    }

    const selectedDate = this.selectedDate || today;
    const selectedMood = moodRecords[selectedDate] || '';
    const selectedJournal = moodJournal[selectedDate] || '';

    const page = document.getElementById('page-mood');
    page.innerHTML = `
      <h2 style="font-size:1.3rem;font-weight:700;margin-bottom:20px">💭 情绪记录</h2>

      <div class="card mb-4">
        <div class="card-header">
          <span class="card-title">📅 ${year}年${month + 1}月</span>
        </div>
        <div class="mood-calendar">
          ${calendarHtml}
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">📝 ${selectedDate === today ? '今天' : selectedDate} 心情记录</span>
        </div>

        <div class="mood-selector" id="moodSelector">
          ${this.moodEmojis.map(e => `
            <span class="mood-option ${selectedMood === e ? 'selected' : ''}" data-mood="${e}" onclick="MoodModule.setMood('${e}')">${e}</span>
          `).join('')}
        </div>

        <div class="mood-journal">
          <label class="form-label">备考感受</label>
          <textarea class="textarea" id="moodJournalInput" placeholder="记录今天的备考感受...">${Utils.escapeHtml(selectedJournal)}</textarea>
          <button class="btn btn-primary mt-3" onclick="MoodModule.saveJournal()">💾 保存记录</button>
        </div>
      </div>
    `;

    this.selectedDate = selectedDate;
  },

  selectedDate: null,

  selectDate(dateStr) {
    this.selectedDate = dateStr;
    this.render();
  },

  setMood(emoji) {
    const dateStr = this.selectedDate || Utils.today();
    const records = Store.get('moodRecords');
    records[dateStr] = emoji;
    Store.set('moodRecords', { ...records });
    this.render();
    Utils.showToast('心情已记录', 'success');
  },

  saveJournal() {
    const dateStr = this.selectedDate || Utils.today();
    const text = document.getElementById('moodJournalInput').value.trim();
    const journal = Store.get('moodJournal');
    journal[dateStr] = text;
    Store.set('moodJournal', { ...journal });
    Utils.showToast('感受已保存', 'success');
  },
};
