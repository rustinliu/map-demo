import mapboxgl from 'mapbox-gl'
import * as turf from '@turf/turf'

import { deafaultAccessToken, defaultInitOption, defaultFlyOptions } from './config'

class CreateMap {
  constructor(container, options, accessToken = deafaultAccessToken) {
    mapboxgl.accessToken = accessToken
    this.instance = new mapboxgl.Map({
      container,
      ...defaultInitOption,
      ...options
    })
    /*删除mapbox自带logo*/
    this.instance._logoControl && this.instance.removeControl(this.instance._logoControl)
    // 存储soureId与对应的LayerId source ：[layer]
    this.sourceLayerMap = {}
    // 存储事件及回调名称 eventType: callBackName
    this.eventHandleMap = {}
  }
  removeMap() {
    this.instance.remove()
    this.instance = null
  }
  flyTo(options) {
    this.instance.flyTo({ ...defaultFlyOptions, ...options })
    return this
  }
  addGeojsonToMap(id, geoJSON, layerOption) {
    console.log(id, geoJSON, layerOption, 'id, geoJSON, layerOption')
    this.sourceLayerMap.geoJSON = this.sourceLayerMap.geoJSON || {}
    if (Object.keys(this.sourceLayerMap.geoJSON).includes(id)) {
      return console.log('该ID已存在')
    }
    this.sourceLayerMap.geoJSON[id] = []
    this.instance.addSource(id, { type: 'geojson', data: geoJSON })
    if (layerOption) {
      layerOption.source = id
      layerOption.id = id
      this.sourceLayerMap.geoJSON[id].push(layerOption.id)
      this.instance.addLayer(layerOption)
    }
    return this
  }
  modGeojsonInMap(id, geoJSON = {}, options = {}) {
    if (!this.sourceLayerMap.geoJSON || !this.sourceLayerMap.geoJSON[id]) {
      return console.log('未创建该ID')
    }
    if (geoJSON && JSON.stringify(geoJSON) !== '{}') {
      const { isUpdate } = options
      const source = this.instance.getSource(id)
      if (!isUpdate) {
        source.setData(geoJSON)
      } else {
        source.updateData(geoJSON)
      }
    }
    if (options) {
      const { paint, layout } = options
      if (paint) {
        const paintOptionsList = Object.keys(paint)
        if (paintOptionsList.length) {
          paintOptionsList.forEach((item) => {
            this.instance.setPaintProperty(id, item, paint[item])
          })
        }
      }
      if (layout) {
        const layoutOptionsList = Object.keys(layout)
        if (layoutOptionsList.length) {
          layoutOptionsList.forEach((item) => {
            this.instance.setLayoutProperty(id, item, layout[item])
          })
        }
      }
    }
    return this
  }
  delGeojsonInMap(id) {
    if (!this.sourceLayerMap.geoJSON || !this.sourceLayerMap.geoJSON[id]) {
      return console.log('未创建该ID')
    }
    this.instance.removeLayer(id)
    this.instance.removeSource(id)
    delete this.sourceLayerMap.geoJSON[id]
    console.log('已删除')
  }
  drawfigures(id, type, { paint = {}, layout = {} }) {
    this.eventHandleMap.click && this.instance.off('click', this.eventHandleMap.click)
    this.eventHandleMap.contextmenu && this.instance.off('click', this.eventHandleMap.contextmenu)
    this.eventHandleMap.mousemove && this.instance.off('mousemove', this.eventHandleMap.mousemove)
    this.eventHandleMap.mousemove = null
    this.delGeojsonInMap('drawDottedLine')
    this.instance.getCanvas().style.cursor = 'crosshair'
    let geojson = {
      type: 'FeatureCollection',
      features: []
    }
    const source = this.instance.getSource(id)
    let pointList = []
    let pointer = 0
    if (!source) {
      this.instance.addSource(id, {
        type: 'geojson',
        data: geojson
      })
      if (type === 'Point') {
        this.instance.addLayer({
          id,
          type: 'circle',
          source: id,
          paint,
          layout
        })
      } else if (type === 'LineString') {
        this.instance.addLayer({
          id,
          type: 'line',
          source: id,
          paint,
          layout
        })
      } else if (type === 'Polygon') {
        this.instance.addLayer({
          id,
          type: 'fill',
          source: id,
          paint,
          layout
        })
      }
    } else {
      geojson = source._data
      pointer = source._data.features.length
    }
    // 处理绘制线段
    if (type === 'LineString') {
      const drawDottedLine = (e) => {
        if (!pointList.length) return
        const lastPoint = pointList[pointList.length - 1]
        const dataJSON = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [lastPoint, [e.lngLat.lng, e.lngLat.lat]]
              }
            }
          ]
        }
        const source = this.instance.getSource('drawDottedLine')
        if (!source) {
          this.instance.addSource('drawDottedLine', {
            type: 'geojson',
            data: dataJSON
          })
          this.instance.addLayer({
            id: 'drawDottedLine',
            type: 'line',
            source: 'drawDottedLine',
            paint: {
              //   'line-dasharray': [4, 2],
              'line-color': 'black',
              'line-width': 5,
              'line-dasharray': [2, 4]
            }
          })
          this.sourceLayerMap.geoJSON = this.sourceLayerMap.geoJSON || {}
          this.sourceLayerMap.geoJSON['drawDottedLine'] = ['drawDottedLine']
        } else {
          this.modGeojsonInMap('drawDottedLine', dataJSON)
        }
      }
      this.instance.on('mousemove', drawDottedLine)
      this.eventHandleMap.mousemove = drawDottedLine
    }
    const confirmPath = (e) => {
      if (type === 'Point') {
        const point = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [e.lngLat.lng, e.lngLat.lat]
          }
        }
        geojson.features.push(point)
        this.instance.getSource(id).setData(geojson)
      }
      if (type === 'LineString') {
        pointList.push([e.lngLat.lng, e.lngLat.lat])
        if (pointList.length > 1) {
          this.delGeojsonInMap('drawDottedLine')
          const LineString = {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: pointList
            }
          }
          geojson.features[pointer] = LineString
          this.instance.getSource(id).setData(geojson)
        }
      }
      if (type === 'Polygon') {
        pointList.push([e.lngLat.lng, e.lngLat.lat])
        if (pointList.length > 2) {
          const points = turf.featureCollection(pointList.map((item) => turf.point(item)))
          const Polygon = turf.convex(points)
          geojson.features[pointer] = Polygon
          this.instance.getSource(id).setData(geojson)
        }
      }
    }
    const stopDraw = () => {
      pointList = []
      this.instance.getCanvas().style.cursor = 'default'

      this.instance.off('contextmenu', stopDraw)
      this.instance.off('click', confirmPath)

      this.eventHandleMap.click = null
      this.eventHandleMap.contextmenu = null
      if (this.eventHandleMap.mousemove) {
        this.instance.off('mousemove', this.eventHandleMap.drawDottedLine)
        this.eventHandleMap.drawDottedLine = null
        this.delGeojsonInMap('drawDottedLine')
      }
    }

    this.instance.on('contextmenu', stopDraw)
    this.instance.on('click', confirmPath)

    this.eventHandleMap.click = confirmPath
    this.eventHandleMap.contextmenu = stopDraw
  }
  drawfigureStart(type, leftClickCallback, rightClickCallback) {
    this.instance.getCanvas().style.cursor = 'crosshair'
    this.confirmPath = (e) => {
      leftClickCallback([Number(e.lngLat.lng.toFixed(3).slice(0, -1)), Number(e.lngLat.lat.toFixed(3).slice(0, -1))])
    }
    this.stopDraw = () => {
      this.drawfigureEnd()
      rightClickCallback()
    }
    this.instance.on('click', this.confirmPath)
    this.instance.on('contextmenu', this.stopDraw)
  }
  drawfigureEnd() {
    this.instance.getCanvas().style.cursor = 'default'

    this.instance.off('contextmenu', this.stopDraw)
    this.instance.off('click', this.confirmPath)
    if (this.drawDottedLine) {
      this?.sourceLayerMap?.geoJSON['drawDottedLine'] && this.delGeojsonInMap('drawDottedLine')
      this.instance.off('mousemove', this.drawDottedLine)
      this.drawDottedLine = null
    }
    if (this.drawDotedPolygon) {
      this?.sourceLayerMap?.geoJSON['drawDotedPolygon'] && this.delGeojsonInMap('drawDotedPolygon')
      this.instance.off('mousemove', this.drawDotedPolygon)
      this.drawDotedPolygon = null
    }
  }
  drawDashLine(point) {
    if (this.drawDottedLine) {
      this.sourceLayerMap.geoJSON['drawDottedLine'] && this.delGeojsonInMap('drawDottedLine')
      this?.instance?.off('mousemove', this.drawDottedLine)
    }
    this.drawDottedLine = (e) => {
      const dataJSON = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [point, [e.lngLat.lng, e.lngLat.lat]]
            }
          }
        ]
      }
      const source = this.instance.getSource('drawDottedLine')
      if (!source) {
        this.instance.addSource('drawDottedLine', {
          type: 'geojson',
          data: dataJSON
        })
        this.instance.addLayer({
          id: 'drawDottedLine',
          type: 'line',
          source: 'drawDottedLine',
          paint: {
            //   'line-dasharray': [4, 2],
            'line-color': 'black',
            'line-width': 3,
            'line-dasharray': [2, 4]
          }
        })
        this.sourceLayerMap.geoJSON = this.sourceLayerMap.geoJSON || {}
        this.sourceLayerMap.geoJSON['drawDottedLine'] = dataJSON
      } else {
        this.modGeojsonInMap('drawDottedLine', dataJSON)
      }
    }
    this.instance.on('mousemove', this.drawDottedLine)
  }
  drawDashPolygon(pointlist) {
    if (pointlist.length < 1) return
    if (this.drawDotedPolygon) {
      this.sourceLayerMap.geoJSON['drawDotedPolygon'] && this.delGeojsonInMap('drawDotedPolygon')
      this?.instance?.off('mousemove', this.drawDotedPolygon)
    }
    this.drawDotedPolygon = (e) => {
      let dataJSON
      if (pointlist.length === 1) {
        dataJSON = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [pointlist[0], [e.lngLat.lng, e.lngLat.lat]]
              }
            }
          ]
        }
      } else {
        const dotList = [...pointlist, [e.lngLat.lng, e.lngLat.lat]]
        const points = turf.featureCollection(dotList.map((item) => turf.point(item)))
        const Polygon = turf.convex(points)
        dataJSON = {
          type: 'FeatureCollection',
          features: [Polygon]
        }
      }
      const source = this.instance.getSource('drawDotedPolygon')
      if (!source) {
        this.instance.addSource('drawDotedPolygon', {
          type: 'geojson',
          data: dataJSON
        })
        this.instance.addLayer({
          id: 'drawDotedPolygon',
          type: 'line',
          source: 'drawDotedPolygon',
          paint: {
            //   'line-dasharray': [4, 2],
            'line-color': 'black',
            'line-width': 3,
            'line-dasharray': [2, 4]
          }
        })
        this.sourceLayerMap.geoJSON = this.sourceLayerMap.geoJSON || {}
        this.sourceLayerMap.geoJSON['drawDotedPolygon'] = dataJSON
      } else {
        this.modGeojsonInMap('drawDotedPolygon', dataJSON)
      }
    }
    this.instance.on('mousemove', this.drawDotedPolygon)
  }
  pickGeoJSON(callBack) {
    if(this.eventHandleMap.click) return
    if (this?.sourceLayerMap?.geoJSON) {
      const pickGeoJsonHandle = (e) => {
        const features = this.instance.queryRenderedFeatures(e.point)
        if (features && features.length) {
          const id = features[0]?.layer?.id
          const geoJsonIdList = Object.keys(this?.sourceLayerMap?.geoJSON)
          if (geoJsonIdList.includes(id) && ['Polygon', 'LineString'].includes(features[0].geometry.type)) {
            const index = features[0].properties.sortIndex.toString()
            callBack({
              index,
              id,
              type: features[0]._geometry.type
            })
            endPickGeoJsonHandle()
          }
        }
      }
      const endPickGeoJsonHandle = () => {
        this.instance.off('click', pickGeoJsonHandle)
        this.instance.off('contextmenu', endPickGeoJsonHandle)

        this.eventHandleMap.click = null
        this.eventHandleMap.contextmenu = null
      }
      
      this.instance.on('click', pickGeoJsonHandle)
      this.instance.on('contextmenu', endPickGeoJsonHandle)

      this.eventHandleMap.click = pickGeoJsonHandle
      this.eventHandleMap.contextmenu = endPickGeoJsonHandle
    }
  }
}

export default CreateMap
