/**
 * CodeManager Module - 体验码管理（带24小时过期机制）
 * 
 * 功能：
 * 1. 体验码生成后保留24小时
 * 2. 24小时内可重复使用
 * 3. 24小时后自动过期删除
 * 4. 支持多产品类型共存（A产品和B产品体验码互不覆盖）
 * 
 * 设计原则：
 * - 完全隔离，不修改原有 Storage/Admin 模块
 * - 向下兼容，原有体验码仍然有效
 * - 自动清理过期码
 */

const CodeManager = {
  // 24小时过期时间（毫秒）
  EXPIRY_TIME: 24 * 60 * 60 * 1000,
  
  // 存储键名（与原有 Storage 隔离）
  KEY: 'mindbloom_codes_v6_managed',

  /**
   * 获取所有有效的体验码（自动清理过期码）
   * @returns {Object} 体验码对象 { code: { product, used, usedAt, created, expiry } }
   */
  getValidCodes() {
    const codes = this._load();
    const now = Date.now();
    let hasExpired = false;
    
    // 检查并标记过期码
    Object.entries(codes).forEach(([code, info]) => {
      if (info.expiry && now > info.expiry) {
        delete codes[code];
        hasExpired = true;
      }
    });
    
    // 如果有过期码，保存清理后的数据
    if (hasExpired) {
      this._save(codes);
      console.log('[CodeManager] 已清理过期体验码');
    }
    
    return codes;
  },

  /**
   * 生成新的体验码
   * @param {string} product 'basic' | 'advanced'
   * @param {number} count 生成数量（默认5，最大20）
   * @returns {Array} 生成的体验码数组
   */
  generate(product, count = 5) {
    count = Math.min(20, Math.max(1, count));
    const prefix = product === 'basic' ? 'B' : 'A';
    const codes = this.getValidCodes();
    const generated = [];
    const now = Date.now();
    
    for (let i = 0; i < count; i++) {
      let code;
      do {
        code = prefix + String(Math.floor(1000 + Math.random() * 9000));
      } while (codes[code]);
      
      codes[code] = {
        product: product,
        used: false,
        usedAt: null,
        created: now,
        expiry: now + this.EXPIRY_TIME
      };
      
      generated.push(code);
    }
    
    this._save(codes);
    return generated;
  },

  /**
   * 验证体验码是否有效
   * @param {string} code 体验码
   * @returns {Object|null} 有效返回码信息，无效返回null
   */
  validate(code) {
    if (!code) return null;
    
    const codes = this.getValidCodes();
    const info = codes[code.toUpperCase()];
    
    if (!info) return null;
    
    // 检查是否过期
    if (info.expiry && Date.now() > info.expiry) {
      // 过期，删除
      delete codes[code.toUpperCase()];
      this._save(codes);
      return null;
    }
    
    return info;
  },

  /**
   * 标记体验码为已使用
   * @param {string} code 体验码
   * @returns {boolean} 是否成功
   */
  markUsed(code) {
    const codes = this.getValidCodes();
    const upperCode = code.toUpperCase();
    
    if (!codes[upperCode]) return false;
    
    codes[upperCode].used = true;
    codes[upperCode].usedAt = Date.now();
    
    this._save(codes);
    return true;
  },

  /**
   * 检查体验码是否已使用（24小时内可重复使用）
   * @param {string} code 体验码
   * @returns {boolean} 是否已使用
   */
  isUsed(code) {
    const info = this.validate(code);
    return info ? info.used : false;
  },

  /**
   * 重置体验码使用状态（允许再次使用）
   * @param {string} code 体验码
   * @returns {boolean} 是否成功
   */
  reset(code) {
    const codes = this.getValidCodes();
    const upperCode = code.toUpperCase();
    
    if (!codes[upperCode]) return false;
    
    codes[upperCode].used = false;
    codes[upperCode].usedAt = null;
    
    this._save(codes);
    return true;
  },

  /**
   * 获取统计信息
   * @returns {Object} 统计数据
   */
  getStats() {
    const codes = this.getValidCodes();
    const stats = {
      basicTotal: 0,
      basicUsed: 0,
      advancedTotal: 0,
      advancedUsed: 0,
      expiringSoon: 0 // 1小时内过期的码
    };
    
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    Object.values(codes).forEach(info => {
      if (info.product === 'basic') {
        stats.basicTotal++;
        if (info.used) stats.basicUsed++;
      } else {
        stats.advancedTotal++;
        if (info.used) stats.advancedUsed++;
      }
      
      // 检查是否即将过期
      if (info.expiry && info.expiry - now < oneHour) {
        stats.expiringSoon++;
      }
    });
    
    return stats;
  },

  /**
   * 获取所有体验码列表（用于后台展示）
   * @returns {Array} 体验码列表
   */
  getAllCodes() {
    const codes = this.getValidCodes();
    return Object.entries(codes).map(([code, info]) => ({
      code,
      ...info,
      expiryFormatted: this._formatTime(info.expiry)
    }));
  },

  /**
   * 手动清理所有过期码
   * @returns {number} 清理的数量
   */
  cleanup() {
    const codes = this._load();
    const now = Date.now();
    let count = 0;
    
    Object.entries(codes).forEach(([code, info]) => {
      if (info.expiry && now > info.expiry) {
        delete codes[code];
        count++;
      }
    });
    
    if (count > 0) {
      this._save(codes);
    }
    
    return count;
  },

  /**
   * 清空所有体验码（危险操作）
   */
  clearAll() {
    localStorage.removeItem(this.KEY);
  },

  // ============ 私有方法 ============

  /**
   * 从 localStorage 加载数据
   */
  _load() {
    try {
      const data = localStorage.getItem(this.KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('[CodeManager] Load error:', e);
      return {};
    }
  },

  /**
   * 保存数据到 localStorage
   */
  _save(codes) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(codes));
      return true;
    } catch (e) {
      console.error('[CodeManager] Save error:', e);
      return false;
    }
  },

  /**
   * 格式化时间
   */
  _formatTime(timestamp) {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
};

// 暴露到全局
window.CodeManager = CodeManager;
