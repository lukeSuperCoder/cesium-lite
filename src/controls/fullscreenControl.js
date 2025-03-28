class FullscreenControl {
    constructor(viewer, options = {}) {
        this.viewer = viewer;
        this.options = options;
        this.container = null;
        this.initialize();
    }

    initialize() {
        // 创建控件容器
        this.container = document.createElement('div');
        this.container.className = 'map-control fullscreen-control';
        this.container.innerHTML = `
            <button class="fullscreen-toggle" title="全屏">⤢</button>
        `;

        // 绑定事件
        this.container.querySelector('.fullscreen-toggle').onclick = () => this.toggleFullscreen();

        // 监听全屏变化
        document.addEventListener('fullscreenchange', () => this.updateButtonState());

        // 添加到地图
        this.viewer.container.appendChild(this.container);
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.viewer.container.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    updateButtonState() {
        const button = this.container.querySelector('.fullscreen-toggle');
        button.innerHTML = document.fullscreenElement ? '⤓' : '⤢';
    }

    show() {
        this.container.style.display = 'block';
    }

    hide() {
        this.container.style.display = 'none';
    }

    setPosition(position) {
        this.container.className = `map-control fullscreen-control ${position}`;
    }

    destroy() {
        document.removeEventListener('fullscreenchange', this.updateButtonState);
        this.container.remove();
    }
}

export default FullscreenControl;
