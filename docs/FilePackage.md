cesium-lite/
├── dist/                          # 编译输出目录，发布后的代码
│   ├── index.js                   # UMD格式的主输出文件
│   ├── index.esm.js               # ES模块格式的输出文件
│   └── style.css                  # 样式文件（如需要）
├── src/                           # 源代码目录
│   ├── core/                      # 核心功能模块
│   │   ├── map.js                 # 地图初始化模块
│   │   ├── viewer.js              # Cesium Viewer 实例管理
│   │   └── config.js              # 配置文件，包含默认地图参数等
│   ├── controls/                  # 地图控件模块
│   │   ├── zoomControl.js         # 缩放控件
│   │   ├── fullscreenControl.js   # 全屏控件
│   │   └── scaleControl.js        # 比例尺控件
│   ├── layers/                    # 图层管理模块
│   │   ├── imageryLayer.js        # 影像图层管理
│   │   ├── vectorLayer.js         # 矢量图层管理
│   │   └── terrainLayer.js        # 地形图层管理
│   ├── markers/                   # 标注与绘制模块
│   │   ├── marker.js              # 标注点功能
│   │   ├── draw.js                # 绘制工具（如点、线、面）
│   │   └── geometryUtils.js       # 几何计算与绘制相关的工具函数
│   ├── camera/                    # 相机控制模块
│   │   ├── cameraControl.js       # 相机视角控制功能
│   │   └── cameraAnimation.js     # 相机动画与过渡效果
│   ├── query/                     # 地理信息查询模块
│   │   ├── queryFeature.js        # 地物查询功能
│   │   └── spatialAnalysis.js     # 空间分析功能（如距离计算、相交分析）
│   ├── animation/                 # 动画与效果模块
│   │   ├── pathAnimation.js       # 路径动画
│   │   └── markerAnimation.js     # 标注动画效果
│   ├── events/                    # 事件监听与自定义事件模块
│   │   ├── eventHandler.js        # 用户交互事件管理
│   │   └── customEvents.js        # 自定义事件与事件派发
│   ├── styles/                    # 样式管理模块
│   │   └── mapStyle.js            # 样式配置与管理
│   └── utils/                     # 工具函数模块
│       └── mathUtils.js           # 数学与几何计算工具函数（如距离计算、坐标转换等）
├── dist/                          # 打包后的文件夹
├── examples/                      # 示例项目，展示如何使用该地图包
│   ├── basicMap.html              # 基本地图示例
│   ├── pathAnimation.html         # 路径动画示例
│   └── queryExample.html          # 查询与空间分析示例
├── docs/                          # 文档文件夹
│   ├── README.md                  # 项目说明文档
│   ├── API.md                     # API文档
│   └── USER_GUIDE.md              # 用户指南
├── package.json                   # npm 包配置文件
├── webpack.config.js              # Webpack配置文件（用于打包）
├── .gitignore                     # Git忽略文件
└── LICENSE                        # 开源协议文件（如MIT）