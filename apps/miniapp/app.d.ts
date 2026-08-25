/// <reference path="node_modules/miniprogram-api-typings/index.d.ts" />

interface IAppOption {
  globalData: {
    userInfo: any
    token: string | null
    styleProfile: any
    isLoggedIn: boolean
  }
  login(userInfo: any, token: string): void
  logout(): void
}

interface StyleCategory {
  id: string
  name: string
  nameEn: string
  description: string
  imageUrl: string
  tags: string[]
  dimension: string
  season?: string[]
  occasion?: string[]
  bodyTypes?: string[]
}

interface StyleDetail extends StyleCategory {
  keywords: string[]
  colorPalette: string[]
  fabricSuggestions: string[]
  stylingTips: string[]
  suitableFor: string[]
  celebrities?: string[]
}