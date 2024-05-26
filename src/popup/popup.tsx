import React, { useEffect, useState } from "react";
import "./popup.css";

const Popup = () => {
  const [input, setInput] = useState<string>("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const prefs = {
      input_data: input,
    };
    chrome.runtime.sendMessage({ event: "submit", prefs });
  };

  useEffect(() => {
    const fetchData = async () => {
      chrome.storage.local.get(["input_data"], (prefs) => {
        const { input_data } = prefs;
        if (input_data) {
          setInput(input_data);
        }
      });
    };
    fetchData();
  }, []);

  return (
    <div className="popup-container bg-light rounded shadow-sm p-4">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label
            htmlFor="inputField"
            className="form-label block text-gray-700 text-sm font-bold mb-2"
          >
            CET
          </label>
          <input
            id="input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="form-control border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Type here..."
          />
        </div>
        <div className="flex justify-center items-center flex-1">
          <button
            id="submit"
            type="submit"
            className="btn btn-primary bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default Popup;
