import {
    CustomDataSource,
    Cartesian3,
    Color,
    Math as CesiumMath,
    Cartographic,
    HeightReference,
    createGuid,
    NearFarScalar,
    VerticalOrigin,
    HorizontalOrigin,
    EntityCluster
} from "cesium";

/**
 * 聚合标记点管理类
 * 支持添加、删除、清空标记点
 * 支持自定义样式和图标
 * 支持标记点聚合功能
 */
class ClusterMarker {
    /**
     * 构造函数
     * @param {Object} viewer Cesium viewer实例
     * @param {Object} options 配置选项
     */
    constructor(viewer, options = {}) {
        if (!viewer) throw new Error('Viewer instance is required');
        this.viewer = viewer;
        this._dataSource = new CustomDataSource("clusterMarkerDataSource");
        this.viewer.dataSources.add(this._dataSource);
        this._markers = new Map(); // 存储所有标记点
        
        // 默认样式配置
        this.defaultStyles = {
            point: {
                color: Color.RED,
                pixelSize: 10,
                outlineColor: Color.WHITE,
                outlineWidth: 2,
                heightReference: HeightReference.CLAMP_TO_GROUND
            },
            billboard: {
                scale: 1.0,
                heightReference: HeightReference.CLAMP_TO_GROUND,
                verticalOrigin: VerticalOrigin.BOTTOM,
                horizontalOrigin: HorizontalOrigin.CENTER,
                scaleByDistance: new NearFarScalar(1.0e2, 1.5, 1.0e5, 0.5)
            },
            label: {
                font: '14px sans-serif',
                fillColor: Color.WHITE,
                outlineColor: Color.BLACK,
                outlineWidth: 2,
                style: 'FILL_AND_OUTLINE',
                heightReference: HeightReference.CLAMP_TO_GROUND,
                verticalOrigin: VerticalOrigin.BOTTOM,
                horizontalOrigin: HorizontalOrigin.CENTER,
                pixelOffset: {x: 0, y: -10}
            },
            cluster: {
                enabled: true,
                pixelRange: 80,         // 聚合像素范围
                minimumClusterSize: 2,  // 最小聚合数量
                clusterBillboards: true,
                clusterLabels: true,
                clusterPoints: true
            }
        };
        
        // 合并用户配置和默认配置
        this.options = {
            styles: {
                point: { ...this.defaultStyles.point, ...(options.styles?.point || {}) },
                billboard: { ...this.defaultStyles.billboard, ...(options.styles?.billboard || {}) },
                label: { ...this.defaultStyles.label, ...(options.styles?.label || {}) },
                cluster: { ...this.defaultStyles.cluster, ...(options.styles?.cluster || {}) }
            }
        };
        
        // 初始化聚合设置
        this._initCluster();
    }
    
    /**
     * 初始化聚合设置
     * @private
     */
    _initCluster() {
        const clusterOptions = this.options.styles.cluster;
        const entityCluster = this._dataSource.clustering;
        
        // 设置聚合参数
        entityCluster.enabled = clusterOptions.enabled;
        entityCluster.pixelRange = clusterOptions.pixelRange;
        entityCluster.minimumClusterSize = clusterOptions.minimumClusterSize;
        entityCluster.clusterBillboards = clusterOptions.clusterBillboards;
        entityCluster.clusterLabels = clusterOptions.clusterLabels;
        entityCluster.clusterPoints = clusterOptions.clusterPoints;
        
        // 自定义聚合样式
        entityCluster.clusterEvent.addEventListener((clusteredEntities, cluster) => {
            const count = clusteredEntities.length;
            
            // 根据数量设置不同大小和颜色
            let bgColor, size;
            if (count >= 50) {
                bgColor = "#D32F2F"; // 更深红色
                size = 36;
            } else if (count >= 20) {
                bgColor = "#E64A19"; // 更深橙色
                size = 32;
            } else if (count >= 10) {
                bgColor = "#7B1FA2"; // 紫色
                size = 28;
            } else {
                bgColor = "#1976D2"; // 更深蓝色
                size = 24;
            }
            
            // 隐藏默认的点和标签
            cluster.point.show = false;
            cluster.label.show = false;
            
            // 使用自定义billboard来代替（一个图像包含圆形背景和文字）
            cluster.billboard.show = true;
            cluster.billboard.image = createClusterImage(count, bgColor, size);
            cluster.billboard.width = size * 2.5;
            cluster.billboard.height = size * 2.5;
            cluster.billboard.disableDepthTestDistance = Number.POSITIVE_INFINITY;
            cluster.billboard.verticalOrigin = VerticalOrigin.CENTER;
            cluster.billboard.horizontalOrigin = HorizontalOrigin.CENTER;
            cluster.billboard.scaleByDistance = new NearFarScalar(1.0e2, 1.0, 2.0e5, 0.6);  // 远处缩放比例提高
        });
        
        /**
         * 创建聚合点图像
         * @param {Number} count 聚合点数量
         * @param {String} backgroundColor 背景颜色
         * @param {Number} size 圆形大小
         * @returns {HTMLCanvasElement} 生成的图像
         * @private
         */
        function createClusterImage(count, backgroundColor, size) {
            // 获取设备像素比以支持高DPI显示
            const devicePixelRatio = window.devicePixelRatio || 1;
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            // 设置画布大小为圆形大小的2.6倍（考虑到边框和阴影）
            const diameter = size * 2.6;
            
            // 使用设备像素比调整画布尺寸，提高清晰度
            const scaledDiameter = diameter * devicePixelRatio;
            canvas.width = scaledDiameter;
            canvas.height = scaledDiameter;
            canvas.style.width = `${diameter}px`;
            canvas.style.height = `${diameter}px`;
            
            // 根据设备像素比缩放上下文
            context.scale(devicePixelRatio, devicePixelRatio);
            
            const centerX = diameter / 2;
            const centerY = diameter / 2;
            const radius = size;
            
            // 开启抗锯齿
            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = 'high';
            
            // 绘制阴影
            context.shadowColor = 'rgba(0, 0, 0, 0.6)';
            context.shadowBlur = 8;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 3;
            
            // 绘制圆形背景 - 使用径向渐变使圆形看起来更立体
            const gradient = context.createRadialGradient(
                centerX, centerY - radius/3, radius/10,
                centerX, centerY, radius
            );
            gradient.addColorStop(0, lightenColor(backgroundColor, 15));
            gradient.addColorStop(1, backgroundColor);
            
            context.beginPath();
            context.arc(centerX, centerY, radius, 0, Math.PI * 2, false);
            context.fillStyle = gradient;
            context.fill();
            
            // 绘制边框
            context.shadowColor = 'transparent'; // 关闭边框阴影
            context.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            context.lineWidth = 2.5;
            context.stroke();
            
            // 设置文本样式 - 放大字体
            const fontSize = Math.max(12, Math.floor(size * 0.8));
            context.fillStyle = '#FFFFFF'; // 统一使用白色文字
            context.font = `bold ${fontSize}px Arial, sans-serif`;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            
            // 文字阴影效果，增强可读性
            context.shadowColor = 'rgba(0, 0, 0, 0.8)';
            context.shadowBlur = 4;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 1;
            
            // 使用特殊技术提高文字锐利度
            context.textRendering = 'geometricPrecision';
            
            // 绘制文本
            context.fillText(count.toString(), centerX, centerY);
            
            return canvas;
        }
        
        /**
         * 使颜色变亮
         * @param {String} color 16进制颜色值
         * @param {Number} percent 变亮百分比
         * @returns {String} 变亮后的颜色
         */
        function lightenColor(color, percent) {
            // 移除#号
            let hex = color.replace('#', '');
            
            // 转换为RGB
            let r = parseInt(hex.substring(0, 2), 16);
            let g = parseInt(hex.substring(2, 4), 16);
            let b = parseInt(hex.substring(4, 6), 16);
            
            // 增加亮度
            r = Math.min(255, Math.round(r * (100 + percent) / 100));
            g = Math.min(255, Math.round(g * (100 + percent) / 100));
            b = Math.min(255, Math.round(b * (100 + percent) / 100));
            
            // 转回16进制
            r = r.toString(16).padStart(2, '0');
            g = g.toString(16).padStart(2, '0');
            b = b.toString(16).padStart(2, '0');
            
            return `#${r}${g}${b}`;
        }
    }

    /**
     * 添加标记点
     * @param {Array|Object} position 位置坐标 [lon, lat, height] 或 Cartesian3对象
     * @param {Object} options 标记点选项
     * @returns {String} 标记点ID
     */
    addMarker(position, options = {}) {
        const id = options.id || createGuid();
        let cartesian;
        // 处理位置参数
        if (Array.isArray(position)) {
            cartesian = Cartesian3.fromDegrees(
                position[0], 
                position[1], 
                position[2] || 0
            );
        } else if (position instanceof Cartesian3) {
            cartesian = position;
        } else {
            throw new Error('Invalid position format');
        }
        
        // 创建实体选项
        const entityOptions = {
            id: id,
            position: cartesian,
            ...options
        };
        
        // 根据选项类型添加不同样式
        if (options.useIcon) {
            // 使用图标
            entityOptions.billboard = {
                image: options.image || 'https://cesium.com/docs/tutorials/creating-entities/images/Cesium_Logo_overlay.png',
                ...this.options.styles.billboard,
                ...(options.billboard || {})
            };
        } else {
            // 使用点
            entityOptions.point = {
                ...this.options.styles.point,
                ...(options.point || {})
            };
        }
        
        // 如果有标签文本，添加标签
        if (options.text) {
            entityOptions.label = {
                text: options.text,
                ...this.options.styles.label,
                ...(options.label || {})
            };
        }
        
        // 添加实体
        const entity = this._dataSource.entities.add(entityOptions);
        this._markers.set(id, entity);
        
        return id;
    }
    
    /**
     * 根据ID获取标记点
     * @param {String} id 标记点ID
     * @returns {Object} 标记点实体
     */
    getMarker(id) {
        return this._markers.get(id);
    }
    
    /**
     * 获取所有标记点
     * @returns {Array} 标记点实体数组
     */
    getAllMarkers() {
        return Array.from(this._markers.values());
    }
    
    /**
     * 移除标记点
     * @param {String} id 标记点ID
     */
    removeMarker(id) {
        if (this._markers.has(id)) {
            const entity = this._markers.get(id);
            this._dataSource.entities.remove(entity);
            this._markers.delete(id);
        }
    }
    
    /**
     * 清空所有标记点
     */
    clearAll() {
        this._dataSource.entities.removeAll();
        this._markers.clear();
    }
    
    /**
     * 定位到标记点
     * @param {String} id 标记点ID
     */
    locateMarker(id) {
        const entity = this.getMarker(id);
        if (entity) {
            this.viewer.zoomTo(entity);
        }
    }
    
    /**
     * 更新标记点样式
     * @param {String} id 标记点ID
     * @param {Object} options 样式选项
     */
    updateMarker(id, options = {}) {
        const entity = this.getMarker(id);
        if (entity) {
            // 更新位置
            if (options.position) {
                if (Array.isArray(options.position)) {
                    entity.position = Cartesian3.fromDegrees(
                        options.position[0],
                        options.position[1],
                        options.position[2] || 0
                    );
                } else if (options.position instanceof Cartesian3) {
                    entity.position = options.position;
                }
            }
            
            // 更新点样式
            if (options.point && entity.point) {
                Object.assign(entity.point, options.point);
            }
            
            // 更新图标样式
            if (options.billboard && entity.billboard) {
                Object.assign(entity.billboard, options.billboard);
            }
            
            // 更新标签样式
            if (options.label && entity.label) {
                Object.assign(entity.label, options.label);
                if (options.text) {
                    entity.label.text = options.text;
                }
            }
        }
    }
    
    /**
     * 设置标记点是否可见
     * @param {String} id 标记点ID
     * @param {Boolean} visible 是否可见
     */
    setMarkerVisibility(id, visible) {
        const entity = this.getMarker(id);
        if (entity) {
            entity.show = visible;
        }
    }
    
    /**
     * 批量添加标记点
     * @param {Array} markers 标记点数据数组，每个元素包含position和options
     * @returns {Array} 添加的标记点ID数组
     */
    addMarkers(markers) {
        if (!Array.isArray(markers)) {
            throw new Error('Markers parameter must be an array');
        }
        
        const addedIds = [];
        for (const marker of markers) {
            const { position, ...options } = marker;
            if (!position) {
                throw new Error('Each marker must have a position property');
            }
            const id = this.addMarker(position, options);
            addedIds.push(id);
        }
        
        return addedIds;
    }
    
    /**
     * 设置聚合参数
     * @param {Object} options 聚合参数选项
     */
    setClusterOptions(options = {}) {
        const entityCluster = this._dataSource.clustering;
        
        // 更新聚合参数
        if (options.enabled !== undefined) entityCluster.enabled = options.enabled;
        if (options.pixelRange !== undefined) entityCluster.pixelRange = options.pixelRange;
        if (options.minimumClusterSize !== undefined) entityCluster.minimumClusterSize = options.minimumClusterSize;
        if (options.clusterBillboards !== undefined) entityCluster.clusterBillboards = options.clusterBillboards;
        if (options.clusterLabels !== undefined) entityCluster.clusterLabels = options.clusterLabels;
        if (options.clusterPoints !== undefined) entityCluster.clusterPoints = options.clusterPoints;
        
        // 更新内部配置
        this.options.styles.cluster = {
            ...this.options.styles.cluster,
            ...options
        };
    }
    
    /**
     * 启用聚合功能
     */
    enableClustering() {
        this._dataSource.clustering.enabled = true;
        this.options.styles.cluster.enabled = true;
    }
    
    /**
     * 禁用聚合功能
     */
    disableClustering() {
        this._dataSource.clustering.enabled = false;
        this.options.styles.cluster.enabled = false;
    }
}

export default ClusterMarker;