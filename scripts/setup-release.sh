#!/bin/bash

echo "🚀 设置发布环境..."

# 安装依赖
echo "📦 安装依赖..."
pnpm install

# 初始化 changesets（如果未初始化）
if [ ! -d ".changeset" ]; then
  echo "🔧 初始化 changesets..."
  pnpm changeset init
fi

# 运行构建测试
echo "🏗️ 运行构建测试..."
pnpm run build

echo "✅ 发布环境设置完成！"
echo ""
echo "📝 下一步操作："
echo "1. 运行 'pnpm changeset' 添加变更集"
echo "2. 在 GitHub 仓库设置中添加 NPM_TOKEN secret"
echo "3. 提交更改到 main 分支"
echo "4. 在 GitHub Actions 页面手动触发发布工作流" 