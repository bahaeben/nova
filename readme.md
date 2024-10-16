# NOVA

## Project Overview

NOVA is a project designed to store and display 3D models through a GitHub Pages website. The models are integrated into an iframe from another Webflow project and controlled via messages using JavaScript. The purpose of this repository is to manage and render 3D views for various home models, providing dynamic interaction through custom messages.

## Setup

Download [Node.js](https://nodejs.org/en/download/).
Run this followed commands:

```bash
# Install dependencies (only the first time)
npm install

# Run the local server at localhost:8080
npm run dev

# Build for production in the dist/ directory
npm run build

# Deploy to GitHub Pages (only if you want to push the build to gh-pages)
npm run deploy
```

## Usage

The project is designed to handle 3D models and is controlled via messages. Below are the two primary message formats used to interact with the 3D views

- Home models are: "solo-haven","duo-oasis" or "skyline-loft".
- Siding color options are: "Space Black", "Slate Grey", "Chestnut Brown" or "Warm Beige".
- Wood finish options are: "Redwood siding finish", "Metallic siding finish".
- Side options are: "Regular Wall", "Window glass" or "Full size glass" // not all of them are customizable.
- Solar Panel options are: "3x Solar panels", "No Add".

### Initialize a Model

To create and initialize a model, send the following message //use console

```javascript
const eventData = {
  type: "initializeModel",
  modelName: "skyline-loft",
  options: {
    "siding-color": "Space Black",
    "wood-finish": "Metallic siding finish",
    "side-4": "Regular Wall",
    "side-6": "Full size glass",
    "side-7": "Full size glass",
    "side-12": "Window glass",
    "solar-panel": "3x Solar panels",
  },
};

window.postMessage(eventData, "*");
```

### Update Model Options

To update a specific option for a model, use the following message format

```javascript
const eventData = {
  type: "updateOption",
  option: {
    type: "side-12", // Change this to test different options
    value: "Full size glass", // Change this to the desired value
  },
};

window.postMessage(eventData, "*");
```

These messages enable dynamic updates to the 3D model’s properties and allow for real-time interaction within the iframe.
