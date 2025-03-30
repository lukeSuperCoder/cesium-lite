import { Cartesian2, Cartesian3 } from 'cesium';

class ZoomControl {
    constructor(viewer, options = {}) {
        this.viewer = viewer;
        this.options = options;
        this.container = null;
        // 定义缩放级别（高度值，根据实际情况调整）
        this.zoomLevels = [50000000, 30000000, 10000000, 5000000, 1000000, 500000, 100000, 50000, 10000, 5000, 1000];
        // 根据当前高度计算初始级别索引
        this.currentZoomIndex = 0;
        
        this.initialize();
    }

    initialize() {
        // 创建控件容器
        this.container = document.createElement('div');
        this.container.className = 'map-control zoom-control';
        this.container.innerHTML = `
            <button class="zoom-in" title="放大">+</button>
            <button class="zoom-out" title="缩小">-</button>
        `;

        // 绑定事件
        this.container.querySelector('.zoom-in').onclick = () => this.zoomIn();
        this.container.querySelector('.zoom-out').onclick = () => this.zoomOut();

        // 添加到地图
        this.viewer.container.appendChild(this.container);
    }

    //获取当前缩放级别
    getZoom() {
        return this.zoomLevels[this.currentZoomIndex];
    }

    //设置缩放级别
    setZoom(zoom) {
        if(zoom > 0) {
            this.currentZoomIndex = zoom > this.zoomLevels.length ? this.zoomLevels.length - 1 : zoom;
            if (this.currentZoomIndex > 0) {
                this.currentZoomIndex--; // 降低索引，视角更近
                const targetHeight = this.zoomLevels[this.currentZoomIndex];
                const centerPos = this.getCameraCenterPosition();
                if (centerPos) {
                    this.viewer.camera.flyTo({
                    destination: Cartesian3.fromRadians(
                        this.viewer.camera.positionCartographic.longitude,
                        this.viewer.camera.positionCartographic.latitude,
                        targetHeight
                    ),
                    duration: 1.5, // 动画时间（秒）
                    });
                }
            }
        }
    }

    // 获取当前相机中心点
    getCameraCenterPosition() {
        // 获取屏幕中心对应的地球坐标
        const canvas = this.viewer.scene.canvas;
        const center = new Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2);
        return this.viewer.camera.pickEllipsoid(center, this.viewer.scene.globe.ellipsoid);
    }
    
    // 放大（减小高度值）动画
    zoomOut() {
        this.currentZoomIndex = this.calculateZoomIndex();
        if (this.currentZoomIndex > 0) {
        this.currentZoomIndex--; // 降低索引，视角更近
        const targetHeight = this.zoomLevels[this.currentZoomIndex];
        const centerPos = this.getCameraCenterPosition();
        if (centerPos) {
            this.viewer.camera.flyTo({
            destination: Cartesian3.fromRadians(
                this.viewer.camera.positionCartographic.longitude,
                this.viewer.camera.positionCartographic.latitude,
                targetHeight
            ),
            duration: 1.5, // 动画时间（秒）
            });
        }
        }
    }
    
    // 缩小（增大高度值）动画
    zoomIn() {
        this.currentZoomIndex = this.calculateZoomIndex();
        if (this.currentZoomIndex < this.zoomLevels.length - 1) {
        this.currentZoomIndex++; // 提高索引，视角更远
        const targetHeight = this.zoomLevels[this.currentZoomIndex];
        const centerPos = this.getCameraCenterPosition();
        if (centerPos) {
            this.viewer.camera.flyTo({
            destination: Cartesian3.fromRadians(
                this.viewer.camera.positionCartographic.longitude,
                this.viewer.camera.positionCartographic.latitude,
                targetHeight
            ),
            duration: 1.5, // 动画时间（秒）
            });
        }
        }
    }

    show() {
        this.container.style.display = 'block';
    }

    hide() {
        this.container.style.display = 'none';
    }

    setPosition(position) {
        this.container.className = `map-control zoom-control ${position}`;
    }

    destroy() {
        this.container.remove();
    }

    /**
     * 根据当前高度计算最近的缩放级别索引
     * @param {Number} currentHeight - 当前相机高度
     * @returns {Number} 最近的缩放级别索引
     */
    calculateZoomIndex() {
        const currentHeight = this.viewer.camera.positionCartographic.height;
        let closestIndex = 0;
        let minDiff = Math.abs(this.zoomLevels[0] - currentHeight);
        this.zoomLevels.forEach((level, index) => {
        const diff = Math.abs(level - currentHeight);
        if (diff < minDiff) {
            minDiff = diff;
            closestIndex = index;
        }
        });
        return closestIndex;
    }
}

export default ZoomControl;
