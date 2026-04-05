/**
 * Storage - localStorage 封装模块
 * 提供统一的读写接口，处理数据序列化和错误处理
 */

const Storage = {
  prefix: 'mindbloom_',

  /**
   * 获取存储项
   * @param {string} key - 键名（不含前缀）
   * @param {*} defaultValue - 默认值
   * @returns {*} 存储的值或默认值
   */
  get(key, defaultValue = null) {
    try {
      const fullKey = this.prefix + key;
      const item = localStorage.getItem(fullKey);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (e) {
      console.error(`[Storage.get] Error reading ${key}:`, e);
      return defaultValue;
    }
  },

  /**
   * 设置存储项
   * @param {string} key - 键名（不含前缀）
   * @param {*} value - 要存储的值
   * @returns {boolean} 是否成功
   */
  set(key, value) {
    try {
      const fullKey = this.prefix + key;
      localStorage.setItem(fullKey, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`[Storage.set] Error writing ${key}:`, e);
      return false;
    }
  },

  /**
   * 删除存储项
   * @param {string} key - 键名（不含前缀）
   */
  remove(key) {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (e) {
      console.error(`[Storage.remove] Error removing ${key}:`, e);
    }
  },

  /**
   * 清空所有 MindBloom 数据
   */
  clear() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.error('[Storage.clear] Error clearing storage:', e);
    }
  },

  // ============ 体验码相关 ============

  /**
   * 获取所有体验码
   * @returns {Object} 体验码对象
   */
  getCodes() {
    return this.get('codes', {});
  },

  /**
   * 保存体验码
   * @param {string} code - 体验码
   * @param {Object} data - 体验码数据
   */
  saveCode(code, data) {
    const codes = this.getCodes();
    codes[code] = { ...codes[code], ...data, code };
    this.set('codes', codes);
  },

  /**
   * 获取单个体验码
   * @param {string} code - 体验码
   * @returns {Object|null}
   */
  getCode(code) {
    const codes = this.getCodes();
    return codes[code] || null;
  },

  // ============ 测评记录相关 ============

  /**
   * 获取所有测评记录
   * @returns {Array}
   */
  getRecords() {
    return this.get('records', []);
  },

  /**
   * 添加测评记录
   * @param {Object} record - 记录对象
   */
  addRecord(record) {
    const records = this.getRecords();
    records.unshift(record);
    // 只保留最近100条
    if (records.length > 100) {
      records.length = 100;
    }
    this.set('records', records);
  },

  // ============ 后台登录状态 ============

  /**
   * 检查后台是否已登录
   * @returns {boolean}
   */
  isAdminLoggedIn() {
    const admin = this.get('admin', {});
    if (!admin.isLoggedIn || !admin.loggedInAt) return false;
    // 登录状态24小时有效
    const hoursSinceLogin = (Date.now() - admin.loggedInAt) / (1000 * 60 * 60);
    return hoursSinceLogin < 24;
  },

  /**
   * 设置后台登录状态
   * @param {boolean} isLoggedIn
   */
  setAdminLogin(isLoggedIn) {
    this.set('admin', {
      isLoggedIn,
      loggedInAt: isLoggedIn ? Date.now() : null
    });
  }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Storage;
}
