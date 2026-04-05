/**
 * MindBloom V12 - 状态管理模块
 * 全局状态管理，集中管理应用状态
 */

const State = {
  // 当前状态
  current: {
    page: 'home',           // 当前页面
    product: null,          // 当前产品 'basic' | 'advanced'
    code: null,             // 当前体验码
    userInfo: {             // 用户信息
      nickname: '',
      gender: '',
      ageRange: ''
    },
    quiz: {                 // 答题状态
      currentIndex: 0,      // 当前题号
      answers: [],          // 答案数组
      questions: []         // 题目数组
    },
    result: null            // 测评结果
  },

  /**
   * 获取当前状态
   * @returns {Object} 当前状态
   */
  get() {
    return this.current;
  },

  /**
   * 设置页面
   * @param {string} page - 页面名称
   */
  setPage(page) {
    this.current.page = page;
    this._notify('page', page);
  },

  /**
   * 设置当前产品
   * @param {string} product - 产品类型 'basic' | 'advanced'
   */
  setProduct(product) {
    this.current.product = product;
    this._notify('product', product);
  },

  /**
   * 设置体验码
   * @param {string} code - 体验码
   */
  setCode(code) {
    this.current.code = code;
    this._notify('code', code);
  },

  /**
   * 设置用户信息
   * @param {Object} userInfo - 用户信息
   */
  setUserInfo(userInfo) {
    this.current.userInfo = { ...this.current.userInfo, ...userInfo };
    this._notify('userInfo', this.current.userInfo);
  },

  /**
   * 设置答题题目
   * @param {Array} questions - 题目数组
   */
  setQuestions(questions) {
    this.current.quiz.questions = questions;
    this.current.quiz.currentIndex = 0;
    this.current.quiz.answers = new Array(questions.length).fill(null);
    this._notify('questions', questions);
  },

  /**
   * 设置答案
   * @param {number} index - 题号
   * @param {number} answer - 答案索引
   */
  setAnswer(index, answer) {
    this.current.quiz.answers[index] = answer;
    this._notify('answer', { index, answer });
  },

  /**
   * 下一题
   */
  nextQuestion() {
    if (this.current.quiz.currentIndex < this.current.quiz.questions.length - 1) {
      this.current.quiz.currentIndex++;
      this._notify('currentIndex', this.current.quiz.currentIndex);
    }
  },

  /**
   * 上一题
   */
  prevQuestion() {
    if (this.current.quiz.currentIndex > 0) {
      this.current.quiz.currentIndex--;
      this._notify('currentIndex', this.current.quiz.currentIndex);
    }
  },

  /**
   * 设置当前题号
   * @param {number} index - 题号
   */
  setCurrentIndex(index) {
    this.current.quiz.currentIndex = index;
    this._notify('currentIndex', index);
  },

  /**
   * 设置测评结果
   * @param {Object} result - 结果数据
   */
  setResult(result) {
    this.current.result = result;
    this._notify('result', result);
  },

  /**
   * 重置答题状态
   */
  resetQuiz() {
    this.current.quiz = {
      currentIndex: 0,
      answers: [],
      questions: []
    };
    this.current.result = null;
  },

  /**
   * 重置所有状态
   */
  resetAll() {
    this.current = {
      page: 'home',
      product: null,
      code: null,
      userInfo: {
        nickname: '',
        gender: '',
        ageRange: ''
      },
      quiz: {
        currentIndex: 0,
        answers: [],
        questions: []
      },
      result: null
    };
  },

  // 监听器
  _listeners: {},

  /**
   * 订阅状态变化
   * @param {string} key - 状态键
   * @param {Function} callback - 回调函数
   */
  subscribe(key, callback) {
    if (!this._listeners[key]) {
      this._listeners[key] = [];
    }
    this._listeners[key].push(callback);
  },

  /**
   * 取消订阅
   * @param {string} key - 状态键
   * @param {Function} callback - 回调函数
   */
  unsubscribe(key, callback) {
    if (this._listeners[key]) {
      this._listeners[key] = this._listeners[key].filter(cb => cb !== callback);
    }
  },

  /**
   * 通知监听器
   * @param {string} key - 状态键
   * @param {*} value - 新值
   */
  _notify(key, value) {
    if (this._listeners[key]) {
      this._listeners[key].forEach(callback => {
        try {
          callback(value);
        } catch (e) {
          console.error('State listener error:', e);
        }
      });
    }
  }
};
