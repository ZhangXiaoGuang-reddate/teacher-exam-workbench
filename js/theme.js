/* ============================================
   主题管理
   ============================================ */

const Theme = {
  init() {
    this.apply(Store.get('theme'));
    this.bindEvents();
    this.watchSystemTheme();
  },

  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    Store.set('theme', theme);
    this.updateButtons(theme);
  },

  updateButtons(activeTheme) {
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === activeTheme);
    });
  },

  bindEvents() {
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => this.apply(btn.dataset.theme));
    });
  },

  watchSystemTheme() {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', () => {
      if (Store.get('theme') === 'system') {
        this.apply('system');
      }
    });
  },
};
