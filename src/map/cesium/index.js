import * as Cesium from 'cesium'

import { deafaultAccessToken, defaultInitOption } from './config'

class CreateMap {
  constructor(container, options, accessToken = deafaultAccessToken) {
    Cesium.Ion.defaultAccessToken = accessToken
    this.instance = new Cesium.Viewer(container, {
      ...defaultInitOption,
      ...options
    })
    // const viewer = new Cesium.Viewer('cesiumContainer', {
    //   baseLayerPicker: false, // 是否显示图层选择器:将图层选择的控件关掉，才能添加其他影像数据
    //   terrainProvider: new Cesium.EllipsoidTerrainProvider(), // 地形图层提供者，仅baseLayerPicker设为false有意义
    //   geocoder: false,
    //   homeButton: false,
    //   sceneModePicker: false,
    //   baseLayerPicker: false,
    //   navigationHelpButton: false,
    //   animation: false,
    //   timeline: false,
    //   fullscreenButton: false,
    //   vrButton: false
    // })
    // // 显示帧数
    // viewer.scene.debugShowFramesPerSecond = true
    // //取消版权信息
    // viewer._cesiumWidget._creditContainer.style.display = 'none'
    // // Add Cesium OSM Buildings, a global 3D buildings layer.
    // /* const buildingTileset = viewer.scene.primitives.add(Cesium.createOsmBuildings()); */
    // // Fly the camera to San Francisco at the given longitude, latitude, and height.
    // viewer.camera.flyTo({
    //   destination: Cesium.Cartesian3.fromDegrees(114.059453, 22.553224, 250600)
    // })
  }
}

export { CreateMap }
