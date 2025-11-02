import { GoogleGenAI } from "@google/genai";

// Initialize the GoogleGenAI client once using the API_KEY from environment variables.
// This single instance will be used by all AI agents.
export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
