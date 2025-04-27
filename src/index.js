import MapCore from './core/map';
import CameraControl from './camera/cameraControl';
import BasemapControl from './basemap/basemapControl';
import FullscreenControl from './controls/fullscreenControl';
import ZoomControl from './controls/zoomControl';
import ScaleControl from './controls/scaleControl';
import DrawTool from './mark/draw';
import MeasureTool from './mark/measure';
import EntityManager from './entity/entityManager';
import Marker from './markers/marker';
import ClusterMarker from './markers/clusterMarker';
import SpatialAnalysis from './utils/spatialAnalysis';
import './css/main.css';
import './css/control.css';
import config from './core/config';
import * as Cesium from 'cesium';
export default class CesiumLite {
    constructor(containerId, options={}) {
        Cesium.Ion.defaultAccessToken = config.token;
        // 默认配置
        const defaultOptions = {
            containerId: containerId,
            fullscreenButton: false,   // 全屏按钮配置，设置为false表示不显示全屏按钮
            baseLayerPicker: false,   // 底图选择器配置，设置为false表示不显示底图选择器
            vrButton: false,         // 虚拟现实按钮配置，设置为false表示不显示VR按钮
            timeline: false,         // 时间轴配置，设置为false表示不显示时间轴
            animation: false,        // 动画配置，设置为false表示不启用动画控件
            homeButton: false,       // 首页按钮配置，设置为false表示不显示Home按钮
            geocoder: false,         // 地理编码器配置，设置为false表示不启用地理编码器
            navigationHelpButton: false, // 导航帮助按钮配置，设置为false表示不显示导航帮助按钮
            sceneModePicker: false,     // 场景模式选择器配置，设置为false表示不显示场景模式选择器
            baseLayerPicker: false,     // 再次声明底图选择器配置，设置为false表示不显示底图选择器
            // 地图配置
            map: {
                // 默认底图配置
                baseMap: {
                    id: 'vector', // 影像底图
                },
                // 地形配置
                terrain: {
                    provider: 'CesiumIon',
                    requestVertexNormals: true,
                    requestWaterMask: true
                },
                // 默认视角配置
                camera: {
                    longitude: 116.397428, // 默认经度
                    latitude: 39.90923,    // 默认纬度
                    height: 1000000,       // 默认高度
                    heading: 0,            // 默认方向角
                    pitch: -90,            // 默认俯仰角
                    roll: 0                // 默认翻滚角
                },
                controls: {
                    zoomAmount: 10000,
                    zoom: true,
                    scale: true,
                    fullscreen: true
                },
                drawStyles: {}
            }
        };
        // 合并用户配置和默认配置
        this.options = this.deepMerge(defaultOptions, options);
        // 初始化地图核心模块
        this.mapCore = new MapCore(containerId, this.options);

        // 初始化相机控制模块
        this.cameraControl = new CameraControl(this.mapCore.viewer, this.options.map.camera);
        // 初始化底图控制模块
        this.basemapControl = new BasemapControl(this.mapCore.viewer, this.options.map.baseMap);
        // 初始化全屏控件模块
        this.fullscreenControl = new FullscreenControl(this.mapCore.viewer, this.options.map.controls);
        // 初始化缩放控件模块
        this.zoomControl = new ZoomControl(this.mapCore.viewer, this.options.map.controls);
        // 初始化比例尺控件模块
        this.scaleControl = new ScaleControl(this.mapCore.viewer, this.options.map.controls);
        // 初始化绘制控件模块
        this.drawTool = new DrawTool(this.mapCore.viewer, {styles: this.options.map.drawStyles});
        // 初始化测量工具
        this.measureTool = new MeasureTool(this.mapCore.viewer);
        // 初始化实体管理模块
        this.entityManager = new EntityManager(this.mapCore.viewer);
        // 初始化标记点管理模块
        this.marker = new Marker(this.mapCore.viewer);
        // 初始化聚合点管理模块
        this.clusterMarker = new ClusterMarker(this.mapCore.viewer);
        // 初始化空间分析模块
        this.spatialAnalysis = new SpatialAnalysis(this.mapCore.viewer);


        if(this.options.map.controls.fullscreen) {
            this.fullscreenControl.show();
            this.fullscreenControl.setPosition('top-right');
        } else {
            this.fullscreenControl.hide();
        }
        if(this.options.map.controls.zoom) {
            this.zoomControl.show();
            this.zoomControl.setPosition('top-left');
        } else {
            this.zoomControl.hide();
        }
        if(this.options.map.controls.scale) {    
            this.scaleControl.show();
            this.scaleControl.setPosition('bottom-right');
        } else {
            this.scaleControl.hide();
        }
        // 暴露实例到全局
        window.cesiumInstance = this;
        window.Cesium = Cesium;
    }

    /**
     * 深度合并对象
     * @param {Object} target 目标对象
     * @param {Object} source 源对象
     * @returns {Object} 合并后的对象
     */
    deepMerge(target, source) {
        const result = { ...target };

        for (const key in source) {
            if (source[key] instanceof Object && !Array.isArray(source[key])) {
                if (key in target) {
                    result[key] = this.deepMerge(target[key], source[key]);
                } else {
                    result[key] = { ...source[key] };
                }
            } else if (source[key] !== undefined) {
                result[key] = source[key];
            }
        }

        return result;
    }

    /**
     * 飞行到指定位置
     * @param {Object} options 飞行参数
     */
    flyTo(options) {
        return this.cameraControl.flyTo(options);
    }

    /**
     * 设置相机位置
     * @param {Object} options 相机参数
     */
    setView(options) {
        return this.cameraControl.setView(options);
    }

    /**
     * 获取当前相机位置信息
     * @returns {Object} 相机位置信息
     */
    getPosition() {
        return this.cameraControl.getPosition();
    }

    /**
     * 调整相机视角
     * @param {Object} options 视角参数
     */
    setOrientation(options) {
        return this.cameraControl.setOrientation(options);
    }

    /**
     * 平移相机
     * @param {Object} options 平移参数
     */
    move(options) {
        return this.cameraControl.move(options);
    }

    /**
     * 旋转相机
     * @param {Object} options 旋转参数
     */
    rotate(options) {
        return this.cameraControl.rotate(options);
    }
}

window.CesiumLite = CesiumLite; 