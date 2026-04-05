/**
 * MindBloom V12 - 全局配置
 */

const CONFIG = {
  // 应用信息
  app: {
    name: '心花 MindBloom',
    tagline: '在喧嚣世界里，为你辟一处心灵花园',
    version: '12.0.0'
  },

  // 体验码配置
  code: {
    length: 4,              // 4位数字
    expiresHours: 24,       // 24小时过期
    adminPassword: 'mindbloom2026'
  },

  // 产品配置
  products: {
    basic: {
      id: 'basic',
      name: '意识之境',
      subtitle: '30题趣味测评',
      description: '发现你的心灵类型',
      price: 2.99,
      questionCount: 30,
      icon: '🌻',
      color: 'linear-gradient(135deg, #FF6B9D 0%, #FF8E53 100%)',
      label: '初级'
    },
    advanced: {
      id: 'advanced',
      name: '心灵花园',
      subtitle: '200题深度测评',
      description: 'MBTI + 大五人格 + 五行',
      price: 29.9,
      questionCount: 200,
      icon: '🌸',
      color: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)',
      label: '高级'
    }
  },

  // 颜色配置（粉色渐变幻彩主题）
  colors: {
    primary: '#FF6B9D',
    secondary: '#FF8E53',
    accent: '#C44569',
    background: 'linear-gradient(180deg, #FFF5F7 0%, #FFE4EC 50%, #FFD4E5 100%)',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    textPrimary: '#2D1B2E',
    textSecondary: '#6B4E5B',
    textLight: '#9B7B8B',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336'
  },

  // 动画配置
  animation: {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },

  // 存储键名
  storage: {
    codes: 'mindbloom_v12_codes',
    admin: 'mindbloom_v12_admin',
    session: 'mindbloom_v12_session'
  }
};

// 结果类型配置（意识之境）
const RESULT_TYPES = {
  sunflower: {
    id: 'sunflower',
    name: '向日葵型',
    emoji: '🌻',
    flower: '向日葵',
    meaning: '永远向着阳光，温暖而坚定',
    colors: ['#FFD700', '#FFA500', '#FF6B35'],
    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    letter: `亲爱的，你的内心像向日葵一样，永远追寻着光。

即使在阴天，你也知道太阳就在那里。这份温暖不仅照亮你自己，也感染着身边的人。

你天生具有鼓舞他人的力量，请继续保持这份光芒。`,
    insights: [
      '你是朋友圈里的"小太阳"',
      '乐观是你最大的超能力',
      '你擅长在困境中发现希望',
      '你的热情能温暖周围的人'
    ]
  },
  lavender: {
    id: 'lavender',
    name: '薰衣草型',
    emoji: '🪻',
    flower: '薰衣草',
    meaning: '宁静致远，淡泊明志',
    colors: ['#9B59B6', '#8E44AD', '#6C3483'],
    gradient: 'linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%)',
    letter: `你好呀，像薰衣草一样宁静美好的你。

在这个喧嚣的世界里，你总能找到属于自己的宁静角落。你的内心有一片净土，不被外界的纷扰所动摇。

这份宁静不是冷漠，而是一种深沉的力量。请继续守护这份内心的平和。`,
    insights: [
      '你拥有难得的内心平静',
      '独处时你感到最自在',
      '你善于倾听和理解他人',
      '你的存在本身就是一种治愈'
    ]
  },
  plum: {
    id: 'plum',
    name: '梅花型',
    emoji: '🌸',
    flower: '梅花',
    meaning: '傲雪凌霜，坚韧不拔',
    colors: ['#FFB6C1', '#FF69B4', '#C71585'],
    gradient: 'linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%)',
    letter: `亲爱的梅花，最寒冷的时候，正是你绽放的时刻。

生活给你的挑战，你都默默接下。你不张扬，却在风雪中站得最稳。这份坚韧，是你最珍贵的品质。

请记住，你的坚强值得被看见，也值得被温柔以待。`,
    insights: [
      '你有超乎常人的韧性',
      '困难面前你从不轻言放弃',
      '你的坚强是内敛而深沉的',
      '你总能在逆境中找到出路'
    ]
  },
  cherry: {
    id: 'cherry',
    name: '樱花型',
    emoji: '🌸',
    flower: '樱花',
    meaning: '美好易逝，珍惜当下',
    colors: ['#FFC0CB', '#FFB6C1', '#FF69B4'],
    gradient: 'linear-gradient(135deg, #FFC0CB 0%, #FFB6C1 100%)',
    letter: `嗨，像樱花一样美好的你。

你深知美好的事物总是短暂，所以更懂得珍惜每一个当下。你用心感受生活中的小确幸，把平凡的日子过成诗。

这份敏感不是脆弱，而是对生活最真挚的热爱。请继续用心感受这个世界。`,
    insights: [
      '你对美有独特的感知力',
      '你珍惜每一个当下',
      '你的情感丰富而细腻',
      '你能发现生活中的小美好'
    ]
  },
  dandelion: {
    id: 'dandelion',
    name: '蒲公英型',
    emoji: '🌼',
    flower: '蒲公英',
    meaning: '随风而行，无拘无束',
    colors: ['#F0E68C', '#FFD700', '#FFFACD'],
    gradient: 'linear-gradient(135deg, #F0E68C 0%, #FFD700 100%)',
    letter: `你好呀，自由的蒲公英。

你不喜欢被束缚，渴望探索世界的每一个角落。风带你去哪里，哪里就是你的家。这份洒脱，是很多人羡慕却做不到的。

请继续保持这份对自由的向往，世界很大，值得你去看看。`,
    insights: [
      '你渴望自由和冒险',
      '你适应力极强',
      '你不喜欢被规则束缚',
      '你的生活充满可能性'
    ]
  },
  lotus: {
    id: 'lotus',
    name: '莲花型',
    emoji: '🪷',
    flower: '莲花',
    meaning: '出淤泥而不染，通透智慧',
    colors: ['#FFB6C1', '#FFC0CB', '#FFF0F5'],
    gradient: 'linear-gradient(135deg, #FFB6C1 0%, #FFC0CB 100%)',
    letter: `亲爱的莲花，你在浑浊中保持清澈，在纷扰中保持清醒。

你有一种看透事物本质的智慧，却不以此自傲。你温和地对待世界，也温和地对待自己。

这份通透是岁月的馈赠，请继续用你的智慧照亮自己和他人。`,
    insights: [
      '你有超越年龄的智慧',
      '你能看透事物的本质',
      '你待人温和而有分寸',
      '你的内心纯净而通透'
    ]
  }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, RESULT_TYPES };
}
