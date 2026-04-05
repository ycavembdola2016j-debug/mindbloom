/**
 * MindBloom V12 - 主应用模块
 * 应用入口，事件绑定，流程控制
 */

const App = {
  /**
   * 初始化应用
   */
  init() {
    this._bindCodeInputs();
    this._checkUrlParams();
  },

  /**
   * 绑定体验码输入框事件
   */
  _bindCodeInputs() {
    const inputs = document.querySelectorAll('.code-input');
    
    inputs.forEach((input, index) => {
      // 输入事件
      input.addEventListener('input', (e) => {
        const value = e.target.value;
        
        // 只允许数字
        if (!/^\d*$/.test(value)) {
          e.target.value = value.replace(/\D/g, '');
          return;
        }
        
        // 自动跳转到下一个输入框
        if (value && index < inputs.length - 1) {
          inputs[index + 1].focus();
        }
        
        // 检查是否全部输入完成
        this._checkCodeComplete();
      });
      
      // 键盘事件
      input.addEventListener('keydown', (e) => {
        // 回车键提交
        if (e.key === 'Enter') {
          this.verifyCode();
          return;
        }
        
        // 删除键返回上一个
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
          inputs[index - 1].focus();
        }
        
        // 左右箭头切换
        if (e.key === 'ArrowLeft' && index > 0) {
          inputs[index - 1].focus();
        }
        if (e.key === 'ArrowRight' && index < inputs.length - 1) {
          inputs[index + 1].focus();
        }
      });
      
      // 粘贴事件
      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
        
        pastedData.split('').forEach((digit, i) => {
          if (inputs[i]) {
            inputs[i].value = digit;
          }
        });
        
        // 聚焦到最后一个输入的框或提交
        const lastIndex = Math.min(pastedData.length, inputs.length - 1);
        inputs[lastIndex].focus();
        
        // 检查是否完成
        if (pastedData.length >= 4) {
          setTimeout(() => this.verifyCode(), 100);
        }
      });
    });
  },

  /**
   * 检查体验码是否输入完成
   */
  _checkCodeComplete() {
    const inputs = document.querySelectorAll('.code-input');
    const code = Array.from(inputs).map(input => input.value).join('');
    
    if (code.length === 4) {
      // 可以自动提交，或者等待用户点击按钮
      // this.verifyCode();
    }
  },

  /**
   * 检查URL参数
   */
  _checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const product = urlParams.get('product');
    
    if (code) {
      // 有体验码参数，自动处理
      setTimeout(() => {
        this._handleUrlCode(code, product);
      }, 500);
    }
  },

  /**
   * 处理URL中的体验码
   */
  _handleUrlCode(code, product) {
    // 清理体验码
    code = code.replace(/\D/g, '').slice(0, 4);
    
    if (code.length !== 4) {
      UI.showToast('体验码格式不正确', 'error');
      return;
    }

    // 验证体验码
    const validation = CodeManager.validateCode(code);
    
    if (!validation.valid) {
      UI.showToast(validation.message, 'error');
      return;
    }

    const codeData = validation.data;
    
    // 设置产品类型
    if (product && ['basic', 'advanced'].includes(product)) {
      State.setProduct(product);
    } else if (codeData) {
      State.setProduct(codeData.product);
    }
    
    State.setCode(code);

    // 根据状态处理
    switch (validation.status) {
      case 'first_use':
        // 首次使用
        Router.navigate('code');
        // 填充体验码
        this._fillCodeInputs(code);
        break;
        
      case 'has_result':
        // 有结果，直接显示
        State.setResult(codeData.result);
        State.setUserInfo(codeData.userInfo || {});
        Router.navigate('result');
        UI.showToast('欢迎回来，为你展示上次的结果');
        break;
        
      case 'in_progress':
        // 答题中，继续答题
        State.setUserInfo(codeData.userInfo || {});
        QuizEngine.init(State.get().product);
        State.current.quiz.answers = codeData.answers;
        State.current.quiz.questions = codeData.questions || [];
        // 找到第一个未答的题
        const firstUnanswered = codeData.answers.findIndex(a => a === null);
        State.setCurrentIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
        Router.navigate('quiz');
        UI.showToast('欢迎回来，继续你的探索');
        break;
        
      case 'active_no_progress':
        // 已激活但没有进度，进入信息填写页
        State.setUserInfo(codeData.userInfo || {});
        Router.navigate('info');
        break;
        
      default:
        Router.navigate('code');
        this._fillCodeInputs(code);
    }
  },

  /**
   * 填充体验码输入框
   */
  _fillCodeInputs(code) {
    const inputs = document.querySelectorAll('.code-input');
    const digits = code.split('');
    inputs.forEach((input, index) => {
      if (digits[index]) {
        input.value = digits[index];
      }
    });
  },

  /**
   * 选择产品
   * @param {string} product - 产品类型 'basic' | 'advanced'
   */
  selectProduct(product) {
    State.setProduct(product);
    Router.navigate('code');
  },

  /**
   * 验证体验码
   */
  verifyCode() {
    const inputs = document.querySelectorAll('.code-input');
    const code = Array.from(inputs).map(input => input.value).join('');
    
    if (code.length !== 4) {
      UI.showToast('请输入完整的4位体验码', 'error');
      return;
    }

    const validation = CodeManager.validateCode(code);
    
    if (!validation.valid) {
      UI.showToast(validation.message, 'error');
      return;
    }

    State.setCode(code);
    const codeData = validation.data;

    // 根据状态处理
    switch (validation.status) {
      case 'first_use':
        // 首次使用，进入信息填写页
        Router.navigate('info');
        break;
        
      case 'has_result':
        // 有结果，直接显示
        State.setResult(codeData.result);
        State.setUserInfo(codeData.userInfo || {});
        Router.navigate('result');
        UI.showToast('欢迎回来，为你展示上次的结果');
        break;
        
      case 'in_progress':
        // 答题中，继续答题
        State.setUserInfo(codeData.userInfo || {});
        QuizEngine.init(State.get().product);
        State.current.quiz.answers = codeData.answers;
        State.current.quiz.questions = codeData.questions || [];
        const firstUnanswered = codeData.answers.findIndex(a => a === null);
        State.setCurrentIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
        Router.navigate('quiz');
        UI.showToast('欢迎回来，继续你的探索');
        break;
        
      case 'active_no_progress':
        // 已激活但没有进度
        State.setUserInfo(codeData.userInfo || {});
        Router.navigate('info');
        break;
        
      default:
        UI.showToast('体验码状态异常', 'error');
    }
  },

  /**
   * 开始测评
   */
  startQuiz() {
    const nickname = document.getElementById('nickname').value.trim();
    const gender = document.querySelector('input[name="gender"]:checked')?.value;
    const ageRange = document.querySelector('input[name="age"]:checked')?.value;
    
    // 验证
    if (!nickname) {
      UI.showToast('请输入昵称', 'error');
      return;
    }
    if (!gender) {
      UI.showToast('请选择性别', 'error');
      return;
    }
    if (!ageRange) {
      UI.showToast('请选择年龄段', 'error');
      return;
    }

    // 保存用户信息
    const userInfo = { nickname, gender, ageRange };
    State.setUserInfo(userInfo);

    // 激活体验码
    const code = State.get().code;
    if (code) {
      const codeData = Storage.getCode(code);
      if (codeData && codeData.status === 'unused') {
        CodeManager.activateCode(code, userInfo);
      }
    }

    // 初始化答题
    QuizEngine.init(State.get().product);
    
    // 跳转到答题页
    Router.navigate('quiz');
  },

  /**
   * 保存明信片
   */
  savePostcard() {
    const canvas = document.querySelector('.postcard-canvas');
    if (canvas) {
      UI.downloadCanvas(canvas, `mindbloom-${State.get().code || 'postcard'}.png`);
    }
  },

  /**
   * 分享结果
   */
  shareResult() {
    const result = State.get().result;
    if (result) {
      UI.share({
        title: `我的心灵类型是${result.type}`,
        text: `${result.flower} - ${result.flowerMeaning}`,
        url: window.location.href
      });
    }
  },

  /**
   * 进入后台管理
   */
  goAdmin() {
    Router.navigate('admin');
  }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
