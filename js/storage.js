/**
 * MindBloom V12 - 存储模块
 * 封装 localStorage 操作，处理数据持久化
 */

const Storage = {
  /**
   * 获取体验码数据
   * @returns {Object} 所有体验码数据
   */
  getCodes() {
    try {
      const data = localStorage.getItem(CONFIG.storage.codes);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('Storage.getCodes error:', e);
      return {};
    }
  },

  /**
   * 保存体验码数据
   * @param {Object} codes - 体验码数据对象
   */
  saveCodes(codes) {
    try {
      localStorage.setItem(CONFIG.storage.codes, JSON.stringify(codes));
    } catch (e) {
      console.error('Storage.saveCodes error:', e);
    }
  },

  /**
   * 获取单个体验码数据
   * @param {string} code - 体验码
   * @returns {Object|null} 体验码数据
   */
  getCode(code) {
    const codes = this.getCodes();
    return codes[code] || null;
  },

  /**
   * 保存单个体验码数据
   * @param {string} code - 体验码
   * @param {Object} data - 体验码数据
   */
  saveCode(code, data) {
    const codes = this.getCodes();
    codes[code] = { ...codes[code], ...data };
    this.saveCodes(codes);
  },

  /**
   * 删除体验码
   * @param {string} code - 体验码
   */
  removeCode(code) {
    const codes = this.getCodes();
    delete codes[code];
    this.saveCodes(codes);
  },

  /**
   * 获取所有体验码列表（用于后台管理）
   * @returns {Array} 体验码数组
   */
  getAllCodes() {
    const codes = this.getCodes();
    return Object.values(codes);
  },

  /**
   * 清除过期体验码
   * @returns {number} 清除的数量
   */
  clearExpiredCodes() {
    const codes = this.getCodes();
    const now = Date.now();
    let count = 0;

    for (const code in codes) {
      if (codes[code].expiresAt && codes[code].expiresAt < now) {
        codes[code].status = 'expired';
        count++;
      }
    }

    this.saveCodes(codes);
    return count;
  },

  /**
   * 获取管理员数据
   * @returns {Object} 管理员数据
   */
  getAdminData() {
    try {
      const data = localStorage.getItem(CONFIG.storage.admin);
      return data ? JSON.parse(data) : { codes: [], stats: { total: 0, unused: 0, active: 0, expired: 0, basic: 0, advanced: 0 } };
    } catch (e) {
      console.error('Storage.getAdminData error:', e);
      return { codes: [], stats: { total: 0, unused: 0, active: 0, expired: 0, basic: 0, advanced: 0 } };
    }
  },

  /**
   * 保存管理员数据
   * @param {Object} data - 管理员数据
   */
  saveAdminData(data) {
    try {
      localStorage.setItem(CONFIG.storage.admin, JSON.stringify(data));
    } catch (e) {
      console.error('Storage.saveAdminData error:', e);
    }
  },

  /**
   * 获取会话数据
   * @returns {Object} 会话数据
   */
  getSession() {
    try {
      const data = localStorage.getItem(CONFIG.storage.session);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('Storage.getSession error:', e);
      return {};
    }
  },

  /**
   * 保存会话数据
   * @param {Object} data - 会话数据
   */
  saveSession(data) {
    try {
      localStorage.setItem(CONFIG.storage.session, JSON.stringify(data));
    } catch (e) {
      console.error('Storage.saveSession error:', e);
    }
  },

  /**
   * 清除会话数据
   */
  clearSession() {
    localStorage.removeItem(CONFIG.storage.session);
  },

  /**
   * 清除所有数据（谨慎使用）
   */
  clearAll() {
    localStorage.removeItem(CONFIG.storage.codes);
    localStorage.removeItem(CONFIG.storage.admin);
    localStorage.removeItem(CONFIG.storage.session);
  }
};
