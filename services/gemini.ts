// This service now proxies through the backend to keep the API KEY secure.
const getHeaders = () => {
  const token = localStorage.getItem('streamai_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const generateMovieMetadata = async (title: string) => {
  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title })
    });

    if (!response.ok) throw new Error("AI Generation request failed");
    
    return await response.json();
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return {
      description: "A mysterious journey into the unknown awaits in this thrilling cinematic experience.",
      genre: ["Drama", "Mystery"],
      rating: "PG-13",
      year: 2024,
      tagline: "Watch it now.",
      duration: "1h 30m"
    };
  }
};