import * as Cesium from 'cesium'
export const cesiumOptions = {
  Point: {
    // 点属性，另有 markerSymbol markerColor
    markerColor: Cesium.Color.HOTPINK,
    clampToGround: true
  },
  LineString: {
    // 线属性
    strokeWidth: 4,
    stroke: Cesium.Color.HOTPINK,
    clampToGround: true
  },
  Polygon: {
    // 面属性
    fill: Cesium.Color.HOTPINK.withAlpha(0.5),
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
      'line-color': '#5362f9',
      'line-width': 4
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
      'fill-color': '#5362f9',
      'fill-opacity': 0.5
    }
  }
}