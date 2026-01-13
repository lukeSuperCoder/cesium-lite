# 解决 npm 双因素认证（2FA）发布问题

## 🔒 错误原因

```
403 Forbidden - Two-factor authentication or granular access token
with bypass 2fa enabled is required to publish packages.
```

**原因：** 你的 npm 账户启用了双因素认证（2FA），发布时需要额外验证。

---

## ✅ 解决方案

### 方案一：使用 OTP（一次性密码）发布 ⭐ 推荐

在发布命令中添加 `--otp` 参数：

```bash
# 手动发布时添加 OTP
npm publish --otp=<你的6位验证码> --access public

# 示例
npm publish --otp=123456 --access public
```

**步骤：**
1. 打开你的 2FA 验证器 App（如 Google Authenticator、Authy）
2. 查看 npm 的 6 位验证码
3. 在 30 秒内执行发布命令并输入验证码

---

### 方案二：使用访问令牌（Access Token）⭐⭐ 强烈推荐

创建一个可以绕过 2FA 的访问令牌：

#### 步骤 1：创建访问令牌

1. 访问 npm 网站：https://www.npmjs.com/settings/<your-username>/tokens
2. 点击 "Generate New Token"
3. 选择 **"Classic Token"**
4. 配置令牌：
   - Token name: `cesium-lite-publish`
   - Expiration: 根据需要选择（建议 30-90 天）
   - Type: 选择 **"Automation"** 类型
5. 点击 "Generate Token"
6. **立即复制令牌**（只显示一次！）

#### 步骤 2：配置本地 npm

```bash
# 方式一：使用 .npmrc 文件（推荐）
echo "//registry.npmjs.org/:_authToken=<你的令牌>" >> ~/.npmrc

# 方式二：使用环境变量
export NPM_TOKEN=<你的令牌>
```

#### 步骤 3：使用令牌发布

```bash
# 直接发布（使用 .npmrc 中的令牌）
npm publish --access public

# 或者使用环境变量
npm publish --access public --//registry.npmjs.org/:_authToken=$NPM_TOKEN
```

---

### 方案三：更新发布脚本使用 OTP

修改 `scripts/publish.sh` 脚本，支持 OTP：

```bash
#!/bin/bash

# ... 前面的代码保持不变 ...

# 7. 发布到 npm
info "发布到 npm..."

# 提示输入 OTP
echo ""
echo "请打开你的 2FA 验证器 App（如 Google Authenticator）"
read -p "输入 6 位 OTP 验证码: " OTP_CODE

if [[ -z "$OTP_CODE" ]]; then
    error "OTP 验证码不能为空"
    exit 1
fi

# 使用 OTP 发布
npm publish --otp=$OTP_CODE --access public

success "已发布到 npm"

# ... 后面的代码保持不变 ...
```

---

## 🚀 推荐操作流程

### 使用访问令牌（最简单）

```bash
# 1. 创建访问令牌（只需一次）
# 访问：https://www.npmjs.com/settings/<your-username>/tokens

# 2. 配置令牌到 .npmrc
echo "//registry.npmjs.org/:_authToken=npm_xxxxxxxxxxxx" >> ~/.npmrc

# 3. 发布（无需输入 OTP）
npm run release:patch
```

### 使用 OTP（每次都需要）

```bash
# 1. 更新版本号
npm version patch

# 2. 推送到 Git
git push && git push --tags

# 3. 打开 2FA App 获取验证码
# 4. 在 30 秒内发布
npm publish --otp=123456 --access public
```

---

## 🔧 修改发布脚本

### 选项 1：添加 OTP 输入

创建新文件 `scripts/publish-with-otp.sh`：

```bash
#!/bin/bash

set -e

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

VERSION_TYPE=${1:-minor}

echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${BLUE}  CesiumLite npm 包发布脚本（支持 2FA）${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""

# 检查登录
echo -e "${BLUE}检查 npm 登录状态...${NC}"
if ! npm whoami &> /dev/null; then
    echo -e "${RED}未登录 npm，请先运行: npm login${NC}"
    exit 1
fi
NPM_USER=$(npm whoami)
echo -e "${GREEN}✅ 已登录: $NPM_USER${NC}"

# 构建
echo -e "${BLUE}运行构建...${NC}"
npm run build
echo -e "${GREEN}✅ 构建完成${NC}"

# 更新版本
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${BLUE}当前版本: $CURRENT_VERSION${NC}"

npm version $VERSION_TYPE -m "v%s: 发布新版本"
NEW_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}✅ 版本已更新: $NEW_VERSION${NC}"

# 推送到 Git
echo -e "${BLUE}推送到 Git...${NC}"
git push origin main
git push origin --tags
echo -e "${GREEN}✅ 已推送到 Git${NC}"

# 发布到 npm（支持 2FA）
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${BLUE}  准备发布到 npm${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""
echo -e "请打开你的 2FA 验证器 App"
echo -e "（如 Google Authenticator、Authy 等）"
echo ""
read -p "输入 6 位 OTP 验证码: " OTP_CODE

if [[ -z "$OTP_CODE" ]]; then
    echo -e "${RED}❌ OTP 验证码不能为空${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}正在发布...${NC}"
npm publish --otp=$OTP_CODE --access public

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 发布成功！${NC}"
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  🎉 发布完成！${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
    echo ""
    echo "新版本: $NEW_VERSION"
    echo ""
    echo "下一步："
    echo "  1. 创建 GitHub Release"
    echo "  2. 测试安装: npm install cesium-lite@$NEW_VERSION"
else
    echo -e "${RED}❌ 发布失败！${NC}"
    exit 1
fi
```

### 选项 2：使用令牌（修改 package.json）

```json
{
  "scripts": {
    "release:patch": "npm version patch && git push && git push --tags && npm publish --access public",
    "release:minor": "npm version minor && git push && git push --tags && npm publish --access public",
    "release:major": "npm version major && git push && git push --tags && npm publish --access public"
  }
}
```

然后在 `~/.npmrc` 中配置令牌：
```
//registry.npmjs.org/:_authToken=npm_xxxxxxxxxxxx
```

---

## 📝 当前推荐方案

### 立即可用的方案（使用 OTP）

```bash
# 1. 确保已登录
npm whoami

# 2. 更新版本号
npm version patch

# 3. 推送到 Git
git push origin main --tags

# 4. 打开 2FA App，准备验证码
# 5. 在 30 秒内执行发布
npm publish --otp=<6位验证码> --access public

# 示例（将 123456 替换为你的验证码）
npm publish --otp=123456 --access public
```

### 长期推荐方案（使用访问令牌）

```bash
# 1. 创建令牌
# 访问：https://www.npmjs.com/settings/<username>/tokens
# 类型选择：Automation

# 2. 配置令牌（一次性）
echo "//registry.npmjs.org/:_authToken=<你的令牌>" >> ~/.npmrc

# 3. 以后发布就无需 OTP 了
npm run release:patch
```

---

## ⚠️ 安全提示

### 关于访问令牌

1. **不要提交到 Git**
   - 令牌非常敏感，不要提交到代码库
   - 添加到 `.gitignore`：
     ```
     .npmrc
     ```

2. **定期更换令牌**
   - 建议设置 30-90 天有效期
   - 到期后重新生成

3. **限制令牌权限**
   - 只给发布权限
   - 不要使用 "Publish" 类型（需要 2FA）
   - 使用 "Automation" 类型（可绕过 2FA）

### 关于 .npmrc 文件

```bash
# 全局配置（推荐）
~/.npmrc

# 项目配置（不推荐，容易泄露）
项目目录/.npmrc  # 需要加入 .gitignore
```

---

## 🎯 现在该做什么？

### 立即发布（使用 OTP）

```bash
# 你刚才已经更新了版本号到 1.2.3
# 现在只需要：

# 1. 打开 2FA App
# 2. 查看验证码
# 3. 执行命令（30秒内）
npm publish --otp=<验证码> --access public
```

### 配置令牌（推荐）

1. 访问：https://www.npmjs.com/settings/<your-username>/tokens
2. 创建 Automation 类型的令牌
3. 配置到 `~/.npmrc`
4. 重新运行 `npm run release:patch`

---

## 📚 相关文档

- [npm 双因素认证文档](https://docs.npmjs.com/about-two-factor-authentication)
- [npm 访问令牌指南](https://docs.npmjs.com/creating-and-viewing-access-tokens)
- [npm publish 命令文档](https://docs.npmjs.com/cli/v8/commands/npm-publish)
