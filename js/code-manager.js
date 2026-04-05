/**
 * MindBloom V12 - 体验码管理模块
 * 体验码验证、24小时过期检查、状态管理
 */

const CodeManager = {
  /**
   * 生成体验码
   * @param {string} product - 产品类型 'basic' | 'advanced'
   * @param {number} count - 生成数量
   * @returns {Array} 生成的体验码数组
   */
  generateCodes(product, count = 1) {
    const codes = [];
    const existingCodes = Storage.getCodes();
    
    for (let i = 0; i < count; i++) {
      let code;
      let attempts = 0;
      
      // 生成不重复的4位数字
      do {
        code = Math.floor(1000 + Math.random() * 9000).toString();
        attempts++;
      } while (existingCodes[code] && attempts < 100);
      
      if (attempts >= 100) {
        console.error('Failed to generate unique code');
        continue;
      }
      
      const codeData = {
        code: code,
        product: product,
        status: 'unused',
        createdAt: Date.now(),
        usedAt: null,
        expiresAt: null,
        userInfo: null,
        answers: null,
        result: null,
        completedAt: null
      };
      
      Storage.saveCode(code, codeData);
      codes.push(codeData);
    }
    
    // 更新管理员数据
    this._updateAdminStats();
    
    return codes;
  },

  /**
   * 验证体验码
   * @param {string} code - 体验码
   * @returns {Object} 验证结果 { valid: boolean, status: string, data: Object }
   */
  validateCode(code) {
    // 清理输入
    code = code.trim();
    
    // 验证格式（4位数字）
    if (!/^\d{4}$/.test(code)) {
      return { valid: false, status: 'invalid_format', message: '请输入4位数字体验码' };
    }
    
    const codeData = Storage.getCode(code);
    
    // 体验码不存在
    if (!codeData) {
      return { valid: false, status: 'not_found', message: '体验码不存在，请联系店主获取' };
    }
    
    // 检查是否过期
    if (codeData.expiresAt && codeData.expiresAt < Date.now()) {
      codeData.status = 'expired';
      Storage.saveCode(code, codeData);
      this._updateAdminStats();
      return { valid: false, status: 'expired', message: '体验码已过期，请联系店主获取新码' };
    }
    
    // 首次使用
    if (codeData.status === 'unused') {
      return { 
        valid: true, 
        status: 'first_use', 
        data: codeData,
        message: '体验码有效，开始你的探索之旅'
      };
    }
    
    // 使用中（24小时内）
    if (codeData.status === 'active') {
      // 检查是否已完成
      if (codeData.result) {
        return {
          valid: true,
          status: 'has_result',
          data: codeData,
          message: '欢迎回来，为你展示上次的结果'
        };
      } else if (codeData.answers && codeData.answers.some(a => a !== null)) {
        return {
          valid: true,
          status: 'in_progress',
          data: codeData,
          message: '欢迎回来，继续你的探索'
        };
      } else {
        return {
          valid: true,
          status: 'active_no_progress',
          data: codeData,
          message: '继续你的探索'
        };
      }
    }
    
    // 已过期
    if (codeData.status === 'expired') {
      return { valid: false, status: 'expired', message: '体验码已过期，请联系店主获取新码' };
    }
    
    return { valid: false, status: 'unknown', message: '体验码状态异常' };
  },

  /**
   * 激活体验码（首次验证）
   * @param {string} code - 体验码
   * @param {Object} userInfo - 用户信息
   */
  activateCode(code, userInfo) {
    const codeData = Storage.getCode(code);
    if (!codeData) return false;
    
    const now = Date.now();
    const expiresAt = now + (CONFIG.code.expiresHours * 60 * 60 * 1000);
    
    codeData.status = 'active';
    codeData.usedAt = now;
    codeData.expiresAt = expiresAt;
    codeData.userInfo = userInfo;
    codeData.answers = [];
    
    Storage.saveCode(code, codeData);
    this._updateAdminStats();
    
    return true;
  },

  /**
   * 保存答题进度
   * @param {string} code - 体验码
   * @param {Array} answers - 答案数组
   * @param {Array} questions - 题目数组
   */
  saveProgress(code, answers, questions) {
    const codeData = Storage.getCode(code);
    if (!codeData) return false;
    
    codeData.answers = answers;
    codeData.questions = questions;
    
    Storage.saveCode(code, codeData);
    return true;
  },

  /**
   * 保存测评结果
   * @param {string} code - 体验码
   * @param {Object} result - 结果数据
   */
  saveResult(code, result) {
    const codeData = Storage.getCode(code);
    if (!codeData) return false;
    
    codeData.result = result;
    codeData.completedAt = Date.now();
    
    Storage.saveCode(code, codeData);
    this._updateAdminStats();
    
    return true;
  },

  /**
   * 获取体验码状态
   * @param {string} code - 体验码
   * @returns {Object} 状态信息
   */
  getCodeStatus(code) {
    const codeData = Storage.getCode(code);
    if (!codeData) return null;
    
    // 检查是否过期
    if (codeData.expiresAt && codeData.expiresAt < Date.now() && codeData.status !== 'expired') {
      codeData.status = 'expired';
      Storage.saveCode(code, codeData);
      this._updateAdminStats();
    }
    
    return {
      code: codeData.code,
      product: codeData.product,
      status: codeData.status,
      createdAt: codeData.createdAt,
      usedAt: codeData.usedAt,
      expiresAt: codeData.expiresAt,
      hasResult: !!codeData.result,
      completedAt: codeData.completedAt
    };
  },

  /**
   * 获取所有体验码统计
   * @returns {Object} 统计数据
   */
  getStats() {
    const codes = Storage.getAllCodes();
    const now = Date.now();
    
    let unused = 0;
    let active = 0;
    let expired = 0;
    let basic = 0;
    let advanced = 0;
    
    codes.forEach(code => {
      // 检查过期
      if (code.expiresAt && code.expiresAt < now && code.status === 'active') {
        code.status = 'expired';
        Storage.saveCode(code.code, code);
      }
      
      // 统计状态
      if (code.status === 'unused') unused++;
      else if (code.status === 'active') active++;
      else if (code.status === 'expired') expired++;
      
      // 统计产品类型
      if (code.product === 'basic') basic++;
      else if (code.product === 'advanced') advanced++;
    });
    
    return {
      total: codes.length,
      unused,
      active,
      expired,
      basic,
      advanced
    };
  },

  /**
   * 获取体验码列表（用于后台）
   * @param {string} filter - 筛选条件 'all' | 'unused' | 'active' | 'expired'
   * @returns {Array} 体验码列表
   */
  getCodeList(filter = 'all') {
    const codes = Storage.getAllCodes();
    const now = Date.now();
    
    return codes
      .map(code => {
        // 检查过期
        if (code.expiresAt && code.expiresAt < now && code.status === 'active') {
          code.status = 'expired';
          Storage.saveCode(code.code, code);
        }
        return code;
      })
      .filter(code => {
        if (filter === 'all') return true;
        return code.status === filter;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  /**
   * 删除体验码
   * @param {string} code - 体验码
   */
  deleteCode(code) {
    Storage.removeCode(code);
    this._updateAdminStats();
  },

  /**
   * 清理过期体验码
   * @returns {number} 清理数量
   */
  clearExpiredCodes() {
    const codes = Storage.getCodes();
    const now = Date.now();
    let count = 0;
    
    for (const code in codes) {
      if (codes[code].expiresAt && codes[code].expiresAt < now) {
        delete codes[code];
        count++;
      }
    }
    
    Storage.saveCodes(codes);
    this._updateAdminStats();
    
    return count;
  },

  /**
   * 更新管理员统计数据
   */
  _updateAdminStats() {
    const stats = this.getStats();
    const adminData = Storage.getAdminData();
    adminData.stats = stats;
    Storage.saveAdminData(adminData);
  }
};
