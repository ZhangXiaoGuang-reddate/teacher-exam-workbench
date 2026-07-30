/* ============================================
   工具函数
   ============================================ */

const Utils = {
  // 显示Toast通知
  showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // 模态框
  showModal(title, contentHtml, onClose) {
    const overlay = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    content.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close" id="modalCloseBtn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="modal-body">${contentHtml}</div>
    `;
    overlay.style.display = 'flex';

    const close = () => {
      overlay.style.display = 'none';
      if (onClose) onClose();
    };

    document.getElementById('modalCloseBtn').onclick = close;
    overlay.onclick = (e) => { if (e.target === overlay) close(); };
    return { close };
  },

  closeModal() {
    document.getElementById('modalOverlay').style.display = 'none';
  },

  // 确认对话框
  confirm(title, message) {
    return new Promise((resolve) => {
      const modal = this.showModal(title, `
        <p>${message}</p>
        <div class="flex gap-3 mt-4" style="justify-content: flex-end;">
          <button class="btn btn-secondary" id="confirmCancel">取消</button>
          <button class="btn btn-danger" id="confirmOk">确认</button>
        </div>
      `);
      document.getElementById('confirmCancel').onclick = () => { modal.close(); resolve(false); };
      document.getElementById('confirmOk').onclick = () => { modal.close(); resolve(true); };
    });
  },

  // 格式化日期
  formatDate(dateStr) {
    const d = new Date(dateStr);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  },

  formatDateShort(dateStr) {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  },

  // 格式化时长
  formatDuration(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}小时${m}分钟`;
    if (h > 0) return `${h}小时`;
    return `${m}分钟`;
  },

  // 格式化计时器时间 (秒 → mm:ss)
  formatTimer(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  },

  // 获取今天日期字符串
  today() {
    return new Date().toISOString().split('T')[0];
  },

  // 获取本月天数
  daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  },

  // 计算两个日期之间的天数
  daysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
  },

  // 生成唯一ID
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  },

  // 防抖
  debounce(fn, delay = 300) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  // 节流
  throttle(fn, delay = 300) {
    let last = 0;
    return function (...args) {
      const now = Date.now();
      if (now - last >= delay) {
        last = now;
        fn.apply(this, args);
      }
    };
  },

  // HTML转义
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  // 请求通知权限
  async requestNotificationPermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
  },

  sendNotification(title, body) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    new Notification(title, { body, icon: '📚' });
  },

  // 教资笔试日期 (假设2025年下半年)
  getExamDate() {
    return '2025-09-13'; // 教资笔试日期
  },

  // SVG 图标辅助
  svgIcon(pathData, size = 18) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${pathData}</svg>`;
  },
};
