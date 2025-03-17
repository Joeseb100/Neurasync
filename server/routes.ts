import express, { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import { handleEmotionDetection } from "./api/vertexai";
import { generateAITherapyResponse } from "./api/openai";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Create API router
  const router = express.Router();

  // Mount router at /api
  app.use("/api", router);

  // User routes
  router.get("/user/profile", async (req: Request, res: Response) => {
    // For demo purposes, return the first user
    const user = await storage.getUser(1);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't return password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  router.patch("/user/profile", async (req: Request, res: Response) => {
    const { name, email } = req.body;
    const userId = 1; // For demo purposes
    
    const updatedUser = await storage.updateUser(userId, { name, email });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  });

  router.patch("/user/preferences", async (req: Request, res: Response) => {
    const { preferences } = req.body;
    const userId = 1; // For demo purposes
    
    const updatedUser = await storage.updateUser(userId, { preferences });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  });

  // Stress data routes
  router.get("/stress/weekly", async (req: Request, res: Response) => {
    const userId = 1; // For demo purposes
    
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const records = await storage.getStressRecordsByUserIdAndDateRange(
      userId,
      sevenDaysAgo,
      today
    );
    
    res.json(records);
  });

  router.get("/stress/monthly", async (req: Request, res: Response) => {
    const userId = 1; // For demo purposes
    
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const records = await storage.getStressRecordsByUserIdAndDateRange(
      userId,
      thirtyDaysAgo,
      today
    );
    
    res.json(records);
  });

  router.get("/stress/current", async (req: Request, res: Response) => {
    const userId = 1; // For demo purposes
    
    const latestRecord = await storage.getLatestStressRecord(userId);
    if (!latestRecord) {
      // Return a default response if no record exists
      return res.json({
        level: 0,
        mood: "Neutral",
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      level: latestRecord.stressLevel,
      mood: latestRecord.mood,
      timestamp: latestRecord.timestamp
    });
  });

  // Physiological data route (mock data for now)
  router.get("/physiological/current", async (req: Request, res: Response) => {
    // In a real app, this would come from a smartwatch or other sensors
    res.json({
      heartRate: 72,
      breathingRate: 16,
      timestamp: new Date().toISOString()
    });
  });

  // Emotion analysis routes
  router.post("/analysis/emotion", async (req: Request, res: Response) => {
    try {
      const { image } = req.body;
      
      if (!image) {
        return res.status(400).json({ message: "Image data is required" });
      }
      
      // Process the image with Vertex AI Vision
      const result = await handleEmotionDetection(image);
      res.json(result);
    } catch (error) {
      console.error("Error in emotion analysis:", error);
      res.status(500).json({ message: "Failed to analyze emotion" });
    }
  });

  router.post("/analysis/save", async (req: Request, res: Response) => {
    try {
      const userId = 1; // For demo purposes
      const { stressLevel, primaryEmotion, secondaryEmotion, insight } = req.body;
      
      // Save emotion analysis
      const analysis = await storage.createEmotionAnalysis({
        userId,
        stressLevel,
        primaryEmotion,
        secondaryEmotion,
        insight
      });
      
      // Also save as a stress record
      await storage.createStressRecord({
        userId,
        stressLevel,
        mood: primaryEmotion.name
      });
      
      res.json(analysis);
    } catch (error) {
      console.error("Error saving analysis:", error);
      res.status(500).json({ message: "Failed to save analysis" });
    }
  });

  router.get("/analysis/history", async (req: Request, res: Response) => {
    const userId = 1; // For demo purposes
    
    const analyses = await storage.getEmotionAnalysesByUserId(userId);
    res.json(analyses);
  });

  // AI Therapy routes
  router.get("/therapy/messages", async (req: Request, res: Response) => {
    const userId = 1; // For demo purposes
    
    // Get messages for the user
    const messages = await storage.getMessagesByUserId(userId);
    
    if (messages.length === 0) {
      // If no messages, create a welcome message
      const welcomeMessage = await storage.createMessage({
        userId,
        sender: "ai",
        content: "Hello! I'm your AI therapy assistant. How are you feeling today?",
        suggestions: []
      });
      
      return res.json([welcomeMessage]);
    }
    
    res.json(messages);
  });

  router.post("/therapy/message", async (req: Request, res: Response) => {
    try {
      const userId = 1; // For demo purposes
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Message content is required" });
      }
      
      // Save user message
      await storage.createMessage({
        userId,
        sender: "user",
        content
      });
      
      // Get previous messages for context
      const previousMessages = await storage.getMessagesByUserId(userId);
      
      // Format previous messages for the API
      const chatHistory = previousMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      
      // Get AI response with chat history for context
      const response = await generateAITherapyResponse(openai, content, chatHistory);
      
      // Save AI response
      const aiMessage = await storage.createMessage({
        userId,
        sender: "ai",
        content: response.reply,
        suggestions: response.suggestions
      });
      
      res.json(aiMessage);
    } catch (error) {
      console.error("Error in therapy message:", error);
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  router.get("/therapy/sessions", async (req: Request, res: Response) => {
    const userId = 1; // For demo purposes
    
    const sessions = await storage.getTherapySessionsByUserId(userId);
    res.json(sessions);
  });

  // Music recommendation routes
  router.get("/music/recommendations", async (req: Request, res: Response) => {
    // Get current mood from latest stress record
    const userId = 1; // For demo purposes
    const latestRecord = await storage.getLatestStressRecord(userId);
    
    let mood = "relaxed"; // Default mood
    if (latestRecord) {
      // Map stress level to mood
      if (latestRecord.stressLevel > 70) {
        mood = "calm"; // High stress needs calming music
      } else if (latestRecord.stressLevel > 30) {
        mood = "relaxed"; // Moderate stress needs relaxing music
      } else {
        mood = "energetic"; // Low stress can have more energetic music
      }
    }
    
    // Get songs for the mood
    let songs = await storage.getSongsByMood(mood);
    
    // If no songs for the specific mood, return all songs
    if (songs.length === 0) {
      songs = await storage.getSongs();
    }
    
    res.json(songs);
  });

  router.get("/music/playlists", async (req: Request, res: Response) => {
    const userId = 1; // For demo purposes
    
    const playlists = await storage.getPlaylistsByUserId(userId);
    
    // Add song count to each playlist
    const playlistsWithCounts = await Promise.all(
      playlists.map(async (playlist) => {
        const songs = await storage.getSongsByPlaylistId(playlist.id);
        return {
          ...playlist,
          songCount: songs.length
        };
      })
    );
    
    res.json(playlistsWithCounts);
  });

  router.get("/music/playlist/:id", async (req: Request, res: Response) => {
    const playlistId = parseInt(req.params.id);
    
    if (isNaN(playlistId)) {
      return res.status(400).json({ message: "Invalid playlist ID" });
    }
    
    const songs = await storage.getSongsByPlaylistId(playlistId);
    res.json(songs);
  });

  const httpServer = createServer(app);
  return httpServer;
}
