import VectorTileLayer from './vectorTileLayer';
import StaticFileLayer from './staticFileLayer';

/**
 * 统一图层管理器
 * 提供统一的API接口管理所有类型的图层（栅格瓦片、矢量文件）
 * 内部自动识别图层类型并分发到对应的管理器
 */
class LayerManager {
    /**
     * 构造函数
     * @param {Object} viewer Cesium viewer实例
     * @param {Object} options 全局配置选项
     */
    constructor(viewer, options = {}) {
        if (!viewer) throw new Error('Viewer instance is required');
        this.viewer = viewer;

        // 初始化两个子管理器
        this.vectorTileLayer = new VectorTileLayer(viewer, options.vectorTile || {});
        this.staticFileLayer = new StaticFileLayer(viewer, options.staticFile || {});

        // 存储图层类型映射
        this._layerTypeMap = new Map(); // layerId -> 'vectorTile' | 'staticFile'
    }

    /**
     * 添加图层（统一接口）
     * 根据图层类型自动分发到对应的管理器
     *
     * @param {Object} config 图层配置
     * @param {String} config.type 图层类型
     *   - 瓦片图层: 'wms', 'wmts', 'arcgis', 'xyz', 'tms', 'singletile', 'ion'
     *   - 静态文件: 'geojson', 'kml', 'wkt', 'shp'
     * @param {String} config.url 图层URL（可选，某些类型需要）
     * @param {Object} config.data 内联数据（可选）
     * @param {String} config.id 图层ID（可选，不提供则自动生成）
     * @param {Object} config.options 图层样式选项（可选）
     * @param {Function} config.onLoaded 加载完成回调（仅静态文件图层）
     * @returns {String|Promise<String>} 图层ID
     */
    addLayer(config) {
        const { type, ...rest } = config;
        const layerId = config.id || this._generateLayerId(type);

        // 根据类型判断使用哪个管理器
        if (this._isVectorTileType(type)) {
            // 瓦片图层（异步）
            const promise = this.vectorTileLayer.addLayer({ ...rest, type, id: layerId });
            this._layerTypeMap.set(layerId, 'vectorTile');
            return promise;
        } else if (this._isStaticFileType(type)) {
            // 静态文件图层（同步返回ID，异步加载）
            this.staticFileLayer.addLayer({ ...rest, type, id: layerId });
            this._layerTypeMap.set(layerId, 'staticFile');
            return layerId;
        } else {
            throw new Error(`Unsupported layer type: ${type}. Supported types: wms, wmts, arcgis, xyz, tms, singletile, ion, geojson, kml, wkt, shp`);
        }
    }

    /**
     * 移除图层
     * @param {String} id 图层ID
     * @returns {Boolean} 是否移除成功
     */
    removeLayer(id) {
        const layerType = this._layerTypeMap.get(id);

        if (!layerType) {
            console.warn(`Layer with id ${id} not found`);
            return false;
        }

        if (layerType === 'vectorTile') {
            this.vectorTileLayer.removeLayer(id);
        } else if (layerType === 'staticFile') {
            this.staticFileLayer.removeLayer(id);
        }

        this._layerTypeMap.delete(id);
        return true;
    }

    /**
     * 显示图层
     * @param {String} id 图层ID
     */
    showLayer(id) {
        const layerType = this._layerTypeMap.get(id);

        if (!layerType) {
            console.warn(`Layer with id ${id} not found`);
            return;
        }

        if (layerType === 'vectorTile') {
            this.vectorTileLayer.showLayer(id);
        } else if (layerType === 'staticFile') {
            this.staticFileLayer.showLayer(id);
        }
    }

    /**
     * 隐藏图层
     * @param {String} id 图层ID
     */
    hideLayer(id) {
        const layerType = this._layerTypeMap.get(id);

        if (!layerType) {
            console.warn(`Layer with id ${id} not found`);
            return;
        }

        if (layerType === 'vectorTile') {
            this.vectorTileLayer.hideLayer(id);
        } else if (layerType === 'staticFile') {
            this.staticFileLayer.hideLayer(id);
        }
    }

    /**
     * 设置图层透明度
     * @param {String} id 图层ID
     * @param {Number} alpha 透明度 (0-1)
     */
    setLayerAlpha(id, alpha) {
        const layerType = this._layerTypeMap.get(id);

        if (!layerType) {
            console.warn(`Layer with id ${id} not found`);
            return;
        }

        if (layerType === 'vectorTile') {
            this.vectorTileLayer.setLayerAlpha(id, alpha);
        } else {
            console.warn('Alpha adjustment is only supported for vector tile layers');
        }
    }

    /**
     * 获取图层对象
     * @param {String} id 图层ID
     * @returns {Object|null} 图层对象
     */
    getLayer(id) {
        const layerType = this._layerTypeMap.get(id);

        if (!layerType) {
            return null;
        }

        if (layerType === 'vectorTile') {
            return this.vectorTileLayer.getLayer(id);
        } else if (layerType === 'staticFile') {
            return this.staticFileLayer.getLayer(id);
        }

        return null;
    }

    /**
     * 获取所有图层ID列表
     * @returns {Array<String>} 图层ID数组
     */
    getAllLayerIds() {
        return Array.from(this._layerTypeMap.keys());
    }

    /**
     * 获取所有图层信息
     * @returns {Array<Object>} 图层信息数组 [{id, type, layer}, ...]
     */
    getAllLayers() {
        const layers = [];

        this._layerTypeMap.forEach((type, id) => {
            const layer = this.getLayer(id);
            if (layer) {
                layers.push({
                    id,
                    type,
                    layer
                });
            }
        });

        return layers;
    }

    /**
     * 清空所有图层
     */
    clearAll() {
        this.vectorTileLayer.clearAll();
        this.staticFileLayer.clearAll();
        this._layerTypeMap.clear();
    }

    /**
     * 清空指定类型的图层
     * @param {String} type 'vectorTile' 或 'staticFile'
     */
    clearByType(type) {
        if (type === 'vectorTile') {
            this.vectorTileLayer.clearAll();
            // 从映射中移除瓦片图层
            this._layerTypeMap.forEach((layerType, id) => {
                if (layerType === 'vectorTile') {
                    this._layerTypeMap.delete(id);
                }
            });
        } else if (type === 'staticFile') {
            this.staticFileLayer.clearAll();
            // 从映射中移除静态文件图层
            this._layerTypeMap.forEach((layerType, id) => {
                if (layerType === 'staticFile') {
                    this._layerTypeMap.delete(id);
                }
            });
        }
    }

    /**
     * 生成图层ID
     * @param {String} type 图层类型
     * @returns {String} 图层ID
     * @private
     */
    _generateLayerId(type) {
        const prefix = this._isVectorTileType(type) ? 'tile' : 'static';
        return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    }

    /**
     * 判断是否为瓦片图层类型
     * @param {String} type 图层类型
     * @returns {Boolean}
     * @private
     */
    _isVectorTileType(type) {
        const tileTypes = ['wms', 'wmts', 'arcgis', 'xyz', 'tms', 'singletile', 'ion'];
        return tileTypes.includes(type.toLowerCase());
    }

    /**
     * 判断是否为静态文件图层类型
     * @param {String} type 图层类型
     * @returns {Boolean}
     * @private
     */
    _isStaticFileType(type) {
        const fileTypes = ['geojson', 'kml', 'wkt', 'shp'];
        return fileTypes.includes(type.toLowerCase());
    }
}

export default LayerManager;
