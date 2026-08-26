# 贡献指南

感谢你考虑为 StyleMate 做出贡献！🎉

## 行为准则

本项目采用 [Contributor Covenant](CODE_OF_CONDUCT.md) 行为准则。参与即表示同意遵守。

## 如何贡献

### 报告 Bug

1. 先在 [Issues](https://github.com/guanwei1117-ctrl/cleanfit/issues) 中搜索是否已有相同报告
2. 如果没有，使用 **Bug 报告模板** 创建新 Issue
3. 清晰描述复现步骤和环境信息

### 提交功能建议

1. 使用 **功能建议模板** 创建 Issue
2. 清晰描述使用场景和预期行为
3. 如果可能，附上参考实现或设计稿

### 提交代码

#### 1. 分支命名

```
feat/xxx      — 新功能
fix/xxx       — Bug 修复
refactor/xxx  — 重构
docs/xxx      — 文档
style/xxx     — 样式/格式
chore/xxx     — 构建/工具
```

#### 2. 提交信息规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

```
feat: add style profile analysis
fix: correct image upload validation
docs: update API documentation
refactor: extract scoring service
```

#### 3. 开发流程

```bash
# Fork 并克隆后
git checkout -b feat/your-feature

# 安装依赖
npm install

# 启动开发环境
python start.py

# 确保测试通过
npm test
npm run lint

# 提交
git commit -m "feat: your feature description"
git push origin feat/your-feature
```

#### 4. Pull Request 要求

- PR 标题遵循 Conventional Commits
- 关联相关 Issue
- 包含测试（如果适用）
- 通过所有 CI 检查
- 更新相关文档

## 开发环境

- Node.js ≥ 18
- Docker Desktop（PostgreSQL + Redis）
- Python ≥ 3.8（可选，用于一键启动脚本）

## 代码风格

- TypeScript 严格模式
- 使用 Prettier 格式化
- 遵循现有代码风格

---

再次感谢你的贡献！🙏