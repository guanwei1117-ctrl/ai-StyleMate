/**
 * 风格库前端数据 — 80 种风格，按 4 大维度组织
 *
 * 维度：
 *   - 地域文化 (region)：按国家/地区文化划分
 *   - 视觉元素 (visual)：按核心视觉辨识度划分
 *   - 场景圈层 (scene)：按使用场景与兴趣圈划分
 *   - 人物原型 (archetype)：按人物原型/亚文化划分
 *
 * 类型定义从 @stylemate/shared 统一导入。
 */

import type {
  StyleCard,
  StyleDimension,
  StyleCategory,
} from '@stylemate/shared';
export type { StyleCard, StyleDimension, StyleCategory };

export const DIMENSION_LABELS: Record<StyleDimension, string> = {
  '地域文化': '地域文化',
  '视觉元素': '视觉元素',
  '场景圈层': '场景圈层',
  '人物原型': '人物原型',
};

export const DIMENSIONS: StyleDimension[] = ['地域文化', '视觉元素', '场景圈层', '人物原型'];

/**
 * 子标签汇总（用于筛选）
 */
export const CATEGORY_LABELS: Record<string, string> = {
  // 地域文化
  '法式': '法式', '意式': '意式', '英伦': '英伦', '美式': '美式',
  '日系': '日系', '中式': '中式', '港风': '港风', '韩系': '韩系',
  '北欧': '北欧', '波西米亚': '波西米亚', '拉美': '拉美',
  // 视觉元素
  '色彩美学': '色彩美学', '质感主义': '质感主义', '极繁': '极繁', '未来科技': '未来科技',
  '暗黑': '暗黑', '女性力量': '女性力量', '清新甜美': '清新甜美', '复古视觉': '复古视觉',
  // 场景圈层
  '户外运动': '户外运动', '街头潮流': '街头潮流', '职场精英': '职场精英',
  '休闲度假': '休闲度假', '文化艺术': '文化艺术', '音乐舞台': '音乐舞台',
  '运动休闲': '运动休闲', '派对社交': '派对社交',
  // 人物原型
  '影视角色': '影视角色', '亚文化': '亚文化', '历史复古': '历史复古',
  '性别表达': '性别表达', '梦幻幻想': '梦幻幻想',
};

export const ALL_CATEGORIES: string[] = Object.keys(CATEGORY_LABELS);

// ============================================================================
// 80 种风格数据
// ============================================================================

export const STYLES: StyleCard[] = [

  // ==================== 一、地域文化（20种）====================
  {
    id: 'fr_effortless',
    name: '法式慵懒风',
    dimension: '地域文化', category: '法式',
    description: '毫不费力的时髦——针织衫、牛仔裤、茶歇裙、编织篮，低饱和度红白蓝',
    philosophy: '真正的优雅是看起来毫不费力，像刚起床就穿好的样子。',
  summary: '法式慵懒风的核心是"毫不费力"——不刻意、不紧绷，用基础款穿出随性优雅。条纹针织衫、直筒牛仔裤、茶歇裙是灵魂单品，搭配编织篮包和贝雷帽就是经典法式。',
  keyItemDescriptions: [
    '经典法式条纹，搭配高腰直筒牛仔裤',
    '版型利落，修饰腿型',
    'V领设计，慵懒中带点小性感',
    '法式街拍标配，装什么都不重要',
    '斜纹软呢或纯色羊毛，点睛之笔'
  ],
  silhouetteDescription: '微宽松合身是法式慵懒的核心——不紧绷也不松垮，V领修饰脸型，高腰直筒拉长比例。',
  colorDescription: '低饱和度红白蓝是法式标配——红不过艳、蓝不过深，像南法午后的阳光。',
    difficulty: 2,
    silhouette: ['微宽松合身', 'V领', '高腰直筒'],
    keyItems: ['条纹针织衫', '直筒牛仔裤', '茶歇裙', '编织篮包', '贝雷帽'],
    colorPalette: ['#C41E3A', '#2C3E50', '#FFFFFF', '#F5F0EB'],
  
  styleSpecificAdvice: {
    suitableFor: '适合喜欢"不费力时髦感"的人——不追求夸张造型，但注重面料质感和细节。梨形和沙漏形身材尤其友好，V领和高腰设计能很好地修饰比例。',
    cautionPoints: '不要为了"慵懒"穿得松垮没型。慵懒和邋遢的界限在于面料质感——选有筋骨感的针织和挺括的牛仔，避免软塌塌的廉价面料。',
    sceneAdvice: '日常通勤、周末咖啡馆、轻约会、艺术展。法式慵懒的松弛感在非正式场合最出彩，正式场合需搭配西装外套提升精致度。',
  },
  seasonalLooks: [
    { season: 'spring_summer', title: '夏日法式慵懒', description: '条纹针织衫搭配合身直筒牛仔裤，脚踩草编底帆布鞋，配一个编织篮包。慵懒中带着南法阳光的味道。', items: ['条纹针织衫', '直筒牛仔裤', '草编底帆布鞋', '编织篮包', '草帽'] },
    { season: 'autumn_winter', title: '秋冬法式暖意', description: '高领羊绒衫外搭羊毛西装外套，下身配直筒西裤，脚踩切尔西靴。围一条丝巾，既保暖又有法式优雅。', items: ['高领羊绒衫', '羊毛西装外套', '直筒西裤', '切尔西靴', '丝巾'] },
  ],
  brandRecommendations: [
    { tier: 'premium', brandName: 'Sézane', priceRange: '¥800-3,000', reason: '法式慵懒的代表品牌' },
    { tier: 'mid', brandName: '& Other Stories', priceRange: '¥300-1,500', reason: '法式风格平替，版型和面料都很好' },
    { tier: 'budget', brandName: 'UNIQLO U系列', priceRange: '¥99-500', reason: '基础款法式穿搭的最佳起点' },
  ],
  colorGuidance: {
    primary: '海军蓝、米白——法式基调色，占整体搭配的60%',
    secondary: '砖红、焦糖——温暖点缀，占30%',
    accent: '正红——点睛之笔，占10%',
    ratio: '60% 基础色 + 30% 暖色调 + 10% 点缀色',
  },
  bodyFitTips: {
    pearShape: 'V领上衣+高腰直筒裤，突出上半身优势，遮住大腿和臀部',
    appleShape: 'H型中长外套+直筒连衣裙，纵向拉长线条，避免腰部束缚',
    hourglass: '收腰茶歇裙+微宽松针织，突出腰线，展现曲线优势',
    rectangle: 'V领针织+高腰微喇裤，增加上半身量感和下半身曲线',
    invertedTriangle: '深V上衣+A字长裙，弱化肩宽，增加下半身量感',
  },
  similarStyles: ['fr_countryside', 'kr_effortless'],
  nextStyles: ['it_passione', 'old_money'],
},
  {
    id: 'fr_countryside',
    name: '法式田园风',
    dimension: '地域文化', category: '法式',
    description: '南法乡村的惬意浪漫——碎花裙、草编帽、菜篮子包',
    philosophy: '生活是田野间的野餐，衣服是阳光和花香织成的。',
  summary: '南法乡村的惬意浪漫，碎花裙、草编帽、菜篮子包是标志性元素。强调自然、柔软、有生活气息的穿搭，像刚从普罗旺斯的花田里走出来。',
  keyItemDescriptions: [
    '碎花图案，收腰A字版型',
    '宽檐设计，遮阳又上镜',
    '手工编织感，田园氛围拉满',
    '领口蕾丝装饰，甜美不甜腻',
    '平底舒适，适合长时间散步'
  ],
    difficulty: 2,
    silhouette: ['A字裙', '泡泡袖', '收腰大摆'],
    keyItems: ['碎花连衣裙', '草编帽', '菜篮子包', '蕾丝领衬衫', '平底凉鞋'],
    colorPalette: ['#FFFACD', '#E8D5E0', '#98FB98', '#F5F5DC'],
  
  styleSpecificAdvice: {
    suitableFor: '适合喜欢浪漫田园风格、追求自然舒适感的人。碎花和棉麻材质对肤色包容度高，暖皮和冷皮都能找到合适的色调。',
    cautionPoints: '避免全身碎花叠碎花——碎花单品搭配纯色基础款更高级。草编包和碎花裙同时出现时，其他单品尽量保持简约。',
    sceneAdvice: '春游野餐、周末市集、度假旅行、花园派对。不适合正式商务场合和晚宴。',
  },
  brandRecommendations: [
    { tier: 'premium', brandName: 'Sézane', priceRange: '¥800-3,000', reason: '法式慵懒的代表品牌' },
    { tier: 'mid', brandName: '& Other Stories', priceRange: '¥300-1,500', reason: '法式风格平替，版型和面料都很好' },
    { tier: 'budget', brandName: 'UNIQLO U系列', priceRange: '¥99-500', reason: '基础款法式穿搭的最佳起点' },
  ],
  similarStyles: ['fr_effortless', 'bohemian'],
  nextStyles: ['mori_girl', 'travel_resort'],
},
  {
    id: 'it_passione',
    name: '意式风情',
    dimension: '地域文化', category: '意式',
    description: '热情奔放、曲线分明——印花长裙、针织吊带、夸张墨镜、色彩浓郁',
    philosophy: '人生苦短，衣服是写给自己的情书。',
  summary: '热情奔放、曲线分明——意式风情强调女性曲线美，用印花长裙、针织吊带、夸张墨镜和浓郁色彩表达生命的热情。',
  keyItemDescriptions: [
    '大印花图案，深V或露背设计',
    '细针织，修身但不紧绷',
    'oversized猫眼墨镜，复古感',
    '金色或珐琅材质，存在感强',
    '细跟尖头，拉长腿部线条'
  ],
    difficulty: 3,
    silhouette: ['X型收腰', '深V领', '包臀'],
    keyItems: ['印花长裙', '针织吊带', '夸张墨镜', '金色大耳环', '尖头高跟鞋'],
    colorPalette: ['#B22222', '#DAA520', '#FF8C00', '#1A1A1A'],
  
  styleSpecificAdvice: {
    suitableFor: '适合自信、热情、不介意成为焦点的人。曲线明显的沙漏形和梨形身材最能驾驭意式风情的性感。',
    cautionPoints: '露肤要有节制——深V和开叉选一个就好。全身印花+亮色+大耳环容易过火，保留一个视觉重点即可。',
    sceneAdvice: '约会晚餐、度假旅行、派对社交、艺术活动。不适合保守的职场环境和日常通勤。',
  },
  brandRecommendations: [
    { tier: 'premium', brandName: 'Gucci', priceRange: '¥5,000-30,000', reason: '意式风情的极致表达' },
    { tier: 'mid', brandName: 'Mango', priceRange: '¥200-1,000', reason: '意式风格的快时尚平替' },
    { tier: 'budget', brandName: 'ZARA', priceRange: '¥100-800', reason: '印花和亮色单品丰富' },
  ],
  similarStyles: ['latina_fiesta', 'power_woman'],
  nextStyles: ['party_queen', 'siren'],
},
  {
    id: 'uk_preppy',
    name: '英伦学院风',
    dimension: '地域文化', category: '英伦',
    description: '常春藤校园感——格纹短裙、菱格针织背心、牛津鞋、领结',
    philosophy: '穿戴的是传统与教养，而不是流行。',
  summary: '常春藤校园的经典传承——格纹、菱格针织、牛津鞋，每一件都透着教养与传统。干净、利落、有书卷气，是学院风的精髓。',
  keyItemDescriptions: [
    '经典苏格兰格纹，百褶设计',
    'V领，菱格纹图案',
    '领尖扣设计，挺括有型',
    '细窄领结或条纹领带',
    '皮质或麂皮，舒适耐穿'
  ],
    difficulty: 2,
    silhouette: ['H型', 'A型大衣', '直筒'],
    keyItems: ['格纹短裙', '菱格针织背心', '牛津衬衫', '领结/领带', '乐福鞋'],
    colorPalette: ['#8B4513', '#2C3E50', '#8B0000', '#3B5323'],
  
  styleSpecificAdvice: {
    suitableFor: '适合喜欢经典、干净、有书卷气穿搭的人。H型身材和矩形身材穿学院风最利落，格纹和菱格纹能增加上半身量感。',
    cautionPoints: '不要穿成"制服感"——用配饰和个人化元素打破规整，比如一双彩色袜子或一个皮质双肩包。',
    sceneAdvice: '校园、通勤、周末早午餐、图书馆/书店。学院风的得体感让它非常适合见长辈或半正式场合。',
  },
  brandRecommendations: [
    { tier: 'premium', brandName: 'Burberry', priceRange: '¥3,000-20,000', reason: '英伦风格的代名词' },
    { tier: 'mid', brandName: 'Superdry', priceRange: '¥300-1,500', reason: '英伦休闲风的优质选择' },
    { tier: 'budget', brandName: 'UNIQLO', priceRange: '¥99-500', reason: '基础款英伦穿搭的性价比之选' },
  ],
  similarStyles: ['tenniscore', 'nerd_chic'],
  nextStyles: ['intellectual', 'old_money'],
},
  {
    id: 'uk_punk',
    name: '英伦朋克风',
    dimension: '地域文化', category: '英伦',
    description: '叛逆不羁——铆钉皮衣、格纹紧身裤、马丁靴、别针锁链',
    philosophy: '规则是用来打破的，衣服是宣言不是装饰。',
  summary: '叛逆不羁的摇滚精神——铆钉皮衣、格纹紧身裤、马丁靴，用破坏和不对称表达对规则的藐视。朋克是一种态度，不只是一件衣服。',
  keyItemDescriptions: [
    '铆钉装饰，黑色或暗红色',
    '紧身格纹或纯黑',
    '厚底8孔，经典款',
    '破旧或乐队logo印花',
    '银色金属链条，可挂腰间'
  ],
    difficulty: 4,
    silhouette: ['紧身', '不对称', '破碎廓形'],
    keyItems: ['铆钉皮衣', '格纹紧身裤', '马丁靴', '乐队T恤', '锁链配饰'],
    colorPalette: ['#1A1A1A', '#8B0000', '#808080', '#C0C0C0'],
  
  styleSpecificAdvice: {
    suitableFor: '适合有个性、不介意表达叛逆态度的人。朋克风对身材包容度高，Oversize和紧身都能找到合适的表达方式。',
    cautionPoints: '朋克不等于"破烂"——铆钉皮衣和马丁靴需要保持干净利落，破洞和磨损要克制，否则容易显得邋遢。',
    sceneAdvice: '音乐节、Livehouse、街头拍照、朋友聚会。不适合职场和正式社交场合。',
  },
  brandRecommendations: [
    { tier: 'premium', brandName: 'Burberry', priceRange: '¥3,000-20,000', reason: '英伦风格的代名词' },
    { tier: 'mid', brandName: 'Superdry', priceRange: '¥300-1,500', reason: '英伦休闲风的优质选择' },
    { tier: 'budget', brandName: 'UNIQLO', priceRange: '¥99-500', reason: '基础款英伦穿搭的性价比之选' },
  ],
  similarStyles: ['rock_star', 'gothic'],
  nextStyles: ['dark_poetry', 'avant_garde'],
},
  {
    id: 'us_prep_vintage',
    name: '美式校园复古',
    dimension: '地域文化', category: '美式',
    description: '棒球服、字母卫衣、宽松牛仔裤，像90年代美剧里的高中生',
    philosophy: '青春就该穿得自由自在，不为任何人精心打扮。',
  summary: '90年代美式高中生的青春记忆——棒球服、字母卫衣、宽松牛仔裤，自由自在不为任何人精心打扮。舒适、随性、有活力。',
  keyItemDescriptions: [
    '宽松版型，拼色或字母图案',
    '大号落肩，棉质柔软',
    '直筒或微喇，做旧水洗',
    '高帮或低帮，经典款',
    '可调节金属扣，运动感'
  ],
    difficulty: 1,
    silhouette: ['Oversize', '直筒', '上宽下窄'],
    keyItems: ['棒球服', '字母卫衣', '宽松牛仔裤', '帆布鞋', '棒球帽'],
    colorPalette: ['#4A6FA5', '#C41E3A', '#FFFFFF', '#808080'],
  
  styleSpecificAdvice: {
    suitableFor: '适合喜欢90年代美式复古感、追求舒适随性的人。Oversize版型对各种身材都很友好，尤其适合想要藏肉或追求少年感的人。',
    cautionPoints: '不要全身都穿Oversize——上宽下窄或上窄下宽才有层次。棒球服+宽松牛仔裤+帆布鞋，选两件宽松即可。',
    sceneAdvice: '校园日常、周末逛街、运动休闲、朋友聚会。美式校园复古的舒适感让它适合大多数非正式场合。',
  },
  brandRecommendations: [
    { tier: 'premium', brandName: 'Ralph Lauren', priceRange: '¥1,000-5,000', reason: '美式经典的代表' },
    { tier: 'mid', brandName: 'Levi\'s', priceRange: '¥300-1,500', reason: '美式牛仔文化的标志品牌' },
    { tier: 'budget', brandName: 'GAP', priceRange: '¥100-600', reason: '美式休闲的入门首选' },
  ],
  similarStyles: ['skater', 'tomboy'],
  nextStyles: ['us_western', 'vintage_lover'],
},
  {
    id: 'us_western',
    name: '美式西部牛仔',
    dimension: '地域文化', category: '美式',
    description: '牛仔靴、流苏夹克、宽檐帽、大银扣腰带，粗犷自由',
    philosophy: '像风一样自由，像沙漠一样坦荡。',
  summary: '粗犷自由的西部精神——牛仔靴、流苏夹克、宽檐帽，每一件都诉说着旷野和冒险。洒脱、硬朗、不羁。',
  keyItemDescriptions: [
    '尖头设计，皮革或麂皮',
    '流苏装饰，短款或中长款',
    '宽檐设计，皮质或草编',
    '大号金属扣，手工雕刻',
    '西部风格印花或纯色'
  ],
    difficulty: 3,
    silhouette: ['H型', '直筒', '收腰'],
    keyItems: ['牛仔靴', '流苏夹克', '宽檐帽', '大银扣腰带', '牛仔衬衫'],
    colorPalette: ['#8B4513', '#C4A35A', '#D2691E', '#1A3C5E'],
  
  styleSpecificAdvice: {
    suitableFor: '适合喜欢粗犷自由风格、有冒险精神的人。H型和矩形身材穿西部风最帅气，牛仔靴的V型靴口能视觉上拉长腿部。',
    cautionPoints: '西部风容易穿成"万圣节 costume"——不要同时穿牛仔靴+流苏夹克+宽檐帽，选两样就够了。',
    sceneAdvice: '户外音乐节、公路旅行、周末出游、乡村度假。不适合城市通勤和正式场合。',
  },
  brandRecommendations: [
    { tier: 'premium', brandName: 'Ralph Lauren', priceRange: '¥1,000-5,000', reason: '美式经典的代表' },
    { tier: 'mid', brandName: 'Levi\'s', priceRange: '¥300-1,500', reason: '美式牛仔文化的标志品牌' },
    { tier: 'budget', brandName: 'GAP', priceRange: '¥100-600', reason: '美式休闲的入门首选' },
  ],
  similarStyles: ['us_prep_vintage', 'bohemian'],
  nextStyles: ['camo_tech', 'urban_outdoor'],
},
  {
    id: 'us_street',
    name: '美式街头风',
    dimension: '地域文化', category: '美式',
    description: '嘻哈文化为基础——超大号帽衫、运动裤、篮球鞋，宽松舒适',
    philosophy: '街头就是T台，态度比价格重要。',
  summary: '嘻哈文化衍生的街头美学——超大号帽衫、运动裤、篮球鞋，宽松舒适是第一位，态度比价格重要。',
  keyItemDescriptions: [
    '超大版型，连帽设计',
    '束脚或直筒，宽松舒适',
    '高帮或低帮，经典篮球鞋款',
    '白色长袖打底，增加层次',
    '可调节后扣，街头标配'
  ],
    difficulty: 2,
    silhouette: ['超大Oversize', '上宽下窄', '垂坠'],
    keyItems: ['超大号帽衫', '运动裤', '篮球鞋', '叠穿白T', '棒球帽'],
    colorPalette: ['#1A1A1A', '#FF3333', '#FFFFFF', '#4A6FA5'],
  
  styleSpecificAdvice: {
    suitableFor: '适合追求舒适第一、喜欢嘻哈文化的人。Oversize版型对各种身材都很友好，叠穿技巧能增加造型感。',
    cautionPoints: '不要全身都是大Logo——选一件带Logo的单品作为重点，其他部分保持纯色。帽衫+运动裤+篮球鞋已经足够。',
    sceneAdvice: '日常出行、运动休闲、街头拍照、朋友聚会。街头风的舒适感让它适合几乎所有非正式场合。',
  },
  brandRecommendations: [
    { tier: 'premium', brandName: 'Ralph Lauren', priceRange: '¥1,000-5,000', reason: '美式经典的代表' },
    { tier: 'mid', brandName: 'Levi\'s', priceRange: '¥300-1,500', reason: '美式牛仔文化的标志品牌' },
    { tier: 'budget', brandName: 'GAP', priceRange: '¥100-600', reason: '美式休闲的入门首选' },
  ],
  similarStyles: ['skater', 'kr_street'],
  nextStyles: ['blokecore', 'gorpcore'],
},
  {
    id: 'jp_zen',
    name: '日系简约风',
    dimension: '地域文化', category: '日系',
    description: '棉麻材质、宽松廓形、素色黑白灰大地色，禅意十足',
    philosophy: '越简单越自由，衣服是修行的一部分。',
  summary: '日式禅意美学——棉麻材质、宽松廓形、素色黑白灰大地色，追求"少即是多"的生活哲学。安静、克制、有质感。',
  keyItemDescriptions: [
    '棉麻材质，落肩宽松版型',
    '高腰设计，垂坠感好',
    '无领或立领，羊毛或棉麻',
    '纯色帆布，简约无logo',
    '大容量帆布，自然染色'
  ],
    difficulty: 2,
    silhouette: ['宽松H型', '直筒', '落肩'],
    keyItems: ['棉麻衬衫', '阔腿裤', '无领大衣', '素色帆布鞋', '帆布包'],
    colorPalette: ['#F5F5F0', '#2C2C2C', '#8B8B83', '#D4C5B9'],
  
  styleSpecificAdvice: {
    suitableFor: '适合追求简约生活美学、注重面料质感的人。日系简约的宽松H型对所有身材都很友好，尤其适合想要藏肉或追求舒适感的人。',
    cautionPoints: '日系简约不等于"和尚袍"——用不同材质的叠穿（棉麻+针织+帆布）来增加层次感，避免全身一个质感。',
    sceneAdvice: '日常通勤、咖啡馆阅读、艺术展览、轻旅行。日系简约的安静气质让它适合需要专注和放松的场合。',
  },
  brandRecommendations: [
    { tier: 'premium', brandName: 'ISSEY MIYAKE', priceRange: '¥3,000-15,000', reason: '日式美学的极致' },
    { tier: 'mid', brandName: 'MUJI', priceRange: '¥100-800', reason: '日系简约的日常之选' },
    { tier: 'budget', brandName: 'UNIQLO', priceRange: '¥99-500', reason: '日系基础款的最佳选择' },
  ],
  similarStyles: ['nordic_minimal', 'minimalist'],
  nextStyles: ['artisan_zen', 'zen_healing'],
},
  {
    id: 'jp_sweet',
    name: '日系甜美风',
    dimension: '地域文化', category: '日系',
    description: '蕾丝、毛绒、马卡龙色系，温柔无害的好嫁风',
    philosophy: '甜不是讨好，是选择温柔地面对世界。',
  summary: '温柔无害的甜美风——蕾丝、毛绒、马卡龙色系，用柔软的面料和柔和的色彩表达善意。甜不是讨好，是选择温柔。',
  keyItemDescriptions: [
    '蕾丝拼接或纯色，收腰A字',
    '毛绒材质，短款或中长款',
    '蝴蝶结或花朵造型',
    '圆头设计，搭扣装饰',
    '小巧珍珠，温柔精致'
  ],
    difficulty: 2,
    silhouette: ['A字裙', '泡泡袖', '收腰'],
    keyItems: ['蕾丝连衣裙', '毛绒开衫', '蝴蝶结发饰', '玛丽珍鞋', '珍珠耳钉'],
    colorPalette: ['#FFB6C1', '#E6E6FA', '#FFF0F5', '#FFE4E1'],
  
  styleSpecificAdvice: {
    suitableFor: '适合喜欢温柔甜美风格、追求少女感的人。A字裙和收腰设计对梨形和沙漏形身材最友好，能突出腰线遮住大腿。',
    cautionPoints: '甜度要控制——蕾丝+蝴蝶结+毛绒+粉色同时出现容易过甜。用一件中性单品（如牛仔外套或帆布鞋）来平衡甜度。',
    sceneAdvice: '约会、逛街、下午茶、朋友聚会。甜美风的温柔感让它适合轻松愉快的社交场合。',
  },
  brandRecommendations: [
    { tier: 'premium', brandName: 'ISSEY MIYAKE', priceRange: '¥3,000-15,000', reason: '日式美学的极致' },
    { tier: 'mid', brandName: 'MUJI', priceRange: '¥100-800', reason: '日系简约的日常之选' },
    { tier: 'budget', brandName: 'UNIQLO', priceRange: '¥99-500', reason: '日系基础款的最佳选择' },
  ],
  similarStyles: ['pure_desire', 'ballet_core'],
  nextStyles: ['princess_core', 'lolita'],
},
  {
    id: 'jp_harajuku',
    name: '日系原宿风',
    dimension: '地域文化', category: '日系',
    description: '极繁主义的游乐场——色彩冲撞、图案混搭、夸张配饰',
    philosophy: '穿衣不为取悦任何人，是自我表达最直接的语言。',
  summary: '极繁主义的游乐场——色彩冲撞、图案混搭、夸张配饰，原宿风是自我表达最直接的语言。大胆、自由、不设限。',
  keyItemDescriptions: [
    '大号印花或拼色，宽松版型',
    '彩色格纹或纯色，多层叠穿',
    '厚底松糕鞋或高跟鞋',
    '彩色中筒袜，撞色搭配',
    '夸张蝴蝶结或动物造型'
  ],
    difficulty: 5,
    silhouette: ['破碎廓形', '超大Oversize', '不对称'],
    keyItems: ['印花卫衣', '彩色百褶裙', '厚底鞋', '彩色袜子', '夸张发饰'],
    colorPalette: ['#FF6B9D', '#00D4FF', '#FFD700', '#9B59B6'],
  
  styleSpecificAdvice: {
    suitableFor: '适合真正热爱时尚、不介意路人目光的人。原宿风没有身材限制——任何体型都能通过色彩和廓形找到表达方式。',
    cautionPoints: '原宿风的核心是"有意识的混乱"——色彩冲撞和图案混搭需要审美控制力，不是随便穿都好看。建议从1-2个亮色开始尝试。',
    sceneAdvice: '时尚活动、街头拍照、音乐节、创意工作场合。不适合保守的职场和正式场合。',
  },
  brandRecommendations: [
    { tier: 'premium', brandName: 'ISSEY MIYAKE', priceRange: '¥3,000-15,000', reason: '日式美学的极致' },
    { tier: 'mid', brandName: 'MUJI', priceRange: '¥100-800', reason: '日系简约的日常之选' },
    { tier: 'budget', brandName: 'UNIQLO', priceRange: '¥99-500', reason: '日系基础款的最佳选择' },
  ],
  similarStyles: ['shibuya_gal', 'pop_art'],
  nextStyles: ['maximalist', 'cyberpunk'],
},
  {
    id: 'cn_new_chinese',
    name: '新中式',
    dimension: '地域文化', category: '中式',
    description: '盘扣、立领、水墨印花、对襟元素融入现代廓形，清冷又风骨',
    philosophy: '传承不是复制历史，是用现代设计讲东方故事。',
  summary: '东方美学的现代演绎——盘扣、立领、水墨印花融入现代廓形，清冷中带着风骨。传统与现代的平衡。',
  keyItemDescriptions: [
    '立领盘扣，丝绒或真丝材质',
    '改良中式立领，简约线条',
    '盘扣装饰，短款或中长款',
    '垂坠感好，搭配旗袍或衬衫',
    '玉石吊坠或银饰，东方韵味'
  ],
    difficulty: 4,
    silhouette: ['立领H型', 'A型长衫', '斜襟收腰'],
    keyItems: ['改良旗袍', '立领衬衫', '盘扣外套', '阔腿绸裤', '玉/银饰品'],
    colorPalette: ['#1A1A1A', '#FFFFFF', '#C41E3A', '#2F4F4F'],
  
  styleSpecificAdvice: {
    suitableFor: '适合喜欢东方美学、追求独特文化表达的人。H型和沙漏形身材穿新中式最出彩，立领和斜襟设计能很好地修饰脖颈线条。',
    cautionPoints: '不要穿成"汉服cosplay"——新中式的精髓是"现代廓形+东方元素"，选一个传统元素（盘扣或立领）搭配现代单品即可。',
    sceneAdvice: '艺术展览、茶会、文化活动、约会晚餐。新中式的清冷气质让它适合需要品味和格调的场合。',
  },
  brandRecommendations: [
    { tier: 'premium', brandName: 'Uma Wang', priceRange: '¥3,000-15,000', reason: '新中式美学的国际代表' },
    { tier: 'mid', brandName: 'JNBY', priceRange: '¥300-2,000', reason: '中式元素的现代演绎' },
    { tier: 'budget', brandName: 'ZARA TRF', priceRange: '¥100-600', reason: '入门级中式元素的快时尚选择' },
  ],
  similarStyles: ['cn_old_money', 'hk_retro'],
  nextStyles: ['artisan_zen', 'dior_new_look'],
},
  {
    id: 'hk_retro',
    name: '港风复古',
    dimension: '地域文化', category: '港风',
    description: '80-90年代港星穿搭——红唇大波浪、牛仔外套、白衬衫、高腰裤',
    philosophy: '风华绝代的美，不分年代，只看态度。',
  summary: '80-90年代港星的黄金时代——红唇大波浪、牛仔外套、白衬衫、高腰裤，复古中带着港式独有的飒爽。',
  keyItemDescriptions: [
    '做旧水洗，短款或中长款',
    '纯白，硬挺面料',
    '高腰设计，版型挺括',
    '正红色或复古砖红',
    '金色或玳瑁材质，大号'
  ],
    difficulty: 3,
    silhouette: ['高腰直筒', 'X型收腰', '宽肩'],
    keyItems: ['牛仔外套', '白衬衫', '高腰阔腿裤', '红唇', '大耳环'],
    colorPalette: ['#8B0000', '#2C2C2C', '#DAA520', '#FFFFFF'],
  
  styleSpecificAdvice: {
    suitableFor: '适合喜欢80-90年代复古港星风格、追求飒爽气质的人。高腰直筒裤和宽肩设计对H型和倒三角身材最友好。',
    cautionPoints: '港风复古不等于"旧衣服"——牛仔外套和白衬衫要保持干净挺括，红唇是灵魂但不要涂出边界。',
    sceneAdvice: '复古主题派对、街头拍照、约会晚餐、朋友聚会。港风的飒爽感让它适合需要气场的场合。',
  },
  brandRecommendations: [
    { tier: 'premium', brandName: 'Shanghai Tang', priceRange: '¥2,000-10,000', reason: '中式复古的奢华表达' },
    { tier: 'mid', brandName: 'Peacebird', priceRange: '¥200-1,000', reason: '港风复古的优质选择' },
    { tier: 'budget', brandName: 'ZARA', priceRange: '¥100-600', reason: '牛仔外套和白衬衫的性价比之选' },
  ],
  similarStyles: ['cn_new_chinese', 'vintage_lover'],
  nextStyles: ['power_woman', 'villainess'],
},
  {
    id: 'kr_effortless',
    name: '韩系简约',
    dimension: '地域文化', category: '韩系',
    description: '注重比例和呼吸感——卡其色风衣、燕麦色针织、直筒西裤',
    philosophy: '看起来毫不费力，其实每一件都经过精心挑选。',
  summary: '韩系简约注重比例和呼吸感——卡其色风衣、燕麦色针织、直筒西裤，每一件都经过精心挑选，看起来毫不费力。',
  keyItemDescriptions: [
    '经典双排扣，中长款',
    '燕麦色或奶油色，细针织',
    '高腰设计，版型利落',
    '白色中筒袜配乐福鞋',
    '简约皮质，容量适中'
  ],
    difficulty: 2,
    silhouette: ['H型宽松', '高腰线', '上宽下窄'],
    keyItems: ['卡其色风衣', '燕麦色针织衫', '直筒西裤', '白袜+乐福鞋', '简约托特包'],
    colorPalette: ['#D4C5B9', '#C4B5A5', '#F5F5F0', '#B8C9D4'],
  
  styleSpecificAdvice: {
    suitableFor: '适合追求精致但不想太费力的人。韩系简约的H型和高腰线设计对大多数身材都很友好，尤其适合小个子和梨形身材。',
    cautionPoints: '韩系简约的"看起来毫不费力"其实需要精心搭配——卡其色风衣+燕麦色针织+直筒西裤，每一件的版型和颜色都要协调。',
    sceneAdvice: '日常通勤、约会、周末逛街、咖啡馆。韩系简约的精致感让它适合大多数日常场合。',
  },
  brandRecommendations: [
    { tier: 'premium', brandName: 'ADER error', priceRange: '¥1,000-5,000', reason: '韩系设计的先锋品牌' },
    { tier: 'mid', brandName: 'SPAO', priceRange: '¥100-600', reason: '韩系街头的日常之选' },
    { tier: 'budget', brandName: 'ALAND', priceRange: '¥50-400', reason: '韩国平价集合店，款式丰富' },
  ],
  similarStyles: ['fr_effortless', 'jp_zen'],
  nextStyles: ['minimalist', 'intellectual'],
},
  {
    id: 'kr_street',
    name: '韩系街头风',
    dimension: '地域文化', category: '韩系',
    description: '偶像打歌服日常化——短上衣配阔腿裤、卫衣单车裤、流行色大胆',
    philosophy: '年轻就该大胆穿，没有那么多条条框框。',
  summary: '偶像打歌服的日常化——短上衣配阔腿裤、卫衣单车裤，大胆使用流行色。年轻、活力、有态度。',
  keyItemDescriptions: [
    '超短款或露腰设计',
    '高腰阔腿或直筒',
    '大号卫衣叠穿',
    '厚底设计，运动感',
    '迷你尺寸，装饰性为主'
  ],
    difficulty: 3,
    silhouette: ['短上衣+高腰裤', '紧身+宽松', '不对称'],
    keyItems: ['短款上衣', '阔腿牛仔裤', '骑行裤+大号卫衣', '厚底运动鞋', '迷你包'],
    colorPalette: ['#FF69B4', '#87CEEB', '#9370DB', '#1A1A1A'],
  
  styleSpecificAdvice: {
    suitableFor: '适合年轻有活力、喜欢韩流文化的人。短上衣+高腰裤的组合对小个子非常友好，能视觉上拉长比例。',
    cautionPoints: '不要盲目追流行色——荧光色和亮色需要和肤色搭配。冷白皮适合粉色系，暖黄皮适合橙色系。',
    sceneAdvice: '逛街、朋友聚会、音乐节、日常出行。韩系街头的活力感让它适合轻松愉快的场合。',
  },
  brandRecommendations: [
    { tier: 'premium', brandName: 'ADER error', priceRange: '¥1,000-5,000', reason: '韩系设计的先锋品牌' },
    { tier: 'mid', brandName: 'SPAO', priceRange: '¥100-600', reason: '韩系街头的日常之选' },
    { tier: 'budget', brandName: 'ALAND', priceRange: '¥50-400', reason: '韩国平价集合店，款式丰富' },
  ],
  similarStyles: ['us_street', 'kpop_stage'],
  nextStyles: ['sweet_cool', 'y2k'],
},
  {
    id: 'nordic_minimal',
    name: '北欧极简',
    dimension: '地域文化', category: '北欧',
    description: '几乎只有黑白灰——剪裁和解构是灵魂，极致的冷淡美学',
    philosophy: '真正的奢侈是去掉所有多余之后，剩下的那一点纯粹。',
  summary: '北欧极致的冷淡美学——几乎只有黑白灰，剪裁和解构是灵魂。去掉所有多余之后，剩下的那一点纯粹。',
  keyItemDescriptions: [
    '解构剪裁，纯白或纯黑',
    '不对称设计，垂坠感',
    '超大廓形，羊毛或羊绒',
    '方头设计，皮质硬朗',
    '极简线条，银或钢材质'
  ],
  silhouetteDescription: 'H型直筒和解构廓形是北欧极简的基石——用建筑般的线条表达冷淡美学。',
  colorDescription: '几乎只有黑白灰——在北欧极简的世界里，色彩本身就是多余的装饰。',
    difficulty: 4,
    silhouette: ['H型', '直筒', '解构廓形'],
    keyItems: ['解构衬衫', '不对称半裙', '大廓形大衣', '方头靴', '极简珠宝'],
    colorPalette: ['#000000', '#FFFFFF', '#808080', '#D3D3D3'],
  
  styleSpecificAdvice: {
    suitableFor: '适合追求极致简约、注重剪裁和质感的人。北欧极简的H型和解构廓形对高个子最友好，小个子需要选择合适的比例。',
    cautionPoints: '全黑全白不等于北欧极简——不同材质的对比（羊毛+真丝+皮革）才是灵魂。如果只有颜色没有质感，看起来会很廉价。',
    sceneAdvice: '艺术展览、建筑设计事务所、创意行业、高端社交。北欧极简的冷淡美学适合需要专业感和品味的场合。',
  },
  brandRecommendations: [
    { tier: 'premium', brandName: 'Acne Studios', priceRange: '¥2,000-8,000', reason: '北欧极简的时尚代表' },
    { tier: 'mid', brandName: 'COS', priceRange: '¥300-2,000', reason: '北欧极简的优质平替' },
    { tier: 'budget', brandName: 'H&M', priceRange: '¥50-500', reason: '基础款北欧风的入门选择' },
  ],
  colorGuidance: {
    primary: '黑、白——北欧极简的底色，占80%',
    secondary: '灰色——层次过渡，占15%',
    accent: '米色——微弱暖意，占5%',
    ratio: '80% 无彩色 + 15% 中性灰 + 5% 暖调点缀',
  },
  similarStyles: ['jp_zen', 'minimalist'],
  nextStyles: ['avant_garde', 'dark_poetry'],
},
  {
    id: 'bohemian',
    name: '波西米亚风',
    dimension: '地域文化', category: '波西米亚',
    description: '印花长袍、流苏马甲、层叠项链，自由浪漫的游牧诗人',
    philosophy: '穿得像刚从远方回来的人——不在乎规则，只在乎故事。',
  summary: '自由浪漫的游牧诗人——印花长袍、流苏马甲、层叠项链，穿得像刚从远方回来的人。不在乎规则，只在乎故事。',
  keyItemDescriptions: [
    '大印花图案，飘逸面料',
    '流苏装饰，麂皮或编织',
    '软呢或草编宽檐',
    '多层吊坠，天然石材',
    '麂皮或编织，中筒'
  ],
  silhouetteDescription: '垂坠A型和层叠廓形是波西米亚的灵魂——用流动的面料和叠加的层次讲故事。',
  colorDescription: '大地色系配金属点缀——像沙漠日落般温暖而丰富。',
    difficulty: 3,
    silhouette: ['垂坠A型', '层叠', 'Oversize'],
    keyItems: ['印花长袍', '流苏马甲', '宽檐帽', '层叠项链', '麂皮靴'],
    colorPalette: ['#C4A35A', '#8B4513', '#D2691E', '#2E4057'],
  
  styleSpecificAdvice: {
    suitableFor: '适合追求自由浪漫、喜欢旅行和自然的人。垂坠A型对梨形和苹果形身材最友好，能很好地遮住下半身。',
    cautionPoints: '波西米亚容易穿成"流浪汉"——层叠搭配需要控制数量，印花+流苏+层叠项链选两样就够了。保持整体有一个视觉焦点。',
    sceneAdvice: '音乐节、度假旅行、周末市集、艺术活动。波西米亚的自由感让它最适合放松和旅行的场合。',
  },
  brandRecommendations: [
    { tier: 'premium', brandName: 'Free People', priceRange: '¥500-3,000', reason: '波西米亚风格的代表品牌' },
    { tier: 'mid', brandName: '& Other Stories', priceRange: '¥300-1,500', reason: '波西米亚元素的现代演绎' },
    { tier: 'budget', brandName: 'ZARA', priceRange: '¥100-600', reason: '印花和流苏单品的性价比之选' },
  ],
  colorGuidance: {
    primary: '大地色系——棕色、卡其，占50%',
    secondary: '砖红、姜黄——温暖点缀，占30%',
    accent: '土耳其蓝——异域风情，占20%',
    ratio: '50% 大地色 + 30% 暖色点缀 + 20% 异域亮色',
  },
  similarStyles: ['fr_countryside', 'hippie'],
  nextStyles: ['festival_boho', 'travel_resort'],
},
  {
    id: 'copenhagen',
    name: '哥本哈根风',
    dimension: '地域文化', category: '北欧',
    description: '北欧博主带火的丑时髦——用亮色荧光色混搭、骑行裤洞洞鞋穿出潮流感',
    philosophy: '丑到极致就是美，舒服到极致就是潮。',
  summary: '北欧博主带火的"丑时髦"——亮色荧光色混搭、骑行裤洞洞鞋，丑到极致就是美，舒服到极致就是潮。',
  keyItemDescriptions: [
    '亮色或荧光色，防风面料',
    '紧身骑行短裤',
    '舒适轻便，彩色可选',
    '荧光色袜子或包袋',
    '大廓形，oversized版型'
  ],
    difficulty: 3,
    silhouette: ['层叠混搭', '上宽下窄', '不规则'],
    keyItems: ['亮色冲锋衣', '骑行裤', '洞洞鞋', '荧光色配饰', '大廓形衬衫'],
    colorPalette: ['#FF6B9D', '#00FF7F', '#FFD700', '#FF4500'],
  
  styleSpecificAdvice: {
    suitableFor: '适合敢穿、有趣、不介意"丑时髦"的人。哥本哈根风格没有身材限制——任何体型都能用亮色和混搭找到乐趣。',
    cautionPoints: '"丑时髦"不等于真的丑——颜色混搭需要色彩理论基础，建议从同色系不同深浅开始，再尝试对比色。',
    sceneAdvice: '时尚周、创意工作、街头拍照、朋友聚会。哥本哈根的趣味感让它适合需要表达个性的场合。',
  },
  brandRecommendations: [
    { tier: 'premium', brandName: 'Acne Studios', priceRange: '¥2,000-8,000', reason: '北欧极简的时尚代表' },
    { tier: 'mid', brandName: 'COS', priceRange: '¥300-2,000', reason: '北欧极简的优质平替' },
    { tier: 'budget', brandName: 'H&M', priceRange: '¥50-500', reason: '基础款北欧风的入门选择' },
  ],
  similarStyles: ['dopamine', 'gorpcore'],
  nextStyles: ['pop_art', 'maximalist'],
},
  {
    id: 'latina_fiesta',
    name: '拉美风情',
    dimension: '地域文化', category: '拉美',
    description: '热情似火的性感——高露肤、荷叶边、印花亮色',
    philosophy: '生命用来跳舞，衣服用来庆祝。',
  summary: '热情似火的拉美性感——高露肤、荷叶边、印花亮色，生命用来跳舞，衣服用来庆祝。',
  keyItemDescriptions: [
    '荷叶边装饰，露肩或一字领',
    '大印花图案，高腰设计',
    '露背或深V，亮色系',
    '金色或彩色大号耳环',
    '绑带设计，平底或中跟'
  ],
    difficulty: 3,
    silhouette: ['X型收腰', '露肩', '包臀'],
    keyItems: ['荷叶边上衣', '印花长裙', '露肩连衣裙', '大耳环', '绑带凉鞋'],
    colorPalette: ['#FF4500', '#FFD700', '#00CED1', '#DC143C'],
  
  styleSpecificAdvice: {
    suitableFor: '适合自信热情、喜欢展现身材曲线的人。沙漏形和梨形身材最能驾驭拉美风情的性感与热烈。',
    cautionPoints: '高露肤+亮色+大印花同时出现容易过火——露肩和露背选一个，印花和亮色选一个，保持克制。',
    sceneAdvice: '度假旅行、派对、约会、音乐节。不适合保守的职场和日常通勤。',
  },
  brandRecommendations: [
    { tier: 'premium', brandName: 'Carolina Herrera', priceRange: '¥3,000-15,000', reason: '拉美风情的奢华表达' },
    { tier: 'mid', brandName: 'Mango', priceRange: '¥200-1,000', reason: '拉美风格的快时尚选择' },
    { tier: 'budget', brandName: 'ZARA', priceRange: '¥100-600', reason: '亮色和印花单品的入门选择' },
  ],
  similarStyles: ['it_passione', 'party_queen'],
  nextStyles: ['siren', 'villainess'],
},
  {
    id: 'cn_old_money',
    name: '中式老钱风',
    dimension: '地域文化', category: '中式',
    description: '香云纱、宋锦、羊绒配和田玉或珍珠，低调内敛的贵气',
    philosophy: '真正的高贵不需要张扬，面料和玉会替你说话。',
  summary: '低调内敛的中式贵气——香云纱、宋锦、羊绒配和田玉或珍珠，真正的高贵不需要张扬。',
  keyItemDescriptions: [
    '香云纱或宋锦，低调纹理',
    '刺绣或提花，中式元素',
    '纯色羊绒，简约圆领或V领',
    '和田玉或翡翠，温润质感',
    '南洋珍珠，直径8mm以上'
  ],
    difficulty: 5,
    silhouette: ['合身H型', '微A型', '斜襟'],
    keyItems: ['香云纱外套', '宋锦马甲', '羊绒衫', '和田玉吊坠', '珍珠耳环'],
    colorPalette: ['#2F1F0F', '#8B7355', '#D4C4A8', '#F5F5DC'],
  
  styleSpecificAdvice: {
    suitableFor: '适合追求低调贵气、注重面料品质的人。合身H型和微A型对大多数身材都很友好，香云纱和宋锦的垂坠感能很好地修饰身形。',
    cautionPoints: '老钱风不等于"老气"——和田玉和珍珠可以搭配现代单品（如羊绒衫+阔腿西裤），避免全身都是传统元素。',
    sceneAdvice: '商务宴请、茶会、文化活动、家庭聚会。中式老钱的低调贵气适合需要彰显品位的正式场合。',
  },
  brandRecommendations: [
    { tier: 'premium', brandName: 'Uma Wang', priceRange: '¥3,000-15,000', reason: '新中式美学的国际代表' },
    { tier: 'mid', brandName: 'JNBY', priceRange: '¥300-2,000', reason: '中式元素的现代演绎' },
    { tier: 'budget', brandName: 'ZARA TRF', priceRange: '¥100-600', reason: '入门级中式元素的快时尚选择' },
  ],
  similarStyles: ['old_money', 'quiet_luxury'],
  nextStyles: ['cn_new_chinese', 'flight_attendant'],
},

  // ==================== 二、视觉元素（20种）====================
  {
    id: 'dopamine',
    name: '多巴胺穿搭',
    dimension: '视觉元素', category: '色彩美学',
    description: '高饱和亮色对冲——荧光粉、亮橙，用色彩传递快乐',
    philosophy: '穿得快乐就是一种快乐。',
  summary: '用色彩传递快乐——高饱和亮色对冲，荧光粉、亮橙，穿得快乐就是一种快乐。',
  keyItemDescriptions: [
    '荧光粉或亮橙色，纯色或图案',
    '高饱和亮色，阔腿版型',
    '亮色配饰，增加视觉冲击',
    '彩色运动鞋，撞色设计',
    '彩色镜片，复古或现代款'
  ],
    difficulty: 3,
    silhouette: ['各种廓形', '直筒', 'A字'],
    keyItems: ['荧光粉上衣', '亮橙阔腿裤', '撞色配饰', '彩色运动鞋', '彩色太阳镜'],
    colorPalette: ['#FF1493', '#FF8C00', '#00FF00', '#FFD700'],
  
  styleSpecificAdvice: {
    suitableFor: '适合喜欢用色彩表达快乐、不介意成为焦点的人。多巴胺穿搭对身材包容度高——亮色本身就会转移视觉注意力。',
    cautionPoints: '荧光粉+亮橙+亮绿同时出现容易刺眼——建议全身不超过3个亮色，或者用黑白灰做底色，亮色做点缀。',
    sceneAdvice: '音乐节、派对、周末出游、运动休闲。多巴胺的快乐感让它最适合需要好心情的场合。',
  },
  brandRecommendations: [
    { tier: 'premium', brandName: 'Stella McCartney', priceRange: '¥3,000-15,000', reason: '色彩运用的艺术级品牌' },
    { tier: 'mid', brandName: 'COS', priceRange: '¥300-2,000', reason: '色彩搭配的优质选择' },
    { tier: 'budget', brandName: 'UNIQLO', priceRange: '¥99-500', reason: '基础款色彩的性价比之选' },
  ],
  similarStyles: ['copenhagen', 'pop_art'],
  nextStyles: ['maximalist', 'y2k'],
},
  {
    id: 'maillard',
    name: '美拉德穿搭',
    dimension: '视觉元素', category: '色彩美学',
    description: '棕色系基调——卡其、焦糖、红棕的不同材质层次叠穿',
    philosophy: '像一杯刚煮好的手冲咖啡，温暖而有层次。',
  summary: '棕色系的层次美学——卡其、焦糖、红棕的不同材质叠穿，像一杯刚煮好的手冲咖啡。温暖而有层次。',
  keyItemDescriptions: [
    '焦糖色或驼色，羊毛或羊绒',
    '卡其色或米色，高腰阔腿',
    '红棕色皮质，质感温润',
    '麂皮或皮革，中筒或短筒',
    '羊绒或羊毛，纯色格纹'
  ],
    difficulty: 2,
    silhouette: ['层叠', '微宽松', '直筒'],
    keyItems: ['焦糖色大衣', '卡其色阔腿裤', '红棕皮革包', '麂皮靴', '羊绒围巾'],
    colorPalette: ['#C4A35A', '#8B4513', '#D2691E', '#6B3A2A'],
  
  styleSpecificAdvice: {
    suitableFor: '适合喜欢温暖色调、追求高级感的人。美拉德的棕色系对大多数肤色都很友好，暖黄皮尤其适合。',
    cautionPoints: '棕色系容易穿得沉闷——用不同材质（羊绒+皮革+麂皮）来创造层次，或者用白色内搭提亮。',
    sceneAdvice: '秋冬日常、咖啡馆、约会、通勤。美拉德的温暖感让它最适合秋冬季节。',
  },
  brandRecommendations: [
    { tier: 'premium', brandName: 'Stella McCartney', priceRange: '¥3,000-15,000', reason: '色彩运用的艺术级品牌' },
    { tier: 'mid', brandName: 'COS', priceRange: '¥300-2,000', reason: '色彩搭配的优质选择' },
    { tier: 'budget', brandName: 'UNIQLO', priceRange: '¥99-500', reason: '基础款色彩的性价比之选' },
  ],
  similarStyles: ['earthy_relax', 'bohemian'],
  nextStyles: ['old_money', 'quiet_luxury'],
},
  {
    id: 'grey_tonal',
    name: '格雷系穿搭',
    dimension: '视觉元素', category: '色彩美学',
    description: '全身上下只用不同深浅灰色，羊绒真丝羊毛材质对比打造高级感',
    philosophy: '灰色不是沉闷，是最丰富的中庸之道。',
  summary: '全身上下只用不同深浅灰色——羊绒真丝羊毛材质对比打造高级感。灰色不是沉闷，是最丰富的中庸之道。',
  keyItemDescriptions: [
    '炭灰色，羊绒材质',
    '浅灰色，垂坠感好',
    '中灰色，精梳羊毛',
    '银色或白金，极简设计',
    '灰白色，皮革或帆布'
  ],
    difficulty: 3,
    silhouette: ['H型', '直筒', '合身'],
    keyItems: ['炭灰羊绒衫', '浅灰阔腿裤', '中灰西装', '银色饰品', '灰白运动鞋'],
    colorPalette: ['#2C2C2C', '#696969', '#A9A9A9', '#D3D3D3'],
  
  styleSpecificAdvice: {
    suitableFor: '适合喜欢低调高级感、追求质感的人。格雷系的灰色调对大多数肤色都很友好，冷皮穿浅灰、暖皮穿暖灰。',
    cautionPoints: '全身灰色不等于"无聊"——不同深浅灰色的材质对比（羊绒+真丝+羊毛）才是格雷系的精髓。如果材质单一，看起来会很廉价。',
    sceneAdvice: '通勤、商务会议、艺术展览、约会。格雷系的高级感让它适合需要专业和品位的场合。',
  },
  brandRecommendations: [
    { tier: 'premium', brandName: 'Stella McCartney', priceRange: '¥3,000-15,000', reason: '色彩运用的艺术级品牌' },
    { tier: 'mid', brandName: 'COS', priceRange: '¥300-2,000', reason: '色彩搭配的优质选择' },
    { tier: 'budget', brandName: 'UNIQLO', priceRange: '¥99-500', reason: '基础款色彩的性价比之选' },
  ],
  similarStyles: ['nordic_minimal', 'minimalist'],
  nextStyles: ['quiet_luxury', 'old_money'],
},
  {
    id: 'princess_core',
    name: '千金风',
    dimension: '视觉元素', category: '清新甜美',
    description: '精致娇贵的富家千金——粗花呢套装、蝴蝶结衬衫、珍珠配饰',
    philosophy: '精致不是炫富，是每一天都认真对待自己。',
  summary: '精致娇贵的富家千金——粗花呢套装、蝴蝶结衬衫、珍珠配饰，精致不是炫富，是每一天都认真对待自己。',
  keyItemDescriptions: [
    '粗花呢面料，金色纽扣',
    '蝴蝶结领口或袖口装饰',
    '单层珍珠，长度到锁骨',
    '金色链条，小巧精致',
    '尖头细跟，裸色或黑色'
  ],
    difficulty: 3,
    silhouette: ['合身X型', 'A字裙', '收腰'],
    keyItems: ['粗花呢套装', '蝴蝶结衬衫', '珍珠项链', '链条包', '尖头高跟鞋'],
    colorPalette: ['#FFB6C1', '#FFFFFF', '#F5F0EB', '#DDA0DD'],
  
  styleSpecificAdvice: {
    suitableFor: '适合喜欢精致优雅风格、追求富家千金气质的人。X型收腰设计对沙漏形和梨形身材最友好，A字裙能很好地修饰下半身。',
    cautionPoints: '粗花呢+蝴蝶结+珍珠同时出现容易显得"太用力"——选两样就够了，留一点呼吸感。',
    sceneAdvice: '下午茶、约会、聚会、半正式场合。千金风的精致感让它适合需要得体又出彩的场合。',
  },
  brandRecommendations: [
    { tier: 'premium', brandName: 'Miu Miu', priceRange: '¥5,000-20,000', reason: '甜美风的奢华表达' },
    { tier: 'mid', brandName: 'Sandro', priceRange: '¥500-2,500', reason: '法式甜美的优质选择' },
    { tier: 'budget', brandName: 'UNIQLO', priceRange: '¥99-500', reason: '基础款甜美风的入门选择' },
  ],
},
  {
    id: 'minimalist',
    name: '极简主义',
    dimension: '视觉元素', category: '质感主义',
    description: '少即是多——纯色基础款、极致剪裁、衣橱只留经典',
    philosophy: '当所有多余被去除，剩下的就是纯粹的自己。',
  summary: '少即是多——纯色基础款、极致剪裁、衣橱只留经典。当所有多余被去除，剩下的就是纯粹的自己。',
  keyItemDescriptions: [
    '纯白，oversized或合身',
    '纯黑或深灰，高领设计',
    '高腰直筒，版型利落',
    '简约剪裁，羊毛或羊绒',
    '纯白或纯黑，皮革或帆布'
  ],
  silhouetteDescription: 'H型直筒剪裁是极简的灵魂——没有多余装饰，用利落的线条和精准的比例说话。',
  colorDescription: '黑白灰是极简的永恒语言——去掉色彩，剩下的是纯粹的质感对比。',
    difficulty: 2,
    silhouette: ['H型', '直筒', '微A'],
    keyItems: ['白衬衫', '黑色高领', '直筒西裤', '简约大衣', '素色球鞋'],
    colorPalette: ['#000000', '#FFFFFF', '#808080', '#F5F5F0'],
  
  styleSpecificAdvice: {
    suitableFor: '适合追求"少即是多"、注重剪裁和质感的人。极简的H型和直筒设计对大多数身材都很友好，干净利落的线条能修饰各种体型。',
    cautionPoints: '极简不等于"随便"——面料质感是极简的灵魂。廉价的纯色单品只会显得简陋，不会显得高级。',
    sceneAdvice: '通勤、商务会议、约会、艺术展览。极简的高级感让它适合几乎所有场合。',
  },
  seasonalLooks: [
    { season: 'spring_summer', title: '夏日极简', description: '白色亚麻衬衫配黑色高腰阔腿裤，脚踩简约皮质凉鞋。一个黑色托特包就够，干净利落。', items: ['白色亚麻衬衫', '黑色高腰阔腿裤', '皮质凉鞋', '黑色托特包'] },
    { season: 'autumn_winter', title: '秋冬极简', description: '黑色高领针织衫配灰色羊毛阔腿裤，外搭米色长款大衣。黑色皮靴收尾，简约但有层次。', items: ['黑色高领针织衫', '灰色羊毛阔腿裤', '米色长款大衣', '黑色皮靴'] },
  ],
  brandRecommendations: [
    { tier: 'premium', brandName: 'Loro Piana', priceRange: '¥5,000-30,000', reason: '顶级面料的代名词' },
    { tier: 'mid', brandName: 'Theory', priceRange: '¥800-3,000', reason: '质感与版型的优质平衡' },
    { tier: 'budget', brandName: 'UNIQLO', priceRange: '¥99-500', reason: '基础款质感的入门选择' },
  ],
  colorGuidance: {
    primary: '黑、白——极简的永恒底色，占70%',
    secondary: '灰色——过渡层次，占20%',
    accent: '米色——温暖点缀，占10%',
    ratio: '70% 无彩色 + 20% 中性灰 + 10% 暖调点缀',
  },
  bodyFitTips: {
    pearShape: 'Oversized白衬衫+直筒西裤，平衡上下比例',
    appleShape: 'H型长款大衣+黑色紧身裤，纵向拉长线条',
    hourglass: '收腰西装外套+直筒裙，突出腰线',
    rectangle: '层叠穿搭增加体积感，衬衫+马甲+阔腿裤',
    invertedTriangle: 'V领上衣+A字裙，弱化肩宽',
  },
},
  {
    id: 'maximalist',
    name: '极繁主义',
    dimension: '视觉元素', category: '极繁',
    description: '多即是多——印花叠印花、色彩冲撞、多层混搭的戏剧感',
    philosophy: '更多、更亮、更快乐。克制是别人的事情。',
  summary: '多即是多——印花叠印花、色彩冲撞、多层混搭的戏剧感。更多、更亮、更快乐。',
  keyItemDescriptions: [
    '大印花或拼色，戏剧感',
    '图案内搭，增加层次',
    '撞色或图案，夸张设计',
    '大号或层叠，存在感强',
    '装饰性鞋履，亮色或图案'
  ],
    difficulty: 5,
    silhouette: ['层叠廓形', '超大', '混合'],
    keyItems: ['印花外套', '图案内搭', '撞色下装', '夸张首饰', '装饰性鞋履'],
    colorPalette: ['#FF1493', '#FFD700', '#00FFFF', '#9B59B6'],
  
  styleSpecificAdvice: {
    suitableFor: '适合热爱时尚、不介意大胆表达的人。极繁主义没有身材限制——用色彩和廓形创造视觉焦点，任何体型都能找到表达方式。',
    cautionPoints: '极繁的核心是"有控制的丰富"——印花+色彩+配饰需要有一个统一的主题或色调，否则会显得杂乱。',
    sceneAdvice: '时尚活动、派对、音乐节、创意工作场合。极繁的戏剧感让它最适合需要表现力的场合。',
  },
  brandRecommendations: [
    { tier: 'premium', brandName: 'Dolce & Gabbana', priceRange: '¥5,000-30,000', reason: '极繁主义的代表品牌' },
    { tier: 'mid', brandName: 'Mango', priceRange: '¥200-1,000', reason: '印花和装饰元素的优质选择' },
    { tier: 'budget', brandName: 'ZARA', priceRange: '¥100-600', reason: '极繁风格的快时尚入门' },
  ],
},
  {
    id: 'old_money',
    name: '老钱风',
    dimension: '视觉元素', category: '质感主义',
    description: '顶级面料、无Logo、剪裁合身不紧身、颜色冷淡的低调贵族感',
    philosophy: '真正富有的人不需要告诉别人自己穿什么牌子。',
  summary: '顶级面料、无Logo、剪裁合身不紧身——真正富有的人不需要告诉别人自己穿什么牌子。',
  keyItemDescriptions: [
    '纯色羊绒，圆领或V领',
    '羊毛或羊绒，中长款',
    '单层珍珠，经典款',
    '皮质乐福鞋，舒适耐穿',
    '真丝或羊毛，简约印花'
  ],
  silhouetteDescription: '合身H型和微A型大衣是老钱的标志——不紧身、不松垮，恰到好处的从容。',
  colorDescription: '米白、驼色、藏蓝——老钱风的色彩从不张扬，但每一抹都经得起细看。',
    difficulty: 4,
    silhouette: ['合身H型', '微A型大衣', 'V领针织'],
    keyItems: ['羊绒衫', '羊毛大衣', '珍珠项链', '乐福鞋', '丝巾'],
    colorPalette: ['#F5F5DC', '#D2B48C', '#8B7355', '#1C2841'],
  
  styleSpecificAdvice: {
    suitableFor: '适合追求低调奢华、注重面料和剪裁的人。合身H型和微A型对大多数身材都很友好，顶级面料的垂坠感能很好地修饰身形。',
    cautionPoints: '老钱风不等于"老气"——可以用现代配饰（如简约手表或皮质腰带）来增加年轻感，避免全身都是传统元素。',
    sceneAdvice: '商务宴请、高端社交、家庭聚会、度假。老钱的低调贵气适合需要彰显品位的正式场合。',
  },
  brandRecommendations: [
    { tier: 'premium', brandName: 'Loro Piana', priceRange: '¥5,000-30,000', reason: '顶级面料的代名词' },
    { tier: 'mid', brandName: 'Theory', priceRange: '¥800-3,000', reason: '质感与版型的优质平衡' },
    { tier: 'budget', brandName: 'UNIQLO', priceRange: '¥99-500', reason: '基础款质感的入门选择' },
  ],
  colorGuidance: {
    primary: '米白、驼色——老钱的标志色，占60%',
    secondary: '藏蓝、深灰——沉稳过渡，占30%',
    accent: '珍珠白——提亮，占10%',
    ratio: '60% 暖中性色 + 30% 冷中性色 + 10% 提亮色',
  },
},
  {
    id: 'quiet_luxury',
    name: '静奢风',
    dimension: '视觉元素', category: '质感主义',
    description: '衣物没有品牌标识，但版型面料一看便知价值不菲',
    philosophy: '安静地奢侈——只有懂的人才懂。',
  summary: '衣物没有品牌标识，但版型面料一看便知价值不菲。安静地奢侈——只有懂的人才懂。',
  keyItemDescriptions: [
    '顶级羊绒，无logo设计',
    '手工精裁，合身版型',
    '真丝材质，简约设计',
    '极简皮质，无五金logo',
    '素面皮革，手工缝线'
  ],
    difficulty: 4,
    silhouette: ['合身H型', '微宽松', '垂坠'],
    keyItems: ['顶级羊绒衫', '手工西装', '真丝衬衫', '极简皮包', '素面皮鞋'],
    colorPalette: ['#F5F5F0', '#C4B5A5', '#696969', '#2C2C2C'],
  
  styleSpecificAdvice: {
    suitableFor: '适合追求"只有懂的人才懂"的高级感、注重面料和工艺的人。合身H型和微宽松版型对大多数身材都很友好。',
    cautionPoints: '静奢的核心是"看不出牌子但看得出贵"——如果单品没有极致的面料和剪裁，就失去了静奢的意义。',
    sceneAdvice: '商务会议、高端社交、约会晚餐、度假。静奢的安静高级感适合需要品位的场合。',
  },
  brandRecommendations: [
    { tier: 'premium', brandName: 'Loro Piana', priceRange: '¥5,000-30,000', reason: '顶级面料的代名词' },
    { tier: 'mid', brandName: 'Theory', priceRange: '¥800-3,000', reason: '质感与版型的优质平衡' },
    { tier: 'budget', brandName: 'UNIQLO', priceRange: '¥99-500', reason: '基础款质感的入门选择' },
  ],
},
  {
    id: 'wasteland',
    name: '末日废土风',
    dimension: '视觉元素', category: '未来科技',
    description: '破坏感、做旧染色、沙色灰黑——绑带立体口袋不规则解构',
    philosophy: '在废墟里找到自己的生存美学。',
  summary: '破坏感、做旧染色、沙色灰黑——在废墟里找到自己的生存美学。不规则解构、机能感是核心。',
  keyItemDescriptions: [
    '做旧水洗或染色，多层口袋',
    '立体口袋，机能面料',
    '绑带或抽绳设计，多口袋',
    '厚底战斗靴，做旧处理',
    '功能性背包，做旧帆布'
  ],
    difficulty: 5,
    silhouette: ['不规则解构', '层叠机能', '超大Oversize'],
    keyItems: ['做旧外套', '立体口袋马甲', '绑带裤', '战斗靴', '功能性背包'],
    colorPalette: ['#8B7355', '#3D3D3D', '#1A1A1A', '#D4C4A8'],
  
  styleSpecificAdvice: {
    suitableFor: '适合喜欢工业美学、追求独特风格的人。不规则解构和层叠机能对各种身材都有包容性，绑带和口袋设计可以调整视觉比例。',
    cautionPoints: '废土风容易穿成"cosplay"——选1-2个核心元素（如做旧外套或机能马甲），搭配日常单品，不要全身都废土。',
    sceneAdvice: '音乐节、街头拍照、创意工作、朋友聚会。不适合职场和正式场合。',
  },
  brandRecommendations: [
    { tier: 'premium', brandName: 'Rick Owens', priceRange: '¥5,000-25,000', reason: '未来主义美学的先锋' },
    { tier: 'mid', brandName: 'ACRONYM', priceRange: '¥2,000-8,000', reason: '机能风的专业品牌' },
    { tier: 'budget', brandName: 'ZARA', priceRange: '¥100-600', reason: '科技感元素的入门选择' },
  ],
},
  {
    id: 'cyberpunk',
    name: '赛博朋克风',
    dimension: '视觉元素', category: '未来科技',
    description: '高科技低生活——PVC材质、荧光线条、机能绑带、护目镜',
    philosophy: '在数据洪流中保持自己的人性光芒。',
  summary: '高科技低生活的未来美学——PVC材质、荧光线条、机能绑带。在数据洪流中保持人性光芒。',
  keyItemDescriptions: [
    'PVC或透明材质，短款或长款',
    '荧光色，束脚或直筒',
    '机能绑带，多口袋',
    '护目镜或科技感墨镜',
    'LED或金属感，未来风格'
  ],
    difficulty: 5,
    silhouette: ['未来廓形', '多层职能', '不对称'],
    keyItems: ['PVC透明外套', '荧光长裤', '机能绑带马甲', '护目镜/墨镜', '科技感配饰'],
    colorPalette: ['#1A1A1A', '#FF00FF', '#00FFFF', '#FF4500'],
  
  styleSpecificAdvice: {
    suitableFor: '适合喜欢未来美学、科技感穿搭的人。赛博朋克的廓形对身材包容度高，荧光线条和机能绑带可以创造视觉焦点。',
    cautionPoints: '赛博朋克容易穿得太"道具感"——PVC和荧光元素选一件就够了，搭配黑色基础款来平衡。',
    sceneAdvice: '时尚活动、音乐节、创意工作、派对。不适合日常通勤和正式场合。',
  },
  brandRecommendations: [
    { tier: 'premium', brandName: 'Rick Owens', priceRange: '¥5,000-25,000', reason: '未来主义美学的先锋' },
    { tier: 'mid', brandName: 'ACRONYM', priceRange: '¥2,000-8,000', reason: '机能风的专业品牌' },
    { tier: 'budget', brandName: 'ZARA', priceRange: '¥100-600', reason: '科技感元素的入门选择' },
  ],
},
  {
    id: 'y2k',
    name: 'Y2K千禧风',
    dimension: '视觉元素', category: '复古视觉',
    description: '短紧上衣、低腰裤、厚底鞋、塑料感配饰，数码憧憬感',
    philosophy: '回到那个互联网刚起步、每个人都对未来充满想象的年代。',
  summary: '回到千禧年——短紧上衣、低腰裤、厚底鞋、塑料感配饰。那个互联网刚起步、充满想象的年代。',
  keyItemDescriptions: [
    '短款或露腰，鲜艳色彩',
    '低腰设计，水洗或纯色',
    '厚底松糕鞋或高跟鞋',
    '彩色或金属感，小号',
    '金属腰链，Y2K标志性配饰'
  ],
    difficulty: 3,
    silhouette: ['短上衣+低腰裤', '紧身+宽松', '不对称'],
    keyItems: ['短款上衣', '低腰牛仔裤', '厚底鞋', '小墨镜', '金属腰链'],
    colorPalette: ['#FF69B4', '#C0C0C0', '#87CEEB', '#DDA0DD'],
  
  styleSpecificAdvice: {
    suitableFor: '适合喜欢千禧年复古风格、追求Y2K美学的人。短上衣+低腰裤的组合对腰腹线条有要求，高腰版型更适合日常。',
    cautionPoints: 'Y2K容易穿成"过时"而不是"复古"——选1-2个Y2K元素（如金属腰链或小墨镜），搭配现代单品来平衡。',
    sceneAdvice: '逛街、朋友聚会、音乐节、街头拍照。Y2K的复古活力感适合轻松愉快的场合。',
  },
  brandRecommendations: [
    { tier: 'premium', brandName: 'Ralph Lauren', priceRange: '¥1,000-5,000', reason: '复古美学的经典代表' },
    { tier: 'mid', brandName: 'Levi\'s', priceRange: '¥300-1,500', reason: '复古牛仔的标志品牌' },
    { tier: 'budget', brandName: '古着店', priceRange: '¥50-300', reason: '真正的复古单品，独一无二' },
  ],
},
  {
    id: 'shibuya_gal',
    name: '涩谷辣妹风',
    dimension: '视觉元素', category: '亚文化',
    description: '日系美黑、漂染浅发、迷你裙、厚底长靴——夸张眼妆是灵魂',
    philosophy: '做自己世界里的女主角。',
  summary: '日系美黑、漂染浅发、迷你裙、厚底长靴——做自己世界里的女主角。夸张、自信、不掩饰。',
  keyItemDescriptions: [
    '超短款，亮色或图案',
    '厚底设计，过膝或中筒',
    '浅色或鲜艳的接发/假发',
    '白色或彩色眼线笔',
    '花哨美甲，亮片或贴钻'
  ],
    difficulty: 4,
    silhouette: ['短裙+厚底鞋', '紧身', '高腰'],
    keyItems: ['迷你裙', '厚底长靴', '漂染假发/接发', '白色眼线', '花哨美甲'],
    colorPalette: ['#FF69B4', '#FFD700', '#FFFFFF', '#1A1A1A'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Comme des Garçons', priceRange: '¥3,000-15,000', reason: '亚文化美学的先锋' },
    { tier: 'mid', brandName: 'Dr. Martens', priceRange: '¥500-2,000', reason: '亚文化鞋履的标志品牌' },
    { tier: 'budget', brandName: '古着店', priceRange: '¥50-300', reason: '亚文化单品的宝藏来源' },
  ],
},
  {
    id: 'dark_poetry',
    name: '暗黑风',
    dimension: '视觉元素', category: '暗黑',
    description: '参考Ann Demeulemeester——全黑、垂坠、不对称解构，暗夜诗意',
    philosophy: '黑暗不是无光，是另一种形式的深度。',
  summary: '全黑、垂坠、不对称解构——暗夜诗意。黑暗不是无光，是另一种形式的深度。',
  keyItemDescriptions: [
    '全黑长款，垂坠面料',
    '不对称设计，层叠感',
    '黑色皮靴，中筒或长筒',
    '暗色羊毛或丝绸',
    '极简银饰，细链或环'
  ],
    difficulty: 4,
    silhouette: ['垂坠H型', '不对称', '解构'],
    keyItems: ['全黑长外套', '垂坠不对称裙', '皮靴', '暗色围巾', '极简银饰'],
    colorPalette: ['#0A0A0A', '#1A1A1A', '#2C2C2C', '#3D3D3D'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Ann Demeulemeester', priceRange: '¥5,000-25,000', reason: '暗黑美学的极致代表' },
    { tier: 'mid', brandName: 'AllSaints', priceRange: '¥500-2,500', reason: '暗黑风格的优质选择' },
    { tier: 'budget', brandName: 'ZARA', priceRange: '¥100-600', reason: '暗黑元素的性价比之选' },
  ],
},
  {
    id: 'pure_desire',
    name: '纯欲风',
    dimension: '视觉元素', category: '清新甜美',
    description: '婴儿蓝嫩粉幼态色 + 紧身针织蕾丝——又纯又欲',
    philosophy: '最强的吸引是不经意的流露。',
  summary: '婴儿蓝嫩粉幼态色配紧身针织蕾丝——又纯又欲。最强的吸引是不经意的流露。',
  keyItemDescriptions: [
    '紧身版型，柔软面料',
    '蕾丝花边，白色或浅粉',
    'A字短裙，纯色或蕾丝',
    '圆头玛丽珍鞋，搭扣设计',
    '蝴蝶结或珍珠，小巧精致'
  ],
    difficulty: 2,
    silhouette: ['紧身+柔软', 'A字短裙', '泡泡袖'],
    keyItems: ['紧身针织衫', '蕾丝内搭', '短裙', '玛丽珍鞋', '蝴蝶结配饰'],
    colorPalette: ['#E6E6FA', '#FFB6C1', '#FFF0F5', '#F5F5FF'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Miu Miu', priceRange: '¥5,000-20,000', reason: '甜美风的奢华表达' },
    { tier: 'mid', brandName: 'Sandro', priceRange: '¥500-2,500', reason: '法式甜美的优质选择' },
    { tier: 'budget', brandName: 'UNIQLO', priceRange: '¥99-500', reason: '基础款甜美风的入门选择' },
  ],
},
  {
    id: 'power_woman',
    name: '大女人风',
    dimension: '视觉元素', category: '女性力量',
    description: '垫肩西装、阔腿裤、尖头高跟鞋，强调强势气场的独立女性',
    philosophy: '衣服是盔甲——穿上它，世界就是你的会议室。',
  summary: '垫肩西装、阔腿裤、尖头高跟鞋——强调强势气场的独立女性。衣服是盔甲，穿上它世界就是你的会议室。',
  keyItemDescriptions: [
    '垫肩设计，精裁合身',
    '高腰阔腿，垂坠感好',
    '真丝材质，简约设计',
    '尖头细跟，黑色或裸色',
    '大号皮质，结构感强'
  ],
    difficulty: 3,
    silhouette: ['宽肩X型', '直筒阔腿', '收腰'],
    keyItems: ['垫肩西装', '阔腿西裤', '真丝衬衫', '尖头高跟鞋', '公文包'],
    colorPalette: ['#1C1C1C', '#FFFFFF', '#8B0000', '#4682B4'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Alexander McQueen', priceRange: '¥5,000-25,000', reason: '女性力量美学的代表' },
    { tier: 'mid', brandName: 'Theory', priceRange: '¥800-3,000', reason: '职场女性的优质选择' },
    { tier: 'budget', brandName: 'ZARA', priceRange: '¥100-600', reason: '垫肩西装和阔腿裤的入门选择' },
  ],
},
  {
    id: 'ballet_core',
    name: '芭蕾风',
    dimension: '视觉元素', category: '清新甜美',
    description: '绑带、纱裙、袜套、芭蕾平底鞋，莫兰迪色系的轻盈舞者感',
    philosophy: '把日常穿成一场旋转。',
  summary: '绑带、纱裙、袜套、芭蕾平底鞋——莫兰迪色系的轻盈舞者感。把日常穿成一场旋转。',
  keyItemDescriptions: [
    '多层纱裙，莫兰迪色系',
    '绑带设计，露肩或一字领',
    '针织袜套，及膝或过膝',
    '平底芭蕾鞋，绑带设计',
    '蝴蝶结或花朵，小巧精致'
  ],
    difficulty: 2,
    silhouette: ['收腰大摆', '直筒+纱裙', '修身'],
    keyItems: ['纱裙', '绑带上衣', '袜套', '芭蕾平底鞋', '蝴蝶结发饰'],
    colorPalette: ['#F5E6E0', '#E8D5E0', '#D4E5D9', '#FFF0F5'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Miu Miu', priceRange: '¥5,000-20,000', reason: '甜美风的奢华表达' },
    { tier: 'mid', brandName: 'Sandro', priceRange: '¥500-2,500', reason: '法式甜美的优质选择' },
    { tier: 'budget', brandName: 'UNIQLO', priceRange: '¥99-500', reason: '基础款甜美风的入门选择' },
  ],
},
  {
    id: 'nerd_chic',
    name: '书呆子风',
    dimension: '视觉元素', category: '复古视觉',
    description: '非主流框架眼镜、针织背心、宽松卡其裤，内敛书卷气',
    philosophy: '智识是最耐看的配饰。',
  summary: '非主流框架眼镜、针织背心、宽松卡其裤——内敛书卷气。智识是最耐看的配饰。',
  keyItemDescriptions: [
    '黑框或玳瑁框，圆形或方形',
    '菱格纹或纯色，V领',
    '卡其色或米色，宽松版型',
    '纯白，硬挺面料',
    '皮质乐福鞋，舒适耐穿'
  ],
    difficulty: 2,
    silhouette: ['宽松H型', '直筒', '落肩'],
    keyItems: ['框架眼镜', '针织背心', '宽松卡其裤', '白衬衫', '乐福鞋'],
    colorPalette: ['#8B7355', '#696969', '#F5F5DC', '#2F4F4F'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Ralph Lauren', priceRange: '¥1,000-5,000', reason: '复古美学的经典代表' },
    { tier: 'mid', brandName: 'Levi\'s', priceRange: '¥300-1,500', reason: '复古牛仔的标志品牌' },
    { tier: 'budget', brandName: '古着店', priceRange: '¥50-300', reason: '真正的复古单品，独一无二' },
  ],
},
  {
    id: 'camo_tech',
    name: '迷彩机能风',
    dimension: '视觉元素', category: '未来科技',
    description: '大量使用迷彩、军绿元素，结合机能马甲工装裤，军事硬朗感',
    philosophy: '城市是新的丛林，穿好你的战服。',
  summary: '迷彩军绿结合机能马甲工装裤——军事硬朗感。城市是新的丛林，穿好你的战服。',
  keyItemDescriptions: [
    '迷彩印花，机能面料',
    '多口袋设计，可调节',
    '工装风格，多口袋',
    '厚底战斗靴，耐磨',
    '军用风格，大容量'
  ],
    difficulty: 3,
    silhouette: ['层叠机能', '多口袋廓形', '工装锥形'],
    keyItems: ['迷彩夹克', '机能马甲', '工装裤', '战斗靴', '军用背包'],
    colorPalette: ['#3B5323', '#4A5D23', '#1A1A1A', '#8B7355'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Rick Owens', priceRange: '¥5,000-25,000', reason: '未来主义美学的先锋' },
    { tier: 'mid', brandName: 'ACRONYM', priceRange: '¥2,000-8,000', reason: '机能风的专业品牌' },
    { tier: 'budget', brandName: 'ZARA', priceRange: '¥100-600', reason: '科技感元素的入门选择' },
  ],
},
  {
    id: 'pop_art',
    name: '波普艺术风',
    dimension: '视觉元素', category: '极繁',
    description: '安迪沃霍尔式波普图案大面积印花——漫画、Logo、罐头',
    philosophy: '艺术不只在画布上，也在你身上。',
  summary: '安迪沃霍尔式波普图案大面积印花——漫画、Logo、罐头。艺术不只在画布上，也在你身上。',
  keyItemDescriptions: [
    '波普印花，亮色或纯色',
    '漫画图案，A字或直筒',
    '亮色或拼色，oversized',
    'Pop art风格，彩色或金属',
    '彩色运动鞋，撞色设计'
  ],
    difficulty: 4,
    silhouette: ['直筒', 'Oversize', 'A字'],
    keyItems: ['波普印花T恤', '漫画图案裙', '亮色外套', 'Pop art配饰', '彩色运动鞋'],
    colorPalette: ['#FF0000', '#FFD700', '#0000FF', '#FFFFFF'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Dolce & Gabbana', priceRange: '¥5,000-30,000', reason: '极繁主义的代表品牌' },
    { tier: 'mid', brandName: 'Mango', priceRange: '¥200-1,000', reason: '印花和装饰元素的优质选择' },
    { tier: 'budget', brandName: 'ZARA', priceRange: '¥100-600', reason: '极繁风格的快时尚入门' },
  ],
},
  {
    id: 'earthy_relax',
    name: '地色系松弛感',
    dimension: '视觉元素', category: '色彩美学',
    description: '全身上下大地色系——米、卡其、棕，版型宽松柔软',
    philosophy: '做大地的一部分，安静而有力。',
  summary: '全身上下大地色系——米、卡其、棕，版型宽松柔软。做大地的一部分，安静而有力。',
  keyItemDescriptions: [
    '燕麦色或米色，宽大版型',
    '米色或卡其，高腰阔腿',
    '驼色或沙色，中长款',
    '皮质拖鞋，舒适柔软',
    '帆布或棉麻，大容量'
  ],
    difficulty: 1,
    silhouette: ['宽松Oversize', '垂坠', '落肩'],
    keyItems: ['燕麦色宽大毛衣', '米色阔腿裤', '驼色大衣', '皮质拖鞋', '帆布袋'],
    colorPalette: ['#F5F0EB', '#C4B5A5', '#D4C4A8', '#8B7355'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Stella McCartney', priceRange: '¥3,000-15,000', reason: '色彩运用的艺术级品牌' },
    { tier: 'mid', brandName: 'COS', priceRange: '¥300-2,000', reason: '色彩搭配的优质选择' },
    { tier: 'budget', brandName: 'UNIQLO', priceRange: '¥99-500', reason: '基础款色彩的性价比之选' },
  ],
},

  // ==================== 三、场景圈层（20种）====================
  {
    id: 'urban_outdoor',
    name: '户外机能风',
    dimension: '场景圈层', category: '户外运动',
    description: '为城市户外活动而生——多口袋、防水拉链、机能马甲、徒步鞋',
    philosophy: '城市就是你的户外乐园。',
  summary: '为城市户外活动而生——多口袋、防水拉链、机能马甲。城市就是你的户外乐园。',
  keyItemDescriptions: [
    '防水防风，多口袋设计',
    '轻量机能，可收纳',
    '防水面料，工装风格',
    '防滑耐磨，适合徒步',
    '多功能分区，轻量设计'
  ],
    difficulty: 3,
    silhouette: ['层叠机能', '多口袋廓形', '工装锥形'],
    keyItems: ['冲锋衣', '机能马甲', '防水工装裤', '徒步鞋', '多功能背包'],
    colorPalette: ['#3B5323', '#1A1A1A', '#C4B5A5', '#FF6600'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Arc\'teryx', priceRange: '¥2,000-8,000', reason: '户外机能的天花板' },
    { tier: 'mid', brandName: 'The North Face', priceRange: '¥500-3,000', reason: '户外风格的经典选择' },
    { tier: 'budget', brandName: 'Decathlon', priceRange: '¥50-500', reason: '户外装备的性价比之王' },
  ],
},
  {
    id: 'gorpcore',
    name: 'Gorpcore',
    dimension: '场景圈层', category: '户外运动',
    description: '户外美学日常化——冲锋衣搭工装裤+衬衫，不刻意却很潮',
    philosophy: '最好的衣服是可以陪你走遍世界的衣服。',
  summary: '户外美学日常化——冲锋衣搭工装裤配衬衫，不刻意却很潮。最好的衣服是可以陪你走遍世界的。',
  keyItemDescriptions: [
    '防水防风，亮色或纯色',
    '抓绒材质，保暖透气',
    '多口袋，工装风格',
    '纯色或格纹，叠穿内搭',
    '防滑耐磨，适合日常'
  ],
    difficulty: 3,
    silhouette: ['层叠机能', '多口袋廓形', '上宽下窄'],
    keyItems: ['冲锋衣', '抓绒中层', '工装裤', '衬衫', '徒步鞋'],
    colorPalette: ['#3B5323', '#696969', '#C4B5A5', '#FF6600'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Arc\'teryx', priceRange: '¥2,000-8,000', reason: '户外机能的天花板' },
    { tier: 'mid', brandName: 'The North Face', priceRange: '¥500-3,000', reason: '户外风格的经典选择' },
    { tier: 'budget', brandName: 'Decathlon', priceRange: '¥50-500', reason: '户外装备的性价比之王' },
  ],
},
  {
    id: 'blokecore',
    name: 'Blokecore',
    dimension: '场景圈层', category: '运动休闲',
    description: '复古足球球衣搭牛仔裤、运动鞋，融入日常的球迷时尚',
    philosophy: '看球也要有型。',
  summary: '复古足球球衣搭牛仔裤运动鞋——球迷时尚日常化。看球也要有型。',
  keyItemDescriptions: [
    '复古球衣，经典球队logo',
    '直筒或微喇，水洗做旧',
    '白色中筒袜，复古感',
    '经典款运动鞋，皮革或帆布',
    '可调节后扣，运动感'
  ],
    difficulty: 2,
    silhouette: ['上宽下窄', '直筒', 'Oversize'],
    keyItems: ['复古足球球衣', '直筒牛仔裤', '白袜', '经典运动鞋', '棒球帽'],
    colorPalette: ['#4A6FA5', '#C41E3A', '#FFFFFF', '#1A1A1A'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Lululemon', priceRange: '¥500-2,000', reason: '运动休闲的品质代表' },
    { tier: 'mid', brandName: 'Nike', priceRange: '¥300-1,500', reason: '运动风格的经典品牌' },
    { tier: 'budget', brandName: 'Decathlon', priceRange: '¥50-500', reason: '运动装备的入门选择' },
  ],
},
  {
    id: 'tenniscore',
    name: 'Tenniscore',
    dimension: '场景圈层', category: '运动休闲',
    description: '百褶短裙、Polo衫、针织背心、白球鞋，上流俱乐部的运动感',
    philosophy: '网球场的优雅是可以穿到咖啡馆的。',
  summary: '百褶短裙、Polo衫、针织背心——上流俱乐部的运动感。网球场的优雅可以穿到咖啡馆。',
  keyItemDescriptions: [
    '百褶设计，纯白或拼色',
    'Polo领，纯色或条纹',
    'V领菱格纹，针织材质',
    '纯白皮革，经典网球鞋款',
    '遮阳设计，简约logo'
  ],
    difficulty: 2,
    silhouette: ['百褶A字', '合身Polo', 'V领'],
    keyItems: ['百褶短裙', 'Polo衫', '针织背心', '白色运动鞋', '网球帽'],
    colorPalette: ['#FFFFFF', '#1C2841', '#8B0000', '#F5F5F0'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Lululemon', priceRange: '¥500-2,000', reason: '运动休闲的品质代表' },
    { tier: 'mid', brandName: 'Nike', priceRange: '¥300-1,500', reason: '运动风格的经典品牌' },
    { tier: 'budget', brandName: 'Decathlon', priceRange: '¥50-500', reason: '运动装备的入门选择' },
  ],
},
  {
    id: 'indie_designer',
    name: '独立设计师风',
    dimension: '场景圈层', category: '文化艺术',
    description: '小众设计师品牌——独特解构、手工痕迹、实验性廓形',
    philosophy: '衣服是行走的艺术品。',
  summary: '小众设计师品牌——独特解构、手工痕迹、实验性廓形。衣服是行走的艺术品。',
  keyItemDescriptions: [
    '解构剪裁，独特廓形',
    '不规则下摆或拼接',
    '手工制作，天然材质',
    '独特廓形，实验性设计',
    '手工定制，艺术感'
  ],
    difficulty: 5,
    silhouette: ['实验廓形', '不规则', '解构'],
    keyItems: ['解构衬衫', '不规则半裙', '手工首饰', '独特廓形外套', '定制鞋履'],
    colorPalette: ['#2C2C2C', '#FFFFFF', '#8B8B83', '#C4A35A'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Maison Margiela', priceRange: '¥5,000-25,000', reason: '艺术美学的极致表达' },
    { tier: 'mid', brandName: 'COS', priceRange: '¥300-2,000', reason: '艺术感穿搭的优质选择' },
    { tier: 'budget', brandName: 'UNIQLO', priceRange: '¥99-500', reason: '基础款艺术感穿搭的入门' },
  ],
},
  {
    id: 'skater',
    name: '街头滑板风',
    dimension: '场景圈层', category: '街头潮流',
    description: '宽松T恤或卫衣、工装裤或垮裤、滑板鞋——随性不羁',
    philosophy: '摔倒了就爬起来，衣服磨破更酷。',
  summary: '宽松T恤卫衣、工装裤垮裤、滑板鞋——随性不羁。摔倒了就爬起来，衣服磨破更酷。',
  keyItemDescriptions: [
    '宽松版型，大号印花',
    '多口袋，宽松版型',
    '高帮或低帮，耐磨',
    '可调节后扣，平檐设计',
    '帆布或皮质，金属扣'
  ],
    difficulty: 2,
    silhouette: ['宽松Oversize', '垮裤', '直筒'],
    keyItems: ['宽松印花T恤', '工装裤', '滑板鞋', '棒球帽', '帆布腰带'],
    colorPalette: ['#1A1A1A', '#FFFFFF', '#808080', '#FF4500'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Supreme', priceRange: '¥1,000-5,000', reason: '街头文化的标志品牌' },
    { tier: 'mid', brandName: 'Vans', priceRange: '¥300-1,000', reason: '街头风格的经典选择' },
    { tier: 'budget', brandName: 'Converse', priceRange: '¥200-800', reason: '街头风格的入门必备' },
  ],
},
  {
    id: 'graffiti_art',
    name: '街头涂鸦艺术风',
    dimension: '场景圈层', category: '街头潮流',
    description: '大面积涂鸦印花、喷漆效果、标语——反叛个性表达',
    philosophy: '街道是画布，衣服是宣言。',
  summary: '大面积涂鸦印花、喷漆效果、标语——反叛个性表达。街道是画布，衣服是宣言。',
  keyItemDescriptions: [
    '涂鸦印花，oversized版型',
    '喷漆效果或破洞',
    '标语或图案印花',
    '高帮帆布鞋，彩色',
    '涂鸦风格，金属或塑料'
  ],
    difficulty: 4,
    silhouette: ['Oversize', '直筒', '不规则'],
    keyItems: ['涂鸦印花卫衣', '喷漆效果牛仔裤', '标语T恤', '高帮帆布鞋', '涂鸦配饰'],
    colorPalette: ['#FF1493', '#00FFFF', '#FFD700', '#1A1A1A'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Supreme', priceRange: '¥1,000-5,000', reason: '街头文化的标志品牌' },
    { tier: 'mid', brandName: 'Vans', priceRange: '¥300-1,000', reason: '街头风格的经典选择' },
    { tier: 'budget', brandName: 'Converse', priceRange: '¥200-800', reason: '街头风格的入门必备' },
  ],
},
  {
    id: 'festival_boho',
    name: '音乐节波西米亚',
    dimension: '场景圈层', category: '音乐舞台',
    description: '流苏背心、牛仔短裤、罗马凉鞋、花朵头饰——为音乐节而生',
    philosophy: '人生就是一场音乐节。',
  summary: '流苏背心、牛仔短裤、罗马凉鞋——为音乐节而生。人生就是一场音乐节。',
  keyItemDescriptions: [
    '流苏装饰，短款或背心',
    '牛仔短裤，做旧水洗',
    '罗马绑带设计，平底',
    '花朵或羽毛头饰',
    '圆形或猫眼，复古感'
  ],
    difficulty: 2,
    silhouette: ['A字短款', '流苏', '层叠'],
    keyItems: ['流苏背心', '牛仔短裤', '罗马凉鞋', '花朵头饰', '圆形墨镜'],
    colorPalette: ['#FF8C00', '#FFD700', '#FFFFFF', '#8B4513'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Gucci', priceRange: '¥5,000-30,000', reason: '舞台感的奢华表达' },
    { tier: 'mid', brandName: 'ZARA', priceRange: '¥100-600', reason: '亮片和装饰元素的快时尚选择' },
    { tier: 'budget', brandName: '古着店', priceRange: '¥50-300', reason: '舞台风格单品的宝藏来源' },
  ],
},
  {
    id: 'travel_resort',
    name: '旅行度假风',
    dimension: '场景圈层', category: '休闲度假',
    description: '亚麻套装、飘逸长裙、穆勒鞋、大容量托特包——舒适上镜',
    philosophy: '把假期穿在身上。',
  summary: '亚麻套装、飘逸长裙、穆勒鞋——舒适上镜。把假期穿在身上。',
  keyItemDescriptions: [
    '亚麻材质，套装设计',
    '飘逸面料，长款或中长款',
    '穆勒鞋或拖鞋，舒适',
    '大容量托特包，帆布或草编',
    '宽檐草编帽，度假感'
  ],
    difficulty: 2,
    silhouette: ['飘逸A型', '直筒', '宽松'],
    keyItems: ['亚麻套装', '飘逸长裙', '穆勒鞋', '大号托特包', '草帽'],
    colorPalette: ['#FFFFFF', '#F5F0EB', '#87CEEB', '#C4A35A'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Loro Piana', priceRange: '¥5,000-20,000', reason: '度假穿搭的奢华之选' },
    { tier: 'mid', brandName: 'Mango', priceRange: '¥200-1,000', reason: '度假风格的优质选择' },
    { tier: 'budget', brandName: 'UNIQLO', priceRange: '¥99-500', reason: '亚麻和棉麻单品的性价比之选' },
  ],
},
  {
    id: 'cafe_lounge',
    name: '居家咖啡馆风',
    dimension: '场景圈层', category: '休闲度假',
    description: '像在附近咖啡馆办公会友——舒适针织套装、慵懒Oversize毛衣',
    philosophy: '在家也要穿得体面，因为舒服也可以很好看。',
  summary: '像在附近咖啡馆办公会友——舒适针织套装、慵懒Oversize毛衣。在家也要穿得体面。',
  keyItemDescriptions: [
    '针织套装，柔软舒适',
    'oversized版型，羊毛或棉',
    '羊毛拖鞋，保暖柔软',
    '宽松直筒，棉质或针织',
    '帆布或棉麻，休闲感'
  ],
    difficulty: 1,
    silhouette: ['宽松Oversize', '直筒', '柔软垂坠'],
    keyItems: ['针织套装', 'Oversize毛衣', '羊毛拖鞋', '宽松直筒裤', '帆布袋'],
    colorPalette: ['#F5F0EB', '#D4C5B9', '#C4B5A5', '#F5F5F0'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Loro Piana', priceRange: '¥5,000-20,000', reason: '度假穿搭的奢华之选' },
    { tier: 'mid', brandName: 'Mango', priceRange: '¥200-1,000', reason: '度假风格的优质选择' },
    { tier: 'budget', brandName: 'UNIQLO', priceRange: '¥99-500', reason: '亚麻和棉麻单品的性价比之选' },
  ],
},
  {
    id: 'intellectual',
    name: '知识分子风',
    dimension: '场景圈层', category: '文化艺术',
    description: '作家学者的衣橱——宽松西装、白衬衫、马甲、乐福鞋',
    philosophy: '穿衣服的智慧不在于跟风，在于知道什么衬得上你的大脑。',
  summary: '作家学者的衣橱——宽松西装、白衬衫、马甲、乐福鞋。穿衣服的智慧在于知道什么衬得上你的大脑。',
  keyItemDescriptions: [
    '宽松版型，羊毛或棉麻',
    '高领针织，纯色或条纹',
    '马甲叠穿，羊毛或针织',
    '直筒或阔腿，垂坠感好',
    '皮质乐福鞋，经典款'
  ],
    difficulty: 3,
    silhouette: ['宽松H型', '落肩', '直筒阔腿'],
    keyItems: ['宽松西装', '高领针织', '马甲', '直筒裤', '乐福鞋'],
    colorPalette: ['#8B7355', '#696969', '#2F4F4F', '#F5F5DC'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Maison Margiela', priceRange: '¥5,000-25,000', reason: '艺术美学的极致表达' },
    { tier: 'mid', brandName: 'COS', priceRange: '¥300-2,000', reason: '艺术感穿搭的优质选择' },
    { tier: 'budget', brandName: 'UNIQLO', priceRange: '¥99-500', reason: '基础款艺术感穿搭的入门' },
  ],
},
  {
    id: 'artisan_zen',
    name: '清冷艺术家风',
    dimension: '场景圈层', category: '文化艺术',
    description: '木质陶土色调、亚麻褶皱面料，远离商业的创作感',
    philosophy: '创作需要安静，衣服也是。',
  summary: '木质陶土色调、亚麻褶皱面料——远离商业的创作感。创作需要安静，衣服也是。',
  keyItemDescriptions: [
    '亚麻材质，长款宽松',
    '褶皱面料，阔腿版型',
    '陶土色或木质，手工感',
    '手工皮鞋，做旧处理',
    '帆布或棉麻，自然染色'
  ],
    difficulty: 3,
    silhouette: ['宽松落肩', '垂坠', '包裹感'],
    keyItems: ['亚麻长衫', '褶皱阔腿裤', '陶土色配饰', '手工皮鞋', '帆布袋'],
    colorPalette: ['#D4C4A8', '#8B7355', '#C4A35A', '#6B6B6B'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Maison Margiela', priceRange: '¥5,000-25,000', reason: '艺术美学的极致表达' },
    { tier: 'mid', brandName: 'COS', priceRange: '¥300-2,000', reason: '艺术感穿搭的优质选择' },
    { tier: 'budget', brandName: 'UNIQLO', priceRange: '¥99-500', reason: '基础款艺术感穿搭的入门' },
  ],
},
  {
    id: 'office_boss',
    name: '通勤精英风',
    dimension: '场景圈层', category: '职场精英',
    description: '剪裁精良的西装、真丝衬衫、烟管裤，中性色调的职业感',
    philosophy: '穿上好衣服，去征服今天。',
  summary: '剪裁精良的西装、真丝衬衫、烟管裤——中性色调的职业感。穿上好衣服，去征服今天。',
  keyItemDescriptions: [
    '精裁合身，羊毛或混纺',
    '真丝材质，简约设计',
    '烟管裤版型，垂坠感好',
    '尖头细跟，黑色或裸色',
    '大号皮质，结构感强'
  ],
    difficulty: 3,
    silhouette: ['合身X型', '烟管直筒', 'H型'],
    keyItems: ['精裁西装', '真丝衬衫', '烟管裤', '尖头高跟鞋', '公文包'],
    colorPalette: ['#1C1C1C', '#FFFFFF', '#808080', '#4682B4'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Hugo Boss', priceRange: '¥2,000-10,000', reason: '职场精英的西装首选' },
    { tier: 'mid', brandName: 'Massimo Dutti', priceRange: '¥500-2,000', reason: '职场穿搭的优质选择' },
    { tier: 'budget', brandName: 'UNIQLO', priceRange: '¥99-500', reason: '基础款职场穿搭的入门' },
  ],
},
  {
    id: 'avant_garde',
    name: '前卫先锋风',
    dimension: '场景圈层', category: '文化艺术',
    description: '挑战传统廓形——超大垫肩、超长袖，玩比例游戏',
    philosophy: '时尚就是打破规则再建立规则。',
  summary: '挑战传统廓形——超大垫肩、超长袖，玩比例游戏。时尚就是打破规则再建立规则。',
  keyItemDescriptions: [
    '超长袖设计，夸张比例',
    '超大垫肩，结构感',
    '不规则下摆或拼接',
    '异形跟或独特设计',
    '夸张设计，艺术感'
  ],
    difficulty: 5,
    silhouette: ['夸张比例', '超大廓形', '解构'],
    keyItems: ['超长袖上衣', '超大垫肩外套', '不规则半裙', '异形跟鞋', '夸张配饰'],
    colorPalette: ['#1A1A1A', '#FFFFFF', '#C41E3A', '#808080'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Maison Margiela', priceRange: '¥5,000-25,000', reason: '艺术美学的极致表达' },
    { tier: 'mid', brandName: 'COS', priceRange: '¥300-2,000', reason: '艺术感穿搭的优质选择' },
    { tier: 'budget', brandName: 'UNIQLO', priceRange: '¥99-500', reason: '基础款艺术感穿搭的入门' },
  ],
},
  {
    id: 'zen_healing',
    name: '禅意疗愈风',
    dimension: '场景圈层', category: '文化艺术',
    description: '宽松棉麻袍子、阔腿裤、平底布鞋——色彩来自自然，追求舒适',
    philosophy: '衣服是包裹灵魂的容器，越轻盈越好。',
  summary: '宽松棉麻袍子、阔腿裤、平底布鞋——色彩来自自然。衣服是包裹灵魂的容器，越轻盈越好。',
  keyItemDescriptions: [
    '棉麻长袍，宽松版型',
    '阔腿棉裤，舒适柔软',
    '平底布鞋，手工制作',
    '木质或天然石材',
    '禅意披肩，棉麻材质'
  ],
    difficulty: 2,
    silhouette: ['宽松H型', '垂坠', '落肩'],
    keyItems: ['棉麻长袍', '阔腿棉裤', '平底布鞋', '木质首饰', '禅意披肩'],
    colorPalette: ['#F5F0EB', '#D4C4A8', '#8B8B83', '#2F4F4F'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Maison Margiela', priceRange: '¥5,000-25,000', reason: '艺术美学的极致表达' },
    { tier: 'mid', brandName: 'COS', priceRange: '¥300-2,000', reason: '艺术感穿搭的优质选择' },
    { tier: 'budget', brandName: 'UNIQLO', priceRange: '¥99-500', reason: '基础款艺术感穿搭的入门' },
  ],
},
  {
    id: 'sweet_cool',
    name: '甜酷风',
    dimension: '场景圈层', category: '街头潮流',
    description: '纱裙配马丁靴、蕾丝内搭叠皮夹克——女性化×中性硬朗混搭',
    philosophy: '甜和酷从来不是对立面。',
  summary: '纱裙配马丁靴、蕾丝内搭叠皮夹克——女性化与中性硬朗的混搭。甜和酷从来不是对立面。',
  keyItemDescriptions: [
    '纱裙或蕾丝，A字或直筒',
    '厚底马丁靴，黑色',
    '黑色皮夹克，短款',
    '蕾丝或花边，白色或黑色',
    '金色链条，小巧精致'
  ],
    difficulty: 3,
    silhouette: ['纱裙+硬朗上装', '短款+长下装', '合身+宽松'],
    keyItems: ['纱裙', '马丁靴', '皮夹克', '蕾丝内搭', '链条包'],
    colorPalette: ['#FFB6C1', '#1A1A1A', '#808080', '#FF69B4'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Supreme', priceRange: '¥1,000-5,000', reason: '街头文化的标志品牌' },
    { tier: 'mid', brandName: 'Vans', priceRange: '¥300-1,000', reason: '街头风格的经典选择' },
    { tier: 'budget', brandName: 'Converse', priceRange: '¥200-800', reason: '街头风格的入门必备' },
  ],
},
  {
    id: 'kpop_stage',
    name: '女团打歌风',
    dimension: '场景圈层', category: '音乐舞台',
    description: '亮片、短上衣、百褶裙、长靴——韩国女团舞台造型日常化',
    philosophy: '每天都是你的打歌舞台。',
  summary: '亮片、短上衣、百褶裙、长靴——韩国女团舞台造型日常化。每天都是你的打歌舞台。',
  keyItemDescriptions: [
    '亮片或珠饰，短款或修身',
    '短款T恤，露腰设计',
    '百褶短裙，纯色或格纹',
    '过膝长靴，紧身设计',
    '华丽耳环或项链'
  ],
    difficulty: 4,
    silhouette: ['短上衣+高腰', 'A字短裙', '紧身'],
    keyItems: ['亮片上衣', '短款T恤', '百褶裙', '过膝长靴', '华丽配饰'],
    colorPalette: ['#FF69B4', '#C0C0C0', '#FFD700', '#1A1A1A'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Gucci', priceRange: '¥5,000-30,000', reason: '舞台感的奢华表达' },
    { tier: 'mid', brandName: 'ZARA', priceRange: '¥100-600', reason: '亮片和装饰元素的快时尚选择' },
    { tier: 'budget', brandName: '古着店', priceRange: '¥50-300', reason: '舞台风格单品的宝藏来源' },
  ],
},
  {
    id: 'athleisure',
    name: '轻运动风',
    dimension: '场景圈层', category: '运动休闲',
    description: '瑜伽裤搭配宽松卫衣和棒球帽——运动时尚轻度结合，日常出街自在',
    philosophy: '运动装不只是健身房的专属。',
  summary: '瑜伽裤搭配宽松卫衣和棒球帽——运动时尚轻度结合。运动装不只是健身房的专属。',
  keyItemDescriptions: [
    '高腰瑜伽裤，纯色或拼色',
    '宽松卫衣，纯色或logo',
    '可调节后扣，运动感',
    '白色或彩色运动鞋',
    '腰包或斜挎包，轻便'
  ],
    difficulty: 1,
    silhouette: ['上宽下窄', '紧身+宽松', '直筒'],
    keyItems: ['瑜伽裤', '宽松卫衣', '棒球帽', '运动鞋', '腰包'],
    colorPalette: ['#2C2C2C', '#808080', '#FFFFFF', '#FF4500'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Lululemon', priceRange: '¥500-2,000', reason: '运动休闲的品质代表' },
    { tier: 'mid', brandName: 'Nike', priceRange: '¥300-1,500', reason: '运动风格的经典品牌' },
    { tier: 'budget', brandName: 'Decathlon', priceRange: '¥50-500', reason: '运动装备的入门选择' },
  ],
},
  {
    id: 'vintage_lover',
    name: 'Vintage古着风',
    dimension: '场景圈层', category: '复古视觉',
    description: '70年代印花衬衫+90年代直筒牛仔裤——独一无二的故事感',
    philosophy: '每件衣服都有自己的故事，你只是它的下一章。',
  summary: '70年代印花衬衫配90年代直筒牛仔裤——独一无二的故事感。每件衣服都有自己的故事。',
  keyItemDescriptions: [
    '古着印花，真丝或棉质',
    '复古直筒，水洗做旧',
    '做旧皮革，短款或中长款',
    '复古猫眼或飞行员款',
    '二手或复古，独特质感'
  ],
    difficulty: 3,
    silhouette: ['直筒', 'A字', 'Oversize'],
    keyItems: ['古着印花衬衫', '复古直筒牛仔裤', '做旧皮夹克', '老式墨镜', '二手包'],
    colorPalette: ['#D4C4A8', '#8B4513', '#2F6B3A', '#C41E3A'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Ralph Lauren', priceRange: '¥1,000-5,000', reason: '复古美学的经典代表' },
    { tier: 'mid', brandName: 'Levi\'s', priceRange: '¥300-1,500', reason: '复古牛仔的标志品牌' },
    { tier: 'budget', brandName: '古着店', priceRange: '¥50-300', reason: '真正的复古单品，独一无二' },
  ],
},
  {
    id: 'party_queen',
    name: '派对主角风',
    dimension: '场景圈层', category: '派对社交',
    description: '亮片裙、羽毛装饰、缎面吊带、金属感高跟鞋——大胆闪耀',
    philosophy: '人生得意须尽欢，今晚你就是全场焦点。',
  summary: '亮片裙、羽毛装饰、缎面吊带——大胆闪耀。人生得意须尽欢，今晚你就是全场焦点。',
  keyItemDescriptions: [
    '亮片装饰，修身或A字',
    '羽毛装饰，短款或上衣',
    '缎面材质，细吊带',
    '金属感或亮片，细跟',
    '闪光或亮片，小巧尺寸'
  ],
    difficulty: 3,
    silhouette: ['收腰A字', '紧身', '露背'],
    keyItems: ['亮片连衣裙', '羽毛装饰上衣', '缎面吊带', '金属感高跟鞋', '闪光手包'],
    colorPalette: ['#FFD700', '#C0C0C0', '#FF1493', '#1A1A1A'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Versace', priceRange: '¥5,000-30,000', reason: '派对穿搭的极致之选' },
    { tier: 'mid', brandName: 'ZARA', priceRange: '¥100-600', reason: '派对单品的快时尚选择' },
    { tier: 'budget', brandName: 'H&M', priceRange: '¥50-500', reason: '派对穿搭的性价比之选' },
  ],
},

  // ==================== 四、人物原型（20种）====================
  {
    id: 'siren',
    name: '海妖风',
    dimension: '人物原型', category: '影视角色',
    description: '修身连衣裙、湿发造型——海藻绿、珍珠白、灰蓝，神秘魅惑',
    philosophy: '深海藏着所有秘密，你的衣服也是。',
  summary: '修身连衣裙、湿发造型——海藻绿、珍珠白、灰蓝，神秘魅惑。深海藏着所有秘密。',
  keyItemDescriptions: [
    '修身设计，垂坠面料',
    '光泽感造型，湿发效果',
    '珍珠耳环或项链',
    '海藻绿或珍珠白配饰',
    '露背或深V设计'
  ],
    difficulty: 4,
    silhouette: ['紧身', '垂坠', '不对称'],
    keyItems: ['修身连衣裙', '湿发/光泽造型', '珍珠饰品', '海藻绿配饰', '露背设计'],
    colorPalette: ['#2E8B57', '#F5F5FF', '#87CEEB', '#E0E8F0'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Valentino', priceRange: '¥5,000-25,000', reason: '影视角色美学的奢华表达' },
    { tier: 'mid', brandName: 'Mango', priceRange: '¥200-1,000', reason: '角色风格元素的优质选择' },
    { tier: 'budget', brandName: 'ZARA', priceRange: '¥100-600', reason: '入门级角色风格单品的快时尚选择' },
  ],
},
  {
    id: 'white_moonlight',
    name: '白月光风',
    dimension: '人物原型', category: '影视角色',
    description: '白色连衣裙、黑长直发、淡妆——干净温柔又有一丝清冷',
    philosophy: '不争不抢，但没人能忽视你的存在。',
  summary: '白色连衣裙、黑长直发、淡妆——干净温柔又有一丝清冷。不争不抢，但没人能忽视你的存在。',
  keyItemDescriptions: [
    '纯白连衣裙，A字或直筒',
    '素色开衫，针织或棉质',
    '简约平底鞋，芭蕾或乐福',
    '银色细链，锁骨链',
    '清透底妆，自然唇色'
  ],
    difficulty: 1,
    silhouette: ['A字连衣', '直筒', '微收腰'],
    keyItems: ['白色连衣裙', '素色开衫', '简约平底鞋', '银色细链', '淡妆'],
    colorPalette: ['#FFFFFF', '#F5F5FF', '#E6E6FA', '#FFF0F5'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Valentino', priceRange: '¥5,000-25,000', reason: '影视角色美学的奢华表达' },
    { tier: 'mid', brandName: 'Mango', priceRange: '¥200-1,000', reason: '角色风格元素的优质选择' },
    { tier: 'budget', brandName: 'ZARA', priceRange: '¥100-600', reason: '入门级角色风格单品的快时尚选择' },
  ],
},
  {
    id: 'villainess',
    name: '恶女风',
    dimension: '人物原型', category: '影视角色',
    description: '豹纹、皮革、垫肩、尖头高跟鞋——韩剧里气场强大的反派',
    philosophy: '不是反派，是主角的另一面。',
  summary: '豹纹、皮革、垫肩、尖头高跟鞋——气场强大的反派美学。不是反派，是主角的另一面。',
  keyItemDescriptions: [
    '豹纹图案，短款或中长款',
    '皮革材质，紧身或A字',
    '垫肩设计，精裁合身',
    '尖头细跟，黑色或红色',
    '大号墨镜，犀利感'
  ],
    difficulty: 4,
    silhouette: ['宽肩X型', '紧身', '包臀'],
    keyItems: ['豹纹外套', '皮裙', '垫肩西装', '尖头高跟鞋', '犀利墨镜'],
    colorPalette: ['#1A1A1A', '#8B0000', '#C4A35A', '#FF4500'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Valentino', priceRange: '¥5,000-25,000', reason: '影视角色美学的奢华表达' },
    { tier: 'mid', brandName: 'Mango', priceRange: '¥200-1,000', reason: '角色风格元素的优质选择' },
    { tier: 'budget', brandName: 'ZARA', priceRange: '¥100-600', reason: '入门级角色风格单品的快时尚选择' },
  ],
},
  {
    id: 'chaebol_daughter',
    name: '财阀千金风',
    dimension: '人物原型', category: '影视角色',
    description: '粗花呢套装、设计感衬衫、精致手袋——韩国上流社会年轻女孩',
    philosophy: '贵气是气质，不是价格牌。',
  summary: '粗花呢套装、设计感衬衫、精致手袋——韩国上流社会年轻女孩。贵气是气质，不是价格牌。',
  keyItemDescriptions: [
    '粗花呢面料，金色纽扣',
    '设计感衬衫，蝴蝶结或飘带',
    '金色或银色链条，小巧',
    '珍珠耳环，单颗或吊坠',
    '尖头细跟，裸色或白色'
  ],
    difficulty: 3,
    silhouette: ['合身X型', 'A字裙', '收腰'],
    keyItems: ['粗花呢套装', '设计感衬衫', '精致链条包', '珍珠耳环', '尖头高跟鞋'],
    colorPalette: ['#FFB6C1', '#FFFFFF', '#F5F0EB', '#DAA520'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Valentino', priceRange: '¥5,000-25,000', reason: '影视角色美学的奢华表达' },
    { tier: 'mid', brandName: 'Mango', priceRange: '¥200-1,000', reason: '角色风格元素的优质选择' },
    { tier: 'budget', brandName: 'ZARA', priceRange: '¥100-600', reason: '入门级角色风格单品的快时尚选择' },
  ],
},
  {
    id: 'flight_attendant',
    name: '空姐风',
    dimension: '人物原型', category: '职场精英',
    description: '合身铅笔裙、丝巾、优雅盘发、尖头高跟鞋——职业优雅极致',
    philosophy: '优雅是职业素养，也是生活方式。',
  summary: '合身铅笔裙、丝巾、优雅盘发——职业优雅的极致。优雅是职业素养，也是生活方式。',
  keyItemDescriptions: [
    '合身西装，精裁版型',
    '铅笔裙，及膝或过膝',
    '丝巾或领巾，系法讲究',
    '优雅盘发，一丝不苟',
    '尖头细跟，中跟或高跟'
  ],
    difficulty: 3,
    silhouette: ['合身H型', '铅笔裙', '收腰'],
    keyItems: ['合身西装', '铅笔裙', '丝巾/领巾', '盘发', '尖头高跟鞋'],
    colorPalette: ['#1C2841', '#C41E3A', '#FFFFFF', '#DAA520'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Hugo Boss', priceRange: '¥2,000-10,000', reason: '职场精英的西装首选' },
    { tier: 'mid', brandName: 'Massimo Dutti', priceRange: '¥500-2,000', reason: '职场穿搭的优质选择' },
    { tier: 'budget', brandName: 'UNIQLO', priceRange: '¥99-500', reason: '基础款职场穿搭的入门' },
  ],
},
  {
    id: 'matrix_agent',
    name: '特工风',
    dimension: '人物原型', category: '影视角色',
    description: '全黑紧身衣、长大衣、墨镜、战斗靴——《黑客帝国》式简约利落',
    philosophy: '少说话，多做事，穿黑的就够了。',
  summary: '全黑紧身衣、长大衣、墨镜——黑客帝国式简约利落。少说话，多做事，穿黑的就够了。',
  keyItemDescriptions: [
    '全黑紧身，高领或圆领',
    '长款黑大衣，直筒H型',
    '黑色墨镜，经典款',
    '黑色战斗靴，厚底',
    '黑色皮带，简约金属扣'
  ],
    difficulty: 3,
    silhouette: ['全黑紧身', 'H型长大衣', '合身'],
    keyItems: ['全黑紧身衣', '长款黑大衣', '墨镜', '战斗靴', '皮带'],
    colorPalette: ['#0A0A0A', '#1A1A1A', '#2C2C2C', '#000000'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Valentino', priceRange: '¥5,000-25,000', reason: '影视角色美学的奢华表达' },
    { tier: 'mid', brandName: 'Mango', priceRange: '¥200-1,000', reason: '角色风格元素的优质选择' },
    { tier: 'budget', brandName: 'ZARA', priceRange: '¥100-600', reason: '入门级角色风格单品的快时尚选择' },
  ],
},
  {
    id: 'hippie',
    name: '嬉皮士风',
    dimension: '人物原型', category: '历史复古',
    description: '扎染、喇叭裤、头巾、圆框墨镜——60-70年代的和平与爱',
    philosophy: 'Make love, not war. 穿你相信的。',
  summary: '扎染、喇叭裤、头巾、圆框墨镜——60-70年代的和平与爱。Make love, not war.',
  keyItemDescriptions: [
    '扎染印花，宽松版型',
    '喇叭裤设计，低腰或高腰',
    '头巾或发带，彩色图案',
    '圆形或复古款',
    '流苏装饰，麂皮或编织'
  ],
    difficulty: 3,
    silhouette: ['喇叭裤+A字', '宽松', '层叠'],
    keyItems: ['扎染T恤', '喇叭裤', '头巾/发带', '圆框墨镜', '流苏背心'],
    colorPalette: ['#FF8C00', '#FFD700', '#8B4513', '#2E8B57'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Gucci', priceRange: '¥5,000-30,000', reason: '历史复古美学的奢华表达' },
    { tier: 'mid', brandName: 'Free People', priceRange: '¥500-3,000', reason: '复古风格的优质选择' },
    { tier: 'budget', brandName: '古着店', priceRange: '¥50-300', reason: '真正的复古单品，独一无二' },
  ],
},
  {
    id: 'gothic',
    name: '哥特风',
    dimension: '人物原型', category: '亚文化',
    description: '黑天鹅绒、蕾丝、束腰、十字架配饰——暗黑维多利亚美学',
    philosophy: '黑暗也是一种浪漫。',
  summary: '黑天鹅绒、蕾丝、束腰、十字架配饰——暗黑维多利亚美学。黑暗也是一种浪漫。',
  keyItemDescriptions: [
    '黑天鹅绒或缎面，长款',
    '蕾丝花边，长袖或短袖',
    '束腰或腰封，强调腰线',
    '银色或黑色十字架',
    '黑色蕾丝，长款或短款'
  ],
    difficulty: 4,
    silhouette: ['束腰X型', 'A字长裙', '层叠'],
    keyItems: ['黑天鹅绒裙', '蕾丝上衣', '束腰/腰封', '十字架项链', '黑色蕾丝手套'],
    colorPalette: ['#0A0A0A', '#8B0000', '#4A0E4E', '#2C2C2C'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Comme des Garçons', priceRange: '¥3,000-15,000', reason: '亚文化美学的先锋' },
    { tier: 'mid', brandName: 'Dr. Martens', priceRange: '¥500-2,000', reason: '亚文化鞋履的标志品牌' },
    { tier: 'budget', brandName: '古着店', priceRange: '¥50-300', reason: '亚文化单品的宝藏来源' },
  ],
},
  {
    id: 'lolita',
    name: '洛丽塔风',
    dimension: '人物原型', category: '亚文化',
    description: '源自日本街头的精致洋装——娃娃裙、蕾丝、蓬蓬裙、圆头皮鞋',
    philosophy: '精致是一种信仰。',
  summary: '源自日本街头的精致洋装——娃娃裙、蕾丝、蓬蓬裙。精致是一种信仰。',
  keyItemDescriptions: [
    '娃娃裙版型，蕾丝多层',
    '蕾丝花边，泡泡袖',
    '蓬蓬裙，多层纱或缎面',
    '白色及膝袜，蕾丝边',
    '圆头搭扣，玛丽珍风格'
  ],
    difficulty: 4,
    silhouette: ['蓬蓬A字', '娃娃裙', '束腰'],
    keyItems: ['娃娃裙', '蕾丝衬衫', '蓬蓬裙', '及膝袜', '圆头皮鞋'],
    colorPalette: ['#FFB6C1', '#FFFFFF', '#FFE4E1', '#DDA0DD'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Comme des Garçons', priceRange: '¥3,000-15,000', reason: '亚文化美学的先锋' },
    { tier: 'mid', brandName: 'Dr. Martens', priceRange: '¥500-2,000', reason: '亚文化鞋履的标志品牌' },
    { tier: 'budget', brandName: '古着店', priceRange: '¥50-300', reason: '亚文化单品的宝藏来源' },
  ],
},
  {
    id: 'prairie_girl',
    name: '草原少女风',
    dimension: '人物原型', category: '历史复古',
    description: '棉布长裙、泡泡袖、围裙式上衣——像简·爱走在英国乡村',
    philosophy: '朴素不是无趣，是另一种浪漫。',
  summary: '棉布长裙、泡泡袖、围裙式上衣——像简·爱走在英国乡村。朴素不是无趣，是另一种浪漫。',
  keyItemDescriptions: [
    '棉布材质，碎花或纯色',
    '泡泡袖设计，收口',
    '围裙式连衣裙，收腰',
    '系带靴或马丁靴',
    '宽檐草编帽，田园感'
  ],
    difficulty: 2,
    silhouette: ['泡泡袖+A字', '长裙', '收腰'],
    keyItems: ['棉布长裙', '泡泡袖上衣', '围裙式连衣裙', '系带靴', '草帽'],
    colorPalette: ['#F5F5DC', '#D4C4A8', '#F5F0EB', '#8B7355'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Gucci', priceRange: '¥5,000-30,000', reason: '历史复古美学的奢华表达' },
    { tier: 'mid', brandName: 'Free People', priceRange: '¥500-3,000', reason: '复古风格的优质选择' },
    { tier: 'budget', brandName: '古着店', priceRange: '¥50-300', reason: '真正的复古单品，独一无二' },
  ],
},
  {
    id: 'gatsby',
    name: '盖茨比风',
    dimension: '人物原型', category: '历史复古',
    description: '流苏低腰裙、羽毛头饰、Art Deco几何图案——20年代爵士奢华',
    philosophy: '活在你最华丽的年代。',
  summary: '流苏低腰裙、羽毛头饰、Art Deco几何图案——20年代爵士奢华。活在你最华丽的年代。',
  keyItemDescriptions: [
    '流苏装饰，低腰设计',
    '羽毛头饰或发带',
    'Art Deco几何吊坠',
    'T型带设计，中跟',
    '长款珍珠项链，多层'
  ],
    difficulty: 5,
    silhouette: ['低腰直筒', '流苏', 'A字短裙'],
    keyItems: ['流苏连衣裙', '羽毛头饰', 'Art Deco珠宝', 'T型鞋', '长珍珠项链'],
    colorPalette: ['#FFD700', '#C0C0C0', '#1A1A1A', '#FF1493'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Gucci', priceRange: '¥5,000-30,000', reason: '历史复古美学的奢华表达' },
    { tier: 'mid', brandName: 'Free People', priceRange: '¥500-3,000', reason: '复古风格的优质选择' },
    { tier: 'budget', brandName: '古着店', priceRange: '¥50-300', reason: '真正的复古单品，独一无二' },
  ],
},
  {
    id: 'rock_star',
    name: '摇滚巨星风',
    dimension: '人物原型', category: '音乐舞台',
    description: '紧身皮裤、乐队T恤、做旧牛仔夹克、切尔西靴——烟熏妆',
    philosophy: '摇滚不是一种风格，是一种活法。',
  summary: '紧身皮裤、乐队T恤、做旧牛仔夹克、切尔西靴——摇滚不是一种风格，是一种活法。',
  keyItemDescriptions: [
    '紧身皮革，黑色',
    '乐队logo或复古图案',
    '做旧水洗，短款',
    '切尔西靴，皮革',
    '烟熏眼妆，深色唇'
  ],
    difficulty: 3,
    silhouette: ['紧身', '直筒', 'Oversize上装'],
    keyItems: ['紧身皮裤', '乐队T恤', '做旧牛仔夹克', '切尔西靴', '烟熏妆'],
    colorPalette: ['#1A1A1A', '#808080', '#8B0000', '#C0C0C0'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Gucci', priceRange: '¥5,000-30,000', reason: '舞台感的奢华表达' },
    { tier: 'mid', brandName: 'ZARA', priceRange: '¥100-600', reason: '亮片和装饰元素的快时尚选择' },
    { tier: 'budget', brandName: '古着店', priceRange: '¥50-300', reason: '舞台风格单品的宝藏来源' },
  ],
},
  {
    id: 'dior_new_look',
    name: '摩登复古女郎',
    dimension: '人物原型', category: '历史复古',
    description: '收腰大裙摆、猫跟鞋、丝巾与手套——50年代Dior New Look',
    philosophy: '优雅是一个女人的永恒事业。',
  summary: '收腰大裙摆、猫跟鞋、丝巾与手套——50年代Dior New Look。优雅是一个女人的永恒事业。',
  keyItemDescriptions: [
    '收腰设计，大裙摆',
    '大裙摆半裙，及膝或过膝',
    '尖头猫跟鞋，细跟',
    '真丝丝巾，系脖或系包',
    '短款手套，白色或黑色'
  ],
    difficulty: 4,
    silhouette: ['X型收腰', '大裙摆', '沙漏型'],
    keyItems: ['收腰连衣裙', '大裙摆半裙', '猫跟鞋', '丝巾', '手套'],
    colorPalette: ['#C41E3A', '#1C2841', '#FFFFFF', '#FFB6C1'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Gucci', priceRange: '¥5,000-30,000', reason: '历史复古美学的奢华表达' },
    { tier: 'mid', brandName: 'Free People', priceRange: '¥500-3,000', reason: '复古风格的优质选择' },
    { tier: 'budget', brandName: '古着店', priceRange: '¥50-300', reason: '真正的复古单品，独一无二' },
  ],
},
  {
    id: 'genderless',
    name: '无性别主义',
    dimension: '人物原型', category: '性别表达',
    description: '打破男女装界限——穿男装区衬衫、工装裤，宽松硬朗',
    philosophy: '衣服没有性别，只有你想成为的样子。',
  summary: '打破男女装界限——穿男装区衬衫、工装裤，宽松硬朗。衣服没有性别，只有你想成为的样子。',
  keyItemDescriptions: [
    '男装区版型，纯色或条纹',
    '工装风格，多口袋',
    '宽松版型，无性别感',
    '平底皮鞋或运动鞋',
    '极简线条，无性别感'
  ],
    difficulty: 3,
    silhouette: ['宽松H型', '直筒', '落肩'],
    keyItems: ['男装区衬衫', '工装裤', '宽松西装', '平底鞋', '简约配饰'],
    colorPalette: ['#1A1A1A', '#FFFFFF', '#808080', '#F5F5F0'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Rick Owens', priceRange: '¥5,000-25,000', reason: '无性别主义的先锋' },
    { tier: 'mid', brandName: 'COS', priceRange: '¥300-2,000', reason: '无性别穿搭的优质选择' },
    { tier: 'budget', brandName: 'UNIQLO', priceRange: '¥99-500', reason: '基础款无性别穿搭的入门' },
  ],
},
  {
    id: 'dandy_femme',
    name: '中性绅士风',
    dimension: '人物原型', category: '性别表达',
    description: '西装马甲、领带、牛津鞋——帅气又精致的女孩',
    philosophy: '谁说绅士只能是男人？',
  summary: '西装马甲、领带、牛津鞋——帅气又精致的女孩。谁说绅士只能是男人？',
  keyItemDescriptions: [
    '精裁马甲，收腰设计',
    '细窄领带或领结',
    '牛津鞋，皮革',
    '纯白硬挺，领尖扣',
    '怀表或胸针，复古感'
  ],
    difficulty: 3,
    silhouette: ['合身H型', '马甲收腰', '直筒'],
    keyItems: ['西装马甲', '领带/领结', '牛津鞋', '白衬衫', '怀表/胸针'],
    colorPalette: ['#1C1C1C', '#FFFFFF', '#808080', '#8B7355'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Rick Owens', priceRange: '¥5,000-25,000', reason: '无性别主义的先锋' },
    { tier: 'mid', brandName: 'COS', priceRange: '¥300-2,000', reason: '无性别穿搭的优质选择' },
    { tier: 'budget', brandName: 'UNIQLO', priceRange: '¥99-500', reason: '基础款无性别穿搭的入门' },
  ],
},
  {
    id: 'tomboy',
    name: '假小子风',
    dimension: '人物原型', category: '性别表达',
    description: '短发、宽松T恤、滑板裤、棒球帽——强调少年感',
    philosophy: '少年感不是年龄，是态度。',
  summary: '短发、宽松T恤、滑板裤、棒球帽——强调少年感。少年感不是年龄，是态度。',
  keyItemDescriptions: [
    '宽松印花，oversized',
    '滑板裤或工装裤，宽松',
    '可调节后扣，运动感',
    '白色或彩色运动鞋',
    '双肩包，休闲运动'
  ],
    difficulty: 1,
    silhouette: ['宽松Oversize', '垮裤', '直筒'],
    keyItems: ['宽松印花T恤', '滑板裤', '棒球帽', '运动鞋', '双肩包'],
    colorPalette: ['#4A6FA5', '#FFFFFF', '#808080', '#FF4500'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Rick Owens', priceRange: '¥5,000-25,000', reason: '无性别主义的先锋' },
    { tier: 'mid', brandName: 'COS', priceRange: '¥300-2,000', reason: '无性别穿搭的优质选择' },
    { tier: 'budget', brandName: 'UNIQLO', priceRange: '¥99-500', reason: '基础款无性别穿搭的入门' },
  ],
},
  {
    id: 'mori_girl',
    name: '森系女孩',
    dimension: '人物原型', category: '梦幻幻想',
    description: '像从森林走出的女孩——棉麻、宽松叠穿、植物染料色调',
    philosophy: '把森林穿在身上，把自然装进心里。',
  summary: '像从森林走出的女孩——棉麻、宽松叠穿、植物染料色调。把森林穿在身上，把自然装进心里。',
  keyItemDescriptions: [
    '棉麻连衣裙，宽松A字',
    '宽松开衫，针织或棉麻',
    '叠穿衬衫，露出领口或下摆',
    '平底帆布或皮质',
    '藤编包或木质配饰'
  ],
    difficulty: 2,
    silhouette: ['宽松层叠', 'A字长裙', '落肩'],
    keyItems: ['棉麻连衣裙', '宽松开衫', '叠穿衬衫', '平底鞋', '藤编配饰'],
    colorPalette: ['#8B7355', '#D4C4A8', '#2F6B3A', '#F5F0EB'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Marchesa', priceRange: '¥10,000-50,000', reason: '梦幻美学的极致表达' },
    { tier: 'mid', brandName: 'Free People', priceRange: '¥500-3,000', reason: '梦幻风格的优质选择' },
    { tier: 'budget', brandName: 'ZARA', priceRange: '¥100-600', reason: '梦幻元素的快时尚入门' },
  ],
},
  {
    id: 'film_retro',
    name: '文艺胶片风',
    dimension: '人物原型', category: '历史复古',
    description: '像能直接入镜老胶片——色调怀旧、复古棕墨绿、古着感',
    philosophy: '把每一天活成一张胶片。',
  summary: '像能直接入镜老胶片——色调怀旧、复古棕墨绿、古着感。把每一天活成一张胶片。',
  keyItemDescriptions: [
    '古着印花或纯色，真丝或棉',
    '复古直筒或微喇',
    '做旧皮革，短款',
    '复古造型，装饰性',
    '黑框或金属框，复古款'
  ],
    difficulty: 3,
    silhouette: ['直筒', '微A', '宽松'],
    keyItems: ['古着衬衫', '复古直筒裤', '二手皮衣', '胶片相机配饰', '复古眼镜'],
    colorPalette: ['#8B4513', '#2F6B3A', '#C4A35A', '#3D3D3D'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Gucci', priceRange: '¥5,000-30,000', reason: '历史复古美学的奢华表达' },
    { tier: 'mid', brandName: 'Free People', priceRange: '¥500-3,000', reason: '复古风格的优质选择' },
    { tier: 'budget', brandName: '古着店', priceRange: '¥50-300', reason: '真正的复古单品，独一无二' },
  ],
},
  {
    id: 'fairy_elf',
    name: '精灵风',
    dimension: '人物原型', category: '梦幻幻想',
    description: '轻柔材质、不对称设计——月灰、晨雾紫等低饱和梦幻色调',
    philosophy: '不食人间烟火不是因为不在乎，是因为有自己的世界。',
  summary: '轻柔材质、不对称设计——月灰、晨雾紫等低饱和梦幻色调。不食人间烟火，因为有自己世界。',
  keyItemDescriptions: [
    '轻柔薄纱，层叠或飘逸',
    '不对称设计，垂坠感',
    '月灰色系，银或白金',
    '绑带设计，细跟或平底',
    '花卉或藤蔓，自然感'
  ],
    difficulty: 4,
    silhouette: ['不对称垂坠', '飘逸', '层叠透'],
    keyItems: ['轻柔薄纱裙', '不对称上衣', '月灰配饰', '绑带凉鞋', '花卉头饰'],
    colorPalette: ['#D8D8E8', '#E8D5E0', '#C5B9CD', '#F5F0FF'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Marchesa', priceRange: '¥10,000-50,000', reason: '梦幻美学的极致表达' },
    { tier: 'mid', brandName: 'Free People', priceRange: '¥500-3,000', reason: '梦幻风格的优质选择' },
    { tier: 'budget', brandName: 'ZARA', priceRange: '¥100-600', reason: '梦幻元素的快时尚入门' },
  ],
},
  {
    id: 'wasteland_survivor',
    name: '废土幸存者',
    dimension: '人物原型', category: '梦幻幻想',
    description: '将棉布、网纱、做旧皮革做破坏重组——用废墟材料做的衣服',
    philosophy: '在废墟里重生的不只是衣服，是你。',
  summary: '将棉布、网纱、做旧皮革做破坏重组——在废墟里重生的不只是衣服，是你。',
  keyItemDescriptions: [
    '做旧拼接，多层材质',
    '破坏感长裙，层叠设计',
    '网纱叠穿，做旧处理',
    '绳结或编织，手工感',
    '做旧战靴，厚底耐磨'
  ],
    difficulty: 5,
    silhouette: ['不规则拼接', '层叠破坏', '解构'],
    keyItems: ['做旧拼接外套', '破坏感长裙', '网纱叠穿', '绳结配饰', '做旧战靴'],
    colorPalette: ['#8B7355', '#3D3D3D', '#1A1A1A', '#D4C4A8'],
  
  brandRecommendations: [
    { tier: 'premium', brandName: 'Marchesa', priceRange: '¥10,000-50,000', reason: '梦幻美学的极致表达' },
    { tier: 'mid', brandName: 'Free People', priceRange: '¥500-3,000', reason: '梦幻风格的优质选择' },
    { tier: 'budget', brandName: 'ZARA', priceRange: '¥100-600', reason: '梦幻元素的快时尚入门' },
  ],
},
];
