/**
 * 风格引擎验证测试
 * 模拟三个不同类型的用户，查看匹配结果是否合理
 */
import { UserStyleDNA } from '../../packages/shared/src/index';
import STYLE_DATABASE from './src/modules/style-engine/data/style-database';
import { analyzeAllStyles } from './src/modules/style-engine/matcher/matcher.service';

function printReport(label: string, dna: UserStyleDNA) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`  ${label}`);
  console.log('='.repeat(70));

  const report = analyzeAllStyles(dna, STYLE_DATABASE);

  console.log('\n📊 核心风格 (适配度 ≥ 70%):');
  report.coreStyles.slice(0, 5).forEach((s) => {
    console.log(`  ✅ ${s.styleName.padEnd(12)} | 总分 ${s.overallScore}% | ${s.summary}`);
  });

  console.log('\n🔍 探索风格 (50-70%):');
  report.exploreStyles.slice(0, 5).forEach((s) => {
    console.log(`  🔶 ${s.styleName.padEnd(12)} | 总分 ${s.overallScore}%`);
  });

  console.log('\n⚠️ 挑战风格 (<50%):');
  report.challengeStyles.slice(0, 3).forEach((s) => {
    console.log(`  ❌ ${s.styleName.padEnd(12)} | 总分 ${s.overallScore}%`);
  });

  console.log('\n🗺️  风格路线图:');
  report.roadmap.forEach((step) => {
    console.log(`  Phase ${step.phase}: ${step.title}`);
    console.log(`    ${step.description}`);
    console.log(`    推荐: ${step.styles.join(' / ')}`);
    console.log(`    重点: ${step.focus}`);
  });

  // 展示最高分风格的维度明细
  if (report.coreStyles.length > 0) {
    const best = report.coreStyles[0];
    console.log(`\n🔬 最佳匹配「${best.styleName}」维度拆解:`);
    best.dimensions.forEach((d) => {
      const bar = '█'.repeat(Math.round(d.score / 5)) + '░'.repeat(20 - Math.round(d.score / 5));
      console.log(
        `  ${d.dimension.padEnd(16)} [${bar}] ${d.score}% ${d.level}`,
      );
      console.log(`    ↳ ${d.reasoning}`);
      if (d.tips) console.log(`    💡 ${d.tips}`);
    });
  }
}

// =============================================================
// 用户 A：温柔淡颜系 — 圆脸、小量感、梨形、浅夏、温柔文艺
// =============================================================
const userAGentleLight: UserStyleDNA = {
  boneStructure: {
    faceShape: 'round',
    facialLineType: 'curved',
    frameSize: 'light',
  },
  volumeSense: 'low',
  bodyType: {
    shape: 'pear',
    heightCategory: 'average',
    height: 162,
    weight: 52,
  },
  skinTone: {
    baseTone: 'cool',
    colorSeason: 'summer_light',
    contrastLevel: 'low',
  },
  temperament: {
    primary: 'gentle',
    secondary: 'artistic',
    lifestyle: ['student', 'stay_at_home'],
  },
};

// =============================================================
// 用户 B：干练酷感系 — 方脸、锐利线条、中骨架、H型、深冬、干练清冷
// =============================================================
const userBCoolCapable: UserStyleDNA = {
  boneStructure: {
    faceShape: 'square',
    facialLineType: 'sharp',
    frameSize: 'medium',
  },
  volumeSense: 'medium_high',
  bodyType: {
    shape: 'rectangle',
    heightCategory: 'tall',
    height: 172,
    weight: 58,
  },
  skinTone: {
    baseTone: 'cool',
    colorSeason: 'winter_deep',
    contrastLevel: 'high',
  },
  temperament: {
    primary: 'cool',
    secondary: 'capable',
    lifestyle: ['office_9to5', 'urban_commuter'],
  },
};

// =============================================================
// 用户 C：活泼暖调系 — 心形脸、混合线条、轻骨架、沙漏、暖春、活泼外向
// =============================================================
const userCLively: UserStyleDNA = {
  boneStructure: {
    faceShape: 'heart',
    facialLineType: 'mixed',
    frameSize: 'light',
  },
  volumeSense: 'medium',
  bodyType: {
    shape: 'hourglass',
    heightCategory: 'petite',
    height: 155,
    weight: 48,
  },
  skinTone: {
    baseTone: 'warm',
    colorSeason: 'spring_warm',
    contrastLevel: 'medium',
  },
  temperament: {
    primary: 'lively',
    secondary: 'gentle',
    lifestyle: ['student', 'social_butterfly'],
  },
};

// =============================================================
printReport('🌸 用户A：温柔淡颜系 — 圆脸·小量感·浅夏·文艺', userAGentleLight);
printReport('🖤 用户B：干练酷感系 — 方脸·锐利·深冬·都市冷感', userBCoolCapable);
printReport('🔥 用户C：活泼暖调系 — 心形脸·沙漏·暖春·社交达人', userCLively);
