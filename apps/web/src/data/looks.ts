export interface Look {
  id: number;
  image: string;
  style: string;
  /** 风格 ID，关联 styles.ts 中的 style.id */
  styleId: string;
  title: string;
  pieces: number;
  by: string;
  /** 简介，卡片内两行截断展示 */
  description: string;
  /** 累计喜欢量（总榜单）；后续可由用户点赞系统聚合替换 */
  likes: number;
  /** 本月喜欢量（美月榜）；mock 数据，须满足 monthlyLikes <= likes */
  monthlyLikes: number;
}

export const LOOKS: Look[] = [
  {
    id: 1,
    image: '/styles/minimalist/Extreme_minimalist_fashion__a__2026-06-30T06-51-32.png',
    style: '极简主义',
    styleId: 'minimalist',
    title: '极简层次穿搭',
    pieces: 4,
    by: '张微',
    description: '以黑白灰为主调，用叠穿制造层次感，少即是多的通勤范本。',
    likes: 1284,
    monthlyLikes: 326,
  },
  {
    id: 2,
    image: '/styles/fr_effortless/A_fashion_lookbook_photo_of_an_2026-06-30T06-47-50.png',
    style: '法式优雅',
    styleId: 'fr_effortless',
    title: '毫不费力的时髦',
    pieces: 3,
    by: '李娜',
    description: '一件丝质衬衫配直筒牛仔，慵懒里藏着克制的精致。',
    likes: 1567,
    monthlyLikes: 412,
  },
  {
    id: 3,
    image: '/styles/kr_effortless/Korean_minimalist_casual_fashi_2026-06-30T06-49-46.png',
    style: '韩系简约',
    styleId: 'kr_effortless',
    title: '温柔通勤日常',
    pieces: 4,
    by: '金秀雅',
    description: '奶油色针织叠穿，柔和不甜腻，办公室也能穿出的松弛感。',
    likes: 1098,
    monthlyLikes: 287,
  },
  {
    id: 4,
    image: '/styles/jp_zen/Japanese_zen_minimalist_fashio_2026-06-30T06-49-07.png',
    style: '日系清新',
    styleId: 'jp_zen',
    title: '周末柔软时光',
    pieces: 3,
    by: '陈雨',
    description: '棉麻阔腿裤配宽松卫衣，把周末的舒适穿成日常的态度。',
    likes: 945,
    monthlyLikes: 254,
  },
  {
    id: 5,
    image: '/styles/us_street/American_streetwear_hip_hop_fa_2026-06-30T06-48-37.png',
    style: '街头潮流',
    styleId: 'us_street',
    title: '都市街头态度',
    pieces: 5,
    by: '王放',
    description: '工装外套叠加球鞋与配饰，用层次把街头的随性穿出锋芒。',
    likes: 1823,
    monthlyLikes: 538,
  },
  {
    id: 6,
    image: '/styles/us_prep_vintage/American_90s_high_school_vinta_2026-06-30T06-48-32.png',
    style: '美式复古',
    styleId: 'us_prep_vintage',
    title: '九零复古回潮',
    pieces: 4,
    by: '赵磊',
    description: '做旧牛仔与格纹衬衫，复刻上世纪九十年代的随性浪漫。',
    likes: 1332,
    monthlyLikes: 369,
  },
  {
    id: 7,
    image: '/styles/cn_new_chinese/Modern_Chinese_neo_traditional_2026-06-30T06-49-15.png',
    style: '新中式',
    styleId: 'cn_new_chinese',
    title: '东方留白之美',
    pieces: 4,
    by: '刘梅',
    description: '立领盘扣遇见垂坠长裤，在留白里写一笔当代东方韵。',
    likes: 1676,
    monthlyLikes: 471,
  },
  {
    id: 8,
    image: '/styles/y2k/Y2K_millennium_fashion__a_youn_2026-06-30T06-52-14.png',
    style: '原宿风',
    styleId: 'jp_harajuku',
    title: '不被定义的色彩',
    pieces: 6,
    by: '林小希',
    description: '撞色堆叠与夸张配饰，把快乐穿在身上，拒绝被风格框定。',
    likes: 1411,
    monthlyLikes: 398,
  },
  // 法式田园
  {
    id: 9,
    image: '/styles/fr_countryside/A_fashion_lookbook_photo_of_an_2026-06-30T06-47-50.png',
    style: '法式田园',
    styleId: 'fr_countryside',
    title: '南法午后漫步',
    pieces: 4,
    by: '李娜',
    description: '碎花连衣裙配草编包，把南法的阳光穿在身上。',
    likes: 892,
    monthlyLikes: 215,
  },
  // 意式风情
  {
    id: 10,
    image: '/styles/it_passione/A_fashion_lookbook_photo_of_an_2026-06-30T06-47-50.png',
    style: '意式风情',
    styleId: 'it_passione',
    title: '热情地中海',
    pieces: 4,
    by: '张微',
    description: '印花长裙配夸张墨镜，热情奔放的地中海风情。',
    likes: 1123,
    monthlyLikes: 298,
  },
  // 英伦学院
  {
    id: 11,
    image: '/styles/uk_preppy/A_fashion_lookbook_photo_of_an_2026-06-30T06-47-50.png',
    style: '英伦学院',
    styleId: 'uk_preppy',
    title: '校园经典格纹',
    pieces: 5,
    by: '赵磊',
    description: '格纹短裙配菱格针织背心，经典英伦校园感。',
    likes: 1045,
    monthlyLikes: 267,
  },
  // 北欧极简
  {
    id: 12,
    image: '/styles/nordic_minimal/A_fashion_lookbook_photo_of_an_2026-06-30T06-47-50.png',
    style: '北欧极简',
    styleId: 'nordic_minimal',
    title: '冷淡美学日常',
    pieces: 3,
    by: '陈雨',
    description: '黑白灰的极致简约，用剪裁和质感说话。',
    likes: 967,
    monthlyLikes: 234,
  },
  // 波西米亚
  {
    id: 13,
    image: '/styles/bohemian/A_fashion_lookbook_photo_of_an_2026-06-30T06-47-50.png',
    style: '波西米亚',
    styleId: 'bohemian',
    title: '游牧诗人的浪漫',
    pieces: 5,
    by: '林小希',
    description: '印花长袍配流苏马甲，层叠项链诉说着远方的故事。',
    likes: 1234,
    monthlyLikes: 345,
  },
  // 老钱风
  {
    id: 14,
    image: '/styles/old_money/A_fashion_lookbook_photo_of_an_2026-06-30T06-47-50.png',
    style: '老钱风',
    styleId: 'old_money',
    title: '低调的奢华',
    pieces: 4,
    by: '刘梅',
    description: '羊绒衫配珍珠项链，真正的贵气不需要Logo。',
    likes: 1456,
    monthlyLikes: 389,
  },
  // 甜酷风
  {
    id: 15,
    image: '/styles/sweet_cool/A_fashion_lookbook_photo_of_an_2026-06-30T06-47-50.png',
    style: '甜酷风',
    styleId: 'sweet_cool',
    title: '甜与酷的平衡',
    pieces: 4,
    by: '金秀雅',
    description: '纱裙配马丁靴，甜和酷从来不是对立面。',
    likes: 1089,
    monthlyLikes: 312,
  },
];