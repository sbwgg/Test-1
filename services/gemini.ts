
export interface MovieMetadata {
  description: string;
  genre: string[];
  rating: string;
  year: number;
  duration: string;
}

export const generateMovieMetadata = async (title: string): Promise<MovieMetadata> => {
  // Mock implementation since @google/genai was removed
  console.log(`Generating mock metadata for: ${title}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    description: `This is a placeholder description for "${title}". The AI generation library has been removed.`,
    genre: ["Drama", "Action"],
    rating: "PG-13",
    year: new Date().getFullYear(),
    duration: "1h 55m"
  };
};
