import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { addCardinalGrid } from './cardinalGrid.js';
import GUI from 'lil-gui';

let elevation_angle = 45;
let azimuth_zimuth = 90;
let wall_azimuth = 190;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 60, 180);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// OrbitControls (simple mouse control)
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 30, 0);

// --- Building group (rotate the whole building as one unit) ---
const buildingGroup = new THREE.Group();
scene.add(buildingGroup);

// Building (24 x 60 x 24)
const building = new THREE.Mesh(
  new THREE.BoxGeometry(24, 40, 64),
  new THREE.MeshStandardMaterial({ color: 0xffaa00 })
);

building.position.y = building.geometry.parameters.height / 2;
//rotate building based on degrees clockwise from north
// NOTE: rotation is applied to the GROUP, not the mesh
building.castShadow = true;
building.receiveShadow = true;
buildingGroup.add(building);

const windowFrame = new THREE.Mesh(
  new THREE.BoxGeometry(20, 5, 10),
  new THREE.MeshStandardMaterial({ color: 0x0000ff })
);
windowFrame.rotation.y = -Math.PI / 2;

windowFrame.position.set(12.1, 20, 0);
windowFrame.castShadow = true;
buildingGroup.add(windowFrame);

//rotate building based on degrees clockwise from north
buildingGroup.rotation.y = Math.PI - THREE.MathUtils.degToRad(wall_azimuth);

// Ground receiving shadow
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(500, 500),
  new THREE.MeshStandardMaterial({ color: 0x808080 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
ground.receiveShadow = true;
ground.castShadow = true;

scene.add(ground);

//add grid for N,E,S,W
addCardinalGrid(scene, renderer, {
  size: 500,
  divisions: 50,
  edge: 230,
  labelSize: 48
});


const color = 0xffffffff;
const light = new THREE.DirectionalLight(color, 2);
light.target.position.set(0,1,0);

light.castShadow = true;
light.shadow.camera.near = 1;
light.shadow.camera.far = 1000;
light.shadow.camera.left = -150;
light.shadow.camera.right = 150;
light.shadow.camera.top = 150;
light.shadow.camera.bottom = -150;
light.shadow.bias = -0.0001;
light.shadow.radius = 2;  
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;

updateSunPosition(elevation_angle, azimuth_zimuth);
scene.add(light.target)
scene.add(light);

const helper = new THREE.DirectionalLightHelper(light, 5);
scene.add(helper);

// Small ambient for fill
const ambient = new THREE.AmbientLight(0xffffff, 0.000);
scene.add(ambient);

// GUI Controls
const gui = new GUI();
const params = {
  elevation_angle: elevation_angle,
  azimuth_zimuth: azimuth_zimuth,
  wall_azimuth: wall_azimuth
};

gui.add(params, 'elevation_angle', 0, 360, 1)
  .name('Elevation Angle')
  .onChange(value => {
    elevation_angle = value;
    updateSunPosition(elevation_angle, azimuth_zimuth);
  });

gui.add(params, 'azimuth_zimuth', 0, 360, 1)
  .name('Azimuth')
  .onChange(value => {
    azimuth_zimuth = value;
    updateSunPosition(elevation_angle, azimuth_zimuth);
  });

gui.add(params, 'wall_azimuth', 0, 360, 1)
  .name('Wall Azimuth')
  .onChange(value => {
    wall_azimuth = value;
    buildingGroup.rotation.y = Math.PI - THREE.MathUtils.degToRad(wall_azimuth);
  });

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  light.target.updateMatrixWorld();
  helper.update();
  renderer.render(scene, camera);
}

animate();

/**
 * updateSunPosition
 *
 * Converts NOAA solar elevation and azimuth into a Three.js light position.
 *
 * Coordinate system (matches the cardinal grid you are using):
 *   +X = East
 *   +Y = Up
 *   +Z = South
 *   -Z = North
 *
 * NOAA conventions:
 *   - sun_elevation (α): degrees ABOVE the horizon
 *   - sun_azimuth   (γ): degrees CLOCKWISE from North
 *
 * Math summary:
 *   Horizontal component  = cos(α)
 *   Vertical component    = sin(α)
 *
 *   x = cos(α) * sin(γ)
 *   y = sin(α)
 *   z = -cos(α) * cos(γ)
 *
 * Author: ChatGPT (OpenAI)
 */
function updateSunPosition(sun_elevation, sun_azimuth) {
  // Convert degrees to radians
  const a = THREE.MathUtils.degToRad(sun_elevation);
  const g = THREE.MathUtils.degToRad(sun_azimuth);

  // Distance of the sun from the origin (arbitrary for DirectionalLight)
  const radius = 200;

  // Compute sun position using NOAA-aligned geometry
  light.position.x = radius * Math.cos(a) * Math.sin(g);   // East–West
  light.position.y = radius * Math.sin(a);                 // Up
  light.position.z = -radius * Math.cos(a) * Math.cos(g);  // North–South

  // Aim the light at the scene origin
  light.target.position.set(0, 0, 0);
  light.target.updateMatrixWorld();
}
