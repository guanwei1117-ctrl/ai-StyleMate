#!/usr/bin/env node
/**
 * 一键创建/升级管理后台账号
 *
 * 用法：
 *   node scripts/make-admin.js <手机号> <密码>
 *
 * 示例：
 *   node scripts/make-admin.js 13800000000 admin123
 *
 * 行为：
 *   1. 用户不存在 → 创建新账号 + 角色 = admin
 *   2. 用户已存在 → 升级为 admin + 重置密码
 *
 * 环境变量（从 .env 读，无则用默认）：
 *   DB_HOST=localhost, DB_PORT=5432, DB_USERNAME=stylemate,
 *   DB_PASSWORD=stylemate, DB_NAME=stylemate
 *
 * 执行成功后，用这个账号登录 http://localhost:3000/auth 即可进入 /admin
 */

const crypto = require('crypto');
const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

// 加载 .env
const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.+)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].trim();
    }
  }
}

const phone = process.argv[2];
const password = process.argv[3];

if (!phone || !password) {
  console.error('\n用法: node scripts/make-admin.js <手机号> <密码>');
  console.error('示例: node scripts/make-admin.js 13800000000 admin123\n');
  process.exit(1);
}

if (!/^1\d{10}$/.test(phone)) {
  console.error(`\n手机号格式错误: "${phone}"，应该是 11 位 1 开头的数字\n`);
  process.exit(1);
}

if (password.length < 6) {
  console.error('\n密码至少 6 位\n');
  process.exit(1);
}

/**
 * 与 auth.service.ts:hashPassword 完全相同的算法
 * 格式：salt(hex):hash(hex)
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USERNAME || process.env.DB_USER || 'stylemate',
    password: process.env.DB_PASSWORD || 'stylemate',
    database: process.env.DB_NAME || 'stylemate',
  });

  console.log(`\n>>> 连接数据库 ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'stylemate'} ...`);
  await client.connect();
  console.log('>>> 连接成功');

  try {
    const passwordHash = hashPassword(password);
    const nickname = '管理员';

    // 先 SELECT 看看用户是否存在
    const existing = await client.query(
      'SELECT id FROM users WHERE phone = $1',
      [phone],
    );

    if (existing.rows.length > 0) {
      // 用户已存在 → 升级为 admin + 重置密码
      const userId = existing.rows[0].id;
      await client.query(
        `UPDATE users
         SET role = 'admin',
             password_hash = $1,
             nickname = COALESCE(NULLIF(nickname, ''), $2),
             updated_at = NOW()
         WHERE id = $3`,
        [passwordHash, nickname, userId],
      );
      console.log(`\n[OK] 已将用户 ${phone} (id=${userId}) 升级为 admin 角色`);
    } else {
      // 用户不存在 → 创建一个 admin 账号
      const result = await client.query(
        `INSERT INTO users (phone, password_hash, nickname, role, created_at, updated_at)
         VALUES ($1, $2, $3, 'admin', NOW(), NOW())
         RETURNING id`,
        [phone, passwordHash, nickname],
      );
      console.log(`\n[OK] 已创建管理员账号 ${phone} (id=${result.rows[0].id})`);
    }

    console.log('\n========================================');
    console.log('  管理员账号信息');
    console.log('========================================');
    console.log(`  手机号: ${phone}`);
    console.log(`  密  码: ${password}`);
    console.log('========================================');
    console.log('\n现在可以:');
    console.log('  1) 打开 http://localhost:3000/auth 登录');
    console.log('  2) 登录后访问 http://localhost:3000/admin 进入管理后台');
    console.log('\n⚠️  生产环境请改强密码（>12 位含大小写 + 数字 + 特殊字符）');
    console.log('   本脚本可在 dev/staging 用，生产建议改用 TypeORM 迁移脚本\n');
  } catch (err) {
    console.error('\n[ERROR]', err.message);
    if (err.message.includes('does not exist')) {
      console.error('  提示：数据库/表不存在 → 先 cd services/api && npm run start:dev 启动一次（会自动建表）');
    } else if (err.message.includes('password authentication failed')) {
      console.error('  提示：DB 密码错误 → 检查 services/api/.env 的 DB_PASSWORD');
    } else if (err.message.includes('ECONNREFUSED')) {
      console.error('  提示：DB 连不上 → 检查 PostgreSQL 是否启动，端口/host 是否对');
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
