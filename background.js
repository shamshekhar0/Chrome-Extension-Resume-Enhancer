// Background script for the Page Assistant extension

// Listen for extension installation or update
chrome.runtime.onInstalled.addListener(() => {
  console.log("Page Assistant extension installed");
  
  // Initialize storage with default values
  chrome.storage.sync.get(
    {
      resumeData: null,
      resumeFileName: "",
      buttonPosition: "right",
      buttonColor: "#4285F4"
    },
    (items) => {
      // Only set defaults if values don't exist
      if (items.buttonPosition === undefined) {
        chrome.storage.sync.set({
          resumeData: null,
          resumeFileName: "",
          buttonPosition: "right",
          buttonColor: "#4285F4"
        });
      }
    }
  );
});

// Optional: Simple PDF text extraction simulation
// In a real extension, you'd use a library like pdf.js or a service
function simulateExtractTextFromPDF(pdfData) {
  // This is just a simulation - in reality, you'd need a proper PDF parser
  return "Simulated PDF text extraction";
}

// Optional: Simple DOCX text extraction simulation
function simulateExtractTextFromDOCX(docxData) {
  // This is just a simulation - in reality, you'd need a proper DOCX parser
  return "Simulated DOCX text extraction";
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "log") {
    console.log("Content script log:", message.data);
  }
  
  if (message.action === "extractResumeText") {
    // In a real extension, you would extract text from PDF/DOCX here
    let extractedText = "Could not extract text from the file.";
    
    if (message.fileType === "pdf") {
      extractedText = simulateExtractTextFromPDF(message.data);
    } else if (message.fileType === "docx") {
      extractedText = simulateExtractTextFromDOCX(message.data);
    }
    
    sendResponse({ text: extractedText });
  }
  
  // Always return true for async responses
  return true;
});
