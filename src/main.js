import { init_scene, animate } from "./scene.js";
import { handle_messages } from "./customizations.js";

// Initialize the scene
const { camera, controls, renderer, scene } = init_scene();

// Start the animation loop
animate(camera, controls, renderer, scene);

// Set up message handling from Webflow
handle_messages(scene, camera, controls, renderer);
