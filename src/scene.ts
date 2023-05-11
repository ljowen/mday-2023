import * as THREE from "three";

/* @ts-ignore */
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
/* @ts-ignore */
import { FontLoader } from "three/addons/loaders/FontLoader.js";
/* @ts-ignore */
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

let camera: THREE.PerspectiveCamera,
  scene: THREE.Scene,
  renderer: THREE.Renderer,
  controls: OrbitControls;


init();

const meshes = new Array();
const boxes = new Array();
const initPos = new Array();

function init() {
  camera = new THREE.PerspectiveCamera(
    30,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.set(0, 0, 750);  
  
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeb3474);

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

        mesh.position.x += 500 + idx * 1000;
        

        // mesh.position.y += 250 - idx * 150;
        
        scene.add(mesh);
        meshes.push(mesh);
        initPos.push(mesh.position.clone());        

        const box = new THREE.Mesh(
          new THREE.BoxGeometry(70, 70, 70),
          new THREE.MeshBasicMaterial({ map: texture2 })
        );
        box.position.y -= 60;
        box.position.x = 500 + idx * 100;

        boxes.push(box);
        scene.add(box);

        if(idx === 2) {
          const texture3 = texture.clone();
          texture3.wrapS = THREE.RepeatWrapping; 
          texture3.wrapT = THREE.RepeatWrapping;
          texture3.repeat.set( 1, 1 ); 
          const plane = new THREE.PlaneGeometry(1200, 1200, 2, 2);
          const mesh = new THREE.Mesh(plane, new THREE.MeshBasicMaterial(
            { map: texture3 }
          ));          
          mesh.material.side = THREE.DoubleSide;
          mesh.position.z = 750;
          scene.add(mesh);
        }
        render();
      });
    }
  });

  renderer = new THREE.WebGLRenderer({ antialias: true });
  /* @ts-ignore */
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.update();  
  controls.enabled = false;

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


let reverse = false;
let t = 0;
function animate() {
  t = requestAnimationFrame(animate);

  meshes.forEach((m) => {
    m.position.x -= 3;        
  });

  boxes.forEach((b,idx) => {
    b.rotateX((idx % 2 ? -1 : 1) * 0.005);
    b.rotateZ((idx % 2 ? 1 : -1) * 0.008);
    b.position.x += (reverse ? 1 : -1) * 1;
    b.position.z +=  Math.sin(idx + t / 100);
    b.position.y += 0.5 *  Math.cos(idx + t / 100);
  });
  if(boxes[0].position.x > 500 || boxes[0].position.x < -1000) {
    reverse = !reverse;
  }

  /* Reset */
  if (meshes[0].position.x < -4210) {
    console.log('reset')
    meshes.forEach((m: THREE.Mesh, idx) => {      
      const {x,y,z} = initPos[idx];
      m.position.set(x,y,z)      
    });
  }
  renderer.render(scene, camera);
}

setTimeout(animate, 2000);

let clickcount = 0;
const _click = () => {
  clickcount += 1;
  if(clickcount > 10) {
    controls.enabled = true;
  }
}


window.ontouchend = _click;
window.onclick = _click;

