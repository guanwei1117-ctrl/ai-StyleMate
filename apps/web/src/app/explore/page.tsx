import Link from 'next/link';

const STYLES = [
  {
    name: '日系清新',
    description: '柔和色调、宽松剪裁、自然材质，营造温柔治愈感',
    colors: ['#F5E6E0', '#D4E5D9', '#E8D5E0'],
    keywords: ['棉麻', 'oversize', '叠穿', '莫兰迪色'],
  },
  {
    name: '法式优雅',
    description: '简约不简单，讲究质感和细节，散发随性优雅气质',
    colors: ['#2C2C2C', '#FFFFFF', '#C41E3A'],
    keywords: ['条纹衫', '裹身裙', '丝巾', '贝雷帽'],
  },
  {
    name: '韩系简约',
    description: '干净利落的线条，中性色调，注重层次感和质感',
    colors: ['#8B8B83', '#F5F5F0', '#D4C5B9'],
    keywords: ['阔腿裤', '西装', '针织衫', '纯色'],
  },
  {
    name: '美式复古',
    description: '90年代复古风潮，牛仔、格纹、宽松廓形',
    colors: ['#4A6FA5', '#C4976A', '#E8E0D5'],
    keywords: ['牛仔', '格子衫', '卫衣', '马丁靴'],
  },
  {
    name: '极简主义',
    description: '少即是多，用最少的单品打造最有质感的造型',
    colors: ['#000000', '#FFFFFF', '#BEIGE'],
    keywords: ['基础款', '纯色', '廓形', '质感'],
  },
  {
    name: 'Y2K 千禧风',
    description: '回归千禧年代的科技感和未来主义美学',
    colors: ['#FF6B9D', '#00D4FF', '#C0C0C0'],
    keywords: ['短上衣', '工装裤', '金属色', '厚底鞋'],
  },
];

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">探索风格</h1>
          <p className="mt-4 text-lg text-gray-600">
            了解不同穿搭风格，找到最能表达你的那一种
          </p>
        </div>

        {/* Style grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {STYLES.map((style) => (
            <div
              key={style.name}
              className="group rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-transparent transition-all cursor-pointer"
            >
              {/* Color palette */}
              <div className="flex gap-2 mb-4">
                {style.colors.map((color) => (
                  <div
                    key={color}
                    className="w-8 h-8 rounded-full border border-gray-200"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <h3 className="text-xl font-bold text-gray-900">{style.name}</h3>
              <p className="mt-2 text-sm text-gray-600">{style.description}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {style.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="px-3 py-1 rounded-full bg-gray-50 text-xs text-gray-600"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Back to home */}
        <div className="mt-16 text-center">
          <Link
            href="/"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
