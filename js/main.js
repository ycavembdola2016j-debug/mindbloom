/**
 * Main - 主应用模块
 * 整合所有模块，处理用户交互
 */

const App = {
  // 题库数据
  questions: {
    basic: [],
    advanced: []
  },

  /**
   * 初始化应用
   */
  init() {
    console.log('[App] Initializing MindBloom V11...');
    
    // 恢复状态
    State.restore();
    
    // 初始化路由
    Router.init();
    
    // 加载题库
    this.loadQuestions();
    
    // 检查 URL 参数
    this.checkURLCode();
    
    console.log('[App] Initialization complete');
  },

  /**
   * 加载题库
   */
  async loadQuestions() {
    try {
      // 加载初级版题库
      const basicRes = await fetch('data/questions-basic.json');
      if (basicRes.ok) {
        const basicData = await basicRes.json();
        this.questions.basic = basicData.questions;
      }
      
      // 高级版题库使用简化版（实际项目中应该有完整题库）
      this.questions.advanced = this.generateAdvancedQuestions();
      
      console.log('[App] Questions loaded:', {
        basic: this.questions.basic.length,
        advanced: this.questions.advanced.length
      });
    } catch (e) {
      console.error('[App] Failed to load questions:', e);
      // 使用内置题库作为后备
      this.questions.basic = this.generateBasicQuestions();
      this.questions.advanced = this.generateAdvancedQuestions();
    }
  },

  /**
   * 生成内置初级题库（后备）
   */
  generateBasicQuestions() {
    const templates = [
      { text: "当你感到压力大时，你通常会？", options: ["找朋友倾诉", "独自安静一会儿", "运动发泄", "大吃一顿"] },
      { text: "你更喜欢哪种周末活动？", options: ["和朋友聚会", "在家看书/看电影", "户外探险", "学习新技能"] },
      { text: "遇到问题时，你的第一反应是？", options: ["寻求他人帮助", "自己独立思考", "先冷静一下", "立即行动解决"] },
      { text: "你认为自己最大的优点是？", options: ["善于交际", "细心体贴", "乐观开朗", "踏实可靠"] },
      { text: "在社交场合中，你通常是？", options: ["活跃气氛的人", "安静倾听的人", "观察者", "组织者"] }
    ];
    
    const questions = [];
    for (let i = 0; i < 30; i++) {
      const template = templates[i % templates.length];
      questions.push({
        id: i + 1,
        text: template.text,
        options: [...template.options]
      });
    }
    return questions;
  },

  /**
   * 生成高级题库（简化版）
   */
  generateAdvancedQuestions() {
    const questions = [];
    for (let i = 0; i < 200; i++) {
      questions.push({
        id: i + 1,
        text: `第${i + 1}题：请根据你的实际情况选择最符合的选项`,
        options: ["非常符合", "比较符合", "一般", "不太符合", "完全不符合"].slice(0, 4)
      });
    }
    return questions;
  },

  /**
   * 检查 URL 中的体验码参数
   */
  checkURLCode() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      console.log('[App] URL code detected:', code);
      const info = CodeManager.validate(code);
      
      if (info && info.valid) {
        const product = info.type === 'basic' ? 'basic' : 'advanced';
        State.set({ product, currentCode: code });
        
        // 检查是否可以重复登录
        if (info.used) {
          if (CodeManager.canRelogin(code)) {
            const lastResult = CodeManager.getLastResult(code);
            if (lastResult) {
              // 直接显示结果
              setTimeout(() => {
                ResultEngine.render = ResultEngine.render || this.renderResult.bind(this);
                this.renderResult(lastResult);
                Router.navigate('result', { animation: 'fade' });
                this.showToast('欢迎回来，为您显示上次结果');
              }, 500);
              return;
            } else {
              // 继续答题
              setTimeout(() => {
                this.selectProduct(product);
                this.prefillCode(code);
                this.showToast('欢迎回来，请继续完成测评');
              }, 300);
              return;
            }
          }
        }
        
        // 首次使用
        setTimeout(() => {
          this.selectProduct(product);
          this.prefillCode(code);
        }, 300);
      }
    }
  },

  /**
   * 选择产品
   */
  selectProduct(product) {
    console.log('[App] Product selected:', product);
    State.set({ product });
    
    // 更新验证页显示
    const isBasic = product === 'basic';
    document.getElementById('verify-icon').textContent = isBasic ? '🌻' : '🌺';
    document.getElementById('verify-product-name').textContent = isBasic ? '意识之境' : '心灵花园';
    
    Router.navigate('verify', { animation: 'slide' });
  },

  /**
   * 预填体验码
   */
  prefillCode(code) {
    const input = document.getElementById('code-input');
    if (input && code) {
      input.value = code;
    }
  },

  /**
   * 验证体验码
   */
  verifyCode() {
    const input = document.getElementById('code-input');
    const errorEl = document.getElementById('verify-error');
    const code = input.value.trim().toUpperCase();
    
    if (!code) {
      if (errorEl) errorEl.textContent = '请输入体验码';
      return;
    }
    
    const info = CodeManager.validate(code);
    
    if (!info || !info.valid) {
      if (errorEl) errorEl.textContent = '体验码无效或已过期';
      return;
    }
    
    // 检查产品类型是否匹配
    const selectedProduct = State.get('product');
    if (info.type !== selectedProduct) {
      if (errorEl) {
        const expected = selectedProduct === 'basic' ? 'B' : 'A';
        errorEl.textContent = `请使用${expected}开头的体验码`;
      }
      return;
    }
    
    // 检查是否已使用
    if (info.used) {
      if (CodeManager.canRelogin(code)) {
        const lastResult = CodeManager.getLastResult(code);
        if (lastResult) {
          // 直接显示结果
          State.set({ currentCode: code });
          this.renderResult(lastResult);
          Router.navigate('result', { animation: 'fade' });
          this.showToast('欢迎回来，为您显示上次结果');
          return;
        } else {
          // 继续答题
          State.set({ currentCode: code });
          if (errorEl) errorEl.textContent = '';
          Router.navigate('profile', { animation: 'slide' });
          this.showToast('欢迎回来，请继续完成测评');
          return;
        }
      } else {
        if (errorEl) errorEl.textContent = '此体验码已过期，请重新获取';
        return;
      }
    }
    
    // 首次使用，标记为已用
    CodeManager.markUsed(code);
    State.set({ currentCode: code });
    
    if (errorEl) errorEl.textContent = '';
    Router.navigate('profile', { animation: 'slide' });
  },

  /**
   * 选择性别
   */
  selectGender(gender) {
    State.set({ 'user.gender': gender });
    
    // 更新 UI
    document.querySelectorAll('.gender-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.value === gender);
    });
  },

  /**
   * 开始答题
   */
  startQuiz() {
    const nickname = document.getElementById('profile-nickname').value.trim();
    const age = document.getElementById('profile-age').value;
    const gender = State.get('user.gender');
    
    if (!nickname) {
      this.showToast('请输入昵称');
      return;
    }
    if (!gender) {
      this.showToast('请选择性别');
      return;
    }
    if (!age) {
      this.showToast('请选择年龄段');
      return;
    }
    
    // 保存用户信息
    State.set({
      'user.nickname': nickname,
      'user.age': age
    });
    
    // 初始化答题引擎
    const product = State.get('product');
    const questions = this.questions[product] || [];
    QuizEngine.init(questions);
    
    // 渲染第一题
    this.renderQuestion();
    
    Router.navigate('quiz', { animation: 'slide' });
  },

  /**
   * 渲染当前题目
   */
  renderQuestion() {
    const question = QuizEngine.getCurrentQuestion();
    const progress = QuizEngine.getProgress();
    const answers = QuizEngine.getAnswers();
    const currentAnswer = answers[progress.current - 1];
    
    if (!question) return;
    
    // 更新进度
    document.getElementById('quiz-current').textContent = progress.current;
    document.getElementById('quiz-total').textContent = progress.total;
    document.getElementById('quiz-progress-fill').style.width = `${progress.percentage}%`;
    
    // 更新返回按钮
    const backBtn = document.getElementById('quiz-back-btn');
    if (backBtn) {
      backBtn.style.visibility = progress.current > 1 ? 'visible' : 'hidden';
    }
    
    // 更新题目
    document.getElementById('question-text').textContent = question.text;
    
    // 渲染选项
    const optionsList = document.getElementById('options-list');
    optionsList.innerHTML = question.options.map((option, index) => `
      <button 
        class="option-btn ${currentAnswer === index ? 'selected' : ''}" 
        onclick="App.selectAnswer(${index})"
      >
        <span class="option-label">${String.fromCharCode(65 + index)}</span>
        <span class="option-text">${option}</span>
      </button>
    `).join('');
  },

  /**
   * 选择答案
   */
  selectAnswer(optionIndex) {
    // 更新选中状态
    document.querySelectorAll('.option-btn').forEach((btn, idx) => {
      btn.classList.toggle('selected', idx === optionIndex);
    });
    
    // 提交答案
    QuizEngine.selectAnswer(optionIndex, (answers) => {
      this.completeQuiz(answers);
    });
    
    // 延迟后渲染下一题
    setTimeout(() => {
      this.renderQuestion();
    }, 300);
  },

  /**
   * 返回上一题
   */
  goBackInQuiz() {
    if (!QuizEngine.goBack()) {
      // 已经是第一题，返回验证页
      Router.navigate('profile', { animation: 'slide' });
    } else {
      this.renderQuestion();
    }
  },

  /**
   * 完成答题
   */
  completeQuiz(answers) {
    console.log('[App] Quiz completed');
    
    const product = State.get('product');
    const userInfo = State.get('user');
    
    // 计算结果
    const result = ResultEngine.calculate(product, answers, userInfo);
    
    // 保存结果
    const code = State.get('currentCode');
    if (code) {
      CodeManager.saveResult(code, result);
    }
    
    // 添加记录
    Storage.addRecord({
      code,
      type: product,
      nickname: userInfo.nickname,
      gender: userInfo.gender,
      age: userInfo.age,
      answers,
      result,
      completedAt: Date.now()
    });
    
    // 渲染结果
    this.renderResult(result);
    
    // 跳转到结果页
    Router.navigate('result', { animation: 'fade' });
  },

  /**
   * 渲染结果页
   */
  renderResult(result) {
    // 更新结果信息
    document.getElementById('result-emoji').textContent = result.emoji || '🌸';
    document.getElementById('result-name').textContent = result.name || '未知类型';
    document.getElementById('result-subtitle').textContent = `${result.productName || ''} · ${result.subtitle || ''}`;
    
    // 根据产品类型显示不同内容
    if (result.product === 'basic') {
      this.renderBasicResult(result);
    } else {
      this.renderAdvancedResult(result);
    }
    
    // 渲染洞察卡片
    const insightsEl = document.getElementById('insight-cards');
    if (insightsEl && result.insights) {
      insightsEl.innerHTML = result.insights.map(insight => `
        <div class="insight-card">
          <h4>${insight.title}</h4>
          <p>${insight.text}</p>
        </div>
      `).join('');
    }
  },

  /**
   * 渲染初级版结果（AI明信片）
   */
  async renderBasicResult(result) {
    const aiSection = document.getElementById('ai-postcard-section');
    const loadingEl = document.getElementById('postcard-loading');
    const containerEl = document.getElementById('postcard-container');
    const imageEl = document.getElementById('postcard-image');
    const descEl = document.getElementById('postcard-desc');
    
    if (aiSection) aiSection.style.display = 'block';
    if (loadingEl) loadingEl.style.display = 'block';
    if (containerEl) containerEl.style.display = 'none';
    
    // 更新按钮文字
    const saveBtn = document.getElementById('btn-save-result');
    if (saveBtn) saveBtn.textContent = '保存明信片';
    
    try {
      // 生成明信片
      const dataUrl = await AIPostcard.generate(result);
      
      if (imageEl) {
        imageEl.src = dataUrl;
        imageEl.onload = () => {
          if (loadingEl) loadingEl.style.display = 'none';
          if (containerEl) containerEl.style.display = 'block';
        };
      }
      
      if (descEl && result.flowerLanguage) {
        descEl.textContent = result.flowerLanguage;
      }
    } catch (e) {
      console.error('[App] Failed to generate postcard:', e);
      if (loadingEl) {
        loadingEl.innerHTML = '<p>明信片生成失败，请刷新重试</p>';
      }
    }
  },

  /**
   * 渲染高级版结果
   */
  renderAdvancedResult(result) {
    // 隐藏 AI 明信片区域
    const aiSection = document.getElementById('ai-postcard-section');
    if (aiSection) aiSection.style.display = 'none';
    
    // 更新按钮文字
    const saveBtn = document.getElementById('btn-save-result');
    if (saveBtn) saveBtn.textContent = '保存报告';
    
    // 可以在这里添加雷达图等高级功能
  },

  /**
   * 保存结果
   */
  saveResult() {
    const product = State.get('product');
    
    if (product === 'basic') {
      const imageEl = document.getElementById('postcard-image');
      if (imageEl && imageEl.src) {
        AIPostcard.download(imageEl.src, `mindbloom-postcard-${Date.now()}.png`);
        this.showToast('明信片已保存');
      }
    } else {
      this.showToast('报告已保存');
    }
  },

  /**
   * 返回首页
   */
  goHome() {
    State.resetUser();
    Router.navigate('home', { animation: 'fade' });
  },

  // ============ 后台管理 ============

  /**
   * 进入后台登录
   */
  goToAdminLogin() {
    // 检查是否已登录
    if (Storage.isAdminLoggedIn()) {
      this.enterAdmin();
    } else {
      Router.navigate('admin-login', { animation: 'slide' });
    }
  },

  /**
   * 登录后台
   */
  loginAdmin() {
    const password = document.getElementById('admin-password').value;
    const errorEl = document.getElementById('admin-error');
    
    if (password === 'mindbloom2026') {
      Storage.setAdminLogin(true);
      this.enterAdmin();
    } else {
      if (errorEl) errorEl.textContent = '密码错误';
    }
  },

  /**
   * 进入后台
   */
  enterAdmin() {
    this.updateAdminStats();
    this.updateRecordsList();
    Router.navigate('admin', { animation: 'slide' });
  },

  /**
   * 退出后台
   */
  logoutAdmin() {
    Storage.setAdminLogin(false);
    Router.navigate('home', { animation: 'fade' });
  },

  /**
   * 更新后台统计
   */
  updateAdminStats() {
    const stats = CodeManager.getStats();
    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-basic').textContent = stats.basic.used;
    document.getElementById('stat-advanced').textContent = stats.advanced.used;
  },

  /**
   * 更新记录列表
   */
  updateRecordsList() {
    const records = CodeManager.getRecentRecords(20);
    const listEl = document.getElementById('records-list');
    
    if (records.length === 0) {
      listEl.innerHTML = '<p class="no-records">暂无记录</p>';
      return;
    }
    
    listEl.innerHTML = records.map(r => `
      <div class="record-item">
        <span class="record-code">${r.code}</span>
        <span class="record-type">${r.type === 'basic' ? '初级' : '高级'}</span>
        <span class="record-name">${r.nickname}</span>
        <span class="record-time">${new Date(r.completedAt).toLocaleDateString()}</span>
      </div>
    `).join('');
  },

  /**
   * 生成体验码
   */
  generateCodes() {
    const product = document.getElementById('gen-product').value;
    const count = parseInt(document.getElementById('gen-count').value);
    
    const codes = CodeManager.generate(product, count);
    
    const container = document.getElementById('generated-codes');
    container.innerHTML = `
      <div class="codes-list">
        ${codes.map(code => `<span class="code-tag">${code}</span>`).join('')}
      </div>
      <button class="btn-text" onclick="App.copyCodes('${codes.join(',')}')">复制全部</button>
    `;
    
    this.updateAdminStats();
  },

  /**
   * 复制体验码
   */
  copyCodes(codes) {
    navigator.clipboard.writeText(codes.replace(/,/g, '\n')).then(() => {
      this.showToast('已复制到剪贴板');
    });
  },

  /**
   * 显示 Toast 提示
   */
  showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
};

// 监听答题渲染事件
document.addEventListener('quiz:render', (e) => {
  App.renderQuestion();
});

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
