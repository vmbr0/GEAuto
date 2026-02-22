import axios from "axios";

const LIBRETRANSLATE_URL = process.env.LIBRETRANSLATE_API_URL || "https://libretranslate.com/translate";
const LIBRETRANSLATE_API_KEY = process.env.LIBRETRANSLATE_API_KEY || "";

export async function translateToPolish(text: string): Promise<string> {
  try {
    const response = await axios.post(
      LIBRETRANSLATE_URL,
      {
        q: text,
        source: "fr",
        target: "pl",
        format: "text",
      },
      {
        headers: {
          "Content-Type": "application/json",
          ...(LIBRETRANSLATE_API_KEY && { "Authorization": `Bearer ${LIBRETRANSLATE_API_KEY}` }),
        },
      }
    );

    return response.data.translatedText || text;
  } catch (error) {
    console.error("Translation error:", error);
    // Fallback: return original text if translation fails
    return text;
  }
}

export async function translateToFrench(text: string): Promise<string> {
  try {
    const response = await axios.post(
      LIBRETRANSLATE_URL,
      {
        q: text,
        source: "pl",
        target: "fr",
        format: "text",
      },
      {
        headers: {
          "Content-Type": "application/json",
          ...(LIBRETRANSLATE_API_KEY && { "Authorization": `Bearer ${LIBRETRANSLATE_API_KEY}` }),
        },
      }
    );

    return response.data.translatedText || text;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
}
