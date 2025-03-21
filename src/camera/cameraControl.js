import { Cartesian3, Cartographic, Math as CesiumMath } from 'cesium';

class CameraControl {
    constructor(viewer, options) {
        this.viewer = viewer;
        this.camera = viewer.camera;
        this.options = options;
        this.initializeCameraControl(this.options);
    }

    /**
     * 初始化相机控制
     * @param {Object} camera 相机参数
     */
    initializeCameraControl(camera) {
        this.viewer.camera.setView({
            destination: Cartesian3.fromDegrees(camera.longitude, camera.latitude, camera.height),
            orientation: {
                heading: CesiumMath.toRadians(camera.heading),
                pitch: CesiumMath.toRadians(camera.pitch),
                roll: CesiumMath.toRadians(camera.roll)
            }
        });
    }

    /**
     * 飞行到指定位置
     * @param {Object} options 飞行参数
     * @param {number} options.longitude 经度
     * @param {number} options.latitude 纬度
     * @param {number} options.height 高度
     * @param {number} options.duration 飞行时间（秒）
     * @param {number} options.heading 方向角
     * @param {number} options.pitch 俯仰角
     * @param {number} options.roll 翻滚角
     */
    flyTo(options) {
        const {
            longitude,
            latitude,
            height = 1000,
            duration = 3,
            heading = 0,
            pitch = -90,
            roll = 0
        } = options;

        this.camera.flyTo({
            destination: Cartesian3.fromDegrees(longitude, latitude, height),
            orientation: {
                heading: CesiumMath.toRadians(heading),
                pitch: CesiumMath.toRadians(pitch),
                roll: CesiumMath.toRadians(roll)
            },
            duration: duration
        });
    }

    /**
     * 设置相机位置
     * @param {Object} options 相机参数
     * @param {number} options.longitude 经度
     * @param {number} options.latitude 纬度
     * @param {number} options.height 高度
     * @param {number} options.heading 方向角
     * @param {number} options.pitch 俯仰角
     * @param {number} options.roll 翻滚角
     */
    setView(options) {
        const {
            longitude,
            latitude,
            height = 1000,
            heading = 0,
            pitch = -90,
            roll = 0
        } = options;

        this.camera.setView({
            destination: Cartesian3.fromDegrees(longitude, latitude, height),
            orientation: {
                heading: CesiumMath.toRadians(heading),
                pitch: CesiumMath.toRadians(pitch),
                roll: CesiumMath.toRadians(roll)
            }
        });
    }

    /**
     * 获取当前相机位置信息
     * @returns {Object} 相机位置信息
     */
    getPosition() {
        const cartographic = Cartographic.fromCartesian(this.camera.position);
        return {
            longitude: CesiumMath.toDegrees(cartographic.longitude),
            latitude: CesiumMath.toDegrees(cartographic.latitude),
            height: cartographic.height,
            heading: CesiumMath.toDegrees(this.camera.heading),
            pitch: CesiumMath.toDegrees(this.camera.pitch),
            roll: CesiumMath.toDegrees(this.camera.roll)
        };
    }

    /**
     * 调整相机视角
     * @param {Object} options 视角参数
     * @param {number} options.heading 方向角
     * @param {number} options.pitch 俯仰角
     * @param {number} options.roll 翻滚角
     */
    setOrientation(options) {
        const { heading, pitch, roll } = options;
        
        if (heading !== undefined) {
            this.camera.setHeading(CesiumMath.toRadians(heading));
        }
        if (pitch !== undefined) {
            this.camera.setPitch(CesiumMath.toRadians(pitch));
        }
        if (roll !== undefined) {
            this.camera.setRoll(CesiumMath.toRadians(roll));
        }
    }

    /**
     * 平移相机
     * @param {Object} options 平移参数
     * @param {number} options.distance 平移距离（米）
     * @param {number} options.direction 方向（0-360度）
     */
    move(options) {
        const { distance, direction } = options;
        const heading = CesiumMath.toRadians(direction);
        
        const currentPosition = this.camera.position;
        const moveVector = new Cartesian3(
            Math.sin(heading) * distance,
            Math.cos(heading) * distance,
            0
        );
        
        this.camera.move(moveVector);
    }

    /**
     * 旋转相机
     * @param {Object} options 旋转参数
     * @param {number} options.heading 方向角变化量
     * @param {number} options.pitch 俯仰角变化量
     * @param {number} options.roll 翻滚角变化量
     */
    rotate(options) {
        const { heading, pitch, roll } = options;
        
        if (heading !== undefined) {
            this.camera.rotateRight(CesiumMath.toRadians(heading));
        }
        if (pitch !== undefined) {
            this.camera.rotateUp(CesiumMath.toRadians(pitch));
        }
        if (roll !== undefined) {
            this.camera.rotateDown(CesiumMath.toRadians(roll));
        }
    }
}

export default CameraControl;
