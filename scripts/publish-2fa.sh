#!/bin/bash

# CesiumLite npm 包快速发布脚本（支持 2FA）
# 使用方法：./publish-2fa.sh [patch|minor|major]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

VERSION_TYPE=${1:-patch}

if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
    error "错误：版本类型必须是 patch、minor 或 major"
    echo "使用方法：./publish-2fa.sh [patch|minor|major]"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════"
echo "  CesiumLite npm 包发布脚本（支持 2FA）"
echo "═══════════════════════════════════════════════"
echo ""

# 检查 Git 状态
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

# 检查 npm 登录
info "检查 npm 登录状态..."
if ! npm whoami &> /dev/null; then
    error "未登录 npm，请先运行: npm login"
    exit 1
fi
NPM_USER=$(npm whoami)
success "已登录 npm，用户名: $NPM_USER"

# 运行构建
info "运行构建..."
npm run build
success "构建完成"

# 获取当前版本
CURRENT_VERSION=$(node -p "require('./package.json').version")
info "当前版本: $CURRENT_VERSION"

# 更新版本号
info "更新版本号 ($VERSION_TYPE)..."
npm version $VERSION_TYPE -m "v%s: 发布新版本"
NEW_VERSION=$(node -p "require('./package.json').version")
success "版本号已更新: $CURRENT_VERSION → $NEW_VERSION"

# 推送到 Git
info "推送到 Git 仓库..."
git push origin main
git push origin --tags
success "已推送到 Git"

# 发布到 npm（支持 2FA）
echo ""
echo "═══════════════════════════════════════════════"
info "准备发布到 npm"
echo "═══════════════════════════════════════════════"
echo ""
warning "你的账户启用了双因素认证（2FA）"
echo ""
echo "请打开你的 2FA 验证器 App"
echo "（如 Google Authenticator、Authy、1Password 等）"
echo ""
echo "查看 npm 的 6 位验证码"
echo ""
read -p "输入 OTP 验证码: " OTP_CODE

if [[ -z "$OTP_CODE" ]]; then
    error "OTP 验证码不能为空"
    exit 1
fi

if [[ ! "$OTP_CODE" =~ ^[0-9]{6}$ ]]; then
    error "OTP 验证码必须是 6 位数字"
    exit 1
fi

echo ""
info "正在发布到 npm..."
npm publish --otp=$OTP_CODE --access public

if [ $? -eq 0 ]; then
    success "已发布到 npm"

    # 验证发布
    info "验证发布..."
    sleep 3
    NPM_VERSION=$(npm view cesium-lite version 2>/dev/null || echo "")
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
    echo "  1. 创建 GitHub Release:"
    echo "     https://github.com/lukeSuperCoder/cesium-lite/releases/new"
    echo ""
    echo "  2. 测试安装:"
    echo "     npm install cesium-lite@$NEW_VERSION"
    echo ""
    echo "  3. 验证功能是否正常"
    echo ""
else
    error "发布失败！"
    echo ""
    echo "可能的原因："
    echo "  1. OTP 验证码错误或已过期（30秒有效期）"
    echo "  2. 网络连接问题"
    echo "  3. 权限不足"
    echo ""
    echo "解决方法："
    echo "  - 重新获取验证码并再次尝试"
    echo "  - 或者配置访问令牌（推荐）："
    echo "    查看文档: docs/npm-2fa-solution.md"
    echo ""
    exit 1
fi
