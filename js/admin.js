/**
 * Admin Module - 后台管理
 * 体验码生成、统计数据、记录查看
 */

const Admin = {
  // 管理员密码
  PASSWORD: 'mindbloom2026',

  /**
   * 进入后台页面时调用
   */
  onEnter() {
    const state = State.get();
    
    // 重置登录状态
    State.set({
      admin: { isLoggedIn: false, genProduct: 'basic' }
    });

    // 显示登录界面
    const loginSection = document.getElementById('admin-login-section');
    const dashboard = document.getElementById('admin-dashboard');
    
    if (loginSection) loginSection.style.display = 'flex';
    if (dashboard) dashboard.style.display = 'none';

    // 清空密码输入
    const pwdInput = document.getElementById('admin-pwd');
    if (pwdInput) pwdInput.value = '';
  },

  /**
   * 登录验证
   */
  login() {
    const pwdInput = document.getElementById('admin-pwd');
    const password = pwdInput ? pwdInput.value : '';

    if (password === this.PASSWORD) {
      State.set({ admin: { isLoggedIn: true, genProduct: 'basic' } });
      
      // 切换界面
      const loginSection = document.getElementById('admin-login-section');
      const dashboard = document.getElementById('admin-dashboard');
      
      if (loginSection) loginSection.style.display = 'none';
      if (dashboard) dashboard.style.display = 'flex';

      // 渲染数据
      this.renderDashboard();
      
      UI.showToast('欢迎进入后台');
    } else {
      UI.showToast('密码错误', true);
    }
  },

  /**
   * 渲染后台数据
   */
  renderDashboard() {
    const records = Storage.getRecords();
    
    // 自动清理过期体验码（保留用户数据）
    let autoCleanedCount = 0;
    if (typeof CodeManager !== 'undefined') {
      autoCleanedCount = CodeManager.cleanup();
      if (autoCleanedCount > 0) {
        console.log(`[Admin] 自动清理了 ${autoCleanedCount} 个过期体验码`);
      }
    }
    
    // 使用 CodeManager 获取统计（支持24小时过期机制）
    let stats;
    if (typeof CodeManager !== 'undefined') {
      stats = CodeManager.getStats();
    } else {
      // 降级到旧版 Storage
      const codes = Storage.getCodes();
      stats = {
        basicUsed: 0,
        advancedUsed: 0,
        basicTotal: 0,
        advancedTotal: 0
      };
      Object.values(codes).forEach(code => {
        if (code.product === 'basic') {
          stats.basicTotal++;
          if (code.used) stats.basicUsed++;
        } else {
          stats.advancedTotal++;
          if (code.used) stats.advancedUsed++;
        }
      });
    }

    // 渲染统计卡片
    const statGrid = document.getElementById('stat-grid');
    if (statGrid) {
      statGrid.innerHTML = `
        <div class="stat-card">
          <div class="stat-num">${stats.basicUsed}</div>
          <div class="stat-label">意识之境使用</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">${stats.advancedUsed}</div>
          <div class="stat-label">心灵花园使用</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">${stats.basicTotal}</div>
          <div class="stat-label">意识之境码总数</div>
        </div>
        <div class="stat-card">
          <div class="stat-num">${stats.advancedTotal}</div>
          <div class="stat-label">心灵花园码总数</div>
        </div>
      `;
    }

    // 渲染最近记录
    const recordList = document.getElementById('record-list');
    if (recordList) {
      const recent = records.slice(0, 10);
      
      if (recent.length === 0) {
        recordList.innerHTML = '<div style="font-size:12px;color:rgba(253,248,243,0.3);padding:10px">暂无记录</div>';
      } else {
        recordList.innerHTML = recent.map(r => {
          const date = new Date(r.time);
          const timeStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
          const productClass = r.product === 'basic' ? 'basic' : 'advanced';
          const productName = r.product === 'basic' ? '意识' : '花园';
          
          return `
            <div class="record-item">
              <span class="record-time">${timeStr}</span>
              <span class="record-product ${productClass}">${productName}</span>
              <span class="record-text">${r.nickname || '匿名'}</span>
            </div>
          `;
        }).join('');
      }
    }
  },

  /**
   * 选择生成码的产品类型
   * @param {string} product 'basic' | 'advanced'
   */
  selectGenProduct(product) {
    State.set({ admin: { ...State.get().admin, genProduct: product } });
    
    // 更新按钮样式
    const basicBtn = document.getElementById('gen-basic-btn');
    const advancedBtn = document.getElementById('gen-advanced-btn');
    
    if (basicBtn) {
      basicBtn.classList.toggle('selected', product === 'basic');
    }
    if (advancedBtn) {
      advancedBtn.classList.toggle('selected', product === 'advanced');
    }
  },

  /**
   * 生成体验码
   */
  generateCodes() {
    const countInput = document.getElementById('gen-count');
    const count = Math.min(20, Math.max(1, parseInt(countInput ? countInput.value : 5) || 5));
    
    const state = State.get();
    const product = state.admin.genProduct || 'basic';
    const prefix = product === 'basic' ? 'B' : 'A';
    
    let generated = [];
    
    // 优先使用 CodeManager（支持24小时过期机制）
    if (typeof CodeManager !== 'undefined') {
      generated = CodeManager.generate(product, count);
    } else {
      // 降级到旧版 Storage
      const codes = Storage.getCodes();
      for (let i = 0; i < count; i++) {
        let code;
        do {
          code = prefix + String(Math.floor(1000 + Math.random() * 9000));
        } while (codes[code]);
        codes[code] = {
          created: Date.now(),
          used: false,
          product: product
        };
        generated.push(code);
      }
      Storage.saveCodes(codes);
    }

    // 显示生成的码
    const container = document.getElementById('generated-codes');
    if (container) {
      container.innerHTML = generated.map(code => `
        <span class="code-chip" onclick="Admin.copyCode('${code}')" title="点击复制">${code}</span>
      `).join('');
    }

    // 刷新统计
    this.renderDashboard();

    UI.showToast(`已生成 ${count} 个体验码（${prefix}开头，24小时有效）`);
  },

  /**
   * 复制体验码到剪贴板
   * @param {string} code 体验码
   * @param {boolean} copyLink 是否复制链接（而非仅复制码）
   */
  copyCode(code, copyLink = false) {
    let textToCopy = code;
    
    // 如果请求复制链接且 CodeManager 可用
    if (copyLink && typeof CodeManager !== 'undefined') {
      textToCopy = CodeManager.generateShareLink(code);
    }
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        const msg = copyLink ? '已复制分享链接' : `已复制: ${code}`;
        UI.showToast(msg);
      }).catch(() => {
        this.fallbackCopy(textToCopy, copyLink);
      });
    } else {
      this.fallbackCopy(textToCopy, copyLink);
    }
  },

  /**
   * 备用复制方法
   */
  fallbackCopy(text, isLink = false) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      const msg = isLink ? '已复制分享链接' : `已复制: ${text}`;
      UI.showToast(msg);
    } catch (e) {
      UI.showToast('复制失败，请手动复制', true);
    }
    
    document.body.removeChild(textarea);
  },

  /**
   * 复制体验码分享链接
   * @param {string} code 体验码
   */
  copyShareLink(code) {
    this.copyCode(code, true);
  },

  /**
   * 查看有效体验码
   */
  viewCodes() {
    const listEl = document.getElementById('code-list');
    if (!listEl) return;
    
    if (typeof CodeManager === 'undefined') {
      listEl.innerHTML = '<div style="color:rgba(253,248,243,0.5);font-size:12px;padding:10px">CodeManager 未加载</div>';
      return;
    }
    
    const codes = CodeManager.getAllCodes();
    
    if (codes.length === 0) {
      listEl.innerHTML = '<div style="color:rgba(253,248,243,0.5);font-size:12px;padding:10px">暂无有效体验码</div>';
      return;
    }
    
    // 按产品分组
    const basicCodes = codes.filter(c => c.product === 'basic');
    const advancedCodes = codes.filter(c => c.product === 'advanced');
    
    let html = '';
    
    if (basicCodes.length > 0) {
      html += '<div class="code-group"><div class="code-group-title">意识之境 (B)</div>';
      html += basicCodes.map(c => `
        <div class="code-item ${c.used ? 'used' : ''}">
          <span class="code-text" onclick="Admin.copyCode('${c.code}')" title="点击复制体验码">${c.code}</span>
          <span class="code-status">${c.used ? '已用' : '未用'}</span>
          <span class="code-expiry">${c.expiryFormatted}</span>
          ${!c.used ? `<span class="code-link-btn" onclick="Admin.copyShareLink('${c.code}')" title="复制分享链接">🔗</span>` : ''}
        </div>
      `).join('');
      html += '</div>';
    }
    
    if (advancedCodes.length > 0) {
      html += '<div class="code-group"><div class="code-group-title">心灵花园 (A)</div>';
      html += advancedCodes.map(c => `
        <div class="code-item ${c.used ? 'used' : ''}">
          <span class="code-text" onclick="Admin.copyCode('${c.code}')" title="点击复制体验码">${c.code}</span>
          <span class="code-status">${c.used ? '已用' : '未用'}</span>
          <span class="code-expiry">${c.expiryFormatted}</span>
          ${!c.used ? `<span class="code-link-btn" onclick="Admin.copyShareLink('${c.code}')" title="复制分享链接">🔗</span>` : ''}
        </div>
        </div>
      `).join('');
      html += '</div>';
    }
    
    listEl.innerHTML = html;
  },

  /**
   * 清理过期体验码
   */
  cleanupCodes() {
    if (typeof CodeManager === 'undefined') {
      UI.showToast('CodeManager 未加载', true);
      return;
    }
    
    const count = CodeManager.cleanup();
    
    if (count > 0) {
      UI.showToast(`已清理 ${count} 个过期体验码`);
      this.renderDashboard();
      this.viewCodes(); // 刷新列表
    } else {
      UI.showToast('没有过期体验码需要清理');
    }
  },

  /**
   * 导出 CSV
   */
  exportCSV() {
    const records = Storage.getRecords();
    
    let csv = '\uFEFF'; // BOM for Excel
    csv += '产品,昵称,性别,年龄,时间\n';

    records.forEach(r => {
      const date = new Date(r.time);
      const dateStr = date.toLocaleString('zh-CN');
      csv += `${r.product === 'basic' ? '意识之境' : '心灵花园'},${r.nickname || ''},${r.gender || ''},${r.age || ''},${dateStr}\n`;
    });

    // 添加未使用的码（优先使用 CodeManager）
    csv += '\n未使用的体验码\n';
    csv += '体验码,产品,生成时间,过期时间\n';
    
    if (typeof CodeManager !== 'undefined') {
      // 使用 CodeManager 获取带过期时间的码
      const codes = CodeManager.getAllCodes();
      codes.forEach(({ code, product, created, expiryFormatted, used }) => {
        if (!used) {
          const date = new Date(created);
          csv += `${code},${product === 'basic' ? '意识之境' : '心灵花园'},${date.toLocaleString('zh-CN')},${expiryFormatted}\n`;
        }
      });
    } else {
      // 降级到旧版 Storage
      const codes = Storage.getCodes();
      Object.entries(codes).forEach(([code, info]) => {
        if (!info.used) {
          const date = new Date(info.created);
          csv += `${code},${info.product === 'basic' ? '意识之境' : '心灵花园'},${date.toLocaleString('zh-CN')},-\n`;
        }
      });
    }

    // 下载
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindbloom_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    UI.showToast('CSV 已导出');
  }
};

// 暴露到全局供 HTML 调用
window.Admin = Admin;
