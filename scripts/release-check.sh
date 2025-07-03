#!/bin/bash

echo "🔍 运行发布前检查..."

# 检查工作目录是否干净
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ 工作目录不干净，请先提交或暂存更改"
  exit 1
fi

# 检查是否在 main 分支
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
  echo "❌ 请在 main 分支上发布"
  exit 1
fi

# 运行代码检查
echo "🔍 运行代码检查..."
pnpm run format:check
if [ $? -ne 0 ]; then
  echo "❌ 代码格式检查失败"
  exit 1
fi

pnpm run lint:check
if [ $? -ne 0 ]; then
  echo "❌ 代码规范检查失败"
  exit 1
fi

pnpm run type-check
if [ $? -ne 0 ]; then
  echo "❌ 类型检查失败"
  exit 1
fi

# 构建检查
echo "🏗️ 运行构建检查..."
pnpm run build
if [ $? -ne 0 ]; then
  echo "❌ 构建失败"
  exit 1
fi

echo "✅ 所有检查通过，可以发布！" 