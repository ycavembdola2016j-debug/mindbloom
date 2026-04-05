/**
 * State Module - 全局状态管理
 * 单一数据源，所有状态变更都通过这里
 */

const State = {
  // 当前状态
  data: {
    // 产品选择
    product: null,        // 'basic' | 'advanced' | null
    
    // 当前体验码（用于保存答题结果和重复登录）
    currentCode: null,    // string | null
    
    // 上次结果（用于重复登录直接显示）
    lastResult: null,     // Object | null
    
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
    
    // 后台管理
    admin: {
      isLoggedIn: false,
      genProduct: 'basic' // 生成码时选择的产品
    }
  },

  // 监听器数组
  listeners: [],

  /**
   * 获取状态副本
   */
  get() {
    return JSON.parse(JSON.stringify(this.data));
  },

  /**
   * 设置状态（部分更新）
   * @param {Object} newState 新状态对象
   * @param {boolean} silent 是否静默更新（不触发监听）
   */
  set(newState, silent = false) {
    const prevData = JSON.parse(JSON.stringify(this.data));
    this.data = this.deepMerge(this.data, newState);
    
    if (!silent) {
      this.notify(prevData);
    }
  },

  /**
   * 重置答题状态
   */
  resetQuiz() {
    this.data.quiz = {
      currentIndex: 0,
      answers: [],
      history: []
    };
  },

  /**
   * 重置所有状态（用于重新开始，保留 currentCode 用于结果保存）
   */
  resetAll() {
    this.data = {
      product: null,
      currentCode: null,
      lastResult: null,
      user: { nickname: '', gender: '', age: '' },
      quiz: { currentIndex: 0, answers: [], history: [] },
      admin: { isLoggedIn: false, genProduct: 'basic' }
    };
  },

  /**
   * 记录答案
   * @param {number} questionIndex 题目索引
   * @param {number} optionIndex 选项索引
   */
  recordAnswer(questionIndex, optionIndex) {
    this.data.quiz.answers[questionIndex] = optionIndex;
  },

  /**
   * 进入下一题
   */
  nextQuestion() {
    this.data.quiz.history.push(this.data.quiz.currentIndex);
    this.data.quiz.currentIndex++;
  },

  /**
   * 返回上一题
   * @returns {boolean} 是否成功返回
   */
  prevQuestion() {
    if (this.data.quiz.history.length === 0) {
      return false;
    }
    this.data.quiz.currentIndex = this.data.quiz.history.pop();
    return true;
  },

  /**
   * 订阅状态变化
   * @param {Function} callback 回调函数
   * @returns {Function} 取消订阅函数
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  },

  /**
   * 通知所有监听器
   */
  notify(prevData) {
    this.listeners.forEach(callback => {
      try {
        callback(this.get(), prevData);
      } catch (e) {
        console.error('State listener error:', e);
      }
    });
  },

  /**
   * 深度合并对象
   */
  deepMerge(target, source) {
    const result = JSON.parse(JSON.stringify(target));
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = this.deepMerge(result[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    
    return result;
  }
};
