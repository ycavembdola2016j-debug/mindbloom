/**
 * App Module - 应用主控制器
 * 初始化应用，绑定全局事件
 */

const App = {
  // 配置
  config: {
    version: '2.0.0',
    adminPassword: 'mindbloom2026'
  },

  /**
   * 初始化应用
   */
  init() {
    console.log('MindBloom v' + this.config.version + ' initializing...');

    // 初始化 Storage（包括数据迁移）
    if (typeof Storage !== 'undefined' && Storage.init) {
      Storage.init();
    }

    // 检查 URL 参数中的体验码（支持跨设备共享）
    this.checkURLCode();

    // 初始化 UI
    UI.init();

    // 绑定全局事件
    this.bindEvents();

    // 检查是否有未完成的会话
    this.checkSession();

    console.log('MindBloom initialized successfully');
  },

  /**
   * 检查 URL 参数中的体验码
   * 支持通过 ?code=XXXXX 方式分享体验码
   */
  checkURLCode() {
    if (typeof CodeManager === 'undefined') return;
    
    const urlCode = CodeManager.validateFromURL();
    if (!urlCode) return;
    
    const { code, info, isNew } = urlCode;
    const product = info.product;
    const productName = product === 'basic' ? '意识之境' : '心灵花园';
    
    console.log(`[App] 从URL检测到体验码: ${code} (${productName})`);
    
    // 自动选择对应产品
    State.set({ product });
    
    // 如果是新导入的码，显示提示
    if (isNew) {
      setTimeout(() => {
        UI.showToast(`已导入${productName}体验码: ${code}`);
      }, 500);
    }
    
    // 检查是否已使用
    if (info.used) {
      // 检查是否可以重复登录
      if (CodeManager.canRelogin(code)) {
        const lastResult = CodeManager.getLastResult(code);
        if (lastResult) {
          // 有结果记录，直接显示结果页
          State.set({ currentCode: code });
          Result.render(lastResult);
          setTimeout(() => {
            Router.navigate('page-result', { animation: 'fade' });
            UI.showToast('欢迎回来，为您显示上次结果');
          }, 800);
          return;
        } else {
          // 24小时内但没有结果记录（答题中断），提示用户继续答题
          State.set({ currentCode: code });
          setTimeout(() => {
            this.selectProduct(product);
            this.prefillCode(code);
            UI.showToast('欢迎回来，请继续完成测评');
          }, 300);
          return;
        }
      } else {
        // 超过24小时，显示过期提示
        setTimeout(() => {
          this.selectProduct(product);
          this.prefillCode(code);
          setTimeout(() => {
            const errorEl = document.getElementById('verify-error');
            if (errorEl) errorEl.textContent = '此体验码已过期，请重新获取';
          }, 400);
        }, 300);
        return;
      }
    }
    
    // 未使用，进入验证页（码已预填）
    State.set({ currentCode: code });
    
    setTimeout(() => {
      this.selectProduct(product);
      this.prefillCode(code);
    }, 300);
  },

  /**
   * 预填体验码到输入框
   * @param {string} code 体验码
   */
  prefillCode(code) {
    const digits = code.split('');
    for (let i = 0; i < digits.length && i < 5; i++) {
      const input = document.getElementById('d' + (i + 1));
      if (input) {
        input.value = digits[i];
      }
    }
    // 聚焦到最后一个输入框
    setTimeout(() => {
      const d5 = document.getElementById('d5');
      if (d5) d5.focus();
    }, 100);
  },

  /**
   * 绑定全局事件
   */
  bindEvents() {
    // 页面可见性变化（处理切回页面）
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // 页面重新可见时的处理
      }
    });

    // 页面进入事件
    document.addEventListener('page:enter', (e) => {
      console.log('Page entered:', e.detail.page);
    });
  },

  /**
   * 检查是否有未完成的会话
   */
  checkSession() {
    const session = Storage.getSession();
    if (session && session.product && session.answers && session.answers.length > 0) {
      // 有未完成的会话，可以提示用户是否继续
      // 暂不自动恢复，避免干扰
    }
  },

  /**
   * 选择产品
   * @param {string} product 'basic' | 'advanced'
   */
  selectProduct(product) {
    State.set({ product });
    
    // 设置验证页面标题
    const nameEl = document.getElementById('verify-product-name');
    if (nameEl) {
      const name = product === 'basic' ? '意识之境' : '心灵花园';
      const count = product === 'basic' ? 30 : 200;
      nameEl.textContent = `${name} · ${count}题`;
    }

    // 构建体验码输入框
    this.buildCodeInputs(product);
    
    // 清空错误提示
    const errorEl = document.getElementById('verify-error');
    if (errorEl) errorEl.textContent = '';

    Router.navigate('page-verify');
  },

  /**
   * 构建体验码输入框
   * @param {string} product 'basic' | 'advanced'
   */
  buildCodeInputs(product) {
    const wrap = document.getElementById('code-input-wrap');
    if (!wrap) return;

    const prefix = product === 'basic' ? 'B' : 'A';
    wrap.innerHTML = '';

    // 第一个框：字母前缀（只读）
    const d1 = document.createElement('input');
    d1.className = 'code-digit letter';
    d1.id = 'd1';
    d1.maxLength = 1;
    d1.value = prefix;
    d1.readOnly = true;
    d1.style.color = product === 'basic' ? 'var(--sage-light)' : 'var(--rose)';
    wrap.appendChild(d1);

    // 剩余4个框：数字
    for (let i = 2; i <= 5; i++) {
      const d = document.createElement('input');
      d.className = 'code-digit';
      d.id = 'd' + i;
      d.maxLength = 1;
      d.inputMode = 'numeric';
      d.autocomplete = 'off';

      // 键盘输入处理（替代 input 事件，避免重复触发）
      d.addEventListener('keydown', function(e) {
        // 阻止事件冒泡，避免全局监听
        e.stopPropagation();
        
        // 数字键处理
        if (e.key >= '0' && e.key <= '9') {
          e.preventDefault();
          this.value = e.key;
          // 自动跳转到下一格
          if (i < 5) {
            const next = document.getElementById('d' + (i + 1));
            if (next) next.focus();
          }
        }
        // 退格键处理
        else if (e.key === 'Backspace') {
          if (this.value) {
            this.value = '';
          } else if (i > 2) {
            // 当前为空，返回上一格
            const prev = document.getElementById('d' + (i - 1));
            if (prev) {
              prev.focus();
              prev.value = '';
            }
          }
        }
        // 左右方向键
        else if (e.key === 'ArrowLeft' && i > 2) {
          document.getElementById('d' + (i - 1)).focus();
        }
        else if (e.key === 'ArrowRight' && i < 5) {
          document.getElementById('d' + (i + 1)).focus();
        }
      });

      // 防止粘贴多字符
      d.addEventListener('paste', function(e) {
        e.preventDefault();
        const pasteData = (e.clipboardData || window.clipboardData).getData('text');
        const digit = pasteData.replace(/[^0-9]/g, '').charAt(0);
        if (digit) {
          this.value = digit;
          if (i < 5) {
            const next = document.getElementById('d' + (i + 1));
            if (next) next.focus();
          }
        }
      });

      wrap.appendChild(d);
    }

    // 自动聚焦到第一个数字输入框
    setTimeout(() => {
      const d2 = document.getElementById('d2');
      if (d2) d2.focus();
    }, 100);
  },

  /**
   * 验证体验码
   */
  verifyCode() {
    const state = State.get();
    const product = state.product;
    const prefix = product === 'basic' ? 'B' : 'A';

    // 获取输入的码
    const d1 = document.getElementById('d1');
    const d2 = document.getElementById('d2');
    const d3 = document.getElementById('d3');
    const d4 = document.getElementById('d4');
    const d5 = document.getElementById('d5');

    if (!d1 || !d2 || !d3 || !d4 || !d5) return;

    const code = (d1.value + d2.value + d3.value + d4.value + d5.value).toUpperCase();
    const errorEl = document.getElementById('verify-error');

    // 验证完整性
    if (code.length < 5) {
      if (errorEl) errorEl.textContent = '请输入完整的5位体验码';
      return;
    }

    // 验证前缀
    if (!code.startsWith(prefix)) {
      const correctProduct = product === 'basic' ? '意识之境' : '心灵花园';
      if (errorEl) errorEl.textContent = `此码不是${correctProduct}的体验码，请确认`;
      return;
    }

    // 优先使用 CodeManager（支持24小时过期机制）
    if (typeof CodeManager !== 'undefined') {
      const entry = CodeManager.validate(code);
      
      if (!entry) {
        if (errorEl) errorEl.textContent = '体验码无效、不存在或已过期';
        return;
      }

      // 检查是否已使用
      if (entry.used) {
        // 检查是否在24小时内可以重复登录
        const canRelogin = CodeManager.canRelogin(code);
        const lastResult = CodeManager.getLastResult(code);
        
        if (canRelogin && lastResult) {
          // 24小时内且有结果记录，直接跳转到结果页显示上次结果
          State.set({ currentCode: code });
          if (errorEl) errorEl.textContent = '';
          Result.render(lastResult);
          Router.navigate('page-result', { animation: 'fade' });
          UI.showToast('欢迎回来，为您显示上次结果');
          return;
        } else if (canRelogin) {
          // 24小时内但没有结果记录（可能答题中断），允许重新答题
          State.set({ currentCode: code });
          if (errorEl) errorEl.textContent = '';
          // 进入信息填写页重新答题
          Router.navigate('page-profile');
          UI.showToast('欢迎回来，请继续完成测评');
          return;
        }
        // 超过24小时
        if (errorEl) errorEl.textContent = '此体验码已过期，请重新获取';
        return;
      }

      // 验证通过，标记为已用（结果会在答题完成后保存）
      CodeManager.markUsed(code);
    } else {
      // 降级到旧版 Storage
      const codes = Storage.getCodes();
      const entry = codes[code];

      if (!entry) {
        if (errorEl) errorEl.textContent = '体验码无效或不存在';
        return;
      }

      if (entry.used) {
        if (errorEl) errorEl.textContent = '此体验码已被使用';
        return;
      }

      // 验证通过，标记为已用
      entry.used = true;
      entry.usedAt = Date.now();
      Storage.saveCodes(codes);
    }

    // 保存当前码到状态
    State.set({ currentCode: code });

    // 清空错误提示
    if (errorEl) errorEl.textContent = '';

    // 进入信息填写页
    Router.navigate('page-profile');
  },

  /**
   * 选择用户信息字段
   * @param {string} type 字段类型
   * @param {string} value 值
   * @param {HTMLElement} btn 按钮元素
   */
  selectField(type, value, btn) {
    // 更新状态
    const user = { ...State.get().user };
    user[type] = value;
    State.set({ user });

    // 更新 UI
    const row = btn.closest('.field-row');
    if (row) {
      row.querySelectorAll('.field-btn').forEach(b => b.classList.remove('selected'));
    }
    btn.classList.add('selected');
  },

  /**
   * 开始答题
   */
  startQuiz() {
    const state = State.get();
    const nickname = document.getElementById('user-nickname');
    
    // 保存昵称
    if (nickname) {
      const user = { ...state.user };
      user.nickname = nickname.value.trim() || '心灵旅客';
      State.set({ user });
    }

    // 初始化答题
    Quiz.init(state.product);
    
    // 进入答题页
    Router.navigate('page-quiz');
  },

  /**
   * 重新开始
   */
  restart() {
    State.resetAll();
    Router.navigate('page-landing');
  },

  /**
   * 保存结果
   */
  async saveResult() {
    const state = State.get();
    const result = state.lastResult;
    
    if (!result) {
      UI.showToast('没有可保存的结果');
      return;
    }

    // 意识之境：保存 AI 明信片
    if (result.product === 'basic' && typeof AIImage !== 'undefined') {
      try {
        const dataUrl = await AIImage.generatePostcard(result);
        
        // 创建下载链接
        const link = document.createElement('a');
        link.download = `心花明信片_${result.name}_${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
        
        UI.showToast('明信片已保存到相册');
      } catch (err) {
        console.error('Save postcard failed:', err);
        UI.showToast('保存失败，请长按图片手动保存');
      }
    } else {
      // 心灵花园：保存传统结果
      UI.showToast('结果已保存');
    }
  }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// 暴露到全局供 HTML 调用
window.App = App;
window.Quiz = Quiz;
window.UI = UI;
