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
  const baseLevel = this.clamp(Math.floor(zoom), 0, resolutions.length - 2)
  const zoomFactor = resolutions[baseLevel] / resolutions[baseLevel + 1]
  return resolutions[baseLevel] / Math.pow(zoomFactor, this.clamp(zoom - baseLevel, 0, 1))
}

const calcDistanceForCamera = (latitude, zoom, viewer) => {
  const resolution = getResolutionForZoom(zoom + 1);
  const canvas = viewer.scene.canvas;
  const camera = viewer.scene.camera;
  const fovy = camera.frustum.fovy; // vertical field of view
  const metersPerUnit = 1;
  const visibleMapUnits = resolution * canvas.clientHeight;
  const relativeCircumference = Math.cos(Math.abs(Cesium.Math.toRadians(latitude)));
  const visibleMeters = visibleMapUnits * metersPerUnit * relativeCircumference;
  const requiredDistance = (visibleMeters / 2) / Math.tan(fovy / 2);
  return requiredDistance;
}