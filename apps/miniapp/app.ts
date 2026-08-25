/// <reference path="node_modules/miniprogram-api-typings/index.d.ts" />

App<IAppOption>({
  globalData: {
    userInfo: null,
    token: null,
    styleProfile: null,
    isLoggedIn: false,
  },

  onLaunch() {
    // 检查是否已登录
    const token = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')
    if (token && userInfo) {
      this.globalData.token = token
      this.globalData.userInfo = userInfo
      this.globalData.isLoggedIn = true
    }
  },

  login(userInfo: any, token: string) {
    this.globalData.userInfo = userInfo
    this.globalData.token = token
    this.globalData.isLoggedIn = true
    wx.setStorageSync('token', token)
    wx.setStorageSync('userInfo', userInfo)
  },

  logout() {
    this.globalData.userInfo = null
    this.globalData.token = null
    this.globalData.isLoggedIn = false
    wx.removeStorageSync('token')
    wx.removeStorageSync('userInfo')
  },
})