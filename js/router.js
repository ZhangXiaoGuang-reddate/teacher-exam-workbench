/* ============================================
   路由管理
   ============================================ */

const Router = {
  pages: {},

  register(pageId, renderFn) {
    this.pages[pageId] = renderFn;
  },

  navigate(pageId, params) {
    const oldPage = Store.get('currentPage');
    if (oldPage === pageId) return;

    Store.set('currentPage', pageId);

    // 切换页面显示
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pageEl = document.getElementById(`page-${pageId}`);
    if (pageEl) pageEl.classList.add('active');

    // 更新导航高亮
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === pageId);
    });

    // 更新面包屑
    this.updateBreadcrumb(pageId);

    // 渲染页面
    if (this.pages[pageId]) {
      this.pages[pageId](params);
    }

    // 移动端关闭侧边栏
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('show');

    // 滚动到顶部
    document.getElementById('pageContent').scrollTop = 0;
  },

  updateBreadcrumb(pageId) {
    const names = {
      home: '首页',
      planning: '备考规划',
      dailyPlan: '每日计划',
      pomodoro: '番茄计时',
      subjectStudy: '科目学习',
      schedule: '作息规划',
      mood: '情绪记录',
      countdown: '时间提醒',
      statistics: '数据统计',
      aiAssistant: 'AI助手',
      officialSite: '教资官网',
      settings: '系统设置',
    };
    document.getElementById('breadcrumb').innerHTML = `
      <span class="breadcrumb-item" style="cursor:pointer" onclick="Router.navigate('home')">首页</span>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-item">${names[pageId] || pageId}</span>
    `;
  },
};
