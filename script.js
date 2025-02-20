"use strict";
const chatContainer = document.querySelector(".chat-container");
const languageSelector = document.querySelector("#languages");const languageDetected =  document.querySelector(".language");
const translateBtn = document.querySelector(".translate-btn");
const summarizeBtn = document.querySelector(".summarize-btn");
const form = document.querySelector(".form");
const textInput = document.querySelector("textarea");
const sendBtn = document.querySelector(".send");
const displayMessage = document.querySelector(".message");

const timeStamp = new Date().toLocaleString("en-Us", {hour: "numeric",  minute: "numeric", hour12: true});
let message;
// console.log(languageDetected);
let setLanguage;
const testing = "Testing"
let currUserInput = "";

const createMessageElement = (message) => `
<div class="chat-message-container">
<div class="message-language-container">
<p class="message">${message.text}</p>
<p class="language-detect">Detected Language: <span class=>${testing}</span></p>
</div>
<div class="time-stamp-container">
<p class="time-stamp">${message.timeStamp}</p>
</div>
</div>
`

// Send message function
const sendMessage = (e) => {
  e.preventDefault();
  detectLanguage(textInput.value);
  currUserInput = textInput.value;
  initializeSummerizer();
  console.log(setLanguage);
  
  const timeStamp = new Date().toLocaleString("en-US", {hour: "numeric", minute: "numeric", hour12: true});
  const message = {
    text: textInput.value,
    language: testing,
    timeStamp,
  }
  console.log(message)
  console.log(message.text);

  if (!message.text.trim()) return;
  chatContainer.innerHTML += createMessageElement(message)
  // scroll to top when new messages is added
  chatContainer.scrollTop = chatContainer.scrollHeight;
  textInput.value = "";
  console.log(currUserInput);
};

   let summarizer;

const summerizeHandler = async () => {
const text = currUserInput;
    console.log(text);
    const summary = await summarizer.summarize(text, {context: 'This is just a random text from user input'});
    
    
    // Parent container
    const chatMessageContainer = document.createElement("div");
    chatMessageContainer.classList.add("chat-message-container");
    
    // Child container of chat message container
    const messageLanguageContainer = document.createElement("div");
    messageLanguageContainer.classList.add("message-language-container");

    // Child of message language container
    const message = document.createElement("p");
    message.classList.add("message");
    message.textContent = summary;
    message.style.backgroundColor = '#ffffff';
    message.style.color = '#1F2937';

    // Child of message language container
    const summaryResult = document.createElement("p");
    summaryResult.classList.add("summary-result");
    summaryResult.textContent = "Here is your summary 🔎"
    summaryResult.style.color = '#6B7280';
    
    // Child container of chat message container
    const timeStampContainer = document.createElement("div");
    timeStampContainer.classList.add("time-stamp-container");
    // Child of time stamp container
    const time =document.createElement("p");
    time.classList.add("time-stamp");
    time.textContent = new Date().toLocaleString("en-US", {hour: "numeric", minute: "numeric", hour12: true});
    
    messageLanguageContainer.appendChild(message);
    messageLanguageContainer.appendChild(summaryResult);
    
    timeStampContainer.appendChild(time);
    
    chatMessageContainer.appendChild(messageLanguageContainer);
    chatMessageContainer.appendChild(timeStampContainer);
    
    
    if (summary !== "") {
    chatContainer.appendChild(chatMessageContainer);
  }

  chatContainer.scrollTop = chatContainer.scrollHeight;
  summarizeBtn.classList.add("hidden-btn");

};

const initializeSummerizer = async () => {
  // Split text by the empty string into an array
  const wordsArr = textInput.value.split(" ");
  console.log(wordsArr);
  console.log(currUserInput);

  // Display summarize button if text >= 150
  if (wordsArr.length >= 150) {
    summarizeBtn.classList.remove("hidden-btn");
  }

  // Summarizer object
   const options = {
     sharedContext: "Please summarize this text",
    type: "key-points",
    format: 'markdown',
    length: 'medium',
   };
   
   const available = (await self.ai.summarizer.capabilities()).available;
   console.log(available);
   
   //  Check if Summarizer API is available
   if(available === 'no') console.log("Summarizer API is not available");

   if (available === "readily") {
    // The Summarizer API can be used immediately
    summarizer = await self.ai.summarizer.create(options);
   } else {
    // The Summarizer API can be used after the model is downloaded.
    summarizer = await self.ai.summarizer.create(options);
    summarizer.addEventListener("downloadprogress", (e) => {
      console.log(e.loaded, e.total);
    });
    await summarizer.ready;
  };
  
  
  summarizeBtn.removeEventListener("click", summerizeHandler) 
  summarizeBtn.addEventListener("click", summerizeHandler) 
};


const detectLanguage = async (text) => {
  if ('ai' in self && 'languageDetector' in self.ai) {
    console.log("Language detector is available");
  
    try {
        const detector = await self.ai.languageDetector.create();
        console.log(detector);

        
        const detected = await detector.detect(text);
        console.log(detected);
        
        // Loop through the array to check structure
        detected.forEach((item, index) => {
          console.log(`Item ${index}:`, item);
        })
        
        if (detected.length > 0) {
          const detectedLanguage = detected[0].detectedLanguage;

          const languageMap = {
            en: "English",
            fr: "French",
            es: "Spanish",
            ru: "Russian",
            pt: "Portuguese",
            tr: "Turkish",
          };

          // Update the the variable with the detected language
          setLanguage = languageMap[detectedLanguage] || "Unknown";
          // language = languageMap[detectedLanguage] || "Unknown";
          console.log("Detected Language:", detectedLanguage);
          console.log(`Variable: ${setLanguage}`);
        } else {
          console.log("No language detected");
        }
      } catch (error) {
        console.error("Language detection failed:", error);
      }
    } else {
      console.log("Language Detector API not available.");
    }
  };
  
  

  form.addEventListener('submit', sendMessage);


  // const available = (await self.ai.summarizer.capabilities()).available();
  // console.log(available);

  if ('ai' in self && 'summarizer' in self.ai) {
   console.log("The Summarizer API is supported.");
  }