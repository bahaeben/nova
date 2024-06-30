import * as THREE from "three";

let metal_material = null;
export const finish_wood_meshes = [];
export const exterior_metal_meshes = [];
let solar_panel_group = null;

export const containers = {}; // Export containers
for (let container_num = 1; container_num <= 2; container_num++) {
  containers[`container_${container_num}`] = {};
  for (let wall_num = 1; wall_num <= 6; wall_num++) {
    containers[`container_${container_num}`][`wall_${wall_num}`] = {
      none: null,
      door: null,
      window: null,
      balcony: null,
    };
  }
}

export const glass_material = new THREE.MeshStandardMaterial({
  color: 0x9e947f, // Light blue tint
  metalness: 0.1,
  roughness: 0.1,
  opacity: 0.5, // Adjust opacity to make it transparent
  transparent: true,
});

// Getter and Setter for metal_material
export const get_metal_material = () => metal_material;
export const set_metal_material = (material) => {
  metal_material = material;
};

// Getter and Setter for solar_panel_group
export const get_solar_panel_group = () => solar_panel_group;
export const set_solar_panel_group = (group) => {
  solar_panel_group = group;
};

export const update_siding_color = (color) => {
  let color_value;
  switch (color) {
    case "Space Black":
      color_value = "#2F2F2F";
      break;
    case "Off White":
      color_value = "#F5F1E9";
      break;
    case "Slate Grey":
      color_value = "#7798A5";
      break;
    case "Soft Beige":
      color_value = "#E5DBC7";
      break;
    default:
      console.warn(`Unhandled siding color: ${color}`);
      return;
  }

  const material = get_metal_material();
  if (material) {
    material.color.set(color_value);
  } else {
    console.warn('Material "metal" not found');
  }
};

export const update_wall = (container_num, wall_num, option) => {
  const wall = containers[`container_${container_num}`][`wall_${wall_num}`];
  if (!wall) {
    console.warn(`Wall ${wall_num} in container ${container_num} not found`);
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
};

export const update_wood_finish = (option) => {
  if (option === "Yes") {
    finish_wood_meshes.forEach((mesh) => (mesh.visible = true));
    exterior_metal_meshes.forEach((mesh) => (mesh.visible = false));
  } else if (option === "None") {
    finish_wood_meshes.forEach((mesh) => (mesh.visible = false));
    exterior_metal_meshes.forEach((mesh) => (mesh.visible = true));
  }
};

export const update_solar_panel = (option) => {
  const group = get_solar_panel_group();
  if (group) {
    group.visible = option === "Yes";
  }
};
