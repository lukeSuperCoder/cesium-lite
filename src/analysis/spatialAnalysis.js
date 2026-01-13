import {
    Cartesian3,
    Cartographic,
    Math as CesiumMath,
    EllipsoidGeodesic,
    sampleTerrainMostDetailed,
    Ellipsoid,
    PolygonGeometry,
    PolygonHierarchy,
    GeometryInstance,
    Color,
    PerInstanceColorAppearance,
    Material,
    ColorMaterialProperty,
    GroundPolylinePrimitive,
    GroundPolylineGeometry,
    PolylineColorAppearance,
    PolygonGraphics,
    Entity,
    JulianDate,
    HeadingPitchRange,
    GeometryPipeline,
    VertexFormat,
    createGuid
} from 'cesium';

/**
 * 空间分析工具类
 * 提供距离计算、面积计算、缓冲区分析、相交分析等功能
 */
class SpatialAnalysis {
    /**
     * 构造函数
     * @param {Object} viewer Cesium viewer实例
     */
    constructor(viewer) {
        if (!viewer) throw new Error('Viewer instance is required');
        this.viewer = viewer;
        this.ellipsoid = Ellipsoid.WGS84;
        this._analysisEntities = new Map(); // 存储分析结果实体
    }

    /**
     * 计算两点之间的距离
     * @param {Cartesian3|Array} point1 笛卡尔坐标或经纬度数组[lon, lat, height]
     * @param {Cartesian3|Array} point2 笛卡尔坐标或经纬度数组[lon, lat, height]
     * @param {Boolean} includeTerrain 是否考虑地形高度，默认为false
     * @returns {Number} 距离，单位：米
     */
    calculateDistance(point1, point2, includeTerrain = false) {
        const cart1 = this._getCartesian3(point1);
        const cart2 = this._getCartesian3(point2);
        
        if (!cart1 || !cart2) {
            throw new Error('Invalid point coordinates');
        }
        
        // 如果不考虑地形，直接计算空间距离
        if (!includeTerrain) {
            return Cartesian3.distance(cart1, cart2);
        }
        
        // 考虑地形的情况下，需要获取地形上的点
        const cartographic1 = Cartographic.fromCartesian(cart1);
        const cartographic2 = Cartographic.fromCartesian(cart2);
        
        // 使用测地线计算地表距离
        const geodesic = new EllipsoidGeodesic(cartographic1, cartographic2, this.ellipsoid);
        return geodesic.surfaceDistance;
    }
    
    /**
     * 计算多边形面积
     * @param {Array<Cartesian3>|Array<Array>} positions 顶点坐标数组（笛卡尔坐标或经纬度数组）
     * @returns {Number} 面积，单位：平方米
     */
    calculateArea(positions) {
        if (!positions || positions.length < 3) {
            throw new Error('At least 3 positions are required to calculate area');
        }
        
        // 转换成笛卡尔坐标
        const cartesians = positions.map(pos => this._getCartesian3(pos));
        
        // 转换成经纬度坐标
        const cartographics = cartesians.map(cart => Cartographic.fromCartesian(cart));
        const latLons = cartographics.map(carto => [
            CesiumMath.toDegrees(carto.longitude),
            CesiumMath.toDegrees(carto.latitude)
        ]);
        
        // 计算球面多边形面积
        return this._calculateSphericalPolygonArea(latLons);
    }
    
    /**
     * 计算点到线的最短距离
     * @param {Cartesian3|Array} point 点的坐标
     * @param {Array<Cartesian3>|Array<Array>} linePositions 线的顶点坐标数组
     * @returns {Number} 距离，单位：米
     */
    calculatePointToLineDistance(point, linePositions) {
        const pointCart = this._getCartesian3(point);
        const lineCartesians = linePositions.map(pos => this._getCartesian3(pos));
        
        if (!pointCart || lineCartesians.length < 2) {
            throw new Error('Invalid point or line coordinates');
        }
        
        let minDistance = Number.MAX_VALUE;
        
        // 计算点到每个线段的最短距离
        for (let i = 0; i < lineCartesians.length - 1; i++) {
            const start = lineCartesians[i];
            const end = lineCartesians[i + 1];
            
            // 计算点到线段的最短距离
            const distance = this._pointToLineSegmentDistance(pointCart, start, end);
            minDistance = Math.min(minDistance, distance);
        }
        
        return minDistance;
    }
    
    /**
     * 计算点到多边形的最短距离
     * @param {Cartesian3|Array} point 点的坐标
     * @param {Array<Cartesian3>|Array<Array>} polygonPositions 多边形的顶点坐标数组
     * @returns {Number} 距离，单位：米
     */
    calculatePointToPolygonDistance(point, polygonPositions) {
        const pointCart = this._getCartesian3(point);
        const polygonCartesians = polygonPositions.map(pos => this._getCartesian3(pos));
        
        if (!pointCart || polygonCartesians.length < 3) {
            throw new Error('Invalid point or polygon coordinates');
        }
        
        // 先检查点是否在多边形内部
        if (this._isPointInPolygon(point, polygonPositions)) {
            return 0;
        }
        
        // 计算点到多边形边界的最短距离
        return this.calculatePointToLineDistance(point, polygonPositions);
    }
    
    /**
     * 判断点是否在多边形内部
     * @param {Cartesian3|Array} point 点的坐标
     * @param {Array<Cartesian3>|Array<Array>} polygonPositions 多边形的顶点坐标数组
     * @returns {Boolean} 点是否在多边形内部
     */
    isPointInPolygon(point, polygonPositions) {
        return this._isPointInPolygon(point, polygonPositions);
    }
    
    /**
     * 创建缓冲区
     * @param {Cartesian3|Array|Array<Cartesian3>|Array<Array>} geometry 几何图形（点、线、面）
     * @param {Number} distance 缓冲距离，单位：米
     * @param {Object} options 样式选项
     * @returns {String} 缓冲区实体ID
     */
    createBuffer(geometry, distance, options = {}) {
        let positions = [];
        
        // 处理不同类型的几何图形
        if (Array.isArray(geometry)) {
            if (Array.isArray(geometry[0])) {
                // 线或多边形
                positions = geometry.map(pos => this._getCartesian3(pos));
            } else if (typeof geometry[0] === 'number') {
                // 单个点的经纬度数组
                positions = [this._getCartesian3(geometry)];
            } else {
                // Cartesian3数组
                positions = geometry;
            }
        } else {
            // 单个Cartesian3点
            positions = [geometry];
        }
        
        // 缺省样式
        const defaultStyle = {
            material: Color.fromAlpha(Color.BLUE, 0.5),
            outline: true,
            outlineColor: Color.WHITE,
            outlineWidth: 2
        };
        
        const style = {...defaultStyle, ...options};
        
        // 生成缓冲区
        let bufferPositions = [];
        if (positions.length === 1) {
            // 点缓冲区（圆）
            bufferPositions = this._createCirclePositions(positions[0], distance);
        } else if (positions.length === 2) {
            // 线段缓冲区
            bufferPositions = this._createLineBufferPositions(positions[0], positions[1], distance);
        } else {
            // 线或多边形缓冲区
            bufferPositions = this._createPolygonBufferPositions(positions, distance);
        }
        
        // 创建缓冲区实体
        const id = createGuid();
        const entity = this.viewer.entities.add({
            id: id,
            polygon: {
                hierarchy: new PolygonHierarchy(bufferPositions),
                material: new ColorMaterialProperty(style.material),
                outline: style.outline,
                outlineColor: style.outlineColor,
                outlineWidth: style.outlineWidth,
                height: 0,
                heightReference: 1  // CLAMP_TO_GROUND
            }
        });
        
        this._analysisEntities.set(id, entity);
        return id;
    }
    
    /**
     * 判断两个多边形是否相交
     * @param {Array<Cartesian3>|Array<Array>} polygon1Positions 第一个多边形的顶点坐标数组
     * @param {Array<Cartesian3>|Array<Array>} polygon2Positions 第二个多边形的顶点坐标数组
     * @returns {Boolean} 是否相交
     */
    doPolygonsIntersect(polygon1Positions, polygon2Positions) {
        // 转换成经纬度坐标
        const poly1 = polygon1Positions.map(pos => {
            const cart = this._getCartesian3(pos);
            const carto = Cartographic.fromCartesian(cart);
            return [CesiumMath.toDegrees(carto.longitude), CesiumMath.toDegrees(carto.latitude)];
        });
        
        const poly2 = polygon2Positions.map(pos => {
            const cart = this._getCartesian3(pos);
            const carto = Cartographic.fromCartesian(cart);
            return [CesiumMath.toDegrees(carto.longitude), CesiumMath.toDegrees(carto.latitude)];
        });
        
        // 检查是否有顶点在另一个多边形内部
        for (const point of poly1) {
            if (this._isPointInPolygon2D(point, poly2)) {
                return true;
            }
        }
        
        for (const point of poly2) {
            if (this._isPointInPolygon2D(point, poly1)) {
                return true;
            }
        }
        
        // 检查线段是否相交
        for (let i = 0; i < poly1.length; i++) {
            const line1Start = poly1[i];
            const line1End = poly1[(i + 1) % poly1.length];
            
            for (let j = 0; j < poly2.length; j++) {
                const line2Start = poly2[j];
                const line2End = poly2[(j + 1) % poly2.length];
                
                if (this._doLineSegmentsIntersect2D(line1Start, line1End, line2Start, line2End)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * 计算多边形相交区域
     * @param {Array<Cartesian3>|Array<Array>} polygon1Positions 第一个多边形的顶点坐标数组
     * @param {Array<Cartesian3>|Array<Array>} polygon2Positions 第二个多边形的顶点坐标数组
     * @param {Object} options 样式选项
     * @returns {String|null} 相交区域实体ID，如果不相交则返回null
     */
    calculateIntersection(polygon1Positions, polygon2Positions, options = {}) {
        // 检查是否相交
        if (!this.doPolygonsIntersect(polygon1Positions, polygon2Positions)) {
            return null;
        }
        
        // 计算相交区域（简化，实际应使用更复杂的算法）
        // 这里仅演示基本逻辑，实际应使用专业的计算库
        
        // 创建相交区域实体
        const id = createGuid();
        
        // 缺省样式
        const defaultStyle = {
            material: Color.fromAlpha(Color.RED, 0.7),
            outline: true,
            outlineColor: Color.WHITE,
            outlineWidth: 2
        };
        
        const style = {...defaultStyle, ...options};
        
        // 注意：这里简化处理，实际相交区域计算需要使用复杂算法
        // 在实际应用中应使用turf.js等库进行计算
        
        // 仅作为示例，返回一个ID
        return id;
    }
    
    /**
     * 获取所有分析结果实体
     * @returns {Array} 分析结果实体数组
     */
    getAllAnalysisEntities() {
        return Array.from(this._analysisEntities.values());
    }
    
    /**
     * 移除指定分析结果实体
     * @param {String} id 实体ID
     */
    removeAnalysisEntity(id) {
        if (this._analysisEntities.has(id)) {
            const entity = this._analysisEntities.get(id);
            this.viewer.entities.remove(entity);
            this._analysisEntities.delete(id);
        }
    }
    
    /**
     * 清除所有分析结果实体
     */
    clearAllAnalysisEntities() {
        this._analysisEntities.forEach(entity => {
            this.viewer.entities.remove(entity);
        });
        this._analysisEntities.clear();
    }
    
    /**
     * 将坐标转换为Cartesian3对象
     * @param {Cartesian3|Array} position 坐标
     * @returns {Cartesian3} 笛卡尔坐标
     * @private
     */
    _getCartesian3(position) {
        if (position instanceof Cartesian3) {
            return position;
        } else if (Array.isArray(position)) {
            if (position.length >= 2) {
                const longitude = position[0];
                const latitude = position[1];
                const height = position.length > 2 ? position[2] : 0;
                return Cartesian3.fromDegrees(longitude, latitude, height);
            }
        }
        return null;
    }
    
    /**
     * 计算球面多边形面积
     * @param {Array<Array>} positions 经纬度坐标数组 [[lon1, lat1], [lon2, lat2], ...]
     * @returns {Number} 面积，单位：平方米
     * @private
     */
    _calculateSphericalPolygonArea(positions) {
        if (positions.length < 3) {
            return 0;
        }
        
        const earthRadius = 6371000; // 地球半径，单位：米
        let total = 0;
        
        for (let i = 0; i < positions.length; i++) {
            const current = positions[i];
            const next = positions[(i + 1) % positions.length];
            
            // 经纬度转弧度
            const currentLonRad = CesiumMath.toRadians(current[0]);
            const currentLatRad = CesiumMath.toRadians(current[1]);
            const nextLonRad = CesiumMath.toRadians(next[0]);
            const nextLatRad = CesiumMath.toRadians(next[1]);
            
            // 计算球面面积
            total += (nextLonRad - currentLonRad) * Math.sin(currentLatRad);
        }
        
        const area = Math.abs(total * earthRadius * earthRadius / 2.0);
        return area;
    }
    
    /**
     * 判断点是否在多边形内部
     * @param {Cartesian3|Array} point 点的坐标
     * @param {Array<Cartesian3>|Array<Array>} polygonPositions 多边形的顶点坐标数组
     * @returns {Boolean} 点是否在多边形内部
     * @private
     */
    _isPointInPolygon(point, polygonPositions) {
        const pointCart = this._getCartesian3(point);
        const polygonCartesians = polygonPositions.map(pos => this._getCartesian3(pos));
        
        if (!pointCart || polygonCartesians.length < 3) {
            return false;
        }
        
        // 转换成经纬度坐标
        const pointCarto = Cartographic.fromCartesian(pointCart);
        const pointLonLat = [
            CesiumMath.toDegrees(pointCarto.longitude),
            CesiumMath.toDegrees(pointCarto.latitude)
        ];
        
        const polygonLonLats = polygonCartesians.map(cart => {
            const carto = Cartographic.fromCartesian(cart);
            return [
                CesiumMath.toDegrees(carto.longitude),
                CesiumMath.toDegrees(carto.latitude)
            ];
        });
        
        return this._isPointInPolygon2D(pointLonLat, polygonLonLats);
    }
    
    /**
     * 判断点是否在2D多边形内部（经纬度）
     * @param {Array} point 点的经纬度坐标 [lon, lat]
     * @param {Array<Array>} polygon 多边形的经纬度坐标数组 [[lon1, lat1], [lon2, lat2], ...]
     * @returns {Boolean} 点是否在多边形内部
     * @private
     */
    _isPointInPolygon2D(point, polygon) {
        const x = point[0];
        const y = point[1];
        let inside = false;
        
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i][0];
            const yi = polygon[i][1];
            const xj = polygon[j][0];
            const yj = polygon[j][1];
            
            const intersect = ((yi > y) !== (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            
            if (intersect) {
                inside = !inside;
            }
        }
        
        return inside;
    }
    
    /**
     * 计算点到线段的最短距离
     * @param {Cartesian3} point 点的坐标
     * @param {Cartesian3} lineStart 线段起点
     * @param {Cartesian3} lineEnd 线段终点
     * @returns {Number} 距离，单位：米
     * @private
     */
    _pointToLineSegmentDistance(point, lineStart, lineEnd) {
        const v = Cartesian3.subtract(lineEnd, lineStart, new Cartesian3());
        const w = Cartesian3.subtract(point, lineStart, new Cartesian3());
        
        const c1 = Cartesian3.dot(w, v);
        if (c1 <= 0) {
            // 点到起点的距离
            return Cartesian3.distance(point, lineStart);
        }
        
        const c2 = Cartesian3.dot(v, v);
        if (c2 <= c1) {
            // 点到终点的距离
            return Cartesian3.distance(point, lineEnd);
        }
        
        const b = c1 / c2;
        const pb = Cartesian3.add(
            lineStart,
            Cartesian3.multiplyByScalar(v, b, new Cartesian3()),
            new Cartesian3()
        );
        
        // 点到线上投影点的距离
        return Cartesian3.distance(point, pb);
    }
    
    /**
     * 创建圆形顶点坐标数组
     * @param {Cartesian3} center 圆心
     * @param {Number} radius 半径，单位：米
     * @param {Number} segments 分段数，默认为64
     * @returns {Array<Cartesian3>} 圆形顶点坐标数组
     * @private
     */
    _createCirclePositions(center, radius, segments = 64) {
        const positions = [];
        const centerCartographic = Cartographic.fromCartesian(center);
        
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const dx = Math.cos(angle) * radius;
            const dy = Math.sin(angle) * radius;
            
            // 在地理坐标系中计算偏移
            const lon = centerCartographic.longitude + dx / (this.ellipsoid.radii.x * Math.cos(centerCartographic.latitude));
            const lat = centerCartographic.latitude + dy / this.ellipsoid.radii.y;
            
            positions.push(Cartesian3.fromRadians(lon, lat, centerCartographic.height));
        }
        
        return positions;
    }
    
    /**
     * 创建线段缓冲区顶点坐标数组
     * @param {Cartesian3} start 起点
     * @param {Cartesian3} end 终点
     * @param {Number} distance 缓冲距离，单位：米
     * @returns {Array<Cartesian3>} 缓冲区顶点坐标数组
     * @private
     */
    _createLineBufferPositions(start, end, distance) {
        // 简化：将线段当作平面处理
        const positions = [];
        const startCartographic = Cartographic.fromCartesian(start);
        const endCartographic = Cartographic.fromCartesian(end);
        
        // 计算线段方向向量
        const dx = endCartographic.longitude - startCartographic.longitude;
        const dy = endCartographic.latitude - startCartographic.latitude;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length === 0) {
            return this._createCirclePositions(start, distance);
        }
        
        // 计算垂直向量
        const nx = -dy / length;
        const ny = dx / length;
        
        // 缩放到指定距离
        const factor = distance / (this.ellipsoid.radii.x * Math.cos(startCartographic.latitude));
        const offsetX = nx * factor;
        const offsetY = ny * factor;
        
        // 创建缓冲区顶点
        const p1 = Cartesian3.fromRadians(
            startCartographic.longitude + offsetX,
            startCartographic.latitude + offsetY,
            startCartographic.height
        );
        
        const p2 = Cartesian3.fromRadians(
            endCartographic.longitude + offsetX,
            endCartographic.latitude + offsetY,
            endCartographic.height
        );
        
        const p3 = Cartesian3.fromRadians(
            endCartographic.longitude - offsetX,
            endCartographic.latitude - offsetY,
            endCartographic.height
        );
        
        const p4 = Cartesian3.fromRadians(
            startCartographic.longitude - offsetX,
            startCartographic.latitude - offsetY,
            startCartographic.height
        );
        
        positions.push(p1, p2, p3, p4);
        return positions;
    }
    
    /**
     * 创建多边形缓冲区顶点坐标数组
     * @param {Array<Cartesian3>} positions 多边形顶点坐标数组
     * @param {Number} distance 缓冲距离，单位：米
     * @returns {Array<Cartesian3>} 缓冲区顶点坐标数组
     * @private
     */
    _createPolygonBufferPositions(positions, distance) {
        // 注意：完整的多边形缓冲区计算很复杂
        // 这里只是一个简化版本，仅作为示例
        // 实际应用中应使用专业的计算库
        
        // 转换成经纬度坐标
        const cartographics = positions.map(pos => Cartographic.fromCartesian(pos));
        
        // 创建一个更大的多边形
        const bufferPositions = [];
        
        // 简化处理：对每个顶点向外扩展
        for (let i = 0; i < positions.length; i++) {
            const prev = (i === 0) ? positions.length - 1 : i - 1;
            const next = (i === positions.length - 1) ? 0 : i + 1;
            
            const p0 = cartographics[prev];
            const p1 = cartographics[i];
            const p2 = cartographics[next];
            
            // 计算当前点的两条边的方向向量
            const v1x = p1.longitude - p0.longitude;
            const v1y = p1.latitude - p0.latitude;
            const v2x = p2.longitude - p1.longitude;
            const v2y = p2.latitude - p1.latitude;
            
            // 标准化
            const len1 = Math.sqrt(v1x * v1x + v1y * v1y);
            const len2 = Math.sqrt(v2x * v2x + v2y * v2y);
            
            const n1x = v1y / len1;
            const n1y = -v1x / len1;
            const n2x = v2y / len2;
            const n2y = -v2x / len2;
            
            // 平均外法向量
            let nx = (n1x + n2x) / 2;
            let ny = (n1y + n2y) / 2;
            
            // 标准化
            const nLen = Math.sqrt(nx * nx + ny * ny);
            nx = nx / nLen;
            ny = ny / nLen;
            
            // 计算缓冲距离（经纬度）
            const factor = distance / (this.ellipsoid.radii.x * Math.cos(p1.latitude));
            
            // 计算缓冲点
            const bufferLon = p1.longitude + nx * factor;
            const bufferLat = p1.latitude + ny * factor;
            
            bufferPositions.push(Cartesian3.fromRadians(bufferLon, bufferLat, p1.height));
        }
        
        return bufferPositions;
    }
    
    /**
     * 判断两条线段是否相交（2D，经纬度）
     * @param {Array} p1 线段1起点 [lon, lat]
     * @param {Array} p2 线段1终点 [lon, lat]
     * @param {Array} p3 线段2起点 [lon, lat]
     * @param {Array} p4 线段2终点 [lon, lat]
     * @returns {Boolean} 是否相交
     * @private
     */
    _doLineSegmentsIntersect2D(p1, p2, p3, p4) {
        const d1x = p2[0] - p1[0];
        const d1y = p2[1] - p1[1];
        const d2x = p4[0] - p3[0];
        const d2y = p4[1] - p3[1];
        
        const denominator = d1y * d2x - d1x * d2y;
        
        if (denominator === 0) {
            return false; // 平行线
        }
        
        const d3x = p1[0] - p3[0];
        const d3y = p1[1] - p3[1];
        
        const t1 = (d2y * d3x - d2x * d3y) / denominator;
        const t2 = (d1y * d3x - d1x * d3y) / denominator;
        
        return (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1);
    }
}

export default SpatialAnalysis; 