import mapboxgl from 'mapbox-gl'

import { deafaultAccessToken, defaultInitOption, defaultFlyOptions } from './config'

// let map = null

// const initMap = (container, options, accessToken = deafaultAccessToken) => {
//   if (map) return
//   mapboxgl.accessToken = accessToken
//   map = new mapboxgl.Map({
//     container,
//     ...defaultInitOption,
//     ...options
//   })
// }

// const removeMap = () => {
//   if (!map) return
//   map.remove()
//   map = null
// }
class CreateMap {
  constructor(container, options, accessToken = deafaultAccessToken) {
    mapboxgl.accessToken = accessToken
    this.instance = new mapboxgl.Map({
      container,
      ...defaultInitOption,
      ...options
    })
    console.log(this.instance)
    /*删除mapbox自带logo*/
    this.instance._logoControl && this.instance.removeControl(this.instance._logoControl)
  }
  removeMap() {
    this.instance.remove()
    this.instance = null
  }
  flyTo(options) {
    this.instance.flyTo({ ...defaultFlyOptions, ...options })
  }
}
export { initMap, removeMap, CreateMap }
