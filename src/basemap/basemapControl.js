import { 
    ImageryLayer, 
    createWorldImageryAsync, 
    createWorldTerrainAsync,
    WebMapTileServiceImageryProvider,
    OpenStreetMapImageryProvider,
    BingMapsImageryProvider,
} from 'cesium';

class BasemapControl {
    constructor(viewer, options = {}) {
        this.viewer = viewer;
        this.options = options;
        this.basemaps = new Map(); // 存储底图
        this.currentBasemap = null; // 当前底图
        this.initializeBasemaps();
    }

    /**
     * 初始化底图
     */
    async initializeBasemaps() {
        // 添加默认底图
        await this.addDefaultBasemaps();
        
        // 设置默认底图
        const defaultBasemapId = this.options.id || 'imagery';
        this.switchBasemap(defaultBasemapId);
    }

    /**
     * 添加默认底图
     */
    async addDefaultBasemaps() {
        const imageryProvider = await createWorldImageryAsync();
        
        // 添加影像底图
        this.addBasemap('imagery', {
            id: 'imagery',
            name: '影像底图',
            provider: imageryProvider,
            visible: false
        });

        // 添加矢量底图
        this.addBasemap('vector', {
            id: 'vector',
            name: '矢量底图',
            provider: imageryProvider,
            visible: false
        });

        // 添加OpenStreetMap底图
        this.addBasemap('osm', {
            id: 'osm',
            name: 'OpenStreetMap',
            provider: new OpenStreetMapImageryProvider({
                url: 'https://tile.openstreetmap.org/'
            }),
            visible: false
        });
    }

    /**
     * 添加底图
     * @param {string} id 底图ID
     * @param {Object} options 底图配置
     * @param {string} options.name 底图名称
     * @param {ImageryProvider} options.provider 底图提供者
     * @param {boolean} options.visible 是否可见
     */
    addBasemap(id, options) {
        const { name, provider, visible = false } = options;
        
        // 创建图层
        const layer = new ImageryLayer(provider, {
            show: visible
        });

        // 存储底图信息
        this.basemaps.set(id, {
            id,
            name,
            layer,
            provider
        });
        // 添加到地图
        this.viewer.imageryLayers.add(layer);
    }

    /**
     * 移除底图
     * @param {string} id 底图ID
     */
    removeBasemap(id) {
        const basemap = this.basemaps.get(id);
        if (basemap) {
            this.viewer.imageryLayers.remove(basemap.layer);
            this.basemaps.delete(id);
            
            // 如果移除的是当前底图，切换到默认底图
            if (this.currentBasemap === id) {
                this.switchBasemap('imagery');
            }
        }
    }

    /**
     * 切换底图
     * @param {string} id 底图ID
     */
    async switchBasemap(id) {
        const targetBasemap = this.basemaps.get(id);
        if (!targetBasemap) {
            console.warn(`底图 ${id} 不存在`);
            return;
        }

        // 隐藏所有底图
        this.basemaps.forEach(basemap => {
            basemap.layer.show = false;
        });

        // 显示目标底图
        targetBasemap.layer.show = true;
        this.currentBasemap = id;
        // 确保底图切换生效
        await this.viewer.scene.requestRender();
    }

    /**
     * 获取底图列表
     * @returns {Array} 底图列表
     */
    getBasemapList() {
        return Array.from(this.basemaps.values()).map(basemap => ({
            id: basemap.id,
            name: basemap.name,
            visible: basemap.layer.show
        }));
    }

    /**
     * 获取当前底图
     * @returns {Object} 当前底图信息
     */
    getCurrentBasemap() {
        return this.currentBasemap ? this.basemaps.get(this.currentBasemap) : null;
    }

    /**
     * 设置底图透明度
     * @param {string} id 底图ID
     * @param {number} alpha 透明度（0-1）
     */
    setBasemapAlpha(id, alpha) {
        const basemap = this.basemaps.get(id);
        if (basemap) {
            basemap.layer.alpha = Math.max(0, Math.min(1, alpha));
        }
    }

    /**
     * 添加WMTS底图
     * @param {string} id 底图ID
     * @param {Object} options WMTS配置
     * @param {string} options.url WMTS服务地址
     * @param {string} options.layer 图层名称
     * @param {string} options.style 样式名称
     * @param {string} options.format 图片格式
     * @param {string} options.tileMatrixSetID 矩阵集ID
     */
    addWMTSBasemap(id, options) {
        const provider = new WebMapTileServiceImageryProvider({
            url: options.url,
            layer: options.layer,
            style: options.style,
            format: options.format,
            tileMatrixSetID: options.tileMatrixSetID
        });

        this.addBasemap(id, {
            name: options.name || id,
            provider,
            visible: false
        });
    }

    /**
     * 添加Bing Maps底图
     * @param {string} id 底图ID
     * @param {Object} options Bing Maps配置
     * @param {string} options.key Bing Maps密钥
     * @param {string} options.mapStyle 地图样式
     */
    addBingMapsBasemap(id, options) {
        const provider = new BingMapsImageryProvider({
            url: 'https://dev.virtualearth.net',
            key: options.key,
            mapStyle: options.mapStyle
        });

        this.addBasemap(id, {
            name: options.name || id,
            provider,
            visible: false
        });
    }

    /**
     * 销毁底图控制器
     */
    destroy() {
        this.basemaps.clear();
        this.currentBasemap = null;
    }
}

export default BasemapControl;
