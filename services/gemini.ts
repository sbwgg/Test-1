export interface MovieMetadata {
  description: string;
  genre: string[];
  rating: string;
  year: number;
  duration: string;
}

// Mock implementation to replace AI functionality
export const generateMovieMetadata = async (title: string): Promise<MovieMetadata> => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    description: `This is a placeholder description for "${title}". AI generation is disabled. Please update this field with the actual movie plot.`,
    genre: ["Drama", "Action"],
    rating: "PG-13",
    year: new Date().getFullYear(),
    duration: "1h 55m"
  };
};