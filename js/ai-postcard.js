/**
 * MindBloom V12 - AI明信片生成模块
 * Canvas绘制治愈系明信片，像一封手写的信
 */

const AIPostcard = {
  /**
   * 生成AI明信片
   * @param {Object} result - 结果数据
   * @param {Object} userInfo - 用户信息
   * @returns {Promise<HTMLCanvasElement>} Canvas元素
   */
  async generate(result, userInfo) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 设置尺寸 (2:3比例，适合手机分享)
    const width = 600;
    const height = 900;
    canvas.width = width;
    canvas.height = height;
    
    // 绘制背景
    this._drawBackground(ctx, width, height, result.colors);
    
    // 绘制信纸边框
    this._drawPaperBorder(ctx, width, height);
    
    // 绘制邮票位置
    this._drawStampArea(ctx, width, height);
    
    // 绘制收件人
    this._drawRecipient(ctx, userInfo.nickname || '朋友');
    
    // 绘制花卉插画
    this._drawFlowerIllustration(ctx, width, height, result);
    
    // 绘制信件内容
    this._drawLetterContent(ctx, width, height, result, userInfo);
    
    // 绘制花语
    this._drawFlowerMeaning(ctx, width, height, result);
    
    // 绘制落款
    this._drawSignature(ctx, width, height);
    
    return canvas;
  },

  /**
   * 绘制背景
   */
  _drawBackground(ctx, width, height, colors) {
    // 创建渐变背景
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, colors[0] || '#FFF5F7');
    gradient.addColorStop(0.5, colors[1] || '#FFE4EC');
    gradient.addColorStop(1, colors[2] || '#FFD4E5');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // 添加纹理效果
    ctx.save();
    ctx.globalAlpha = 0.03;
    for (let i = 0; i < 100; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 3 + 1,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = '#000';
      ctx.fill();
    }
    ctx.restore();
  },

  /**
   * 绘制信纸边框
   */
  _drawPaperBorder(ctx, width, height) {
    const margin = 30;
    
    ctx.save();
    ctx.strokeStyle = 'rgba(196, 69, 105, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);
    ctx.restore();
  },

  /**
   * 绘制邮票区域
   */
  _drawStampArea(ctx, width, height) {
    const stampX = width - 100;
    const stampY = 50;
    const stampSize = 60;
    
    ctx.save();
    
    // 邮票边框（锯齿效果）
    ctx.strokeStyle = 'rgba(196, 69, 105, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(stampX, stampY, stampSize, stampSize);
    
    // 邮票内部
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(stampX + 5, stampY + 5, stampSize - 10, stampSize - 10);
    
    // 小花图案
    ctx.font = '24px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#C44569';
    ctx.fillText('✿', stampX + stampSize / 2, stampY + stampSize / 2);
    
    ctx.restore();
  },

  /**
   * 绘制收件人
   */
  _drawRecipient(ctx, nickname) {
    ctx.save();
    ctx.font = 'italic 24px serif';
    ctx.fillStyle = '#2D1B2E';
    ctx.textAlign = 'left';
    ctx.fillText(`致 ${nickname}`, 60, 100);
    ctx.restore();
  },

  /**
   * 绘制花卉插画
   */
  _drawFlowerIllustration(ctx, width, height, result) {
    const centerX = width / 2;
    const centerY = 280;
    
    ctx.save();
    
    // 根据花卉类型绘制不同的简化图案
    switch (result.flower) {
      case '向日葵':
        this._drawSunflower(ctx, centerX, centerY);
        break;
      case '薰衣草':
        this._drawLavender(ctx, centerX, centerY);
        break;
      case '梅花':
        this._drawPlum(ctx, centerX, centerY);
        break;
      case '樱花':
        this._drawCherry(ctx, centerX, centerY);
        break;
      case '蒲公英':
        this._drawDandelion(ctx, centerX, centerY);
        break;
      case '莲花':
        this._drawLotus(ctx, centerX, centerY);
        break;
      default:
        this._drawSunflower(ctx, centerX, centerY);
    }
    
    ctx.restore();
  },

  /**
   * 绘制向日葵
   */
  _drawSunflower(ctx, x, y) {
    // 花心
    ctx.beginPath();
    ctx.arc(x, y, 35, 0, Math.PI * 2);
    ctx.fillStyle = '#8B4513';
    ctx.fill();
    
    // 花瓣
    const petalCount = 12;
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const petalX = x + Math.cos(angle) * 50;
      const petalY = y + Math.sin(angle) * 50;
      
      ctx.beginPath();
      ctx.ellipse(petalX, petalY, 15, 30, angle, 0, Math.PI * 2);
      ctx.fillStyle = '#FFD700';
      ctx.fill();
      ctx.strokeStyle = '#FFA500';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    // 茎
    ctx.beginPath();
    ctx.moveTo(x, y + 35);
    ctx.quadraticCurveTo(x + 10, y + 80, x + 5, y + 120);
    ctx.strokeStyle = '#228B22';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // 叶子
    ctx.beginPath();
    ctx.ellipse(x + 15, y + 80, 20, 8, Math.PI / 4, 0, Math.PI * 2);
    ctx.fillStyle = '#228B22';
    ctx.fill();
  },

  /**
   * 绘制薰衣草
   */
  _drawLavender(ctx, x, y) {
    const stems = 5;
    
    for (let i = 0; i < stems; i++) {
      const offsetX = (i - 2) * 20;
      const stemX = x + offsetX;
      const stemY = y + 60;
      
      // 茎
      ctx.beginPath();
      ctx.moveTo(stemX, stemY);
      ctx.lineTo(stemX + offsetX * 0.3, y - 40);
      ctx.strokeStyle = '#6B8E23';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 花穗
      for (let j = 0; j < 8; j++) {
        const flowerY = y - 30 + j * 12;
        ctx.beginPath();
        ctx.ellipse(stemX + offsetX * 0.2, flowerY, 6, 8, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#9B59B6';
        ctx.fill();
      }
    }
  },

  /**
   * 绘制梅花
   */
  _drawPlum(ctx, x, y) {
    // 枝干
    ctx.beginPath();
    ctx.moveTo(x - 40, y + 60);
    ctx.quadraticCurveTo(x - 20, y + 20, x, y);
    ctx.quadraticCurveTo(x + 20, y - 20, x + 40, y + 40);
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // 花朵
    const flowers = [
      { x: x - 30, y: y + 30 },
      { x: x, y: y - 10 },
      { x: x + 35, y: y + 25 }
    ];
    
    flowers.forEach(flower => {
      // 花瓣
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const petalX = flower.x + Math.cos(angle) * 15;
        const petalY = flower.y + Math.sin(angle) * 15;
        
        ctx.beginPath();
        ctx.arc(petalX, petalY, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#FFB6C1';
        ctx.fill();
      }
      
      // 花蕊
      ctx.beginPath();
      ctx.arc(flower.x, flower.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFD700';
      ctx.fill();
    });
  },

  /**
   * 绘制樱花
   */
  _drawCherry(ctx, x, y) {
    const flowers = [
      { x: x - 25, y: y },
      { x: x, y: y - 20 },
      { x: x + 25, y: y + 10 },
      { x: x - 10, y: y + 25 }
    ];
    
    flowers.forEach(flower => {
      // 5片花瓣
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const petalX = flower.x + Math.cos(angle) * 12;
        const petalY = flower.y + Math.sin(angle) * 12;
        
        ctx.beginPath();
        ctx.ellipse(petalX, petalY, 8, 12, angle, 0, Math.PI * 2);
        ctx.fillStyle = '#FFC0CB';
        ctx.fill();
      }
      
      // 花蕊
      ctx.beginPath();
      ctx.arc(flower.x, flower.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#FF69B4';
      ctx.fill();
    });
    
    // 飘落的花瓣
    ctx.save();
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < 5; i++) {
      const px = x + (Math.random() - 0.5) * 100;
      const py = y + 50 + Math.random() * 50;
      ctx.beginPath();
      ctx.ellipse(px, py, 6, 10, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fillStyle = '#FFC0CB';
      ctx.fill();
    }
    ctx.restore();
  },

  /**
   * 绘制蒲公英
   */
  _drawDandelion(ctx, x, y) {
    // 茎
    ctx.beginPath();
    ctx.moveTo(x, y + 50);
    ctx.lineTo(x, y - 30);
    ctx.strokeStyle = '#6B8E23';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // 绒毛球
    ctx.beginPath();
    ctx.arc(x, y - 30, 35, 0, Math.PI * 2);
    ctx.fillStyle = '#F5F5DC';
    ctx.fill();
    
    // 绒毛细节
    ctx.save();
    ctx.strokeStyle = '#FFFACD';
    ctx.lineWidth = 1;
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const startX = x + Math.cos(angle) * 20;
      const startY = y - 30 + Math.sin(angle) * 20;
      const endX = x + Math.cos(angle) * 35;
      const endY = y - 30 + Math.sin(angle) * 35;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
    ctx.restore();
    
    // 飘散的种子
    ctx.save();
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 8; i++) {
      const seedX = x + (Math.random() - 0.3) * 120;
      const seedY = y - 30 - Math.random() * 80;
      ctx.beginPath();
      ctx.arc(seedX, seedY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#F5F5DC';
      ctx.fill();
      
      // 小伞
      ctx.beginPath();
      ctx.moveTo(seedX, seedY);
      ctx.lineTo(seedX - 5, seedY - 8);
      ctx.strokeStyle = '#FFFACD';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
    ctx.restore();
  },

  /**
   * 绘制莲花
   */
  _drawLotus(ctx, x, y) {
    // 荷叶
    ctx.beginPath();
    ctx.ellipse(x, y + 60, 60, 20, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#228B22';
    ctx.fill();
    
    // 叶脉
    ctx.strokeStyle = '#1F6B1F';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI;
      ctx.beginPath();
      ctx.moveTo(x, y + 60);
      ctx.lineTo(x + Math.cos(angle) * 50, y + 60 + Math.sin(angle) * 15);
      ctx.stroke();
    }
    
    // 花茎
    ctx.beginPath();
    ctx.moveTo(x, y + 40);
    ctx.lineTo(x, y - 20);
    ctx.strokeStyle = '#6B8E23';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // 莲花
    const petalColors = ['#FFB6C1', '#FFC0CB', '#FFD1DC'];
    for (let layer = 0; layer < 3; layer++) {
      const petals = 6 + layer * 2;
      const radius = 25 - layer * 5;
      
      for (let i = 0; i < petals; i++) {
        const angle = (i / petals) * Math.PI * 2 + layer * 0.3;
        const petalX = x + Math.cos(angle) * radius;
        const petalY = y - 20 + Math.sin(angle) * radius * 0.5;
        
        ctx.beginPath();
        ctx.ellipse(petalX, petalY, 12, 20, angle, 0, Math.PI * 2);
        ctx.fillStyle = petalColors[layer];
        ctx.fill();
      }
    }
    
    // 花蕊
    ctx.beginPath();
    ctx.arc(x, y - 20, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD700';
    ctx.fill();
  },

  /**
   * 绘制信件内容
   */
  _drawLetterContent(ctx, width, height, result, userInfo) {
    const startY = 420;
    const marginX = 60;
    const maxWidth = width - marginX * 2;
    
    ctx.save();
    ctx.font = '18px serif';
    ctx.fillStyle = '#2D1B2E';
    ctx.textAlign = 'left';
    
    // 处理信件内容，自动换行
    const letter = result.letter;
    const lines = this._wrapText(ctx, letter, maxWidth);
    
    let currentY = startY;
    lines.forEach(line => {
      ctx.fillText(line, marginX, currentY);
      currentY += 30;
    });
    
    ctx.restore();
  },

  /**
   * 绘制花语
   */
  _drawFlowerMeaning(ctx, width, height, result) {
    const y = height - 180;
    
    ctx.save();
    
    // 分隔线
    ctx.beginPath();
    ctx.moveTo(60, y - 20);
    ctx.lineTo(width - 60, y - 20);
    ctx.strokeStyle = 'rgba(196, 69, 105, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // 花语标题
    ctx.font = 'italic 16px serif';
    ctx.fillStyle = '#6B4E5B';
    ctx.textAlign = 'center';
    ctx.fillText('—— 你的心灵花语 ——', width / 2, y + 10);
    
    // 花卉名称
    ctx.font = 'bold 24px serif';
    ctx.fillStyle = '#C44569';
    ctx.fillText(`${result.emoji} ${result.flower}`, width / 2, y + 45);
    
    // 花语含义
    ctx.font = 'italic 18px serif';
    ctx.fillStyle = '#2D1B2E';
    ctx.fillText(`"${result.flowerMeaning}"`, width / 2, y + 75);
    
    ctx.restore();
  },

  /**
   * 绘制落款
   */
  _drawSignature(ctx, width, height) {
    const y = height - 60;
    
    ctx.save();
    ctx.font = '16px serif';
    ctx.fillStyle = '#6B4E5B';
    ctx.textAlign = 'right';
    ctx.fillText('来自：MindBloom', width - 60, y);
    
    const date = new Date().toLocaleDateString('zh-CN');
    ctx.font = '14px serif';
    ctx.fillText(date, width - 60, y + 25);
    ctx.restore();
  },

  /**
   * 文本自动换行
   */
  _wrapText(ctx, text, maxWidth) {
    const words = text.split('');
    const lines = [];
    let currentLine = '';
    
    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine + words[i];
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine !== '') {
      lines.push(currentLine);
    }
    
    return lines;
  }
};
