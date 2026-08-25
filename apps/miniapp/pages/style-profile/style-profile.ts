/// <reference path="../../app.d.ts" />

Page({
  data: {
    hasProfile: false,
    loading: true,
    profile: null as any,
    bodyShape: '',
    coreStyles: [] as any[],
    colorScore: 0,
    silhouetteScore: 0,
    sceneScore: 0,
  },

  onLoad() {
    this.loadProfile();
  },

  onShow() {
    this.loadProfile();
  },

  loadProfile() {
    const app = getApp<IAppOption>();
    if (!app.globalData.isLoggedIn) {
      this.setData({ loading: false, hasProfile: false });
      return;
    }

    try {
      const raw = wx.getStorageSync('stylemate.styleProfile.v1');
      if (raw) {
        const profile = JSON.parse(raw);
        const coreStyles = (profile.results || []).filter((r: any) => r.score >= 75).slice(0, 3);
        this.setData({
          hasProfile: true,
          loading: false,
          profile,
          bodyShape: profile.bodyShape || '',
          coreStyles,
          colorScore: profile.results?.[0]?.matchBreakdown?.skinTone ? Math.round(profile.results[0].matchBreakdown.skinTone / 5 * 100) : 0,
          silhouetteScore: profile.results?.[0]?.matchBreakdown?.bodyShape ? Math.round(profile.results[0].matchBreakdown.bodyShape / 20 * 100) : 0,
          sceneScore: profile.results?.[0]?.matchBreakdown?.scene ? Math.round(profile.results[0].matchBreakdown.scene / 10 * 100) : 0,
        });
      } else {
        this.setData({ loading: false, hasProfile: false });
      }
    } catch {
      this.setData({ loading: false, hasProfile: false });
    }
  },

  startOnboarding() {
    wx.navigateTo({ url: '/subpackages/onboarding/pages/quiz/quiz' });
  },

  goToStyleDetail(e: WechatMiniprogram.TouchEvent) {
    const styleId = e.currentTarget.dataset.id as string;
    wx.navigateTo({ url: `/subpackages/styles/pages/detail/detail?id=${styleId}` });
  },

  goToSettings() {
    wx.navigateTo({ url: '/pages/user/user' });
  },
});