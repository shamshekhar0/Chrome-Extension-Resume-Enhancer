// Configuration
window.CONFIG = {
  button: {
    size: "40px", // Default value
    color: "#64b5f6", // Default color if no value is stored
    position: "right" // Default position if no value is stored
  },
  panel: {
    width: "300px" // Default width
  }
};

// Fetch settings from Chrome storage
chrome.storage.local.get(["buttonColor", "buttonPosition"], (result) => {
  if (result.buttonColor) {
    window.CONFIG.button.color = result.buttonColor;
  }
  if (result.buttonPosition) {
    window.CONFIG.button.position = result.buttonPosition;
  }

  // Apply styles AFTER ensuring storage values are loaded
  const sidebarButton = document.getElementById("page-assistant-button");
  if (sidebarButton) {

    sidebarButton.style.backgroundColor = window.CONFIG.button.color;
    if (window.CONFIG.button.position === "left") {
      sidebarButton.style.left = "20px";
      sidebarButton.style.right = "";
    } else {
      sidebarButton.style.right = "20px";
      sidebarButton.style.left = "";
    }
  }
});



// Create and inject the floating button
function createFloatingButton() {
  const button = document.createElement("div");
  button.id = "page-assistant-button";
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 16v-4"></path>
      <path d="M12 8h.01"></path>
    </svg>
  `;

  // Set initial position
  button.style.position = "fixed";
  button.style.zIndex = "10000";
  button.style.width = CONFIG.button.size;
  button.style.height = CONFIG.button.size;
  button.style.backgroundColor = CONFIG.button.color;
  button.style.borderRadius = "50%";
  button.style.display = "flex";
  button.style.justifyContent = "center";
  button.style.alignItems = "center";
  button.style.cursor = "pointer";
  button.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.2)";
  button.style.transition = "transform 0.2s";
  button.style.top = "100px";

  if (CONFIG.button.position === "right") {
    button.style.right = "20px";
  } else {
    button.style.left = "20px";
  }

  // Add hover effect
  button.addEventListener("mouseover", () => {
    button.style.transform = "scale(1.1)";
  });

  button.addEventListener("mouseout", () => {
    button.style.transform = "scale(1)";
  });
  console.log(window.CONFIG.button);
  
  // Make the button draggable (vertically only)
  makeDraggable(button);

  // Add click event to toggle the panel
  button.addEventListener("click", togglePanel);

  document.body.appendChild(button);
  return button;
}

// Make an element draggable vertically
function makeDraggable(element) {
  let pos = { y: 0 };
  let isDown = false;

  element.addEventListener("mousedown", (e) => {
    isDown = true;
    pos.y = e.clientY - element.getBoundingClientRect().top;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", () => {
      isDown = false;
      document.removeEventListener("mousemove", handleMouseMove);
    });
  });

  function handleMouseMove(e) {
    if (!isDown) return;
    e.preventDefault();

    // Only allow vertical movement
    const newTop = e.clientY - pos.y;

    // Keep the button within the viewport
    if (newTop > 0 && newTop < window.innerHeight - element.offsetHeight) {
      element.style.top = `${newTop}px`;
    }
  }
}

// Create and show the panel
function createPanel() {
  const panel = document.createElement("div");
  panel.id = "page-assistant-panel";
  panel.style.position = "fixed";
  panel.style.top = "0";
  panel.style.right = "0";
  panel.style.width = CONFIG.panel.width;
  panel.style.height = "100%";
  panel.style.backgroundColor = "#fff";
  panel.style.boxShadow = "-5px 0 15px rgba(0, 0, 0, 0.1)";
  panel.style.zIndex = "9999";
  panel.style.display = "flex";
  panel.style.flexDirection = "column";
  panel.style.transition = "transform 0.3s ease-in-out";
  panel.style.transform = "translateX(100%)";

  // Chat interface HTML
  panel.innerHTML = `
  <div class="page-assistant-header">
      <h3>Application assitant</h3>
      <button id="page-assistant-close">×</button>
      </div>
    <div id="page-assistant-chat-container">
    <div id="page-assistant-messages"></div>
    </div>
    <div class="page-assistant-input-container">
    <textarea id="page-assistant-input" placeholder="enter the query for ur resume"></textarea>
      <button id="page-assistant-send">Ask</button>
      </div>
  `;

  document.body.appendChild(panel);

  // Add event listeners
  document.getElementById("page-assistant-close").addEventListener("click", togglePanel);
  document.getElementById("page-assistant-send").addEventListener("click", handleUserMessage);
  const storedData = localStorage.getItem(STORAGE_KEY);
  
  if (storedData) {
    loadMessagesFromLocal();
  }
  else {
    out_the_first_data();
  }

  // Also allow sending with Enter key (Shift+Enter for new line)
  const textarea = document.getElementById("page-assistant-input");
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleUserMessage();
    }
  });

  return panel;
}

// Toggle the panel visibility
function togglePanel() {
  // Get or create the panel
  let panel = document.getElementById("page-assistant-panel");
  if (!panel) {
    panel = createPanel();
  }

  const isVisible = panel.style.transform === "translateX(0%)";

  if (isVisible) {
    // Hide panel
    panel.style.transform = "translateX(100%)";
    // Restore original page width
    document.body.style.width = "100%";
    document.body.style.marginRight = "0";
  } else {
    // Show panel
    panel.style.transform = "translateX(0%)";
    // Resize page to 80% width
    document.body.style.width = "80%";
    document.body.style.marginRight = "20%";
  }
}

function processJsonData(data) {
  if (Array.isArray(data)) {
    // If it's an array, iterate through each item
    console.log(data);
    if ((typeof data === "object" && data !== null)) {
      data.forEach(item => {
        processJsonData(item);
      });
      }else {
      addMessage(data);
    }
    
  } else if (typeof data === "object" && data !== null) {
    // If it's an object, iterate through each key-value pair
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === "object" && value !== null) {
        processJsonData(value); // Recursive call for nested objects/arrays
      } else {
        addMessage(`<strong>${key.toUpperCase()}:</strong></br> ${value}`); // Format as bold key-value pairs
      }
    });
    console.log("else if", data);
  }
}

function blockDiv() {
  document.getElementById("page-assistant-input").classList.add("disabled");
  document.getElementById("page-assistant-send").classList.add("disabled");
}
function addMessage1(content, isUser = false) {
  const messagesContainer = document.getElementById("page-assistant-messages");
  const messageElement = document.createElement("div");
  messageElement.className = isUser ? "page-assistant-user-message" : "page-assistant-ai-message";
  messageElement.innerHTML = content; // Use innerHTML to render HTML tags

  messagesContainer.appendChild(messageElement);
  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
function addMessage(content, isUser = false) {
  const messagesContainer = document.getElementById("page-assistant-messages");
  const messageElement = document.createElement("div");
  messageElement.className = isUser ? "page-assistant-user-message" : "page-assistant-ai-message";
  messageElement.innerHTML = content; // Use innerHTML to render HTML tags

  messagesContainer.appendChild(messageElement);
  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  saveMessageToLocal(content, isUser);
}


// Function to extract text content from the webpage
function extractPageContent() {
  const elementsToExclude = [
    "script", "style", "noscript", "iframe", "svg",
    "nav", "footer", "header", "#page-assistant-panel", "#page-assistant-button"
  ];

  // Create a temporary element to hold content
  const tempElement = document.createElement("div");
  tempElement.innerHTML = document.body.innerHTML;

  // Remove excluded elements
  elementsToExclude.forEach(selector => {
    const elements = tempElement.querySelectorAll(selector);
    elements.forEach(el => el.remove());
  });

  // Get text content
  let content = tempElement.textContent || "";

  // Clean up whitespace
  content = content.replace(/\s+/g, " ").trim();

  return content.substring(0, 8000);
}

async function out_the_first_data() {
  const loadingElement = document.createElement("div");
  loadingElement.className = "page-assistant-loading";
  loadingElement.textContent = "Thinking...";
  document.getElementById("page-assistant-messages").appendChild(loadingElement);

  // Get page content
  const pageContent = extractPageContent();

  // Get AI response
  const aiResponse = await analyzePageContent("test", pageContent);
  const length = Object.keys(aiResponse).length;
  console.log("Raw AI Response:", aiResponse,length);
  // Remove loading and show respons
  if (length<2) {
    console.log("No job or internship information found.");
    blockDiv();
    loadingElement.remove();
    addMessage(aiResponse.message, false);
    return ;
  }
  loadingElement.remove();
  processJsonData(aiResponse);

  //Use the addMessage function from the previous response to display the result.

}
// Example usage:

async function handleUserMessage() {
  const inputElement = document.getElementById("page-assistant-input");
  const userMessage = inputElement.value.trim() || "";
  if (!userMessage) return;

  // Clear input and show user message
  inputElement.value = "";
  addMessage(userMessage, true);

  // Show loading
  const loadingElement = document.createElement("div");
  loadingElement.className = "page-assistant-loading";
  loadingElement.textContent = "Thinking...";
  document.getElementById("page-assistant-messages").appendChild(loadingElement);
  const pageContent = extractPageContent();
  // Get AI response
  const aiResponse = await analyzePageContent(userMessage, pageContent);
  console.log("Raw AI Response:", aiResponse);
  let formattedJob = aiResponse;
  // Remove loading and show respons


  //Use the addMessage function from the previous response to display the result.
  loadingElement.remove();
  processJsonData(formattedJob);
  // Send user message to Gemini AI and process response
}

// Initialize the extension
function init() {
  // Create the floating button
  createFloatingButton();
  // Inject CSS
  const style = document.createElement("style");
  style.textContent = `
    #page-assistant-button svg {
      color: white;
    }
    
    .page-assistant-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 15px;
      border-bottom: 1px solid #eee;
    }
    
    .page-assistant-header h3 {
      margin: 0;
      font-size: 16px;
    }
    
    .page-assistant-header button {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
    }
    
    #page-assistant-chat-container {
      flex: 1;
      overflow-y: auto;
      padding: 10px;
    }
    
    #page-assistant-messages {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .page-assistant-user-message,
    .page-assistant-ai-message {
      padding: 8px 12px;
      border-radius: 16px;
      max-width: 80%;
      word-wrap: break-word;
    }
    
    .page-assistant-user-message {
      align-self: flex-end;
      background-color: #4285F4;
      color: white;
    }
    
    .page-assistant-ai-message {
      align-self: flex-start;
      background-color: #f1f1f1;
    }
    
    .page-assistant-loading {
      align-self: flex-start;
      font-style: italic;
      color: #888;
      padding: 8px 12px;
    }
    
    .page-assistant-input-container {
      display: flex;
      padding: 10px;
      border-top: 1px solid #eee;
    }
    
    #page-assistant-input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 18px;
      resize: none;
      min-height: 40px;
      max-height: 120px;
    }
    
    #page-assistant-send {
      background-color: #4285F4;
      color: white;
      border: none;
      border-radius: 18px;
      padding: 0 16px;
      margin-left: 8px;
      cursor: pointer;
    }
  `;

  document.head.appendChild(style);
}



// Initialize floating button & sidebar
init();
function saveMessageToLocal(content, isUser) {
  let messages = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  // Add message with timestamp
  messages.push({
    content,
    isUser,
    timestamp: Date.now() // Store timestamp in milliseconds
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

function loadMessagesFromLocal() {
  let messages = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  let currentTime = Date.now();
  let expirationTime = EXPIRATION_DAYS * 24 * 60 * 60 * 1000; // Convert days to milliseconds

  let validMessages = messages.filter(msg => currentTime - msg.timestamp < expirationTime);

  // If some messages were removed, update localStorage
  if (validMessages.length !== messages.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validMessages));
  }
  console.log(JSON.stringify(validMessages[0].content));

  if (validMessages.length<2 && (validMessages[0].content.trim() === "This site does not contain job or internship information." || validMessages[0].content.trim() === "<strong>message:</strong></br> This site does not contain job or internship information.")) {
    addMessage1(validMessages[0].content, validMessages[0].isUser);
    blockDiv();
    return;
  }

  validMessages.forEach(msg => addMessage1(msg.content, msg.isUser));
}

// Load messages when page loads and clean up expired ones
document.addEventListener("DOMContentLoaded", loadMessagesFromLocal);

// Listen for sidebar opening to analyze page content only when needed
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "sidebarOpened") {
    analyzeAndDisplayContent();
  }
});


// Log message to indicate content script has loaded
chrome.runtime.sendMessage({ action: "log", data: "Content script loaded" });


document.addEventListener("DOMContentLoaded", function () {
  const button = document.getElementById("page-assistant-button");

  if (button) {
    button.addEventListener("click", function () {
      const pageText = extractPageContent() || "";
      analyzePageContent("Analyze this page", pageText).then(aiResponse => {
        addMessage(aiResponse);
      });
    });
  } else {
    console.error("Error: Button with ID 'page-assistant-button' not found.");
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "updateSidebar") {
    const { position, color } = message;

    // Update the sidebar button position
    const sidebarButton = document.getElementById("page-assistant-button");
    if (sidebarButton) {
      sidebarButton.style.position = "fixed";
      sidebarButton.style.backgroundColor = color;

      if (position === "left") {
        sidebarButton.style.left = "20px";
        sidebarButton.style.right = "";
      } else {
        sidebarButton.style.right = "20px";
        sidebarButton.style.left = "";
      }
    }
  }
});