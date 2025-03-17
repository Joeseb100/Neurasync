import axios from 'axios';
import { EmotionAnalysis } from '@shared/schema';

interface EmotionResult {
  name: string;
  confidence: number;
}

interface VertexAIResponse {
  predictions: Array<{
    confidences: number[];
    displayNames: string[];
  }>;
}

/**
 * Maps detected emotions to stress levels
 * Different emotions contribute differently to stress levels
 */
const emotionStressMap: Record<string, number> = {
  angry: 90,
  fear: 85,
  disgust: 75,
  sad: 70,
  surprise: 50,
  neutral: 30,
  happy: 15,
  joy: 10
};

/**
 * Provides insights based on detected emotions and stress levels
 */
function generateInsight(
  primaryEmotion: EmotionResult, 
  secondaryEmotion: EmotionResult, 
  stressLevel: number
): string {
  if (stressLevel > 70) {
    return `Your facial expressions indicate a high stress level. The primary emotion detected is ${primaryEmotion.name.toLowerCase()} (${primaryEmotion.confidence}% confidence), with ${secondaryEmotion.name.toLowerCase()} as a secondary emotion. Consider taking a short break for deep breathing or meditation to help reduce your stress.`;
  } else if (stressLevel > 30) {
    return `Your facial expressions indicate a moderate stress level. The primary emotion detected is ${primaryEmotion.name.toLowerCase()} (${primaryEmotion.confidence}% confidence), with ${secondaryEmotion.name.toLowerCase()} as a secondary emotion. You're managing well, but consider some relaxation techniques to maintain balance.`;
  } else {
    return `Your facial expressions indicate a low stress level. The primary emotion detected is ${primaryEmotion.name.toLowerCase()} (${primaryEmotion.confidence}% confidence), with ${secondaryEmotion.name.toLowerCase()} as a secondary emotion. You appear calm and relaxed. Continue with your current activities, as they seem to be supporting your well-being.`;
  }
}

/**
 * Handles emotion detection from a base64-encoded image using Vertex AI Vision
 */
export async function handleEmotionDetection(base64Image: string): Promise<EmotionAnalysis> {
  try {
    // Get the Vertex AI API key from environment variables
    const apiKey = process.env.VERTEX_AI_API_KEY || process.env.GOOGLE_CLOUD_API_KEY;
    
    if (!apiKey) {
      console.warn("No Vertex AI API key found, using mock emotion detection");
      return generateMockEmotionData();
    }

    // Vertex AI endpoint for image classification
    const endpoint = "https://us-central1-aiplatform.googleapis.com/v1/projects/your-project-id/locations/us-central1/endpoints/your-endpoint-id:predict";
    
    // Prepare the request payload
    const payload = {
      instances: [
        {
          content: base64Image,
          mimeType: "image/jpeg"
        }
      ]
    };
    
    // Make API call to Vertex AI
    const response = await axios.post(endpoint, payload, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Process the response
    const result = response.data as VertexAIResponse;
    return processEmotionResult(result);
    
  } catch (error) {
    console.error("Error in Vertex AI emotion detection:", error);
    
    // Fallback to mock data if the API call fails
    console.warn("Falling back to mock emotion detection due to API error");
    return generateMockEmotionData();
  }
}

/**
 * Process the Vertex AI response and generate emotion analysis
 */
function processEmotionResult(result: VertexAIResponse): EmotionAnalysis {
  try {
    // Extract emotions and confidences from the response
    const emotions: EmotionResult[] = [];
    const prediction = result.predictions[0];
    
    if (prediction && prediction.displayNames && prediction.confidences) {
      for (let i = 0; i < prediction.displayNames.length; i++) {
        emotions.push({
          name: prediction.displayNames[i],
          confidence: Math.round(prediction.confidences[i] * 100) // Convert to percentage
        });
      }
    }
    
    // Sort emotions by confidence
    emotions.sort((a, b) => b.confidence - a.confidence);
    
    // Get the top two emotions
    const primaryEmotion = emotions[0] || { name: "Neutral", confidence: 50 };
    const secondaryEmotion = emotions[1] || { name: "Calm", confidence: 30 };
    
    // Calculate stress level based on emotions
    const stressLevel = calculateStressLevel(emotions);
    
    // Generate insight based on detected emotions
    const insight = generateInsight(primaryEmotion, secondaryEmotion, stressLevel);
    
    return {
      stressLevel,
      primaryEmotion,
      secondaryEmotion,
      insight,
      timestamp: new Date().toISOString(),
      id: 0,  // Will be set by storage
      userId: 1 // Default user ID for now
    };
  } catch (error) {
    console.error("Error processing emotion result:", error);
    return generateMockEmotionData();
  }
}

/**
 * Calculate stress level based on detected emotions
 */
function calculateStressLevel(emotions: EmotionResult[]): number {
  // If no emotions detected, return neutral stress level
  if (emotions.length === 0) {
    return 30;
  }
  
  // Calculate weighted stress level
  let totalStress = 0;
  let totalWeight = 0;
  
  for (let i = 0; i < Math.min(emotions.length, 3); i++) {
    const emotion = emotions[i];
    const weight = (100 - (i * 30)); // Decreasing weights for each emotion
    const stressContribution = emotionStressMap[emotion.name.toLowerCase()] || 30;
    
    totalStress += stressContribution * emotion.confidence * weight;
    totalWeight += emotion.confidence * weight;
  }
  
  const stressLevel = Math.round(totalStress / (totalWeight || 1));
  
  // Ensure the result is within 0-100 range
  return Math.min(100, Math.max(0, stressLevel));
}

/**
 * Generate mock emotion data for testing or when API is unavailable
 * This function should only be used as a fallback
 */
function generateMockEmotionData(): EmotionAnalysis {
  const emotions = ['neutral', 'happy', 'sad', 'surprised', 'angry', 'fear'];
  const randomIndex = Math.floor(Math.random() * emotions.length);
  const randomEmotion = emotions[randomIndex];
  
  const primaryEmotion = {
    name: randomEmotion.charAt(0).toUpperCase() + randomEmotion.slice(1),
    confidence: Math.floor(Math.random() * 40) + 60 // 60-99%
  };
  
  const secondaryIndex = (randomIndex + 1) % emotions.length;
  const secondaryEmotion = {
    name: emotions[secondaryIndex].charAt(0).toUpperCase() + emotions[secondaryIndex].slice(1),
    confidence: Math.floor(Math.random() * 30) + 20 // 20-49%
  };
  
  // Calculate stress level based on the emotion
  const stressLevel = emotionStressMap[randomEmotion] || 30;
  
  // Generate insight
  const insight = generateInsight(primaryEmotion, secondaryEmotion, stressLevel);
  
  return {
    stressLevel,
    primaryEmotion,
    secondaryEmotion,
    insight,
    timestamp: new Date().toISOString(),
    id: 0, // Will be set by storage
    userId: 1 // Default user ID for now
  };
}
