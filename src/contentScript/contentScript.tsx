import { getAllPrompts } from "../prompts";

interface Prompt {
  id: string;
  name: string;
  text: string;
}

// Write your code here to Inject into the page
const contentScript = () => {
  // Define prefix at the top of the contentScript function
  const prefix = window.location.hostname.includes("claude.ai")
    ? "claude"
    : "chatgpt";

  // Detect which website we're on
  const isClaudeWebsite = window.location.hostname.includes("claude.ai");
  const isChatGPTWebsite =
    window.location.hostname.includes("chat.openai.com") ||
    window.location.hostname.includes("chatgpt.com");

  console.log(
    `Content script running on ${isClaudeWebsite ? "Claude" : "ChatGPT"} page`
  );
  console.log("Current URL:", window.location.href);

  // Create and inject the style element for the dropdown only
  const style = document.createElement("style");

  // Define styles based on the website
  const commonStyles = `
    .custom-dropdown-wrapper {
      display: flex;
      align-items: center;
      margin-left: 0;
      z-index: 100000;
    }
    .custom-dropdown-content {
      display: none;
      position: fixed;
      min-width: 180px;
      max-height: 300px;
      overflow-y: auto;
      z-index: 2147483647;
      scrollbar-width: thin;
      transition: transform 0.2s ease-in-out;
    }
    .custom-dropdown-content.upward {
      transform-origin: bottom center;
      margin-top: 0;
      margin-bottom: 4px;
    }
    .custom-dropdown-content.downward {
      transform-origin: top center;
      margin-top: 4px;
      margin-bottom: 0;
    }
    .custom-dropdown-content.show {
      display: block;
    }
    .custom-dropdown-item {
      padding: 8px 12px;
      text-decoration: none;
      display: block;
      transition: background-color 0.2s;
      cursor: pointer;
      font-size: 14px;
    }
  `;

  const claudeStyles = `
    .custom-dropdown-button {
      background-color: transparent;
      border: 0.5px solid var(--border-300, rgb(64, 65, 79));
      padding: 6px 12px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      z-index: 100001;
      transition: all 0.2s;
      height: 32px;
      color: var(--text-300, rgb(217, 217, 217));
      min-width: 120px;
      white-space: nowrap;
      margin-left: 2px;
    }
    .custom-dropdown-button:hover {
      background-color: var(--bg-100, rgba(255, 255, 255, 0.1));
      color: var(--text-200, rgba(217, 217, 217, 0.9));
      border-color: var(--border-200, rgba(64, 65, 79, 0.5));
    }
    .custom-dropdown-content {
      background-color: rgb(32, 33, 35);
      box-shadow: 0 0.25rem 1.25rem rgba(0, 0, 0, 0.15);
      border-radius: 12px;
      border: 0.5px solid var(--border-300, rgba(64, 65, 79, 0.8));
      scrollbar-color: #565869 #40414f;
    }
    .custom-dropdown-content::-webkit-scrollbar {
      width: 6px;
    }
    .custom-dropdown-content::-webkit-scrollbar-track {
      background: var(--bg-200, #40414f);
      border-radius: 4px;
    }
    .custom-dropdown-content::-webkit-scrollbar-thumb {
      background-color: var(--bg-300, #565869);
      border-radius: 4px;
    }
    .custom-dropdown-item {
      color: var(--text-200, rgb(217, 217, 217));
    }
    .custom-dropdown-item:hover {
      background-color: var(--bg-100, rgba(255, 255, 255, 0.1));
    }
    .custom-dropdown-item.selected {
      background-color: var(--bg-200, rgba(255, 255, 255, 0.05));
      font-weight: 500;
    }
  `;

  const chatGPTStyles = `
    .custom-dropdown-button {
      background-color: transparent;
      border: none;
      color: rgb(217, 217, 217);
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      z-index: 100001;
      transition: background-color 0.2s;
      height: 32px;
      min-width: 100px;
      white-space: nowrap;
      margin-left: 2px;
    }
    .custom-dropdown-button:hover {
      background-color: rgba(52, 53, 65, 0.9);
    }
    .custom-dropdown-content {
      background-color: rgb(32, 33, 35);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      scrollbar-color: #565869 #40414f;
    }
    .custom-dropdown-content::-webkit-scrollbar {
      width: 6px;
    }
    .custom-dropdown-content::-webkit-scrollbar-track {
      background: #40414f;
      border-radius: 4px;
    }
    .custom-dropdown-content::-webkit-scrollbar-thumb {
      background-color: #565869;
      border-radius: 4px;
    }
    .custom-dropdown-item {
      color: rgb(217, 217, 217);
      padding: 8px 12px;
    }
    .custom-dropdown-item:hover {
      background-color: rgba(52, 53, 65, 0.9);
    }
    .custom-dropdown-item.selected {
      background-color: rgba(52, 53, 65, 0.7);
      font-weight: 500;
    }
  `;

  // Combine styles based on the website
  style.textContent =
    commonStyles + (isClaudeWebsite ? claudeStyles : chatGPTStyles);

  // Remove any existing style element to prevent duplicates
  const styleId = isClaudeWebsite
    ? "claude-dropdown-style"
    : "chatgpt-dropdown-style";
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
  }

  // Add an ID to our style element
  style.id = styleId;

  // Append the style element to the document head
  document.head.appendChild(style);

  // Log to confirm style injection
  console.log(
    `${isClaudeWebsite ? "Claude" : "ChatGPT"} dropdown styles injected`
  );

  // Function to position the dropdown content
  const positionDropdown = (buttonEl: HTMLElement, dropdownEl: HTMLElement) => {
    const rect = buttonEl.getBoundingClientRect();
    const dropdownHeight = dropdownEl.offsetHeight;
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    const shouldShowUpward =
      spaceBelow < dropdownHeight && spaceAbove > dropdownHeight;

    if (shouldShowUpward) {
      dropdownEl.style.top = `${rect.top + scrollY - dropdownHeight - 4}px`;
      dropdownEl.classList.add("upward");
      dropdownEl.classList.remove("downward");
    } else {
      dropdownEl.style.top = `${rect.bottom + scrollY + 4}px`;
      dropdownEl.classList.add("downward");
      dropdownEl.classList.remove("upward");
    }

    const dropdownWidth = dropdownEl.offsetWidth;
    const buttonCenter = rect.left + rect.width / 2;
    const leftPosition = buttonCenter - dropdownWidth / 2;

    const minLeft = 10;
    const maxLeft = window.innerWidth - dropdownWidth - 10;
    const adjustedLeft = Math.min(Math.max(leftPosition, minLeft), maxLeft);

    dropdownEl.style.left = `${adjustedLeft}px`;
  };

  // Add resize observer to handle dynamic content changes
  const setupResizeObserver = (
    dropdownEl: HTMLElement,
    buttonEl: HTMLElement
  ) => {
    const resizeObserver = new ResizeObserver(() => {
      if (dropdownEl.classList.contains("show")) {
        positionDropdown(buttonEl, dropdownEl);
      }
    });

    resizeObserver.observe(dropdownEl);
    return resizeObserver;
  };

  // Create and inject the dropdown
  const createDropdown = async () => {
    // Guard: Prevent multiple dropdowns
    if (document.getElementById(`custom-${prefix}-dropdown-wrapper`)) {
      return;
    }

    // Create wrapper for dropdown
    const wrapper = document.createElement("div");
    wrapper.className = "custom-dropdown-wrapper";
    wrapper.id = `custom-${prefix}-dropdown-wrapper`;

    // Find the Tools button
    let toolsButton;
    if (isClaudeWebsite) {
      toolsButton = document.querySelector(
        'button[data-testid="input-menu-tools"]'
      );
    } else {
      toolsButton =
        document.querySelector("button#system-hint-button") ||
        document.querySelector(
          'button[data-testid="composer-action-system-hint-button"]'
        );
    }

    if (toolsButton) {
      // Find the flex container based on the website
      const flexContainer = isClaudeWebsite
        ? toolsButton.closest(".flex.items-center.gap-2.min-w-0")
        : toolsButton.closest(".flex.items-center");

      if (flexContainer) {
        if (isClaudeWebsite) {
          // For Claude, insert after the Tools button
          const existingWrapper = document.getElementById(
            `custom-${prefix}-dropdown-wrapper`
          );
          if (!existingWrapper) {
            toolsButton.after(wrapper);
          }
        } else {
          // For ChatGPT, insert after the + button
          const plusButton = flexContainer.querySelector(
            'button[class*="p-1"]'
          );
          if (plusButton) {
            plusButton.after(wrapper);
          } else {
            flexContainer.appendChild(wrapper);
          }
        }
      } else {
        // Fallback: insert after toolsButton
        toolsButton.after(wrapper);
      }
    }

    // Create dropdown button with appropriate icon based on the website
    const dropdownButton = document.createElement("button");
    dropdownButton.className = "custom-dropdown-button";
    dropdownButton.innerHTML = isClaudeWebsite
      ? `
        <span id="custom-dropdown-selected" style="font-size: 14px; font-weight: 500;">Prompts</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256" class="text-text-500 shrink-0">
          <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
        </svg>
      `
      : `
        <span id="custom-dropdown-selected" style="font-size: 14px;">Prompts</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md">
          <path d="M12 15.713L18.01 9.70299L16.597 8.28799L12 12.888L7.40399 8.28799L5.98999 9.70199L12 15.713Z" fill="currentColor"></path>
        </svg>
      `;
    dropdownButton.type = "button";

    // Create dropdown content
    const dropdownContent = document.createElement("div");
    dropdownContent.className = "custom-dropdown-content";
    dropdownContent.id = `custom-${prefix}-dropdown-content`;

    // Get prompts from storage and add them to dropdown
    const prompts = await getAllPrompts();

    // Function to update dropdown items
    const updateDropdownItems = (items: Prompt[]) => {
      // Clear existing items
      while (dropdownContent.firstChild) {
        dropdownContent.removeChild(dropdownContent.firstChild);
      }

      // Add prompt items to dropdown
      items.forEach((prompt) => {
        const menuItem = document.createElement("a");
        menuItem.className = "custom-dropdown-item";
        menuItem.href = "#";
        menuItem.textContent = prompt.name;
        menuItem.onclick = (e) => {
          e.preventDefault();

          dropdownContent
            .querySelectorAll(".custom-dropdown-item")
            .forEach((item) => {
              item.classList.remove("selected");
            });

          menuItem.classList.add("selected");

          const selectedSpan = dropdownButton.querySelector(
            "#custom-dropdown-selected"
          );
          if (selectedSpan) selectedSpan.textContent = prompt.name;
          dropdownContent.classList.remove("show");

          // Update the text in the appropriate editor
          if (isClaudeWebsite) {
            const editor = document.querySelector(".ProseMirror");
            if (editor) {
              const pTag = editor.querySelector("p");
              if (pTag) {
                pTag.textContent = prompt.text;
                pTag.classList.remove("is-empty");
                pTag.classList.remove("is-editor-empty");
              }
            }
          } else {
            const promptTextarea = document.getElementById("prompt-textarea");
            if (promptTextarea) {
              const pTag = promptTextarea.querySelector("p");
              if (pTag) {
                pTag.textContent = prompt.text;
                pTag.classList.remove("placeholder");
              }
            }
          }
        };
        dropdownContent.appendChild(menuItem);
      });
    };

    // Initial population of dropdown
    updateDropdownItems(prompts);

    // Listen for changes in chrome storage
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === "local" && changes.prompts) {
        getAllPrompts().then((updatedPrompts) => {
          updateDropdownItems(updatedPrompts);
        });
      }
    });

    // Add click handler for the dropdown button
    dropdownButton.onclick = (e) => {
      e.stopPropagation();
      const isShown = dropdownContent.classList.toggle("show");
      if (isShown) {
        requestAnimationFrame(() => {
          positionDropdown(dropdownButton, dropdownContent);
        });
      }
    };

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !wrapper.contains(e.target as Node) &&
        !dropdownContent.contains(e.target as Node)
      ) {
        dropdownContent.classList.remove("show");
      }
    });

    // Setup resize observer after dropdown is created
    setupResizeObserver(dropdownContent, dropdownButton);

    // Append dropdown button to the wrapper
    wrapper.appendChild(dropdownButton);

    // Append dropdown content to body
    document.body.appendChild(dropdownContent);
  };

  // Create a mutation observer to handle dynamic content loading
  const observer = new MutationObserver((mutations, obs) => {
    const toolsButtonSelector = isClaudeWebsite
      ? '[data-testid="input-menu-tools"]'
      : '[data-testid="composer-action-system-hint-button"]';

    const toolsButton = document.querySelector(toolsButtonSelector);
    if (toolsButton) {
      createDropdown();
      obs.disconnect(); // Stop observing once we find and add the dropdown
    }
  });

  // Start observing the document with the configured parameters
  observer.observe(document, {
    childList: true,
    subtree: true,
  });

  return null;
};

export default contentScript;
