/**
 * MindBloom V12 - 答题引擎模块
 * 答题逻辑、选项选择、返回上一题
 */

const QuizEngine = {
  /**
   * 初始化答题
   * @param {string} product - 产品类型
   */
  init(product) {
    // 加载对应题库
    const questions = product === 'basic' ? QuestionsBasic : QuestionsAdvanced;
    State.setQuestions(questions);
    
    // 如果有保存的进度，恢复
    const code = State.get().code;
    if (code) {
      const codeData = Storage.getCode(code);
      if (codeData && codeData.answers && codeData.answers.length > 0) {
        State.current.quiz.answers = codeData.answers;
        // 找到第一个未答的题
        const firstUnanswered = codeData.answers.findIndex(a => a === null);
        State.setCurrentIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
      }
    }
  },

  /**
   * 选择选项
   * @param {number} optionIndex - 选项索引
   */
  selectOption(optionIndex) {
    const { quiz, code } = State.get();
    const currentIndex = quiz.currentIndex;
    
    // 保存答案
    State.setAnswer(currentIndex, optionIndex);
    
    // 更新UI
    document.querySelectorAll('.option-item').forEach((el, index) => {
      el.classList.toggle('selected', index === optionIndex);
    });
    
    // 延迟后自动下一题
    setTimeout(() => {
      // 保存进度
      if (code) {
        CodeManager.saveProgress(code, State.get().quiz.answers, quiz.questions);
      }
      
      // 检查是否完成
      if (currentIndex >= quiz.questions.length - 1) {
        // 答题完成，计算结果
        this._completeQuiz();
      } else {
        // 下一题
        State.nextQuestion();
        this._renderQuestion();
      }
    }, 300);
  },

  /**
   * 返回上一题
   */
  goBack() {
    const { quiz } = State.get();
    if (quiz.currentIndex > 0) {
      State.prevQuestion();
      this._renderQuestion();
    } else {
      // 第一题，返回信息填写页
      Router.navigate('info');
    }
  },

  /**
   * 渲染当前题目
   */
  _renderQuestion() {
    const { quiz } = State.get();
    const question = quiz.questions[quiz.currentIndex];
    
    if (!question) return;

    // 更新进度
    const progress = ((quiz.currentIndex + 1) / quiz.questions.length) * 100;
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    if (progressFill) progressFill.style.width = `${progress}%`;
    if (progressText) progressText.textContent = `第 ${quiz.currentIndex + 1}/${quiz.questions.length} 题`;

    // 更新题目
    const questionNumber = document.getElementById('question-number');
    const questionText = document.getElementById('question-text');
    
    if (questionNumber) questionNumber.textContent = `Question ${quiz.currentIndex + 1}`;
    if (questionText) questionText.textContent = question.text;

    // 渲染选项
    const optionsContainer = document.getElementById('options-list');
    if (!optionsContainer) return;
    
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
      const optionEl = document.createElement('div');
      optionEl.className = 'option-item';
      if (quiz.answers[quiz.currentIndex] === index) {
        optionEl.classList.add('selected');
      }
      optionEl.textContent = option;
      optionEl.onclick = () => this.selectOption(index);
      optionsContainer.appendChild(optionEl);
    });
  },

  /**
   * 完成答题，计算结果
   */
  _completeQuiz() {
    const { quiz, product, code, userInfo } = State.get();
    
    // 计算结果
    const result = ResultEngine.calculate(quiz.answers, product);
    
    // 保存结果
    State.setResult(result);
    if (code) {
      CodeManager.saveResult(code, result);
    }
    
    // 跳转到结果页
    Router.navigate('result');
  }
};
