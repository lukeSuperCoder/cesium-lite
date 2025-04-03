import {Entity, createGuid, Cartesian3, Color} from 'cesium';

class EntityWrapper {
    constructor(options = {}) {
        this.id = options.id || createGuid();
        this.entity = new Entity({
            id: this.id,
            position: options.position || Cartesian3.ZERO,
            point: options.point || {
                pixelSize: 10,
                color: Color.RED
            },
            label: options.label || null,
            billboard: options.billboard || null
        });
    }

    // 更新实体属性
    update(options) {
        Object.assign(this.entity, options);
    }

    // 获取实体
    getEntity() {
        return this.entity;
    }
}

export default EntityWrapper;
