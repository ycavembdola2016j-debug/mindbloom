/**
 * Router Module - 页面路由管理
 * 负责页面切换和过渡动画
 */

const Router = {
  // 页面 ID 列表
  pages: [
    'page-landing',
    'page-verify',
    'page-profile',
    'page-quiz',
    'page-result',
    'page-admin'
  ],

  // 当前页面
  currentPage: 'page-landing',

  /**
   * 切换到指定页面
   * @param {string} pageId 页面 ID
   * @param {Object} options 选项 { animation: 'slide' | 'fade' | 'none' }
   */
  navigate(pageId, options = {}) {
    if (!this.pages.includes(pageId)) {
      console.error('Unknown page:', pageId);
      return;
    }

    const { animation = 'fade' } = options;
    const prevPage = this.currentPage;
    
    // 隐藏所有页面
    this.pages.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.remove('active');
        el.style.display = 'none';
      }
    });

    // 显示目标页面
    const targetEl = document.getElementById(pageId);
    if (targetEl) {
      targetEl.style.display = 'flex';
      
      // 强制重绘以触发动画
      targetEl.offsetHeight;
      
      targetEl.classList.add('active');
      
      // 应用动画
      if (animation === 'slide') {
        targetEl.style.animation = 'slideIn 0.3s ease';
      } else if (animation === 'fade') {
        targetEl.style.animation = 'fadeIn 0.3s ease';
      }
    }

    this.currentPage = pageId;
    
    // 滚动到顶部
    window.scrollTo(0, 0);

    // 触发页面进入事件
    this.onPageEnter(pageId, prevPage);
  },

  /**
   * 返回上一页
   */
  back() {
    const backMap = {
      'page-verify': 'page-landing',
      'page-profile': 'page-verify',
      'page-quiz': 'page-profile',
      'page-result': 'page-landing',
      'page-admin': 'page-landing'
    };
    
    const target = backMap[this.currentPage];
    if (target) {
      this.navigate(target, { animation: 'slide' });
    }
  },

  /**
   * 页面进入时的回调
   * @param {string} pageId 当前页面
   * @param {string} prevPage 上一页面
   */
  onPageEnter(pageId, prevPage) {
    // 触发自定义事件
    const event = new CustomEvent('page:enter', {
      detail: { page: pageId, from: prevPage }
    });
    document.dispatchEvent(event);

    // 页面特定的初始化
    switch (pageId) {
      case 'page-quiz':
        // 答题页面初始化由 Quiz 模块处理
        break;
      case 'page-result':
        // 结果页面初始化由 Result 模块处理
        break;
      case 'page-admin':
        // 后台页面初始化
        if (window.Admin) {
          window.Admin.onEnter();
        }
        break;
    }
  },

  /**
   * 获取当前页面
   */
  getCurrentPage() {
    return this.currentPage;
  }
};
