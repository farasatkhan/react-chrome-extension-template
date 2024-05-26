import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-start items-center gap-5">
        <img src="assets/images/img.png" alt="logo" className="w-8 h-8" />
        <div className="space-x-4">
          <Link
            className="text-gray-300 hover:text-white text-lg font-semibold"
            to="/"
          >
            Home
          </Link>
          <Link
            className="text-gray-300 hover:text-white text-lg font-semibold"
            to="/about"
          >
            About
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
