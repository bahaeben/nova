import { load_model_with_customizations } from "./loader.js";
import {
  update_siding_color,
  update_wood_finish,
  update_wall,
  update_solar_panel,
} from "./update_functions.js";
import * as THREE from "three";

import { gsap } from "gsap"; // Import GSAP

/**
 * This script takes care of catching events of initializing models or updating options
 * Handle messages and apply neccessary changes and catches unexpected outcomes
 */

// Define customizations for each model
export const customizations = {
  "solo-haven": {
    options: {},
    camera_positions: {
      "side-1": {
        position: new THREE.Vector3(9, 3, 9),
      },
      "side-4": {
        position: new THREE.Vector3(0, 3, -12.3),
      },
      "side-6": {
        position: new THREE.Vector3(12.3, 3, 0),
      },
      "solar-panel": {
        position: new THREE.Vector3(0, 8, 10),
      },
    },
    update_function: (option) => {
      switch (option.type) {
        case "siding-color":
          customizations["solo-haven"].options["siding-color"] = option.value;
          update_siding_color(option.value);
          break;
        case "wood-finish":
          customizations["solo-haven"].options["wood-finish"] = option.value;
          update_wood_finish(option.value);
          break;
        case "side-1":
          customizations["solo-haven"].options["side-1"] = option.value;
          update_wall(1, 1, option.value);
          break;
        case "side-4":
          customizations["solo-haven"].options["side-4"] = option.value;
          update_wall(1, 4, option.value);
          break;
        case "side-6":
          customizations["solo-haven"].options["side-6"] = option.value;
          update_wall(1, 6, option.value);
          break;
        case "solar-panel":
          customizations["solo-haven"].options["solar-panel"] = option.value;
          update_solar_panel(option.value);
          break;
        default:
          console.warn(`Unhandled option type: ${option.type}`);
      }
    },
  },
  "duo-oasis": {
    options: {},
    camera_positions: {
      "side-4": {
        position: new THREE.Vector3(0, 3, -12.3),
      },
      "side-6": {
        position: new THREE.Vector3(12.3, 3, 0),
      },
      "side-7": {
        position: new THREE.Vector3(9, 3, 9),
      },
      "side-12": {
        position: new THREE.Vector3(12.3, 3, 0),
      },
      "solar-panel": {
        position: new THREE.Vector3(0, 8, -10),
      },
    },
    update_function: (option) => {
      switch (option.type) {
        case "siding-color":
          customizations["solo-haven"].options["siding-color"] = option.value;
          update_siding_color(option.value);
          break;
        case "wood-finish":
          customizations["solo-haven"].options["wood-finish"] = option.value;
          update_wood_finish(option.value);
          break;
        case "side-4":
          customizations["solo-haven"].options["side-4"] = option.value;
          update_wall(1, 4, option.value);
          break;
        case "side-6":
          customizations["solo-haven"].options["side-6"] = option.value;
          update_wall(1, 6, option.value);
          break;
        case "side-7":
          customizations["solo-haven"].options["side-1"] = option.value;
          update_wall(2, 1, option.value);
          break;
        case "side-12":
          customizations["solo-haven"].options["side-6"] = option.value;
          update_wall(2, 6, option.value);
          break;
        case "solar-panel":
          customizations["solo-haven"].options["solar-panel"] = option.value;
          update_solar_panel(option.value);
          break;
        default:
          console.warn(`Unhandled option type: ${option.type}`);
      }
    },
  },
  "skyline-loft": {
    options: {},
    camera_positions: {
      "side-4": {
        position: new THREE.Vector3(0, 3, -12.3),
      },
      "side-6": {
        position: new THREE.Vector3(12.3, 3, 0),
      },
      "side-7": {
        position: new THREE.Vector3(-12.3, 3, 0),
      },
      "side-12": {
        position: new THREE.Vector3(0, 3, 12.3),
      },
      "solar-panel": {
        position: new THREE.Vector3(0, 8, 10),
      },
    },
    update_function: (option) => {
      switch (option.type) {
        case "siding-color":
          customizations["solo-haven"].options["siding-color"] = option.value;
          update_siding_color(option.value);
          break;
        case "wood-finish":
          customizations["solo-haven"].options["wood-finish"] = option.value;
          update_wood_finish(option.value);
          break;
        case "side-4":
          customizations["solo-haven"].options["side-4"] = option.value;
          update_wall(1, 4, option.value);
          break;
        case "side-6":
          customizations["solo-haven"].options["side-6"] = option.value;
          update_wall(1, 6, option.value);
          break;
        case "side-7":
          customizations["solo-haven"].options["side-1"] = option.value;
          update_wall(2, 1, option.value);
          break;
        case "side-12":
          customizations["solo-haven"].options["side-6"] = option.value;
          update_wall(2, 6, option.value);
          break;
        case "solar-panel":
          customizations["solo-haven"].options["solar-panel"] = option.value;
          update_solar_panel(option.value);
          break;
        default:
          console.warn(`Unhandled option type: ${option.type}`);
      }
    },
  },
  "another-model": {
    options: {},
    update_function: (option) => {
      // Add option handling logic for another_model
    },
  },
};

// Placeholder for selected customization
let selected_customization = null;

const update_camera_rotation = (option, camera, controls) => {
  return new Promise((resolve) => {
    const camera_position =
      selected_customization.camera_positions[option.type];
    if (camera_position) {
      const distance = camera.position.distanceTo(camera_position.position);
      if (distance > 1) {
        // Use GSAP to animate the camera position
        gsap.to(camera.position, {
          x: camera_position.position.x,
          y: camera_position.position.y,
          z: camera_position.position.z,
          duration: 1, // 1000ms or 1 second
          ease: "power1.inOut", // Equivalent to Quadratic.InOut easing
          onUpdate: () => {
            controls.update();
          },
          onComplete: resolve, // Resolve the promise after rotation is complete
        });
      } else {
        resolve(); // If within 1 meter, resolve the promise immediately
      }
    } else {
      resolve(); // If no camera position, resolve the promise immediately
    }
  });
};

export const handle_messages = (scene, camera, controls, renderer) => {
  // Flag to control sending the ready message
  let keep_sending_ready_message = true;

  // Function to continuously send the "threejs-ready" message until initialization happens
  const send_ready_message = () => {
    if (keep_sending_ready_message) {
      window.parent.postMessage({ type: "threejs-ready" }, "*");
      setTimeout(send_ready_message, 500); // Retry every 500ms
    }
  };

  // Start sending the "threejs-ready" message when the page loads
  window.addEventListener("DOMContentLoaded", (event) => {
    send_ready_message();
  });

  window.addEventListener("message", (event) => {
    if (event.data.type === "updateOption") {
      const option = event.data.option;
      if (selected_customization) {
        update_camera_rotation(option, camera, controls).then(() => {
          selected_customization.update_function(option);
          renderer.render(scene, camera); // Force render after updating
        });
      }
    } else if (event.data.type === "initializeModel") {
      const model_name = event.data.modelName;
      const model_options = event.data.options;

      // Set the selected customization
      selected_customization = customizations[model_name];

      // Load the model with the received options
      load_model_with_customizations(
        model_name,
        model_options,
        scene,
        camera,
        renderer,
        controls
      );

      // Stop sending the "threejs-ready" message
      keep_sending_ready_message = false;
    }
  });
};
