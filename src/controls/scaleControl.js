import { Cartesian3 } from 'cesium';

class ScaleControl {
    constructor(viewer, options = {}) {
        this.viewer = viewer;
        this.options = options;
        this.container = null;
        this.initialize();
    }

    initialize() {
        // 创建控件容器
        this.container = document.createElement('div');
        this.container.className = 'map-control scale-control';
        
        // 更新比例尺
        this.updateScale = () => {
            const distance = this.getScaleDistance();
            this.container.innerHTML = `比例尺 1:${Math.round(distance).toLocaleString()}`;
        };

        // 监听相机变化
        this.viewer.camera.changed.addEventListener(this.updateScale);
        this.updateScale();

        // 添加到地图
        this.viewer.container.appendChild(this.container);
    }

    getScaleDistance() {
        const width = this.viewer.canvas.clientWidth;
        const height = this.viewer.canvas.clientHeight;
        const left = this.viewer.camera.getPickRay({
            x: 0,
            y: height / 2
        });
        const right = this.viewer.camera.getPickRay({
            x: width,
            y: height / 2
        });
        const globe = this.viewer.scene.globe;
        const leftPosition = globe.pick(left, this.viewer.scene);
        const rightPosition = globe.pick(right, this.viewer.scene);
        if (!leftPosition || !rightPosition) {
            return 0;
        }
        return Cartesian3.distance(leftPosition, rightPosition);
    }

    show() {
        this.container.style.display = 'block';
    }

    hide() {
        this.container.style.display = 'none';
    }

    setPosition(position) {
        this.container.className = `map-control scale-control ${position}`;
    }

    destroy() {
        this.viewer.camera.changed.removeEventListener(this.updateScale);
        this.container.remove();
    }
}

export default ScaleControl;
