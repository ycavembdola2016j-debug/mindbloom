/**
 * MindBloom V12 - 后台管理模块
 * 后台登录、体验码生成、数据统计
 */

const Admin = {
  isLoggedIn: false,

  /**
   * 初始化后台管理
   */
  init() {
    // 检查登录状态
    const session = Storage.getSession();
    if (session.adminLoggedIn) {
      // 检查是否过期（24小时）
      if (session.adminLoggedInAt && Date.now() - session.adminLoggedInAt < 24 * 60 * 60 * 1000) {
        this.isLoggedIn = true;
        this._showAdminPanel();
      } else {
        this._showLoginForm();
      }
    } else {
      this._showLoginForm();
    }
  },

  /**
   * 显示登录表单
   */
  _showLoginForm() {
    document.getElementById('admin-login').classList.remove('hidden');
    document.getElementById('admin-panel').classList.add('hidden');
  },

  /**
   * 显示管理面板
   */
  _showAdminPanel() {
    document.getElementById('admin-login').classList.add('hidden');
    document.getElementById('admin-panel').classList.remove('hidden');
    this._refreshData();
  },

  /**
   * 登录
   */
  login() {
    const password = document.getElementById('admin-password').value;
    
    if (password === CONFIG.code.adminPassword) {
      this.isLoggedIn = true;
      Storage.saveSession({
        adminLoggedIn: true,
        adminLoggedInAt: Date.now()
      });
      UI.showToast('登录成功', 'success');
      this._showAdminPanel();
    } else {
      UI.showToast('密码错误', 'error');
    }
  },

  /**
   * 退出登录
   */
  logout() {
    this.isLoggedIn = false;
    Storage.saveSession({});
    this._showLoginForm();
    UI.showToast('已退出登录', 'info');
  },

  /**
   * 生成体验码
   */
  generateCodes() {
    const product = document.getElementById('generate-product').value;
    const count = parseInt(document.getElementById('generate-count').value) || 1;
    
    if (count < 1 || count > 100) {
      UI.showToast('生成数量应在1-100之间', 'error');
      return;
    }

    const codes = CodeManager.generateCodes(product, count);
    
    // 显示生成的体验码
    const container = document.getElementById('generated-codes');
    container.innerHTML = codes.map(c => `
      <div class="code-item">
        <span class="code-value">${c.code}</span>
        <span class="code-status unused">${CONFIG.products[c.product].label}</span>
      </div>
    `).join('');

    UI.showToast(`成功生成 ${codes.length} 个体验码`, 'success');
    this._refreshData();
  },

  /**
   * 刷新数据
   */
  _refreshData() {
    this._updateStats();
    this._updateCodeList();
  },

  /**
   * 更新统计数据
   */
  _updateStats() {
    const stats = CodeManager.getStats();
    
    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-unused').textContent = stats.unused;
    document.getElementById('stat-active').textContent = stats.active;
    document.getElementById('stat-expired').textContent = stats.expired;
  },

  /**
   * 更新体验码列表
   */
  _updateCodeList() {
    const filter = document.getElementById('code-filter').value;
    const codes = CodeManager.getCodeList(filter);
    
    const container = document.getElementById('code-list');
    
    if (codes.length === 0) {
      container.innerHTML = '<div class="text-center" style="padding: 40px; color: var(--text-light);">暂无体验码</div>';
      return;
    }

    container.innerHTML = codes.map(code => {
      const productLabel = CONFIG.products[code.product].label;
      return `
        <div class="code-item">
          <div>
            <span class="code-value">${code.code}</span>
            <span class="product-label ${code.product}" style="margin-left: 8px; font-size: 0.7rem;">${productLabel}</span>
          </div>
          <span class="code-status ${code.status}">${this._getStatusText(code.status)}</span>
        </div>
      `;
    }).join('');
  },

  /**
   * 获取状态文字
   */
  _getStatusText(status) {
    const statusMap = {
      'unused': '未使用',
      'active': '使用中',
      'expired': '已过期'
    };
    return statusMap[status] || status;
  },

  /**
   * 切换标签页
   * @param {string} tab - 标签名
   */
  switchTab(tab) {
    // 更新标签按钮状态
    document.querySelectorAll('.admin-tab').forEach(el => {
      el.classList.toggle('active', el.dataset.tab === tab);
    });

    // 显示对应内容
    document.querySelectorAll('.admin-content').forEach(el => {
      el.classList.toggle('hidden', el.id !== `tab-${tab}`);
    });

    // 刷新数据
    if (tab === 'codes') {
      this._updateCodeList();
    } else if (tab === 'stats') {
      this._updateStats();
    }
  },

  /**
   * 清理过期体验码
   */
  clearExpired() {
    UI.confirm('确定要清理所有过期体验码吗？').then(confirmed => {
      if (confirmed) {
        const count = CodeManager.clearExpiredCodes();
        UI.showToast(`已清理 ${count} 个过期体验码`, 'success');
        this._refreshData();
      }
    });
  }
};
