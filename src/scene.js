import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

import { gsap } from "gsap"; // Import GSAP

export const init_scene = () => {
  const canvas = document.querySelector("canvas.webgl");
  const scene = new THREE.Scene();
  scene.background = null;

  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  const frustum_size = 13;

  // Orthographic Camera
  const camera = new THREE.OrthographicCamera(
    -frustum_size / 2,
    frustum_size / 2,
    frustum_size / 2,
    -frustum_size / 2,
    0.1,
    100
  );
  camera.position.set(9, 3, 9);
  scene.add(camera);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.minPolarAngle = Math.PI / 6;
  controls.maxPolarAngle = Math.PI / 2;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.target.set(0, 1, 0);
  controls.update();

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const resizeCamera = () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    const aspect = sizes.width / sizes.height;

    if (sizes.width < sizes.height) {
      camera.left = -frustum_size / 2;
      camera.right = frustum_size / 2;
      camera.top = frustum_size / aspect / 2;
      camera.bottom = -(frustum_size / aspect) / 2;
    } else {
      camera.left = -(frustum_size * aspect) / 2;
      camera.right = (frustum_size * aspect) / 2;
      camera.top = frustum_size / 2;
      camera.bottom = -frustum_size / 2;
    }

    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.render(scene, camera); // Force render after resize
  };

  window.addEventListener("resize", resizeCamera);

  const rgbe_loader = new RGBELoader();
  rgbe_loader.load("symmetrical_garden_02_1k.hdr", (environment_map) => {
    environment_map.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = environment_map;
    scene.environmentIntensity = 2;
  });

  const directional_light = new THREE.DirectionalLight(0xffffff, 1.5);
  directional_light.position.set(-5, 0, 10);
  scene.add(directional_light);

  // setupDebugRaycaster(scene, camera, renderer);

  return { camera, controls, renderer, scene };
};

const raycaster = new THREE.Raycaster();

export const animate = (camera, controls, renderer, scene, update_pointers) => {
  const clock = new THREE.Clock();

  const tick = () => {
    controls.update(); // Update camera controls
    renderer.render(scene, camera); // Render the scene

    update_pointers(camera, renderer, raycaster);
    window.requestAnimationFrame(tick); // Continue the animation loop
  };

  tick(); // Start the animation loop

  // setupDebugRaycaster(scene, camera, renderer);
};

//debug stuff
function setupDebugRaycaster(scene, camera, renderer) {
  // Create a Raycaster and a Vector2 for the mouse position
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // Add an event listener for mouse clicks
  renderer.domElement.addEventListener("click", (event) => {
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Get the list of intersected objects
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const firstHit = intersects[0];
      const { point, object } = firstHit;

      console.log(`Hit coordinates: x=${point.x}, y=${point.y}, z=${point.z}`);
    }
  });
}
