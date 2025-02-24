import MapCore from './core/map';
import './css/main.css';
export default class CesiumLite {
    constructor(containerId, options={}) {
        this.options = {
            containerId: containerId,
        }
        this.options = Object.assign(this.options, options);
        this.mapCore = new MapCore(containerId, this.options);
    }
    
}
window.CesiumLite = CesiumLite;