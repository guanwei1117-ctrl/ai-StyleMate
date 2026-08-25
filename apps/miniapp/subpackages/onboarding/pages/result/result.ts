/// <reference path="../../../../app.d.ts" />

import { STYLES } from '../../../../lib/data/styles';
import type { OnboardingAnswers, StyleMatchResult } from '../../../../lib/types/onboarding';
import { deriveBodyShape } from '../../../../lib/business/body-analysis';
import { matchStyles } from '../../../../lib/business/style-matcher';
import { buildBodyExplain, buildAvoidanceAdvice, buildMultiDimension } from '../../../../lib/business/style-explain';
import { createStoredStyleProfile, saveStyleProfile } from '../../../../lib/business/style-profile-storage';

Page({
  data: {
    loading: true,
    results: [] as StyleMatchResult[],
    bodyShape: '',
    bodyExplain: null as any,
    avoidanceAdvice: [] as any[],
    coreStyles: [] as any[],
    colorScore: 0,
    silhouetteScore: 0,
    sceneScore: 0,
    bestSilhouettes: [] as string[],
    bestColors: [] as string[],
    riskFlags: [] as string[],
  },

  onLoad() {
    this.calculateResults();
  },

  calculateResults() {
    try {
      const raw = wx.getStorageSync('onboarding_answers');
      if (!raw) {
        wx.showToast({ title: '请先完成测评', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 1000);
        return;
      }

      const answers: OnboardingAnswers = JSON.parse(raw);
      const bodyShape = deriveBodyShape(answers.height!, answers.weight!, answers.bust, answers.waist, answers.hip);
      const results = matchStyles(answers);
      const bodyExplain = buildBodyExplain(bodyShape, answers);
      const avoidanceAdvice = buildAvoidanceAdvice(bodyShape, results, answers);
      const multiDimension = buildMultiDimension(results, answers);

      // 保存到存储
      const profile = createStoredStyleProfile(answers, bodyShape, results);
      saveStyleProfile(profile);

      // 更新全局状态
      const app = getApp<IAppOption>();
      app.globalData.styleProfile = profile;

      // 清理问卷缓存
      wx.removeStorageSync('onboarding_answers');

      this.setData({
        loading: false,
        results,
        bodyShape,
        bodyExplain,
        avoidanceAdvice,
        coreStyles: multiDimension.coreStyles,
        colorScore: multiDimension.colorScore,
        silhouetteScore: multiDimension.silhouetteScore,
        sceneScore: multiDimension.sceneScore,
        bestSilhouettes: multiDimension.bestSilhouettes,
        bestColors: multiDimension.bestColors,
        riskFlags: multiDimension.riskFlags,
      });
    } catch (err: any) {
      wx.showToast({ title: '计算失败，请重试', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  goToHome() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  goToProfile() {
    wx.switchTab({ url: '/pages/style-profile/style-profile' });
  },

  goToStyleDetail(e: WechatMiniprogram.TouchEvent) {
    const styleId = e.currentTarget.dataset.id as string;
    wx.navigateTo({ url: `/subpackages/styles/pages/detail/detail?id=${styleId}` });
  },
});