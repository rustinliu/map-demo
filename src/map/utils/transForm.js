import * as Cesium from 'cesium'

// 0-21级的分辨率列表
 function getAllResolutions() {
  return [
    156543.033928041, 78271.51696402048, 39135.758482010235, 19567.87924100512, 9783.93962050256, 4891.96981025128, 2445.98490512564, 1222.99245256282, 611.49622628141, 305.7481131407048,
    152.8740565703525, 76.43702828517624, 38.21851414258813, 19.10925707129406, 9.554628535647032, 4.777314267823516, 2.388657133911758, 1.194328566955879, 0.5971642834779395, 0.2985821417389697,
    0.1492910708694849, 0.0746455354347424
  ]
}

 const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max)
}

 const getResolutionForZoom = (zoom) => {
  let resolutions = getAllResolutions()
  const baseLevel = clamp(Math.floor(zoom), 0, resolutions.length - 2)
  const zoomFactor = resolutions[baseLevel] / resolutions[baseLevel + 1]
  return resolutions[baseLevel] / Math.pow(zoomFactor, clamp(zoom - baseLevel, 0, 1))
}

 const calcDistanceForCamera = (latitude, zoom, viewer) => {
  const resolution = getResolutionForZoom(zoom + 1)
  const canvas = viewer.scene.canvas
  const camera = viewer.scene.camera
  const fovy = camera.frustum.fovy // vertical field of view
  const metersPerUnit = 1
  const visibleMapUnits = resolution * canvas.clientHeight
  const relativeCircumference = Math.cos(Math.abs(Cesium.Math.toRadians(latitude)))
  const visibleMeters = visibleMapUnits * metersPerUnit * relativeCircumference
  const requiredDistance = visibleMeters / 2 / Math.tan(fovy / 2)
  return requiredDistance
}

 function updateView(viewer, viewOption = {}) {
  // Obtain Cesium's field of view center as the target point
  const ellipsoid = Cesium.Ellipsoid.WGS84
  const scene = viewer.scene
  const target = pickCenterPoint(scene)

  // If the center of view is not obtained, take the position of the camera as the target point
  let bestTarget = target
  if (!bestTarget) {
    const globe = scene.globe
    const carto = viewer.camera.positionCartographic.clone()
    const height = globe.getHeight(carto)
    carto.height = height || 0
    bestTarget = Cesium.Ellipsoid.WGS84.cartographicToCartesian(carto)
  }

  // the distance from camera to target point
  const distance = Cesium.Cartesian3.distance(bestTarget, viewer.camera.position)
  const bestTargetCartographic = ellipsoid.cartesianToCartographic(bestTarget)

  // EPSG:4326 (WGS84)​ & ​EPSG:3857(Pseudo-Mercator)​
  // const mercatorCenter = transform([(bestTargetCartographic.longitude * 180) / Math.PI, (bestTargetCartographic.latitude * 180) / Math.PI], 'EPSG:4326', 'EPSG:3857');
  // const center = convertMercatorToLatlng(mercatorCenter);
  const center = [(bestTargetCartographic.longitude * 180) / Math.PI, (bestTargetCartographic.latitude * 180) / Math.PI]

  // Calculate the resolution of Cesium and set ol to the same resolution
  const latitude = bestTargetCartographic ? bestTargetCartographic.latitude : 0
  const resolution = calcResolutionForDistance(distance, latitude, scene)
  const zoom = getZoomForResolution(resolution)

  // Calculate the rotation angle of Cesium
  let rotation
  if (!target) {
    rotation = viewer.camera.heading
  } else {
    rotation = calcRotation(viewer.camera, target, ellipsoid)
  }
  const bearing = (-rotation * 180) / Math.PI
  return {
    center: center,
    zoom: zoom,
    bearing: bearing
  }
}

 function calcResolutionForDistance(distance, latitude, scene) {
  const canvas = scene.canvas
  const camera = scene.camera
  const fovy = camera.frustum.fovy
  const metersPerUnit = METERS_PER_UNIT.m
  const visibleMeters = 2 * distance * Math.tan(fovy / 2)
  const relativeCircumference = Math.cos(Math.abs(latitude))
  const visibleMapUnits = visibleMeters / metersPerUnit / relativeCircumference
  const resolution = visibleMapUnits / canvas.clientHeight
  return resolution
}

 function getZoomForResolution(resolution) {
  const defaultTileSize = 256
  const zoomFactor = 2
  const minZoom = 0
  const size = (360 * METERS_PER_UNIT.degrees) / METERS_PER_UNIT.m
  const defaultMaxResolution = size / defaultTileSize / Math.pow(zoomFactor, minZoom)
  const maxResolution = defaultMaxResolution / Math.pow(zoomFactor, minZoom)
  const zoom = Math.log(maxResolution / resolution) / Math.log(zoomFactor) - 1
  return zoom
}

 function calcRotation(camera, target, ellipsoid) {
  const pos = camera.position
  const targetNormal = new Cesium.Cartesian3()
  ellipsoid.geocentricSurfaceNormal(target, targetNormal)
  const targetToCamera = new Cesium.Cartesian3()
  Cesium.Cartesian3.subtract(pos, target, targetToCamera)
  Cesium.Cartesian3.normalize(targetToCamera, targetToCamera)
  const up = camera.up
  const right = camera.right
  const normal = new Cesium.Cartesian3(-target.y, target.x, 0)
  const heading = Cesium.Cartesian3.angleBetween(right, normal)
  const cross = Cesium.Cartesian3.cross(target, up, new Cesium.Cartesian3())
  const orientation = cross.z
  return orientation < 0 ? heading : -heading
}

 function convertMercatorToLatlng(mercator) {
  const lng = (mercator[0] / 20037508.34) * 180
  let mmy = (mercator[1] / 20037508.34) * 180
  const lat = (180 / Math.PI) * (2 * Math.atan(Math.exp((mmy * Math.PI) / 180)) - Math.PI / 2)
  return [lng, lat]
}

 function pickCenterPoint(scene) {
  const canvas = scene.canvas
  const center = new Cesium.Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2)
  return pickOnTerrainOrEllipsoid(scene, center)
}

 function pickOnTerrainOrEllipsoid(scene, pixel) {
  const ray = scene.camera.getPickRay(pixel)
  const target = scene.globe.pick(ray, scene)
  return target || scene.camera.pickEllipsoid(pixel)
}

 const METERS_PER_UNIT = {
  // use the radius of the Normal sphere
  radians: 6370997 / (2 * Math.PI),
  degrees: (2 * Math.PI * 6370997) / 360,
  ft: 0.3048,
  m: 1,
  'us-ft': 1200 / 3937
}

// zoom to height
export const cesiumTomapbox = (map, viewer) => {
  const { center, zoom } = updateView(viewer)
  map.jumpTo({
    center,
    zoom
  })
}

// height to zoom
export const mapboxToCesium = (map, viewer) => {
  const { lng: longitude, lat: latitude } = map.getCenter()
  const zoom = map.getZoom()
  const height = calcDistanceForCamera(latitude, zoom, viewer)
  const center = Cesium.Cartesian3.fromDegrees(longitude, latitude, height)
  viewer.camera.setView({
    destination: center
  })
}
