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
    pointer_positions: {
      "siding-color": new THREE.Vector3(-2.8, 2.3, 0.5),
      "wood-finish": new THREE.Vector3(-2.8, 1.2, 0.5),
      "side-1": new THREE.Vector3(1.48, 1.2, 0.5),
      "side-4": new THREE.Vector3(-1.48, 1.2, -2.9),
      "side-6": new THREE.Vector3(3.5, 1.2, -1),
      "solar-panel": new THREE.Vector3(0.1, 3.4, -0.9),
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
};

// Placeholder for selected customization
let selected_customization = null;
let isDesignerModeActive = false;
let intersectableObjects = [];

export const add_intersectable_object = (object) => {
  intersectableObjects.push(object);
};

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

const add_pointers = (camera, renderer) => {
  const pointerPositions = selected_customization.pointer_positions;
  const container = document.body; // Or a specific container for pointers

  Object.keys(pointerPositions).forEach((category) => {
    const position3D = pointerPositions[category];

    // Create the pointer div
    const pointerDiv = document.createElement("div");
    pointerDiv.className = "point";
    pointerDiv.setAttribute("data-category", category); // Assign category

    const pointerInnerDiv = document.createElement("div");
    pointerInnerDiv.className = "pointer";

    pointerDiv.appendChild(pointerInnerDiv);
    container.appendChild(pointerDiv);

    // Add click event listener
    pointerDiv.addEventListener("click", () => {
      set_active_pointer(pointerDiv);
    });

    // Convert 3D coordinates to 2D screen coordinates
    const screenPosition = position3D.clone();
    screenPosition.project(camera);

    const x = (screenPosition.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
    const y =
      (1 - (screenPosition.y * 0.5 + 0.5)) * renderer.domElement.clientHeight;

    const pointerSize = 40; // Adjust based on your .point size
    pointerDiv.style.transform = `translate(${x - pointerSize / 2}px, ${
      y - pointerSize / 2
    }px)`;
  });
};

const delete_pointers = () => {
  const pointers = document.querySelectorAll(".point");

  // Remove each pointer from the DOM
  pointers.forEach((pointer) => {
    pointer.remove();
  });
};

export const update_pointers = (camera, renderer, raycaster) => {
  if (!isDesignerModeActive) return;

  const pointerPositions = selected_customization.pointer_positions;

  document.querySelectorAll(".point").forEach((pointerDiv, index) => {
    const key = Object.keys(pointerPositions)[index];
    const position3D = pointerPositions[key];

    // Project the 3D position to screen space
    const screenPosition = position3D.clone();
    screenPosition.project(camera);

    const x = (screenPosition.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
    const y =
      (1 - (screenPosition.y * 0.5 + 0.5)) * renderer.domElement.clientHeight;

    const pointerSize = 40; // Adjust based on your .point size
    pointerDiv.style.transform = `translate(${x - pointerSize / 2}px, ${
      y - pointerSize / 2
    }px)`;

    // Perform raycasting to check if the pointer is visible
    raycaster.setFromCamera(
      new THREE.Vector2(screenPosition.x, screenPosition.y),
      camera
    );
    const intersects = raycaster.intersectObjects(intersectableObjects, true);

    if (intersects.length === 0) {
      // If no intersections, assume pointer is visible
      pointerDiv.classList.remove("hidden");
    } else {
      const distanceToIntersection = intersects[0].distance;
      const distanceToPointer = camera.position.distanceTo(position3D);

      if (distanceToPointer < distanceToIntersection) {
        pointerDiv.classList.remove("hidden");
      } else {
        pointerDiv.classList.add("hidden");
      }
    }
  });
};

const set_active_pointer = (activePointer) => {
  // Remove the 'active' class from all pointers
  document.querySelectorAll(".point").forEach((pointer) => {
    pointer.classList.remove("active");
  });

  // Add the 'active' class to the clicked pointer
  activePointer.classList.add("active");

  // Get the category from the data attribute
  const category = activePointer.getAttribute("data-category");

  // Post a message to the parent window
  window.parent.postMessage(
    { type: "pointer-selected", category: category },
    "*"
  );
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
    } else if (event.data.type === "enterDesignerMode") {
      isDesignerModeActive = true;
      // Add pointers when Designer Mode is activated
      add_pointers(camera, renderer);
    } else if (event.data.type === "exitDesignerMode") {
      isDesignerModeActive = false;
      // Remove pointers or cleanup as needed
      delete_pointers();
    } else if (event.data.type === "panelClosed") {
      document.querySelectorAll(".point").forEach((pointer) => {
        pointer.classList.remove("active");
      });
    }
  });
};
