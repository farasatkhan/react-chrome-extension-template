import React, { useEffect, useState } from "react";
import "./popup.css";

interface Prompt {
  id: string;
  name: string;
  text: string;
}

const Popup = () => {
  const [promptName, setPromptName] = useState("");
  const [promptText, setPromptText] = useState("");
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  // Load prompts when popup opens
  useEffect(() => {
    chrome.storage.local.get(['prompts'], (result) => {
      setPrompts(result.prompts || []);
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPrompt: Prompt = {
      id: Date.now().toString(),
      name: promptName,
      text: promptText
    };

    chrome.storage.local.get(['prompts'], (result) => {
      const updatedPrompts = [...(result.prompts || []), newPrompt];
      chrome.storage.local.set({ prompts: updatedPrompts }, () => {
        setPrompts(updatedPrompts);
        setPromptName("");
        setPromptText("");
      });
    });
  };

  const handleDelete = (id: string) => {
    chrome.storage.local.get(['prompts'], (result) => {
      const updatedPrompts = (result.prompts || []).filter((p: Prompt) => p.id !== id);
      chrome.storage.local.set({ prompts: updatedPrompts }, () => {
        setPrompts(updatedPrompts);
      });
    });
  };

  return (
    <div className="popup-container bg-light rounded shadow-sm p-4">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-3">
          <label
            htmlFor="promptName"
            className="form-label block text-gray-700 text-sm font-bold mb-2"
          >
            Prompt Name
          </label>
          <input
            id="promptName"
            type="text"
            value={promptName}
            onChange={(e) => setPromptName(e.target.value)}
            className="form-control border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter prompt name..."
          />
        </div>
        <div className="mb-3">
          <label
            htmlFor="promptText"
            className="form-label block text-gray-700 text-sm font-bold mb-2"
          >
            Prompt Text
          </label>
          <textarea
            id="promptText"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            className="form-control border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter prompt text..."
            rows={4}
          />
        </div>
        <div className="flex justify-center items-center flex-1">
          <button
            type="submit"
            className="btn btn-primary bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            disabled={!promptName.trim() || !promptText.trim()}
          >
            Add Prompt
          </button>
        </div>
      </form>

      {/* Prompts List */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Saved Prompts</h3>
        <div className="max-h-60 overflow-y-auto">
          {prompts.length === 0 ? (
            <p className="text-gray-500 text-sm">No prompts added yet</p>
          ) : (
            prompts.map((prompt) => (
              <div
                key={prompt.id}
                className="bg-white border rounded-lg p-3 mb-2 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-800">{prompt.name}</h4>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{prompt.text}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(prompt.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                    title="Delete prompt"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                      <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Popup;
