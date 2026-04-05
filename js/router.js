/**
 * Router - 路由管理模块
 * 处理页面切换、动画效果、历史记录
 */

const Router = {
  // 页面配置
  pages: [
    'home',
    'verify',
    'profile',
    'quiz',
    'result',
    'admin-login',
    'admin'
  ],

  // 当前页面
  currentPage: 'home',

  // 页面切换动画配置
  animations: {
    default: { duration: 300, easing: 'ease-out' },
    slide: { duration: 300, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
    fade: { duration: 200, easing: 'ease' }
  },

  /**
   * 初始化路由
   */
  init() {
    // 隐藏所有页面
    this.pages.forEach(page => {
      const el = document.getElementById(`page-${page}`);
      if (el) {
        el.style.display = 'none';
        el.style.opacity = '0';
      }
    });

    // 显示首页
    this.navigate('home', { animation: 'none' });

    // 监听浏览器后退按钮
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.page) {
        this.navigate(e.state.page, { animation: 'slide', replace: true });
      }
    });
  },

  /**
   * 导航到指定页面
   * @param {string} page - 页面ID（不含 page- 前缀）
   * @param {Object} options - 选项
   * @param {string} options.animation - 动画类型：'slide' | 'fade' | 'none'
   * @param {boolean} options.replace - 是否替换历史记录
   * @param {Object} options.state - 要传递的状态
   */
  navigate(page, options = {}) {
    const { animation = 'slide', replace = false, state = {} } = options;

    // 验证页面是否存在
    if (!this.pages.includes(page)) {
      console.error(`[Router] Page not found: ${page}`);
      return;
    }

    const fromPage = this.currentPage;
    const toPage = page;

    // 获取页面元素
    const fromEl = document.getElementById(`page-${fromPage}`);
    const toEl = document.getElementById(`page-${toPage}`);

    if (!toEl) {
      console.error(`[Router] Page element not found: page-${toPage}`);
      return;
    }

    // 更新浏览器历史
    if (!replace) {
      history.pushState({ page: toPage, ...state }, '', `#${toPage}`);
    }

    // 执行页面切换
    this._doTransition(fromEl, toEl, animation, () => {
      this.currentPage = toPage;
      State.set({ currentPage: toPage });
      
      // 触发页面显示事件
      this._triggerPageShow(toPage, state);
    });
  },

  /**
   * 执行页面过渡动画
   * @private
   */
  _doTransition(fromEl, toEl, animation, callback) {
    const anim = this.animations[animation] || this.animations.default;

    // 准备新页面
    toEl.style.display = 'block';
    
    if (animation === 'none') {
      if (fromEl) {
        fromEl.style.display = 'none';
        fromEl.style.opacity = '0';
      }
      toEl.style.opacity = '1';
      toEl.style.transform = 'none';
      if (callback) callback();
      return;
    }

    if (animation === 'fade') {
      // 淡出旧页面
      if (fromEl) {
        fromEl.style.transition = `opacity ${anim.duration}ms ${anim.easing}`;
        fromEl.style.opacity = '0';
      }

      // 淡入新页面
      toEl.style.opacity = '0';
      toEl.style.transition = `opacity ${anim.duration}ms ${anim.easing}`;
      
      requestAnimationFrame(() => {
        toEl.style.opacity = '1';
      });

      setTimeout(() => {
        if (fromEl) fromEl.style.display = 'none';
        if (callback) callback();
      }, anim.duration);
      
      return;
    }

    // 默认滑动动画
    if (fromEl) {
      fromEl.style.transition = `transform ${anim.duration}ms ${anim.easing}, opacity ${anim.duration}ms ${anim.easing}`;
      fromEl.style.transform = 'translateX(-30px)';
      fromEl.style.opacity = '0';
    }

    toEl.style.opacity = '0';
    toEl.style.transform = 'translateX(30px)';
    toEl.style.transition = `transform ${anim.duration}ms ${anim.easing}, opacity ${anim.duration}ms ${anim.easing}`;

    requestAnimationFrame(() => {
      if (fromEl) {
        fromEl.style.transform = 'translateX(-30px)';
      }
      toEl.style.transform = 'translateX(0)';
      toEl.style.opacity = '1';
    });

    setTimeout(() => {
      if (fromEl) {
        fromEl.style.display = 'none';
        fromEl.style.transform = '';
      }
      toEl.style.transform = '';
      toEl.style.transition = '';
      if (callback) callback();
    }, anim.duration);
  },

  /**
   * 触发页面显示事件
   * @private
   */
  _triggerPageShow(page, state) {
    // 触发自定义事件
    const event = new CustomEvent('page:show', { 
      detail: { page, state } 
    });
    document.dispatchEvent(event);

    // 调用页面特定的初始化函数
    const initFn = window[`init${this._capitalize(page)}Page`];
    if (typeof initFn === 'function') {
      initFn(state);
    }
  },

  /**
   * 首字母大写
   * @private
   */
  _capitalize(str) {
    return str.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
  },

  /**
   * 返回上一页
   */
  back() {
    history.back();
  },

  /**
   * 获取当前页面
   * @returns {string}
   */
  getCurrentPage() {
    return this.currentPage;
  }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Router;
}
