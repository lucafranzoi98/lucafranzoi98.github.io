import { createApp } from 'vue'
import './style.scss'
import App from './App.vue'

import * as THREE from 'three';
import { WebGLRenderer } from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { degToRad } from 'three/src/math/MathUtils';
import { Reflector } from 'three/examples/jsm/objects/Reflector'
import { Timer } from 'three/addons/misc/Timer.js';

// Window size
let widthW = window.innerWidth;
let heightW = window.innerHeight;

// Add scene
const scene = new THREE.Scene();

// Add light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// Add camera
const camera = new THREE.PerspectiveCamera(50, widthW / heightW, 0.01, 1000);
camera.position.set(10, 5, 10);
camera.lookAt(0, 1, 0);

// Create floor
const floor = new Reflector(new THREE.PlaneGeometry(1000, 1000), {
    color: new THREE.Color(0x454545),
    textureWidth: widthW * window.devicePixelRatio,
    textureHeight: heightW * window.devicePixelRatio,
});
floor.rotateX(degToRad(90));
floor.rotateY(degToRad(180));
scene.add(floor);

// Create bg
const bgGeo = new THREE.SphereGeometry(200, 50, 50);
const bgMat = new THREE.MeshStandardMaterial({ color: 0xffa500 });
const bg = new THREE.Mesh(bgGeo, bgMat);
bg.material.side = THREE.DoubleSide;
scene.add(bg);

// Particles
const vertices = [];

for (let i = 0; i < 100000; i++) {
    const x = THREE.MathUtils.randFloatSpread(200);
    const y = THREE.MathUtils.randFloatSpread(200);
    const z = THREE.MathUtils.randFloatSpread(200);

    vertices.push(x, y, z);
}
const circle = new THREE.TextureLoader().load('/assets/img/circle.png');

const particlesGeo = new THREE.BufferGeometry();
particlesGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
const particlesMat = new THREE.PointsMaterial({ color: 0xffa500, size: 0.2, map: circle, alphaTest: 0.5, transparent: true });
const particles = new THREE.Points(particlesGeo, particlesMat);
scene.add(particles);

const model = '/assets/3d/Toy_Rocket.glb'
const loader = new GLTFLoader();
loader.load(model, function (gltf) {
    gltf.scene.position.set(0, 0, 0);
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

// Render of scene
const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(widthW, heightW);
document.body.appendChild(renderer.domElement);

// Render scene on window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};

window.addEventListener('resize', () => {
    onWindowResize();
});

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

let timer = new Timer();
timer.setTimescale(5);

let direction = 1;

function animate(timestamp) {
    particles.rotation.y += 0.0001;
    
    timer.update( timestamp );
    console.log(timer);

    if (timer._currentTime >= 2000) {
        if (direction == 1) {
            particles.scale.x += 0.005;
            particles.scale.y += 0.005;
            particles.scale.z += 0.005;

            direction = 2;
            timer.reset();
        } else {
            particles.scale.x += -0.005;
            particles.scale.y += -0.005;
            particles.scale.z += -0.005;

            direction = 1;
            timer.reset();
        }
    }

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();

createApp(App).mount('#app')