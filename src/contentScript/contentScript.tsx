import React from "react";

// Write your code here to Inject into the page
const contentScript = () => {
  return (
    <div className="flex flex-1 justify-center items-center h-10">
      <p className="text-xl font-semibold">Chrome Extension Code Injected 2</p>
    </div>
  );
};

export default contentScript;
