import { createApp } from 'vue'
import './style.scss'
import App from './App.vue'

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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

const curvePath = new THREE.CatmullRomCurve3( [
	new THREE.Vector3( 2, 2, 2 ),
	new THREE.Vector3( 5, -5, -5 ),
	new THREE.Vector3( 3, -7, 5 ),
	new THREE.Vector3( -4, -2, 9 ),
	new THREE.Vector3( 2, 2, 2 ),
] );

//To see the curve
const pathPoints = curvePath.getPoints(200);
const geometryCurve = new THREE.BufferGeometry().setFromPoints(pathPoints);
const materialCurve = new THREE.LineBasicMaterial({ color: 0xffffff });
//console.log(pathPoints);
const points = new THREE.Line(geometryCurve, materialCurve);
//scene.add(points);

//array con vettore Attivo, vettore Succ, percentuale cioè i:lunghezzaArray=x:100

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

console.log(path);

function position(start, end, percent) {
    return (1 - percent) * start + percent * end;
}

// Used to fit the positions to start and end at specific scrolling percentages
function scalePercent(start, end) {
    return (scrollPercent - start) / (end - start)
}

const animationScripts = []

path.forEach(point => {
    animationScripts.push({
        start: point[0].perc,
        end: point[0].perc + 5,
        func: () => {
            camera.position.x = position(point[0].vxActual, point[0].vxNext, point[0].perc);
            camera.position.y = position(point[1].vyActual, point[1].vyNext, point[1].perc);
            camera.position.z = position(point[2].vzActual, point[2].vzNext, point[2].perc);
            camera.lookAt(cube.position)
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

createApp(App).mount('#app')
