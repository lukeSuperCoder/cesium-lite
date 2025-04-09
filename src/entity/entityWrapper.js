import {Entity, createGuid, Cartesian3, Color} from 'cesium';

class EntityWrapper {
    constructor(options = {}) {
        this.id = options.id || createGuid();
        this.options = Object.assign({}, options);
        this.entity = new Entity(this.options);
    }

    // 更新实体属性
    update(options) {
        Object.assign(this.options, options);
        this.entity.update(this.options);
    }

    // 获取实体
    getEntity() {
        return this.entity;
    }
}

export default EntityWrapper;
