import React from "react";
import { prompts } from '../prompts';

// Write your code here to Inject into the page
const contentScript = () => {
  // Detect which website we're on
  const isClaudeWebsite = window.location.hostname.includes('claude.ai');
  const isChatGPTWebsite = window.location.hostname.includes('chat.openai.com');
  
  console.log(`Content script running on ${isClaudeWebsite ? 'Claude' : 'ChatGPT'} page`);
  
  // Create and inject the style element for the dropdown only
  const style = document.createElement('style');
  
  // Define styles based on the website
  const commonStyles = `
    .custom-dropdown-wrapper {
      display: inline-block;
      position: relative;
      margin-left: 8px;
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
      gap: 6px;
      font-size: 14px;
      z-index: 100001;
      transition: all 0.2s;
      height: 32px;
      color: var(--text-300, rgb(217, 217, 217));
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
      color: #fff;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      z-index: 100001;
      transition: background-color 0.2s;
      height: 32px;
      color: rgb(217, 217, 217);
    }
    .custom-dropdown-button:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    .custom-dropdown-content {
      background-color: #202123;
      box-shadow: 0 8px 16px rgba(0,0,0,0.3);
      border-radius: 6px;
      border: 1px solid #4a5568;
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
    }
    .custom-dropdown-item:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    .custom-dropdown-item.selected {
      background-color: rgba(255, 255, 255, 0.05);
      font-weight: 500;
    }
  `;

  // Combine styles based on the website
  style.textContent = commonStyles + (isClaudeWebsite ? claudeStyles : chatGPTStyles);
  
  // Remove any existing style element to prevent duplicates
  const styleId = isClaudeWebsite ? 'claude-dropdown-style' : 'chatgpt-dropdown-style';
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Add an ID to our style element
  style.id = styleId;
  
  // Append the style element to the document head
  document.head.appendChild(style);
  
  // Log to confirm style injection
  console.log(`${isClaudeWebsite ? 'Claude' : 'ChatGPT'} dropdown styles injected`);

  // Function to position the dropdown content
  const positionDropdown = (buttonEl: HTMLElement, dropdownEl: HTMLElement) => {
    const rect = buttonEl.getBoundingClientRect();
    const dropdownHeight = dropdownEl.offsetHeight;
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;
    
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    const shouldShowUpward = spaceBelow < dropdownHeight && spaceAbove > dropdownHeight;
    
    if (shouldShowUpward) {
      dropdownEl.style.top = `${rect.top + scrollY - dropdownHeight - 4}px`;
      dropdownEl.classList.add('upward');
      dropdownEl.classList.remove('downward');
    } else {
      dropdownEl.style.top = `${rect.bottom + scrollY + 4}px`;
      dropdownEl.classList.add('downward');
      dropdownEl.classList.remove('upward');
    }
    
    const dropdownWidth = dropdownEl.offsetWidth;
    const buttonCenter = rect.left + (rect.width / 2);
    const leftPosition = buttonCenter - (dropdownWidth / 2);
    
    const minLeft = 10;
    const maxLeft = window.innerWidth - dropdownWidth - 10;
    const adjustedLeft = Math.min(Math.max(leftPosition, minLeft), maxLeft);
    
    dropdownEl.style.left = `${adjustedLeft}px`;
  };

  // Add resize observer to handle dynamic content changes
  const setupResizeObserver = (dropdownEl: HTMLElement, buttonEl: HTMLElement) => {
    const resizeObserver = new ResizeObserver(() => {
      if (dropdownEl.classList.contains('show')) {
        positionDropdown(buttonEl, dropdownEl);
      }
    });
    
    resizeObserver.observe(dropdownEl);
    return resizeObserver;
  };

  // Create and inject the dropdown
  const createDropdown = () => {
    const prefix = isClaudeWebsite ? 'claude' : 'chatgpt';
    
    // Remove any existing dropdowns to ensure only one
    const oldWrapper = document.getElementById(`custom-${prefix}-dropdown-wrapper`);
    if (oldWrapper && oldWrapper.parentNode) {
      oldWrapper.parentNode.removeChild(oldWrapper);
    }
    const oldContent = document.getElementById(`custom-${prefix}-dropdown-content`);
    if (oldContent && oldContent.parentNode) {
      oldContent.parentNode.removeChild(oldContent);
    }

    // Find the Tools button container based on the website
    const toolsButtonSelector = isClaudeWebsite 
      ? '[data-testid="input-menu-tools"]'
      : '[data-testid="composer-action-system-hint-button"]';
    
    const toolsButton = document.querySelector(toolsButtonSelector);
    if (!toolsButton || !toolsButton.parentNode) return;

    // Create wrapper for dropdown
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-dropdown-wrapper';
    wrapper.id = `custom-${prefix}-dropdown-wrapper`;

    // Create dropdown button with appropriate icon based on the website
    const dropdownButton = document.createElement('button');
    dropdownButton.className = 'custom-dropdown-button';
    dropdownButton.innerHTML = isClaudeWebsite
      ? `
        <span id="custom-dropdown-selected" style="font-size: 14px;">Templates</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256">
          <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
        </svg>
      `
      : `
        <span id="custom-dropdown-selected" style="font-size: 14px;">Prompts</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1.5 3L5 6.5L8.5 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    dropdownButton.type = 'button';

    // Create dropdown content
    const dropdownContent = document.createElement('div');
    dropdownContent.className = 'custom-dropdown-content';
    dropdownContent.id = `custom-${prefix}-dropdown-content`;

    // Add prompt items to dropdown
    prompts.forEach(prompt => {
      const menuItem = document.createElement('a');
      menuItem.className = 'custom-dropdown-item';
      menuItem.href = '#';
      menuItem.textContent = prompt.name;
      menuItem.onclick = (e) => {
        e.preventDefault();
        
        dropdownContent.querySelectorAll('.custom-dropdown-item').forEach(item => {
          item.classList.remove('selected');
        });
        
        menuItem.classList.add('selected');
        
        const selectedSpan = dropdownButton.querySelector('#custom-dropdown-selected');
        if (selectedSpan) selectedSpan.textContent = prompt.name;
        dropdownContent.classList.remove('show');
        
        // Update the text in the appropriate editor
        if (isClaudeWebsite) {
          const editor = document.querySelector('.ProseMirror');
          if (editor) {
            const pTag = editor.querySelector('p');
            if (pTag) {
              pTag.textContent = prompt.text;
              pTag.classList.remove('is-empty');
              pTag.classList.remove('is-editor-empty');
            }
          }
        } else {
          const promptTextarea = document.getElementById('prompt-textarea');
          if (promptTextarea) {
            const pTag = promptTextarea.querySelector('p');
            if (pTag) {
              pTag.textContent = prompt.text;
              pTag.classList.remove('placeholder');
            }
          }
        }
      };
      dropdownContent.appendChild(menuItem);
    });

    // Add click handler for the dropdown button
    dropdownButton.onclick = (e) => {
      e.stopPropagation();
      const isShown = dropdownContent.classList.toggle('show');
      if (isShown) {
        requestAnimationFrame(() => {
          positionDropdown(dropdownButton, dropdownContent);
        });
      }
    };

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target as Node) && !dropdownContent.contains(e.target as Node)) {
        dropdownContent.classList.remove('show');
      }
    });

    // Setup resize observer after dropdown is created
    setupResizeObserver(dropdownContent, dropdownButton);

    // Append dropdown button to the wrapper
    wrapper.appendChild(dropdownButton);

    // Insert the dropdown wrapper right after the Tools button
    toolsButton.parentNode.insertBefore(wrapper, toolsButton.nextSibling);

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
    subtree: true
  });

  return null;
};

export default contentScript;
