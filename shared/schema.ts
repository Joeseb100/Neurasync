import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  profileImage: text("profile_image"),
  preferences: json("preferences").$type<{
    emailNotifications: boolean;
    stressAlerts: boolean;
    weeklyReports: boolean;
    therapyReminders: boolean;
  }>(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
});

// Stress records schema
export const stressRecords = pgTable("stress_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  stressLevel: integer("stress_level").notNull(),
  mood: text("mood"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertStressRecordSchema = createInsertSchema(stressRecords).pick({
  userId: true,
  stressLevel: true,
  mood: true,
});

// Emotion analysis schema
export const emotionAnalysis = pgTable("emotion_analysis", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  stressLevel: integer("stress_level").notNull(),
  primaryEmotion: json("primary_emotion").$type<{
    name: string;
    confidence: number;
  }>(),
  secondaryEmotion: json("secondary_emotion").$type<{
    name: string;
    confidence: number;
  }>(),
  insight: text("insight"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertEmotionAnalysisSchema = createInsertSchema(emotionAnalysis).pick({
  userId: true,
  stressLevel: true,
  primaryEmotion: true,
  secondaryEmotion: true,
  insight: true,
});

// Messages schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sender: text("sender").notNull(), // 'user' or 'ai'
  content: text("content").notNull(),
  suggestions: json("suggestions").$type<string[]>(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  userId: true,
  sender: true,
  content: true,
  suggestions: true,
});

// Therapy sessions schema
export const therapySessions = pgTable("therapy_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  duration: integer("duration").notNull(), // in minutes
  summary: text("summary"),
});

export const insertTherapySessionSchema = createInsertSchema(therapySessions).pick({
  userId: true,
  duration: true,
  summary: true,
});

// Songs schema
export const songs = pgTable("songs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  coverUrl: text("cover_url"),
  duration: integer("duration"), // in seconds
  mood: text("mood"),
});

export const insertSongSchema = createInsertSchema(songs).pick({
  title: true,
  artist: true,
  coverUrl: true,
  duration: true,
  mood: true,
});

// Playlists schema
export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
});

export const insertPlaylistSchema = createInsertSchema(playlists).pick({
  userId: true,
  name: true,
  description: true,
});

// Playlist songs (join table)
export const playlistSongs = pgTable("playlist_songs", {
  id: serial("id").primaryKey(),
  playlistId: integer("playlist_id").notNull(),
  songId: integer("song_id").notNull(),
});

export const insertPlaylistSongSchema = createInsertSchema(playlistSongs).pick({
  playlistId: true,
  songId: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertStressRecord = z.infer<typeof insertStressRecordSchema>;
export type StressRecord = typeof stressRecords.$inferSelect;

export type InsertEmotionAnalysis = z.infer<typeof insertEmotionAnalysisSchema>;
export type EmotionAnalysis = typeof emotionAnalysis.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertTherapySession = z.infer<typeof insertTherapySessionSchema>;
export type TherapySession = typeof therapySessions.$inferSelect;

export type InsertSong = z.infer<typeof insertSongSchema>;
export type Song = typeof songs.$inferSelect;

export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
export type Playlist = typeof playlists.$inferSelect;

export type InsertPlaylistSong = z.infer<typeof insertPlaylistSongSchema>;
export type PlaylistSong = typeof playlistSongs.$inferSelect;
