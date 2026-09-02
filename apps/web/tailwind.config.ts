import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // === 黑白灰主色 ===
        ink: {
          DEFAULT: '#0A0A0A',
          900: '#0A0A0A',
          800: '#1A1A1A',
          700: '#2B2B2B',
          600: '#3D3D3D',
          500: '#555555',
          400: '#6B6B6B',
          300: '#8C8C8C',
          200: '#B0B0B0',
          100: '#D4D4D4',
          50: '#F0F0F0',
        },
        // === 暖白基底 ===
        creme: {
          DEFAULT: '#FAFAF8',
          50: '#FEFEFC',
          100: '#FAFAF8',
          200: '#F5F5F0',
          300: '#EDEDE5',
        },
        // === 点缀色 ===
        // 雾霾蓝
        haze: {
          DEFAULT: '#7B93A0',
          light: '#A3B5BF',
          dark: '#5A727F',
          pale: '#D9E2E7',
        },
        // 奶油杏
        almond: {
          DEFAULT: '#E8D5C0',
          light: '#F2E5D6',
          dark: '#C4A98C',
          pale: '#F7F0E8',
        },
        // 橄榄绿
        olive: {
          DEFAULT: '#6B7F5E',
          light: '#8A9E7D',
          dark: '#4F6045',
          pale: '#D9E0D3',
        },
        // 金属银
        silver: {
          DEFAULT: '#C0C5CA',
          light: '#D8DCE0',
          dark: '#9BA0A6',
          pale: '#EBEDEF',
        },
        // === 语义角色 ===
        // 唯一功能强调色（链接/选中态/高亮），雾霾蓝桥接 Hero 深青蓝与暖白内页
        primary: {
          DEFAULT: '#7B93A0',
          50: '#F0F4F6',
          100: '#D9E2E7',
          200: '#C3D0D8',
          300: '#A3B5BF',
          400: '#8FA4AF',
          500: '#7B93A0',
          600: '#5A727F',
          700: '#4A5F6A',
          800: '#3D4F58',
          900: '#324148',
        },
        // 警示/提示专用（不再作为强调色滥用）
        warning: {
          DEFAULT: '#B45309',
          light: '#D97706',
          pale: '#FEF3E2',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'hero': ['clamp(3rem, 8vw, 7rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'hero-sub': ['clamp(1.75rem, 4vw, 3.5rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        // === 统一排版层级 H1-H3 ===
        'display': ['clamp(2.25rem, 5vw, 4.5rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],   // H1 页面主标题
        'section': ['clamp(1.75rem, 3vw, 2.75rem)', { lineHeight: '1.2', letterSpacing: '-0.01em' }],   // H2 区块标题
        'sub': ['clamp(1.25rem, 2vw, 1.5rem)', { lineHeight: '1.35', letterSpacing: '0' }],             // H3 卡片/小组标题
        'caption': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.04em' }],                         // 辅助说明
      },
      maxWidth: {
        'site': '1440px',
        'reading': '65ch',
      },
      boxShadow: {
        // 暖调染色阴影，替代通用黑阴影
        'card': '0 1px 2px rgba(26, 20, 12, 0.04), 0 4px 16px rgba(26, 20, 12, 0.05)',
        'lift': '0 2px 4px rgba(26, 20, 12, 0.06), 0 12px 32px rgba(26, 20, 12, 0.10)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      animation: {
        'fade-up': 'fadeUp 0.7s ease-out forwards',
        'fade-in': 'fadeIn 1s ease-out forwards',
        'reveal': 'reveal 0.8s ease-out forwards',
        'slow-zoom': 'slowZoom 8s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        reveal: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slowZoom: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.08)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
