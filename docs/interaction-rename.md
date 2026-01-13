# mark → interaction 模块重命名说明

> 更新日期：2026-01-13
> 重构目的：优化模块命名，使其更加语义化和专业

---

## 📝 重命名原因

### 问题分析
原模块名 `mark` 的问题：
- ❌ 命名不够准确 - "mark" 在英文中更偏向"标记"的含义
- ❌ 语义不够明确 - 无法准确反映模块的交互性质
- ❌ 不符合 GIS 行业惯例 - 交互操作通常称为 "interaction"

### 解决方案
采用 `interaction` 作为新的模块名：
- ✅ **语义准确** - "interaction" 准确描述了用户与地图的交互操作
- ✅ **符合行业标准** - GIS 领域通常用 "interaction" 表示地图交互功能
- ✅ **易于理解** - 更直观地传达模块功能（绘制、测量等交互操作）
- ✅ **便于扩展** - 未来可添加更多交互功能（编辑、选择、拖拽等）

---

## 🔄 变更内容

### 1. 目录结构变更

**重构前：**
```
src/mark/
├── draw.js       # 绘制工具
└── measure.js    # 测量工具
```

**重构后：**
```
src/interaction/
├── draw.js       # 绘制工具
└── measure.js    # 测量工具
```

### 2. 代码变更

#### src/index.js
```javascript
// 变更前
import DrawTool from './mark/draw';
import MeasureTool from './mark/measure';

// 变更后
import DrawTool from './interaction/draw';
import MeasureTool from './interaction/measure';
```

### 3. 文档变更

已更新以下文档：
- ✅ [docs/FilePackage.md](./FilePackage.md) - 项目结构文档
- ✅ [docs/refactor-summary.md](./refactor-summary.md) - 重构总结文档

---

## 🎯 模块功能说明

`interaction` 模块负责处理**用户与地图的交互操作**：

### 当前功能
- **DrawTool (draw.js)** - 绘制工具
  - 绘制点 (Point)
  - 绘制线 (Polyline)
  - 绘制面 (Polygon)
  - 支持自定义样式
  - 支持回调机制

- **MeasureTool (measure.js)** - 测量工具
  - 距离测量
  - 面积测量
  - 实时显示测量结果

### 规划中的功能（未来扩展）
- **drawShapes.js** - 扩展绘制工具
  - 圆形/椭圆绘制
  - 矩形绘制
  - 箭头线绘制
  - 曲线绘制

- **textLabel.js** - 文本标注工具
  - 添加文本标注
  - 自定义字体样式
  - 标注拖拽

- **featureSelect.js** - 要素选择工具
  - 点选
  - 框选
  - 多边形选择

---

## 💡 使用示例

### 绘制工具

```javascript
import CesiumLite from 'cesium-lite';

const cesiumLite = new CesiumLite('container');

// 绘制点
cesiumLite.drawTool.draw('point', (result) => {
    console.log('绘制完成:', result);
});

// 绘制线
cesiumLite.drawTool.draw('polyline', (result) => {
    console.log('绘制完成:', result);
});

// 绘制面
cesiumLite.drawTool.draw('polygon', (result) => {
    console.log('绘制完成:', result);
});
```

### 测量工具

```javascript
// 测量距离
cesiumLite.measureTool.measureDistance((result) => {
    console.log('距离:', result.distance, '米');
});

// 测量面积
cesiumLite.measureTool.measureArea((result) => {
    console.log('面积:', result.area, '平方米');
});
```

---

## ✅ 向后兼容性

**重要说明：** 此次重构**不影响 API 调用**！

用户使用的 API 保持完全不变：
```javascript
// API 调用方式没有任何变化
cesiumLite.drawTool.draw(...)
cesiumLite.measureTool.measureDistance(...)
```

**内部变更：** 仅仅是源码文件的目录路径发生了变化
- 原路径：`src/mark/draw.js`
- 新路径：`src/interaction/draw.js`

**对用户的影响：** **零影响** ✅
- 不需要修改任何代码
- 不需要升级依赖
- 完全透明的重构

---

## 📊 重构验证

### 构建测试
```bash
npm run build
# ✅ 构建成功
```

### 模块测试
```bash
npm run dev
# ✅ 开发服务器启动成功
# ✅ 示例页面正常运行
```

### 功能测试
- ✅ draw.js 正常工作
- ✅ measure.js 正常工作
- ✅ 所有示例页面正常显示

---

## 🔮 未来规划

`interaction` 模块将持续扩展，计划添加以下功能：

### 短期（P1）
1. **扩展绘制工具**
   - 圆形/椭圆绘制
   - 矩形绘制
   - 箭头/曲线绘制

2. **文本标注工具**
   - 添加文本标注
   - 支持富文本样式

### 中期（P2）
3. **要素编辑功能**
   - 拖拽顶点编辑
   - 添加/删除顶点
   - 图形变形

4. **要素选择工具**
   - 点选、框选、圈选
   - 多选支持
   - 选中高亮

### 长期（P3）
5. **高级交互功能**
   - 图形吸附
   - 拓扑关系检查
   - 撤销/重做

---

## 📖 相关文档

- [项目结构文档](./FilePackage.md)
- [重构总结文档](./refactor-summary.md)
- [开发指南](../CLAUDE.md)

---

**更新时间：** 2026-01-13
**影响范围：** 源码结构
**API 兼容性：** ✅ 100% 兼容
**用户影响：** ✅ 零影响
