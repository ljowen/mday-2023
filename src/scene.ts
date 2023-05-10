import * as THREE from "three";

/* @ts-ignore */
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
/* @ts-ignore */
import { FontLoader } from "three/addons/loaders/FontLoader.js";
/* @ts-ignore */
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

let camera: THREE.PerspectiveCamera,
  scene: THREE.Scene,
  renderer: THREE.Renderer;

init();

const meshes = new Array();
const boxes = new Array();

function init() {
  camera = new THREE.PerspectiveCamera(
    30,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.set(0, 0, 750);  
  
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  const loader = new FontLoader();
  loader.load("./helvetiker_regular.typeface.json", function (font: any) {
    for (let [idx, text] of [
      "HAPPY",
      "MOTHERS",
      "DAY",
      "MADDY!",
      "",
      "",
      "",
      "",
    ].entries()) {
      const textGeo = new TextGeometry(text, {
        font,
        size: 120,
        height: 20,
        curveSegments: 4,
      });

      new THREE.TextureLoader().load(`./download-${idx}.png`, (texture) => {
        const texture2 = texture.clone();
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(0.015, 0.015);

        const mat = new THREE.MeshBasicMaterial({
          color: "rgba(255,255,255,0)",
          map: texture,
        });

        const mesh = new THREE.Mesh(textGeo, mat);
        let bbox = new THREE.Box3().setFromObject(mesh);
        let size = new THREE.Vector3();
        bbox.getSize(size);

        mesh.position.x += idx * 1000;
        console.log(mesh.position.x, idx);

        // mesh.position.y += 250 - idx * 150;
        
        scene.add(mesh);
        meshes.push(mesh);

        const box = new THREE.Mesh(
          new THREE.BoxGeometry(70, 70, 70),
          new THREE.MeshBasicMaterial({ map: texture2 })
        );
        box.position.y -= 60;
        box.position.x = -150 + idx * 100;

        boxes.push(box);
        scene.add(box);

        render();
      });
    }
  });

  renderer = new THREE.WebGLRenderer({ antialias: true });
  /* @ts-ignore */
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.update();

  controls.addEventListener("change", render);

  window.addEventListener("resize", onWindowResize);
} // end init

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.rotateX(-0.1);
  render();
}

function render() {
  renderer.render(scene, camera);
}

setInterval(() => {
  console.log(boxes[0].position.x);
}, 1000);

let reverse = false;
function animate() {
  requestAnimationFrame(animate);
  
  meshes.forEach((m) => {
    m.position.x -= 5;    
  });
  renderer.render(scene, camera);


  boxes.forEach(b => {
    b.rotateX(0.005);
    b.rotateZ(0.008)
    b.position.x += (reverse ? 1 : -1) * 1
  })  ;
  if(boxes[0].position.x > 1000 || boxes[0].position.x < -1000) {
    reverse = !reverse;
  }

  /* Reset */
  if (meshes[0].position.x < -4210) {
    meshes.forEach((m, idx) => {
      m.position.x = idx * 1000;
    });
  }
}

animate();
