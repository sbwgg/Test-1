import { GoogleGenAI, Type } from "@google/genai";

export interface MovieMetadata {
  description: string;
  genre: string[];
  rating: string;
  year: number;
  duration: string;
}

export const generateMovieMetadata = async (title: string): Promise<MovieMetadata> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Generate cinematic metadata for a movie titled "${title}".`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: {
            type: Type.STRING,
            description: "A captivating plot summary.",
          },
          genre: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of genres.",
          },
          rating: {
            type: Type.STRING,
            description: "MPAA rating.",
          },
          year: {
            type: Type.INTEGER,
            description: "Release year.",
          },
          duration: {
            type: Type.STRING,
            description: "Duration like '2h 15m'.",
          },
        },
        required: ["description", "genre", "rating", "year", "duration"],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Failed to generate metadata");
  }

  return JSON.parse(text) as MovieMetadata;
};