import React from "react";
import Home from "./components/Home/Home";
import About from "./components/About/About";

import { createHashRouter, RouterProvider } from "react-router-dom";

const router = createHashRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/about",
    element: <About />,
  },
]);

const Options = () => {
  return <RouterProvider router={router} />;
};

export default Options;
