# CesiumLite 地图包

## 项目简介

CesiumLite 是一个基于 Cesium 的二次开发地图包，旨在封装常见的地图功能模块，便于在多个前端项目中复用。该地图包提供地图初始化、控件、图层管理、标注绘制、空间分析等基础功能。

## 🌐 在线演示

**演示地址：** [https://lukesupercoder.github.io/cesium-lite/](https://lukesupercoder.github.io/cesium-lite/)

**npm仓库地址：** [https://www.npmjs.com/package/cesium-lite](https://www.npmjs.com/package/cesium-lite)

## 功能模块

### 已实现功能

1. **🌍 地图初始化模块**：初始化 Cesium 地图实例，设置基础视图和相关参数
2. **📍 实体管理模块**：支持点、线、面等实体的创建与管理
3. **✏️ 标绘测量模块**：支持绘制和测量功能
4. **🎯 标记点管理模块**：自定义标记点与交互
5. **🗺️ 矢量图层管理模块**：支持WMS、WMTS、ArcGIS、XYZ、TMS、SingleTile、Ion、WFS等多种格式
6. **📂 静态GIS文件图层管理模块**：支持GeoJSON、KML、WKT、SHP等静态文件格式

## 技术栈

- **前端框架：** Vite
- **三维地图引擎：** Cesium.js
- **构建工具：** vite-plugin-cesium
- **部署平台：** GitHub Pages

## 安装与引入

### 1. 通过 npm 安装（推荐）

```bash
npm install cesium-lite
```

### 2. 在项目中引入

```js
import CesiumLite from 'cesium-lite';
import 'cesium-lite/dist/style.css';

// 初始化地图
const cesiumLite = new CesiumLite('cesiumContainer', {
  map: {
    camera: {
      longitude: 116.397428,
      latitude: 39.90923,
      height: 1000000,
      heading: 0,
      pitch: -90,
      roll: 0
    }
  }
});
```

## 典型用法示例

### 1. 添加/切换瓦片图层（参考 tileLayer.html）

```js
const vectorTileLayer = cesiumLite.vectorTileLayer;

// 添加XYZ图层
const xyzId = await vectorTileLayer.addLayer({
  type: 'xyz',
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  options: { alpha: 0.8 }
});

// 切换图层
vectorTileLayer.clearAll();
await vectorTileLayer.addLayer({ type: 'wms', url: 'xxx', options: { layers: 'xxx' } });
```

### 2. 加载静态GIS文件（参考 staticFileLayer.html）

```js
const staticFileLayer = cesiumLite.staticFileLayer;

// 加载GeoJSON
staticFileLayer.addLayer({
  type: 'geojson',
  url: 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json',
  onLoaded: (id, ds, err) => {
    if (err) alert('GeoJSON加载失败');
  }
});

// 加载KML
staticFileLayer.addLayer({
  type: 'kml',
  url: 'https://developers.google.com/kml/documentation/KML_Samples.kml'
});

// 加载WKT
staticFileLayer.addLayer({
  type: 'wkt',
  data: 'POLYGON((116 40,117 40,117 41,116 41,116 40))'
});

// 加载SHP（zip包）
staticFileLayer.addLayer({
  type: 'shp',
  url: 'https://cdn.jsdelivr.net/npm/shpjs@latest/test/zip/world.zip'
});
```

### 3. 图层样式与可见性控制

```js
// 设置填充色
staticFileLayer.updateLayer(layerId, {
  fill: Cesium.Color.RED.withAlpha(0.5)
});

// 设置图层可见性
staticFileLayer.setLayerVisibility(layerId, false);
```

### 4. 实体与标绘（参考 entity.html, draw.html）

```js
// 添加点实体
cesiumLite.entityManager.addEntity({
  position: Cesium.Cartesian3.fromDegrees(116.4, 39.9),
  point: { pixelSize: 10, color: Cesium.Color.YELLOW }
});

// 启动绘制面
cesiumLite.drawTool.draw('Polygon', getDrawData);
```

### 5. Cesium 原生API与本库混用

你可以直接使用 Cesium 官方 API 操作 viewer、entity 等对象，与 CesiumLite 提供的功能无缝结合。

```js
const viewer = cesiumLite.viewer;
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(120, 30, 1000000)
});
```

## 示例页面

- **basicMap.html**：基础地图初始化
- **entity.html**：实体创建和管理
- **draw.html**：绘制和测量功能
- **marker.html**：标记点功能演示
- **tileLayer.html**：瓦片图层管理
- **staticFileLayer.html**：静态文件图层管理

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
