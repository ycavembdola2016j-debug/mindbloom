/**
 * State - 全局状态管理模块
 * 集中管理应用状态，支持订阅变化
 */

const State = {
  // 当前状态
  data: {
    // 当前页面
    currentPage: 'home',
    
    // 产品选择
    product: null,        // 'basic' | 'advanced' | null
    
    // 当前体验码
    currentCode: null,    // string | null
    
    // 用户信息
    user: {
      nickname: '',
      gender: '',
      age: ''
    },
    
    // 答题状态
    quiz: {
      currentIndex: 0,    // 当前题目索引
      answers: [],        // 答案数组
      history: []         // 答题历史（用于返回）
    },
    
    // 测评结果
    result: null,         // Object | null
    
    // 后台管理
    admin: {
      isLoggedIn: false
    }
  },

  // 监听器
  listeners: {},

  /**
   * 获取状态
   * @param {string} path - 状态路径，如 'user.nickname'
   * @param {*} defaultValue - 默认值
   * @returns {*}
   */
  get(path, defaultValue = null) {
    const keys = path.split('.');
    let value = this.data;
    for (const key of keys) {
      if (value === null || value === undefined) return defaultValue;
      value = value[key];
    }
    return value !== undefined ? value : defaultValue;
  },

  /**
   * 设置状态
   * @param {Object} updates - 要更新的状态对象
   * @param {boolean} persist - 是否持久化到 localStorage
   */
  set(updates, persist = false) {
    const changedKeys = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (this._setNestedValue(this.data, key, value)) {
        changedKeys.push(key);
      }
    }

    // 触发监听器
    changedKeys.forEach(key => this._notify(key));

    // 持久化
    if (persist) {
      Storage.set('app_state', this.data);
    }
  },

  /**
   * 设置嵌套值
   * @private
   */
  _setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let target = obj;
    
    for (const key of keys) {
      if (!(key in target) || typeof target[key] !== 'object') {
        target[key] = {};
      }
      target = target[key];
    }

    const changed = target[lastKey] !== value;
    target[lastKey] = value;
    return changed;
  },

  /**
   * 订阅状态变化
   * @param {string} key - 状态键
   * @param {Function} callback - 回调函数
   */
  subscribe(key, callback) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(callback);
  },

  /**
   * 取消订阅
   * @param {string} key - 状态键
   * @param {Function} callback - 回调函数
   */
  unsubscribe(key, callback) {
    if (this.listeners[key]) {
      this.listeners[key] = this.listeners[key].filter(cb => cb !== callback);
    }
  },

  /**
   * 通知监听器
   * @private
   */
  _notify(key) {
    if (this.listeners[key]) {
      this.listeners[key].forEach(cb => {
        try {
          cb(this.get(key));
        } catch (e) {
          console.error(`[State] Error in listener for ${key}:`, e);
        }
      });
    }
  },

  /**
   * 重置答题状态
   */
  resetQuiz() {
    this.set({
      'quiz.currentIndex': 0,
      'quiz.answers': [],
      'quiz.history': []
    });
  },

  /**
   * 重置用户状态（保留体验码）
   */
  resetUser() {
    this.set({
      'user.nickname': '',
      'user.gender': '',
      'user.age': '',
      'quiz.currentIndex': 0,
      'quiz.answers': [],
      'quiz.history': [],
      'result': null
    });
  },

  /**
   * 完全重置（用于重新开始）
   */
  resetAll() {
    this.data = {
      currentPage: 'home',
      product: null,
      currentCode: null,
      user: { nickname: '', gender: '', age: '' },
      quiz: { currentIndex: 0, answers: [], history: [] },
      result: null,
      admin: { isLoggedIn: false }
    };
    Storage.remove('app_state');
  },

  /**
   * 从 localStorage 恢复状态
   */
  restore() {
    const saved = Storage.get('app_state');
    if (saved) {
      this.data = { ...this.data, ...saved };
    }
  }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = State;
}
