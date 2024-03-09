import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { degToRad } from 'three/src/math/MathUtils';
import { Reflector } from 'three/examples/jsm/objects/Reflector'

// Window size
let widthW = window.innerWidth;
let heightW = window.innerHeight;

// Add scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x3d3d3d);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// Add camera
const camera = new THREE.PerspectiveCamera(50, widthW / heightW, 0.01, 1000);
camera.position.set(15, 15, 15);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create floor
const floor = new Reflector(new THREE.PlaneGeometry(1000, 1000), {
    color: new THREE.Color(0x7f7f7f),
    textureWidth: widthW * window.devicePixelRatio,
    textureHeight: heightW * window.devicePixelRatio,
});
floor.rotateX(degToRad(90));
floor.rotateY(degToRad(180));
scene.add(floor);

// Create path for the camera to move along
const curvePath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(2, 0, 2),
    new THREE.Vector3(5, 2, 10),
    new THREE.Vector3(2, 2, 12),
    new THREE.Vector3(-4, 5, 8),
    new THREE.Vector3(-7, 3, 5),
]);

// Get individual points from path
const pathPoints = curvePath.getPoints(300);

// To see path
const geometryPoints = new THREE.BufferGeometry().setFromPoints(pathPoints);
const materialPoints = new THREE.LineBasicMaterial({ color: 0xffffff });

const line = new THREE.Line(geometryPoints, materialPoints);
scene.add(line);

const model = '/assets/3d/Toy_Rocket.glb'
const loader = new GLTFLoader();
loader.load(model, function (gltf) {
    gltf.scene.position.set(2, 2, 2);
    scene.add(gltf.scene);
}, undefined, function (error) {
    console.error(error);
});

// Model 1
const geometry1 = new THREE.BoxGeometry(1, 1, 1);
const material1 = new THREE.MeshNormalMaterial();
const model1 = new THREE.Mesh(geometry1, material1);
model1.position.set(5, 0, 5);
scene.add(model1);

// Model 2
const geometry2 = new THREE.BoxGeometry(1, 1, 1);
const material2 = new THREE.MeshNormalMaterial();
const model2 = new THREE.Mesh(geometry2, material2);
model2.position.set(0, 2, 12);
scene.add(model2);

// Model 3
const geometry3 = new THREE.BoxGeometry(1, 1, 1);
const material3 = new THREE.MeshNormalMaterial();
const model3 = new THREE.Mesh(geometry3, material3);
model3.position.set(-8, 2, 4);
scene.add(model3);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();