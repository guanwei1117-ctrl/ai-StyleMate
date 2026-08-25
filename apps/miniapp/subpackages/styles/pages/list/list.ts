/// <reference path="../../../../app.d.ts" />

import { STYLES, DIMENSIONS, DIMENSION_LABELS } from '../../../../lib/data/styles';
import type { StyleCard, StyleDimension } from '../../../../lib/data/styles';

Page({
  data: {
    dimensions: DIMENSIONS,
    currentDimension: '全部' as string,
    dimensionLabel: '全部',
    styles: STYLES,
    filteredStyles: STYLES,
    searchKeyword: '',
  },

  onLoad() {
    this.filterByDimension('全部');
  },

  filterByDimension(dimension: string) {
    let filtered = STYLES;
    if (dimension !== '全部') {
      filtered = STYLES.filter((s) => s.dimension === dimension);
    }
    this.setData({
      currentDimension: dimension,
      dimensionLabel: dimension === '全部' ? '全部风格' : `${dimension} · ${filtered.length}种`,
      filteredStyles: filtered,
    });
  },

  onDimensionTap(e: WechatMiniprogram.TouchEvent) {
    const dimension = e.currentTarget.dataset.dimension as string;
    this.filterByDimension(dimension);
  },

  onSearchInput(e: WechatMiniprogram.InputEvent) {
    const keyword = e.detail.value.trim().toLowerCase();
    this.setData({ searchKeyword: keyword });

    if (!keyword) {
      this.filterByDimension(this.data.currentDimension);
      return;
    }

    const base = this.data.currentDimension === '全部' ? STYLES : STYLES.filter((s) => s.dimension === this.data.currentDimension);
    const filtered = base.filter(
      (s) => s.name.includes(keyword) || s.description.includes(keyword) || s.category.includes(keyword),
    );
    this.setData({ filteredStyles: filtered });
  },

  goToDetail(e: WechatMiniprogram.TouchEvent) {
    const styleId = e.currentTarget.dataset.id as string;
    wx.navigateTo({ url: `/subpackages/styles/pages/detail/detail?id=${styleId}` });
  },
});