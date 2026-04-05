/**
 * ResultEngine - 结果计算模块
 * 根据答案计算结果类型、生成洞察内容
 */

const ResultEngine = {
  // 结果类型定义
  resultTypes: {
    basic: [
      {
        id: 'sunflower',
        name: '向日葵型',
        emoji: '🌻',
        subtitle: '温暖治愈系',
        color: '#FFD93D',
        description: '你像向日葵一样，永远向着阳光，给身边的人带来温暖和希望。',
        flowerLanguage: '你的内心像向日葵，永远向着阳光。无论遇到什么困难，你都能保持乐观的心态，这种积极的力量会感染身边的每一个人。',
        insights: [
          { title: '性格特点', text: '乐观开朗，善于发现生活中的美好，是朋友圈里的"小太阳"。' },
          { title: '人际关系', text: '你很容易与人建立连接，朋友们都喜欢和你待在一起。' },
          { title: '成长建议', text: '偶尔也要允许自己"不阳光"，接纳负面情绪也是自我关怀的一部分。' }
        ]
      },
      {
        id: 'lavender',
        name: '薰衣草型',
        emoji: '💜',
        subtitle: '宁静优雅系',
        color: '#9B59B6',
        description: '你像薰衣草一样，散发着淡淡的优雅，给周围的人带来宁静与平和。',
        flowerLanguage: '你的内心像薰衣草，宁静而优雅。在喧嚣的世界中，你保持着内心的平和，这种从容不迫的气质让人感到安心。',
        insights: [
          { title: '性格特点', text: '内敛沉稳，善于倾听，是朋友们倾诉心事的对象。' },
          { title: '人际关系', text: '你的陪伴让人感到舒适，朋友们信任你的判断。' },
          { title: '成长建议', text: '适当表达自己的想法，你的声音也值得被听见。' }
        ]
      },
      {
        id: 'rose',
        name: '玫瑰型',
        emoji: '🌹',
        subtitle: '热情浪漫系',
        color: '#E74C3C',
        description: '你像玫瑰一样，热烈而真诚，对生活充满激情和向往。',
        flowerLanguage: '你的内心像玫瑰，热烈而真诚。你对生活充满热爱，敢于追求自己想要的东西，这种勇气令人钦佩。',
        insights: [
          { title: '性格特点', text: '热情奔放，敢爱敢恨，对生活充满好奇心。' },
          { title: '人际关系', text: '你的真诚打动人心，朋友们欣赏你的直率。' },
          { title: '成长建议', text: '热情之余也要学会保护自己，不是所有的付出都需要回报。' }
        ]
      },
      {
        id: 'cherry',
        name: '樱花型',
        emoji: '🌸',
        subtitle: '温柔细腻系',
        color: '#FFB6C1',
        description: '你像樱花一样，温柔细腻，懂得珍惜当下的美好。',
        flowerLanguage: '你的内心像樱花，温柔而细腻。你善于发现生活中的小确幸，懂得珍惜每一个当下，这种态度让生活充满诗意。',
        insights: [
          { title: '性格特点', text: '敏感细腻，富有同情心，对美的感知力很强。' },
          { title: '人际关系', text: '你的体贴让人感到温暖，朋友们感激你的关心。' },
          { title: '成长建议', text: '不要过于在意他人的评价，你的价值不需要别人来定义。' }
        ]
      },
      {
        id: 'bamboo',
        name: '青竹型',
        emoji: '🎋',
        subtitle: '坚韧成长系',
        color: '#27AE60',
        description: '你像青竹一样，坚韧不拔，在默默中成长，终将挺拔向上。',
        flowerLanguage: '你的内心像青竹，坚韧而有节。你不张扬，却在默默中积蓄力量，这种坚持终将让你成为更好的自己。',
        insights: [
          { title: '性格特点', text: '坚韧执着，有原则，遇到困难不轻易放弃。' },
          { title: '人际关系', text: '你的可靠让人信赖，朋友们知道可以依靠你。' },
          { title: '成长建议', text: '适当放松对自己的要求，成长也需要休息和调整。' }
        ]
      },
      {
        id: 'lotus',
        name: '莲花型',
        emoji: '🪷',
        subtitle: '智慧清净系',
        color: '#F8C471',
        description: '你像莲花一样，出淤泥而不染，保持着内心的纯净与智慧。',
        flowerLanguage: '你的内心像莲花，纯净而智慧。在复杂的世界中，你保持着清醒的头脑和纯净的心灵，这种智慧是难得的财富。',
        insights: [
          { title: '性格特点', text: '清醒独立，有自己的价值观，不随波逐流。' },
          { title: '人际关系', text: '你的智慧让人敬佩，朋友们愿意听取你的建议。' },
          { title: '成长建议', text: '智慧也需要温度，适当展现柔软的一面会让你更亲近。' }
        ]
      }
    ],
    advanced: [
      {
        id: 'explorer',
        name: '探索者型',
        emoji: '🔭',
        subtitle: 'ENTP · 开放性主导',
        color: '#3498DB',
        bigFive: { openness: 85, conscientiousness: 60, extraversion: 75, agreeableness: 55, neuroticism: 45 },
        mbti: 'ENTP',
        wuxing: '火',
        description: '你充满好奇心，喜欢探索新事物，思维活跃，善于发现可能性。',
        insights: [
          { title: '开放性', text: '85% - 你对新事物充满好奇，喜欢尝试不同的体验。' },
          { title: '尽责性', text: '60% - 你有一定的计划性，但也乐于随机应变。' },
          { title: '外向性', text: '75% - 你从社交中获得能量，喜欢与人交流想法。' },
          { title: '宜人性', text: '55% - 你重视真理胜过和谐，有时会显得直接。' },
          { title: '神经质', text: '45% - 你情绪相对稳定，能够应对压力。' }
        ]
      },
      {
        id: 'architect',
        name: '建筑师型',
        emoji: '🏗️',
        subtitle: 'INTJ · 尽责性主导',
        color: '#2C3E50',
        bigFive: { openness: 70, conscientiousness: 90, extraversion: 40, agreeableness: 50, neuroticism: 35 },
        mbti: 'INTJ',
        wuxing: '金',
        description: '你逻辑严密，善于规划，追求完美，是可靠的执行者。',
        insights: [
          { title: '开放性', text: '70% - 你有创新思维，但更注重实用性。' },
          { title: '尽责性', text: '90% - 你高度自律，对目标有坚定的执行力。' },
          { title: '外向性', text: '40% - 你更喜欢独处或与少数亲密的人相处。' },
          { title: '宜人性', text: '50% - 你重视效率，有时会显得不够圆滑。' },
          { title: '神经质', text: '35% - 你情绪非常稳定，很少焦虑。' }
        ]
      },
      {
        id: 'diplomat',
        name: '外交官型',
        emoji: '🕊️',
        subtitle: 'ENFJ · 宜人性主导',
        color: '#E91E63',
        bigFive: { openness: 65, conscientiousness: 70, extraversion: 80, agreeableness: 90, neuroticism: 50 },
        mbti: 'ENFJ',
        wuxing: '木',
        description: '你富有同理心，善于协调关系，是天生的领导者和沟通者。',
        insights: [
          { title: '开放性', text: '65% - 你接受新观念，但更重视传统价值。' },
          { title: '尽责性', text: '70% - 你有责任感，会为了他人而努力。' },
          { title: '外向性', text: '80% - 你从帮助他人中获得能量。' },
          { title: '宜人性', text: '90% - 你极度重视和谐，善于照顾他人感受。' },
          { title: '神经质', text: '50% - 你有时会为他人的问题感到担忧。' }
        ]
      },
      {
        id: 'guardian',
        name: '守护者型',
        emoji: '🛡️',
        subtitle: 'ISFJ · 稳定性主导',
        color: '#795548',
        bigFive: { openness: 45, conscientiousness: 85, extraversion: 45, agreeableness: 80, neuroticism: 40 },
        mbti: 'ISFJ',
        wuxing: '土',
        description: '你忠诚可靠，注重细节，默默守护着身边的人和事。',
        insights: [
          { title: '开放性', text: '45% - 你偏好熟悉的事物，变化会让你不安。' },
          { title: '尽责性', text: '85% - 你非常可靠，承诺的事情一定会做到。' },
          { title: '外向性', text: '45% - 你更喜欢小圈子的深度交流。' },
          { title: '宜人性', text: '80% - 你总是把他人的需求放在前面。' },
          { title: '神经质', text: '40% - 你情绪稳定，但会为他人的不幸感到难过。' }
        ]
      },
      {
        id: 'artist',
        name: '艺术家型',
        emoji: '🎨',
        subtitle: 'ISFP · 感性主导',
        color: '#9C27B0',
        bigFive: { openness: 80, conscientiousness: 50, extraversion: 50, agreeableness: 65, neuroticism: 60 },
        mbti: 'ISFP',
        wuxing: '水',
        description: '你富有创造力，追求美感，活在当下，享受生活的每一刻。',
        insights: [
          { title: '开放性', text: '80% - 你有丰富的想象力和艺术天赋。' },
          { title: '尽责性', text: '50% - 你随性而为，不喜欢被规则束缚。' },
          { title: '外向性', text: '50% - 你在熟悉的人面前很活泼，陌生人面前较安静。' },
          { title: '宜人性', text: '65% - 你心地善良，但有自己的底线。' },
          { title: '神经质', text: '60% - 你情绪丰富，容易受到环境影响。' }
        ]
      }
    ]
  },

  /**
   * 计算结果
   * @param {string} product - 'basic' | 'advanced'
   * @param {Array} answers - 答案数组
   * @param {Object} userInfo - 用户信息
   * @returns {Object} 结果对象
   */
  calculate(product, answers, userInfo = {}) {
    if (product === 'basic') {
      return this._calculateBasic(answers, userInfo);
    } else {
      return this._calculateAdvanced(answers, userInfo);
    }
  },

  /**
   * 计算初级版结果
   * @private
   */
  _calculateBasic(answers, userInfo) {
    // 简单的计分逻辑：根据答案分布选择结果类型
    const sum = answers.reduce((a, b) => a + b, 0);
    const avg = sum / answers.length;
    
    // 根据平均分选择结果类型
    const types = this.resultTypes.basic;
    const index = Math.floor(avg * types.length / 4) % types.length;
    const resultType = types[index];

    return {
      product: 'basic',
      productName: '意识之境',
      ...resultType,
      userInfo,
      completedAt: Date.now()
    };
  },

  /**
   * 计算高级版结果
   * @private
   */
  _calculateAdvanced(answers, userInfo) {
    // 高级版：根据答案分布计算大五人格维度
    // 简化版：每40题对应一个维度
    const dimensions = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
    const scores = {};

    dimensions.forEach((dim, idx) => {
      const start = idx * 40;
      const dimAnswers = answers.slice(start, start + 40);
      const sum = dimAnswers.reduce((a, b) => a + (b || 0), 0);
      scores[dim] = Math.min(100, Math.max(0, Math.round((sum / 120) * 100)));
    });

    // 根据最高分维度选择结果类型
    const maxDim = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
    const typeMap = {
      openness: 'explorer',
      conscientiousness: 'architect',
      agreeableness: 'diplomat',
      extraversion: 'diplomat',
      neuroticism: 'artist'
    };

    const resultType = this.resultTypes.advanced.find(t => t.id === typeMap[maxDim]) || this.resultTypes.advanced[0];

    return {
      product: 'advanced',
      productName: '心灵花园',
      ...resultType,
      bigFive: scores,
      userInfo,
      completedAt: Date.now()
    };
  }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResultEngine;
}
