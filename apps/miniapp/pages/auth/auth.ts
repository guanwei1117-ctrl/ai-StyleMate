/// <reference path="../../app.d.ts" />

Page({
  data: {
    loading: false,
  },

  handleWxLogin() {
    this.setData({ loading: true });

    wx.login({
      success: async (res) => {
        if (!res.code) {
          wx.showToast({ title: '微信登录失败', icon: 'none' });
          this.setData({ loading: false });
          return;
        }

        try {
          // 调用后端微信登录接口
          const result = await this.wxLoginRequest(res.code);

          // 保存登录状态
          const app = getApp<IAppOption>();
          app.login({ nickname: result.nickname || '用户', userId: result.userId }, result.accessToken);

          wx.showToast({ title: '登录成功', icon: 'success' });

          // 跳转回首页
          setTimeout(() => {
            wx.navigateBack({ delta: 1 });
          }, 1000);
        } catch (err: any) {
          wx.showToast({ title: err.message || '登录失败', icon: 'none' });
        } finally {
          this.setData({ loading: false });
        }
      },
      fail() {
        wx.showToast({ title: '微信登录失败', icon: 'none' });
        this.setData({ loading: false });
      },
    });
  },

  wxLoginRequest(code: string): Promise<{ accessToken: string; userId: string; isNewUser: boolean; nickname?: string }> {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'http://localhost:4000/api/v1/auth/wx-login',
        method: 'POST',
        data: { code },
        header: { 'Content-Type': 'application/json' },
        success(res) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data as any);
          } else {
            reject(new Error((res.data as any)?.message || '登录失败'));
          }
        },
        fail(err) {
          reject(new Error(err.errMsg || '网络异常'));
        },
      });
    });
  },

  skipLogin() {
    wx.navigateBack({ delta: 1 });
  },
});