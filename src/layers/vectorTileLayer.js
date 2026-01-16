import {
    WebMapServiceImageryProvider,
    WebMapTileServiceImageryProvider,
    ArcGisMapServerImageryProvider,
    UrlTemplateImageryProvider,
    SingleTileImageryProvider,
    IonImageryProvider,
    GeoJsonDataSource,
    ImageryLayer,
    Color
} from "cesium";

/**
 * 矢量图层管理类
 * 支持WMS、WMTS、ArcGIS、XYZ、TMS、SingleTile、Ion、WFS等多种格式
 * 支持添加、删除、清空图层
 * 支持自定义配置
 */
class VectorTileLayer {
    /**
     * 构造函数
     * @param {Object} viewer Cesium viewer实例
     * @param {Object} options 全局配置选项
     */
    constructor(viewer, options = {}) {
        if (!viewer) throw new Error('Viewer instance is required');
        this.viewer = viewer;
        this._layers = new Map(); // 存储所有图层
        this.defaultOptions = {
            alpha: 1.0,
            show: true,
            zIndex: undefined,
            ...options
        };
    }

    /**
     * 添加图层
     * @param {Object} config 图层配置 {type, url, options, id, ...}
     * @returns {String} 图层ID
     */
    async addLayer(config) {
        const { type, url, options = {}, id, ...rest } = config;
        const layerId = id || `layer_${Date.now()}_${Math.floor(Math.random()*10000)}`;
        let layerObj = null;
        let imageryLayer = null;
        let dataSource = null;
        let finalOptions = { ...this.defaultOptions, ...options, ...rest };

        switch (type) {
            case 'wms':
                layerObj = new WebMapServiceImageryProvider({
                    url,
                    ...finalOptions
                });
                imageryLayer = this.viewer.imageryLayers.addImageryProvider(layerObj);
                break;
            case 'wmts':
                layerObj = await WebMapTileServiceImageryProvider.fromUrl(url, {
                    ...finalOptions
                });
                imageryLayer = this.viewer.imageryLayers.addImageryProvider(layerObj);
                break;
            case 'arcgis':
                layerObj = await ArcGisMapServerImageryProvider.fromUrl(url, {
                    ...finalOptions
                });
                imageryLayer = this.viewer.imageryLayers.addImageryProvider(layerObj);
                break;
            case 'xyz':
            case 'tms':
                layerObj = new UrlTemplateImageryProvider({
                    url,
                    ...finalOptions
                });
                imageryLayer = this.viewer.imageryLayers.addImageryProvider(layerObj);
                break;
            case 'singleTile':
                layerObj = new SingleTileImageryProvider({
                    url,
                    ...finalOptions
                });
                imageryLayer = this.viewer.imageryLayers.addImageryProvider(layerObj);
                break;
            case 'ion':
                layerObj = await IonImageryProvider.fromAssetId(finalOptions.assetId, {
                    accessToken: finalOptions.accessToken,
                    ...finalOptions
                });
                imageryLayer = this.viewer.imageryLayers.addImageryProvider(layerObj);
                break;
            case 'wfs':
                // WFS需先获取GeoJSON再用GeoJsonDataSource加载
                const response = await fetch(url);
                const geojson = await response.json();
                dataSource = await GeoJsonDataSource.load(geojson, finalOptions);
                this.viewer.dataSources.add(dataSource);
                break;
            default:
                throw new Error(`不支持的图层类型: ${type}`);
        }

        // 记录图层
        this._layers.set(layerId, {
            type,
            imageryLayer,
            dataSource,
            provider: layerObj,
            config: finalOptions
        });
        return layerId;
    }

    /**
     * 根据ID获取图层
     * @param {String} id 图层ID
     * @returns {Object} 图层对象
     */
    getLayer(id) {
        return this._layers.get(id);
    }

    /**
     * 获取所有图层
     * @returns {Array} 图层对象数组
     */
    getAllLayers() {
        return Array.from(this._layers.values());
    }

    /**
     * 移除图层
     * @param {String} id 图层ID
     */
    removeLayer(id) {
        const layer = this._layers.get(id);
        if (layer) {
            if (layer.imageryLayer) {
                this.viewer.imageryLayers.remove(layer.imageryLayer, true);
            }
            if (layer.dataSource) {
                this.viewer.dataSources.remove(layer.dataSource, true);
            }
            this._layers.delete(id);
        }
    }

    /**
     * 清空所有图层
     */
    clearAll() {
        for (const id of this._layers.keys()) {
            this.removeLayer(id);
        }
    }

    /**
     * 设置图层可见性
     * @param {String} id 图层ID
     * @param {Boolean} visible 是否可见
     */
    setLayerVisibility(id, visible) {
        const layer = this._layers.get(id);
        if (layer && layer.imageryLayer) {
            layer.imageryLayer.show = visible;
        }
        if (layer && layer.dataSource) {
            layer.dataSource.show = visible;
        }
    }

    /**
     * 显示图层
     * @param {String} id 图层ID
     */
    showLayer(id) {
        this.setLayerVisibility(id, true);
    }

    /**
     * 隐藏图层
     * @param {String} id 图层ID
     */
    hideLayer(id) {
        this.setLayerVisibility(id, false);
    }

    /**
     * 更新图层参数
     * @param {String} id 图层ID
     * @param {Object} options 参数
     */
    updateLayer(id, options = {}) {
        const layer = this._layers.get(id);
        if (layer && layer.imageryLayer) {
            Object.assign(layer.imageryLayer, options);
            Object.assign(layer.config, options);
        }
        if (layer && layer.dataSource) {
            Object.assign(layer.dataSource, options);
            Object.assign(layer.config, options);
        }
    }

    /**
     * 批量添加图层
     * @param {Array} layers 图层配置数组
     * @returns {Array} 添加的图层ID数组
     */
    async addLayers(layers) {
        if (!Array.isArray(layers)) {
            throw new Error('layers参数必须为数组');
        }
        const addedIds = [];
        for (const config of layers) {
            const id = await this.addLayer(config);
            addedIds.push(id);
        }
        return addedIds;
    }
}

export default VectorTileLayer;
