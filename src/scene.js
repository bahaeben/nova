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

  // Perspective Camera
  //   const camera = new THREE.PerspectiveCamera(
  //     60, // Field of view
  //     sizes.width / sizes.height, // Aspect ratio
  //     0.1, // Near clipping plane
  //     1000 // Far clipping plane
  //   );
  //   camera.position.set(9, 3, 9);
  //   scene.add(camera);

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
  directional_light.position.set(-5, 5, 10);
  scene.add(directional_light);

  const key_light = new THREE.DirectionalLight(0xffffff, 0.5);
  key_light.position.set(10, 5, 2);
  scene.add(key_light);

  const fill_light = new THREE.DirectionalLight(0xffffff, 0.5);
  fill_light.position.set(0, 5, -10);
  scene.add(fill_light);

  return { camera, controls, renderer, scene };
};

export const animate = (camera, controls, renderer, scene) => {
  const clock = new THREE.Clock();

  const tick = () => {
    controls.update(); // Update camera controls
    renderer.render(scene, camera); // Render the scene
    window.requestAnimationFrame(tick); // Continue the animation loop
  };

  tick(); // Start the animation loop
};
