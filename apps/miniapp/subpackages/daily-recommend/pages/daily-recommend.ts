/// <reference path="../../../app.d.ts" />

Page({
  data: {
    loading: true,
    weather: null as any,
    plans: [] as any[],
    currentPlanIndex: 0,
    selectedOccasion: 'casual',
    occasions: [
      { value: 'casual', label: '日常' },
      { value: 'commute', label: '通勤' },
      { value: 'date', label: '约会' },
      { value: 'office', label: '上班' },
    ],
  },

  onLoad() {
    this.loadRecommendation();
  },

  loadRecommendation() {
    this.setData({ loading: true });

    // 尝试从后端加载
    this.fetchRecommendation()
      .then((data) => {
        this.setData({
          loading: false,
          weather: data.weather,
          plans: data.plans,
        });
      })
      .catch(() => {
        // 后端不可用时使用 mock
        this.setData({
          loading: false,
          weather: { city: '上海', condition: '晴', temperature: 26, apparentTemperature: 24 },
          plans: [
            {
              type: 'safe', title: '稳妥不出错',
              top: { description: '白色棉质T恤' },
              bottom: { description: '直筒牛仔裤' },
              shoes: { description: '帆布鞋' },
              reason: '经典搭配，百搭不出错',
              score: 85,
            },
            {
              type: 'flattering', title: '显瘦显高',
              top: { description: 'V领针织衫' },
              bottom: { description: '高腰阔腿裤' },
              shoes: { description: '乐福鞋' },
              reason: '高腰线设计拉长腿部比例',
              score: 82,
            },
            {
              type: 'vibe', title: '更有氛围感',
              top: { description: '亚麻衬衫' },
              bottom: { description: '卡其色短裤' },
              shoes: { description: '凉鞋' },
              reason: '清爽夏日氛围，轻松出街',
              score: 78,
            },
          ],
        });
      });
  },

  fetchRecommendation(): Promise<any> {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'http://localhost:4000/api/v1/recommendation/today',
        method: 'GET',
        success(res) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            reject(new Error('获取失败'));
          }
        },
        fail: reject,
      });
    });
  },

  selectOccasion(e: WechatMiniprogram.TouchEvent) {
    const occasion = e.currentTarget.dataset.value as string;
    this.setData({ selectedOccasion: occasion });
    this.loadRecommendation();
  },

  switchPlan(e: WechatMiniprogram.TouchEvent) {
    const index = parseInt(e.currentTarget.dataset.index as string);
    this.setData({ currentPlanIndex: index });
  },

  adoptPlan() {
    wx.showToast({ title: '已采纳该方案', icon: 'success' });
  },

  goBack() {
    wx.navigateBack();
  },
});