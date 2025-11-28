import { GoogleGenAI } from "@google/genai";
import { DocumentChunk } from "../types";
import { cosineSimilarity } from "../utils/math";

// Initialize Gemini Client
// Note: We use process.env.API_KEY as strictly required.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const checkApiKey = () => {
  if (!process.env.API_KEY) {
    console.error("API Key is missing!");
    return false;
  }
  return true;
};

/**
 * Generates embeddings for a list of text chunks.
 * Uses 'text-embedding-004'.
 */
export const generateEmbeddings = async (chunks: string[]): Promise<DocumentChunk[]> => {
  if (!checkApiKey()) throw new Error("API Key is missing");

  const results: DocumentChunk[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunkText = chunks[i];
    
    // In a production app, we might batch these requests.
    // For this demo, we process sequentially to keep it simple and robust.
    try {
      const response = await ai.models.embedContent({
        model: "text-embedding-004",
        contents: chunkText,
      });

      // The response structure for embedContent in @google/genai
      // typically contains embeddings: [{ values: [...] }]
      // We need to safely access it.
      const embeddingValues = response.embeddings?.[0]?.values;

      if (embeddingValues) {
        results.push({
          id: `chunk-${i}-${Date.now()}`,
          text: chunkText,
          embedding: embeddingValues,
        });
      }
    } catch (error) {
      console.error(`Error embedding chunk ${i}:`, error);
    }
  }

  return results;
};

/**
 * Retrieves the most relevant chunks for a query using cosine similarity.
 */
export const retrieveContext = async (
  query: string,
  corpusChunks: DocumentChunk[],
  topK: number = 3
): Promise<DocumentChunk[]> => {
  if (!checkApiKey()) throw new Error("API Key is missing");

  // 1. Embed the query
  const response = await ai.models.embedContent({
    model: "text-embedding-004",
    contents: query,
  });

  const queryEmbedding = response.embeddings?.[0]?.values;

  if (!queryEmbedding) {
    throw new Error("Failed to generate embedding for query");
  }

  // 2. Calculate similarity for all chunks
  const scoredChunks = corpusChunks.map((chunk) => ({
    ...chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  // 3. Sort by score descending
  scoredChunks.sort((a, b) => b.score - a.score);

  // 4. Return top K
  return scoredChunks.slice(0, topK);
};

/**
 * Generates a response using the Gemini model, given the context.
 */
export const generateRAGResponse = async (
  query: string,
  contextChunks: DocumentChunk[]
): Promise<string> => {
  if (!checkApiKey()) throw new Error("API Key is missing");

  const contextText = contextChunks.map((c) => c.text).join("\n\n---\n\n");

  const systemInstruction = `Eres un asistente corporativo inteligente llamado "Cerebro".
  Tu tarea es responder preguntas de los empleados basándote EXCLUSIVAMENTE en el contexto proporcionado.
  
  Si la respuesta no está en el contexto, di amablemente que no tienes esa información en tu base de conocimientos.
  Mantén un tono profesional y útil.`;

  const prompt = `Contexto Corporativo Relevante:\n${contextText}\n\nPregunta del usuario:\n${query}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3, // Lower temperature for more factual responses
      }
    });

    return response.text || "Lo siento, no pude generar una respuesta.";
  } catch (error) {
    console.error("Error generating answer:", error);
    throw error;
  }
};
