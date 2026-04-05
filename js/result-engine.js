/**
 * MindBloom V12 - 结果计算模块
 * 根据答案计算结果类型、生成洞察内容
 */

const ResultEngine = {
  /**
   * 计算测评结果
   * @param {Array} answers - 答案数组
   * @param {string} product - 产品类型
   * @returns {Object} 结果数据
   */
  calculate(answers, product) {
    if (product === 'basic') {
      return this._calculateBasic(answers);
    } else {
      return this._calculateAdvanced(answers);
    }
  },

  /**
   * 计算初级版结果（意识之境）
   * @param {Array} answers - 答案数组
   * @returns {Object} 结果数据
   */
  _calculateBasic(answers) {
    // 计算各维度得分
    const dimensions = {
      energy: 0,      // 能量维度：外向 vs 内向
      emotion: 0,     // 情感维度：理性 vs 感性
      approach: 0,    // 处事维度：计划 vs 随性
      resilience: 0,  // 韧性维度：坚韧 vs 柔和
      connection: 0   // 连接维度：独立 vs 合群
    };

    // 根据答案计算各维度得分
    // 每道题对应一个维度，选项0-3分别对应-2到+2的分数
    const dimensionMap = [
      'energy', 'emotion', 'approach', 'resilience', 'connection',
      'energy', 'emotion', 'approach', 'resilience', 'connection',
      'energy', 'emotion', 'approach', 'resilience', 'connection',
      'energy', 'emotion', 'approach', 'resilience', 'connection',
      'energy', 'emotion', 'approach', 'resilience', 'connection',
      'energy', 'emotion', 'approach', 'resilience', 'connection'
    ];

    answers.forEach((answer, index) => {
      if (answer !== null && dimensionMap[index]) {
        // 将0-3映射到-2到+2
        const score = (answer - 1.5) * 2;
        dimensions[dimensionMap[index]] += score;
      }
    });

    // 根据维度得分确定结果类型
    const resultType = this._determineType(dimensions);
    const typeData = RESULT_TYPES[resultType];

    return {
      type: typeData.name,
      emoji: typeData.emoji,
      flower: typeData.flower,
      flowerMeaning: typeData.meaning,
      letter: typeData.letter,
      insights: typeData.insights,
      dimensions: dimensions,
      gradient: typeData.gradient,
      colors: typeData.colors
    };
  },

  /**
   * 确定结果类型
   * @param {Object} dimensions - 各维度得分
   * @returns {string} 结果类型ID
   */
  _determineType(dimensions) {
    const { energy, emotion, approach, resilience, connection } = dimensions;

    // 根据维度组合判断类型
    // 向日葵型：高能量、高连接、积极
    if (energy > 0 && connection > 0 && emotion > -1) {
      return 'sunflower';
    }

    // 薰衣草型：低能量、内向、宁静
    if (energy < 0 && approach < 0 && emotion < 1) {
      return 'lavender';
    }

    // 梅花型：高韧性、独立、坚韧
    if (resilience > 1 && energy > -1) {
      return 'plum';
    }

    // 樱花型：高情感、随性、感性
    if (emotion > 1 && approach < 0) {
      return 'cherry';
    }

    // 蒲公英型：高随性、独立、自由
    if (approach < -1 && connection < 0) {
      return 'dandelion';
    }

    // 莲花型：高理性、宁静、智慧
    if (emotion < -1 && approach > 0) {
      return 'lotus';
    }

    // 默认根据主导维度判断
    if (energy > 1) return 'sunflower';
    if (energy < -1) return 'lavender';
    if (resilience > 1) return 'plum';
    if (emotion > 1) return 'cherry';
    if (approach < -1) return 'dandelion';
    
    // 默认返回向日葵
    return 'sunflower';
  },

  /**
   * 计算高级版结果（心灵花园）
   * @param {Array} answers - 答案数组
   * @returns {Object} 结果数据
   */
  _calculateAdvanced(answers) {
    // TODO: 实现高级版结果计算（MBTI + 大五人格 + 五行）
    // 目前返回简化版结果
    return {
      type: '你的心灵画像',
      emoji: '🔮',
      mbti: 'INFJ',
      bigFive: {
        openness: 75,
        conscientiousness: 60,
        extraversion: 45,
        agreeableness: 80,
        neuroticism: 30
      },
      wuxing: '木',
      description: '高级版详细报告功能开发中...'
    };
  }
};
