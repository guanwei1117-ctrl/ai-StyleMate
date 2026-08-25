/// <reference path="../../../../app.d.ts" />

import { createDefaultAnswers } from '../../../../lib/types/onboarding';
import type { OnboardingAnswers, StepId, Gender, AgeGroup, Occupation, DailyScene, ClimateZone, DressingGoal, PriorityDimension, BudgetLevel } from '../../../../lib/types/onboarding';
import { STYLES } from '../../../../lib/data/styles';

Page({
  data: {
    currentStep: 0,
    totalSteps: 6,
    steps: [
      { id: 'body', title: '身体数据', subtitle: '让我们了解你的身材' },
      { id: 'style_pick', title: '风格偏好', subtitle: '选你喜欢的风格方向' },
      { id: 'budget', title: '预算', subtitle: '你的单件预算范围' },
      { id: 'lifestyle', title: '生活方式', subtitle: '日常场景与穿衣目标' },
      { id: 'priorities', title: '优先级', subtitle: '你最在意什么' },
      { id: 'result', title: '生成档案', subtitle: '即将完成' },
    ],
    answers: createDefaultAnswers(),
    // Step 0: 身体数据
    gender: null as Gender | null,
    height: null as number | null,
    weight: null as number | null,
    heightInput: '',
    weightInput: '',
    // Step 1: 风格偏好
    allStyles: STYLES,
    selectedStyleIds: [] as string[],
    // Step 2: 预算
    budget: null as BudgetLevel | null,
    // Step 3: 生活方式
    ageGroup: null as AgeGroup | null,
    occupation: null as Occupation | null,
    dailyScenes: [] as DailyScene[],
    climate: null as ClimateZone | null,
    dressingGoals: [] as DressingGoal[],
    // Step 4: 优先级
    priorities: [] as PriorityDimension[],
    priorityOptions: [
      { label: '舒适度', value: 'comfort', desc: '面料柔软、版型宽松不束缚' },
      { label: '显瘦', value: 'slimming', desc: '修饰身形、优化比例' },
      { label: '质感', value: 'texture', desc: '面料高级、剪裁讲究' },
      { label: '个性表达', value: 'personality', desc: '独特辨识度、不撞款' },
    ],
    // UI
    submitting: false,
  },

  onLoad() {
    this.initStep();
  },

  initStep() {
    // 检查是否有已保存的问卷进度
    try {
      const saved = wx.getStorageSync('onboarding_progress');
      if (saved) {
        const data = JSON.parse(saved);
        this.setData({
          gender: data.gender || null,
          height: data.height || null,
          weight: data.weight || null,
          heightInput: data.height ? String(data.height) : '',
          weightInput: data.weight ? String(data.weight) : '',
          selectedStyleIds: data.selectedStyleIds || [],
          budget: data.budget || null,
          ageGroup: data.ageGroup || null,
          occupation: data.occupation || null,
          dailyScenes: data.dailyScenes || [],
          climate: data.climate || null,
          dressingGoals: data.dressingGoals || [],
          priorities: data.priorities || [],
        });
      }
    } catch {}
  },

  saveProgress() {
    wx.setStorageSync('onboarding_progress', JSON.stringify({
      gender: this.data.gender,
      height: this.data.height,
      weight: this.data.weight,
      selectedStyleIds: this.data.selectedStyleIds,
      budget: this.data.budget,
      ageGroup: this.data.ageGroup,
      occupation: this.data.occupation,
      dailyScenes: this.data.dailyScenes,
      climate: this.data.climate,
      dressingGoals: this.data.dressingGoals,
      priorities: this.data.priorities,
    }));
  },

  // ===== 步骤 0: 身体数据 =====
  selectGender(e: WechatMiniprogram.TouchEvent) {
    this.setData({ gender: e.currentTarget.dataset.value as Gender });
  },

  onHeightInput(e: WechatMiniprogram.InputEvent) {
    this.setData({ heightInput: e.detail.value });
  },

  onWeightInput(e: WechatMiniprogram.InputEvent) {
    this.setData({ weightInput: e.detail.value });
  },

  // ===== 步骤 1: 风格偏好 =====
  toggleStyle(e: WechatMiniprogram.TouchEvent) {
    const styleId = e.currentTarget.dataset.id as string;
    let selected = [...this.data.selectedStyleIds];
    const idx = selected.indexOf(styleId);
    if (idx >= 0) {
      selected.splice(idx, 1);
    } else {
      if (selected.length >= 5) {
        wx.showToast({ title: '最多选5个', icon: 'none' });
        return;
      }
      selected.push(styleId);
    }
    this.setData({ selectedStyleIds: selected });
  },

  // ===== 步骤 2: 预算 =====
  selectBudget(e: WechatMiniprogram.TouchEvent) {
    this.setData({ budget: e.currentTarget.dataset.value as BudgetLevel });
  },

  // ===== 步骤 3: 生活方式 =====
  selectAgeGroup(e: WechatMiniprogram.TouchEvent) {
    this.setData({ ageGroup: e.currentTarget.dataset.value as AgeGroup });
  },

  selectOccupation(e: WechatMiniprogram.TouchEvent) {
    this.setData({ occupation: e.currentTarget.dataset.value as Occupation });
  },

  toggleScene(e: WechatMiniprogram.TouchEvent) {
    const scene = e.currentTarget.dataset.value as DailyScene;
    let scenes = [...this.data.dailyScenes];
    const idx = scenes.indexOf(scene);
    if (idx >= 0) scenes.splice(idx, 1);
    else scenes.push(scene);
    this.setData({ dailyScenes: scenes });
  },

  selectClimate(e: WechatMiniprogram.TouchEvent) {
    this.setData({ climate: e.currentTarget.dataset.value as ClimateZone });
  },

  toggleGoal(e: WechatMiniprogram.TouchEvent) {
    const goal = e.currentTarget.dataset.value as DressingGoal;
    let goals = [...this.data.dressingGoals];
    const idx = goals.indexOf(goal);
    if (idx >= 0) goals.splice(idx, 1);
    else goals.push(goal);
    this.setData({ dressingGoals: goals });
  },

  // ===== 步骤 4: 优先级 =====
  togglePriority(e: WechatMiniprogram.TouchEvent) {
    const priority = e.currentTarget.dataset.value as PriorityDimension;
    let priorities = [...this.data.priorities];
    const idx = priorities.indexOf(priority);
    if (idx >= 0) priorities.splice(idx, 1);
    else {
      if (priorities.length >= 3) {
        wx.showToast({ title: '最多选3个', icon: 'none' });
        return;
      }
      priorities.push(priority);
    }
    this.setData({ priorities });
  },

  // ===== 导航 =====
  nextStep() {
    const step = this.data.currentStep;

    // 校验
    if (step === 0) {
      const height = parseInt(this.data.heightInput);
      const weight = parseInt(this.data.weightInput);
      if (!height || !weight || height < 100 || height > 250) {
        wx.showToast({ title: '请输入有效身高(100-250cm)', icon: 'none' });
        return;
      }
      if (weight < 20 || weight > 300) {
        wx.showToast({ title: '请输入有效体重(20-300kg)', icon: 'none' });
        return;
      }
      this.setData({ height, weight });
    }

    if (step === 3 && this.data.dressingGoals.length === 0) {
      wx.showToast({ title: '请至少选择一个穿衣目标', icon: 'none' });
      return;
    }

    if (step === 4 && this.data.priorities.length === 0) {
      wx.showToast({ title: '请至少选择一个优先级', icon: 'none' });
      return;
    }

    this.saveProgress();

    if (step < this.data.totalSteps - 1) {
      this.setData({ currentStep: step + 1 });
    } else {
      this.submitQuiz();
    }
  },

  prevStep() {
    if (this.data.currentStep > 0) {
      this.setData({ currentStep: this.data.currentStep - 1 });
    }
  },

  // ===== 提交 =====
  async submitQuiz() {
    this.setData({ submitting: true });

    const answers: OnboardingAnswers = {
      ...createDefaultAnswers(),
      gender: this.data.gender,
      height: this.data.height,
      weight: this.data.weight,
      preferredStyleIds: this.data.selectedStyleIds,
      budget: this.data.budget,
      ageGroup: this.data.ageGroup,
      occupation: this.data.occupation,
      dailyScenes: this.data.dailyScenes,
      climate: this.data.climate,
      dressingGoals: this.data.dressingGoals,
      priorities: this.data.priorities,
    };

    // 保存到本地
    wx.setStorageSync('onboarding_answers', JSON.stringify(answers));
    wx.removeStorageSync('onboarding_progress');

    // 跳转到结果页
    wx.redirectTo({ url: '../result/result' });
  },
});