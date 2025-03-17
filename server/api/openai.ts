import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

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

Format your response as JSON with 'reply' containing your main message and 'suggestions' 
as an array of brief, actionable steps.

Remember to maintain boundaries by not diagnosing conditions or replacing professional mental health care.
`;

/**
 * Generate a therapeutic, empathetic AI response using OpenAI
 * 
 * @param openai - OpenAI client instance
 * @param userMessage - The message from the user
 * @param chatHistory - Optional array of previous message objects with {role, content}
 * @returns Object with reply text and suggestions array
 */
export async function generateAITherapyResponse(
  openai: OpenAI,
  userMessage: string,
  chatHistory?: {role: string, content: string}[]
): Promise<{
  reply: string;
  suggestions?: string[];
}> {
  try {
    // Prepare messages array with system prompt first
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: THERAPEUTIC_PROMPT
      }
    ];
    
    // Add chat history if provided
    if (chatHistory && chatHistory.length > 0) {
      // Convert to proper OpenAI message format
      const formattedHistory = chatHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));
      
      messages.push(...formattedHistory);
    }
    
    // Add the current user message
    messages.push({
      role: "user",
      content: userMessage
    });
    
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    try {
      const parsedResponse = JSON.parse(content);
      return {
        reply: parsedResponse.reply,
        suggestions: parsedResponse.suggestions || []
      };
    } catch (parseError) {
      // Fallback in case the response isn't valid JSON
      console.error("Error parsing OpenAI response:", parseError);
      return {
        reply: content,
        suggestions: []
      };
    }
  } catch (error) {
    console.error("Error generating AI therapy response:", error);
    return {
      reply: "I'm sorry, I'm having trouble processing your message right now. Could you try again?",
      suggestions: ["Try refreshing the page", "Contact support if the problem persists"]
    };
  }
}
