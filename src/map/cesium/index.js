import * as Cesium from 'cesium'

import { deafaultAccessToken, defaultInitOption } from './config'

class CreateMap {
  constructor(container, options = {}, accessToken = deafaultAccessToken) {
    Cesium.Ion.defaultAccessToken = accessToken
    this.instance = new Cesium.Viewer(container, {
      ...defaultInitOption,
      ...options
    })
    // this.instance.imageryLayers.removeAll() // 移除所有图层，只显示蓝色地球

    // !修改场景环境,关闭相关特效
    this.instance.scene.debugShowFramesPerSecond = false // 显示fps
    this.instance.scene.moon.show = false // 月亮
    this.instance.scene.sun.show = false // 太阳
    this.instance.scene.skyBox.show = true // 天空盒
    this.instance.scene.skyAtmosphere.show = false // 天空大气
    // this.this.scene.skyAtmosphere.atmosphereLightIntensity=50 //天空大气效果亮度
    this.instance.scene.fog.enabled = false // 雾
    // this.instance.scene.fog.minimumBrightness = 0.1 //雾效果最小亮度
    // this.instance.scene.fog.density = 0.0003 //浓度
    // this.instance.scene.backgroundColor = Cesium.Color.GREEN;
    // this.instance.scene.highDynamicRange=true //HDR效果

    this.instance.resolutionScale = 1.0 // 画面细度，默认值为1.0

    // !地球相关配置
    this.instance.scene.globe.enableLighting = false // 激活基于太阳位置的光照（场景光照
    // this.instance.scene.globe.baseColor = Cesium.Color.TRANSPARENT // 基础色，默认是蓝色 Cesium.Color.BLUE
    // this.instance.scene.globe.translucency.enabled = true // 一定要为 true，否则 undergroundColor 设置无效
    // this.instance.scene.globe.undergroundColor = Cesium.Color.TRANSPARENT // 地下色，默认是黑色 Cesium.Color.BLACK
    this.instance.scene.globe.showGroundAtmosphere = false // 开启地表大气效果
    // this.instance.scene.globe.atmosphereLightIntensity = 10//设置地表大气亮度
    // 开启地形深度检测:
    // 控制在渲染场景时，相机是否进行深度测试以避免将被遮挡的物体绘制在前景
    // true: 相机会根据地形高度信息进行深度测试，避免将低于地面的物体绘制在地面之上
    this.instance.scene.globe.depthTestAgainstTerrain = true

    // !自定义光源
    // viewer.scene.light = new Cesium.DirectionalLight({
    //   direction: Cesium.Cartesian3.fromElements(-0.2, -0.5, -0.8),
    //   intensity: 1
    // })

    // ! 其他配置
    // this.instance.extend(Cesium.viewerCesium3DTilesInspectorMixin); // 监视3D Tiles数据的监视器
    // this.instance.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK); // 取消默认双击事件
    // this.instance.scene.globe.atmosphereLightIntensity = 10// 设置地表大气亮度
    // this.instance.pickTranslucentDepth = true // 控制是否在深度测试期间选择半透明对象
    // this.instance.scene.globe.backFaceCulling = false // 用于控制地球场景背面剔除
    // this.instance.scene.globe.showSkirts = false // 地球表面边缘显示

    // 存datasource
    this.dataSourcesMap = {}
  }

  removeMap() {
    console.log('destroy')
    this.instance && this.instance.destroy()
    this.instance.dataSources && this.instance.dataSources.removeAll(true)
    this.instance = null
  }

  flyTo(longitude, latitude, height = 250600) {
    this.instance.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height)
    })
  }

  addGeojsonToMap(id, geojson, options, isZoom = true) {
    this.dataSourcesMap.geoJSON = this.dataSourcesMap.geoJSON || {}
    if (Object.keys(this.dataSourcesMap.geoJSON).includes(id)) {
      return console.log('该ID已存在')
    }
    this.instance.dataSources.add(Cesium.GeoJsonDataSource.load(geojson, options)).then((dataSource) => {
      this.dataSourcesMap.geoJSON[id] = dataSource
      isZoom && this.instance.zoomTo(dataSource)
    })
  }

  modGeojsonInMap(id, geojson, options, isReload = true) {
    if (!this.dataSourcesMap.geoJSON || !this.dataSourcesMap.geoJSON[id]) {
      return console.log('未创建该ID')
    }
    const dataSource = this.dataSourcesMap.geoJSON[id]
    if (isReload) {
      dataSource.load(geojson, options)
    } else {
      dataSource.process(geojson, options)
    }
    return this
  }

  delGeojsonInMap(id) {
    
  }
}

export { CreateMap }
