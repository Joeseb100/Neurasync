import OpenAI from "openai";

export async function generateAITherapyResponse(
  openai: OpenAI,
  userMessage: string
): Promise<{
  reply: string;
  suggestions?: string[];
}> {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a compassionate AI therapy assistant for Neurasync, a mental wellness platform. 
          Provide supportive, empathetic responses based on evidence-based therapeutic approaches. 
          Keep responses concise (under 150 words) but warm and helpful. 
          Include 2-4 practical suggestions when appropriate. 
          Never claim to be a licensed therapist or provide medical advice. 
          Format your response as JSON with 'reply' containing your main message and 'suggestions' 
          as an array of brief, actionable steps.`
        },
        {
          role: "user",
          content: userMessage
        }
      ],
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
