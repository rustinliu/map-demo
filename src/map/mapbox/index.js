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
  modGeojsonInMap(id, sourceOption, layerOption) {
    if (!this.sourceLayerMap.geoJSON || !this.sourceLayerMap.geoJSON[id]) {
      return console.log('未创建该ID')
    }
    if (sourceOption && sourceOption.data) {
      const { isUpdate, data } = sourceOption
      const source = this.instance.getSource(id)
      if (!isUpdate) {
        source.setData(data)
      } else {
        source.updateData(data)
      }
    }
    if (layerOption) {
      const { paint, layout } = layerOption
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
  drawfigures(type, id) {
    this.instance.getCanvas().style.cursor = 'crosshair'
    let isAdd = true
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
      if (type === 'circle') {
        this.instance.addLayer({
          id,
          type,
          source: id,
          paint: {
            'circle-color': '#4264fb',
            'circle-radius': 8,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff'
          }
        })
      } else if (type === 'line') {
        this.instance.addLayer({
          id,
          type,
          source: id,
          paint: {
            'line-color': 'red',
            'line-width': 14
          },
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          }
        })
      } else if (type === 'polygon') {
        this.instance.addLayer({
          id,
          type: 'fill',
          source: id,
          paint: {
            'fill-color': '#0080ff',
            'fill-opacity': 0.5
          }
        })
      }
    } else {
      geojson = source._data
      pointer = source._data.features.length
    }
    this.instance.on('contextmenu', (e) => {
      isAdd = false
      pointList = []
      this.instance.getCanvas().style.cursor = 'pointer'
    })
    this.instance.on('click', (e) => {
      if (isAdd) {
        if (type === 'circle') {
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
        if (type === 'line') {
          pointList.push([e.lngLat.lng, e.lngLat.lat])
          if (pointList.length > 1) {
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
        if (type === 'polygon') {
          pointList.push([e.lngLat.lng, e.lngLat.lat])
          if (pointList.length > 2) {
            var points = turf.featureCollection(pointList.map((item) => turf.point(item)))

            var Polygon = turf.convex(points)
            console.log(Polygon)
            // const Polygon = {
            //   type: 'Feature',
            //   properties: {},
            //   geometry: {
            //     type: 'Polygon',
            //     coordinates: hull
            //   }
            // }
            geojson.features[pointer] = Polygon
            this.instance.getSource(id).setData(geojson)
          }
        }
      }
    })
  }
}
export { CreateMap }
