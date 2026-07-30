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
    this.updateMetaTheme(theme);
  },

  // 更新 PWA 主题色（手机状态栏）
  updateMetaTheme(theme) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    meta.content = isDark ? '#0f172a' : '#f8fafc';

    // iOS 状态栏样式
    const appleMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (appleMeta) appleMeta.content = isDark ? 'black-translucent' : 'default';
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
