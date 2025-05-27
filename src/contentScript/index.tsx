import React from "react";
import { createRoot } from "react-dom/client";
import ContentScript from "./contentScript";

// Initialize the content script
function init() {
  console.log('Initializing content script');
  ContentScript();
}

// Run the initialization
init();
