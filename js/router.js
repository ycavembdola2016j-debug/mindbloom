/**
 * MindBloom V12 - 路由模块
 * 页面切换、动画过渡、历史管理
 */

const Router = {
  // 页面历史
  history: ['home'],

  /**
   * 导航到指定页面
   * @param {string} page - 页面名称
   * @param {boolean} addToHistory - 是否添加到历史记录
   */
  navigate(page, addToHistory = true) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(el => {
      el.classList.remove('active');
    });

    // 显示目标页面
    const targetPage = document.getElementById(`page-${page}`);
    if (targetPage) {
      targetPage.classList.add('active');
      
      // 滚动到顶部
      window.scrollTo(0, 0);
      
      // 更新状态
      State.setPage(page);
      
      // 添加到历史
      if (addToHistory) {
        this.history.push(page);
      }
      
      // 触发页面显示事件
      this._onPageShow(page);
    } else {
      console.error(`Page not found: ${page}`);
    }
  },

  /**
   * 返回上一页
   * @returns {boolean} 是否成功返回
   */
  back() {
    if (this.history.length > 1) {
      this.history.pop(); // 移除当前页
      const prevPage = this.history[this.history.length - 1];
      this.navigate(prevPage, false);
      return true;
    }
    return false;
  },

  /**
   * 返回首页
   */
  goHome() {
    this.history = ['home'];
    this.navigate('home', false);
  },

  /**
   * 获取当前页面
   * @returns {string} 当前页面名称
   */
  getCurrentPage() {
    return State.get().page;
  },

  /**
   * 页面显示时的处理
   * @param {string} page - 页面名称
   */
  _onPageShow(page) {
    // 根据页面执行特定逻辑
    switch (page) {
      case 'home':
        this._initHomePage();
        break;
      case 'code':
        this._initCodePage();
        break;
      case 'info':
        this._initInfoPage();
        break;
      case 'quiz':
        this._initQuizPage();
        break;
      case 'result':
        this._initResultPage();
        break;
      case 'admin':
        this._initAdminPage();
        break;
    }
  },

  /**
   * 初始化首页
   */
  _initHomePage() {
    // 重置状态
    State.resetAll();
    
    // 检查URL参数
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const product = urlParams.get('product');
    
    if (code) {
      // 有体验码参数，自动进入验证流程
      setTimeout(() => {
        this._handleUrlCode(code, product);
      }, 500);
    }
  },

  /**
   * 处理URL中的体验码
   * @param {string} code - 体验码
   * @param {string} product - 产品类型
   */
  _handleUrlCode(code, product) {
    // 验证体验码
    const codeData = Storage.getCode(code);
    
    if (!codeData) {
      // 体验码不存在，但允许继续（可能是新码）
      if (product) {
        State.setProduct(product);
      }
      State.setCode(code);
      this.navigate('code');
      return;
    }

    // 检查是否过期
    if (codeData.expiresAt && codeData.expiresAt < Date.now()) {
      UI.showToast('体验码已过期，请联系店主获取新码', 'error');
      return;
    }

    // 设置产品类型
    State.setProduct(codeData.product);
    State.setCode(code);

    // 检查是否已有结果
    if (codeData.result && codeData.status === 'active') {
      // 有结果，直接显示
      State.setResult(codeData.result);
      State.setUserInfo(codeData.userInfo || {});
      this.navigate('result');
      UI.showToast('欢迎回来，为你展示上次的结果');
    } else if (codeData.status === 'active' && codeData.answers && codeData.answers.some(a => a !== null)) {
      // 答题中，继续答题
      State.setUserInfo(codeData.userInfo || {});
      State.setQuestions(codeData.questions || []);
      State.current.quiz.answers = codeData.answers;
      // 找到第一个未答的题
      const firstUnanswered = codeData.answers.findIndex(a => a === null);
      State.setCurrentIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
      this.navigate('quiz');
      UI.showToast('欢迎回来，继续你的探索');
    } else {
      // 首次使用
      this.navigate('code');
    }
  },

  /**
   * 初始化体验码页面
   */
  _initCodePage() {
    const product = State.get().product;
    if (!product) {
      this.goHome();
      return;
    }

    // 更新页面显示
    const productData = CONFIG.products[product];
    document.getElementById('code-product-icon').textContent = productData.icon;
    document.getElementById('code-product-name').textContent = productData.name;
    document.getElementById('code-product-subtitle').textContent = productData.subtitle;

    // 清空输入框
    document.querySelectorAll('.code-input').forEach(input => {
      input.value = '';
    });
    document.querySelector('.code-input')?.focus();

    // 如果有预设的体验码，填充
    const presetCode = State.get().code;
    if (presetCode) {
      const digits = presetCode.split('');
      document.querySelectorAll('.code-input').forEach((input, index) => {
        if (digits[index]) {
          input.value = digits[index];
        }
      });
    }
  },

  /**
   * 初始化信息填写页面
   */
  _initInfoPage() {
    // 重置表单
    document.getElementById('nickname').value = '';
    document.querySelectorAll('input[name="gender"]').forEach(el => el.checked = false);
    document.querySelectorAll('input[name="age"]').forEach(el => el.checked = false);
  },

  /**
   * 初始化答题页面
   */
  _initQuizPage() {
    const quiz = State.get().quiz;
    if (quiz.questions.length === 0) {
      // 加载题目
      const questions = product === 'basic' ? QuestionsBasic : QuestionsAdvanced;
      State.setQuestions(questions);
    }
    this._renderQuestion();
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
    document.getElementById('progress-fill').style.width = `${progress}%`;
    document.getElementById('progress-text').textContent = `第 ${quiz.currentIndex + 1}/${quiz.questions.length} 题`;

    // 更新题目
    document.getElementById('question-number').textContent = `Question ${quiz.currentIndex + 1}`;
    document.getElementById('question-text').textContent = question.text;

    // 渲染选项
    const optionsContainer = document.getElementById('options-list');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
      const optionEl = document.createElement('div');
      optionEl.className = 'option-item';
      if (quiz.answers[quiz.currentIndex] === index) {
        optionEl.classList.add('selected');
      }
      optionEl.textContent = option;
      optionEl.onclick = () => QuizEngine.selectOption(index);
      optionsContainer.appendChild(optionEl);
    });
  },

  /**
   * 初始化结果页面
   */
  _initResultPage() {
    const { product, result, userInfo } = State.get();
    
    if (!result) {
      this.goHome();
      return;
    }

    if (product === 'basic') {
      // 意识之境 - 显示AI明信片
      this._renderBasicResult(result, userInfo);
    } else {
      // 心灵花园 - 显示详细报告
      this._renderAdvancedResult(result, userInfo);
    }
  },

  /**
   * 渲染初级版结果
   */
  _renderBasicResult(result, userInfo) {
    document.getElementById('result-emoji').textContent = result.emoji;
    document.getElementById('result-type').textContent = result.type;
    document.getElementById('result-subtitle').textContent = `你的心灵花语：${result.flower}`;

    // 生成AI明信片
    AIPostcard.generate(result, userInfo).then(canvas => {
      const container = document.getElementById('postcard-container');
      container.innerHTML = '';
      canvas.className = 'postcard-canvas';
      container.appendChild(canvas);
    });

    // 渲染洞察
    const insightsContainer = document.getElementById('insights-list');
    insightsContainer.innerHTML = '';
    result.insights.forEach(insight => {
      const card = document.createElement('div');
      card.className = 'insight-card';
      card.innerHTML = `<div class="insight-text">${insight}</div>`;
      insightsContainer.appendChild(card);
    });
  },

  /**
   * 渲染高级版结果
   */
  _renderAdvancedResult(result, userInfo) {
    // TODO: 实现高级版结果展示
    document.getElementById('result-emoji').textContent = result.emoji || '🔮';
    document.getElementById('result-type').textContent = result.type || '你的心灵画像';
    document.getElementById('result-subtitle').textContent = '详细报告功能开发中...';
  },

  /**
   * 初始化后台管理页面
   */
  _initAdminPage() {
    Admin.init();
  }
};
