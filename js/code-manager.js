/**
 * CodeManager Module - 体验码管理（带24小时过期机制 + URL共享）
 * 
 * 功能：
 * 1. 体验码生成后保留24小时
 * 2. 24小时内可重复使用，直接显示上次结果
 * 3. 24小时后自动过期删除，但保留用户数据
 * 4. 支持多产品类型共存（A产品和B产品体验码互不覆盖）
 * 5. 记录上次答题结果，支持重复登录直接查看
 * 6. 支持 URL 参数传递体验码，实现跨设备共享
 * 
 * 设计原则：
 * - 完全隔离，不修改原有 Storage/Admin 模块
 * - 向下兼容，原有体验码仍然有效
 * - 自动清理过期码
 * - URL 参数体验码自动同步到本地存储
 */

const CodeManager = {
  // 24小时过期时间（毫秒）
  EXPIRY_TIME: 24 * 60 * 60 * 1000,
  
  // 存储键名（与原有 Storage 隔离）
  KEY: 'mindbloom_codes_v6_managed',

  /**
   * 从 URL 参数中获取体验码
   * @returns {string|null} 体验码或null
   */
  getCodeFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('code');
  },

  /**
   * 从 URL 参数中获取体验码并验证
   * 如果码有效但不在本地存储中，会自动添加到本地
   * @returns {Object|null} 码信息或null
   */
  validateFromURL() {
    const code = this.getCodeFromURL();
    if (!code) return null;
    
    const upperCode = code.toUpperCase();
    
    // 先检查本地是否已有此码
    let info = this.validate(upperCode);
    if (info) {
      return { code: upperCode, info, fromURL: true };
    }
    
    // 本地没有，但URL中有，检查格式是否有效
    if (!this._isValidCodeFormat(upperCode)) {
      return null;
    }
    
    // 格式有效，自动添加到本地存储（24小时有效期）
    const product = upperCode.startsWith('B') ? 'basic' : 'advanced';
    const now = Date.now();
    const codes = this.getValidCodes();
    
    codes[upperCode] = {
      product: product,
      used: false,
      usedAt: null,
      created: now,
      expiry: now + this.EXPIRY_TIME,
      fromURL: true  // 标记为从URL导入
    };
    
    this._save(codes);
    console.log(`[CodeManager] 从URL导入体验码: ${upperCode}`);
    
    return { 
      code: upperCode, 
      info: codes[upperCode], 
      fromURL: true,
      isNew: true 
    };
  },

  /**
   * 检查体验码格式是否有效
   * @private
   */
  _isValidCodeFormat(code) {
    if (!code || code.length !== 5) return false;
    const prefix = code[0].toUpperCase();
    if (prefix !== 'A' && prefix !== 'B') return false;
    const numbers = code.slice(1);
    return /^\d{4}$/.test(numbers);
  },

  /**
   * 生成带体验码的分享链接
   * @param {string} code 体验码
   * @returns {string} 完整URL
   */
  generateShareLink(code) {
    const baseUrl = window.location.origin + window.location.pathname;
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}code=${code.toUpperCase()}`;
  },

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
   * @param {Object} result 答题结果（可选）
   * @returns {boolean} 是否成功
   */
  markUsed(code, result = null) {
    const codes = this.getValidCodes();
    const upperCode = code.toUpperCase();
    
    if (!codes[upperCode]) return false;
    
    codes[upperCode].used = true;
    codes[upperCode].usedAt = Date.now();
    
    // 保存上次答题结果，支持24小时内重复登录直接查看
    if (result) {
      codes[upperCode].lastResult = result;
    }
    
    this._save(codes);
    return true;
  },

  /**
   * 获取体验码的上次答题结果
   * @param {string} code 体验码
   * @returns {Object|null} 结果对象或null
   */
  getLastResult(code) {
    const info = this.validate(code);
    if (!info) return null;
    return info.lastResult || null;
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
   * 检查体验码是否可以在24小时内重复登录
   * @param {string} code 体验码
   * @returns {boolean} 是否可以重复登录
   */
  canRelogin(code) {
    const info = this.validate(code);
    if (!info || !info.used || !info.usedAt) return false;
    
    // 检查是否在24小时内使用过
    const now = Date.now();
    return (now - info.usedAt) < this.EXPIRY_TIME;
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
