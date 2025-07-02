# 手动发布指南

本项目采用**手动触发**的发布策略，确保发布过程的可控性和安全性。

## 🔐 手动发布的优势

- **可控性**: 完全控制何时发布新版本
- **安全性**: 避免意外的自动发布
- **审查性**: 每次发布都需要人工确认
- **灵活性**: 可以选择最佳的发布时机

## 📋 发布前准备

### 1. 确保环境准备就绪

```bash
# 检查工作目录状态
git status

# 确保在 main 分支
git branch --show-current

# 运行发布前检查
bash scripts/release-check.sh
```

### 2. 添加变更集

```bash
# 添加变更描述
pnpm changeset
```

根据更改类型选择：

- **patch** (0.1.0 → 0.1.1): Bug 修复
- **minor** (0.1.0 → 0.2.0): 新功能
- **major** (0.1.0 → 1.0.0): 破坏性更改

### 3. 提交变更

```bash
git add .
git commit -m "feat: add new feature with changeset"
git push origin main
```

## 🚀 手动触发发布

### 方式一：GitHub Web 界面（推荐）

1. 打开 GitHub 仓库页面
2. 点击 **Actions** 标签
3. 在左侧找到 **Release** 工作流
4. 点击 **Run workflow** 按钮
5. 确认分支为 `main`
6. 点击 **Run workflow** 开始执行

### 方式二：GitHub CLI

```bash
# 安装 GitHub CLI（如果未安装）
brew install gh

# 认证
gh auth login

# 手动触发发布工作流
gh workflow run release.yml
```

### 方式三：API 调用

```bash
# 使用 curl 调用 GitHub API
curl -X POST \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/vivgrid/vivgrid-ai-provider/actions/workflows/release.yml/dispatches \
  -d '{"ref":"main"}'
```

## 📊 发布流程监控

### 查看工作流状态

1. 在 GitHub Actions 页面查看运行状态
2. 点击具体的工作流运行查看详细日志
3. 监控各个步骤的执行情况

### 发布结果确认

发布成功后，系统会：

- ✅ 更新 `package.json` 版本号
- ✅ 生成或更新 `CHANGELOG.md`
- ✅ 创建 Git 标签
- ✅ 发布到 npm 仓库
- ✅ 创建 GitHub Release

## 🔧 故障排除

### 常见问题

1. **NPM_TOKEN 未配置**

   ```
   Error: Unable to authenticate with npm
   ```

   解决：在 GitHub 仓库设置中添加 `NPM_TOKEN` secret

2. **没有 changeset 文件**

   ```
   Error: No changeset files found
   ```

   解决：运行 `pnpm changeset` 添加变更集

3. **权限不足**
   ```
   Error: Permission denied
   ```
   解决：确保有仓库写入权限和 npm 发布权限

### 回滚发布

如果发布出现问题，可以：

1. **npm 回滚**: `npm unpublish vivgrid-ai-provider@版本号`
2. **Git 回滚**: `git revert 提交哈希`
3. **删除标签**: `git tag -d v版本号 && git push origin :refs/tags/v版本号`

## 📝 最佳实践

1. **发布前测试**: 确保所有测试通过
2. **文档更新**: 重要更改需要更新文档
3. **发布说明**: 在 changeset 中详细描述更改
4. **版本策略**: 遵循语义化版本规范
5. **发布时机**: 选择合适的时间发布，避免高峰期

## 🔒 安全注意事项

- 定期轮换 NPM_TOKEN
- 限制发布权限给信任的维护者
- 监控发布日志和异常
- 备份重要的发布配置
