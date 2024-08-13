import * as Cesium from 'cesium'
export const cesiumOptions = {
  Point: {
    // 点属性，另有 markerSymbol markerColor
    markerColor: Cesium.Color.CRIMSON
  },
  LineString: {
    // 线属性
    strokeWidth: 2,
    stroke: Cesium.Color.HOTPINK,
    clampToGround: true
  },
  Polygon: {
    // 面属性
    fill: Cesium.Color.PINK.withAlpha(0.5),
    stroke: Cesium.Color.TRANSPARENT,
    clampToGround: true
  }
}
export const mapboxOptions = {
  Point: {
    type: 'circle',
    paint: {
      'circle-color': '#4264fb',
      'circle-radius': 8,
      'circle-stroke-width': 1,
      'circle-stroke-color': '#ffffff'
    }
  },
  LineString: {
    type: 'line',
    paint: {
      'line-color': 'red',
      'line-width': 14
    },
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    }
  },
  Polygon: {
    type: 'fill',
    layout: {},
    paint: {
      'fill-color': '#0080ff',
      'fill-opacity': 0.5
    }
  }
}