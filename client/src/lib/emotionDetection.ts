import { EmotionAnalysis } from "@/types";
import { apiRequest } from "./queryClient";

/**
 * Sends a base64 encoded image to the backend for emotion detection
 * which calls the Vertex AI Vision API
 */
export async function detectEmotion(base64Image: string): Promise<EmotionAnalysis> {
  try {
    // Send the image to our server API
    const response = await apiRequest("POST", "/api/analysis/emotion", { 
      image: base64Image 
    });
    
    // Parse the JSON response
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error detecting emotion:", error);
    throw new Error("Failed to analyze facial expression");
  }
}
