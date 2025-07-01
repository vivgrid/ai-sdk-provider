# 发布流程

本项目使用 [Changesets](https://github.com/changesets/changesets) 进行版本管理和发布。

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 添加 changeset

当您进行了需要发布的更改时，运行：

```bash
pnpm changeset
```

根据提示选择：

- `patch`: Bug 修复
- `minor`: 新功能
- `major`: 破坏性更改

### 3. 版本管理

```bash
# 更新版本号（通常在 main 分支由维护者执行）
pnpm changeset:version

# 发布到 npm（通常由 GitHub Actions 自动执行）
pnpm release
```

## 自动化发布

项目配置了 GitHub Actions 自动化发布：

1. **CI 工作流** (`.github/workflows/ci.yml`)

   - 在 PR 和 push 时触发
   - 多 Node.js 版本测试
   - 代码检查、类型检查、构建验证

2. **发布工作流** (`.github/workflows/release.yml`)
   - 只能手动触发（workflow_dispatch）
   - 手动创建发布 PR 或发布到 npm
   - 需要配置 `NPM_TOKEN` secret

## 配置 NPM Token

1. 在 [npmjs.com](https://www.npmjs.com) 生成 access token
2. 在 GitHub 仓库设置中添加 `NPM_TOKEN` secret

## 发布流程

### 方式一：GitHub Actions 手动发布（推荐）

1. 创建包含 changeset 的 PR 并合并到 main 分支
2. 在 GitHub 仓库的 Actions 页面手动触发 "Release" 工作流
3. GitHub Actions 创建发布 PR 或直接发布到 npm

### 方式二：本地手动发布

1. 运行发布前检查：

   ```bash
   bash scripts/release-check.sh
   ```

2. 更新版本：

   ```bash
   pnpm changeset:version
   ```

3. 提交版本更改：

   ```bash
   git add .
   git commit -m "chore: release package"
   ```

4. 发布：
   ```bash
   pnpm release
   ```

## 版本策略

- `patch`: 0.1.0 → 0.1.1 (Bug 修复)
- `minor`: 0.1.0 → 0.2.0 (新功能)
- `major`: 0.1.0 → 1.0.0 (破坏性更改)

## 注意事项

- 所有需要发布的更改都必须包含 changeset
- changeset 文件会在发布后自动删除
- CHANGELOG.md 会自动生成和更新
- 确保在发布前运行所有检查
