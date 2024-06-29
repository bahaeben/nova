import GUI from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

/**
 * Customization Handling
 */

// Set default model and options
const defaultModelName = "tiny_home";
const defaultOptions = {
  "siding-color": "Space Black",
  "wood-finish": "None",
};

// Define customizations for each model
const customizations = {
  tiny_home: {
    options: defaultOptions,
    updateFunction: function (option) {
      // Function to handle option changes for model 1
      if (option.type === "siding-color") {
        this.options["siding-color"] = option.value;
        this.updateSidingColor(option.value);
      } else if (option.type === "wood-finish") {
        this.options["wood-finish"] = option.value;
        this.updateWoodFinish(option.value);
      }
    },
    updateSidingColor: function (option) {
      // Function to handle option changes for model 1
    },
    updateWoodFinish: function (option) {
      // Function to handle option changes for model 1
    },
  },
};

// Apply the default customization
const selectedCustomization = customizations[defaultModelName];

/**
 * Base
 */

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
const color = "#F5F1E9"; // Replace with your desired color
scene.background = new THREE.Color(color);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const aspect = sizes.width / sizes.height;
const frustumSize = 20; // Adjust this value to control the zoom level of the orthographic camera

// Camera
const camera = new THREE.OrthographicCamera(
  (frustumSize * aspect) / -2,
  (frustumSize * aspect) / 2, // Left and Right
  frustumSize / 2,
  frustumSize / -2, // Top and Bottom
  0.1,
  100 // Near and Far clipping planes
);
camera.position.x = 9;
camera.position.y = 3;
camera.position.z = 9;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Set vertical rotation limits
controls.minPolarAngle = Math.PI / 4; // 45 degrees from the top
controls.maxPolarAngle = Math.PI / 2; // 90 degrees from the top, adjust as needed

// Update controls
controls.update();

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  const aspect = sizes.width / sizes.height;

  // Update camera
  camera.left = (-frustumSize * aspect) / 2;
  camera.right = (frustumSize * aspect) / 2;
  camera.top = frustumSize / 2;
  camera.bottom = -frustumSize / 2;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Materials
 */

// Define a glass material
const glassMaterial = new THREE.MeshStandardMaterial({
  color: 0x9e947f, // Light blue tint
  metalness: 0.1,
  roughness: 0.1,
  opacity: 0.5, // Adjust opacity to make it transparent
  transparent: true,
});

/**
 * Objects
 */

// Draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("draco/");

// GLTF loader
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

gltfLoader.load(`${defaultModelName}.glb`, (gltf) => {
  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      // Check if the mesh name or material name contains 'glass'
      if (child.material && child.material.name.includes("glass")) {
        child.material = glassMaterial;
      }
    }
  });
  scene.add(gltf.scene);
});

/**
 * Lights
 */

// Load the HDRI map
const rgbeLoader = new RGBELoader();

// HDR (RGBE) equirectangular
rgbeLoader.load("symmetrical_garden_02_1k.hdr", (environmentMap) => {
  environmentMap.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = environmentMap;
  // scene.environmentIntensity = 1;
});

// Add a directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Color and intensity
directionalLight.position.set(5, 5, 5); // Position the light
scene.add(directionalLight);

// Add a key light
const keyLight = new THREE.DirectionalLight(0xffffff, 0.5); // Color and intensity
keyLight.position.set(10, 5, 2); // Position the light
scene.add(keyLight);

// Add a fill light
const fillLight = new THREE.DirectionalLight(0xffffff, 0.5); // Color and intensity
fillLight.position.set(-10, 5, -3); // Position the light
scene.add(fillLight);

// // Add a back light
// const backLight = new THREE.DirectionalLight(0xffffff, 0.5); // Color and intensity
// backLight.position.set(0, 10, -5); // Position the light
// scene.add(backLight);

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
