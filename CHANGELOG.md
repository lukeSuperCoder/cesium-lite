# 更新日志

所有重要的项目更改都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [1.2.0] - 2026-01-13

### ✨ 新增
- **统一图层管理器** - 新增 `LayerManager` 类，提供统一的图层管理接口
  - 支持所有类型图层的统一添加、删除、显示/隐藏
  - 自动识别图层类型（瓦片图层/静态文件图层）
  - 支持图层透明度调整
  - 详见 [examples/layerManager.html](examples/layerManager.html)

- **独立空间分析模块** - 创建 `src/analysis/` 目录
  - 集中管理空间分析功能（距离、面积、缓冲区、相交分析）
  - 模块职责更加清晰

### 🔄 优化
- **模块重命名** - `mark` → `interaction`
  - 更符合 GIS 行业术语
  - 更准确地描述模块功能（用户与地图的交互操作）
  - 包含绘制工具和测量工具

- **目录结构重构**
  - 空间分析模块从 `src/utils/spatialAnalysis.js` 移至 `src/analysis/spatialAnalysis.js`
  - 删除空的 `src/query/` 目录
  - 删除空的 `src/animation/` 目录

- **代码质量提升**
  - 清理冗余代码和空文件
  - 优化模块命名，语义更加清晰
  - 完善项目文档

### 📖 文档
- 新增 `docs/refactor-summary.md` - 详细的重构总结文档
- 新增 `docs/interaction-rename.md` - 模块重命名说明
- 新增 `docs/npm-publish-guide.md` - npm 包发布指南
- 更新 `docs/FilePackage.md` - 最新的项目结构

### ✅ 兼容性
- **完全向后兼容** - 所有现有 API 无需修改
- 原有的 `vectorTileLayer` 和 `staticFileLayer` 保持可用
- 用户代码零影响，平滑升级

### 🔗 相关链接
- [统一图层管理示例](examples/layerManager.html)
- [重构总结文档](docs/refactor-summary.md)
- [项目结构文档](docs/FilePackage.md)

---

## [1.1.0] - 2024-XX-XX

### 新增
- 基础地图初始化功能
- 相机控制模块
- UI 控件系统（缩放、全屏、比例尺）
- 底图切换功能
- 绘制与测量工具
- 实体管理功能
- 标记点管理（普通标记点和聚合标记点）
- 图层管理（矢量瓦片图层和静态文件图层）
- 空间分析工具
- 事件管理系统

### 文档
- 项目 README
- 基础示例页面
- API 使用说明

---

## [1.0.0] - 2024-XX-XX

### 新增
- 项目初始化
- 基于 Cesium 的地图封装
- Vite 构建配置
- GitHub Pages 部署配置

---

## 版本说明

### 版本号格式：主版本号.次版本号.修订号

- **主版本号（MAJOR）**：不兼容的 API 修改
- **次版本号（MINOR）**：向下兼容的功能性新增
- **修订号（PATCH）**：向下兼容的问题修正

### 图例
- ✨ 新增功能
- 🔄 优化改进
- 🐛 问题修复
- 📖 文档更新
- ⚠️ 废弃功能
- 🗑️ 移除功能
- 🔒 安全修复
- ✅ 兼容性说明
