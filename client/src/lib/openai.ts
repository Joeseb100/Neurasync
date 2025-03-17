import { apiRequest } from "./queryClient";

/**
 * Sends a message to the OpenAI API through our backend
 */
export async function sendMessageToAI(message: string): Promise<{
  reply: string;
  suggestions?: string[];
}> {
  try {
    const response = await apiRequest("POST", "/api/therapy/message", { 
      message 
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending message to AI:", error);
    throw new Error("Failed to get AI response");
  }
}
