/**
 * 一次性生产建表脚本
 *
 * 生产环境 app.module 会关闭 TypeORM synchronize（NODE_ENV=production），
 * 首次部署用本脚本按实体定义创建/更新表结构：
 *
 *   cd services/api && npm run schema:sync
 *
 * 说明：
 *  - 自动加载项目根 .env（与 NestJS ConfigModule 的 envFilePath 对齐）；
 *  - 也可用 DATABASE_URL=postgresql://user:pass@host:port/db 覆盖连接；
 *  - 幂等：已存在的表/列不会报错（synchronize 增量处理）。
 */
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { DataSource } from 'typeorm';

// 加载 <仓库根>/.env（tsx 运行时 __dirname = services/api/src/scripts）
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
// 再尝试当前目录 .env（services/api/.env）
dotenv.config();

function parseDatabaseUrl(url: string): Record<string, string> | null {
  try {
    const u = new URL(url);
    return {
      host: u.hostname,
      port: u.port || '5432',
      username: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: u.pathname.replace(/^\//, ''),
    };
  } catch {
    return null;
  }
}

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  const urlCfg = dbUrl ? parseDatabaseUrl(dbUrl) : null;

  const host = urlCfg?.host || process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(urlCfg?.port || process.env.DB_PORT || '5432', 10);
  const username = urlCfg?.username || process.env.DB_USERNAME || 'stylemate';
  const password = urlCfg?.password || process.env.DB_PASSWORD || 'stylemate';
  const database = urlCfg?.database || process.env.DB_NAME || 'stylemate';

  const dataSource = new DataSource({
    type: 'postgres',
    host,
    port,
    username,
    password,
    database,
    // 兼容 tsx（src）与编译产物（dist）两种运行环境
    entities: [path.join(__dirname, '../modules/**/entities/*.entity.{ts,js}')],
    synchronize: true,
    logging: ['schema', 'error'],
  });

  console.log(`[schema:sync] 连接 ${host}:${port}/${database} …`);

  await dataSource.initialize();
  console.log('[schema:sync] 表结构已同步完成 ✓');
  await dataSource.destroy();
  process.exit(0);
}

main().catch((err) => {
  console.error('[schema:sync] 失败:', err?.message ?? err);
  process.exit(1);
});
