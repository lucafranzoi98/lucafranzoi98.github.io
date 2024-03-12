import { createApp } from 'vue'
import './style.scss'
import App from './App.vue'

import * as THREE from 'three';
import { WebGLRenderer } from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { degToRad } from 'three/src/math/MathUtils';
import { Reflector } from 'three/examples/jsm/objects/Reflector'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';

// Window size
let widthW = window.innerWidth;
let heightW = window.innerHeight;
const pixelRatio = window.devicePixelRatio;

// Add scene
const scene = new THREE.Scene();

// Add light
const light = new THREE.HemisphereLight(0xffe4bb, 1);
scene.add(light);

// Add camera
const camera = new THREE.PerspectiveCamera(75, widthW / heightW, 0.001, 1000);
camera.position.set(6, 7, 6);
camera.lookAt(0, 2, 0);

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

for (let i = 0; i < 400000; i++) {
    const x = THREE.MathUtils.randFloatSpread(200);
    const y = THREE.MathUtils.randFloatSpread(200);
    const z = THREE.MathUtils.randFloatSpread(200);

    vertices.push(x, y, z);
}
const circle = new THREE.TextureLoader().load('/assets/img/circle.png');

const particlesGeo = new THREE.BufferGeometry();
particlesGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
const particlesMat = new THREE.PointsMaterial({ color: 0xffa500, size: 0.2, map: circle, transparent: true });
const particles = new THREE.Points(particlesGeo, particlesMat);
scene.add(particles);

let sceneMeshes = [];
let rocket;
const model = '/assets/3d/Toy_Rocket.glb'
const loader = new GLTFLoader();
loader.load(model, function (gltf) {
    rocket = gltf.scene;
    rocket.position.set(0, 0.5, 0);
    rocket.scale.set(2, 2, 2);
    rocket.userData = { URL: "http://stackoverflow.com" };
    scene.add(rocket);
    sceneMeshes.push(gltf);
});


// Render of scene
const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(widthW, heightW);
document.body.appendChild(renderer.domElement);

// // Add pass
// const composer = new EffectComposer(renderer);

// const renderPass = new RenderPass(scene, camera);
// composer.addPass(renderPass);

// const bokehPass = new BokehPass(scene, camera, {
//     focus: 10.0, // Set the focus distance
//     aperture: 0.002, // Adjust the aperture for depth of field effect
//     maxblur: 0.001, // Maximum blur strength
// });
// composer.addPass(bokehPass);

// const outputPass = new OutputPass();
// composer.addPass(outputPass);

// // Antialias pass
// const fxaaPass = new ShaderPass(FXAAShader);

// fxaaPass.material.uniforms['resolution'].value.x = 1 / (widthW * pixelRatio);
// fxaaPass.material.uniforms['resolution'].value.y = 1 / (heightW * pixelRatio);

// composer.addPass(fxaaPass);

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
// scene.add(axesHelper);

let clock = new THREE.Clock();

let direction = 1;

function onClick() {

    const mouse = new THREE.Vector2();

    let element = document.getElementById('main');
    let clientRect = element.getBoundingClientRect();
    let clientX = clientRect.width;
    let clientY = clientRect.height;
    
    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(clientY / window.innerHeight) * 2 + 1;
    
    let raycaster = new THREE.Raycaster();

    raycaster.setFromCamera(mouse, camera);

    let intersects = raycaster.intersectObjects(scene.children, false);

    if (intersects.length > 0) {
        intersects.forEach(intersect => {
            console.log(intersect.object.type);
            if (intersect.object == 'Mesh') {
                console.log('A');
            }
        });
        console.log(intersects);
    }
}

window.addEventListener('click', () => {
    onClick(MouseEvent);
});

function animate() {
    particles.rotation.y += 0.0002;

    let time = clock.getElapsedTime();
    let timeRatio = (time / 5) - 1;

    let scaleRatio = (-Math.pow(timeRatio, 2) + 1) / 5000;

    particles.scale.x += (direction == 1 ? +scaleRatio : -scaleRatio);
    particles.scale.y += (direction == 1 ? +scaleRatio : -scaleRatio);
    particles.scale.z += (direction == 1 ? +scaleRatio : -scaleRatio);

    if (time > 10) {
        clock.running = false;
        direction = -direction;
    }

    if (rocket) {
        rocket.rotation.y += -0.0005;
    }

    requestAnimationFrame(animate);
    renderer.render(scene, camera);

}

animate();

createApp(App).mount('#app')