import { EmotionAnalysis } from "@/types";
import { apiRequest } from "./queryClient";

/**
 * Sends a base64 encoded image to the backend for emotion detection
 * Uses a multi-tiered approach with improved error handling and caching
 * 
 * @param base64Image - Base64 encoded image string without the data URL prefix
 * @returns Promise resolving to emotion analysis data
 */
export async function detectEmotion(base64Image: string): Promise<EmotionAnalysis> {
  // Create AbortController to handle timeouts
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    // First, try to use our built-in Express backend API
    try {
      const response = await apiRequest<EmotionAnalysis>(
        "/api/analysis/emotion", 
        { 
          method: "POST", 
          data: { image: base64Image },
          signal: controller.signal
        }
      );

      return response;
    } catch (primaryError: any) {
      // Only attempt fallback if it's not a user abort
      if (primaryError.name === 'AbortError') {
        throw new Error("Request timed out. Please try again with a smaller image or better connection.");
      }

      console.warn("Primary emotion detection failed, trying Streamlit fallback...", primaryError);

      // If the primary method fails, try to use the Streamlit app as a fallback
      try {
        // Determine if we're in development or production for proper URL construction
        const streamlitUrl = `${window.location.protocol}//${window.location.hostname}:8502/api/detect_emotion`;

        const streamlitResponse = await fetch(streamlitUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: base64Image }),
          signal: controller.signal
        });

        if (!streamlitResponse.ok) {
          throw new Error(`Streamlit fallback failed with status: ${streamlitResponse.status}`);
        }

        const streamlitData = await streamlitResponse.json();
        return streamlitData;
      } catch (streamlitError: any) {
        // Only log non-abort errors
        if (streamlitError.name !== 'AbortError') {
          console.error("Streamlit fallback also failed:", streamlitError);
        }

        // Re-throw the original error to be handled by the outer catch block
        throw primaryError;
      }
    }
  } catch (error: any) {
    console.error("All emotion detection methods failed:", error);

    // Provide more specific error messages based on error type
    if (error.name === 'AbortError') {
      throw new Error("Request timed out. The image may be too large or your connection too slow.");
    } else if (error.response && error.response.status === 413) {
      throw new Error("The image is too large. Please try with a smaller or more compressed image.");
    } else if (error.message && error.message.includes('Network Error')) {
      throw new Error("Network connection error. Please check your internet connection and try again.");
    } else {
      throw new Error("Failed to analyze facial expression. Please try again later or check if the analysis service is running.");
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Optimized version that supports image resizing before upload
 * 
 * @param imageSource - Either a base64 string or an HTMLImageElement to process
 * @param maxWidth - Maximum width to resize the image to (preserves aspect ratio)
 * @returns Promise resolving to emotion analysis data
 */
export async function detectEmotionOptimized(
  imageSource: string | HTMLImageElement,
  maxWidth: number = 640
): Promise<EmotionAnalysis> {
  let base64Image: string;

  // Process image source appropriately
  if (typeof imageSource === 'string') {
    // If already a base64 string, optimize it
    base64Image = await resizeBase64Image(imageSource, maxWidth);
  } else {
    // Convert HTML image element to optimized base64
    base64Image = await imageToResizedBase64(imageSource, maxWidth);
  }

  // Use the original function with the optimized image
  return detectEmotion(base64Image);
}

/**
 * Resizes a base64 image to a maximum width while preserving aspect ratio
 * 
 * @param base64 - Base64 encoded image string (can include data URL prefix)
 * @param maxWidth - Maximum width to resize to
 * @returns Promise resolving to optimized base64 string without data URL prefix
 */
async function resizeBase64Image(base64: string, maxWidth: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      // If image is already smaller than maxWidth, return original
      if (img.width <= maxWidth) {
        // Extract just the base64 data without the data URL prefix
        const base64Data = base64.includes('base64,') 
          ? base64.split('base64,')[1] 
          : base64;

        resolve(base64Data);
        return;
      }

      try {
        // Calculate new dimensions
        const scaleFactor = maxWidth / img.width;
        const height = Math.round(img.height * scaleFactor);

        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        canvas.width = maxWidth;
        canvas.height = height;

        // Draw and resize image on canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, maxWidth, height);

        // Get base64 data without prefix
        const resizedBase64 = canvas.toDataURL('image/jpeg', 0.85).split('base64,')[1];
        resolve(resizedBase64);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (err) => {
      reject(new Error("Failed to load image for resizing"));
    };

    // Handle both prefixed and non-prefixed base64 strings
    img.src = base64.includes('data:') 
      ? base64 
      : `data:image/jpeg;base64,${base64}`;
  });
}

/**
 * Converts an HTML Image element to an optimized base64 string
 * 
 * @param imgElement - HTML Image element to convert
 * @param maxWidth - Maximum width to resize to
 * @returns Promise resolving to base64 string without data URL prefix
 */
function imageToResizedBase64(imgElement: HTMLImageElement, maxWidth: number): Promise<string> {
  try {
    // Calculate new dimensions
    const width = Math.min(imgElement.width, maxWidth);
    const scaleFactor = width / imgElement.width;
    const height = Math.round(imgElement.height * scaleFactor);

    // Create canvas for resizing
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    // Draw and resize image on canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return Promise.reject(new Error("Could not get canvas context"));
    }

    ctx.drawImage(imgElement, 0, 0, width, height);

    // Get base64 data without prefix
    const base64Data = canvas.toDataURL('image/jpeg', 0.85).split('base64,')[1];
    return Promise.resolve(base64Data);
  } catch (err) {
    return Promise.reject(err);
  }
}