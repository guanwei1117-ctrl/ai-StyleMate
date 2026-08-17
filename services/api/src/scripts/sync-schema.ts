/**
 * 一次性生产建表脚本
 *
 * 生产环境 app.module 会关闭 TypeORM synchronize（NODE_ENV=production），
 * 首次部署用本脚本按实体定义创建/更新表结构：
 *
 *   cd services/api && npm run schema:sync
 *
 * 说明：
 *  - 依赖根目录 .env 或服务目录 .env 中的数据库配置；
 *  - 幂等：已存在的表/列不会报错（synchronize 增量处理）。
 */
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as path from 'path';

async function main() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'stylemate',
    password: process.env.DB_PASSWORD || 'stylemate',
    database: process.env.DB_NAME || 'stylemate',
    entities: [path.join(__dirname, '../modules/**/entities/*.entity.ts')],
    synchronize: true,
    logging: ['schema', 'error'],
  });

  console.log(
    `[schema:sync] 连接 ${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'stylemate'} …`,
  );

  await dataSource.initialize();
  console.log('[schema:sync] 表结构已同步完成 ✓');
  await dataSource.destroy();
  process.exit(0);
}

main().catch((err) => {
  console.error('[schema:sync] 失败:', err?.message ?? err);
  process.exit(1);
});
