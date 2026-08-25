/// <reference path="../../app.d.ts" />

Page({
  data: {
    greeting: '上午好',
    nickname: '',
    isLoggedIn: false,
    weatherInfo: null as any,
    recentRecords: [] as any[],
    features: [
      { id: 'score', icon: '📸', title: '穿搭诊断', desc: '拍照即评', url: '/subpackages/score-outfit/pages/score-outfit' },
      { id: 'recommend', icon: '👔', title: '今日推荐', desc: '一键穿搭', url: '/subpackages/daily-recommend/pages/daily-recommend' },
      { id: 'onboarding', icon: '🎯', title: '风格测评', desc: '找到你的风格', url: '/subpackages/onboarding/pages/quiz/quiz' },
      { id: 'styles', icon: '📖', title: '风格档案', desc: '浏览所有风格', url: '/subpackages/styles/pages/list/list' },
    ],
  },

  onLoad() {
    this.initGreeting();
    this.checkLoginStatus();
    this.loadRecentRecords();
  },

  onShow() {
    this.checkLoginStatus();
  },

  initGreeting() {
    const hour = new Date().getHours();
    let greeting = '下午好';
    if (hour < 6) greeting = '夜深了';
    else if (hour < 12) greeting = '上午好';
    else if (hour < 18) greeting = '下午好';
    else greeting = '晚上好';
    this.setData({ greeting });
  },

  checkLoginStatus() {
    const app = getApp<IAppOption>();
    const isLoggedIn = app.globalData.isLoggedIn;
    const nickname = app.globalData.userInfo?.nickname || '';
    this.setData({ isLoggedIn, nickname });
  },

  loadRecentRecords() {
    // TODO: 从后端加载最近的穿搭记录
    this.setData({ recentRecords: [] });
  },

  navigateTo(e: WechatMiniprogram.TouchEvent) {
    const url = e.currentTarget.dataset.url as string;
    if (!url) return;

    // 需要登录的功能，检查登录状态
    const needLogin = ['score', 'recommend'].includes(e.currentTarget.dataset.id as string);
    if (needLogin && !this.data.isLoggedIn) {
      wx.navigateTo({ url: '/pages/auth/auth' });
      return;
    }

    wx.navigateTo({ url });
  },

  goToAuth() {
    wx.navigateTo({ url: '/pages/auth/auth' });
  },

  goToProfile() {
    if (!this.data.isLoggedIn) {
      wx.navigateTo({ url: '/pages/auth/auth' });
      return;
    }
    wx.navigateTo({ url: '/pages/style-profile/style-profile' });
  },
});