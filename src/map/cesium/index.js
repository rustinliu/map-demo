import * as Cesium from 'cesium'
import * as turf from '@turf/turf'

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
    this.instance.scene.globe.depthTestAgainstTerrain = false

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
    // handle
    this.handler = new Cesium.ScreenSpaceEventHandler(this.instance.scene.canvas)
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

  addGeojsonToMap(id, geojson, options, isZoom = false) {
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
    if (!this.dataSourcesMap.geoJSON || !this.dataSourcesMap.geoJSON[id]) {
      return console.log('未创建或已删除该ID')
    }
    this.instance.dataSources.remove(this.dataSourcesMap.geoJSON[id])
    delete this.dataSourcesMap.geoJSON[id]
  }

  delAlljsonInMap() {
    if (!this.dataSourcesMap.geoJSON) {
      return console.log('目前未添加geoJSON')
    }
    this.instance.dataSources.removeAll()
    this.dataSourcesMap.geoJSON = null
  }

  drawfigures(id, type, options) {
    this.handler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK) && this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
    this.handler.getInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK) && this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    this.handler.getInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE) && this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    this.delGeojsonInMap('drawDottedLine')
    this.instance._container.style.cursor = 'crosshair'
    let geojson = {
      type: 'FeatureCollection',
      features: []
    }
    const pointList = []
    let drawDataSource = this.dataSourcesMap.geoJSON && this.dataSourcesMap.geoJSON[id]
    if (!drawDataSource) {
      this.dataSourcesMap.geoJSON = this.dataSourcesMap.geoJSON || {}
      this.instance.dataSources.add(Cesium.GeoJsonDataSource.load(geojson, options)).then((dataSource) => {
        this.dataSourcesMap.geoJSON[id] = dataSource
        drawDataSource = dataSource
      })
    }
    // 处理绘制线段
    if (type === 'LineString') {
      const drawDottedLine = async (event) => {
        // 获取鼠标点击位置的三维坐标
        const cartesian = this.instance.camera.pickEllipsoid(event.endPosition, this.instance.scene.globe.ellipsoid)
        if (cartesian) {
          const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
          const longitude = Cesium.Math.toDegrees(cartographic.longitude)
          const latitude = Cesium.Math.toDegrees(cartographic.latitude)
          if (!pointList.length) return
          const lastPoint = pointList[pointList.length - 1]
          const dotDataJSON = {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: [lastPoint, [longitude, latitude]]
                }
              }
            ]
          }
          const options = {
            // // 线属性
            strokeWidth: 5,
            clampToGround: true
          }
          let dotDataSource = this.dataSourcesMap.geoJSON && this.dataSourcesMap.geoJSON['dotDataSource']
          if (!dotDataSource) {
            this.dataSourcesMap.geoJSON = this.dataSourcesMap.geoJSON || {}
            await this.instance.dataSources.add(Cesium.GeoJsonDataSource.load(dotDataJSON, options)).then((dataSource) => {
              this.dataSourcesMap.geoJSON['dotDataSource'] = dataSource
              dotDataSource = dataSource
            })
          }
          await dotDataSource.load(dotDataJSON, options)
          // 为 GeoJSON 线设置虚线材质
          const polylineDashMaterial = new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.BLACK, // 线的颜色
            dashLength: 15, // 虚线的长度
            gapLength: 15 // 虚线之间的间隔
          })
          // 遍历所有的实体，并设置虚线材质
          dotDataSource.entities.values.forEach(function (entity) {
            if (entity.polyline) {
              entity.polyline.material = polylineDashMaterial
            }
          })
        }
      }
      this.handler.setInputAction(drawDottedLine, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    }
    const confirmPath = (event) => {
      // 获取鼠标点击位置的三维坐标
      const cartesian = this.instance.camera.pickEllipsoid(event.position, this.instance.scene.globe.ellipsoid)
      if (cartesian) {
        // 将三维坐标转换为经纬度
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
        const longitude = Cesium.Math.toDegrees(cartographic.longitude)
        const latitude = Cesium.Math.toDegrees(cartographic.latitude)
        if (type === 'Point') {
          const point = {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            }
          }
          geojson.features.push(point)
          drawDataSource.process(geojson, options)
        }
        if (type === 'LineString') {
          pointList.push([longitude, latitude])
          if (pointList.length > 1) {
            const LineString = {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: pointList
              }
            }
            geojson.features[0] = LineString
            drawDataSource.process(geojson, options)
            // 点选位置后删除虚线
            this.delGeojsonInMap('dotDataSource')
          }
        }
        if (type === 'Polygon') {
          pointList.push([longitude, latitude])
          if (pointList.length > 2) {
            const points = turf.featureCollection(pointList.map((item) => turf.point(item)))
            const Polygon = turf.convex(points)
            geojson.features[0] = Polygon
            drawDataSource.load(geojson, options)
          }
        }
      }
    }

    const stopDraw = () => {
      this.instance._container.style.cursor = 'pointer'

      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK)
      if (type === 'LineString') {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
        this.delGeojsonInMap('dotDataSource')
      }
      if(type === 'Polygon') {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
        this.delGeojsonInMap('polygonDataSource')
      }
    }

    this.handler.setInputAction(confirmPath, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    this.handler.setInputAction(stopDraw, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }
  drawfigureStart(type, leftClickCallback, rightClickCallback) {
    this.instance._container.style.cursor = 'crosshair'
    const confirmPath = (event) => {
      // 获取鼠标点击位置的三维坐标
      const cartesian = this.instance.camera.pickEllipsoid(event.position, this.instance.scene.globe.ellipsoid)
      if (cartesian) {
        // 将三维坐标转换为经纬度
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
        const longitude = Cesium.Math.toDegrees(cartographic.longitude)
        const latitude = Cesium.Math.toDegrees(cartographic.latitude)
        leftClickCallback([longitude, latitude])
      }
    }
    const stopDraw = () => {
      this.drawfigureEnd()
      rightClickCallback()
    }
    this.handler.setInputAction(confirmPath, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    this.handler.setInputAction(stopDraw, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }
  drawfigureEnd() {
    this.instance._container.style.cursor = 'pointer'

    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    if (this.handler.getInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)) {
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
      this?.dataSourcesMap?.geoJSON['dotDataSource'] && this.delGeojsonInMap('dotDataSource')
      this?.dataSourcesMap?.geoJSON['polygonDataSource'] && this.delGeojsonInMap('polygonDataSource')
    }
  }
  drawDashLine(lastPoint) {
    if (this.handler.getInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)) {
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
      this?.dataSourcesMap?.geoJSON['dotDataSource'] && this.delGeojsonInMap('dotDataSource')
    }
    const drawDottedLine = async (event) => {
      // 获取鼠标点击位置的三维坐标
      const cartesian = this.instance.camera.pickEllipsoid(event.endPosition, this.instance.scene.globe.ellipsoid)
      if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
        const longitude = Cesium.Math.toDegrees(cartographic.longitude)
        const latitude = Cesium.Math.toDegrees(cartographic.latitude)
        const dotDataJSON = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [lastPoint, [longitude, latitude]]
              }
            }
          ]
        }
        const options = {
          // // 线属性
          strokeWidth: 5,
          clampToGround: true
        }
        let dotDataSource = this.dataSourcesMap.geoJSON && this.dataSourcesMap.geoJSON['dotDataSource']
        if (!dotDataSource) {
          this.dataSourcesMap.geoJSON = this.dataSourcesMap.geoJSON || {}
          await this.instance.dataSources.add(Cesium.GeoJsonDataSource.load(dotDataJSON, options)).then((dataSource) => {
            this.dataSourcesMap.geoJSON['dotDataSource'] = dataSource
            dotDataSource = dataSource
          })
        }
        await dotDataSource.load(dotDataJSON, options)
        // 为 GeoJSON 线设置虚线材质
        const polylineDashMaterial = new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.BLACK, // 线的颜色
          dashLength: 15, // 虚线的长度
          gapLength: 15 // 虚线之间的间隔
        })
        // 遍历所有的实体，并设置虚线材质
        dotDataSource.entities.values.forEach(function (entity) {
          if (entity.polyline) {
            entity.polyline.material = polylineDashMaterial
          }
        })
      }
    }
    this.handler.setInputAction(drawDottedLine, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  }
  drawDashPolygon(pointlist) {
    if(pointlist.length < 2) return
    if (this.handler.getInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)) {
      this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
      this?.dataSourcesMap?.geoJSON['polygonDataSource'] && this.delGeojsonInMap('polygonDataSource')
    }
    const drawDottedPolygon = async (event) => {
      // 获取鼠标点击位置的三维坐标
      const cartesian = this.instance.camera.pickEllipsoid(event.endPosition, this.instance.scene.globe.ellipsoid)
      if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
        const longitude = Cesium.Math.toDegrees(cartographic.longitude)
        const latitude = Cesium.Math.toDegrees(cartographic.latitude)
        const dotList = [...pointlist, [longitude, latitude]]
        const points = turf.featureCollection(dotList.map((item) => turf.point(item)))
        const Polygon = turf.convex(points)
        const polygonJSON = {
          type: 'FeatureCollection',
          features: [ Polygon ]
        }
        const options = {
          fill: Cesium.Color.TRANSPARENT,
          stroke: Cesium.Color.TRANSPARENT, 
        }
        let polygonDataSource = this.dataSourcesMap.geoJSON && this.dataSourcesMap.geoJSON['polygonDataSource']
        if (!polygonDataSource) {
          this.dataSourcesMap.geoJSON = this.dataSourcesMap.geoJSON || {}
          await this.instance.dataSources.add(Cesium.GeoJsonDataSource.load(polygonJSON, options)).then((dataSource) => {
            this.dataSourcesMap.geoJSON['polygonDataSource'] = dataSource
            polygonDataSource = dataSource
          })
        }
        await polygonDataSource.load(polygonJSON, options)
        // 为 GeoJSON 线设置虚线材质
        const polylineDashMaterial = new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.BLACK, // 线的颜色
          dashLength: 15, // 虚线的长度
          gapLength: 15 // 虚线之间的间隔
        })
        // 遍历所有的实体，并设置虚线材质
        polygonDataSource.entities.values.forEach(function (entity) {
          var positions = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now()).positions;
            // 设置面轮廓
            entity.polyline = new Cesium.PolylineGraphics({
              positions,
              width: 3,
              material: polylineDashMaterial,
              clampToGround: true	// 贴地
          })
        })
      }
    }
    this.handler.setInputAction(drawDottedPolygon, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  }
}

export default CreateMap
