export default function WardrobePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">我的衣橱</h1>
            <p className="mt-1 text-gray-500">管理你的所有单品</p>
          </div>
          <button disabled className="cursor-not-allowed rounded-full bg-gray-300 px-6 py-2.5 font-medium text-gray-500">
            + 添加衣物（即将上线）
          </button>
        </div>

        {/* Empty state */}
        <div className="text-center py-20">
          <div className="text-6xl mb-4">👔</div>
          <h3 className="text-xl font-semibold text-gray-900">衣橱还是空的</h3>
          <p className="mt-2 text-gray-500 max-w-md mx-auto">
            衣橱管理正在规划中。下一步会优先支持手动录入，再接入拍照识别类型、颜色和风格。
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <button disabled className="cursor-not-allowed rounded-full bg-gray-300 px-6 py-3 font-medium text-gray-500 shadow-lg shadow-gray-200">
              📸 拍照添加（即将上线）
            </button>
            <button disabled className="cursor-not-allowed rounded-full border border-gray-200 bg-white px-6 py-3 font-medium text-gray-400">
              ✏️ 手动录入（即将上线）
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="mt-16">
          <h2 className="text-xl font-bold text-gray-900 mb-6">分类浏览</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="bg-white rounded-xl p-4 text-center hover:shadow-md transition-shadow cursor-pointer border border-gray-50"
              >
                <span className="text-3xl">{cat.emoji}</span>
                <p className="mt-2 text-sm font-medium text-gray-700">{cat.name}</p>
                <p className="text-xs text-gray-400">{cat.count} 件</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const categories = [
  { name: '上装', emoji: '👚', count: 0 },
  { name: '下装', emoji: '👖', count: 0 },
  { name: '外套', emoji: '🧥', count: 0 },
  { name: '连衣裙', emoji: '👗', count: 0 },
  { name: '鞋子', emoji: '👟', count: 0 },
  { name: '配饰', emoji: '👜', count: 0 },
];
