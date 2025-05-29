const STORAGE_KEY = `chatMessages_${window.location.hostname}`;
const EXPIRATION_DAYS = 3;
window.API_CONFIG = {
    apiKey: "Enter_Your_Secrect_apiKey",
    apiEndpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
};
let resumeData = "";
chrome.storage.local.get(["Resume_content"], function (result) {
    if (chrome.runtime.lastError) {
        console.error("Error retrieving data:", chrome.runtime.lastError);
    } else {
        resumeData = result.Resume_content;
    }
});
let messages = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let currentTime = Date.now();
let expirationTime = EXPIRATION_DAYS * 24 * 60 * 60 * 1000; // Convert days to milliseconds

let validMessages = messages.filter(msg => currentTime - msg.timestamp < expirationTime);
let previousChatData = validMessages.map(msg => msg.content);
console.log("Previous chat data:", previousChatData);
window.analyzePageContent = async function analyzePageContent(userMessage, pageContent) {
    let promptText = `Answer only for the user request. Do not include any additional context beyond the user request. 
    If the user asks for resume content, use the provided resume data to generate a response strictly based on that resume. 
    If resume data is available and relevant to the request, include it in the answer.Additionally, if previous chat data is available 
    and contains resume suggestions, resume scores, or similar evaluation details, use that previous chat data as a reference to 
    generate the response accurately. Return the output strictly in JSON format without any additional content styling 
    (e.g., no bold or italic formatting). Use colons and commas to separate values. If the job title is present but key details 
    are missing, infer the missing information based on industry standards. 
    User Request: ${userMessage} Resume Data: ${resumeData} Job Posting Content: ${pageContent} 
    Previous Chat Data: ${previousChatData}` ;
    if (userMessage.toLowerCase() === "test") {
        promptText = `
        strictly fllow this :If no job or intern application   is found,striclty  return: this only with out any addtional information{ "message": "This site does not contain job or internship information." }.return this dont check any other than this.or dont return an other than this
        Analyze the following webpage content and check if it contains job postings or internship opportunities. 
        If job or intern application is found, extract and summarize the job or internship details in a structured format.
        If no job or intern application is found, return: { "message": "This site does not contain job or internship information." }.
        Do not use any content styling (e.g., bold, italic), only structured JSON output.
        if it is as job or intern application page  Give response only for job or intern application site other wise dont give any response.
        if a resume is provided and it is a job or intern application page then , assess its alignment with any job descriptions found, provide a resumescore (0-100),
        
                    and offer actionable suggestions for improvement my resume in points numbered to 1-n.
                    
                    Analyze the provided resume and evaluate its relevance to job postings or internship opportunities.  
                    

                    Additionally,   

                    Return all responses strictly in JSON format without any content styling (e.g., bold, italic).  

                        Resume Data:  
                        ${resumeData}  

                        Job Posting Content:  
                        ${pageContent}`;
    }


    const requestBody = {
        contents: [{ role: "user", parts: [{ text: promptText }] }]
    };

    try {
        const response = await fetch(`${window.API_CONFIG.apiEndpoint}?key=${window.API_CONFIG.apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (data && data.candidates && data.candidates[0] && data.candidates[0].content) {
            let aiResponse = data.candidates[0].content.parts[0].text.trim();

            // 🔹 Remove markdown JSON formatting if present
            if (aiResponse.startsWith("```json")) {
                aiResponse = aiResponse.replace(/^```json|```$/g, "").trim();
            }

            if (aiResponse.startsWith("```json")) {
                aiResponse = aiResponse.replace(/^```json\s*|```$/g, "").trim();
            }
            
            // Ensure the AI response is valid JSON before parsing
            try {
                console.log("Raw AI Response:", aiResponse);  // Debugging log
                return JSON.parse(aiResponse);
            } catch (parseError) {
                console.error("Error parsing AI response as JSON:", parseError, "Response:", aiResponse);
                return { message: "AI response is not valid JSON.", rawResponse: aiResponse };
            }
            
        } else {
            return { "message": "This site does not contain job or internship information." };
        }
    } catch (error) {
        console.error("Error fetching AI response:", error);
        return { message: "There was an error processing your request." };
    }
};




chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "analyzePageContent") {
        analyzePageContent(message.pageContent).then(response => sendResponse({ response }));
        return true;
    }
});

