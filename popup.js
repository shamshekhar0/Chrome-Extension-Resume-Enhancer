// DOM Elements
const resumeUploadInput = document.getElementById("resume-upload");
const uploadContainer = document.getElementById("upload-container");
const resumeStatus = document.getElementById("resume-status");
const saveSettingsButton = document.getElementById("save-settings");
const buttonPositionSelect = document.getElementById("button-position");
const buttonColorInput = document.getElementById("button-color");
const statusDiv = document.getElementById("status");

let uploadedFileName = "";

// Handle upload click
uploadContainer.addEventListener("click", () => {
    resumeUploadInput.click();
});

// Handle resume upload
resumeUploadInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    uploadedFileName = file.name;
    resumeStatus.textContent = `Processing: ${uploadedFileName}`;

    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("http://localhost:5000/upload", {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        if (data.success) {
            const resumeText = data.text;
            chrome.storage.local.set(
                { "Resume_content": resumeText, "uploadedFileName": uploadedFileName },
                () => {
                    console.log("Resume saved!");
                    resumeStatus.textContent = `Uploaded: ${uploadedFileName}`;
                    resumeStatus.style.color = "#4CAF50";
                    alert("Resume converted and saved successfully!");
                }
            );
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error("Error processing file:", error);
        resumeStatus.textContent = `Failed to process: ${uploadedFileName}`;
        resumeStatus.style.color = "red";
        alert(`Error: ${error.message}`);
    }
});
saveSettingsButton.addEventListener("click", () => {
    const buttonPosition = buttonPositionSelect.value;
    const buttonColor = buttonColorInput.value;
  
    // Save settings to Chrome storage
    chrome.storage.local.set(
      { buttonPosition, buttonColor },
      () => {
        console.log("Settings saved!");
        statusDiv.textContent = "Settings saved successfully!";
        statusDiv.style.display = "block";
  
        // Apply the changes immediately
        applySidebarSettings(buttonPosition, buttonColor);
  
        setTimeout(() => {
          statusDiv.style.display = "none";
        }, 2000);
      }
    );
  });
  
  // Helper to read file content
  function readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file); // For PDF/DOCX, you'd need a parser library
    });
  }
  
  // Show notification
  function showNotification(message, isError = false) {
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.style.position = "fixed";
    notification.style.bottom = "20px";
    notification.style.left = "50%";
    notification.style.transform = "translateX(-50%)";
    notification.style.backgroundColor = isError ? "#FF5722" : "#4CAF50";
    notification.style.color = "#fff";
    notification.style.padding = "10px 20px";
    notification.style.borderRadius = "6px";
    notification.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
    notification.style.zIndex = "1000";
    document.body.appendChild(notification);
  
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
  
  // Apply sidebar settings (position and color)
  function applySidebarSettings(position, color) {
    // Send a message to the content script to update the sidebar
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "updateSidebar", position, color });
    });
  }
  
  // Load saved settings on popup load
  document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get(["buttonPosition", "buttonColor"], (result) => {
      if (result.buttonPosition) {
        buttonPositionSelect.value = result.buttonPosition;
      }
      if (result.buttonColor) {
        buttonColorInput.value = result.buttonColor;
      }
    });
  });