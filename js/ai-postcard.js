/**
 * AIPostcard - AI明信片生成模块
 * 使用 Canvas 绘制治愈系图片和花语
 */

const AIPostcard = {
  // 画布尺寸
  width: 600,
  height: 800,

  // 背景渐变配置
  gradients: {
    sunflower: ['#FFD93D', '#FF6B6B'],
    lavender: ['#E8D5F2', '#9B59B6'],
    rose: ['#FFE0E0', '#E74C3C'],
    cherry: ['#FFE4EC', '#FFB6C1'],
    bamboo: ['#D4F1D4', '#27AE60'],
    lotus: ['#FFF8E7', '#F8C471']
  },

  /**
   * 生成明信片
   * @param {Object} result - 结果对象
   * @returns {Promise<string>} DataURL 格式的图片
   */
  async generate(result) {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');

        // 绘制背景
        this._drawBackground(ctx, result.id);

        // 绘制装饰元素
        this._drawDecorations(ctx, result.id);

        // 绘制主内容区域
        this._drawContent(ctx, result);

        // 绘制底部信息
        this._drawFooter(ctx, result);

        // 导出为 DataURL
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      } catch (error) {
        console.error('[AIPostcard] Generation failed:', error);
        reject(error);
      }
    });
  },

  /**
   * 绘制背景
   * @private
   */
  _drawBackground(ctx, typeId) {
    const colors = this.gradients[typeId] || this.gradients.sunflower;
    
    // 创建渐变
    const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    // 添加半透明纹理
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      const r = Math.random() * 3 + 1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  /**
   * 绘制装饰元素
   * @private
   */
  _drawDecorations(ctx, typeId) {
    const decorations = {
      sunflower: { icon: '🌻', positions: [[50, 50], [500, 100], [100, 700], [520, 720]] },
      lavender: { icon: '💜', positions: [[80, 80], [480, 60], [60, 680], [500, 700]] },
      rose: { icon: '🌹', positions: [[60, 60], [520, 80], [80, 720], [480, 700]] },
      cherry: { icon: '🌸', positions: [[100, 40], [480, 120], [60, 680], [520, 720]] },
      bamboo: { icon: '🎋', positions: [[40, 100], [520, 60], [80, 720], [500, 680]] },
      lotus: { icon: '🪷', positions: [[80, 60], [500, 100], [60, 700], [480, 720]] }
    };

    const deco = decorations[typeId] || decorations.sunflower;
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    deco.positions.forEach(([x, y]) => {
      ctx.globalAlpha = 0.3;
      ctx.fillText(deco.icon, x, y);
    });
    ctx.globalAlpha = 1;
  },

  /**
   * 绘制主内容
   * @private
   */
  _drawContent(ctx, result) {
    const centerX = this.width / 2;
    const centerY = this.height / 2 - 50;

    // 白色半透明卡片背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.roundRect(40, 120, this.width - 80, this.height - 240, 20);
    ctx.fill();

    // 绘制大图标
    ctx.font = '120px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(result.emoji, centerX, centerY - 80);

    // 绘制结果名称
    ctx.font = 'bold 48px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#333';
    ctx.fillText(result.name, centerX, centerY + 40);

    // 绘制副标题
    ctx.font = '24px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText(result.subtitle, centerX, centerY + 90);

    // 绘制分隔线
    ctx.strokeStyle = result.color || '#FFD93D';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX - 100, centerY + 120);
    ctx.lineTo(centerX + 100, centerY + 120);
    ctx.stroke();

    // 绘制花语（自动换行）
    if (result.flowerLanguage) {
      ctx.font = '20px "Microsoft YaHei", sans-serif';
      ctx.fillStyle = '#555';
      this._wrapText(ctx, result.flowerLanguage, centerX, centerY + 160, this.width - 120, 32);
    }
  },

  /**
   * 绘制底部信息
   * @private
   */
  _drawFooter(ctx, result) {
    const bottomY = this.height - 80;

    // 品牌标识
    ctx.font = '18px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.textAlign = 'center';
    ctx.fillText('心花 MindBloom', this.width / 2, bottomY);

    // 日期
    const date = new Date().toLocaleDateString('zh-CN');
    ctx.font = '14px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(date, this.width / 2, bottomY + 30);
  },

  /**
   * 自动换行文本
   * @private
   */
  _wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split('');
    let line = '';
    let currentY = y;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i];
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, x, currentY);
        line = words[i];
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  },

  /**
   * 下载明信片
   * @param {string} dataUrl - 图片 DataURL
   * @param {string} filename - 文件名
   */
  download(dataUrl, filename = 'mindbloom-postcard.png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIPostcard;
}
