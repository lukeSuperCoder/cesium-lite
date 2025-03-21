import { Viewer } from 'cesium';

class MapCore {
    constructor(containerId, options={}) {
        this.viewer = null;
        this.containerId = containerId;
        
        this.options = {
            
        }
        this.options = Object.assign(this.options, options);
        this.initializeMap();
    }

    // 初始化地图
    initializeMap() {
        this.viewer = new Viewer(this.containerId, this.options);
        return this.viewer;
    }

}

export default MapCore;