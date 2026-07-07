# 表情包贴纸目录

把网上下载的表情包图片/GIF 放到这个文件夹里，然后在 `src/lib/tone-mode.ts` 的 `ROAST_STICKERS_IMAGE` 数组里登记即可。

## 怎么加一个网络表情包

### 第 1 步：下载表情包
把网上看到的表情包（.png / .jpg / .gif / .webp）下载到本文件夹。

建议命名用英文/拼音，例如：
```
public/stickers/
  xingxing.gif      ← 星星眼
  wunai.png         ← 无奈脸
  doge.gif          ← doge神烦狗
  xiaoku.gif        ← 笑哭
```

### 第 2 步：登记到代码
打开 `src/lib/tone-mode.ts`，找到 `ROAST_STICKERS_IMAGE`，取消注释并改成你的文件名：

```ts
export const ROAST_STICKERS_IMAGE: RoastSticker[] = [
  { id: 'img1', type: 'image', src: '/stickers/xingxing.gif', alt: '星星眼', emotion: 'shock' },
  { id: 'img2', type: 'image', src: '/stickers/wunai.png', alt: '无奈', emotion: 'speechless' },
  { id: 'img3', type: 'image', src: '/stickers/doge.gif', alt: 'doge', emotion: 'savage' },
];
```

> 注意：`src` 要以 `/stickers/` 开头（这是 `public/` 的映射），不要写成绝对磁盘路径。

### 第 3 步：完成
刷新结果页，点「😈 毒舌模式」，贴纸弹窗会随机从「图片贴纸 + 文字贴纸」混合抽 4 个弹出来。

## 文件说明
- 文字贴纸（`ROAST_STICKERS_TEXT`）不需要任何图片，开箱即用，改文案即可
- 图片贴纸（`ROAST_STICKERS_IMAGE`）留空数组时，组件自动只用文字贴纸
- 图片建议单边 120~200px，GIF 也行，会自动缩放到 96~112px 显示
