import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

async function main() {
  try {
    const models = await ai.models.list();

    console.log(models);
  } catch (e) {
    console.error(e);
  }
}

main();