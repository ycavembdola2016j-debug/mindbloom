/**
 * Result Module - 结果计算和渲染
 * 纯函数计算结果，不依赖外部状态
 */

const Result = {
  /**
   * 计算测评结果
   * @param {string} product 'basic' | 'advanced'
   * @param {Array} questions 题目数组
   * @param {Array} answers 答案数组
   * @returns {Object} 结果对象
   */
  calculate(product, questions, answers) {
    if (product === 'basic') {
      return this.calculateBasic(questions, answers);
    } else {
      return this.calculateAdvanced(questions, answers);
    }
  },

  /**
   * 计算基础版结果
   */
  calculateBasic(questions, answers) {
    // 按分类统计得分
    const scores = {};
    const counts = {};

    questions.forEach((q, idx) => {
      const ans = answers[idx];
      if (ans !== undefined) {
        const cat = q.category;
        scores[cat] = (scores[cat] || 0) + ans;
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });

    // 找出得分最高的维度
    let maxDim = '';
    let maxAvg = -1;

    Object.keys(scores).forEach(dim => {
      const avg = scores[dim] / counts[dim];
      if (avg > maxAvg) {
        maxAvg = avg;
        maxDim = dim;
      }
    });

    // 结果配置
    const profiles = {
      '直觉想象': {
        emoji: '🌌',
        name: '直觉型心灵',
        subtitle: '跟随内心的微光',
        quote: '你拥有敏锐的直觉，像夜空中的星星，总能在混沌中捕捉到独特的光芒。',
        color: 'lavender'
      },
      '情绪感知': {
        emoji: '🌸',
        name: '感知型心灵',
        subtitle: '情感细腻如春风',
        quote: '你的情绪像一条温柔的河流，能感知最细微的波动，并将其转化为生命的养分。',
        color: 'rose'
      },
      '行为模式': {
        emoji: '✨',
        name: '行动型心灵',
        subtitle: '脚踏实地前行',
        quote: '你是一颗落地的种子，明白真正的成长来自每日的浇灌，而非等待的风。',
        color: 'gold'
      },
      '人际关系': {
        emoji: '💚',
        name: '连接型心灵',
        subtitle: '在关系中照见自己',
        quote: '你是一面镜子，在他人的眼中看见自己，也在连接中找到了存在的意义。',
        color: 'sage'
      },
      '自我认知': {
        emoji: '🎭',
        name: '探索型心灵',
        subtitle: '永不停歇的求知者',
        quote: '你是那个永远在路上的旅人，深知终点不在远方，而在每一步的觉察中。',
        color: 'lavender'
      }
    };

    const profile = profiles[maxDim] || profiles['自我认知'];

    return {
      product: 'basic',
      productName: '意识之境',
      dimension: maxDim,
      ...profile,
      insights: [
        {
          title: '你的核心特质',
          text: `${maxDim}是你的心灵底色，你在这个维度展现出非凡的感知力和成长潜力。`
        },
        {
          title: '给你的一句话',
          text: profile.quote
        },
        {
          title: '成长建议',
          text: '每天给自己10分钟独处时间，记录内心的感受和想法，你会发现自己比想象中更加丰富。'
        }
      ]
    };
  },

  /**
   * 计算高级版结果
   */
  calculateAdvanced(questions, answers) {
    // 大五人格维度
    const dimensions = { O: 0, C: 0, E: 0, A: 0, N: 0 };
    const counts = { O: 0, C: 0, E: 0, A: 0, N: 0 };

    questions.forEach((q, idx) => {
      const ans = answers[idx];
      if (ans !== undefined && q.dimension) {
        dimensions[q.dimension] += ans;
        counts[q.dimension]++;
      }
    });

    // 计算平均分（0-4分）
    const scores = {};
    Object.keys(dimensions).forEach(d => {
      scores[d] = counts[d] > 0 ? dimensions[d] / counts[d] : 0;
    });

    // 找出最高分维度
    let maxDim = 'O';
    let maxScore = -1;
    Object.keys(scores).forEach(d => {
      if (scores[d] > maxScore) {
        maxScore = scores[d];
        maxDim = d;
      }
    });

    // MBTI 近似类型
    const mbti = [
      scores.O > 2 ? 'N' : 'S',
      scores.C > 2 ? 'J' : 'P',
      scores.E > 2 ? 'E' : 'I',
      scores.A > 2 ? 'F' : 'T'
    ].join('');

    // 维度名称映射
    const dimNames = {
      O: '开放性',
      C: '尽责性',
      E: '外向性',
      A: '宜人性',
      N: '情绪稳定性'
    };

    // 结果配置
    const profiles = {
      O: {
        emoji: '🌊',
        name: '开放探索型',
        subtitle: '思想的漫游者',
        quote: '你的心灵像一片未知的星空，永远在探索，永远在发现新的可能。'
      },
      C: {
        emoji: '🏔️',
        name: '稳健责任型',
        subtitle: '可靠的践行者',
        quote: '你是那棵扎根大地的橡树，用日复一日的坚持，撑起属于自己的天空。'
      },
      E: {
        emoji: '☀️',
        name: '外向活力型',
        subtitle: '人际的聚光者',
        quote: '你是一团温暖的火焰，走到哪儿都能点亮周围的空气，让世界因你而明亮。'
      },
      A: {
        emoji: '💚',
        name: '和谐宜人型',
        subtitle: '关系的润滑剂',
        quote: '你是一泓清泉，以温柔和包容滋养周围的关系，让一切变得柔软而有力量。'
      },
      N: {
        emoji: '💡',
        name: '内省洞察型',
        subtitle: '内心的观察者',
        quote: '你是深海中的珍珠，在静默中凝聚光芒，你的光芒不需要被看见，但它真实存在。'
      }
    };

    const profile = profiles[maxDim];

    // 计算百分比
    const percent = {};
    Object.keys(scores).forEach(d => {
      percent[d] = Math.round((scores[d] / 4) * 100);
    });

    return {
      product: 'advanced',
      productName: '心灵花园',
      dimension: dimNames[maxDim],
      dimensionKey: maxDim,
      scores: percent,
      mbti,
      ...profile,
      insights: [
        {
          title: 'MBTI 倾向',
          text: `根据你的答题模式，你可能属于 ${mbti} 类型（仅供参考）`
        },
        {
          title: '大五人格解析',
          text: `开放性 ${percent.O}% · 尽责性 ${percent.C}% · 外向性 ${percent.E}% · 宜人性 ${percent.A}% · 情绪稳定 ${100 - percent.N}%`
        },
        {
          title: '给你的建议',
          text: profile.quote
        }
      ]
    };
  },

  /**
   * 渲染结果页面
   * @param {Object} result 结果对象
   */
  render(result) {
    // 能量图标
    const energyEl = document.getElementById('result-energy');
    if (energyEl) {
      energyEl.textContent = result.emoji;
    }

    // 结果名称
    const nameEl = document.getElementById('result-name');
    if (nameEl) {
      nameEl.textContent = result.name;
    }

    // 副标题
    const subEl = document.getElementById('result-sub');
    if (subEl) {
      subEl.textContent = `${result.productName} · ${result.subtitle}`;
    }

    // 洞察卡片
    const insightsEl = document.getElementById('insight-cards');
    if (insightsEl && result.insights) {
      insightsEl.innerHTML = result.insights.map(insight => `
        <div class="insight-card">
          <h4>${insight.title}</h4>
          <p>${insight.text}</p>
        </div>
      `).join('');
    }

    // 保存结果到 State 供后续使用
    State.set({ lastResult: result }, true);

    // 根据产品类型选择渲染方式
    if (result.product === 'basic') {
      // 意识之境：显示 AI 明信片
      this.renderAIPostcard(result);
    } else {
      // 心灵花园：显示传统结果卡片
      this.renderTraditionalResult(result);
    }
  },

  /**
   * 渲染传统结果卡片（心灵花园用）
   */
  renderTraditionalResult(result) {
    // 显示传统卡片
    const traditionalCard = document.getElementById('result-card-traditional');
    if (traditionalCard) {
      traditionalCard.style.display = 'block';
    }

    // 隐藏 AI 明信片区域
    const aiSection = document.getElementById('ai-postcard-section');
    if (aiSection) {
      aiSection.style.display = 'none';
    }

    // 金句
    const quoteEl = document.getElementById('result-quote');
    if (quoteEl) {
      quoteEl.textContent = result.quote;
    }

    // 作者
    const authorEl = document.getElementById('result-author');
    if (authorEl) {
      authorEl.textContent = '— 心花解读';
    }

    // 更新保存按钮文字
    const saveBtn = document.getElementById('btn-save-result');
    if (saveBtn) {
      saveBtn.textContent = '保存结果';
    }
  },

  /**
   * 渲染 AI 明信片（意识之境用）
   */
  renderAIPostcard(result) {
    // 隐藏传统卡片
    const traditionalCard = document.getElementById('result-card-traditional');
    if (traditionalCard) {
      traditionalCard.style.display = 'none';
    }

    // 显示 AI 明信片区域
    const aiSection = document.getElementById('ai-postcard-section');
    const loadingEl = document.getElementById('postcard-loading');
    const containerEl = document.getElementById('postcard-container');
    const imageEl = document.getElementById('postcard-image');

    if (aiSection) {
      aiSection.style.display = 'block';
    }
    if (loadingEl) {
      loadingEl.style.display = 'block';
    }
    if (containerEl) {
      containerEl.style.display = 'none';
    }

    // 更新保存按钮文字
    const saveBtn = document.getElementById('btn-save-result');
    if (saveBtn) {
      saveBtn.textContent = '保存明信片';
    }

    // 异步生成明信片
    if (typeof AIImage !== 'undefined') {
      AIImage.generatePostcard(result).then(dataUrl => {
        if (imageEl) {
          imageEl.src = dataUrl;
          imageEl.onload = () => {
            if (loadingEl) {
              loadingEl.style.display = 'none';
            }
            if (containerEl) {
              containerEl.style.display = 'block';
            }
          };
        }
      }).catch(err => {
        console.error('Failed to generate postcard:', err);
        // 失败时显示传统结果
        this.renderTraditionalResult(result);
      });
    } else {
      // AIImage 不可用，回退到传统结果
      this.renderTraditionalResult(result);
    }
  },

  /**
   * 生成结果图片（用于分享）
   * @returns {Promise<string>} 图片 Data URL
   */
  async generateImage() {
    const result = State.get().lastResult;
    if (!result) return null;

    // 创建 canvas
    const canvas = document.createElement('canvas');
    canvas.width = 750;
    canvas.height = 1334;
    const ctx = canvas.getContext('2d');

    // 背景
    const gradient = ctx.createLinearGradient(0, 0, 0, 1334);
    gradient.addColorStop(0, '#1C1430');
    gradient.addColorStop(0.5, '#0F1A1A');
    gradient.addColorStop(1, '#0A0E0A');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 750, 1334);

    // 标题
    ctx.fillStyle = '#FDF8F3';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('心花 MindBloom', 375, 100);

    // 结果
    ctx.font = '120px sans-serif';
    ctx.fillText(result.emoji, 375, 280);

    ctx.font = 'bold 56px sans-serif';
    ctx.fillText(result.name, 375, 380);

    ctx.font = '32px sans-serif';
    ctx.fillStyle = 'rgba(253,248,243,0.6)';
    ctx.fillText(result.subtitle, 375, 440);

    // 金句
    ctx.fillStyle = '#FDF8F3';
    ctx.font = '36px sans-serif';
    const words = result.quote.split('');
    let line = '';
    let y = 560;
    const maxWidth = 600;
    const lineHeight = 60;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, 375, y);
        line = words[i];
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 375, y);

    // 底部
    ctx.fillStyle = 'rgba(253,248,243,0.4)';
    ctx.font = '24px sans-serif';
    ctx.fillText('扫码探索你的心灵花园', 375, 1250);

    return canvas.toDataURL('image/png');
  }
};
