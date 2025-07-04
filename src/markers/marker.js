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
    HorizontalOrigin
} from "cesium";

/**
 * 标记点管理类
 * 支持添加、删除、清空标记点
 * 支持自定义样式和图标
 * 仅支持通过数据添加标记点
 */
class MarkerTool {
    /**
     * 构造函数
     * @param {Object} viewer Cesium viewer实例
     * @param {Object} options 配置选项
     */
    constructor(viewer, options = {}) {
        if (!viewer) throw new Error('Viewer instance is required');
        this.viewer = viewer;
        this._dataSource = new CustomDataSource("markerDataSource");
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
            }
        };
        
        // 合并用户配置和默认配置
        this.options = {
            styles: {
                point: { ...this.defaultStyles.point, ...(options.styles?.point || {}) },
                billboard: { ...this.defaultStyles.billboard, ...(options.styles?.billboard || {}) },
                label: { ...this.defaultStyles.label, ...(options.styles?.label || {}) }
            }
        };
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
}

export default MarkerTool;