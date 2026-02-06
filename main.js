import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 60, 180);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Compass needle element (rotates to indicate world north relative to the view)
const compassNeedle = document.getElementById('compass-needle');

// Building (24 x 60 x 24)
const building = new THREE.Mesh(
  new THREE.BoxGeometry(24, 40, 64),
  new THREE.MeshStandardMaterial({ color: 0xffaa00 })
);
building.position.y = building.geometry.parameters.height / 2;
building.castShadow = true;
building.receiveShadow = true;
scene.add(building);

const windowFrame = new THREE.Mesh(
  new THREE.BoxGeometry(20, 5, 10),
  new THREE.MeshStandardMaterial({ color: 0x0000ff })
);
windowFrame.rotation.y = -Math.PI / 2;
windowFrame.position.set(12.1, 20, 0);
windowFrame.castShadow = true;
scene.add(windowFrame);

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

const color = 0xffffffff;
const light = new THREE.DirectionalLight(color, 2);
light.position.set(150, 200, 100);
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

scene.add(light.target)
scene.add(light);

const helper = new THREE.DirectionalLightHelper(light, 5);
scene.add(helper);

// Small ambient for fill
const ambient = new THREE.AmbientLight(0xffffff, 0.000);
scene.add(ambient);

// OrbitControls (simple mouse control)
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 30, 0);


function animate() {
  requestAnimationFrame(animate);
  controls.update();
  light.target.updateMatrixWorld();
  helper.update();
  renderer.render(scene, camera);
}

animate();