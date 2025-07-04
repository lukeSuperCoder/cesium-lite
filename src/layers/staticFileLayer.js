import { GeoJsonDataSource, KmlDataSource, Color } from "cesium";
import shp from "shpjs";
import { parse as parseWKT } from "terraformer-wkt-parser";

/**
 * 静态GIS文件图层管理类
 * 支持GeoJSON、KML、WKT、SHP等格式
 * 支持添加、删除、清空图层
 * 支持自定义配置
 */
class StaticFileLayer {
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
            clampToGround: true,
            stroke: Color.BLUE,
            fill: Color.CYAN.withAlpha(0.5),
            strokeWidth: 2,
            show: true,
            ...options
        };
    }

    /**
     * 添加图层（异步回调方式）
     * @param {Object} config 图层配置 {type, data, url, options, id, onLoaded, ...}
     * @returns {String} 图层ID
     */
    addLayer(config) {
        const { type, data, url, options = {}, id, onLoaded, ...rest } = config;
        const layerId = id || `static_${Date.now()}_${Math.floor(Math.random()*10000)}`;
        let finalOptions = { ...this.defaultOptions, ...options, ...rest };

        // 异步加载
        (async () => {
            let dataSource = null;
            try {
                switch (type) {
                    case 'geojson':
                        if (data) {
                            dataSource = await GeoJsonDataSource.load(data, finalOptions);
                        } else if (url) {
                            dataSource = await GeoJsonDataSource.load(url, finalOptions);
                        } else {
                            throw new Error('geojson类型需提供data或url');
                        }
                        this.viewer.dataSources.add(dataSource);
                        break;
                    case 'kml':
                        if (data) {
                            dataSource = await KmlDataSource.load(data, finalOptions);
                        } else if (url) {
                            dataSource = await KmlDataSource.load(url, finalOptions);
                        } else {
                            throw new Error('kml类型需提供data或url');
                        }
                        this.viewer.dataSources.add(dataSource);
                        break;
                    case 'wkt':
                        if (!data && !url) throw new Error('wkt类型需提供data或url');
                        let wktStr = data;
                        if (!wktStr && url) {
                            const resp = await fetch(url);
                            wktStr = await resp.text();
                        }
                        const geojson = parseWKT(wktStr);
                        if (!geojson) throw new Error('WKT解析失败');
                        dataSource = await GeoJsonDataSource.load(geojson, finalOptions);
                        this.viewer.dataSources.add(dataSource);
                        break;
                    case 'shp':
                        if (!data && !url) throw new Error('shp类型需提供data或url');
                        let shpBuffer = data;
                        if (!shpBuffer && url) {
                            const resp = await fetch(url);
                            shpBuffer = await resp.arrayBuffer();
                        }
                        const shpGeojson = await shp(shpBuffer);
                        dataSource = await GeoJsonDataSource.load(shpGeojson, finalOptions);
                        this.viewer.dataSources.add(dataSource);
                        break;
                    default:
                        throw new Error(`不支持的静态文件类型: ${type}`);
                }

                this._layers.set(layerId, {
                    type,
                    dataSource,
                    config: finalOptions
                });
                if (typeof onLoaded === 'function') {
                    onLoaded(layerId, dataSource);
                }
            } catch (err) {
                if (typeof onLoaded === 'function') {
                    onLoaded(layerId, null, err);
                }
            }
        })();
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
        if (layer && layer.dataSource) {
            this.viewer.dataSources.remove(layer.dataSource, true);
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
        if (layer && layer.dataSource) {
            layer.dataSource.show = visible;
        }
    }

    /**
     * 更新图层参数
     * @param {String} id 图层ID
     * @param {Object} options 参数
     */
    updateLayer(id, options = {}) {
        const layer = this._layers.get(id);
        if (layer && layer.dataSource) {
            Object.assign(layer.config, options);

            // 只设置填充色
            const entities = layer.dataSource.entities && layer.dataSource.entities.values;
            if (entities && entities.length) {
                for (const entity of entities) {
                    // 填充色
                    if (options.fill && entity.polygon) {
                        entity.polygon.material = options.fill;
                    }
                }
            }
        }
    }

    /**
     * 批量添加图层（每个图层可单独onLoaded）
     * @param {Array} layers 图层配置数组
     * @returns {Array} 添加的图层ID数组
     */
    addLayers(layers) {
        if (!Array.isArray(layers)) {
            throw new Error('layers参数必须为数组');
        }
        const addedIds = [];
        for (const config of layers) {
            const id = this.addLayer(config);
            addedIds.push(id);
        }
        return addedIds;
    }
}

export default StaticFileLayer; 