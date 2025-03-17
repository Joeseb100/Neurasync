import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Content } from '@google/generative-ai';

// Therapeutic system prompt similar to the Streamlit example
const THERAPEUTIC_PROMPT = `
You are a supportive and empathetic therapeutic assistant called "Manassu" for Neurasync, a mental wellness platform.

Please respond to all queries with a warm, compassionate tone that encourages growth and self-reflection.
Use a conversational style that feels personal and caring.

Your responses should:
- Be supportive and non-judgmental
- Offer gentle encouragement and motivation
- Use empowering language that builds confidence
- Ask thoughtful questions that promote self-reflection when appropriate
- Acknowledge emotions and validate feelings
- Provide practical coping strategies when relevant
- Use a warm, conversational tone as if speaking to a friend

Keep responses concise (under 150 words) but warm and helpful.
Include 2-4 practical suggestions when appropriate.
Never claim to be a licensed therapist or provide medical advice.

Format your response with a main message and then 2-4 suggestions as bullet points if appropriate.

Remember to maintain boundaries by not diagnosing conditions or replacing professional mental health care.
`;

/**
 * Interface for chat history entries
 */
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Generate a therapeutic, empathetic AI response using Google's Gemini API
 * 
 * @param apiKey - Gemini API key
 * @param userMessage - The message from the user
 * @param chatHistory - Optional array of previous message objects
 * @returns Object with reply text and suggestions array
 */
export async function generateGeminiResponse(
  apiKey: string,
  userMessage: string,
  chatHistory?: ChatMessage[]
): Promise<{
  reply: string;
  suggestions?: string[];
}> {
  try {
    // Initialize the Google AI with API key
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Get the model - using Gemini 1.5 Pro
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    // Start a chat session
    const chat = model.startChat({
      history: formatChatHistory(chatHistory),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000
      }
    });
    
    // Prepare the message to send
    let promptToSend = userMessage;
    
    // If this is the first message, prepend the therapeutic system prompt
    if (!chatHistory || chatHistory.length === 0) {
      promptToSend = `${THERAPEUTIC_PROMPT}\n\nUser message: ${userMessage}`;
    }
    
    // Send message and get response
    const result = await chat.sendMessage(promptToSend);
    const text = result.response.text();
    
    // Parse the response for suggestions
    const { mainReply, suggestions } = extractSuggestions(text);
    
    return {
      reply: mainReply || text,
      suggestions: suggestions || []
    };
  } catch (error) {
    console.error("Error generating Gemini therapy response:", error);
    return {
      reply: "I'm sorry, I'm having trouble processing your message right now. Could you try again?",
      suggestions: ["Try refreshing the page", "Contact support if the problem persists"]
    };
  }
}

/**
 * Format chat history for Gemini API
 */
function formatChatHistory(history?: ChatMessage[]): Content[] {
  if (!history || history.length === 0) {
    return [];
  }
  
  // Ensure chat history starts with a user message
  let formattedHistory = [...history];
  if (formattedHistory[0].role !== 'user') {
    // Add a dummy user message at the beginning if needed
    formattedHistory.unshift({
      role: 'user',
      content: 'Hello'
    });
  }
  
  return formattedHistory.map(message => {
    return {
      role: message.role === 'user' ? 'user' : 'model',
      parts: [{ text: message.content }]
    };
  });
}

/**
 * Extract suggestions from AI response
 */
function extractSuggestions(text: string): { mainReply: string; suggestions: string[] } {
  // Default values
  let mainReply = text;
  let suggestions: string[] = [];
  
  // Look for bullet points, which likely indicate suggestions
  const bulletPointRegex = /[\n\r]+\s*[-•*]\s+(.+?)(?=[\n\r]+\s*[-•*]|$)/g;
  let match;
  const matches = [];
  while ((match = bulletPointRegex.exec(text)) !== null) {
    matches.push(match);
  }
  
  if (matches.length >= 2) {
    // Extract all bullet points as suggestions
    suggestions = matches.map(match => match[1].trim());
    
    // Remove the bullet points from the main reply
    const firstBulletIndex = text.indexOf(matches[0][0]);
    if (firstBulletIndex > 0) {
      mainReply = text.substring(0, firstBulletIndex).trim();
    }
  }
  
  return { mainReply, suggestions };
}