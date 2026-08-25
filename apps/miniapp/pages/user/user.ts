/// <reference path="../../app.d.ts" />

Page({
  data: {
    isLoggedIn: false,
    userInfo: null as any,
    hasProfile: false,
  },

  onLoad() {
    this.loadUserInfo();
  },

  onShow() {
    this.loadUserInfo();
  },

  loadUserInfo() {
    const app = getApp<IAppOption>();
    const isLoggedIn = app.globalData.isLoggedIn;
    const userInfo = app.globalData.userInfo;
    const hasProfile = !!wx.getStorageSync('stylemate.styleProfile.v1');
    this.setData({ isLoggedIn, userInfo, hasProfile });
  },

  goToLogin() {
    wx.navigateTo({ url: '/pages/auth/auth' });
  },

  goToProfile() {
    wx.navigateTo({ url: '/pages/style-profile/style-profile' });
  },

  goToOnboarding() {
    wx.navigateTo({ url: '/subpackages/onboarding/pages/quiz/quiz' });
  },

  goToStyles() {
    wx.navigateTo({ url: '/subpackages/styles/pages/list/list' });
  },

  goToHistory() {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  goToSettings() {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  handleLogout() {
    wx.showModal({
      title: '确认退出',
      content: '退出后需要重新登录',
      success: (res) => {
        if (res.confirm) {
          const app = getApp<IAppOption>();
          app.logout();
          this.loadUserInfo();
          wx.showToast({ title: '已退出登录', icon: 'success' });
        }
      },
    });
  },
});