import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import {
  glass_material,
  finish_wood_meshes,
  exterior_metal_meshes,
  get_solar_panel_group,
  set_solar_panel_group,
  set_metal_material,
  containers,
} from "./update_functions.js";
import { customizations } from "./customizations.js";

const draco_loader = new DRACOLoader();
draco_loader.setDecoderPath("draco/");

const gltf_loader = new GLTFLoader();
gltf_loader.setDRACOLoader(draco_loader);

let current_model = null; // Reference to the currently loaded model

export const load_model_with_customizations = (
  model_name,
  options,
  scene,
  camera,
  renderer
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

    // Ensure the scene is properly resized and rendered
    window.dispatchEvent(new Event("resize"));
    renderer.render(scene, camera); // Force render after loading the model
  });
};
