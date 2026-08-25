import { CreateDocumentInput } from '../knowledge-base.service';
import { COLOR_THEORY_SEED } from './color-theory.seed';
import { BODY_TYPE_SEED } from './body-type.seed';
import { OCCASION_SEED } from './occasion.seed';
import { STYLE_ENCYCLOPEDIA_SEED } from './style-encyclopedia.seed';

/**
 * 所有种子数据的聚合入口
 *
 * 用于通过管理端 API 批量导入知识库。
 * 每个数组元素是一个 CreateDocumentInput，会被自动分块、向量化并存储。
 */
export const ALL_SEEDS: CreateDocumentInput[] = [
  ...COLOR_THEORY_SEED,
  ...BODY_TYPE_SEED,
  ...OCCASION_SEED,
  ...STYLE_ENCYCLOPEDIA_SEED,
];

/**
 * 按领域分组的种子数据，支持选择性导入
 */
export const SEEDS_BY_DOMAIN: Record<string, CreateDocumentInput[]> = {
  color_theory: COLOR_THEORY_SEED,
  body_type: BODY_TYPE_SEED,
  occasion: OCCASION_SEED,
  style_encyclopedia: STYLE_ENCYCLOPEDIA_SEED,
};
