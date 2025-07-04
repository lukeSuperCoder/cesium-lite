# CesiumLite 地图包

## 项目简介

CesiumLite 是一个基于 Cesium 的二次开发地图包，旨在封装常见的地图功能模块，便于在多个前端项目中复用。该地图包提供地图初始化、控件、图层管理、标注绘制、空间分析等基础功能。

## 🌐 在线演示

**演示地址：** [https://lukesupercoder.github.io/cesium-lite/](https://lukesupercoder.github.io/cesium-lite/)

## 功能模块

### 已实现功能

1. **🌍 地图初始化模块**：初始化 Cesium 地图实例，设置基础视图和相关参数
   - 基础地图创建与配置
   - 相机视角控制
   - 地图容器管理

2. **📍 实体管理模块**：支持创建和管理地图上的各种实体
   - 点、线、面实体创建
   - 实体样式自定义
   - 实体属性管理

3. **✏️ 标绘测量模块**：支持绘制和测量功能
   - 几何图形绘制（点、线、面）
   - 距离测量
   - 面积计算
   - 绘制样式设置

4. **🎯 标记点管理模块**：提供标记点的创建和管理功能
   - 自定义标记点
   - 标记点样式设置
   - 标记点交互事件

5. **🗺️ 矢量图层管理模块**：支持矢量图层的添加和管理
   - 矢量图层加载
   - 图层样式控制
   - 图层切换功能

6. **📂 静态GIS文件图层管理模块**：支持多种静态GIS文件的加载与管理
   - 支持 GeoJSON、KML、WKT、SHP 等静态文件格式的加载
   - 支持图层的添加、删除、清空、可见性控制
   - 支持图层填充色样式动态调整
   - 支持加载完成回调事件，便于业务处理
   - 示例页面：`staticFileLayer.html`

### 开发中功能

6. **📷 相机控制模块**：支持动态调整地图视角，飞行到指定位置等功能
7. **🔍 地理信息查询模块**：支持空间数据的检索和交互
8. **✨ 动画与效果模块**：支持地图上的动画和效果展示
9. **📊 空间分析模块**：提供空间数据分析功能
10. **🎛️ 地图控件模块**：提供交互控件，如缩放、平移、全屏、比例尺、导航控件等
11. **📡 事件监听与自定义事件模块**：支持自定义事件的监听与触发
12. **🎨 用户配置与样式模块**：支持地图样式和配置的定制化管理

## 技术栈

- **前端框架：** Vite
- **三维地图引擎：** Cesium.js
- **构建工具：** vite-plugin-cesium
- **部署平台：** GitHub Pages

## 使用方法

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建项目
npm run build

# 部署到 GitHub Pages
npm run deploy
```

### 在 HTML 中引入

在 HTML 文件中使用以下方式引入：

```html
<!-- 引入 Cesium 样式 -->
<link href="/cesium-lite/Cesium/Widgets/widgets.css" rel="stylesheet">

<!-- 引入 Cesium 脚本 -->
<script src="/cesium-lite/Cesium/Cesium.js"></script>

<!-- 引入你的地图包 -->
<script src="src/index.js"></script>
```

### 在 JavaScript 中使用

```javascript
import CesiumLite from './index.js';

// 初始化地图
const cesiumLite = new CesiumLite('cesiumContainer', { 
    // 配置选项
});

// 添加实体
cesiumLite.addEntity({
    position: Cesium.Cartesian3.fromDegrees(-75.0, 40.0),
    point: {
        pixelSize: 10,
        color: Cesium.Color.YELLOW
    }
});

// 绘制功能
cesiumLite.startDrawing('polygon', {
    style: {
        material: Cesium.Color.RED.withAlpha(0.5)
    }
});
```

## 示例页面

项目包含多个功能演示页面：

- **创建地图** (`basicMap.html`) - 基础地图初始化
- **创建实体** (`entity.html`) - 实体创建和管理
- **标绘测量** (`draw.html`) - 绘制和测量功能
- **标记点管理** (`marker.html`) - 标记点功能演示
- **矢量图层管理** (`tileLayer.html`) - 图层管理功能
- **静态文件图层管理** (`staticFileLayer.html`) - 加载和管理GeoJSON、KML、WKT、SHP等静态文件

## 项目结构

```
cesium-lite/
├── src/                    # 源代码目录
├── examples/               # 示例页面
│   ├── basicMap.html      # 基础地图示例
│   ├── entity.html        # 实体管理示例
│   ├── draw.html          # 绘制功能示例
│   ├── marker.html        # 标记点示例
│   ├── tileLayer.html     # 图层管理示例
│   ├── staticFileLayer.html # 静态文件图层示例
│   └── image/             # 示例图片资源
├── public/                 # 静态资源
├── dist/                   # 构建输出目录
├── vite.config.js         # Vite 配置
└── package.json           # 项目配置
```

## 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目！

## 许可证

MIT License

## 作者

**lukeSuperCoder** - [GitHub](https://github.com/lukeSuperCoder)

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
