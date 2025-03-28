class ZoomControl {
    constructor(viewer, options = {}) {
        this.viewer = viewer;
        this.options = options;
        this.zoomAmount = options.zoomAmount || 10000;
        this.container = null;
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

    zoomIn() {
        this.viewer.camera.zoomIn(this.zoomAmount);
    }

    zoomOut() {
        this.viewer.camera.zoomOut(this.zoomAmount);
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
}

export default ZoomControl;
