# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

CesiumLite 是一个基于 Cesium.js 的轻量级封装库，为常见的三维地图功能提供简化的 API。它被设计为可在多个前端项目中复用的开箱即用的地图功能模块。

**主要语言**: JavaScript (ES6+)
**构建工具**: Vite 2.5.6
**核心依赖**: Cesium 1.127.0

## 常用命令

### 开发
```bash
npm run dev          # 启动开发服务器，运行在 8020 端口
```

### 构建与部署
```bash
npm run build        # 构建生产版本到 dist/ 目录
npm run serve        # 构建并在本地预览
npm run deploy       # 构建、修复路径并部署到 GitHub Pages
npm run fix-paths    # 修复 GitHub Pages 部署时的 Cesium 资源路径
```

### 测试
当前项目未配置测试框架。

## 开发辅助命令（Claude Code Skills）

项目配置了自定义 AI 辅助命令（Skills），帮助提升开发效率。这些命令通过 Claude Code 调用。

### `/plugin-analysis` - 插件需求分析工具

**功能**：对地图功能插件进行系统化的需求分析，生成结构化的需求文档。

**使用场景**：在开发新功能插件前，使用此命令进行全面的需求分析和技术设计规划。

**使用方式**：
```bash
/plugin-analysis <功能插件名称>
```

**示例**：
```bash
/plugin-analysis 地形裁剪功能
/plugin-analysis 三维测量工具
/plugin-analysis 图层切换器
/plugin-analysis 飞行漫游
```

**工作流程**：
1. **基础信息收集** - 通过交互式问答收集插件的基本信息（功能概述、应用场景、功能范围）
2. **技术设计分析** - 分析技术可行性、依赖的 Cesium API、性能考量、技术风险
3. **API 设计规划** - 设计类结构、公共方法、配置选项、事件回调
4. **实现方案设计** - 规划核心实现思路、状态管理、资源管理、错误处理
5. **示例页面规划** - 设计演示页面的 UI 和功能点
6. **开发规划** - 制定开发步骤、评估工作量、识别风险挑战

**输出文档**：
- 保存路径：`docs/需求分析/[插件名称]-需求分析.md`
- 文档包含：功能概述、应用场景、技术方案、API 设计、开发规划、验收标准等完整章节

**使用建议**：
- ✅ **开发前必用**：在开始编码前先进行需求分析，避免设计缺陷
- ✅ **团队协作**：需求文档可作为技术评审和团队讨论的依据
- ✅ **指导开发**：按照需求文档进行开发，确保实现完整性
- ✅ **文档留存**：作为项目知识库的一部分，便于后续维护

---

### `/juejin-blog` - 掘金技术博客生成器

**功能**：为 CesiumLite 项目的功能模块自动生成掘金风格的技术博客文章。

**使用场景**：功能开发完成后，使用此命令生成技术博客用于推广和介绍项目功能。

**使用方式**：
```bash
/juejin-blog <功能模块名称>
```

**示例**：
```bash
/juejin-blog 图层切换器模块
/juejin-blog 地形裁剪功能
/juejin-blog 三维分析工具
```

**工作流程**：
1. **信息收集** - 询问模块的基本信息、源码路径、示例页面路径
2. **代码分析** - 阅读模块源码，理解核心实现和 API 设计
3. **内容创作** - 按照掘金博客模板编写文章（痛点分析 → 解决方案 → 使用教程）
4. **文档保存** - 保存到 `docs/juejin/` 目录

**输出文档**：
- 保存路径：`docs/juejin/CesiumLite-[模块名称]介绍.md`
- 文章结构：标题、摘要、前言、在线演示、痛点分析、解决方案、核心代码、使用教程、快速开始、总结

**博客特点**：
- 突出开发痛点和解决方案对比
- 包含完整的代码示例和使用教程
- 提供在线演示链接和项目地址
- 符合掘金平台的写作风格和排版规范

**使用建议**：
- ✅ **功能完成后生成**：确保功能已开发完成并测试通过
- ✅ **提供清晰的示例**：示例页面应包含完整的功能演示
- ✅ **强调实用性**：突出功能的实际应用价值
- ✅ **配合需求文档**：可结合 `/plugin-analysis` 生成的需求文档进行内容创作

---

### 推荐工作流程

完整的功能开发流程应该是：

```mermaid
graph LR
    A[需求分析] --> B[开发实现] --> C[测试验证] --> D[文档推广]
    A1[/plugin-analysis] --> A
    B1[参考需求文档编码] --> B
    C1[创建示例页面] --> C
    D1[/juejin-blog] --> D
```

**具体步骤**：

1. **规划阶段** 📋
   ```bash
   # 创建功能分支
   git checkout -b feature-xxx

   # 执行需求分析
   /plugin-analysis 功能名称

   # 查看生成的需求文档
   # docs/需求分析/功能名称-需求分析.md
   ```

2. **开发阶段** 💻
   ```bash
   # 按照需求文档创建插件文件
   # src/[模块分类]/[文件名].js

   # 在 src/index.js 中集成模块

   # 创建示例页面
   # examples/[示例名].html

   # 更新 vite.config.js 添加示例入口
   ```

3. **测试阶段** 🧪
   ```bash
   # 启动开发服务器
   npm run dev

   # 在浏览器中测试示例页面
   # http://localhost:8020/examples/[示例名].html
   ```

4. **发布阶段** 🚀
   ```bash
   # 生成技术博客
   /juejin-blog 功能名称

   # 查看生成的博客文章
   # docs/juejin/CesiumLite-功能名称介绍.md

   # 提交代码
   git add .
   git commit -m "feat: 添加[功能名称]"
   git push origin feature-xxx
   ```

---

### Skills 配置文件

自定义 Skills 的配置文件位于：
- `.claude/skills/plugin-analysis.md` - 需求分析工具配置
- `.claude/skills/juejin-blog.md` - 技术博客生成器配置

如需自定义 Skills 行为，可直接修改这些配置文件。

## 开发规范

### Git 分支管理
开发新功能模块插件时，必须先创建新的 Git 分支：
```bash
# 功能开发分支命名规范
git checkout -b feature-xxx

# 示例
git checkout -b feature-layer-switcher     # 图层切换器功能
git checkout -b feature-3d-analysis        # 三维分析功能
git checkout -b feature-terrain-clip       # 地形裁剪功能
```

### 插件开发规范
开发插件时必须遵循**类的写法**，参考现有插件的架构模式：

#### 1. 创建管理类
在对应的功能目录下创建管理类文件，例如：

```javascript
// src/newModule/newFeature.js
import { Viewer } from 'cesium';

/**
 * 新功能管理类
 * 功能描述...
 */
class NewFeature {
    /**
     * 构造函数
     * @param {Viewer} viewer - Cesium viewer 实例
     * @param {Object} options - 配置选项
     */
    constructor(viewer, options = {}) {
        if (!viewer) throw new Error('Viewer instance is required');
        this.viewer = viewer;

        // 默认配置
        this.defaultOptions = {
            // 默认选项...
            ...options
        };

        // 初始化内部状态
        this._internalState = new Map();
    }

    /**
     * 公开方法
     */
    publicMethod(params) {
        // 实现逻辑...
    }

    /**
     * 清理方法
     */
    destroy() {
        // 清理资源...
    }
}

export default NewFeature;
```

#### 2. 在主入口引入并实例化
在 [src/index.js](src/index.js) 中导入新模块并实例化：

```javascript
// 1. 导入模块
import NewFeature from './newModule/newFeature';

// 2. 在构造函数中实例化
constructor(containerId, options={}) {
    // ... 其他初始化代码

    // 初始化新功能模块
    this.newFeature = new NewFeature(this.mapCore.viewer, this.options.map.newFeature);
}
```

#### 3. 参考现有插件写法
- **图层管理类**：参考 [src/layers/staticFileLayer.js](src/layers/staticFileLayer.js) 或 [src/layers/vectorTileLayer.js](src/layers/vectorTileLayer.js)
  - 使用 `Map()` 存储实例
  - 提供 `addXxx()`, `removeXxx()`, `clearAll()` 等方法
  - 支持 ID 管理和配置合并

- **控件类**：参考 [src/controls/zoomControl.js](src/controls/zoomControl.js)
  - 提供 `.show()`, `.hide()`, `.setPosition()` 方法
  - 使用 DOM 操作创建 UI 元素

- **工具类**：参考 [src/mark/draw.js](src/mark/draw.js)
  - 使用 `ScreenSpaceEventHandler` 处理交互
  - 提供回调函数机制
  - 实现资源清理方法

### 示例页面规范
开发完插件后，**必须**在 [examples/](examples/) 文件夹创建对应的示例页面：

#### 1. 创建示例 HTML 文件
```bash
# 在 examples/ 目录下创建
examples/newFeature.html
```

#### 2. 示例页面模板
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>新功能示例 - CesiumLite</title>
    <style>
        #cesiumContainer {
            width: 100%;
            height: 100vh;
            margin: 0;
            padding: 0;
        }
    </style>
</head>
<body>
    <div id="cesiumContainer"></div>

    <script type="module">
        import CesiumLite from '../src/index.js';

        // 初始化地图
        const cesiumLite = new CesiumLite('cesiumContainer', {
            map: {
                camera: {
                    longitude: 116.397428,
                    latitude: 39.90923,
                    height: 1000000
                }
            }
        });

        // 演示新功能的使用
        const newFeature = cesiumLite.newFeature;

        // 示例代码...
    </script>
</body>
</html>
```

#### 3. 在 Vite 配置中添加入口
在 [vite.config.js](vite.config.js) 的 `rollupOptions.input` 中添加新的示例页面：

```javascript
rollupOptions: {
    input: {
        main: resolve(__dirname, 'index.html'),
        basicMap: resolve(__dirname, 'examples/basicMap.html'),
        // ... 其他示例
        newFeature: resolve(__dirname, 'examples/newFeature.html'),  // 新增
    }
}
```

#### 4. 示例页面要求
- 必须包含清晰的功能演示
- 添加必要的 UI 按钮和交互控制
- 提供代码注释说明关键步骤
- 演示主要 API 的使用方法
- 展示错误处理和边界情况

### 代码风格规范
- 使用 ES6+ 语法
- 类名使用大驼峰命名法（PascalCase）
- 方法名使用小驼峰命名法（camelCase）
- 私有属性使用下划线前缀（如 `_layers`）
- 添加 JSDoc 注释说明参数和返回值
- 构造函数中必须验证 viewer 参数是否存在

## 架构设计

### 入口文件
[src/index.js](src/index.js) - 主要的 CesiumLite 类，实例化并暴露所有模块管理器。

### 核心架构模式
本库采用**模块化管理器模式**，每个功能区域都封装在一个专门的管理器类中：

- **MapCore** ([src/core/map.js](src/core/map.js)) - 创建 Cesium Viewer 实例
- **模块管理器** - 接收 viewer 实例并提供专注功能的专用类

所有管理器在 [src/index.js](src/index.js) 中实例化，并作为 CesiumLite 实例的属性暴露。

### 模块分类

#### 1. 核心模块
- [src/core/map.js](src/core/map.js) - 使用配置初始化 Cesium Viewer
- [src/core/config.js](src/core/config.js) - 全局配置（Cesium Ion token）

#### 2. 相机控制
- [src/camera/cameraControl.js](src/camera/cameraControl.js) - flyTo, setView, getPosition, setOrientation, move, rotate
- [src/camera/cameraAnimation.js](src/camera/cameraAnimation.js) - 相机动画工具

#### 3. UI 控件
- [src/controls/fullscreenControl.js](src/controls/fullscreenControl.js) - 全屏切换
- [src/controls/zoomControl.js](src/controls/zoomControl.js) - 放大/缩小按钮
- [src/controls/scaleControl.js](src/controls/scaleControl.js) - 地图比例尺
- [src/basemap/basemapControl.js](src/basemap/basemapControl.js) - 底图切换

所有控件都支持 `.show()`, `.hide()`, `.setPosition()` 方法。

#### 4. 图层管理
两个独立的图层管理器处理不同的数据源：

**VectorTileLayer** ([src/layers/vectorTileLayer.js](src/layers/vectorTileLayer.js))
- 管理瓦片影像服务：WMS、WMTS、ArcGIS MapServer、XYZ、TMS、SingleTile、Ion
- 使用 Cesium ImageryLayer API
- 返回图层 ID 用于管理

**StaticFileLayer** ([src/layers/staticFileLayer.js](src/layers/staticFileLayer.js))
- 管理静态矢量文件格式：GeoJSON、KML、WKT、SHP（通过 shpjs）
- 使用 Cesium DataSource API（GeoJsonDataSource、KmlDataSource）
- 支持 URL 和内联数据
- 提供异步回调模式 `onLoaded(id, dataSource, error)`

#### 5. 标绘与测量
**DrawTool** ([src/mark/draw.js](src/mark/draw.js))
- 交互式绘制点、线、面
- 使用 CustomDataSource 存储实体
- 基于 ScreenSpaceEventHandler 的事件驱动架构
- 回调返回绘制的几何坐标

**MeasureTool** ([src/mark/measure.js](src/mark/measure.js))
- 距离测量（线）
- 面积测量（多边形）
- 实时显示测量结果标签

#### 6. 实体管理
- [src/entity/entityManager.js](src/entity/entityManager.js) - Cesium 实体的增删改查操作
- [src/entity/entityWrapper.js](src/entity/entityWrapper.js) - 实体操作的包装类

#### 7. 标记点
- [src/markers/marker.js](src/markers/marker.js) - 单个标记点管理
- [src/markers/clusterMarker.js](src/markers/clusterMarker.js) - 聚合标记点支持
- [src/markers/markerAnimation.js](src/markers/markerAnimation.js) - 标记点动画

#### 8. 工具类
- [src/utils/spatialAnalysis.js](src/utils/spatialAnalysis.js) - 空间分析函数
- [src/utils/geometryUtils.js](src/utils/geometryUtils.js) - 几何计算工具

### 配置系统

CesiumLite 使用**深度合并策略**处理配置：
1. 构造函数中定义的默认选项
2. 用户传递给构造函数的选项
3. 传递给各个方法的模块特定选项

[src/index.js](src/index.js) 中的 `deepMerge()` 方法递归合并配置对象，允许用户仅覆盖特定属性，同时保持默认值不变。

### 全局暴露

该库将实例全局暴露，用于调试和直接访问：
```javascript
window.cesiumInstance  // CesiumLite 实例
window.Cesium          // Cesium 库
window.CesiumLite      // 构造函数类
```

## 示例演示

[examples/](examples/) 目录包含每个模块的 HTML 演示：
- [examples/basicMap.html](examples/basicMap.html) - 基础地图初始化
- [examples/entity.html](examples/entity.html) - 实体管理
- [examples/draw.html](examples/draw.html) - 绘制和测量
- [examples/marker.html](examples/marker.html) - 标记点管理
- [examples/tileLayer.html](examples/tileLayer.html) - 矢量瓦片图层
- [examples/staticFileLayer.html](examples/staticFileLayer.html) - 静态文件图层
- [examples/camera.html](examples/camera.html) - 相机控制

所有示例在 [vite.config.js](vite.config.js) 中配置为独立的入口点，并构建为单独的 HTML 页面。

## 构建配置

### Vite 设置
- 使用 `vite-plugin-cesium` 处理 Cesium 资源打包
- 多页面应用，index.html 和所有示例页面都有独立入口
- 基础路径通过 `VITE_BASE` 环境变量配置（.env 文件）
- 开发服务器运行在 8020 端口

### 部署流程
1. `npm run build` - Vite 构建到 dist/
2. `npm run fix-paths` - 后构建脚本修复 GitHub Pages 的 Cesium 资源路径
3. `gh-pages -d dist` - 将 dist/ 文件夹部署到 gh-pages 分支

[scripts/fix-paths.js](scripts/fix-paths.js) 脚本将 HTML 文件中的 `/cesium-lite/cesium/` 替换为 `/cesium-lite/cesium-lite/cesium/`，以适应 GitHub Pages 的 URL 结构。

## 依赖项

### 生产依赖
- **shpjs** (^6.1.0) - 在浏览器中解析 Shapefile zip 压缩包
- **terraformer-wkt-parser** (^1.2.1) - 解析 Well-Known Text (WKT) 几何字符串

### 开发依赖
- **cesium** (^1.127.0) - 三维地球和地图引擎
- **vite** (^2.5.6) - 构建工具
- **vite-plugin-cesium** (^1.2.9) - Cesium 的 Vite 插件
- **gh-pages** (^6.3.0) - 发布到 GitHub Pages

## 关键实现模式

### 图层 ID 管理
两个图层管理器都使用 `Map()` 存储图层引用，使用自动生成的 ID：
```javascript
const layerId = id || `layer_${Date.now()}_${Math.floor(Math.random()*10000)}`;
```

### 异步图层加载
StaticFileLayer 使用异步回调模式，立即返回图层 ID，但异步加载数据：
```javascript
addLayer(config) {
  const layerId = generateId();
  // 异步立即执行函数表达式
  (async () => {
    try {
      const dataSource = await load(config);
      config.onLoaded?.(layerId, dataSource, null);
    } catch (error) {
      config.onLoaded?.(layerId, null, error);
    }
  })();
  return layerId;
}
```

### 绘制事件流程
DrawTool 使用状态机模式：
1. `draw(type, callback)` - 初始化处理器和数据源
2. LEFT_CLICK - 将位置添加到数组
3. MOUSE_MOVE - 使用当前鼠标位置更新临时实体
4. RIGHT_CLICK - 完成绘制，调用回调，清理资源
5. 绘制期间光标变为十字准星

### 样式配置
每个模块接受一个 `styles` 或 `options` 参数，使用对象展开与默认值合并：
```javascript
const finalOptions = { ...this.defaultOptions, ...options, ...rest };
```

## 重要说明

- **Cesium Ion Token**：在 [src/core/config.js](src/core/config.js) 中配置，Ion 影像和地形需要此 token。
- **无 TypeScript**：这是纯 JavaScript 项目，没有类型定义或 TypeScript 编译。
- **无测试**：未配置测试框架，通过示例页面进行手动测试。
- **中文文档**：README 和文档为中文，代码注释中英文混合。
- **直接访问 Cesium**：用户可以通过 `cesiumLite.viewer` 访问 Cesium 原生 API，与 CesiumLite 的抽象一起使用。
