#!/bin/bash

# CesiumLite npm 包快速发布脚本
# 使用方法：./publish.sh [patch|minor|major]

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的信息
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检查参数
VERSION_TYPE=${1:-minor}

if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
    error "错误：版本类型必须是 patch、minor 或 major"
    echo "使用方法：./publish.sh [patch|minor|major]"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════"
echo "  CesiumLite npm 包发布脚本"
echo "═══════════════════════════════════════════════"
echo ""

# 1. 检查 Git 状态
info "检查 Git 状态..."
if [[ -n $(git status -s) ]]; then
    warning "工作区有未提交的修改"
    git status -s
    read -p "是否继续？(y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "已取消发布"
        exit 1
    fi
fi
success "Git 状态检查完成"

# 2. 检查 npm 登录状态
info "检查 npm 登录状态..."
if ! npm whoami &> /dev/null; then
    error "未登录 npm，请先运行: npm login"
    exit 1
fi
NPM_USER=$(npm whoami)
success "已登录 npm，用户名: $NPM_USER"

# 3. 运行测试和构建
info "运行构建..."
npm run build
success "构建完成"

# 4. 获取当前版本
CURRENT_VERSION=$(node -p "require('./package.json').version")
info "当前版本: $CURRENT_VERSION"

# 5. 更新版本号
info "更新版本号 ($VERSION_TYPE)..."
npm version $VERSION_TYPE -m "v%s: 发布新版本"
NEW_VERSION=$(node -p "require('./package.json').version")
success "版本号已更新: $CURRENT_VERSION → $NEW_VERSION"

# 6. 推送到 Git
info "推送到 Git 仓库..."
git push origin main
git push origin --tags
success "已推送到 Git"

# 7. 发布到 npm
info "发布到 npm..."
npm publish --access public
success "已发布到 npm"

# 8. 验证发布
info "验证发布..."
sleep 3  # 等待 npm 更新
NPM_VERSION=$(npm view cesium-lite version)
if [[ "$NPM_VERSION" == "$NEW_VERSION" ]]; then
    success "npm 包版本验证成功: $NPM_VERSION"
else
    warning "npm 包版本可能还未更新，请稍后手动验证"
fi

echo ""
echo "═══════════════════════════════════════════════"
success "🎉 发布完成！"
echo "═══════════════════════════════════════════════"
echo ""
echo "新版本: $NEW_VERSION"
echo ""
echo "下一步操作："
echo "  1. 创建 GitHub Release: https://github.com/lukeSuperCoder/cesium-lite/releases/new"
echo "  2. 测试安装: npm install cesium-lite@$NEW_VERSION"
echo "  3. 更新文档"
echo ""
