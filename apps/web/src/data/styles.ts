/**
 * 风格库前端数据 — 从后端 style-database.ts 精简而来
 * 22 种风格，按 10 个分类组织
 */

export interface StyleCard {
  id: string;
  name: string;
  category: StyleCategory;
  description: string;
  philosophy: string;
  difficulty: number; // 1-5
  silhouette: string[];
  keyItems: string[];
  colorPalette: string[];
}

export type StyleCategory =
  | '日系'
  | '韩系'
  | '欧式'
  | '美式'
  | '中式'
  | '极简'
  | '街头'
  | '女性化'
  | '复古'
  | '前卫';

export const CATEGORY_LABELS: Record<StyleCategory, string> = {
  '日系': '日系',
  '韩系': '韩系',
  '欧式': '欧式',
  '美式': '美式',
  '中式': '中式',
  '极简': '极简',
  '街头': '街头',
  '女性化': '女性化',
  '复古': '复古',
  '前卫': '前卫',
};

export const ALL_CATEGORIES: StyleCategory[] = [
  '日系', '韩系', '欧式', '美式', '中式', '极简', '街头', '女性化', '复古', '前卫',
];

export const STYLES: StyleCard[] = [
  // ==================== 日系 ====================
  {
    id: 'jp_fresh',
    name: '日系清新',
    category: '日系',
    description: '柔和色调、宽松剪裁、自然材质，营造温柔治愈感',
    philosophy: '不刻意追求时髦，在自然舒适中流露女性的柔美与亲和。',
    difficulty: 2,
    silhouette: ['A字型', 'H型宽松', '茧型'],
    keyItems: ['棉麻衬衫', '阔腿裤', '针织开衫', '长裙', '帆布包'],
    colorPalette: ['#F5E6E0', '#D4E5D9', '#E8D5E0', '#C5B9CD'],
  },
  {
    id: 'jp_minimal',
    name: '日系简约',
    category: '日系',
    description: '去繁从简，用质感与剪裁代替装饰，穿出无声的高级',
    philosophy: '极致的减法美学，不依赖色彩与图案，用剪裁、面料、比例讲一个关于质感的故事。',
    difficulty: 2,
    silhouette: ['H型', '直筒', '微A型'],
    keyItems: ['垂坠阔腿裤', '无领衬衫', '针织背心', '直筒大衣', '素色帆布鞋'],
    colorPalette: ['#F5F5F0', '#2C2C2C', '#8B8B83', '#D4C5B9'],
  },
  {
    id: 'jp_harajuku',
    name: '原宿风',
    category: '日系',
    description: '大胆撞色、层叠混搭、打破一切规则的穿衣态度',
    philosophy: '穿衣不为取悦任何人，是自我表达最直接的语言。',
    difficulty: 4,
    silhouette: ['破碎廓形', '超大Oversize', '不对称'],
    keyItems: ['印花卫衣', '百褶裙', '厚底鞋', '彩色袜子', '夸张配饰'],
    colorPalette: ['#FF6B9D', '#00D4FF', '#FFD700', '#9B59B6'],
  },

  // ==================== 韩系 ====================
  {
    id: 'kr_minimal',
    name: '韩系简约',
    category: '韩系',
    description: '干净线条、中性色调、温柔而有距离感的高级日常',
    philosophy: '看起来毫不费力，其实每一件单品都经过精心挑选。',
    difficulty: 2,
    silhouette: ['H型宽松', '上宽下窄', '高腰线'],
    keyItems: ['阔腿西裤', '针织衫', '过膝大衣', '白色运动鞋', '简约托特包'],
    colorPalette: ['#F5F5F0', '#C4B5A5', '#8B8B83', '#B8C9D4'],
  },

  // ==================== 欧式 ====================
  {
    id: 'fr_elegance',
    name: '法式优雅',
    category: '欧式',
    description: '简约不简单，讲究质感和细节，散发随性而来的优雅气质',
    philosophy: '真正的优雅是穿得像自己，而且只穿最好的那一面。',
    difficulty: 3,
    silhouette: ['X型收腰', 'V领', '微A裙摆'],
    keyItems: ['条纹衫', '裹身裙', '小西装', '丝巾', '贝雷帽'],
    colorPalette: ['#C41E3A', '#2C2C2C', '#FFFFFF', '#1A3C5E'],
  },
  {
    id: 'it_dolce_vita',
    name: '意式风情',
    category: '欧式',
    description: '热烈性感、剪裁精良、不吝啬展示身材曲线的自信穿搭',
    philosophy: '人生苦短，穿得美就是对自己最好的尊重。',
    difficulty: 3,
    silhouette: ['X型收腰', '深V领', '包臀'],
    keyItems: ['裹身裙', '真丝衬衫', '铅笔裙', '金色饰品', '尖头高跟鞋'],
    colorPalette: ['#1A1A1A', '#B22222', '#DAA520', '#8B4513'],
  },
  {
    id: 'uk_prep',
    name: '英伦学院',
    category: '欧式',
    description: '经典格纹、羊毛质地、知识分子式的讲究穿搭',
    philosophy: '穿戴的是传统与教养，而不是流行。',
    difficulty: 3,
    silhouette: ['H型', 'A型大衣', '直筒'],
    keyItems: ['格纹西装', '羊毛V领', '牛津衬衫', '乐福鞋', '风衣'],
    colorPalette: ['#8B4513', '#2C3E50', '#8B0000', '#3B5323'],
  },

  // ==================== 美式 ====================
  {
    id: 'us_vintage',
    name: '美式复古',
    category: '美式',
    description: '90年代复古风潮，牛仔、格纹、做旧质感',
    philosophy: '好的设计不会过时，用复古单品穿出当下最酷的造型。',
    difficulty: 2,
    silhouette: ['直筒', 'Oversize', '高腰直筒'],
    keyItems: ['直筒牛仔裤', '格纹衬衫', '卫衣', '马丁靴', '牛仔夹克'],
    colorPalette: ['#4A6FA5', '#C4976A', '#E8E0D5', '#8B4513'],
  },
  {
    id: 'us_sporty',
    name: '美式休闲运动',
    category: '美式',
    description: '运动服走出健身房，成为日常穿搭的主角',
    philosophy: '舒适不再是居家的特权，可以体面地穿着运动裤出现在任何场合。',
    difficulty: 1,
    silhouette: ['上宽下窄', 'H型', '茧型卫衣'],
    keyItems: ['连帽卫衣', '运动紧身裤', '棒球帽', '运动鞋', '腰包'],
    colorPalette: ['#2C2C2C', '#FFFFFF', '#808080', '#FF4500'],
  },

  // ==================== 中式 ====================
  {
    id: 'cn_new_chinese',
    name: '新中式',
    category: '中式',
    description: '以东方传统元素为魂，现代剪裁为骨，穿出中国式的优雅与克制',
    philosophy: '传承不是复制历史，而是用现代的设计语言讲东方的故事。',
    difficulty: 4,
    silhouette: ['立领H型', 'A型长衫', '斜襟收腰'],
    keyItems: ['改良旗袍', '立领衬衫', '盘扣外套', '阔腿绸裤', '玉/银饰品'],
    colorPalette: ['#1A1A1A', '#FFFFFF', '#C41E3A', '#2F4F4F'],
  },

  // ==================== 极简 ====================
  {
    id: 'minimalist',
    name: '极简主义',
    category: '极简',
    description: '少即是多，用最少的单品打造最有质感的造型',
    philosophy: '当所有的多余都被去除，剩下的就是纯粹的自己。',
    difficulty: 2,
    silhouette: ['H型', '直筒', '微A'],
    keyItems: ['白衬衫', '黑色高领', '直筒西裤', '简约大衣', '素色球鞋'],
    colorPalette: ['#000000', '#FFFFFF', '#808080', '#F5F5F0'],
  },
  {
    id: 'clean_fit',
    name: 'Clean Fit',
    category: '极简',
    description: '没有一件多余的单品，整洁干净的当代都市穿搭',
    philosophy: '看起来什么都没穿对，但每一件都刚好合身。',
    difficulty: 2,
    silhouette: ['微宽松合身', '直筒', '短款上装'],
    keyItems: ['白T恤', '直筒牛仔裤', '棒球帽', '帆布鞋', '基础款卫衣'],
    colorPalette: ['#FFFFFF', '#F5F5F0', '#D3D3D3', '#87CEEB'],
  },
  {
    id: 'old_money',
    name: '老钱风',
    category: '极简',
    description: '不显山露水的高级，用面料和剪裁说话的静奢主义',
    philosophy: '真正富有的人不需要告诉别人自己穿的是什么牌子。',
    difficulty: 4,
    silhouette: ['合身H型', '微A型大衣', 'V领针织'],
    keyItems: ['羊绒衫', '羊毛大衣', '珍珠项链', '乐福鞋', '丝巾'],
    colorPalette: ['#F5F5DC', '#D2B48C', '#8B7355', '#1C2841'],
  },

  // ==================== 街头 ====================
  {
    id: 'streetwear',
    name: '街头潮流',
    category: '街头',
    description: '以嘻哈、滑板文化为根基的当代潮流穿搭',
    philosophy: '潮流是一种态度——你可以不认同，但不能看不见。',
    difficulty: 3,
    silhouette: ['超大Oversize', '上宽下窄', '不规则'],
    keyItems: ['宽松卫衣', '工装裤', '高帮球鞋', '棒球帽', '链条配饰'],
    colorPalette: ['#1A1A1A', '#FF3333', '#FFFFFF', '#4A6FA5'],
  },
  {
    id: 'y2k',
    name: 'Y2K 千禧风',
    category: '街头',
    description: '回归千禧年代的科技感和未来主义美学',
    philosophy: '回到那个互联网刚刚开始、每个人都对未来充满想象的年代。',
    difficulty: 3,
    silhouette: ['短上衣+低腰裤', '紧身+宽松', '不对称'],
    keyItems: ['短款上衣', '工装裤', '厚底鞋', '小墨镜', '金属腰链'],
    colorPalette: ['#FF69B4', '#C0C0C0', '#87CEEB', '#DDA0DD'],
  },
  {
    id: 'gorpcore',
    name: '户外机能',
    category: '街头',
    description: '把户外装备穿成日常时装，功能性与造型感并存',
    philosophy: '最好的衣服是可以陪你走遍世界的衣服。',
    difficulty: 3,
    silhouette: ['层叠机能', '多口袋廓形', '工装锥形'],
    keyItems: ['冲锋衣', '抓绒中层', '机能马甲', '工装裤', '徒步鞋'],
    colorPalette: ['#3B5323', '#1A1A1A', '#C4B5A5', '#FF6600'],
  },
  {
    id: 'utility_workwear',
    name: '工装风',
    category: '街头',
    description: '从工人装束演化而来的实用主义穿搭，硬朗、多口袋、耐磨',
    philosophy: '衣服首先是工具，然后才是装饰。功能本身就是一种美学。',
    difficulty: 2,
    silhouette: ['直筒', '锥形', '方形廓形'],
    keyItems: ['工装夹克', '帆布裤', '牛仔衬衫', '工装靴', '帆布腰带'],
    colorPalette: ['#8B7355', '#3B5323', '#4A6FA5', '#1A1A1A'],
  },

  // ==================== 女性化 ====================
  {
    id: 'soft_feminine',
    name: '温柔甜美',
    category: '女性化',
    description: '以柔和的色彩和女性化的细节营造甜美温柔的少女感',
    philosophy: '甜也可以有层次——像品尝一块精致的法式甜点，甜而不腻。',
    difficulty: 2,
    silhouette: ['A字裙', '泡泡袖', '收腰大摆'],
    keyItems: ['碎花连衣裙', '针织开衫', '玛丽珍鞋', '蝴蝶结发饰', '蕾丝衬衫'],
    colorPalette: ['#FFB6C1', '#E6E6FA', '#FFF0F5', '#FFE4E1'],
  },
  {
    id: 'mature_elegance',
    name: '轻熟风',
    category: '女性化',
    description: '精致不张扬、温柔有力量，刚柔并济的成熟女性穿搭',
    philosophy: '真正的成熟，是柔软中带着坚定，温柔里藏着锋芒。',
    difficulty: 3,
    silhouette: ['X型收腰', '铅笔裙', '阔腿裤+修身针织'],
    keyItems: ['真丝衬衫', '羊绒衫', '铅笔裙', '尖头细跟鞋', '珍珠饰品'],
    colorPalette: ['#D4C5B9', '#8B7B8B', '#4A6FA5', '#C4A882'],
  },

  // ==================== 复古 ====================
  {
    id: 'bohemian',
    name: '波西米亚',
    category: '复古',
    description: '自由浪漫的流浪者风格，宽松飘逸、图案丰富',
    philosophy: '穿得像刚从远方回来的人——不在乎规则，只在乎故事。',
    difficulty: 3,
    silhouette: ['垂坠A型', '层叠', 'Oversize'],
    keyItems: ['印花长裙', '流苏马甲', '宽檐帽', '民族风配饰', '麂皮靴'],
    colorPalette: ['#C4A35A', '#8B4513', '#D2691E', '#2E4057'],
  },

  // ==================== 前卫 ====================
  {
    id: 'intellectual_chic',
    name: '知识分子风',
    category: '前卫',
    description: '像刚从图书馆走出来，自由散漫却充满思考痕迹的穿搭',
    philosophy: '穿衣服的智慧不在于跟风，在于知道什么衬得上你的大脑。',
    difficulty: 3,
    silhouette: ['宽松H型', '落肩', '直筒阔腿'],
    keyItems: ['宽松西装', '高领针织', '直筒裤', '帆布袋', '眼镜'],
    colorPalette: ['#8B7355', '#696969', '#2F4F4F', '#D4C4A8'],
  },
  {
    id: 'dark_academia',
    name: '暗黑学院',
    category: '前卫',
    description: '哥特气质的学术风，深色调、复古剪裁，像从中世纪图书馆走出',
    philosophy: '美不只是光明的，深沉中藏着更厚重的情感与思考。',
    difficulty: 4,
    silhouette: ['层叠A型', 'H型大衣', '高领+长外套'],
    keyItems: ['黑色高领', '羊毛大衣', '格纹长裤', '皮靴', '暗色围巾'],
    colorPalette: ['#0A0A0A', '#2C1810', '#3B0B0B', '#1A3C2A'],
  },
];
