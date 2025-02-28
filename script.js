"use strict";
const summarizerToken = document.createElement("meta");
summarizerToken.httpEquiv = "origin-trial";
summarizerToken.content =
  "Ausmh05ogONpGo4U7XFFBZ0GLZQogcFwBLjQhRS8aHmLuAS9YfmQh50vayF+BgTS3cm2bzp48Z1qjWELDbr0KgAAAACHeyJvcmlnaW4iOiJodHRwczovL2FpLXBvd2VyZWQtdGV4dC1wcm9jZXNzb3ItY3I4LnZlcmNlbC5hcHA6NDQzIiwiZmVhdHVyZSI6IkFJU3VtbWFyaXphdGlvbkFQSSIsImV4cGlyeSI6MTc1MzE0MjQwMCwiaXNTdWJkb21haW4iOnRydWV9";
document.head.append(summarizerToken);

const translatorToken = document.createElement("meta");
translatorToken.httpEquiv = "origin-trial";
translatorToken.content =
  "ApAJNMYU1fd3V+7OQP5adSWpTr1gNwtTcrCNOW5R8hxDffA+AlHLcXEuaMpnzn8k0Q1M3WNHIm1dK4Q6ZFavmwAAAACDeyJvcmlnaW4iOiJodHRwczovL2FpLXBvd2VyZWQtdGV4dC1wcm9jZXNzb3ItY3I4LnZlcmNlbC5hcHA6NDQzIiwiZmVhdHVyZSI6IlRyYW5zbGF0aW9uQVBJIiwiZXhwaXJ5IjoxNzUzMTQyNDAwLCJpc1N1YmRvbWFpbiI6dHJ1ZX0=";
document.head.append(translatorToken);

const langDetectorToken = document.createElement("meta");
langDetectorToken.httpEquiv = "origin-trial";
langDetectorToken.content =
  "Aum04L0pxyAZyrIjegXnlawGDcrT4m5DXqIH4lo+S+IHJB6aOLFyib1zF/y6qQ2J+xVGra7p7NklSKdc4SDfHwwAAACJeyJvcmlnaW4iOiJodHRwczovL2FpLXBvd2VyZWQtdGV4dC1wcm9jZXNzb3ItY3I4LnZlcmNlbC5hcHA6NDQzIiwiZmVhdHVyZSI6Ikxhbmd1YWdlRGV0ZWN0aW9uQVBJIiwiZXhwaXJ5IjoxNzQ5NTk5OTk5LCJpc1N1YmRvbWFpbiI6dHJ1ZX0=";
document.head.append(langDetectorToken);

// Elements
const chatContainer = document.querySelector(".chat-container");
const languageSelect = document.getElementById("languages");
const languageDetected = document.querySelector(".language");
const translateBtn = document.querySelector(".translate-btn");
const summarizeBtn = document.querySelector(".summarize-btn");
const form = document.querySelector(".form");
const textInput = document.querySelector("textarea");
const sendBtn = document.querySelector(".send");
const displayMessage = document.querySelector(".message");

const timeStamp = new Date().toLocaleString("en-Us", {
  hour: "numeric",
  minute: "numeric",
  hour12: true,
});

let message;
let setLanguage;
let currUserInput = "";
let languageCode; // Holds detected language BCP 47 code
let translationLanguage; // Holds the actual selected language
let translationLanguageBCP47 = "en"; // Holds the bcp 47 value of user selected langauge
let defaultLanguage = "English";

languageSelect.addEventListener("change", () => {
  // Set variable with outer text when user select a language
  translationLanguage =
    languageSelect.options[languageSelect.selectedIndex].outerText;
  // Set variable with bcp 47 value when user select a language
  translationLanguageBCP47 = languageSelect.value;
});

const detectLanguage = async (text) => {
  if (!("ai" in self && "languageDetector" in self.ai)) {
    alert("This feature is not supported in this browser");
  } else {
    const languageDetectorCapabilities =
      await self.ai.languageDetector.capabilities();
    const canDetect = languageDetectorCapabilities.available;

    // Define an empty variable that will be modified later
    let detector;
    if (canDetect === "no") {
      // The language detector isn't usable.
      return;
    }
    if (canDetect === "readily") {
      // The language detector can immediately be used.
      detector = await self.ai.languageDetector.create();
    } else {
      // The language detector can be used after model download.
      detector = await self.ai.languageDetector.create({
        monitor(m) {
          m.addEventListener("downloadprogress", (e) => {
            console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
          });
        },
      });
      await detector.ready;
    }

    try {
      const detected = await detector.detect(text);

      // Loop through the array to check structure
      // detected.forEach((item, index) => {
      //   // console.log(`Item ${index}:`, item);
      // });

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

        // Update the set language variable with the detected language or default to unknown
        setLanguage = languageMap[detectedLanguage] || "Unknown";
        // Update language code variable with the bcp 47 code
        languageCode = detectedLanguage || "Unknown";
        // console.log("Detected Language:", detectedLanguage);
        // console.log(`Variable: ${setLanguage}`);
      } else {
        // console.log("No language detected");
      }
    } catch (error) {
      // console.error("Language detection failed:", error);
    }
  }
};

/////////////////////////////////////////////////////////////
// Create message element functionality
const createMessageElement = (message) => `
<div class="chat-message-container">
<div class="message-language-container">
<p class="message">${message.text}</p>
<div class="language-detect--time">Detected: ${message.language}
<p class="time-stamp">${message.timeStamp}</p>
</div>
</div>
</div>
`;

// Send message functionlity
const sendMessage = async (e) => {
  e.preventDefault();

  await detectLanguage(textInput.value);
  currUserInput = textInput.value;
  initializeSummerizer();

  const timeStamp = new Date().toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  const message = {
    text: textInput.value,
    language: setLanguage,
    timeStamp,
  };

  if (!message.text.trim()) return;
  chatContainer.innerHTML += createMessageElement(message);
  // scroll to top when message is loading
  chatContainer.scrollTop = chatContainer.scrollHeight;
  textInput.value = "";
};

/////////////////////////////////////////////////////////////
// Language summarizer functionality
let summarizer;

const summerizeHandler = async () => {
  const text = currUserInput;
  // Create parent container
  const loader = document.createElement("div");
  loader.classList.add("dot-loader");

  // Create child element
  const dot1 = document.createElement("span");
  const dot2 = document.createElement("span");
  const dot3 = document.createElement("span");

  // Append all child element
  loader.append(dot1, dot2, dot3);
  chatContainer.appendChild(loader);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const summary = await summarizer.summarize(text, {
    context: "This is just a random text from user input",
  });
  const refinedSummary = summary.replaceAll("- ", "");

  // Parent container
  const summaryMessageContainer = document.createElement("div");
  summaryMessageContainer.classList.add("response-container");

  // Child container of chat message container
  const summaryNoticeContainer = document.createElement("div");
  summaryNoticeContainer.classList.add("summary--notice-container");

  // Child of message language container
  const message = document.createElement("p");
  message.classList.add("message");
  message.textContent = refinedSummary;
  message.style.backgroundColor = "#ffffff";
  message.style.color = "#1F2937";

  // Child container of chat message container
  const noticeTimeStampContainer = document.createElement("div");
  noticeTimeStampContainer.classList.add("notice--timeStamp-container");

  // Child of message language container
  const notice = document.createElement("p");
  notice.classList.add("notice");
  notice.textContent = "Here is your summary 🔎";
  notice.style.color = "#6B7280";

  // Child of time stamp container
  const time = document.createElement("p");
  time.classList.add("time-stamp");
  time.textContent = new Date().toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  summaryNoticeContainer.appendChild(message);

  noticeTimeStampContainer.appendChild(notice);
  noticeTimeStampContainer.appendChild(time);

  summaryMessageContainer.appendChild(summaryNoticeContainer);
  summaryMessageContainer.appendChild(noticeTimeStampContainer);

  if (summary !== "") {
    loader.remove();
    chatContainer.appendChild(summaryMessageContainer);
  }

  chatContainer.scrollTop = chatContainer.scrollHeight;
  summarizeBtn.classList.add("hidden-btn");
};

const initializeSummerizer = async () => {
  // Split text by the empty string into an array
  const wordsArr = textInput.value.split(" ");

  // Display summarize button if text >= 150
  if (wordsArr.length >= 150) {
    summarizeBtn.classList.remove("hidden-btn");
  }

  // Summarizer object of options
  const options = {
    sharedContext: "Please summarize this text",
    type: "key-points",
    format: "plain-text",
    length: "short",
  };

  const available = (await self.ai.summarizer.capabilities()).available;

  //  Check if Summarizer API is available
  if (available === "no") {
    console.log("Summarizer API is not available");
    alert("Summarizer is not supported on this browser");
  }

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
  }

  summarizeBtn.removeEventListener("click", summerizeHandler);
  summarizeBtn.addEventListener("click", summerizeHandler);
};

// Call send message function on-click on send button/icon
form.addEventListener("submit", sendMessage);

/////////////////////////////////////////////////////////////
// Language translation functionality
// Empty translator variable
let translator;

const translateLanguage = async () => {
  if ("ai" in self && "translator" in self.ai) {
    // console.log("The Translator API is supported.");
    try {
      if (currUserInput) {
        // Create load, parent element
        const loader = document.createElement("div");
        loader.classList.add("dot-loader");

        // Create child element
        const dot1 = document.createElement("span");
        const dot2 = document.createElement("span");
        const dot3 = document.createElement("span");

        // Append all child element
        loader.append(dot1, dot2, dot3);
        chatContainer.appendChild(loader);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        const translatorCapabilities = await self.ai.translator.capabilities();
        const canTranslate = translatorCapabilities.available;

        if (canTranslate === "no") {
          console.log("Translator API is not not available");
        }

        if (canTranslate === "readily") {
          // The translator API can be used immediately
          // Create a translator that translates from the current language to a selected langauge.
          translator = await self.ai.translator.create({
            sourceLanguage: languageCode, //Get the current detected language (BCP 47 format)
            targetLanguage: translationLanguageBCP47, //Get the selected language for translation (BCP 47 format)
          });
        } else {
          // The translator API can be used after the model is downloaded
          translator = await self.ai.translator.create({
            sourceLanguage: languageCode, // Get the current detected language (BCP 47 format)
            targetLanguage: translationLanguageBCP47, // Get the selected language for translation (BCP 47 format)
            monitor(m) {
              m.addEventListener("downloadprogress", (e) => {
                console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
              });
            },
          });
          await translator.ready;
        }

        // Translate the user text
        const translate = await translator.translate(currUserInput);

        setTimeout(() => {
          // Create elements and append child
          // Parent container
          const translateMessageContainer = document.createElement("div");
          translateMessageContainer.classList.add(
            "translate-message-container",
            "response-container"
          );

          const translationNoticeContainer = document.createElement("div");
          translationNoticeContainer.classList.add(
            "translation--notice-container"
          );
          // Child of translation-notice container
          const translation = document.createElement("p");
          translation.classList.add("translation", "response");
          translation.textContent = translate;
          translation.style.backgroundColor = "#ffffff";
          translation.style.color = "#1F2937";
          // Child container of translate message container
          const noticeTimeStampContainer = document.createElement("div");
          noticeTimeStampContainer.classList.add("notice--timeStamp-container");
          // Child of notice timeStamp container
          const notice = document.createElement("p");
          notice.classList.add("notice");
          notice.textContent = `🌐🔁 Translation: ${
            translationLanguage ? translationLanguage : defaultLanguage
          }`;
          notice.style.color = "#6B7280";
          // Child of notice timeStamp container
          const time = document.createElement("p");
          time.classList.add("time-stamp");
          time.textContent = new Date().toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          });
          noticeTimeStampContainer.appendChild(notice);
          noticeTimeStampContainer.appendChild(time);
          translationNoticeContainer.appendChild(translation);
          translationNoticeContainer.appendChild(noticeTimeStampContainer);
          translateMessageContainer.appendChild(translationNoticeContainer);
          translateMessageContainer.appendChild(noticeTimeStampContainer);

          if (translate) {
            // Remove loader
            loader.remove(),
              chatContainer.appendChild(translateMessageContainer);
          }
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }, 1000);
      } else console.log("Can't translate user input is empty");
    } catch (error) {
      console.log("Translation failed:", error);
    }
  } else {
    console.log("The Translator API is not supported");
  }
};

translateBtn.addEventListener("click", translateLanguage);
