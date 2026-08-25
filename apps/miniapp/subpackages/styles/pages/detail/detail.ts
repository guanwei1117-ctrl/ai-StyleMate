/// <reference path="../../../../app.d.ts" />

import { STYLES } from '../../../../lib/data/styles';
import type { StyleCard } from '../../../../lib/data/styles';

Page({
  data: {
    style: null as StyleCard | null,
    loading: true,
  },

  onLoad(options: any) {
    const styleId = options.id as string;
    if (!styleId) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      wx.navigateBack();
      return;
    }

    const style = STYLES.find((s) => s.id === styleId) || null;
    this.setData({ style, loading: false });
  },
});