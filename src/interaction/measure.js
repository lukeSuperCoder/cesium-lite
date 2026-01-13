import { Cartesian3, Cartographic, Math as CesiumMath, CallbackProperty, Color, HeightReference, PolygonHierarchy, PolylineDashMaterialProperty, ScreenSpaceEventType ,Cartesian2} from "cesium";
import DrawTool from "./draw";

class MeasureTool {
    constructor(viewer, options = {}) {
        this.viewer = viewer;
        this.drawTool = new DrawTool(viewer, options);
        this._measureEntities = new Map(); // 存储测量实体
        this._measureLabels = new Map(); // 存储测量标签
        this._currentMeasureId = null; // 当前测量ID
        this._measureCount = 0; // 测量计数器
    }

    /**
     * 开始测距
     * @param {Function} callback 测量完成回调
     */
    measureDistance(callback) {
        this.clearAll();
        this._measureCount++;
        this._currentMeasureId = `distance_${this._measureCount}`;
        
        this.drawTool.draw('Polyline', (entity) => {
            const positions = entity.polyline.positions.getValue();
            const totalDistance = this._calculateDistance(positions);
            
            // 存储测量实体和标签
            this._measureEntities.set(this._currentMeasureId, entity);
            
            // 在线的最后一个点添加标签
            const lastPosition = positions[positions.length - 1];
            const labelEntity = this._createLabel([lastPosition], totalDistance);
            this._measureLabels.set(this._currentMeasureId, labelEntity);
            
            if (callback) {
                callback({
                    id: this._currentMeasureId,
                    distance: totalDistance,
                    positions: positions
                });
            }
        });
    }

    /**
     * 开始测面
     * @param {Function} callback 测量完成回调
     */
    measureArea(callback) {
        this._measureCount++;
        this._currentMeasureId = `area_${this._measureCount}`;
        
        this.drawTool.draw('Polygon', (entity) => {
            const positions = entity.polygon.hierarchy.getValue().positions;
            const area = this._calculateArea(positions);
            
            // 存储测量实体和标签
            this._measureEntities.set(this._currentMeasureId, entity);
            
            // 在面的中心点添加标签
            const center = this._calculatePolygonCenter(positions);
            const labelEntity = this._createLabel([center], area, true);
            this._measureLabels.set(this._currentMeasureId, labelEntity);
            
            if (callback) {
                callback({
                    id: this._currentMeasureId,
                    area: area,
                    positions: positions
                });
            }
        });
    }

    /**
     * 清除所有测量
     */
    clearAll() {
        // 清除所有测量实体
        this._measureEntities.forEach(entity => {
            this.viewer.entities.remove(entity);
        });
        this._measureEntities.clear();

        // 清除所有标签
        this._measureLabels.forEach(label => {
            this.viewer.entities.remove(label);
        });
        this._measureLabels.clear();

        // 清除所有绘制
        this.drawTool.clearAll();

        this._currentMeasureId = null;
        this._measureCount = 0;
    }

    /**
     * 清除指定测量
     * @param {string} id 测量ID
     */
    clear(id) {
        if (this._measureEntities.has(id)) {
            this.viewer.entities.remove(this._measureEntities.get(id));
            this._measureEntities.delete(id);
        }
        if (this._measureLabels.has(id)) {
            this.viewer.entities.remove(this._measureLabels.get(id));
            this._measureLabels.delete(id);
        }
    }

    /**
     * 计算距离
     * @private
     */
    _calculateDistance(positions) {
        let totalDistance = 0;
        for (let i = 0; i < positions.length - 1; i++) {
            const start = positions[i];
            const end = positions[i + 1];
            totalDistance += this._getDistance(start, end);
        }
        return totalDistance;
    }

    /**
     * 计算面积
     * @private
     */
    _calculateArea(positions) {
        // 使用球面多边形面积计算公式
        let area = 0;
        const points = positions.map(pos => {
            const cartographic = Cartographic.fromCartesian(pos);
            return {
                longitude: CesiumMath.toDegrees(cartographic.longitude),
                latitude: CesiumMath.toDegrees(cartographic.latitude)
            };
        });

        for (let i = 0; i < points.length; i++) {
            const j = (i + 1) % points.length;
            area += points[i].longitude * points[j].latitude;
            area -= points[j].longitude * points[i].latitude;
        }

        // 转换为平方公里
        area = Math.abs(area) * 111.32 * 111.32 * Math.cos(points[0].latitude * Math.PI / 180) / 2;
        return area;
    }

    /**
     * 计算两点间距离
     * @private
     */
    _getDistance(start, end) {
        const startCartographic = Cartographic.fromCartesian(start);
        const endCartographic = Cartographic.fromCartesian(end);
        
        const startLon = CesiumMath.toDegrees(startCartographic.longitude);
        const startLat = CesiumMath.toDegrees(startCartographic.latitude);
        const endLon = CesiumMath.toDegrees(endCartographic.longitude);
        const endLat = CesiumMath.toDegrees(endCartographic.latitude);
        
        // 使用Haversine公式计算距离
        const R = 6371; // 地球半径（公里）
        const dLat = (endLat - startLat) * Math.PI / 180;
        const dLon = (endLon - startLon) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                 Math.cos(startLat * Math.PI / 180) * Math.cos(endLat * Math.PI / 180) *
                 Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    /**
     * 创建标签
     * @private
     */
    _createLabel(positions, value, isArea = false) {
        // 计算标签位置
        const position = positions[0];
        
        // 格式化显示值
        const displayValue = isArea ? 
            `${value.toFixed(2)} 平方公里` : 
            `${value.toFixed(2)} 公里`;

        // 创建标签实体
        const labelEntity = this.viewer.entities.add({
            position: position,
            label: {
                text: displayValue,
                font: '14px sans-serif',
                fillColor: Color.WHITE,
                outlineColor: Color.BLACK,
                outlineWidth: 2,
                verticalOrigin: 1,
                pixelOffset: new Cartesian2(0, -10),
                showBackground: true,
                backgroundColor: new Color(0.165, 0.165, 0.165, 0.8),
                backgroundPadding: new Cartesian2(7, 5),
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            }
        });

        return labelEntity;
    }

    /**
     * 计算多边形中心点
     * @private
     */
    _calculatePolygonCenter(positions) {
        // 计算多边形的质心
        let sumX = 0, sumY = 0, sumZ = 0;
        positions.forEach(pos => {
            sumX += pos.x;
            sumY += pos.y;
            sumZ += pos.z;
        });
        
        // 创建中心点
        const center = new Cartesian3(
            sumX / positions.length,
            sumY / positions.length,
            sumZ / positions.length
        );

        // 将中心点投影到地球表面
        const cartographic = Cartographic.fromCartesian(center);
        return Cartesian3.fromRadians(
            cartographic.longitude,
            cartographic.latitude,
            cartographic.height
        );
    }
}

export default MeasureTool; 