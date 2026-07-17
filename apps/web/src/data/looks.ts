export interface Look {
  id: number;
  image: string;
  style: string;
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
    title: '不被定义的色彩',
    pieces: 6,
    by: '林小希',
    description: '撞色堆叠与夸张配饰，把快乐穿在身上，拒绝被风格框定。',
    likes: 1411,
    monthlyLikes: 398,
  },
];
