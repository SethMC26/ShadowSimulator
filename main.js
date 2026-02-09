import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { addCardinalGrid } from './cardinalGrid.js';
import GUI from 'lil-gui';

//constants and variables for our model
let wall_azimuth = 180;
let latitude = 42.3601;
let longitude = -71.0589;
let date = '2024-06-21';
let time = '12:00';
//building default dimensions
let buildingWidth = 24;
let buildingHeight = 20;
let buildingDepth = 64;
// Window frame (will be placed on building face)
let windowWidth = 20;
let windowFrameHeight = 2; // fixed physical height of the window frame
let windowDepth = 10;
// vertical center position of the window frame (will be clamped inside the building)
let windowY = buildingHeight / 2;
let isRunning = false;

//scene with everything in it 
const scene = new THREE.Scene();

//camera is what we see 
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 60, 180);

//renderer draws the scene and camera to the screen
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

//building itself
const building = new THREE.Mesh(
  new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingDepth),
  new THREE.MeshStandardMaterial({ color: 0xffaa00 })
);

building.position.y = buildingHeight / 2;
// NOTE: rotation is applied to the GROUP, not the mesh
building.castShadow = true;
building.receiveShadow = true;
buildingGroup.add(building);

const windowFrame = new THREE.Mesh(
  new THREE.BoxGeometry(windowWidth, windowFrameHeight, windowDepth),
  new THREE.MeshStandardMaterial({ color: 0x0000ff })
);
// rotate to be perpendicular to building face
windowFrame.rotation.y = -Math.PI / 2;
windowFrame.castShadow = true;
buildingGroup.add(windowFrame);

// rotate building based on degrees clockwise from north
buildingGroup.rotation.y = Math.PI - THREE.MathUtils.degToRad(wall_azimuth);

// initial placement
updateBuildingGeometry();

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
//this was done by copilot and is so awful i moved it to a seperate file so i would not get an aneurysm 
addCardinalGrid(scene, renderer, {
  size: 500,
  divisions: 50,
  edge: 230,
  labelSize: 48
});

//add light to represent our sun 
const color = 0xffffffff;
const light = new THREE.DirectionalLight(color, 2);
light.target.position.set(0,500,0);

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

scene.add(light.target)
scene.add(light);

const helper = new THREE.DirectionalLightHelper(light, 10);
scene.add(helper);

// Small ambient for fill
const ambient = new THREE.AmbientLight(0xffffff, 0.005);
scene.add(ambient);

// GUI Controls
const gui = new GUI();
const params = {
  latitude: latitude,
  longitude: longitude,
  wall_azimuth: wall_azimuth,
  date: date,
  time: time,
  buildingWidth: buildingWidth,
  buildingHeight: buildingHeight,
  buildingDepth: buildingDepth,
  windowWidth: windowWidth,
  windowY: windowY,
  windowDepth: windowDepth,
  
};

gui.add(params, 'latitude')
  .name('Latitude')
  .onChange(value => {
    latitude = value;
    fetchSolarData(latitude, longitude, date, time);
  });

gui.add(params, 'longitude')
  .name('Longitude')
  .onChange(value => {
    longitude = value;
    fetchSolarData(latitude, longitude, date, time);
  });

gui.add(params, 'wall_azimuth', 0, 360, 1)
  .name('Wall Azimuth (°)')
  .onChange(value => {
    wall_azimuth = value;
    buildingGroup.rotation.y = Math.PI - THREE.MathUtils.degToRad(wall_azimuth);
  });

const dateController = gui.add(params, 'date')
  .name('Date (YYYY-MM-DD)')
  .onChange(value => {
    date = value;
    fetchSolarData(latitude, longitude, date, time);
  });

const timeController = gui.add(params, 'time')
  .name('Time (HH:MM)')
  .onChange(value => {
    time = value;
    fetchSolarData(latitude, longitude, date, time);
  });

//add toggle feature for button
const playback = {
  playPause() {
    isRunning = !isRunning;
    playPauseController.name(isRunning ? 'Pause' : 'Play');
  }
};

const playPauseController = gui
  .add(playback, 'playPause')
  .name(isRunning ? 'Pause' : 'Play');

// Building dimension controls (numeric inputs in folder)
const buildingFolder = gui.addFolder('Building');
buildingFolder.add(params, 'buildingWidth')
  .name('Width')
  .onChange(value => {
    buildingWidth = Number(value);
    updateBuildingGeometry();
  });

buildingFolder.add(params, 'buildingHeight')
  .name('Height')
  .onChange(value => {
    buildingHeight = Number(value);
    updateBuildingGeometry();
  });

buildingFolder.add(params, 'buildingDepth')
  .name('Depth')
  .onChange(value => {
    buildingDepth = Number(value);
    updateBuildingGeometry();
  });

// Window controls (numeric inputs in folder)
const windowFolder = gui.addFolder('Window');
windowFolder.add(params, 'windowWidth')
  .name('Width')
  .onChange(value => {
    windowWidth = Number(value);
    updateBuildingGeometry();
  });

windowFolder.add(params, 'windowY')
  .name('Vertical')
  .onChange(value => {
    windowY = Number(value);
    updateBuildingGeometry();
  });

windowFolder.add(params, 'windowDepth')
  .name('Depth')
  .onChange(value => {
    windowDepth = Number(value);
    updateBuildingGeometry();
  });

// "Mutex" for fetch chain, we will chain fethces so that they execute sequentially
let lastFetchPromise = Promise.resolve();
//clock to only update position every 200 ms instead of every frame
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  if(isRunning && clock.getElapsedTime() * 1000 > 200) { // update every 200 ms
    clock.start(); // reset clock
    //add 30 minutes to time string format HH::MM
    //copilot generated logic to add 5 minutes to time string in format HH:MM
    let [hours, minutes] = time.split(':').map(Number); //turns string of time into two numbers one hours one minutes

    minutes += 30;
    //handle minute overflows 
    if (minutes >= 60) {
      hours += Math.floor(minutes / 60);
      minutes = minutes % 60;
    }
    //handle hour overflows
    if (hours >= 24) {
      hours = hours % 24;
      // add day in YYYY-MM-DD format
      //chatGPT magic using date object and converting it back to a string
      //date object will also handle incrementing month and year
      const d = new Date(date + 'T00:00:00');
      d.setDate(d.getDate() + 1);
      date = d.toISOString().slice(0, 10);
      //update controller 
      params.date = date;
      dateController.updateDisplay();
    }
    //update time controler to reflect new time
    time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    params.time = time;
    timeController.updateDisplay();
    
    //chain async requests together so they execute sequentially
    lastFetchPromise = lastFetchPromise.then(async () => {
      try {
        await fetchSolarData(latitude, longitude, date, time);
      } catch (err) {
        console.error('fetchSolarData error:', err);
      }
    });
  }

  controls.update();
  light.target.updateMatrixWorld();
  helper.update();
  renderer.render(scene, camera);
}
animate();
// Initialize with default values
fetchSolarData(latitude, longitude, date,time);

/**
 * Get data from US Navial observitory API using the latitude, longitude, date, and time. Then extract the sun_elevation and sun_azimuth from the response and update the sun position in the scene.
 * @param {Number} latitude 
 * @param {Number} longitude 
 * @param {String} date date in YYYY-MM-DD
 * @param {String} time hh:mm:ss
 */
async function fetchSolarData(latitude, longitude, date, time) {
  
  const url = `https://aa.usno.navy.mil/api/celnav?date=${date}&time=${time}&coords=${latitude},${longitude}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
   
    //get celestial data
    const data = result?.properties?.data;
    if (!data) {
      throw new Error('No data field in response');
    }
    
    //find sun data and extract sun_elevation and sun_azimuth
    for (const item of data) {
      if (item?.object === 'Sun') {
        const sun_elevation = item?.almanac_data?.hc;
        const sun_azimuth = item?.almanac_data?.zn;

        if (!sun_elevation || !sun_azimuth) {
          throw new Error('Missing sun_elevation or sun_azimuth in data');
        }

        updateSunPosition(sun_elevation, sun_azimuth)
        break;
      }
    }
    //pasrse JSON fields to get sun_elevation and sun_azimuth
    //get 
  } catch (error) {
    console.error(error.message);
  }
}

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

// helper to update positions/geometry when dimensions change
//written by copilot
function updateBuildingGeometry() {
  // update building geometry
  building.geometry.dispose();
  building.geometry = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingDepth);
  building.position.y = buildingHeight / 2;

  // update window frame geometry and position (placed on east face)
  windowFrame.geometry.dispose();
  windowFrame.geometry = new THREE.BoxGeometry(windowWidth, windowFrameHeight, windowDepth);
  // compute clamped vertical position so frame doesn't clip into the building
  const halfFrameH = windowFrameHeight / 2;
  const minY = halfFrameH;
  const maxY = buildingHeight - halfFrameH;
  const clampedY = Math.max(minY, Math.min(windowY, maxY));
  // place window on the east face, centered at clampedY. position.x uses half-depth to avoid clipping
  windowFrame.position.set(buildingWidth / 2 + windowDepth / 2 + 0.1, clampedY, 0);
}
