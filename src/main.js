import { createApp } from 'vue'
import './style.scss'
import App from './App.vue'

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { WebGLRenderer } from "three";
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { degToRad } from 'three/src/math/MathUtils';
import { Reflector } from 'three/examples/jsm/objects/Reflector'

// Window size
let widthW = window.innerWidth;
let heightW = window.innerHeight;
const pixelRatio = window.devicePixelRatio;

// Add scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x3d3d3d);

// Add camera
const camera = new THREE.PerspectiveCamera(50, widthW / heightW, 0.01, 1000);

// Add light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// Add light
const directionalLightBack = new THREE.DirectionalLight(0xffffff, 1);
directionalLightBack.position.set(-10, -10, -10);
scene.add(directionalLightBack);

// Create floor
const floor = new Reflector(new THREE.PlaneGeometry(1000, 1000), {
    color: new THREE.Color(0x7f7f7f),
    textureWidth: widthW * window.devicePixelRatio,
    textureHeight: heightW * window.devicePixelRatio,
});
floor.rotateX(degToRad(90));
floor.rotateY(degToRad(180));
scene.add(floor);

// Add 3d model
// const model = '/assets/3d/Toy_Rocket.glb'
// const loader = new GLTFLoader();
// loader.load(model, function (gltf) {
//     gltf.scene.position.set(5, -2, 5);
//     scene.add(gltf.scene);
// }, undefined, function (error) {
//     console.error(error);
// });

// Model 1
const geometry1 = new THREE.BoxGeometry(1, 1, 1);
const material1 = new THREE.MeshNormalMaterial();
const model1 = new THREE.Mesh(geometry1, material1);
model1.position.set(5, 2, 5);
scene.add(model1);

// Model 2
const geometry2 = new THREE.BoxGeometry(1, 1, 1);
const material2 = new THREE.MeshNormalMaterial();
const model2 = new THREE.Mesh(geometry2, material2);
model2.position.set(0, 5, 12);
scene.add(model2);

// Model 3
const geometry3 = new THREE.BoxGeometry(1, 1, 1);
const material3 = new THREE.MeshNormalMaterial();
const model3 = new THREE.Mesh(geometry3, material3);
model3.position.set(-8, 5, 4);
scene.add(model3);

// Render of scene
const renderer = new WebGLRenderer();
renderer.setSize(widthW, heightW);
document.body.appendChild(renderer.domElement);

// Add pass
const composer = new EffectComposer(renderer);

const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// const bokehPass = new BokehPass(scene, camera, {
//     focus: 2.0, // Set the focus distance
//     aperture: 0.0002, // Adjust the aperture for depth of field effect
//     maxblur: 0.02, // Maximum blur strength
// });
// composer.addPass(bokehPass);

const outputPass = new OutputPass();
composer.addPass(outputPass);

// Antialias pass
const fxaaPass = new ShaderPass(FXAAShader);

fxaaPass.material.uniforms['resolution'].value.x = 1 / (widthW * pixelRatio);
fxaaPass.material.uniforms['resolution'].value.y = 1 / (heightW * pixelRatio);

composer.addPass(fxaaPass);

// Render scene on window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
};

window.addEventListener('resize', () => {
    onWindowResize();
});

// Create path for the camera to move along
const curvePath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 9, 0),
    new THREE.Vector3(2, 3, 2),
    new THREE.Vector3(5, 3, 10),
    new THREE.Vector3(2, 3, 12),
    new THREE.Vector3(-4, 10, 8),
    new THREE.Vector3(-7, 6, 5),
]);

// Get individual points from path
const pathPoints = curvePath.getPoints(300);

// Array for each point with actual coordinate, next coordinate and percentual, for each xyz coordinate
const path = [];
for (let i = 0; i < pathPoints.length - 1; i++) {
    path.push(
        [
            {
                'vxActual': pathPoints[i].x,
                'vxNext': pathPoints[(i + 1)].x,
                'perc': Math.round((i * 100) / (pathPoints.length - 1))
            },
            {
                'vyActual': pathPoints[i].y,
                'vyNext': pathPoints[(i + 1)].y,
                'perc': Math.round((i * 100) / (pathPoints.length - 1))
            },
            {
                'vzActual': pathPoints[i].z,
                'vzNext': pathPoints[(i + 1)].z,
                'perc': Math.round((i * 100) / (pathPoints.length - 1))
            }
        ]
    )
}

// Calc the position along the total points
function position(start, end, percent) {
    return (1 - percent) * start + percent * end;
}

let scrollPercent = 0

const animationScripts = []

path.forEach(point => {
    animationScripts.push({
        start: point[0].perc,
        end: point[0].perc + 5,
        func: () => {
            camera.position.x = point[0].vxActual;
            camera.position.y = point[1].vyActual;
            camera.position.z = point[2].vzActual;
            camera.lookAt(point[0].vxNext, point[1].vyNext, point[2].vzNext);
        },
    })
});

function playScrollAnimations() {
    animationScripts.forEach((a) => {
        if (scrollPercent >= a.start && scrollPercent < a.end) {
            a.func()
        }
    })
}

document.body.onscroll = () => {
    //calculate the current scroll progress as a percentage
    scrollPercent =
        ((document.documentElement.scrollTop || document.body.scrollTop) /
            ((document.documentElement.scrollHeight || document.body.scrollHeight) -
                document.documentElement.clientHeight)) *
        100;
}

function animate() {
    requestAnimationFrame(animate);
    playScrollAnimations();
    composer.render();
}

animate();

createApp(App).mount('#app')
