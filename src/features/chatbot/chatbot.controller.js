import axios from "axios";
import { franc } from "franc";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const LIBRETRANSLATE_API_URLS = [
  "https://libretranslate.de", // Primary public instance
  "https://translate.argosopentech.com", // Fallback public instance
];
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Map franc's ISO 639-3 codes to LibreTranslate's ISO 639-1 codes
const francToLibreMap = {
  eng: "en",
  fra: "fr",
  deu: "de",
  spa: "es",
  por: "pt",
  ita: "it",
  nld: "nl",
  pol: "pl",
  rus: "ru",
  jpn: "ja",
  zho: "zh",
  ara: "ar",
  hin: "hi",
  kor: "ko",
  swe: "sv",
  nor: "no",
  dan: "da",
  fin: "fi",
  ces: "cs",
  tur: "tr",
  ell: "el",
  heb: "he",
  vie: "vi",
  ind: "id",
  tha: "th",
  ron: "ro",
  ben: "bn",
  tam: "ta",
  tel: "te",
  mar: "mr",
  guj: "gu",
  kan: "kn",
  mal: "ml",
  pan: "pa",
  urd: "ur",
  swa: "sw",
  amh: "am",
  yid: "yi",
  fas: "fa",
};

function getLibreLang(francLang) {
  return francToLibreMap[francLang] || "en"; // Fallback to English
}

// Function to translate text using LibreTranslate
async function translateText(text, sourceLang, targetLang, retries = 5, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    for (const url of LIBRETRANSLATE_API_URLS) {
      try {
        const response = await axios.post(
          `${url}/translate`,
          {
            q: text,
            source: sourceLang === "auto" ? "auto" : sourceLang,
            target: targetLang,
            format: "text",
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 15000, // Increased timeout
          }
        );
        return {
          text: response.data.translatedText,
          detectedSourceLanguage: response.data.detectedLanguage?.language || sourceLang,
        };
      } catch (error) {
        console.warn(`Translation attempt ${i + 1} failed for ${url}: ${error.message}`);
        if (i < retries - 1) {
          const waitTime = delay * Math.pow(2, i);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }
    }
  }
  throw new Error("All translation attempts failed");
}

// Function to detect language using LibreTranslate
async function detectLanguage(text, retries = 5, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    for (const url of LIBRETRANSLATE_API_URLS) {
      try {
        const response = await axios.post(
          `${url}/detect`,
          {
            q: text,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 15000, // Increased timeout
          }
        );
        const detectedLang = response.data[0].language;
        console.log(`LibreTranslate detected language: ${detectedLang} (via ${url})`);
        return detectedLang;
      } catch (error) {
        console.warn(`Language detection attempt ${i + 1} failed for ${url}: ${error.message}`);
        if (i < retries - 1) {
          const waitTime = delay * Math.pow(2, i);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }
    }
  }
  throw new Error("All language detection attempts failed");
}

// Gemini API call
async function callGeminiWithRetry(englishText, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const prompt = `
        Analyze the user input and return a JSON object with the following fields:
        - category: "sport" or "onlineGame"
        - sport: name of the sport (e.g., "cricket") or null if not a sport
        - gameName: name of the game (e.g., "Fortnite") or null if not a game
        - device: device used (e.g., "PC") or null
        - type: "player" or "team" based on whether the query seeks individual players or teams
        - city: city name (e.g., "Bhopal") or null
        - intent: "findPlayersAndRedirect" if the user wants to find players or teams in a specific location, otherwise null
        Instructions:
        - If the input mentions finding or searching for players or teams (e.g., "find teams", "looking for players") and specifies a sport/game and a city, set intent to "findPlayersAndRedirect".
        - Normalize city names to lowercase (e.g., "Bhopal" becomes "bhopal").
        - Ensure type is "team" if the query explicitly mentions teams, otherwise default to "player".
        Example input: "find teams who play cricket and are from Bhopal"
        Example output: {
          "category": "sport",
          "sport": "cricket",
          "gameName": null,
          "device": null,
          "type": "team",
          "city": "bhopal",
          "intent": "findPlayersAndRedirect"
        }
        Input: ${englishText}
      `;
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
            responseMimeType: "application/json",
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );
      return response;
    } catch (apiErr) {
      console.error(`Gemini API attempt ${i + 1} failed:`, apiErr.message, apiErr.response?.data);
      if (apiErr.response?.status === 429 && i < retries - 1) {
        const waitTime = delay * Math.pow(2, i);
        console.warn(`Rate limit hit, retrying after ${waitTime}ms...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }
      throw apiErr;
    }
  }
}

function sanitizeJsonString(text) {
  if (!text) return null;
  let cleaned = text.replace(/```json\n|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}") + 1;
  if (start === -1 || end === 0) {
    console.error("No valid JSON object found in:", cleaned);
    return null;
  }
  cleaned = cleaned.substring(start, end);
  cleaned = cleaned.replace(/([{,]\s*)(\w+)(:)/g, '$1"$2"$3');
  cleaned = cleaned.replace(/,(\s*[}\]])/g, "$1");
  return cleaned;
}

export default async function ask(req, res) {
  const { userSpeechText } = req.body;
  const { uId, tId } = req.params;

  if (!userSpeechText || typeof userSpeechText !== "string") {
    return res.status(400).json({
      error: "Missing or invalid userSpeechText",
    });
  }

  let detectedLang;
  try {
    // Detect language
    try {
      detectedLang = await detectLanguage(userSpeechText);
    } catch (detectErr) {
      console.warn("LibreTranslate detection failed, falling back to franc:", detectErr.message);
      const francResult = franc(userSpeechText, { minLength: 3 });
      detectedLang = francResult === "und" ? "en" : getLibreLang(francResult);
      console.log("Franc detected language:", francResult, "mapped to:", detectedLang);
    }

    // Translate to English
    let englishText;
    let translationFailed = false;
    try {
      if (detectedLang === "en") {
        englishText = userSpeechText;
      } else {
        const translated = await translateText(userSpeechText, detectedLang, "en");
        englishText = translated.text;
      }
      console.log("Translated text:", englishText);
    } catch (transErr) {
      translationFailed = true;
      console.error("Translation error:", transErr);
      // Fallback: Use original text if translation fails, assuming detected language is correct
      englishText = userSpeechText;
      console.warn(`Falling back to original text in detected language (${detectedLang}):`, englishText);
    }

    if (!GEMINI_API_KEY) {
      const errorMsg = "API key missing. Please contact support.";
      return res.status(500).json({ error: errorMsg });
    }

    // Call Gemini API
    let geminiResponse;
    try {
      geminiResponse = await callGeminiWithRetry(englishText);
    } catch (apiErr) {
      console.error("Gemini API error:", apiErr.message, apiErr.response?.data);
      const errorMsg = "Failed to process query. Please try again.";
      if (detectedLang !== "en" && !translationFailed) {
        try {
          const translated = await translateText(errorMsg, "en", detectedLang);
          return res.status(500).json({ error: translated.text });
        } catch (e) {
          console.error("Error translating error message:", e);
        }
      }
      return res.status(500).json({ error: errorMsg });
    }

    const aiRawText =
      geminiResponse?.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    console.log("AI Raw Response:", aiRawText);
    if (!aiRawText) {
      const errorMsg = "No response from AI. Please try again.";
      if (detectedLang !== "en" && !translationFailed) {
        try {
          const translated = await translateText(errorMsg, "en", detectedLang);
          return res.status(500).json({ error: translated.text });
        } catch (e) {
          console.error("Error translating error message:", e);
        }
      }
      return res.status(500).json({ error: errorMsg });
    }

    // Sanitize and parse JSON
    const jsonStr = sanitizeJsonString(aiRawText);
    if (!jsonStr) {
      console.error("Invalid JSON after sanitization:", aiRawText);
      const errorMsg = "Failed to process AI response. Please try again.";
      if (detectedLang !== "en" && !translationFailed) {
        try {
          const translated = await translateText(errorMsg, "en", detectedLang);
          return res.status(400).json({ error: translated.text });
        } catch (e) {
          console.error("Error translating error message:", e);
        }
      }
      return res.status(400).json({ error: errorMsg });
    }

    let aiOutput;
    try {
      aiOutput = JSON.parse(jsonStr);
      console.log("AI Output:", aiOutput);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr, "Raw JSON:", jsonStr);
      const errorMsg = "Failed to process AI response. Please try again.";
      if (detectedLang !== "en" && !translationFailed) {
        try {
          const translated = await translateText(errorMsg, "en", detectedLang);
          return res.status(400).json({ error: translated.text });
        } catch (e) {
          console.error("Error translating error message:", e);
        }
      }
      return res.status(400).json({ error: errorMsg });
    }

    const { category, sport, gameName, type, city, intent } = aiOutput;

    // Fallback logic: Infer intent if necessary fields are present
    const inferredIntent =
      intent === "findPlayersAndRedirect" ||
      ((sport || gameName) && city && type && englishText.toLowerCase().includes("find"))
        ? "findPlayersAndRedirect"
        : null;

    if (inferredIntent === "findPlayersAndRedirect") {
      const play = category === "sport" ? sport : gameName;

      if (!play || !city) {
        const errorMsg = "Missing sport/game or city information.";
        if (detectedLang !== "en" && !translationFailed) {
          try {
            const translated = await translateText(errorMsg, "en", detectedLang);
            return res.status(400).json({ error: translated.text });
          } catch (e) {
            console.error("Error translating error message:", e);
          }
        }
        return res.status(400).json({ error: errorMsg });
      }

      const userType = type ? type.toLowerCase() : "player";
      let redirectUrl;
      if (userType === "team") {
        redirectUrl = `/filteredTeams/${uId}/${tId}/${encodeURIComponent(play)}/${encodeURIComponent(city)}`;
      } else {
        redirectUrl = `/filteredUsers/${uId}/${tId}/${encodeURIComponent(play)}/${encodeURIComponent(city)}`;
      }

      const replyMsg = "Here is the link for your destination";
      if (detectedLang !== "en" && !translationFailed) {
        try {
          const translatedReply = await translateText(replyMsg, "en", detectedLang);
          return res.status(200).json({
            text: translatedReply.text,
            link: redirectUrl,
          });
        } catch (e) {
          console.error("Error translating reply message:", e);
        }
      }

      return res.status(200).json({
        text: replyMsg,
        link: redirectUrl,
      });
    }

    // If intent is not findPlayersAndRedirect, return error
    const errorMsg = "Sorry, currently the chatbot is not designed to answer advanced queries.";
    if (detectedLang !== "en" && !translationFailed) {
      try {
        const translated = await translateText(errorMsg, "en", detectedLang);
        return res.status(400).json({ error: translated.text });
      } catch (e) {
        console.error("Error translating error message:", e);
      }
    }
    return res.status(400).json({ error: errorMsg });
  } catch (err) {
    console.error("Chatbot Error:", err);
    const errorMsg = "An unexpected error occurred. Please try again.";
    if (detectedLang && detectedLang !== "en" && !translationFailed) {
      try {
        const translated = await translateText(errorMsg, "en", detectedLang);
        return res.status(500).json({ error: translated.text });
      } catch (e) {
        console.error("Error translating error message:", e);
      }
    }
    return res.status(500).json({ error: errorMsg });
  }
}