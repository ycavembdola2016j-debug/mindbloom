/**
 * Storage Module - localStorage 封装
 * 提供统一的存储接口，处理错误和序列化
 */

const Storage = {
  KEYS: {
    CODES: 'mindbloom_codes_v5',
    RECORDS: 'mindbloom_records_v5',
    SESSION: 'mindbloom_session_v5'
  },

  /**
   * 获取存储的体验码
   * @returns {Object} 体验码对象 { code: { product, used, usedAt, created } }
   */
  getCodes() {
    try {
      const data = localStorage.getItem(this.KEYS.CODES);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('Storage.getCodes error:', e);
      return {};
    }
  },

  /**
   * 保存体验码
   * @param {Object} codes 体验码对象
   */
  saveCodes(codes) {
    try {
      localStorage.setItem(this.KEYS.CODES, JSON.stringify(codes));
      return true;
    } catch (e) {
      console.error('Storage.saveCodes error:', e);
      return false;
    }
  },

  /**
   * 获取测评记录
   * @returns {Array} 记录数组
   */
  getRecords() {
    try {
      const data = localStorage.getItem(this.KEYS.RECORDS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Storage.getRecords error:', e);
      return [];
    }
  },

  /**
   * 保存测评记录
   * @param {Array} records 记录数组
   */
  saveRecords(records) {
    try {
      localStorage.setItem(this.KEYS.RECORDS, JSON.stringify(records));
      return true;
    } catch (e) {
      console.error('Storage.saveRecords error:', e);
      return false;
    }
  },

  /**
   * 添加一条记录
   * @param {Object} record 记录对象
   */
  addRecord(record) {
    const records = this.getRecords();
    records.unshift(record);
    // 最多保留100条
    if (records.length > 100) {
      records.splice(100);
    }
    return this.saveRecords(records);
  },

  /**
   * 获取会话状态（用于刷新页面恢复）
   * @returns {Object|null}
   */
  getSession() {
    try {
      const data = localStorage.getItem(this.KEYS.SESSION);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * 保存会话状态
   * @param {Object} session 会话对象
   */
  saveSession(session) {
    try {
      localStorage.setItem(this.KEYS.SESSION, JSON.stringify(session));
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * 清除会话状态
   */
  clearSession() {
    localStorage.removeItem(this.KEYS.SESSION);
  },

  /**
   * 导出所有数据为 JSON
   * @returns {Object}
   */
  exportAll() {
    return {
      codes: this.getCodes(),
      records: this.getRecords(),
      exportTime: new Date().toISOString()
    };
  },

  /**
   * 清空所有数据（危险操作）
   */
  clearAll() {
    localStorage.removeItem(this.KEYS.CODES);
    localStorage.removeItem(this.KEYS.RECORDS);
    localStorage.removeItem(this.KEYS.SESSION);
  }
};

// 兼容旧版本数据迁移
Storage.migrateFromV4 = function() {
  try {
    const oldCodes = localStorage.getItem('mindbloom_codes_v4');
    const oldRecords = localStorage.getItem('mindbloom_records_v4');
    
    if (oldCodes && !localStorage.getItem(this.KEYS.CODES)) {
      localStorage.setItem(this.KEYS.CODES, oldCodes);
    }
    if (oldRecords && !localStorage.getItem(this.KEYS.RECORDS)) {
      localStorage.setItem(this.KEYS.RECORDS, oldRecords);
    }
  } catch (e) {
    console.error('Migration error:', e);
  }
};

// 页面加载时执行迁移 - 由 App.init 调用
Storage.init = function() {
  this.migrateFromV4();
};
