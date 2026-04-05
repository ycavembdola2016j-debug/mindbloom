/**
 * AI Image Module - AI 图片生成
 * 为"意识之境"生成治愈系明信片背景图
 */

const AIImage = {
  // 配置
  config: {
    // 使用 Pollinations.ai 免费 API（无需注册，支持中文）
    apiUrl: 'https://image.pollinations.ai/prompt/',
    // 备用：使用 picsum 随机图片（开发测试用）
    fallbackUrl: 'https://picsum.photos/seed/',
    // 图片尺寸
    width: 1024,
    height: 1024,
    // 缓存前缀
    cachePrefix: 'mb_ai_img_'
  },

  // 治愈系场景关键词库
  scenes: {
    '直觉想象': {
      keywords: 'starry night sky, milky way, aurora borealis, cosmic dreamy atmosphere, soft purple and blue gradient, twinkling stars, ethereal mist, peaceful night landscape, watercolor style, gentle light rays',
      cnKeywords: '星空，银河，极光，梦幻宇宙氛围，柔和的紫蓝色渐变，闪烁的星星，空灵薄雾，宁静夜景，水彩风格，温柔光线'
    },
    '情绪感知': {
      keywords: 'cherry blossom garden, pink petals falling, soft morning light, tranquil pond with reflections, gentle breeze, dreamy pastel colors, spring awakening, serene nature, watercolor painting style',
      cnKeywords: '樱花花园，粉色花瓣飘落，柔和晨光，宁静池塘倒影，微风轻拂，梦幻粉彩色调，春日苏醒，静谧自然，水彩画风格'
    },
    '行为模式': {
      keywords: 'golden wheat field at sunset, warm amber light, gentle rolling hills, path through nature, harvest abundance, peaceful countryside, soft golden hour glow, minimalist landscape, calming earth tones',
      cnKeywords: '日落金色麦田，温暖琥珀色光线，柔和起伏山丘，林间小路，丰收丰饶，宁静乡村，柔和金色时光，极简风景，治愈大地色调'
    },
    '人际关系': {
      keywords: 'two trees with intertwined branches, green meadow, soft sunlight filtering through leaves, connection and growth, peaceful forest clearing, heart-shaped canopy, nurturing nature scene, soft green tones',
      cnKeywords: '两棵树枝干交织，绿色草地，阳光透过树叶，连接与成长，宁静林间空地，心形树冠，滋养自然场景，柔和绿色调'
    },
    '自我认知': {
      keywords: 'mountain peak above clouds, sunrise breaking through, journey and discovery, vast horizon, inner peace, meditation spot, majestic landscape, soft purple and gold sky, inspirational view',
      cnKeywords: '云海之上的山峰，日出破晓，旅程与发现，广阔地平线，内心平静，冥想之地，壮丽风景，柔和紫金天空，启发性景观'
    }
  },

  // 通用治愈系风格后缀
  styleSuffix: ', healing atmosphere, soothing colors, gentle composition, postcard style, high quality, 4k, serene and peaceful mood, positive energy, mindfulness aesthetic, soft focus background',

  /**
   * 生成图片
   * @param {string} dimension 维度名称（如'直觉想象'）
   * @param {string} quote 金句内容（用于生成更相关的图片）
   * @returns {Promise<string>} 图片 URL
   */
  async generate(dimension, quote) {
    const cacheKey = this.config.cachePrefix + this.hashCode(dimension + quote);
    
    // 检查缓存
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      console.log('Using cached AI image');
      return cached;
    }

    try {
      // 构建提示词
      const prompt = this.buildPrompt(dimension, quote);
      console.log('AI Image Prompt:', prompt);

      // 使用 Pollinations.ai 生成图片
      const imageUrl = this.config.apiUrl + encodeURIComponent(prompt) + 
        `?width=${this.config.width}&height=${this.config.height}&nologo=true&seed=${this.hashCode(quote)}`;

      // 预加载图片确保可用
      await this.preloadImage(imageUrl);

      // 缓存结果（存储 URL，实际图片由浏览器缓存）
      localStorage.setItem(cacheKey, imageUrl);

      return imageUrl;
    } catch (error) {
      console.error('AI image generation failed:', error);
      // 返回备用图片
      return this.getFallbackImage(dimension);
    }
  },

  /**
   * 构建提示词
   */
  buildPrompt(dimension, quote) {
    const scene = this.scenes[dimension] || this.scenes['自我认知'];
    
    // 基础场景描述
    let prompt = scene.keywords + this.styleSuffix;
    
    // 可以在这里根据 quote 内容调整提示词
    // 简单处理：如果 quote 包含特定关键词，添加相关元素
    if (quote.includes('光') || quote.includes('亮')) {
      prompt += ', warm glowing light, rays of hope';
    }
    if (quote.includes('风') || quote.includes('吹')) {
      prompt += ', gentle wind movement, flowing elements';
    }
    if (quote.includes('水') || quote.includes('河')) {
      prompt += ', flowing water, gentle stream';
    }

    return prompt;
  },

  /**
   * 预加载图片
   */
  preloadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = url;
    });
  },

  /**
   * 获取备用图片
   */
  getFallbackImage(dimension) {
    const seed = this.hashCode(dimension);
    return `${this.config.fallbackUrl}${seed}/800/800`;
  },

  /**
   * 生成简单的哈希码
   */
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  },

  /**
   * 生成结果明信片（Canvas 合成）
   * @param {Object} result 结果对象
   * @returns {Promise<string>} 明信片 Data URL
   */
  async generatePostcard(result) {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1440;
    const ctx = canvas.getContext('2d');

    // 获取或生成背景图
    let bgImage = null;
    try {
      const imageUrl = await this.generate(result.dimension, result.quote);
      bgImage = await this.loadImage(imageUrl);
    } catch (e) {
      console.log('Using gradient fallback');
    }

    // 绘制背景
    if (bgImage) {
      // 计算裁剪区域，保持比例填充
      const scale = Math.max(canvas.width / bgImage.width, canvas.height / bgImage.height);
      const x = (canvas.width - bgImage.width * scale) / 2;
      const y = (canvas.height - bgImage.height * scale) / 2;
      ctx.drawImage(bgImage, x, y, bgImage.width * scale, bgImage.height * scale);
      
      // 添加半透明遮罩，让文字更清晰
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      // 渐变备用背景
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#1C1430');
      gradient.addColorStop(0.5, '#2D1F4F');
      gradient.addColorStop(1, '#0F1A1A');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 绘制装饰边框
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    // 顶部：品牌名
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '300 32px "Noto Serif SC", serif';
    ctx.textAlign = 'center';
    ctx.fillText('心花 MindBloom', canvas.width / 2, 100);

    // 分隔线
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 100, 130);
    ctx.lineTo(canvas.width / 2 + 100, 130);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 中间：emoji 图标
    ctx.font = '120px serif';
    ctx.fillText(result.emoji, canvas.width / 2, 280);

    // 结果名称
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 56px "Noto Serif SC", serif';
    ctx.fillText(result.name, canvas.width / 2, 380);

    // 副标题
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '32px "Noto Serif SC", serif';
    ctx.fillText(result.subtitle, canvas.width / 2, 440);

    // 金句区域（带背景卡片）
    const cardY = 540;
    const cardPadding = 60;
    
    // 测量文字高度
    ctx.font = '40px "Noto Serif SC", serif';
    const maxWidth = canvas.width - 160;
    const lines = this.wrapText(ctx, result.quote, maxWidth);
    const lineHeight = 64;
    const cardHeight = lines.length * lineHeight + cardPadding * 2;

    // 绘制卡片背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(60, cardY, canvas.width - 120, cardHeight);
    
    // 卡片边框
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(60, cardY, canvas.width - 120, cardHeight);

    // 绘制金句
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '40px "Noto Serif SC", serif';
    let textY = cardY + cardPadding + 40;
    lines.forEach(line => {
      ctx.fillText(line, canvas.width / 2, textY);
      textY += lineHeight;
    });

    // 底部：日期和标语
    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '24px "Noto Serif SC", serif';
    ctx.fillText(dateStr, canvas.width / 2, canvas.height - 120);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '28px "Noto Serif SC", serif';
    ctx.fillText('愿你在自我探索中，遇见更好的自己', canvas.width / 2, canvas.height - 70);

    return canvas.toDataURL('image/png', 0.9);
  },

  /**
   * 加载图片
   */
  loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  },

  /**
   * 文字换行
   */
  wrapText(ctx, text, maxWidth) {
    const chars = text.split('');
    const lines = [];
    let currentLine = '';

    for (let i = 0; i < chars.length; i++) {
      const testLine = currentLine + chars[i];
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = chars[i];
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
    return lines;
  }
};

// 暴露到全局
window.AIImage = AIImage;
