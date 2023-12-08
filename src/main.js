import { createApp } from 'https://unpkg.com/vue@3/dist/vue.global.js'
import './style.scss'
import App from './App.vue'

import * as THREE from 'https://unpkg.com/three@0.159.0/build/three.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.159.0/examples/jsm/loaders/GLTFLoader.js';

let widthW = window.innerWidth;
let heightW = window.innerHeight;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1f1f1f);
const camera = new THREE.PerspectiveCamera(50, widthW / heightW, 0.1, 1000);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

const directionalLightBack = new THREE.DirectionalLight(0xffffff, 1);
directionalLightBack.position.set(-10, -10, -10);
scene.add(directionalLightBack);

const model = '/assets/3d/Toy_Rocket.glb'
const loader = new GLTFLoader();
loader.load(model, function (gltf) {
    gltf.scene.position.set(0, -2, 0);
    scene.add(gltf.scene);
}, undefined, function (error) {
    console.error(error);
});

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshNormalMaterial();
const cube = new THREE.Mesh(geometry, material);
//scene.add(cube);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(widthW, heightW);
document.body.appendChild(renderer.domElement);

// Add axes helper
const axesHelper = new THREE.AxesHelper(5);
//scene.add(axesHelper);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.updateProjectionMatrix();
};

window.addEventListener('resize', () => {
    onWindowResize();
});

const v1 = new THREE.Vector3(6, 2, 2);
const v2 = new THREE.Vector3(0, -12, -10);
const v3 = new THREE.Vector3(-9, 8, 5);
const curvePath = new THREE.QuadraticBezierCurve3(v1, v2, v3);

//To see the curve
const v3Array = curvePath.getPoints(20);
const geometryCurve = new THREE.BufferGeometry().setFromPoints(v3Array);
const materialCurve = new THREE.LineBasicMaterial({ color: 0xffffff });
//console.log(v3Array);
const points = new THREE.Line(geometryCurve, materialCurve);
scene.add(points);

//array con vettore Attivo, vettore Succ, percentuale cioè i:lunghezzaArray=x:100

const vxArray = [];

for (let i = 0; i < v3Array.length - 1; i++) {
    vxArray.push({
        'vxActual': v3Array[i].x,
        'vxNext': v3Array[(i + 1)].x,
        'perc': Math.round((i * 100) / (v3Array.length - 2))
    })
}

//console.log(vxArray);

function position(start, end, percent) {
    return (1 - percent) * start + percent * end;
}

// Used to fit the positions to start and end at specific scrolling percentages
function scalePercent(start, end) {
    return (scrollPercent - start) / (end - start)
}

const animationScripts = []

// animationScripts.push({
//     start: 0,
//     end: 100,
//     func: () => {
//         vxArray.forEach(point => {
//             camera.position.x = position(point.vxActual, point.vxNext, point.perc);

//         })
//         camera.position.y = position(1, 5, scalePercent(0, 49))
//         camera.position.z = position(1, 5, scalePercent(0, 49))
//         camera.lookAt(cube.position)
//         console.log(camera.position);
//     },
// })

//add an animation that moves the camera between 0 - 100 percent of scroll
animationScripts.push({
    start: 0,
    end: 49,
    func: () => {
        camera.position.x = position(1, 5, scalePercent(0, 49))
        camera.position.y = position(1, 5, scalePercent(0, 49))
        camera.position.z = position(1, 5, scalePercent(0, 49))
        camera.lookAt(cube.position)
    },
})

animationScripts.push({
    start: 49,
    end: 100,
    func: () => {
        camera.position.x = position(5, 10, scalePercent(49, 100))
        camera.position.y = position(5, 10, scalePercent(49, 100))
        camera.position.z = position(5, 10, scalePercent(49, 100))
        camera.lookAt(cube.position)
    },
})

function playScrollAnimations() {
    animationScripts.forEach((a) => {
        if (scrollPercent >= a.start && scrollPercent < a.end) {
            a.func()
        }
    })
}

let scrollPercent = 0

document.body.onscroll = () => {
    //calculate the current scroll progress as a percentage
    scrollPercent =
        ((document.documentElement.scrollTop || document.body.scrollTop) /
            ((document.documentElement.scrollHeight || document.body.scrollHeight) -
                document.documentElement.clientHeight)) *
        100

}

function animate() {
    requestAnimationFrame(animate);
    playScrollAnimations();
    renderer.render(scene, camera);
}

animate();

//const controls = new OrbitControls(camera, renderer.domElement);

createApp(App).mount('#app')
