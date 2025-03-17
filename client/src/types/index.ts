// User types
export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  profileImage?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  emailNotifications: boolean;
  stressAlerts: boolean;
  weeklyReports: boolean;
  therapyReminders: boolean;
}

// Stress & emotion analysis types
export interface StressRecord {
  id: number;
  userId: number;
  stressLevel: number;
  mood: string;
  timestamp: string;
}

export interface CurrentStress {
  level: number;
  mood: string;
  timestamp: string;
}

export interface PhysiologicalData {
  heartRate: number;
  breathingRate: number;
  timestamp: string;
}

export interface EmotionDetection {
  name: string;
  confidence: number;
}

export interface EmotionAnalysis {
  stressLevel: number;
  primaryEmotion: EmotionDetection;
  secondaryEmotion: EmotionDetection;
  insight: string;
  timestamp: string;
}

export interface EmotionAnalysisHistory extends EmotionAnalysis {
  id: number;
  userId: number;
}

// AI Therapy types
export interface Message {
  id?: number;
  sender: 'user' | 'ai';
  content: string;
  timestamp?: string;
  suggestions?: string[];
}

export interface TherapySession {
  id: number;
  userId: number;
  date: string;
  duration: number;
  summary: string;
}

// Music recommendation types
export interface Song {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
  duration?: number;
  mood?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  songCount: number;
  coverUrl?: string;
}
