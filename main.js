import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FlyControls } from "three/examples/jsm/controls/FlyControls";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { Linear } from "gsap";

import * as dat from "dat.gui";

let mouseX = 0;
let mouseY = 0;

let targetX = 0;
let targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

// DEBUG
const gui = new dat.GUI();

// CANVAS
const canvas = document.querySelector(".webgl");

// SCENE
const scene = new THREE.Scene();
// scene.background = new THREE.Color(0xffffff);
const sceneColor = {
	color: 0xffffff,
};
scene.fog = new THREE.Fog(sceneColor.color, 15, 15);
gui.addColor(sceneColor, "color").onChange((value) => {
	scene.background = new THREE.Color(value);
});

//TEXTURES

// create video element
const video = document.createElement("video");
video.src = "./vid.mov";
video.load();
video.play();

// create three js video texture
const videoTexture = new THREE.VideoTexture(video);
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;
// videoTexture.format = THREE.RGBFormat;
const loadingManager = new THREE.LoadingManager();
video.loop = true;

const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);

const textureLoader = new THREE.TextureLoader(loadingManager);
const texture = textureLoader.load("./static/textures/door/color.jpg");
const matcapTexture = textureLoader.load("./static/textures/matcaps/7.png");

const environmentMapTexture = cubeTextureLoader.load([
	"./static/textures/environmentMaps/1/px.jpg",
	"./static/textures/environmentMaps/1/nx.jpg",
	"./static/textures/environmentMaps/1/py.jpg",
	"./static/textures/environmentMaps/1/ny.jpg",
	"./static/textures/environmentMaps/1/pz.jpg",
	"./static/textures/environmentMaps/1/nz.jpg",
]);

// FONTS

const fontLoader = new FontLoader();

const donutGeometry = new THREE.TorusBufferGeometry(0.3, 0.2, 64, 64);

fontLoader.load("./static/fonts/helvetiker_regular.typeface.json", (font) => {
	console.log("font loaded");
	const textGeometry = new TextGeometry("Karl Swatman", {
		font: font,
		size: 0.5,
		height: 0.1,
		curveSegments: 5,
		bevelEnabled: true,
		bevelThickness: 0.0001,
		bevelSize: 0.02,
		bevelSegments: 3,
		bevelOffset: 0,
		// bevelEnabled: false,
	});
	textGeometry.center();
	const material = new THREE.MeshStandardMaterial({
		metalness: 1,
		roughness: 0,
		color: 0xffffff,
	});
	const parameters = {
		color: 0xff0000,
	};
	gui.addColor(parameters, "color").onChange(function () {
		// material.color.set(parameters.color);
		material.emissive.set(parameters.color);
	});

	gui.add(material, "metalness", 0, 1);
	gui.add(material, "roughness", 0, 1);
	const textMesh = new THREE.Mesh(textGeometry, material);
	scene.add(textMesh);

	const nextTextGeom = new TextGeometry("Creative Developer", {
		font: font,
		size: 0.5,
		height: 0.1,
		curveSegments: 10,
		bevelEnabled: true,
		bevelThickness: 0.01,
		bevelSize: 0.02,
		bevelSegments: 4,
		bevelOffset: 0,
		// bevelEnabled: false,
	});
	nextTextGeom.center();

	const nextTextMesh = new THREE.Mesh(nextTextGeom, material);
	nextTextMesh.position.set(0, -0.8, 0);

	scene.add(nextTextMesh);

	// Donuts

	console.time("donut");
	for (let i = 0; i < 100; i++) {
		const donut = new THREE.Mesh(donutGeometry, material);

		donut.position.x = (Math.random() - 0.5) * 10;
		donut.position.y = (Math.random() - 0.5) * 10;
		donut.position.z = (Math.random() - 0.5) * 10;
		donut.rotation.x = Math.random() * Math.PI;
		donut.rotation.y = Math.random() * Math.PI;
		const scale = Math.random();
		donut.scale.set(scale, scale, scale);

		scene.add(donut);
	}
	console.timeEnd("donut");
});

// AXES HELPER

// const axesHelper = new THREE.AxesHelper();
// scene.add(axesHelper);

// OBJECTS
const geometry = new THREE.PlaneGeometry(10, 10);
const groundMirror = new Reflector(geometry, {
	clipBias: 0.02,
	textureWidth: window.innerWidth * window.devicePixelRatio,
	textureHeight: window.innerHeight * window.devicePixelRatio,
	color: 0x0,
	envMap: environmentMapTexture,
	reflectivity: 0.5,
});

// groundMirror.position.z = -0.4;
const mirrorColor = {
	color: 0x0,
};
groundMirror.position.y = 8.13;
groundMirror.position.z = 8;
gui.addColor(mirrorColor, "color").onChange(() => {
	groundMirror.material.uniforms.mirrorColor.set(mirrorColor.color);
});

gui.add(groundMirror.position, "z", 0, 20, 0.1);
gui.add(groundMirror.position, "y", 0, 20, 0.01);
gui.add(groundMirror.position, "x", 0, 20, 0.1);
// groundMirror.rotateZ = 4;
groundMirror.rotateX(-Math.PI / 2);
scene.add(groundMirror);

const material = new THREE.MeshStandardMaterial({
	metalness: 1,
	roughness: 0.38,
	// map: videoTexture,
	// transparent: true,
	// opacity: 0.1,
	side: THREE.DoubleSide,
});

const color = {
	color: 0xffffff,
};

gui.addFolder("back material");
gui.addColor(color, "color").onChange((value) => {
	material.color.set(value);
});
gui.add(material, "metalness", 0, 1);
gui.add(material, "roughness", 0, 1);

const mirrorPlaneShade = new THREE.BoxBufferGeometry(10, 10, 10);
const mirrorShadeMaterial = new THREE.MeshStandardMaterial({});
// material.side = THREE.FrontSide;

// const material = new THREE.MeshMatcapMaterial();
// const material = new THREE.MeshPhongMaterial();
// material.shininess = 100;
// material.specular = new THREE.Color("red");

// const material = new THREE.MeshToonMaterial();
// const material = new THREE.MeshStandardMaterial({});
// material.envMap = environmentMapTexture;
// gui.add(material, "metalness", 0, 1, 0.01);
// gui.add(material, "roughness", 0, 1, 0.01);
// const sphere = new THREE.Mesh(
// 	new THREE.SphereBufferGeometry(0.5, 16, 16),
// 	material
// );

// sphere.geometry.setAttribute(
// 	"uv2",
// 	new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2)
// );

// plane.geometry.setAttribute(
// 	"uv2",
// 	new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2)
// );

// const torus = new THREE.Mesh(
// 	new THREE.TorusBufferGeometry(0.5, 0.3, 16, 100),
// 	material
// );

// torus.geometry.setAttribute(
// 	"uv2",
// 	new THREE.BufferAttribute(torus.geometry.attributes.uv.array, 2)
// );

// torus.position.x = 2;
// scene.add(sphere, plane, torus);

const box = new THREE.BoxBufferGeometry(1, 1, 1);
const boxMesh = new THREE.Mesh(box, material);
boxMesh.position.set(0, -0.45, -0.7);
boxMesh.scale.set(6.8, 1.7, 1);
scene.add(boxMesh);

const box2Material = new THREE.MeshBasicMaterial({
	map: videoTexture,

	// side: THREE.FrontSide,s
});

const box2 = new THREE.BoxBufferGeometry(1, 1, 1);
const boxMesh2 = new THREE.Mesh(box, box2Material);
boxMesh2.position.set(0, 9, 7);
boxMesh2.scale.set(4, 1.7, 1);
scene.add(boxMesh2);

// LIGHT

const sphere = new THREE.SphereGeometry(0.1, 8, 8);

const pointLight = new THREE.PointLight(0xff0040, 2);
pointLight.add(
	new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0xff0040 }))
);
// pointLight.position.set(2, 0, 4);

scene.add(pointLight);

const light2 = new THREE.PointLight(0x0040ff, 2);
light2.add(
	new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0x0040ff }))
);
scene.add(light2);

const light3 = new THREE.PointLight(0x80ff80, 2);
light3.add(
	new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0x80ff80 }))
);
scene.add(light3);

const light4 = new THREE.PointLight(0xffaa00, 2);
light4.add(
	new THREE.Mesh(sphere, new THREE.MeshBasicMaterial({ color: 0xffaa00 }))
);
scene.add(light4);

// // White directional light at half intensity shining from the top.
// const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);

// directionalLight.position.set(0, 0, -1);
// scene.add(directionalLight);

// SIZES
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

//RESIZE
window.addEventListener("resize", () => {
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;
	renderer.setSize(sizes.width, sizes.height);
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	// controls.handleResize();
});

//FULLSCREEN
window.addEventListener("dblclick", () => {
	const fullscreenElement =
		document.fullscreenElement || document.webkitFullscreenElement;

	if (!fullscreenElement) {
		if (canvas.requestFullscreen) {
			canvas.requestFullscreen();
		} else if (canvas.webkitRequestFullscreen) {
			canvas.webkitRequestFullscreen();
		}
	} else {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		}
	}
});

// CAMERA
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight
);

camera.position.z = 4;
// camera.lookAt(boxMesh.position);
scene.add(camera);

document.addEventListener("mousemove", onDocumentMouseMove);

function onDocumentMouseMove(event) {
	mouseX = (event.clientX - windowHalfX) * 0.005;
	mouseY = (event.clientY - windowHalfY) * 0.005;
}

// CONTROLS
const controls = new OrbitControls(camera, canvas);

controls.enableDamping = true;
// scene.add(controls);
// const controls = new FirstPersonControls(camera, canvas);
// // controls.enableDamping = true;
// // controls.lookSpeed = 0.0125;
// controls.movementSpeed = 1;
// controls.noFly = true;
// // controls.lookVertical = false;
// // controls.constrainVertical = true;
// controls.verticalMax = 0;

// controls.lookAt(new THREE.Vector3(0, 0, 0));

// RENDERER
const renderer = new THREE.WebGLRenderer({
	canvas,
	antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ANIMATIONS

// gsap.to(mesh.rotation, {
// 	duration: 2,
// 	y: Math.PI * 2,
// 	delay: 1,
// 	repeat: -1,
// });

const clock = new THREE.Clock();
//EVENTS
document.addEventListener("keydown", (event) => {
	if (event.key === "Enter") {
		controls.target.set(groundMirror.position.x, 8, groundMirror.position.z);
		gsap.to(camera.rotation, {
			duration: 0.1,
			y: Math.PI,
			// delay: 1,
			// repeat: -1,
			ease: "power3.inOut",
		});
		gsap.to(camera.position, {
			duration: 0.1,
			y: 8.5,
			// delay: 1,
		});
		// camera.lookAt(new THREE.Vector3(10, 10, 10));
	}

	// camera.lookAt(new THREE.Vector3(10, 10, 10));
});

// TICK
const tick = () => {
	const elapesedTime = clock.getElapsedTime();
	// camera.position.x = mouseX;
	// camera.position.y = mouseY;

	// camera.lookAt(new THREE.Vector3(0, 0, 0));
	//update objects
	pointLight.position.x = Math.sin(elapesedTime * 0.3) * 1;
	pointLight.position.y = Math.cos(elapesedTime * 0.7) * 4;
	pointLight.position.z = Math.cos(elapesedTime * 0.5) * 3;

	light2.position.x = Math.sin(elapesedTime * 0.3) * 4;
	light2.position.z = 1;
	// light2.position.y = Math.cos(elapesedTime * 0.7) * 4;
	// light2.position.z = Math.cos(elapesedTime * 0.5) * 10;

	// light3.position.x = Math.cos(elapesedTime * 0.3) * 1;
	light3.position.y = Math.cos(elapesedTime * 0.7) * 2;
	light3.position.z = 2;

	light4.position.x = Math.sin(elapesedTime * 0.3) * 1;
	light4.position.y = Math.cos(elapesedTime * 0.7) * 4;
	light4.position.z = Math.sin(elapesedTime * 0.5) * 3;

	// UPDATE CONTROLS
	const delta = clock.getDelta();
	controls.update();
	// camera.lookAt(new THREE.Vector3(0, 0, 0));

	// RENDER
	renderer.render(scene, camera);
	window.requestAnimationFrame(tick);
};

tick();
