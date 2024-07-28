const deafaultAccessToken = 'pk.eyJ1IjoicnVzdGlubGl1IiwiYSI6ImNseWI5bnd0MzFkMngybXB6czBzNTdqN28ifQ.zyq4P28w7z3PrnUisMRaOQ'

const defaultInitOption = {
  style: 'mapbox://styles/mapbox/streets-v12', // Replace with your preferred map style
  center: [114.059453, 22.553224],
  projection: 'globe',
  zoom: 9,
  attributionControl: false
}
const defaultFlyOptions = {
  center: [114.059453, 22.553224],
  zoom: 9
}
export { deafaultAccessToken, defaultInitOption, defaultFlyOptions }
