import { GoogleGenAI, Type } from "@google/genai";

export interface MovieMetadata {
  description: string;
  genre: string[];
  rating: string;
  year: number;
  duration: string;
}

export const generateMovieMetadata = async (title: string): Promise<MovieMetadata> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing, falling back to mock data");
     return {
        description: `This is a placeholder description for "${title}". API Key is missing.`,
        genre: ["Drama", "Action"],
        rating: "PG-13",
        year: new Date().getFullYear(),
        duration: "1h 55m"
      };
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate metadata for a movie or TV series titled "${title}".`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              genre: { type: Type.ARRAY, items: { type: Type.STRING } },
              rating: { type: Type.STRING },
              year: { type: Type.INTEGER },
              duration: { type: Type.STRING },
            },
            required: ['description', 'genre', 'rating', 'year', 'duration'],
          },
        },
      });

      if (response.text) {
        return JSON.parse(response.text) as MovieMetadata;
      }
      throw new Error("Empty response from AI");

  } catch (error) {
      console.error("AI Generation failed:", error);
      // Fallback
      return {
        description: `Failed to generate description for "${title}".`,
        genre: ["Unknown"],
        rating: "NR",
        year: new Date().getFullYear(),
        duration: "0h 00m"
      };
  }
};
