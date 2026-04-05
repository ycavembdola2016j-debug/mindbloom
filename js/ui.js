/**
 * MindBloom V12 - UI工具模块
 * 统一的UI操作和提示
 */

const UI = {
  /**
   * 显示提示消息
   * @param {string} message - 消息内容
   * @param {string} type - 类型 'success' | 'error' | 'info'
   * @param {number} duration - 显示时长（毫秒）
   */
  showToast(message, type = 'info', duration = 3000) {
    // 移除已有的toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }

    // 创建toast元素
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // 显示动画
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // 自动隐藏
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);
  },

  /**
   * 显示加载状态
   * @param {string} containerId - 容器ID
   * @param {string} message - 加载提示文字
   */
  showLoading(containerId, message = '加载中...') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.id = `${containerId}-loading`;
    loading.innerHTML = `
      <div class="spinner"></div>
      <p style="margin-top: 16px; color: var(--text-secondary);">${message}</p>
    `;
    
    container.innerHTML = '';
    container.appendChild(loading);
  },

  /**
   * 隐藏加载状态
   * @param {string} containerId - 容器ID
   */
  hideLoading(containerId) {
    const loading = document.getElementById(`${containerId}-loading`);
    if (loading) {
      loading.remove();
    }
  },

  /**
   * 确认对话框
   * @param {string} message - 确认消息
   * @returns {Promise<boolean>} 用户是否确认
   */
  confirm(message) {
    return new Promise((resolve) => {
      const confirmed = window.confirm(message);
      resolve(confirmed);
    });
  },

  /**
   * 复制文本到剪贴板
   * @param {string} text - 要复制的文本
   * @returns {Promise<boolean>} 是否复制成功
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast('已复制到剪贴板', 'success');
      return true;
    } catch (err) {
      // 降级方案
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      
      try {
        document.execCommand('copy');
        this.showToast('已复制到剪贴板', 'success');
        return true;
      } catch (err) {
        this.showToast('复制失败，请手动复制', 'error');
        return false;
      } finally {
        document.body.removeChild(textarea);
      }
    }
  },

  /**
   * 下载Canvas为图片
   * @param {HTMLCanvasElement} canvas - Canvas元素
   * @param {string} filename - 文件名
   */
  downloadCanvas(canvas, filename = 'mindbloom-postcard.png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
    this.showToast('明信片已保存', 'success');
  },

  /**
   * 分享内容
   * @param {Object} data - 分享数据
   */
  async share(data) {
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch (err) {
        console.log('分享取消或失败');
      }
    } else {
      this.showToast('请截图分享', 'info');
    }
  }
};
