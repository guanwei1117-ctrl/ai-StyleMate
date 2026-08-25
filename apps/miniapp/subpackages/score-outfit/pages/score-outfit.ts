/// <reference path="../../../app.d.ts" />

Page({
  data: {
    state: 'upload' as 'upload' | 'result',
    imagePath: '',
    loading: false,
    result: null as any,
  },

  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempPath = res.tempFiles[0].tempFilePath;
        this.setData({ imagePath: tempPath });
      },
    });
  },

  retake() {
    this.setData({ imagePath: '', state: 'upload', result: null });
  },

  async submitScore() {
    if (!this.data.imagePath) {
      wx.showToast({ title: '请先拍照或选择图片', icon: 'none' });
      return;
    }

    this.setData({ loading: true });

    try {
      // 压缩图片
      const compressedPath = await this.compressImage(this.data.imagePath);

      // 调用后端评分 API
      const result = await this.evaluateOutfit(compressedPath);
      this.setData({ state: 'result', result, loading: false });
    } catch (err: any) {
      // 如果后端不可用，使用 mock 数据
      this.setData({
        state: 'result',
        loading: false,
        result: this.getMockResult(),
      });
    }
  },

  compressImage(tempFilePath: string): Promise<string> {
    return new Promise((resolve) => {
      wx.compressImage({
        src: tempFilePath,
        quality: 80,
        success(res) { resolve(res.tempFilePath); },
        fail() { resolve(tempFilePath); },
      });
    });
  },

  evaluateOutfit(imagePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const app = getApp<IAppOption>();
      wx.uploadFile({
        url: 'http://localhost:4000/api/v1/scoring/evaluate',
        filePath: imagePath,
        name: 'image',
        header: app.globalData.token ? { Authorization: `Bearer ${app.globalData.token}` } : {},
        success(res) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(res.data));
          } else {
            reject(new Error('评分失败'));
          }
        },
        fail(err) { reject(err); },
      });
    });
  },

  getMockResult() {
    return {
      greeting: '穿搭诊断报告',
      overallComment: '整体搭配和谐，色彩协调，适合日常通勤场景。',
      dimensions: [
        { key: 'proportion', label: '比例', score: 75, comment: '上下身比例协调' },
        { key: 'color', label: '色彩', score: 82, comment: '配色舒适有层次' },
        { key: 'occasion', label: '场合', score: 80, comment: '适合当前场景' },
        { key: 'coherence', label: '整体感', score: 78, comment: '搭配风格统一' },
        { key: 'trend', label: '潮流度', score: 70, comment: '有一定时尚感' },
        { key: 'creativity', label: '创意', score: 65, comment: '可以在配饰上增加亮点' },
        { key: 'bodyFit', label: '体型适配', score: 76, comment: '版型基本合身' },
        { key: 'practicality', label: '实用性', score: 85, comment: '日常穿着很实用' },
      ],
      itemComments: ['上衣版型不错', '下装颜色搭配协调'],
      improvements: ['可以尝试加一条腰带突出腰线', '配饰可以更精致一些'],
    };
  },

  goBack() {
    wx.navigateBack();
  },
});