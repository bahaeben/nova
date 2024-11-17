document.addEventListener("DOMContentLoaded", function () {
  const modelName = window.location.pathname.split("/").pop(); // Extract model name from URL

  //All needed elements
  const iframe = document.querySelector("#threejs-iframe");
  const designerButton = document.getElementById("designer-button");
  const customizationPreview = document.getElementById("customization-preview");
  const checkoutElement = document.getElementById("checkout");
  var copyButton = document.getElementById("copy-button");
  var copyIcon = document.getElementById("copy-icon");
  var checkmarkIcon = document.getElementById("checkmark-icon");

  let isDesignerModeActive = false;
  const designerPanel = document.getElementById("panel");
  const panelCategories = document.querySelectorAll(".designer-panel-category");
  const panelCloseButton = document.querySelector(".panel-close-button");

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

    iframe.contentWindow.postMessage(
      { type: "initializeModel", modelName: modelName, options: options },
      "*"
    );
  }

  function updateThreeJsScene(category, value) {
    iframe.contentWindow.postMessage(
      { type: "updateOption", option: { type: category, value: value } },
      "*"
    );
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
    }
  }

  function updateOptionClasses(category, value) {
    // Select all options in both layouts for the given category
    const options = document.querySelectorAll(
      `.customization-category[data-category="${category}"] .option`
    );

    options.forEach((option) => {
      const isSelected = option.getAttribute("data-value") === value;
      option.classList.toggle("selected", isSelected);

      // Update the dynamic text for the category
      if (isSelected) {
        const dynamicText = option
          .closest(".customization-category")
          .querySelector(".category-value");
        if (dynamicText) {
          dynamicText.textContent = value;
        }
      }
    });
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

    // Synchronize selected classes across layouts
    urlParams.forEach((value, category) => {
      updateOptionClasses(category, value);
    });
  }

  function showElement(element) {
    element.style.display = "flex"; // Make it visible in layout
    element.style.opacity = "0";
    // Add a tiny delay to allow the browser to render the new layout
    setTimeout(() => {
      element.style.opacity = "1"; // Trigger the fade-in effect
    }, 50); // 10ms delay ensures the transition works
  }

  function hideElement(element) {
    element.style.opacity = "1";
    setTimeout(() => {
      element.style.opacity = "0"; // Trigger the fade-in effect
    }, 10); // 10ms delay ensures the transition works
    setTimeout(() => {
      element.style.display = "none"; // Hide after the fade animation
    }, 310); // Match the transition duration (0.3s)
  }

  function hidePanel() {
    hideElement(designerPanel);
    setTimeout(() => {
      panelCategories.forEach((category) => {
        category.style.display = "none";
      });
    }, 300);
  }

  function showPanelForCategory(category) {
    showElement(designerPanel);
    panelCategories.forEach((catDiv) => {
      if (catDiv.getAttribute("data-category") === category) {
        catDiv.style.display = "flex";
      } else {
        catDiv.style.display = "none";
      }
    });
  }

  // Initialize URL with default options if necessary
  setDefaultOptions();

  const options = document.querySelectorAll(".option");
  options.forEach((option) => {
    option.addEventListener("click", function () {
      const category = this.closest(".customization-category").getAttribute(
        "data-category"
      );
      const value = this.getAttribute("data-value");

      // Synchronize options across layouts
      updateOptionClasses(category, value);

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
      setSelectedClasses(); // Synchronize classes for both layouts
    } else if (event.data.type === "pointer-selected") {
      const category = event.data.category;

      // Show the panel and the specific category
      showPanelForCategory(category);
    }
  });

  // Listen for URL changes and update the Three.js scene
  window.addEventListener("popstate", function (event) {
    initializeThreeJsScene();
    setSelectedClasses(); // Also update selected classes when navigating back/forward
  });

  // Copy button functionality
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

  // Handle close button click
  panelCloseButton.addEventListener("click", () => {
    // Hide the panel and all its categories
    hidePanel();

    // Send a "panelClosed" message to Three.js
    iframe.contentWindow.postMessage({ type: "panelClosed" }, "*");
  });

  // Designer Mode Functionalities
  designerButton.addEventListener("click", function () {
    // Toggle Designer Mode state
    isDesignerModeActive = !isDesignerModeActive;

    if (isDesignerModeActive) {
      // Enable fullscreen mode
      customizationPreview.classList.add("is-fullscreen");
      iframe.contentWindow.postMessage({ type: "enterDesignerMode" }, "*");
    } else {
      // Exit fullscreen mode
      customizationPreview.classList.remove("is-fullscreen");
      iframe.contentWindow.postMessage({ type: "exitDesignerMode" }, "*");
      checkoutElement.scrollIntoView({ behavior: "smooth", block: "start" });
      hidePanel();
    }
  });
});
