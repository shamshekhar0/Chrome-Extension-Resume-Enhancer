# Page Assistant Chrome Extension

## Overview
Page Assistant is a Chrome extension designed to analyze webpage content and provide AI-powered insights, particularly for job applications. It enables users to upload resumes, extract job-related information, and receive tailored recommendations.

## Features
- Floating button for easy access
- AI-powered analysis of job postings
- Resume upload and content extraction (PDF/DOCX)
- Local storage of chat history per webpage
- Interactive chat panel for user queries

## Tech Stack
- *Frontend:* JavaScript, HTML, CSS
- *Backend:* Python (Flask)
- *AI API:* Gemini AI
- *Storage:* Chrome Local Storage

## File Structure

root/
├── manifest.json       # Chrome extension metadata
├── api.js             # AI API integration
├── app.py             # Flask server for resume processing
├── background.js      # Background script for event handling
├── content.js         # Content script for injecting UI
├── popup.js           # Popup script for file uploads
├── style.css          # Styling for extension UI


## Installation
1. Clone the repository:
   sh
   git clone <repo-url>
   cd <project-folder>
   
2. Install Python dependencies:
   sh
   pip install flask flask-cors pymupdf python-docx
   
3. Start the Flask backend:
   sh
   python app.py

4. Add API key on api.js file 
   
5. Load the Chrome extension:
   - Open Chrome and go to chrome://extensions/
   - Enable Developer Mode (top-right corner)
   - Click "Load unpacked" and select the project folder
   
## Usage
1. Click on the floating button to open the assistant.
2. Upload your resume via the popup.
3. Navigate to a job listing and interact with the AI.
4. View extracted job details and resume recommendations.

## API Configuration
- Modify api.js to update the Gemini AI endpoint and API key:
  js
  window.API_CONFIG = {
      apiKey: "YOUR_API_KEY",
      apiEndpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
  };
  

## Contributions
Feel free to contribute by submitting issues or pull requests!

## License
This project is licensed under the MIT License.
