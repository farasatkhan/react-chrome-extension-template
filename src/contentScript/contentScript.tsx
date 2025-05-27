import React from "react";
import { prompts } from '../prompts';

// Write your code here to Inject into the page
const contentScript = () => {
  console.log('Content script running on ChatGPT page');
  
  // Create and inject the style element for the dropdown only
  const style = document.createElement('style');
  style.textContent = `
    .custom-dropdown-wrapper {
      display: inline-block;
      position: relative;
      margin-left: 8px;
      z-index: 100000;
    }
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
      display: none;
      position: fixed;
      background-color: #202123;
      min-width: 180px;
      max-height: 300px;
      overflow-y: auto;
      box-shadow: 0 8px 16px rgba(0,0,0,0.3);
      z-index: 2147483647;
      border-radius: 6px;
      border: 1px solid #4a5568;
      scrollbar-width: thin;
      scrollbar-color: #565869 #40414f;
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
    .custom-dropdown-content.show {
      display: block;
    }
    .custom-dropdown-item {
      color: rgb(217, 217, 217);
      padding: 8px 12px;
      text-decoration: none;
      display: block;
      transition: background-color 0.2s;
      cursor: pointer;
      font-size: 14px;
    }
    .custom-dropdown-item:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
    .custom-dropdown-item.selected {
      background-color: rgba(255, 255, 255, 0.05);
      font-weight: 500;
    }
  `;
  
  // Remove any existing style element to prevent duplicates
  const existingStyle = document.getElementById('chatgpt-green-theme');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Add an ID to our style element
  style.id = 'chatgpt-green-theme';
  
  // Append the style element to the document head
  document.head.appendChild(style);
  
  // Log to confirm style injection
  console.log('Green theme styles injected');

  // Function to position the dropdown content
  const positionDropdown = (buttonEl: HTMLElement, dropdownEl: HTMLElement) => {
    const rect = buttonEl.getBoundingClientRect();
    const dropdownHeight = dropdownEl.offsetHeight;
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;
    
    // Calculate available space above and below
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    // Decide whether to show upward or downward
    const shouldShowUpward = spaceBelow < dropdownHeight && spaceAbove > dropdownHeight;
    
    // Update dropdown position and direction classes
    if (shouldShowUpward) {
      dropdownEl.style.top = `${rect.top + scrollY - dropdownHeight - 4}px`;
      dropdownEl.classList.add('upward');
      dropdownEl.classList.remove('downward');
    } else {
      dropdownEl.style.top = `${rect.bottom + scrollY + 4}px`;
      dropdownEl.classList.add('downward');
      dropdownEl.classList.remove('upward');
    }
    
    // Center horizontally relative to the button
    const dropdownWidth = dropdownEl.offsetWidth;
    const buttonCenter = rect.left + (rect.width / 2);
    const leftPosition = buttonCenter - (dropdownWidth / 2);
    
    // Ensure the dropdown doesn't go off-screen horizontally
    const minLeft = 10; // Minimum distance from left edge
    const maxLeft = window.innerWidth - dropdownWidth - 10; // Maximum distance from right edge
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
    // Remove any existing dropdowns to ensure only one
    const oldWrapper = document.getElementById('custom-chatgpt-dropdown-wrapper');
    if (oldWrapper && oldWrapper.parentNode) {
      oldWrapper.parentNode.removeChild(oldWrapper);
    }
    const oldContent = document.getElementById('custom-chatgpt-dropdown-content');
    if (oldContent && oldContent.parentNode) {
      oldContent.parentNode.removeChild(oldContent);
    }

    // Find the Tools button container
    const toolsButton = document.querySelector('[data-testid="composer-action-system-hint-button"]');
    if (!toolsButton || !toolsButton.parentNode) return;

    // Create wrapper for dropdown
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-dropdown-wrapper';
    wrapper.id = 'custom-chatgpt-dropdown-wrapper';

    // Create dropdown button
    const dropdownButton = document.createElement('button');
    dropdownButton.className = 'custom-dropdown-button';
    dropdownButton.innerHTML = `
      <span id="custom-dropdown-selected" style="font-size: 14px;">Prompts</span>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.5 3L5 6.5L8.5 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    dropdownButton.type = 'button';

    // Create dropdown content
    const dropdownContent = document.createElement('div');
    dropdownContent.className = 'custom-dropdown-content';
    dropdownContent.id = 'custom-chatgpt-dropdown-content';

    // Add prompt items to dropdown
    prompts.forEach(prompt => {
      const menuItem = document.createElement('a');
      menuItem.className = 'custom-dropdown-item';
      menuItem.href = '#';
      menuItem.textContent = prompt.name;
      menuItem.onclick = (e) => {
        e.preventDefault();
        
        // Remove selected class from all items
        dropdownContent.querySelectorAll('.custom-dropdown-item').forEach(item => {
          item.classList.remove('selected');
        });
        
        // Add selected class to clicked item
        menuItem.classList.add('selected');
        
        // Set selected item in dropdown
        const selectedSpan = dropdownButton.querySelector('#custom-dropdown-selected');
        if (selectedSpan) selectedSpan.textContent = prompt.name;
        dropdownContent.classList.remove('show');
        
        // Update the text in the prompt textarea
        const promptTextarea = document.getElementById('prompt-textarea');
        if (promptTextarea) {
          const pTag = promptTextarea.querySelector('p');
          if (pTag) {
            pTag.textContent = prompt.text;
            pTag.classList.remove('placeholder');
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
        // Wait for the dropdown to be visible before positioning
        requestAnimationFrame(() => {
          positionDropdown(dropdownButton, dropdownContent);
        });
      }
    };

    // Setup resize observer after dropdown is created
    setupResizeObserver(dropdownContent, dropdownButton);

    // Append dropdown button to the wrapper
    wrapper.appendChild(dropdownButton);

    // Insert the dropdown wrapper right after the Tools button
    toolsButton.parentNode.insertBefore(wrapper, toolsButton.nextSibling);

    // Append dropdown content to body
    document.body.appendChild(dropdownContent);
  };

  // Wait for the page to be fully loaded
  if (document.readyState === 'complete') {
    setTimeout(createDropdown, 1000);
  } else {
    window.addEventListener('load', () => setTimeout(createDropdown, 1000));
  }

  return null;
};

export default contentScript;
