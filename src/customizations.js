import { load_model_with_customizations } from "./loader.js";
import {
  update_siding_color,
  update_wood_finish,
  update_wall,
  update_solar_panel,
} from "./update_functions.js";

// Define customizations for each model
export const customizations = {
  "tiny-home": {
    options: {},
    update_function: (option) => {
      switch (option.type) {
        case "siding-color":
          customizations["tiny-home"].options["siding-color"] = option.value;
          update_siding_color(option.value);
          break;
        case "wood-finish":
          customizations["tiny-home"].options["wood-finish"] = option.value;
          update_wood_finish(option.value);
          break;
        case "side-1":
          customizations["tiny-home"].options["side-1"] = option.value;
          update_wall(1, 1, option.value);
          break;
        case "side-4":
          customizations["tiny-home"].options["side-4"] = option.value;
          update_wall(1, 4, option.value);
          break;
        case "side-6":
          customizations["tiny-home"].options["side-6"] = option.value;
          update_wall(1, 6, option.value);
          break;
        case "solar-panel":
          customizations["tiny-home"].options["solar-panel"] = option.value;
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

export const handle_messages = (scene) => {
  window.addEventListener("message", (event) => {
    if (event.data.type === "updateOption") {
      const option = event.data.option;
      selected_customization.update_function(option);
    } else if (event.data.type === "initializeModel") {
      const model_name = event.data.modelName;
      const model_options = event.data.options;

      // Set the selected customization
      selected_customization = customizations[model_name];

      // Load the model with the received options
      load_model_with_customizations(model_name, model_options, scene);
    }
  });
};
