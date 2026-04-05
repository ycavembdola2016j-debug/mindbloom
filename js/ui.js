/**
 * UI Module - 通用 UI 组件
 * Toast、弹窗、动画等
 */

const UI = {
  // Toast 定时器
  toastTimer: null,

  /**
   * 显示 Toast 提示
   * @param {string} message 消息内容
   * @param {boolean} isError 是否错误提示
   * @param {number} duration 显示时长（毫秒）
   */
  showToast(message, isError = false, duration = 2500) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    // 清除之前的定时器
    clearTimeout(this.toastTimer);

    // 设置内容和样式
    toast.textContent = message;
    toast.className = 'toast' + (isError ? ' error' : '');
    toast.classList.add('show');

    // 自动隐藏
    this.toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  },

  /**
   * 显示确认对话框
   * @param {string} message 消息内容
   * @returns {Promise<boolean>}
   */
  confirm(message) {
    return new Promise(resolve => {
      // 简单的 confirm，可以扩展为自定义弹窗
      const result = window.confirm(message);
      resolve(result);
    });
  },

  /**
   * 显示加载中
   * @param {string} message 加载提示文字
   */
  showLoading(message = '加载中...') {
    // 可以扩展为自定义 loading 组件
    console.log('Loading:', message);
  },

  /**
   * 隐藏加载中
   */
  hideLoading() {
    // 可以扩展为自定义 loading 组件
    console.log('Loading complete');
  },

  /**
   * 创建星空背景
   */
  createStars() {
    const starsEl = document.getElementById('stars');
    if (!starsEl) return;

    starsEl.innerHTML = '';
    
    for (let i = 0; i < 80; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      
      const size = 1 + Math.random() * 2;
      const duration = 2 + Math.random() * 4;
      const delay = Math.random() * 5;
      
      star.style.cssText = `
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        width: ${size}px;
        height: ${size}px;
        --dur: ${duration}s;
        animation-delay: ${delay}s;
      `;
      
      starsEl.appendChild(star);
    }
  },

  /**
   * 初始化所有 UI 组件
   */
  init() {
    this.createStars();
  }
};
