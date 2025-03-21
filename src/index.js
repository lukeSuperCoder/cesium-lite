import MapCore from './core/map';
import CameraControl from './camera/cameraControl';
import BasemapControl from './basemap/basemapControl';
import './css/main.css';
import config from './core/config';
import { Ion } from 'cesium';
export default class CesiumLite {
    constructor(containerId, options={}) {
        Ion.defaultAccessToken = config.token;
        // 默认配置
        const defaultOptions = {
            containerId: containerId,
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
                // 动画配置
                animation: {
                    enabled: true,         // 启用动画控件
                    defaultDuration: 3,    // 默认动画时长（秒）
                    defaultEasing: 'CubicOut' // 默认缓动函数
                },
                // 时间配置
                timeline: {
                    enabled: true,         // 启用时间轴
                    currentTime: new Date() // 默认当前时间
                },
                // 全屏配置
                fullscreen: {
                    enabled: true,         // 启用全屏控件
                    element: containerId   // 全屏元素
                },
                // 导航配置
                navigation: {
                    enabled: true,         // 启用导航控件
                    compass: true,         // 启用指南针
                    zoom: true,            // 启用缩放
                    home: true             // 启用Home按钮
                }
            }
        };

        // 合并用户配置和默认配置
        this.options = Object.assign({}, defaultOptions, options);
        this.mapCore = new MapCore(containerId, this.options);
        
        // 初始化相机控制模块
        this.cameraControl = new CameraControl(this.mapCore.viewer, this.options.map.camera);
        // 初始化底图控制模块
        this.basemapControl = new BasemapControl(this.mapCore.viewer, this.options.map.baseMap);
        
        // 暴露实例到全局
        window.cesiumInstance = this;
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