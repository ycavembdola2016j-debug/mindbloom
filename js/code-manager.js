/**
 * CodeManager - 体验码管理模块
 * 处理体验码验证、24小时过期机制、结果保存
 */

const CodeManager = {
  // 24小时的有效期（毫秒）
  VALIDITY_PERIOD: 24 * 60 * 60 * 1000,

  /**
   * 验证体验码是否有效
   * @param {string} code - 体验码
   * @returns {Object|null} 体验码信息或null
   */
  validate(code) {
    if (!code || typeof code !== 'string') return null;
    
    code = code.toUpperCase().trim();
    
    // 格式验证：1个大写字母 + 4位数字
    const pattern = /^[AB]\d{4}$/;
    if (!pattern.test(code)) return null;

    const entry = Storage.getCode(code);
    
    // 如果不存在，检查是否是有效的格式
    if (!entry) {
      const type = code.startsWith('B') ? 'basic' : 'advanced';
      return {
        code,
        type,
        exists: false,
        used: false,
        valid: true
      };
    }

    // 检查是否过期
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      return {
        ...entry,
        valid: false,
        expired: true
      };
    }

    return {
      ...entry,
      valid: true
    };
  },

  /**
   * 标记体验码为已使用
   * @param {string} code - 体验码
   * @returns {Object} 更新后的体验码信息
   */
  markUsed(code) {
    code = code.toUpperCase().trim();
    const now = Date.now();
    
    const entry = Storage.getCode(code) || {
      code,
      type: code.startsWith('B') ? 'basic' : 'advanced'
    };

    const updatedEntry = {
      ...entry,
      used: true,
      usedAt: now,
      expiresAt: now + this.VALIDITY_PERIOD
    };

    Storage.saveCode(code, updatedEntry);
    return updatedEntry;
  },

  /**
   * 检查是否可以重复登录（24小时内）
   * @param {string} code - 体验码
   * @returns {boolean}
   */
  canRelogin(code) {
    code = code.toUpperCase().trim();
    const entry = Storage.getCode(code);
    
    if (!entry || !entry.used || !entry.expiresAt) return false;
    
    return Date.now() < entry.expiresAt;
  },

  /**
   * 获取上次保存的结果
   * @param {string} code - 体验码
   * @returns {Object|null}
   */
  getLastResult(code) {
    code = code.toUpperCase().trim();
    const entry = Storage.getCode(code);
    return entry?.result || null;
  },

  /**
   * 保存测评结果
   * @param {string} code - 体验码
   * @param {Object} result - 结果对象
   */
  saveResult(code, result) {
    code = code.toUpperCase().trim();
    const entry = Storage.getCode(code) || {
      code,
      type: code.startsWith('B') ? 'basic' : 'advanced'
    };

    Storage.saveCode(code, {
      ...entry,
      result,
      resultSavedAt: Date.now()
    });
  },

  /**
   * 生成新的体验码
   * @param {string} type - 'basic' | 'advanced'
   * @param {number} count - 生成数量
   * @returns {Array<string>} 生成的体验码数组
   */
  generate(type, count = 1) {
    const prefix = type === 'basic' ? 'B' : 'A';
    const codes = [];
    const existingCodes = Storage.getCodes();

    for (let i = 0; i < count; i++) {
      let code;
      let attempts = 0;
      
      do {
        const num = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        code = prefix + num;
        attempts++;
      } while (existingCodes[code] && attempts < 100);

      if (attempts >= 100) {
        console.error('[CodeManager] Failed to generate unique code');
        continue;
      }

      Storage.saveCode(code, {
        code,
        type,
        used: false,
        createdAt: Date.now()
      });

      codes.push(code);
    }

    return codes;
  },

  /**
   * 获取所有体验码统计
   * @returns {Object}
   */
  getStats() {
    const codes = Storage.getCodes();
    const stats = {
      total: 0,
      basic: { total: 0, used: 0 },
      advanced: { total: 0, used: 0 }
    };

    for (const entry of Object.values(codes)) {
      stats.total++;
      if (entry.type === 'basic') {
        stats.basic.total++;
        if (entry.used) stats.basic.used++;
      } else {
        stats.advanced.total++;
        if (entry.used) stats.advanced.used++;
      }
    }

    return stats;
  },

  /**
   * 获取最近的使用记录
   * @param {number} limit - 数量限制
   * @returns {Array}
   */
  getRecentRecords(limit = 20) {
    return Storage.getRecords().slice(0, limit);
  }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CodeManager;
}
