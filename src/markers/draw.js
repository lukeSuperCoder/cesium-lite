import {
    CustomDataSource,
    ScreenSpaceEventHandler,
    Cartesian3,
    Color,
    Math as CesiumMath,
    CallbackProperty,
    PolylineDashMaterialProperty,
    HeightReference,
    PolygonHierarchy,
    Cartographic,
    ScreenSpaceEventType
} from "cesium";

class DrawTool {
    /**
     * 构造函数
     * @param viewer
     */
    constructor(viewer, options) {
        this.viewer = viewer;
        this._drawHandler = null; //事件
        this._dataSource = null; //存储entities
        this._tempPositions = []; //存储点集合
        this._mousePos = null; //移动点
        this._drawType = null; //类型
        this.options = options;
        this._originalCursor = null; // 保存原始光标样式
    }

    /**
     * 激活点线面
     * @param drawType
     */
    draw(drawType, callback) {
        this.clearAll();
        this._drawType = drawType;
        this._dataSource = new CustomDataSource("_dataSource");
        this.viewer.dataSources.add(this._dataSource);
        // 保存原始光标样式并设置为小圆点
        this._originalCursor = this.viewer.container.style.cursor;
        this.viewer.container.style.cursor = 'crosshair';
        this._registerEvents(callback); //注册鼠标事件
    }

    /**
     * 注册鼠标事件
     */
    _registerEvents(callback) {
        this._drawHandler = new ScreenSpaceEventHandler(
            this.viewer.scene.canvas
        );
        this.viewer.scene.globe.depthTestAgainstTerrain = true; //开启深度测试
        switch (this._drawType) {
            case "Point": {
                this._leftClickEventForPoint();
                break;
            }
            case "Polyline": {
                this._leftClickEventForPolyline();
                this._mouseMoveEventForPolyline();
                this._rightClickEventForPolyline(callback);
                this._doubleClickEventForPolyline(callback);
                break;
            }
            case "Polygon": {
                this._leftClickEventForPolygon();
                this._mouseMoveEventForPolygon();
                this._rightClickEventForPolygon(callback);
                this._doubleClickEventForPolygon(callback);
                break;
            }
        }
    }

    /**
     * 鼠标事件之绘制点的左击事件
     * @private
     */
    _leftClickEventForPoint() {
        this._drawHandler.setInputAction((e) => {
            // this.viewer._element.style.cursor = 'default';
            let p = this.viewer.scene.pickPosition(e.position);
            if (!p) return;
            //手动给他提高50m，也可以取消哈
            let carto_pt = Cartographic.fromCartesian(p);
            let p1 = [
                CesiumMath.toDegrees(carto_pt.longitude),
                CesiumMath.toDegrees(carto_pt.latitude),
                carto_pt.height + 50,
            ];
            this._addPoint(p1);
        }, ScreenSpaceEventType.LEFT_CLICK);
    }

    /**
     * 鼠标事件之绘制线的左击事件
     * @private
     */
    _leftClickEventForPolyline() {
        this._drawHandler.setInputAction((e) => {
            let p = this.viewer.scene.pickPosition(e.position);
            if (!p) return;
            this._tempPositions.push(p);
            this._addPolyline();
        }, ScreenSpaceEventType.LEFT_CLICK);
    }

    /**
     * 鼠标事件之绘制线的移动事件
     * @private
     */
    _mouseMoveEventForPolyline() {
        this._drawHandler.setInputAction((e) => {
            let p = this.viewer.scene.pickPosition(e.endPosition);
            if (!p) return;
            this._mousePos = p;
        }, ScreenSpaceEventType.MOUSE_MOVE);
    }

    /**
     * 鼠标事件之绘制线的右击事件
     * @private
     */
    _rightClickEventForPolyline() {
        this._drawHandler.setInputAction((e) => {
            let p = this.viewer.scene.pickPosition(e.position);
            if (!p) return;
            this._removeAllEvent();
            this._dataSource.entities.removeAll();
            this._dataSource.entities.add({
                polyline: {
                    positions: this._tempPositions,
                    clampToGround: true, //贴地
                    width: 3,
                    material: new PolylineDashMaterialProperty({
                        color: Color.YELLOW,
                    }),
                    depthFailMaterial: new PolylineDashMaterialProperty({
                        color: Color.YELLOW,
                    }),
                },
            });
        }, ScreenSpaceEventType.RIGHT_CLICK);
    }

    /**
     * 鼠标事件之绘制线的双击事件
     * @private
     */
    _doubleClickEventForPolyline(callback) {
        this._drawHandler.setInputAction((e) => {
            let p = this.viewer.scene.pickPosition(e.position);
            if (!p) return;
            this._removeAllEvent();
            const polylineEntity = this._dataSource.entities.add({
                polyline: {
                    positions: this._tempPositions,
                    clampToGround: true, //贴地
                    width: 3,
                    material: new PolylineDashMaterialProperty({
                        color: Color.YELLOW,
                    }),
                    depthFailMaterial: new PolylineDashMaterialProperty({
                        color: Color.YELLOW,
                    }),
                },
            });
            // 调用回调函数，传递绘制完成的实体
            if (callback && typeof callback === 'function') {
                callback(polylineEntity);
            }
        }, ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    }

    /**
     * 鼠标事件之绘制面的左击事件
     * @private
     */
    _leftClickEventForPolygon() {
        this._drawHandler.setInputAction((e) => {
            let p = this.viewer.scene.pickPosition(e.position);
            if (!p) return;
            this._tempPositions.push(p);
            this._addPolygon();
        }, ScreenSpaceEventType.LEFT_CLICK);
    }

    /**
     * 鼠标事件之绘制面的移动事件
     * @private
     */
    _mouseMoveEventForPolygon() {
        this._drawHandler.setInputAction((e) => {
            let p = this.viewer.scene.pickPosition(e.endPosition);
            if (!p) return;
            this._mousePos = p;
        }, ScreenSpaceEventType.MOUSE_MOVE);
    }

    /**
     * 鼠标事件之绘制面的右击事件
     * @private
     */
    _rightClickEventForPolygon(callback) {
        this._drawHandler.setInputAction((e) => {
            let p = this.viewer.scene.pickPosition(e.position);
            if (!p) return;
            
            // 检查点数是否足够
            if (this._tempPositions.length < 3) {
                alert('请至少绘制3个点来构成一个面');
                return;
            }
            
            this._tempPositions.push(this._tempPositions[0]);
            this._removeAllEvent();
            this._dataSource.entities.removeAll();
            const polygonEntity = this._dataSource.entities.add({
                polyline: {
                    positions: this._tempPositions,
                    clampToGround: true, //贴地
                    width: 3,
                    material: new PolylineDashMaterialProperty({
                        color: Color.YELLOW,
                    }),
                    depthFailMaterial: new PolylineDashMaterialProperty({
                        color: Color.YELLOW,
                    }),
                },
                polygon: {
                    hierarchy: this._tempPositions,
                    extrudedHeightReference: HeightReference.CLAMP_TO_GROUND,
                    material: Color.RED.withAlpha(0.4),
                    clampToGround: true,
                },
            });
            // 调用回调函数，传递绘制完成的实体或其他相关数据
            if (callback && typeof callback === 'function') {
                callback(polygonEntity);
            }
        }, ScreenSpaceEventType.RIGHT_CLICK);
    }

    /**
     * 鼠标事件之绘制面的双击事件
     * @private
     */
    _doubleClickEventForPolygon(callback) {
        this._drawHandler.setInputAction((e) => {
            let p = this.viewer.scene.pickPosition(e.position);
            if (!p) return;
            
            // 检查点数是否足够
            if (this._tempPositions.length < 3) {
                alert('请至少绘制3个点来构成一个面');
                return;
            }
            
            this._tempPositions.push(this._tempPositions[0]);
            this._removeAllEvent();
            this._dataSource.entities.removeAll();
            const polygonEntity = this._dataSource.entities.add({
                polyline: {
                    positions: this._tempPositions,
                    clampToGround: true, //贴地
                    width: 3,
                    material: new PolylineDashMaterialProperty({
                        color: Color.YELLOW,
                    }),
                    depthFailMaterial: new PolylineDashMaterialProperty({
                        color: Color.YELLOW,
                    }),
                },
                polygon: {
                    hierarchy: this._tempPositions,
                    extrudedHeightReference: HeightReference.CLAMP_TO_GROUND,
                    material: Color.RED.withAlpha(0.4),
                    clampToGround: true,
                },
            });
            // 调用回调函数，传递绘制完成的实体或其他相关数据
            if (callback && typeof callback === 'function') {
                callback(polygonEntity);
            }
        }, ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    }

    /**
     * 移除所有鼠标事件
     * @private
     */
    _removeAllEvent() {
        this._drawHandler &&
            (this._drawHandler.removeInputAction(
                    ScreenSpaceEventType.LEFT_CLICK
                ),
                this._drawHandler.removeInputAction(
                    ScreenSpaceEventType.MOUSE_MOVE
                ),
                this._drawHandler.removeInputAction(
                    ScreenSpaceEventType.RIGHT_CLICK
                ),
                this._drawHandler.destroy(),
                (this._drawHandler = null));
        // 恢复原始光标样式
        if (this._originalCursor !== null) {
            this.viewer.container.style.cursor = this._originalCursor;
            this._originalCursor = null;
        }
    }

    /**
     * 重置所有参数
     * @private
     */
    _resetParams() {
        if (this._dataSource != null) {
            this._dataSource.entities.removeAll();
            this.viewer.dataSources.remove(this._dataSource);
        }
        this._dataSource = null;
        this._tempPositions = [];
        this._mousePos = null;
        this._drawType = null;
        // 恢复原始光标样式
        if (this._originalCursor) {
            this.viewer.container.style.cursor = this._originalCursor;
            this._originalCursor = null;
        }
    }

    /**
     * 清除
     */
    clearAll() {
        this._removeAllEvent();
        this._resetParams();
    }

    /**
     * 画点
     * @param p
     * @private
     */
    _addPoint(p) {
        this._dataSource.entities.add({
            position: Cartesian3.fromDegrees(p[0], p[1], p[2]),
            point: {
                color: Color.RED,
                pixelSize: 10,
                outlineColor: Color.YELLOW,
                outlineWidth: 2,
                // heightReference:Cesium.HeightReference.CLAMP_TO_GROUND
            },
        });
    }

    /**
     * 画线
     * @private
     */
    _addPolyline() {
        this._dataSource.entities.add({
            polyline: {
                positions: new CallbackProperty(() => {
                    let c = Array.from(this._tempPositions);
                    if (this._mousePos) {
                        c.push(this._mousePos);
                    }
                    return c;
                }, false),
                clampToGround: true, //贴地
                width: 3,
                material: new PolylineDashMaterialProperty({
                    color: Color.YELLOW,
                }),
                depthFailMaterial: new PolylineDashMaterialProperty({
                    color: Color.YELLOW,
                }),
            },
        });
    }

    /**
     * 画面
     * @private
     */
    _addPolygon() {
        if (this._tempPositions.length == 1) {
            //一个顶点+移动点
            this._dataSource.entities.add({
                polyline: {
                    positions: new CallbackProperty(() => {
                        let c = Array.from(this._tempPositions);
                        if (this._mousePos) {
                            c.push(this._mousePos);
                        }
                        return c;
                    }, false),
                    clampToGround: true, //贴地
                    width: 3,
                    material: new PolylineDashMaterialProperty({
                        color: Color.YELLOW,
                    }),
                    depthFailMaterial: new PolylineDashMaterialProperty({
                        color: Color.YELLOW,
                    }),
                },
            });
        } else {
            this._dataSource.entities.removeAll();
            //两个顶点+移动点
            this._dataSource.entities.add({
                polygon: {
                    hierarchy: new CallbackProperty(() => {
                        let poss = Array.from(this._tempPositions);
                        if (this._mousePos) {
                            poss.push(this._mousePos);
                        }
                        return new PolygonHierarchy(poss);
                    }, false),
                    extrudedHeightReference: HeightReference.CLAMP_TO_GROUND,
                    material: Color.RED.withAlpha(0.4),
                    clampToGround: true,
                },
                polyline: {
                    positions: new CallbackProperty(() => {
                        let c = Array.from(this._tempPositions);
                        if (this._mousePos) {
                            c.push(this._mousePos);
                            c.push(c[0]); //与第一个点相连
                        }
                        return c;
                    }, false),
                    clampToGround: true, //贴地
                    width: 3,
                    material: new PolylineDashMaterialProperty({
                        color: Color.YELLOW,
                    }),
                    depthFailMaterial: new PolylineDashMaterialProperty({
                        color: Color.YELLOW,
                    }),
                },
            });
        }
    }
}
export default DrawTool;