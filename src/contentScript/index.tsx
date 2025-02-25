import React from "react";
import { createRoot } from "react-dom/client";
import "../styles/tailwind.css";
import ContentScript from "./contentScript";

function init() {
  const appContainer = document.createElement("div");
  document.body.appendChild(appContainer);
  if (!appContainer) {
    throw new Error("Can not find AppContainer");
  }
  const root = createRoot(appContainer);
  console.log(appContainer);
  root.render(<ContentScript />);
}

init();
