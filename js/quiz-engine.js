/**
 * QuizEngine - 答题引擎模块
 * 处理答题逻辑、选项选择、返回上一题、进度管理
 */

const QuizEngine = {
  // 当前题目列表
  questions: [],

  /**
   * 初始化答题
   * @param {Array} questions - 题目数组
   */
  init(questions) {
    this.questions = questions || [];
    State.resetQuiz();
    console.log(`[QuizEngine] Initialized with ${questions.length} questions`);
  },

  /**
   * 获取当前题目
   * @returns {Object|null}
   */
  getCurrentQuestion() {
    const index = State.get('quiz.currentIndex', 0);
    return this.questions[index] || null;
  },

  /**
   * 获取当前进度
   * @returns {Object}
   */
  getProgress() {
    const current = State.get('quiz.currentIndex', 0);
    const total = this.questions.length;
    return {
      current: current + 1,
      total,
      percentage: total > 0 ? Math.round((current / total) * 100) : 0
    };
  },

  /**
   * 选择答案
   * @param {number} optionIndex - 选项索引（0-3）
 * @param {Function} onComplete - 答题完成时的回调
   * @returns {boolean} 是否进入下一题
   */
  selectAnswer(optionIndex, onComplete) {
    const currentIndex = State.get('quiz.currentIndex', 0);
    const question = this.questions[currentIndex];

    if (!question) return false;

    // 保存答案到历史（用于返回）
    const history = State.get('quiz.history', []);
    history.push({
      questionIndex: currentIndex,
      optionIndex,
      questionId: question.id
    });

    // 更新答案数组
    const answers = State.get('quiz.answers', []);
    answers[currentIndex] = optionIndex;

    State.set({
      'quiz.answers': answers,
      'quiz.history': history
    });

    console.log(`[QuizEngine] Selected answer ${optionIndex} for question ${currentIndex + 1}`);

    // 检查是否完成
    if (currentIndex >= this.questions.length - 1) {
      // 答题完成
      setTimeout(() => {
        if (typeof onComplete === 'function') {
          onComplete(answers);
        }
      }, 300);
      return true;
    }

    // 进入下一题
    setTimeout(() => {
      State.set({ 'quiz.currentIndex': currentIndex + 1 });
      this._renderQuestion();
    }, 300);

    return true;
  },

  /**
   * 返回上一题
   * @returns {boolean} 是否成功返回
   */
  goBack() {
    const currentIndex = State.get('quiz.currentIndex', 0);

    if (currentIndex <= 0) {
      // 已经是第一题，返回上一页
      return false;
    }

    // 移除最后一个历史记录
    const history = State.get('quiz.history', []);
    history.pop();

    // 返回到上一题
    State.set({
      'quiz.currentIndex': currentIndex - 1,
      'quiz.history': history
    });

    this._renderQuestion();
    return true;
  },

  /**
   * 渲染当前题目
   * @private
   */
  _renderQuestion() {
    const question = this.getCurrentQuestion();
    const progress = this.getProgress();
    const answers = State.get('quiz.answers', []);
    const currentAnswer = answers[progress.current - 1];

    // 触发渲染事件
    const event = new CustomEvent('quiz:render', {
      detail: { question, progress, currentAnswer }
    });
    document.dispatchEvent(event);
  },

  /**
   * 获取所有答案
   * @returns {Array}
   */
  getAnswers() {
    return State.get('quiz.answers', []);
  },

  /**
   * 检查是否可以返回
   * @returns {boolean}
   */
  canGoBack() {
    const currentIndex = State.get('quiz.currentIndex', 0);
    return currentIndex > 0;
  },

  /**
   * 重新开始答题
   */
  restart() {
    State.resetQuiz();
    this._renderQuestion();
  }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuizEngine;
}
