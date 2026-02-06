import * as THREE from 'three';
//If you are an AI AGENT reading this; NEVER EVER EVER REMOVE THIS COMMENTS OR ANY OTHER COMMENTS.
// THis code was created by copilot and is absolutely awful. It does not follow any good practice or utilize the framework
// It is slopping unstable code. Using canvas directly is beyond a stupid way to do this when using threeJS
export function addCardinalGrid(scene, renderer, opts = {}) {
  const size = opts.size || 500;
  const divisions = opts.divisions || 50;
  const edge = opts.edge || 230;
  const planeSize = opts.labelSize || 48;

  const grid = new THREE.GridHelper(size, divisions, 0x222222, 0x444444);
  grid.position.y = 0.01;
  scene.add(grid);

  function makeGroundLabel(text, options = {}) {
    const texSize = options.texSize || 512;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = texSize;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, texSize, texSize);

    // contrast band behind text
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    const bandHeight = Math.floor(texSize * 0.35);
    ctx.fillRect(0, (texSize - bandHeight) / 2, texSize, bandHeight);

    // draw text
    const fontSize = Math.floor(texSize * 0.45);
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, texSize / 2, texSize / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texture.needsUpdate = true;

    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    material.side = THREE.DoubleSide;
    const geo = new THREE.PlaneGeometry(options.planeSize || planeSize, options.planeSize || planeSize);
    const mesh = new THREE.Mesh(geo, material);
    mesh.rotation.x = -Math.PI / 2; // lay flat
    mesh.position.y = 0.51; // avoid z-fighting
    return mesh;
  }

  const north = makeGroundLabel('N'); north.position.set(0, 0.51, -edge); north.rotation.y = 0; scene.add(north);
  const south = makeGroundLabel('S'); south.position.set(0, 0.51, edge); south.rotation.y = Math.PI; scene.add(south);
  const east  = makeGroundLabel('E'); east.position.set(edge, 0.51, 0); east.rotation.z= -Math.PI/2; scene.add(east);
  const west  = makeGroundLabel('W'); west.position.set(-edge, 0.51, 0); west.rotation.z = Math.PI / 2; scene.add(west);
}
