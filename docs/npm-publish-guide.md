# CesiumLite npm 包更新与发布指南

> 版本：1.1.0 → 1.2.0
> 更新日期：2026-01-13

---

## 📦 npm 包更新流程

### 一、版本号规范（语义化版本）

版本号格式：**主版本号.次版本号.修订号** (MAJOR.MINOR.PATCH)

```
1.2.3
│ │ │
│ │ └─ PATCH：修订号，向下兼容的问题修正
│ └─── MINOR：次版本号，向下兼容的功能性新增
└───── MAJOR：主版本号，不兼容的 API 修改
```

### 版本更新场景

| 变更类型 | 版本号变化 | 示例 | 场景 |
|---------|-----------|------|------|
| **Bug 修复** | PATCH +1 | 1.1.0 → 1.1.1 | 修复已知问题，不影响 API |
| **新增功能** | MINOR +1 | 1.1.0 → 1.2.0 | 新增功能，向后兼容 |
| **破坏性变更** | MAJOR +1 | 1.1.0 → 2.0.0 | API 重大变更，不兼容旧版 |

**本次重构建议：** 1.1.0 → **1.2.0**
- ✅ 新增统一图层管理器
- ✅ 优化模块结构
- ✅ 完全向后兼容

---

## 🚀 发布前准备清单

### 1. 更新版本号

**方式一：手动修改 package.json**
```json
{
  "name": "cesium-lite",
  "version": "1.2.0",  // 从 1.1.0 改为 1.2.0
  ...
}
```

**方式二：使用 npm version 命令**
```bash
# 自动更新 PATCH 版本（1.1.0 → 1.1.1）
npm version patch

# 自动更新 MINOR 版本（1.1.0 → 1.2.0）推荐
npm version minor

# 自动更新 MAJOR 版本（1.1.0 → 2.0.0）
npm version major
```

**推荐方式二**，因为会自动：
- ✅ 更新 package.json 中的版本号
- ✅ 创建 Git commit
- ✅ 创建 Git tag

---

### 2. 更新 CHANGELOG.md

创建或更新 `CHANGELOG.md` 文件，记录版本变更：

```markdown
# 更新日志

## [1.2.0] - 2026-01-13

### 新增
- ✨ 新增统一图层管理器 `LayerManager`，支持所有类型图层的统一管理
- ✨ 新增 `analysis` 模块，集中管理空间分析功能

### 优化
- 🔄 重命名 `mark` 模块为 `interaction`，语义更清晰
- 🔄 重构空间分析模块，从 `utils` 移至独立的 `analysis` 目录
- 🗑️ 清理空的 `query` 和 `animation` 目录

### 兼容性
- ✅ 完全向后兼容，现有 API 无需修改

## [1.1.0] - 之前版本
...
```

---

### 3. 更新 README.md

确保 README 包含最新的使用说明：

```markdown
# CesiumLite

## 安装

\`\`\`bash
npm install cesium-lite
\`\`\`

## 最新功能（v1.2.0）

### 统一图层管理
\`\`\`javascript
import CesiumLite from 'cesium-lite';

const cesiumLite = new CesiumLite('container');

// 使用新的统一图层管理器
cesiumLite.layerManager.addLayer({
    type: 'wms',  // 或 'geojson', 'xyz' 等
    url: '...',
    options: {...}
});
\`\`\`

## 更新日志
查看 [CHANGELOG.md](./CHANGELOG.md)
```

---

### 4. 构建测试

```bash
# 清理旧的构建文件
rm -rf dist/

# 重新构建
npm run build

# 验证构建结果
ls -lh dist/
```

**检查项：**
- ✅ 构建无错误
- ✅ 生成文件大小合理
- ✅ 所有示例页面正常

---

### 5. 本地测试

**方式一：npm link 本地测试**
```bash
# 在 cesium-lite 目录
npm link

# 在测试项目目录
npm link cesium-lite

# 测试使用
import CesiumLite from 'cesium-lite';
```

**方式二：使用相对路径测试**
```bash
cd your-test-project
npm install ../cesium-lite
```

---

## 📤 发布到 npm

### 前置条件

1. **注册 npm 账号**
   - 访问 https://www.npmjs.com/signup
   - 完成注册和邮箱验证

2. **登录 npm**
   ```bash
   npm login
   # 输入用户名、密码、邮箱
   ```

3. **验证登录状态**
   ```bash
   npm whoami
   # 应该显示你的用户名
   ```

---

### 发布步骤

#### 步骤 1：更新版本号
```bash
npm version minor -m "v%s: 新增统一图层管理器和模块重构"
# 自动更新版本号、创建 commit 和 tag
```

#### 步骤 2：推送到 Git 仓库
```bash
git push origin main
git push origin --tags
```

#### 步骤 3：发布到 npm
```bash
# 发布公开包
npm publish --access public

# 如果是私有包（需要付费）
npm publish
```

**首次发布可能需要：**
```bash
npm publish --access public
```

#### 步骤 4：验证发布
```bash
# 查看包信息
npm info cesium-lite

# 查看最新版本
npm view cesium-lite version

# 测试安装
npm install cesium-lite@latest
```

---

## 🔄 完整发布流程（推荐）

### 自动化发布脚本

在 `package.json` 中添加发布脚本：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "npm run build",
    "prepublishOnly": "npm run build",
    "version": "npm run build && git add -A dist",
    "postversion": "git push && git push --tags",
    "release:patch": "npm version patch && npm publish --access public",
    "release:minor": "npm version minor && npm publish --access public",
    "release:major": "npm version major && npm publish --access public"
  }
}
```

### 一键发布

```bash
# 发布修订版本（1.1.0 → 1.1.1）
npm run release:patch

# 发布次版本（1.1.0 → 1.2.0）推荐本次使用
npm run release:minor

# 发布主版本（1.1.0 → 2.0.0）
npm run release:major
```

---

## 📋 发布检查清单

### 发布前
- [ ] 代码已提交到 Git
- [ ] 所有测试通过
- [ ] 构建成功（`npm run build`）
- [ ] README.md 已更新
- [ ] CHANGELOG.md 已更新
- [ ] 版本号已更新
- [ ] package.json 配置正确

### 发布中
- [ ] 已登录 npm（`npm whoami`）
- [ ] 构建文件已生成
- [ ] 执行 `npm publish --access public`

### 发布后
- [ ] 验证 npm 包信息（`npm info cesium-lite`）
- [ ] 测试安装新版本（`npm install cesium-lite@latest`）
- [ ] 在测试项目中验证功能
- [ ] 创建 GitHub Release
- [ ] 通知用户更新

---

## 🏷️ 创建 GitHub Release

### 步骤 1：推送 tag
```bash
git tag v1.2.0
git push origin v1.2.0
```

### 步骤 2：在 GitHub 创建 Release
1. 访问 `https://github.com/lukeSuperCoder/cesium-lite/releases/new`
2. 选择 tag：`v1.2.0`
3. Release 标题：`v1.2.0 - 统一图层管理与模块重构`
4. 描述内容：

```markdown
## 🎉 v1.2.0 更新内容

### ✨ 新增功能
- **统一图层管理器** - 新增 `LayerManager`，提供统一的图层管理接口
- **独立空间分析模块** - 创建 `analysis/` 目录，集中管理空间分析功能

### 🔄 优化改进
- **模块重命名** - `mark` → `interaction`，更符合 GIS 行业术语
- **目录重构** - 空间分析从 `utils` 移至 `analysis`，结构更清晰
- **代码清理** - 删除空的 `query` 和 `animation` 目录

### ✅ 兼容性
- 完全向后兼容，现有 API 无需修改
- 原有的 `vectorTileLayer` 和 `staticFileLayer` 保持可用

### 📖 文档更新
- 新增 `docs/refactor-summary.md` - 详细重构说明
- 新增 `docs/interaction-rename.md` - 模块重命名说明
- 更新 `docs/FilePackage.md` - 最新项目结构

### 📦 安装
\`\`\`bash
npm install cesium-lite@1.2.0
\`\`\`

### 🔗 链接
- [完整文档](https://github.com/lukeSuperCoder/cesium-lite)
- [在线示例](https://lukesupercoder.github.io/cesium-lite/)
- [npm 包](https://www.npmjs.com/package/cesium-lite)
```

---

## 🔧 常见问题

### 1. 忘记更新版本号就发布了
```bash
# 撤销发布（24小时内）
npm unpublish cesium-lite@1.2.0

# 或者废弃版本
npm deprecate cesium-lite@1.2.0 "版本号错误，请使用 1.2.1"

# 修正后重新发布
npm version patch
npm publish --access public
```

### 2. 发布失败：权限不足
```bash
# 检查登录状态
npm whoami

# 重新登录
npm logout
npm login
```

### 3. 包名已被占用
```bash
# 使用 scoped package（命名空间）
# package.json 修改为：
{
  "name": "@your-username/cesium-lite",
  ...
}

# 发布时：
npm publish --access public
```

### 4. 如何撤销已发布的版本
```bash
# 撤销发布（24小时内）
npm unpublish cesium-lite@1.2.0

# 废弃某版本（推荐）
npm deprecate cesium-lite@1.2.0 "请使用 1.2.1 版本"
```

---

## 📝 最佳实践

### 1. 版本发布流程
```bash
# 1. 确保代码已提交
git status

# 2. 更新版本号并构建
npm version minor

# 3. 推送到 Git
git push && git push --tags

# 4. 发布到 npm
npm publish --access public

# 5. 验证发布
npm info cesium-lite
```

### 2. 使用 .npmignore
创建 `.npmignore` 文件，排除不需要发布的文件：

```
# 源代码
src/
examples/
scripts/

# 开发文件
.env
.vscode/
.claude/
*.log

# 文档（可选）
docs/
CLAUDE.md

# 构建配置
vite.config.js
```

### 3. 指定发布文件（推荐）
在 `package.json` 中使用 `files` 字段：

```json
{
  "files": [
    "dist",
    "README.md",
    "LICENSE",
    "CHANGELOG.md"
  ]
}
```

---

## 🎯 本次更新建议

### 推荐操作流程

```bash
# 1. 创建 CHANGELOG.md
echo "查看上面的 CHANGELOG 模板"

# 2. 更新版本号（1.1.0 → 1.2.0）
npm version minor -m "v%s: 新增统一图层管理器和模块重构"

# 3. 推送到 Git
git push origin main --tags

# 4. 发布到 npm
npm publish --access public

# 5. 创建 GitHub Release
# 访问 GitHub 网页创建 Release

# 6. 验证安装
npm install cesium-lite@latest -g
```

---

## 📚 相关资源

- [npm 官方文档](https://docs.npmjs.com/)
- [语义化版本规范](https://semver.org/lang/zh-CN/)
- [npm 发布教程](https://docs.npmjs.com/cli/v8/commands/npm-publish)
- [package.json 配置详解](https://docs.npmjs.com/cli/v8/configuring-npm/package-json)

---

**当前版本：** 1.1.0
**建议更新至：** 1.2.0
**更新类型：** 次版本（MINOR）- 新增功能，向后兼容
