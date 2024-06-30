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

// Define default options for each model
const defaultOptions = {
  tiny_home: {
    "siding-color": "Space Black",
    "wood-finish": "None",
    "side-1": "Balcony",
    "side-4": "Window",
    "side-6": "Window",
    "solar-panel": "Yes",
  },
  another_model: {
    "example-option": "default",
    // Add other default options specific to this model
  },
  // Add other models and their default options here
};

// Define customizations for each model
const customizations = {
  tiny_home: {
    options: defaultOptions["tiny_home"],
    updateFunction: function (option) {
      switch (option.type) {
        case "siding-color":
          this.options["siding-color"] = option.value;
          updateSidingColor(option.value);
          break;
        case "wood-finish":
          this.options["wood-finish"] = option.value;
          updateWoodFinish(option.value);
          break;
        // Add other cases for different option types
        case "side-1":
          this.options["side-1"] = option.value;
          updateWall(1, 1, option.value); // Call the updateWall function for container 1, wall 1
          break;
        case "side-4":
          this.options["side-4"] = option.value;
          updateWall(1, 4, option.value); // Call the updateWall function for container 1, wall 2
          break;
        case "side-6":
          this.options["side-6"] = option.value;
          updateWall(1, 6, option.value); // Call the updateWall function for container 1, wall 4
          break;
        case "solar-panel":
          this.options["solar-panel"] = option.value;
          updateSolarPanel(option.value);
          break;
        default:
          console.warn(`Unhandled option type: ${option.type}`);
      }
    },
  },
  another_model: {
    options: defaultOptions["another_model"],
    updateFunction: function (option) {
      // Add option handling logic for another_model
    },
    // Add update functions and handlers here
  },
  // Add other models and their customizations here
};

// Apply the default customization based on the model name
const selectedCustomization = customizations[defaultModelName];

/**
 * Base
 */

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
// const color = "#F5F1E9"; // Replace with your desired color
// scene.background = new THREE.Color(color);
scene.background = null; // Make the background transparent

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const aspect = sizes.width / sizes.height;
const frustumSize = 12; // Adjust this value to control the zoom level of the orthographic camera

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
controls.minPolarAngle = Math.PI / 4; // 45 degrees from the top
controls.maxPolarAngle = Math.PI / 2; // 90 degrees from the top, adjust as needed
controls.enableZoom = false; // Disable zooming
// Set the initial target 1 meter above the origin
controls.target.set(0, 1, 0); // Lift target by 1 meter

// Update controls
controls.update();

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true, // Enable transparency
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
let metalMaterial = null;

// Define a glass material
const glassMaterial = new THREE.MeshStandardMaterial({
  color: 0x9e947f, // Light blue tint
  metalness: 0.1,
  roughness: 0.1,
  opacity: 0.5, // Adjust opacity to make it transparent
  transparent: true,
});

/**
 * Mesh Groups
 */
const containers = {};
// Initialize containers and walls
for (let containerNum = 1; containerNum <= 2; containerNum++) {
  containers[`container_${containerNum}`] = {};
  for (let wallNum = 1; wallNum <= 6; wallNum++) {
    containers[`container_${containerNum}`][`wall_${wallNum}`] = {
      none: null,
      door: null,
      window: null,
      balcony: null,
    };
  }
}

const finishWoodMeshes = [];
const exteriorMetalMeshes = [];
let solarPanelGroup = null;

/**
 * Update Functions
 */

function updateSidingColor(color) {
  let colorValue;
  switch (color) {
    case "Space Black":
      colorValue = "#2F2F2F";
      break;
    case "Off White":
      colorValue = "#F5F1E9";
      break;
    case "Slate Grey":
      colorValue = "#7798A5";
      break;
    case "Soft Beige":
      colorValue = "#E5DBC7";
      break;
    default:
      console.warn(`Unhandled siding color: ${color}`);
      return;
  }

  // Find the material named "metal" and update its color
  if (metalMaterial) {
    metalMaterial.color.set(colorValue);
  } else {
    console.warn('Material "metal" not found');
  }
}
function updateWall(containerNum, wallNum, option) {
  const wall = containers[`container_${containerNum}`][`wall_${wallNum}`];
  if (!wall) {
    console.warn(`Wall ${wallNum} in container ${containerNum} not found`);
    return;
  }

  switch (option) {
    case "None":
      if (wall.none) wall.none.visible = true;
      if (wall.window) wall.window.visible = false;
      if (wall.door) wall.door.visible = false;
      if (wall.balcony) wall.balcony.visible = false;
      break;
    case "Window":
      if (wall.none) wall.none.visible = false;
      if (wall.window) wall.window.visible = true;
      if (wall.door) wall.door.visible = false;
      if (wall.balcony) wall.balcony.visible = false;
      break;
    case "Door":
      if (wall.none) wall.none.visible = false;
      if (wall.window) wall.window.visible = false;
      if (wall.door) wall.door.visible = true;
      if (wall.balcony) wall.balcony.visible = false;
      break;
    case "Balcony":
      if (wall.none) wall.none.visible = false;
      if (wall.window) wall.window.visible = false;
      if (wall.door) wall.door.visible = false;
      if (wall.balcony) wall.balcony.visible = true;
      break;
    default:
      console.warn(`Unhandled wall option: ${option}`);
  }
}
function updateWoodFinish(option) {
  if (option === "Yes") {
    finishWoodMeshes.forEach((mesh) => (mesh.visible = true));
    exteriorMetalMeshes.forEach((mesh) => (mesh.visible = false));
  } else if (option === "None") {
    finishWoodMeshes.forEach((mesh) => (mesh.visible = false));
    exteriorMetalMeshes.forEach((mesh) => (mesh.visible = true));
  }
}
function updateSolarPanel(option) {
  if (solarPanelGroup) {
    solarPanelGroup.visible = option === "Yes";
  }
}
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
  let found_metal = false;
  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      // Check if the mesh name or material name contains 'glass'
      if (child.material && child.material.name.includes("glass")) {
        child.material = glassMaterial;
      }
      if (!found_metal && child.name.includes("metal")) {
        metalMaterial = child.material; // Store the reference to the metal material
        found_metal = true;
      }
      if (child.name.includes("finish_wood")) {
        finishWoodMeshes.push(child);
      } else if (child.name.includes("exterior_metal")) {
        exteriorMetalMeshes.push(child);
      }
    }
    if (child.type === "Object3D") {
      if (child.name.includes("solar_panel")) {
        solarPanelGroup = child;
      }
      const match = child.name.match(
        /container_(\d+)_wall_(\d+)_(none|window|balcony|door)/
      );
      if (match) {
        if (match) {
          const containerNum = match[1];
          const wallNum = match[2];
          const type = match[3];
          if (
            containers[`container_${containerNum}`] &&
            containers[`container_${containerNum}`][`wall_${wallNum}`]
          ) {
            containers[`container_${containerNum}`][`wall_${wallNum}`][type] =
              child;
          }
        }
      }
    }
  });

  const modelDefaults = defaultOptions[defaultModelName];
  if (modelDefaults) {
    Object.keys(modelDefaults).forEach((optionKey) => {
      const optionValue = modelDefaults[optionKey];
      customizations[defaultModelName].updateFunction({
        type: optionKey,
        value: optionValue,
      });
    });
  }

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
  scene.environmentIntensity = 0.5;
});

// // Create a box geometry with dimensions 1, 1, 1
// const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
// const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color
// const referenceCube = new THREE.Mesh(boxGeometry, boxMaterial);
// referenceCube.position.set(0, 5, -10);
// scene.add(referenceCube);

// Add a directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 8); // Color and intensity
directionalLight.position.set(-5, 5, 10); // Position the light
scene.add(directionalLight);

// Add a key light
const keyLight = new THREE.DirectionalLight(0xffffff, 4); // Color and intensity
keyLight.position.set(10, 5, 2); // Position the light
scene.add(keyLight);

// Add a fill light
const fillLight = new THREE.DirectionalLight(0xffffff, 4); // Color and intensity
fillLight.position.set(0, 5, -10); // Position the light
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

// Handle POST requests from Webflow
window.addEventListener("message", (event) => {
  if (event.data.type === "updateOption") {
    const option = event.data.option;
    selectedCustomization.updateFunction(option);
  }
});
