# npm 包更新快速参考

## 🚀 一键发布命令

```bash
# 发布修订版本（1.2.0 → 1.2.1）- Bug 修复
npm run release:patch

# 发布次版本（1.2.0 → 1.3.0）- 新增功能
npm run release:minor

# 发布主版本（1.2.0 → 2.0.0）- 破坏性变更
npm run release:major
```

## 📋 发布前检查

```bash
# 1. 检查当前版本
npm view cesium-lite version

# 2. 检查登录状态
npm whoami

# 3. 测试构建
npm run build

# 4. 检查 Git 状态
git status
```

## 📝 常用命令

### npm 登录
```bash
npm login
# 输入用户名、密码、邮箱
```

### 查看包信息
```bash
npm info cesium-lite
npm view cesium-lite version
npm view cesium-lite versions
```

### 本地测试
```bash
# 方式一：npm link
npm link                    # 在 cesium-lite 目录
npm link cesium-lite        # 在测试项目目录

# 方式二：本地安装
npm install ../cesium-lite
```

### 撤销发布（24小时内）
```bash
npm unpublish cesium-lite@1.2.0
```

### 废弃版本
```bash
npm deprecate cesium-lite@1.2.0 "请使用 1.2.1"
```

## 🔢 版本号规则

```
主版本号.次版本号.修订号
    ↓       ↓       ↓
    1   .   2   .   0
```

| 变更类型 | 更新 | 示例 |
|---------|------|------|
| Bug 修复 | PATCH | 1.2.0 → 1.2.1 |
| 新增功能 | MINOR | 1.2.0 → 1.3.0 |
| 破坏性变更 | MAJOR | 1.2.0 → 2.0.0 |

## 📦 发布文件

### 当前配置
package.json 未指定 `files` 字段，默认发布所有文件（除了 .gitignore 和 .npmignore 中的）

### 建议添加（可选）
```json
{
  "files": [
    "dist",
    "src",
    "README.md",
    "LICENSE",
    "CHANGELOG.md"
  ]
}
```

## 🏷️ GitHub Release

### 创建步骤
1. 访问：https://github.com/lukeSuperCoder/cesium-lite/releases/new
2. 选择 tag（自动创建）
3. 填写标题和说明
4. 发布

### Release 标题模板
```
v1.2.0 - 统一图层管理与模块重构
```

### Release 说明模板
```markdown
## 🎉 v1.2.0 更新内容

### ✨ 新增功能
- 统一图层管理器
- 独立空间分析模块

### 🔄 优化改进
- 模块重命名
- 目录重构

### ✅ 兼容性
- 完全向后兼容

### 📦 安装
\`\`\`bash
npm install cesium-lite@1.2.0
\`\`\`
```

## ⚠️ 注意事项

1. **发布前必须测试** - 运行 `npm run build` 确保构建成功
2. **确保代码已提交** - 所有修改都应该提交到 Git
3. **检查登录状态** - 运行 `npm whoami` 确认已登录
4. **版本号选择** - 根据变更类型选择合适的版本号
5. **更新文档** - 发布前更新 README 和 CHANGELOG
6. **24小时限制** - npm unpublish 只能在发布后24小时内使用
7. **tag 命名** - Git tag 建议使用 `v` 前缀，如 `v1.2.0`

## 🔗 相关链接

- [npm 官方文档](https://docs.npmjs.com/)
- [语义化版本规范](https://semver.org/lang/zh-CN/)
- [Keep a Changelog](https://keepachangelog.com/zh-CN/)
- [npm 包地址](https://www.npmjs.com/package/cesium-lite)
- [GitHub 仓库](https://github.com/lukeSuperCoder/cesium-lite)
