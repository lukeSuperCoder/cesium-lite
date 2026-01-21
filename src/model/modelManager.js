import {
  Cartesian3,
  Color,
  ColorBlendMode,
  HeadingPitchRoll,
  Math as CesiumMath,
  Matrix4,
  Model,
  ModelAnimationLoop,
  ShadowMode,
  Transforms,
} from "cesium";

/**
 * ModelManager - 三维模型管理器
 * 封装 Cesium.Model 的加载、管理、样式与动画控制。
 */
class ModelManager {
  /**
   * @param {Cesium.Viewer} viewer Cesium viewer 实例
   * @param {Object} options 全局配置
   */
  constructor(viewer, options = {}) {
    if (!viewer) throw new Error("Viewer instance is required");
    this.viewer = viewer;

    this.defaultOptions = {
      maximumMemoryUsage: 512,
      defaultScale: 1.0,
      defaultShow: true,

      shadows: ShadowMode.ENABLED,

      incrementallyLoadTextures: true,
      backFaceCulling: true,

      defaultAnimationLoop: ModelAnimationLoop.REPEAT,
      defaultAnimationSpeed: 1.0,
      ...options,
    };

    this._models = new Map(); // modelId -> wrapper
  }

  /**
   * 添加模型（URL 或 Blob/File）
   * @param {Object} config
   * @returns {String} modelId
   */
  addModel(config) {
    if (!config) throw new Error("config is required");
    if (!config.url) throw new Error("config.url is required");
    if (!config.position) throw new Error("config.position is required");

    const modelId = this._generateModelId(config.id);
    const wrapper = {
      id: modelId,
      model: null,
      config: this._normalizeConfig(config),
      isLoaded: false,
      currentAnimation: null,
      _objectUrl: null,
    };
    this._models.set(modelId, wrapper);

    const url = this._resolveUrl(wrapper);
    const modelMatrix = this._buildModelMatrix(
      wrapper.config.position,
      wrapper.config.orientation,
      wrapper.config.scale
    );

    // Cesium 1.127+ 使用 fromGltfAsync（fromGltf 已移除）
    if (typeof Model.fromGltfAsync === "function") {
      (async () => {
        try {
          const model = await Model.fromGltfAsync({
            url,
            modelMatrix,
            show: wrapper.config.show,
            shadows: wrapper.config.shadows,
            maximumMemoryUsage: wrapper.config.maximumMemoryUsage,
            incrementallyLoadTextures: wrapper.config.incrementallyLoadTextures,
            backFaceCulling: wrapper.config.backFaceCulling,
          });

          this.viewer.scene.primitives.add(model);
          wrapper.model = model;

          await this._waitModelReady(model);

          wrapper.isLoaded = true;

          // 初始样式（在 model 可用后应用）
          if (wrapper.config.color) {
            this.setColor(modelId, wrapper.config.color.color, wrapper.config.color.alpha);
          }
          if (wrapper.config.silhouette) {
            this.setSilhouette(
              modelId,
              wrapper.config.silhouette.color,
              wrapper.config.silhouette.size
            );
          }
          if (wrapper.config.shadows !== undefined) {
            this.setShadows(modelId, wrapper.config.shadows);
          }

          wrapper.config.onLoad?.(modelId, model);
        } catch (error) {
          // 加载失败：清理映射 + object URL
          this._models.delete(modelId);
          this._revokeObjectUrl(wrapper);
          wrapper.config.onError?.(modelId, error);
        }
      })();
    } else if (typeof Model.fromGltf === "function") {
      // 兼容老版本 Cesium（仍提供 fromGltf + readyPromise）
      const model = this.viewer.scene.primitives.add(
        Model.fromGltf({
          url,
          modelMatrix,
          show: wrapper.config.show,
          shadows: wrapper.config.shadows,
          maximumMemoryUsage: wrapper.config.maximumMemoryUsage,
          incrementallyLoadTextures: wrapper.config.incrementallyLoadTextures,
          backFaceCulling: wrapper.config.backFaceCulling,
        })
      );

      wrapper.model = model;

      if (wrapper.config.color) {
        this.setColor(modelId, wrapper.config.color.color, wrapper.config.color.alpha);
      }

      model.readyPromise
        .then(() => {
          wrapper.isLoaded = true;
          wrapper.config.onLoad?.(modelId, model);
        })
        .catch((error) => {
          try {
            this.viewer.scene.primitives.remove(model);
            if (model && !model.isDestroyed?.()) model.destroy?.();
          } catch (_) {
            // ignore
          }
          this._models.delete(modelId);
          this._revokeObjectUrl(wrapper);
          wrapper.config.onError?.(modelId, error);
        });
    } else {
      this._models.delete(modelId);
      this._revokeObjectUrl(wrapper);
      throw new Error("Cesium.Model.fromGltfAsync is not available");
    }

    return modelId;
  }

  /**
   * 移除模型
   * @param {String} modelId
   * @returns {Boolean}
   */
  removeModel(modelId) {
    const wrapper = this._models.get(modelId);
    if (!wrapper) return false;

    const { model } = wrapper;
    try {
      if (model) {
        this.viewer.scene.primitives.remove(model);
        if (!model.isDestroyed?.()) model.destroy?.();
      }
    } finally {
      this._revokeObjectUrl(wrapper);
      this._models.delete(modelId);
    }

    return true;
  }

  /**
   * 更新模型属性（位置/姿态/缩放/显示/样式等）
   * @param {String} modelId
   * @param {Object} options
   * @returns {Boolean}
   */
  updateModel(modelId, options = {}) {
    const wrapper = this._models.get(modelId);
    if (!wrapper) return false;

    wrapper.config = this._normalizeConfig({ ...wrapper.config, ...options });

    const { model } = wrapper;
    if (!model) return true; // 尚未加载完成时，仅更新缓存配置

    // 位置/姿态/缩放需要重算矩阵，避免累积误差
    if (options.position || options.orientation || options.scale !== undefined) {
      model.modelMatrix = this._buildModelMatrix(
        wrapper.config.position,
        wrapper.config.orientation,
        wrapper.config.scale
      );
    }

    if (options.show !== undefined) {
      model.show = !!wrapper.config.show;
    }

    if (options.shadows !== undefined) {
      model.shadows = wrapper.config.shadows;
    }

    if (options.color) {
      this.setColor(modelId, wrapper.config.color.color, wrapper.config.color.alpha);
    }

    return true;
  }

  /**
   * 获取模型实例
   * @param {String} modelId
   * @returns {Cesium.Model|null}
   */
  getModel(modelId) {
    return this._models.get(modelId)?.model || null;
  }

  /**
   * 获取所有模型信息
   * @returns {Array<{id: String, model: Cesium.Model, config: Object, isLoaded: Boolean}>}
   */
  getAllModels() {
    return Array.from(this._models.values()).map((w) => ({
      id: w.id,
      model: w.model,
      config: w.config,
      isLoaded: w.isLoaded,
    }));
  }

  /**
   * 清除所有模型
   */
  clearModels() {
    Array.from(this._models.keys()).forEach((id) => this.removeModel(id));
  }

  /**
   * 显示模型
   * @param {String} modelId
   */
  show(modelId) {
    const wrapper = this._models.get(modelId);
    if (!wrapper) return;
    wrapper.config.show = true;
    if (wrapper.model) wrapper.model.show = true;
  }

  /**
   * 隐藏模型
   * @param {String} modelId
   */
  hide(modelId) {
    const wrapper = this._models.get(modelId);
    if (!wrapper) return;
    wrapper.config.show = false;
    if (wrapper.model) wrapper.model.show = false;
  }

  /**
   * 播放动画
   * @param {String} modelId
   * @param {Object} options
   * @returns {Boolean}
   */
  playAnimation(modelId, options = {}) {
    const wrapper = this._models.get(modelId);
    if (!wrapper?.model) return false;

    // 未 ready 时调用 activeAnimations 可能不可用
    if (!wrapper.isLoaded) {
      console.warn(`Model (${modelId}) is not ready yet`);
      return false;
    }

    const model = wrapper.model;
    // 关键点：Cesium 的模型动画依赖 Viewer.clock 推进时间。
    // Viewer 默认 clock.shouldAnimate=false，会导致 activeAnimations.add 成功但动画不动。
    this._ensureClockAnimating();

    // 提前给出更友好的提示（add 内部也会校验）
    const animations = model.sceneGraph?.components?.animations;
    if (Array.isArray(animations) && animations.length === 0) {
      console.warn(`Model (${modelId}) has no animations`);
      return false;
    }

    const index = options.index ?? 0;
    const loop = options.loop ?? this.defaultOptions.defaultAnimationLoop;
    const speed = options.speed ?? this.defaultOptions.defaultAnimationSpeed;
    const reverse = !!options.reverse;

    try {
      wrapper._paused = false;
      if (wrapper.currentAnimation) {
        this._unbindAnimationUpdate(wrapper);
        model.activeAnimations.remove(wrapper.currentAnimation);
        wrapper.currentAnimation = null;
      }

      wrapper._animationOptions = { index, loop, speed, reverse };
      wrapper._pausedSnapshot = undefined;
      wrapper.currentAnimation = model.activeAnimations.add({
        index,
        loop,
        multiplier: speed,
        reverse,
      });
      this._bindAnimationUpdate(wrapper);
      // requestRenderMode 下至少触发一次渲染
      this.viewer?.scene?.requestRender?.();
      return true;
    } catch (e) {
      console.warn(`Failed to play animation for model ${modelId}:`, e);
      return false;
    }
  }

  /**
   * 暂停动画（暂停当前动画）
   * @param {String} modelId
   * @returns {Boolean}
   */
  pauseAnimation(modelId) {
    const wrapper = this._models.get(modelId);
    if (!wrapper?.model) return false;

    // Cesium 1.127: ModelAnimation 的 multiplier/startTime/loop 等属性是只读的，不能通过赋值暂停/改速。
    // 这里用“移除动画并记录进度 -> 重新 add 恢复”的方式实现暂停/恢复。
    if (wrapper._paused) {
      return this._resumeAnimation(wrapper);
    }

    if (!wrapper.currentAnimation) return false;

    const current = wrapper.currentAnimation;
    const localTime = wrapper._lastLocalTime ?? current.localStartTime ?? 0;
    wrapper._pausedSnapshot = {
      localTime,
      localStartTime: current.localStartTime ?? 0,
      localStopTime: current.localStopTime ?? 0,
    };
    wrapper._paused = true;

    try {
      this._unbindAnimationUpdate(wrapper);
      wrapper.model.activeAnimations.remove(current);
      wrapper.currentAnimation = null;
      this.viewer?.scene?.requestRender?.();
      return true;
    } catch (e) {
      console.warn(`Failed to pause animation for model ${wrapper.id}:`, e);
      return false;
    }
  }

  /**
   * 停止动画（移除所有活动动画）
   * @param {String} modelId
   * @returns {Boolean}
   */
  stopAnimation(modelId) {
    const wrapper = this._models.get(modelId);
    if (!wrapper?.model) return false;
    try {
      this._unbindAnimationUpdate(wrapper);
      wrapper.model.activeAnimations.removeAll();
      wrapper.currentAnimation = null;
      wrapper._paused = false;
      wrapper._pausedSnapshot = undefined;
      wrapper._lastLocalTime = undefined;
      this.viewer?.scene?.requestRender?.();
      return true;
    } catch (_) {
      return false;
    }
  }

  /**
   * 设置动画速度（当前动画）
   * @param {String} modelId
   * @param {Number} speed
   * @returns {Boolean}
   */
  setAnimationSpeed(modelId, speed) {
    const wrapper = this._models.get(modelId);
    if (!wrapper?.model) return false;

    const nextSpeed = Number(speed);
    if (!Number.isFinite(nextSpeed) || nextSpeed <= 0) return false;

    // 如果当前没有在播放，但有最近一次播放参数，则更新缓存参数
    if (!wrapper.currentAnimation) {
      if (wrapper._animationOptions) wrapper._animationOptions.speed = nextSpeed;
      return true;
    }

    // 通过“移除 -> 带 offset 重新 add”来改速，并尽量保持当前进度
    const opts = wrapper._animationOptions || {
      index: 0,
      loop: this.defaultOptions.defaultAnimationLoop,
      speed: nextSpeed,
      reverse: false,
    };
    opts.speed = nextSpeed;
    wrapper._animationOptions = opts;

    const current = wrapper.currentAnimation;
    const localTime = wrapper._lastLocalTime ?? current.localStartTime ?? 0;
    const snapshot = {
      localTime,
      localStartTime: current.localStartTime ?? 0,
      localStopTime: current.localStopTime ?? 0,
    };

    try {
      this._unbindAnimationUpdate(wrapper);
      wrapper.model.activeAnimations.remove(current);
      wrapper.currentAnimation = null;
      this.viewer?.scene?.requestRender?.();
      return this._startAnimationFromSnapshot(wrapper, snapshot);
    } catch (e) {
      console.warn(`Failed to set animation speed for model ${wrapper.id}:`, e);
      return false;
    }
  }

  /**
   * 设置颜色/透明度
   * @param {String} modelId
   * @param {Cesium.Color|String} color
   * @param {Number} alpha
   * @returns {Boolean}
   */
  setColor(modelId, color, alpha = 1.0) {
    const wrapper = this._models.get(modelId);
    if (!wrapper) return false;
    wrapper.config.color = { color, alpha };
    const model = wrapper.model;
    if (!model || !wrapper.isLoaded) return true;

    let cesiumColor = color;
    if (typeof color === "string") {
      cesiumColor = Color.fromCssColorString(color);
    }
    if (!cesiumColor) return false;

    model.color = cesiumColor.withAlpha(alpha);
    model.colorBlendMode = ColorBlendMode.MIX;
    model.colorBlendAmount = 0.5;
    return true;
  }

  /**
   * 设置轮廓高亮
   * @param {String} modelId
   * @param {Cesium.Color|String} color
   * @param {Number} size
   * @returns {Boolean}
   */
  setSilhouette(modelId, color, size = 2.0) {
    const wrapper = this._models.get(modelId);
    if (!wrapper) return false;
    wrapper.config.silhouette = { color, size };
    const model = wrapper.model;
    if (!model || !wrapper.isLoaded) return true;

    let cesiumColor = color;
    if (typeof color === "string") {
      cesiumColor = Color.fromCssColorString(color);
    }
    if (!cesiumColor) return false;

    model.silhouetteColor = cesiumColor;
    model.silhouetteSize = size;
    return true;
  }

  /**
   * 设置阴影模式
   * @param {String} modelId
   * @param {Cesium.ShadowMode} shadowMode
   * @returns {Boolean}
   */
  setShadows(modelId, shadowMode) {
    const wrapper = this._models.get(modelId);
    if (!wrapper) return false;
    wrapper.config.shadows = shadowMode;
    const model = wrapper.model;
    if (!model) return true;
    model.shadows = shadowMode;
    return true;
  }

  /**
   * 销毁管理器
   */
  destroy() {
    this.clearModels();
    this.viewer = null;
  }

  _generateModelId(customId) {
    if (customId) {
      if (this._models.has(customId)) {
        console.warn(`ID "${customId}" already exists, generating a new one`);
        return `model_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      }
      return customId;
    }
    return `model_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  }

  _normalizeConfig(config) {
    const position = config.position || null;
    const orientation = {
      heading: config.orientation?.heading ?? 0,
      pitch: config.orientation?.pitch ?? 0,
      roll: config.orientation?.roll ?? 0,
    };

    return {
      ...config,
      position,
      orientation,
      scale: config.scale ?? this.defaultOptions.defaultScale,
      show: config.show ?? this.defaultOptions.defaultShow,
      shadows: config.shadows ?? this.defaultOptions.shadows,
      maximumMemoryUsage: config.maximumMemoryUsage ?? this.defaultOptions.maximumMemoryUsage,
      incrementallyLoadTextures:
        config.incrementallyLoadTextures ?? this.defaultOptions.incrementallyLoadTextures,
      backFaceCulling: config.backFaceCulling ?? this.defaultOptions.backFaceCulling,
      color: config.color || null,
      onLoad: config.onLoad,
      onError: config.onError,
    };
  }

  _resolveUrl(wrapper) {
    const { url } = wrapper.config;
    if (typeof url === "string") return url;
    if (url instanceof Blob) {
      wrapper._objectUrl = URL.createObjectURL(url);
      return wrapper._objectUrl;
    }
    throw new Error("config.url must be a string or Blob/File");
  }

  _revokeObjectUrl(wrapper) {
    if (wrapper?._objectUrl) {
      try {
        URL.revokeObjectURL(wrapper._objectUrl);
      } catch (_) {
        // ignore
      }
      wrapper._objectUrl = null;
    }
  }

  _buildModelMatrix(position, orientation, scale) {
    const pos = Cartesian3.fromDegrees(
      position.longitude,
      position.latitude,
      position.height || 0
    );

    const hpr = new HeadingPitchRoll(
      CesiumMath.toRadians(orientation.heading || 0),
      CesiumMath.toRadians(orientation.pitch || 0),
      CesiumMath.toRadians(orientation.roll || 0)
    );

    const modelMatrix = Transforms.headingPitchRollToFixedFrame(pos, hpr);
    Matrix4.multiplyByUniformScale(modelMatrix, scale || 1.0, modelMatrix);
    return modelMatrix;
  }

  async _waitModelReady(model) {
    // Cesium 1.127: Model 没有 readyPromise，使用 readyEvent
    if (!model) return;
    if (model.ready) return;
    if (model.readyEvent && typeof model.readyEvent.addEventListener === "function") {
      await new Promise((resolve) => {
        const remove = model.readyEvent.addEventListener(() => {
          try {
            remove?.();
          } catch (_) {
            // ignore
          }
          resolve();
        });
      });
      return;
    }
    // 最后兜底：轮询
    await new Promise((resolve) => {
      const start = Date.now();
      const tick = () => {
        if (model.ready) return resolve();
        if (Date.now() - start > 30000) return resolve(); // avoid hanging forever
        setTimeout(tick, 16);
      };
      tick();
    });
  }

  _ensureClockAnimating() {
    const clock = this.viewer?.clock;
    if (!clock) return;
    if (!clock.shouldAnimate) {
      clock.shouldAnimate = true;
    }
  }

  _bindAnimationUpdate(wrapper) {
    const anim = wrapper?.currentAnimation;
    if (!anim?.update?.addEventListener) return;
    // 记录最新的 local animation time，用于暂停/改速后恢复进度
    try {
      wrapper._animUpdateRemove = anim.update.addEventListener((_model, _anim, localTime) => {
        wrapper._lastLocalTime = localTime;
      });
    } catch (_) {
      // ignore
    }
  }

  _unbindAnimationUpdate(wrapper) {
    try {
      wrapper._animUpdateRemove?.();
    } catch (_) {
      // ignore
    }
    wrapper._animUpdateRemove = undefined;
  }

  _resumeAnimation(wrapper) {
    if (!wrapper?.model) return false;
    if (!wrapper.isLoaded) return false; // 用户约定：没 ready 就 false
    if (!wrapper._pausedSnapshot) return false;
    const ok = this._startAnimationFromSnapshot(wrapper, wrapper._pausedSnapshot);
    if (ok) {
      wrapper._paused = false;
      wrapper._pausedSnapshot = undefined;
    }
    return ok;
  }

  _startAnimationFromSnapshot(wrapper, snapshot) {
    const model = wrapper.model;
    const opts = wrapper._animationOptions;
    if (!model || !opts) return false;

    const denom = snapshot.localStopTime - snapshot.localStartTime;
    const frac = denom > 0 ? (snapshot.localTime - snapshot.localStartTime) / denom : 0;
    const clamped = CesiumMath.clamp(frac, 0.0, 1.0);
    // reverse 在 update() 阶段会做 delta = 1 - delta，这里反推一个“未 reverse 前”的 delta 初值
    const baseDelta = opts.reverse ? 1.0 - clamped : clamped;

    this._ensureClockAnimating();
    try {
      wrapper.currentAnimation = model.activeAnimations.add({
        index: opts.index,
        loop: opts.loop,
        multiplier: opts.speed,
        reverse: opts.reverse,
        startTime: this.viewer.clock.currentTime,
        animationTime: (duration, seconds) => baseDelta + seconds / duration,
      });
      this._bindAnimationUpdate(wrapper);
      this.viewer?.scene?.requestRender?.();
      return true;
    } catch (e) {
      console.warn(`Failed to resume animation for model ${wrapper.id}:`, e);
      return false;
    }
  }
}

export default ModelManager;
