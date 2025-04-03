import {CustomDataSource, Entity, createGuid, Cartesian3, Color} from 'cesium';
import EntityWrapper from './entityWrapper';

class EntityManager {
    constructor(viewer) {
        if (!viewer) throw new Error('Viewer instance is required');
        this.viewer = viewer;
        this.dataSource = new CustomDataSource('entityManager'); 
        this.viewer.dataSources.add(this.dataSource);
        this.entities = new Map();
    }

    // 添加实体
    addEntity(options) {
        const entityWrapper = new EntityWrapper(options);
        this.entities.set(entityWrapper.id, entityWrapper);
        this.dataSource.entities.add(entityWrapper.getEntity());
        return entityWrapper.id;
    }

    // 移除实体
    removeEntity(entityId) {
        if (this.entities.has(entityId)) {
            const entityWrapper = this.entities.get(entityId);
            this.dataSource.entities.remove(entityWrapper.getEntity());
            this.entities.delete(entityId);
        }
    }

    // 更新实体
    updateEntity(entityId, options) {
        if (this.entities.has(entityId)) {
            const entityWrapper = this.entities.get(entityId);
            entityWrapper.update(options);
        }
    }

    // 获取所有实体
    getAllEntities() {
        return Array.from(this.entities.values()).map(wrapper => wrapper.getEntity());
    }

    // 清除所有实体
    clearEntities() {
        this.dataSource.entities.removeAll();
        this.entities.clear();
    }
}

export default EntityManager;
