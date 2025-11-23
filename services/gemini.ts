import { GoogleGenAI, Type } from "@google/genai";

export interface MovieMetadata {
  description: string;
  genre: string[];
  rating: string;
  year: number;
  duration: string;
}

export const generateMovieMetadata = async (title: string): Promise<MovieMetadata> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("API_KEY is missing in process.env. Falling back to mock data.");
      throw new Error("API Key missing");
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate metadata for the movie "${title}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            genre: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            rating: { type: Type.STRING },
            year: { type: Type.INTEGER },
            duration: { type: Type.STRING },
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as MovieMetadata;
    }

    throw new Error("No text returned from Gemini API");

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Return mock data on failure to keep the app functional
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          description: `This is a generated placeholder description for "${title}". It describes a thrilling journey filled with suspense, action, and emotion. Perfect for audiences who love high-stakes drama.`,
          genre: ["Drama", "Action"],
          rating: "PG-13",
          year: new Date().getFullYear(),
          duration: "1h 55m",
        });
      }, 600);
    });
  }
};