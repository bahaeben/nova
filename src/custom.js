document.addEventListener("DOMContentLoaded", function () {
  const modelName = window.location.pathname.split("/").pop(); // Extract model name from URL

  const defaultOptions = {
    "solo-haven": {
      "siding-color": "Space Black",
      "wood-finish": "Metallic siding finish",
      "side-1": "Full size glass",
      "side-4": "Regular Wall",
      "side-6": "Window glass",
      "solar-panel": "3x Solar panels",
    },
    "duo-oasis": {
      "siding-color": "Space Black",
      "wood-finish": "Metallic siding finish",
      "side-4": "Regular Wall",
      "side-6": "Window glass",
      "side-7": "Window glass",
      "side-12": "Full size glass",
      "solar-panel": "3x Solar panels",
    },
    "skyline-loft": {
      "siding-color": "Space Black",
      "wood-finish": "Metallic siding finish",
      "side-4": "Regular Wall",
      "side-6": "Window glass",
      "side-7": "Window glass",
      "side-12": "Full size glass",
      "solar-panel": "3x Solar panels",
    },
  };

  function updateUrl(options = {}) {
    const urlParams = new URLSearchParams(window.location.search);
    Object.keys(options).forEach((key) => {
      urlParams.set(key, options[key]);
    });

    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    history.replaceState(null, "", newUrl);

    // Update the link text and displayed URL
    document.getElementById("current-link").textContent = `${
      window.location.origin
    }${window.location.pathname}?${urlParams.toString()}`;

    // Reset the copy icon to the initial state
    document.getElementById("copy-icon").style.display = "inline";
    document.getElementById("checkmark-icon").style.display = "none";
  }

  function initializeThreeJsScene() {
    const urlParams = new URLSearchParams(window.location.search);
    const options = {};

    urlParams.forEach((value, key) => {
      options[key] = value;
    });

    const iframe = document.querySelector("#threejs-iframe");

    iframe.contentWindow.postMessage(
      { type: "initializeModel", modelName: modelName, options: options },
      "*"
    );
  }

  function updateThreeJsScene(category, value) {
    const iframe = document.querySelector("#threejs-iframe");
    if (iframe) {
      iframe.contentWindow.postMessage(
        { type: "updateOption", option: { type: category, value: value } },
        "*"
      );
    }
  }

  function setDefaultOptions() {
    const urlParams = new URLSearchParams(window.location.search);
    const modelDefaults = defaultOptions[modelName] || {};
    let updated = false;
    Object.keys(modelDefaults).forEach((key) => {
      if (!urlParams.has(key)) {
        urlParams.set(key, modelDefaults[key]);
        updated = true;
      }
    });
    if (updated) {
      const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
      history.replaceState(null, "", newUrl);
      return true; // URL was updated
    }
    return false; // URL was not updated
  }

  function setSelectedClasses() {
    const urlParams = new URLSearchParams(window.location.search);
    // Update the link text and displayed URL
    document.getElementById("current-link").textContent = `${
      window.location.origin
    }${window.location.pathname}?${urlParams.toString()}`;

    // Reset the copy icon to the initial state
    document.getElementById("copy-icon").style.display = "inline";
    document.getElementById("checkmark-icon").style.display = "none";

    urlParams.forEach((value, key) => {
      const option = document.querySelector(
        `.customization-category[data-category="${key}"] .option[data-value="${value}"]`
      );
      if (option) {
        option.classList.add("selected");
        const dynamicText = option
          .closest(".customization-category")
          .querySelector(".category-value");
        dynamicText.textContent = value;
      }
    });
  }

  // Initialize URL with default options if necessary
  const urlUpdated = setDefaultOptions();

  const options = document.querySelectorAll(".option");
  options.forEach((option) => {
    option.addEventListener("click", function () {
      const category = this.closest(".customization-category").getAttribute(
        "data-category"
      );

      // Deselect all options in the same category
      document
        .querySelectorAll(
          `.customization-category[data-category="${category}"] .option`
        )
        .forEach((opt) => {
          opt.classList.remove("selected");
        });

      // Select the clicked option
      this.classList.add("selected");

      // Update the text beside the label with the selected option value
      const value = this.getAttribute("data-value");
      const dynamicText = this.closest(".customization-category").querySelector(
        ".category-value"
      );
      dynamicText.textContent = value;

      // Update URL with the selected options
      updateUrl({ [category]: value });

      // Update Three.js scene based on the selected option
      updateThreeJsScene(category, value);
    });
  });

  // Listen for the "threejs-ready" message from the iframe
  window.addEventListener("message", function (event) {
    if (event.data.type === "threejs-ready") {
      // Initialize Three.js scene when ready
      initializeThreeJsScene();
      setSelectedClasses();
    }
  });

  // Listen for URL changes and update the Three.js scene
  window.addEventListener("popstate", function (event) {
    initializeThreeJsScene();
    setSelectedClasses(); // Also update selected classes when navigating back/forward
  });

  // Copy button functionality
  var copyButton = document.getElementById("copy-button");
  var copyIcon = document.getElementById("copy-icon");
  var checkmarkIcon = document.getElementById("checkmark-icon");

  copyButton.addEventListener("click", function () {
    var linkText = document.getElementById("current-link").textContent;
    navigator.clipboard
      .writeText(linkText)
      .then(function () {
        // Change the icon from copy to checkmark
        copyIcon.style.display = "none";
        checkmarkIcon.style.display = "inline";
      })
      .catch(function (err) {
        console.error("Failed to copy: ", err);
      });
  });
});
