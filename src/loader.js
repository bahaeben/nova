import { gsap } from "gsap"; // Import GSAP
import * as THREE from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import {
  glass_material,
  shadow_material,
  finish_wood_meshes,
  exterior_metal_meshes,
  set_solar_panel_group,
  set_metal_material,
  containers,
} from "./update_functions.js";
import { customizations } from "./customizations.js";

// Get the drag clue element
const dragClue = document.getElementById("drag-clue");

// Function to fade in the clue when the model finishes loading
const showDragClue = () => {
  dragClue.style.opacity = "1"; // Fade in
};

// Function to fade out the clue when the user drags the model
const hideDragClue = () => {
  dragClue.style.opacity = "0"; // Fade out
};

/**
 * Initialize loading manager and loading state
 */

// Create the loading manager
const loading_manager = new THREE.LoadingManager();

// Show the loading bar when loading starts
loading_manager.onStart = () => {
  const loading_bar_container = document.getElementById(
    "loading-bar-container"
  );
  loading_bar_container.style.display = "block"; // Make sure it's visible
  loading_bar_container.style.opacity = "1"; // Reset the opacity
  document.getElementById("loading-bar").style.width = "0"; // Reset the bar's width
};

// Update the loading bar's progress
loading_manager.onProgress = (url, items_loaded, items_total) => {
  const progress = (items_loaded / items_total) * 100;
  document.getElementById("loading-bar").style.width = progress + "%";
};

// Hide the loading bar once loading is complete
loading_manager.onLoad = () => {
  const loading_bar_container = document.getElementById(
    "loading-bar-container"
  );
  gsap.to(loading_bar_container, {
    opacity: 0,
    duration: 0.5,
    onComplete: () => {
      loading_bar_container.style.display = "none";
    },
  });
  showDragClue(); // Call the function directly when everything is loaded
};

/**
 * Responsible of initializing 3JS necessary elements
 */

// Initialize DracoLoader and GLTFLoader with LoadingManager
const draco_loader = new DRACOLoader(loading_manager);
draco_loader.setDecoderPath("draco/");

const gltf_loader = new GLTFLoader(loading_manager);
gltf_loader.setDRACOLoader(draco_loader);

let current_model = null; // Reference to the currently loaded model

export const load_model_with_customizations = (
  model_name,
  options,
  scene,
  camera,
  renderer,
  controls
) => {
  // Remove the current model from the scene if it exists
  if (current_model) {
    scene.remove(current_model);
    current_model = null;
    finish_wood_meshes.length = 0;
    exterior_metal_meshes.length = 0;
  }

  gltf_loader.load(`models/${model_name}.glb`, (gltf) => {
    let found_metal = false;
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        if (child.material && child.material.name.includes("shadow")) {
          child.material = shadow_material;
        }
        if (child.material && child.material.name.includes("glass")) {
          child.material = glass_material;
        }
        if (!found_metal && child.name.includes("metal")) {
          set_metal_material(child.material);
          found_metal = true;
        }
        if (child.name.includes("finish_wood")) {
          finish_wood_meshes.push(child);
        } else if (child.name.includes("exterior_metal")) {
          exterior_metal_meshes.push(child);
        }
      }
      if (child.type === "Object3D") {
        if (child.name.includes("solar_panel")) {
          set_solar_panel_group(child);
        }
        const match = child.name.match(
          /container_(\d+)_wall_(\d+)_(none|window|balcony|door)/
        );
        if (match) {
          const container_num = match[1];
          const wall_num = match[2];
          const type = match[3];
          if (
            containers[`container_${container_num}`] &&
            containers[`container_${container_num}`][`wall_${wall_num}`]
          ) {
            containers[`container_${container_num}`][`wall_${wall_num}`][type] =
              child;
          }
        }
      }
    });

    // Apply the received options
    Object.keys(options).forEach((option_key) => {
      const option_value = options[option_key];
      if (customizations[model_name]) {
        customizations[model_name].update_function({
          type: option_key,
          value: option_value,
        });
      }
    });

    scene.add(gltf.scene);
    current_model = gltf.scene; // Set the current model

    // Animate the camera from the front view to the regular position
    const initial_position = { x: 0, y: 1, z: 12.8 };
    const final_position = { x: 9, y: 3, z: 9 };

    camera.position.set(
      initial_position.x,
      initial_position.y,
      initial_position.z
    );

    gsap.to(camera.position, {
      x: final_position.x,
      y: final_position.y,
      z: final_position.z,
      duration: 2, // 2000ms = 2 seconds
      ease: "power2.out", // Equivalent to TWEEN.Easing.Quadratic.Out
      onUpdate: () => {
        controls.update(); // Ensure the camera controls are updated during the animation
      },
    });

    // Ensure the scene is properly resized and rendered
    window.dispatchEvent(new Event("resize"));
    renderer.render(scene, camera); // Force render after loading the model
  });
};

// Detect user drag interaction with the preview window
const previewWindow = document.querySelector("#canvas"); // Replace with your actual preview window selector

previewWindow.addEventListener("mousedown", () => {
  hideDragClue(); // Hide the clue once the user starts dragging
});
previewWindow.addEventListener("touchstart", () => {
  hideDragClue(); // Hide the clue once the user starts dragging
});
