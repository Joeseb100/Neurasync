import { EmotionAnalysis } from "@/types";
import { apiRequest } from "./queryClient";

/**
 * Sends a base64 encoded image to the backend for emotion detection
 * Uses a multi-tiered approach:
 * 1. First tries the built-in Express backend API endpoint
 * 2. Falls back to the Streamlit app endpoint if available 
 * 3. Has further fallbacks in the Express backend if those fail
 */
export async function detectEmotion(base64Image: string): Promise<EmotionAnalysis> {
  try {
    // First, try to use our built-in Express backend API
    try {
      const response = await apiRequest<EmotionAnalysis>(
        "/api/analysis/emotion", 
        { 
          method: "POST", 
          data: { image: base64Image } 
        }
      );
      
      return response;
    } catch (primaryError) {
      console.warn("Primary emotion detection failed, trying Streamlit fallback...", primaryError);
      
      // If the primary method fails, try to use the Streamlit app as a fallback
      // The Streamlit app runs on port 8501 by default
      try {
        const streamlitUrl = `${window.location.protocol}//${window.location.hostname}:8501/api/detect_emotion`;
        const streamlitResponse = await fetch(streamlitUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: base64Image }),
        });
        
        if (!streamlitResponse.ok) {
          throw new Error(`Streamlit fallback failed with status: ${streamlitResponse.status}`);
        }
        
        const streamlitData = await streamlitResponse.json();
        return streamlitData;
      } catch (streamlitError) {
        console.error("Streamlit fallback also failed:", streamlitError);
        // Re-throw the original error to be handled by the outer catch block
        throw primaryError;
      }
    }
  } catch (error) {
    console.error("All emotion detection methods failed:", error);
    throw new Error("Failed to analyze facial expression. Please try again later or check if the Streamlit app is running.");
  }
}
