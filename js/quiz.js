/**
 * Quiz Module - 答题逻辑
 * 处理题目渲染、答案记录、导航
 */

const Quiz = {
  // 当前题目列表
  questions: [],

  /**
   * 初始化答题
   * @param {string} product 'basic' | 'advanced'
   */
  init(product) {
    this.questions = Questions.get(product);
    State.resetQuiz();
    State.set({ product });
    this.render();
  },

  /**
   * 渲染当前题目
   */
  render() {
    const state = State.get();
    const { quiz, product } = state;
    const currentQ = this.questions[quiz.currentIndex];
    const total = this.questions.length;

    // 更新进度
    this.updateProgress(quiz.currentIndex + 1, total);

    // 渲染题目卡片
    const card = document.getElementById('question-card');
    if (!card) return;

    // 分类标签
    const categoryEl = document.getElementById('q-category');
    if (categoryEl) {
      categoryEl.textContent = currentQ.category || '';
    }

    // 题目文本
    const textEl = document.getElementById('q-text');
    if (textEl) {
      textEl.textContent = currentQ.text;
    }

    // 渲染选项
    const optionsEl = document.getElementById('q-options');
    if (optionsEl) {
      optionsEl.innerHTML = '';
      
      currentQ.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        
        // 检查是否是已选答案
        const isSelected = quiz.answers[quiz.currentIndex] === idx;
        if (isSelected) {
          btn.classList.add('selected');
        }
        
        btn.innerHTML = `
          <div class="option-dot">${isSelected ? '✓' : '○'}</div>
          <span>${opt}</span>
        `;
        
        btn.onclick = () => this.selectOption(idx);
        optionsEl.appendChild(btn);
      });
    }

    // 更新返回按钮状态
    this.updatePrevButton(quiz.history.length > 0);

    // 触发进入动画
    card.style.animation = 'none';
    card.offsetHeight; // 强制重绘
    card.style.animation = 'softSlideUp 0.35s ease';
  },

  /**
   * 更新进度显示
   */
  updateProgress(current, total) {
    const textEl = document.getElementById('quiz-progress-text');
    const barEl = document.getElementById('quiz-progress-bar');
    
    if (textEl) {
      textEl.textContent = `${current}/${total}`;
    }
    
    if (barEl) {
      const percent = (current / total) * 100;
      barEl.style.width = `${percent}%`;
    }
  },

  /**
   * 更新返回按钮状态
   */
  updatePrevButton(enabled) {
    const btn = document.getElementById('quiz-prev-btn');
    if (btn) {
      if (enabled) {
        btn.classList.remove('disabled');
      } else {
        btn.classList.add('disabled');
      }
    }
  },

  /**
   * 选择选项
   * @param {number} optionIndex 选项索引
   */
  selectOption(optionIndex) {
    const state = State.get();
    const { quiz } = state;
    
    // 记录答案
    State.recordAnswer(quiz.currentIndex, optionIndex);
    
    // 更新 UI 显示选中状态
    const optionsEl = document.getElementById('q-options');
    if (optionsEl) {
      const btns = optionsEl.querySelectorAll('.option-btn');
      btns.forEach((btn, idx) => {
        if (idx === optionIndex) {
          btn.classList.add('selected');
          btn.querySelector('.option-dot').textContent = '✓';
        } else {
          btn.classList.remove('selected');
          btn.querySelector('.option-dot').textContent = '○';
        }
      });
    }

    // 延迟后自动进入下一题
    setTimeout(() => {
      this.next();
    }, 400);
  },

  /**
   * 进入下一题
   */
  next() {
    const state = State.get();
    const { quiz } = state;
    const total = this.questions.length;

    if (quiz.currentIndex < total - 1) {
      State.nextQuestion();
      this.render();
    } else {
      // 答题完成，显示结果
      this.complete();
    }
  },

  /**
   * 返回上一题
   */
  prev() {
    const success = State.prevQuestion();
    if (success) {
      this.render();
    }
  },

  /**
   * 答题完成
   */
  complete() {
    const state = State.get();
    const { product, user, currentCode } = state;
    
    // 保存记录
    Storage.addRecord({
      product,
      nickname: user.nickname || '匿名',
      gender: user.gender,
      age: user.age,
      time: Date.now(),
      answers: state.quiz.answers
    });

    // 计算并显示结果
    const result = Result.calculate(product, this.questions, state.quiz.answers);
    Result.render(result);
    
    // 如果有体验码，保存结果到 CodeManager（支持24小时内重复登录查看）
    if (currentCode && typeof CodeManager !== 'undefined') {
      CodeManager.markUsed(currentCode, result);
    }
    
    // 跳转到结果页
    Router.navigate('page-result', { animation: 'fade' });
  }
};
