import { 
  User, InsertUser,
  StressRecord, InsertStressRecord,
  EmotionAnalysis, InsertEmotionAnalysis,
  Message, InsertMessage,
  TherapySession, InsertTherapySession,
  Song, InsertSong,
  Playlist, InsertPlaylist,
  PlaylistSong, InsertPlaylistSong
} from "@shared/schema";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Stress record operations
  getStressRecordsByUserId(userId: number): Promise<StressRecord[]>;
  getStressRecordsByUserIdAndDateRange(
    userId: number, 
    startDate: Date, 
    endDate: Date
  ): Promise<StressRecord[]>;
  createStressRecord(record: InsertStressRecord): Promise<StressRecord>;
  getLatestStressRecord(userId: number): Promise<StressRecord | undefined>;
  
  // Emotion analysis operations
  getEmotionAnalysesByUserId(userId: number): Promise<EmotionAnalysis[]>;
  createEmotionAnalysis(analysis: InsertEmotionAnalysis): Promise<EmotionAnalysis>;
  
  // Message operations
  getMessagesByUserId(userId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Therapy session operations
  getTherapySessionsByUserId(userId: number): Promise<TherapySession[]>;
  createTherapySession(session: InsertTherapySession): Promise<TherapySession>;
  
  // Song operations
  getSongs(): Promise<Song[]>;
  getSongsByMood(mood: string): Promise<Song[]>;
  createSong(song: InsertSong): Promise<Song>;
  
  // Playlist operations
  getPlaylistsByUserId(userId: number): Promise<Playlist[]>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  
  // Playlist song operations
  getPlaylistSongsByPlaylistId(playlistId: number): Promise<PlaylistSong[]>;
  getSongsByPlaylistId(playlistId: number): Promise<Song[]>;
  addSongToPlaylist(playlistSong: InsertPlaylistSong): Promise<PlaylistSong>;
  removeSongFromPlaylist(playlistId: number, songId: number): Promise<void>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private stressRecords: Map<number, StressRecord> = new Map();
  private emotionAnalyses: Map<number, EmotionAnalysis> = new Map();
  private messages: Map<number, Message> = new Map();
  private therapySessions: Map<number, TherapySession> = new Map();
  private songs: Map<number, Song> = new Map();
  private playlists: Map<number, Playlist> = new Map();
  private playlistSongs: Map<number, PlaylistSong> = new Map();
  
  private userIdCounter = 1;
  private stressRecordIdCounter = 1;
  private emotionAnalysisIdCounter = 1;
  private messageIdCounter = 1;
  private therapySessionIdCounter = 1;
  private songIdCounter = 1;
  private playlistIdCounter = 1;
  private playlistSongIdCounter = 1;

  constructor() {
    // Initialize with a default user
    this.createUser({
      username: "demo",
      password: "password",
      name: "Emily Chen",
      email: "emily@example.com"
    });
    
    // Initialize with sample songs
    this.createSong({
      title: "Calm Waters",
      artist: "Ambient Sounds",
      coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80",
      duration: 240,
      mood: "relaxed"
    });
    
    this.createSong({
      title: "Forest Dawn",
      artist: "Nature Sounds",
      coverUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80",
      duration: 320,
      mood: "calm"
    });
    
    this.createSong({
      title: "Meditation Journey",
      artist: "Guided Meditation",
      coverUrl: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80",
      duration: 600,
      mood: "relaxed"
    });
    
    this.createSong({
      title: "Gentle Piano",
      artist: "Classical Relaxation",
      coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80",
      duration: 420,
      mood: "calm"
    });
    
    // Create a sample playlist
    this.createPlaylist({
      userId: 1,
      name: "Relaxation Mix",
      description: "Calming sounds for stress relief"
    });
    
    // Add songs to playlist
    this.addSongToPlaylist({
      playlistId: 1,
      songId: 1
    });
    
    this.addSongToPlaylist({
      playlistId: 1,
      songId: 2
    });
    
    // Create some sample stress records for the past week
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      this.createStressRecord({
        userId: 1,
        stressLevel: Math.floor(Math.random() * 80) + 10, // Random stress level between 10-90
        mood: i % 2 === 0 ? "Relaxed" : "Neutral"
      });
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { 
      ...user, 
      id,
      profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80",
      preferences: {
        emailNotifications: true,
        stressAlerts: true,
        weeklyReports: true,
        therapyReminders: false
      }
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Stress record operations
  async getStressRecordsByUserId(userId: number): Promise<StressRecord[]> {
    return Array.from(this.stressRecords.values())
      .filter(record => record.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getStressRecordsByUserIdAndDateRange(
    userId: number, 
    startDate: Date, 
    endDate: Date
  ): Promise<StressRecord[]> {
    return Array.from(this.stressRecords.values())
      .filter(record => {
        const recordDate = new Date(record.timestamp);
        return record.userId === userId && 
               recordDate >= startDate && 
               recordDate <= endDate;
      })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async createStressRecord(record: InsertStressRecord): Promise<StressRecord> {
    const id = this.stressRecordIdCounter++;
    const newRecord: StressRecord = {
      ...record,
      id,
      timestamp: new Date().toISOString()
    };
    this.stressRecords.set(id, newRecord);
    return newRecord;
  }

  async getLatestStressRecord(userId: number): Promise<StressRecord | undefined> {
    const records = await this.getStressRecordsByUserId(userId);
    return records.length > 0 ? records[0] : undefined;
  }

  // Emotion analysis operations
  async getEmotionAnalysesByUserId(userId: number): Promise<EmotionAnalysis[]> {
    return Array.from(this.emotionAnalyses.values())
      .filter(analysis => analysis.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async createEmotionAnalysis(analysis: InsertEmotionAnalysis): Promise<EmotionAnalysis> {
    const id = this.emotionAnalysisIdCounter++;
    const newAnalysis: EmotionAnalysis = {
      ...analysis,
      id,
      timestamp: new Date().toISOString()
    };
    this.emotionAnalyses.set(id, newAnalysis);
    return newAnalysis;
  }

  // Message operations
  async getMessagesByUserId(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.userId === userId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const newMessage: Message = {
      ...message,
      id,
      timestamp: new Date().toISOString()
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  // Therapy session operations
  async getTherapySessionsByUserId(userId: number): Promise<TherapySession[]> {
    return Array.from(this.therapySessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createTherapySession(session: InsertTherapySession): Promise<TherapySession> {
    const id = this.therapySessionIdCounter++;
    const newSession: TherapySession = {
      ...session,
      id,
      date: new Date().toISOString()
    };
    this.therapySessions.set(id, newSession);
    return newSession;
  }

  // Song operations
  async getSongs(): Promise<Song[]> {
    return Array.from(this.songs.values());
  }

  async getSongsByMood(mood: string): Promise<Song[]> {
    return Array.from(this.songs.values())
      .filter(song => song.mood?.toLowerCase() === mood.toLowerCase());
  }

  async createSong(song: InsertSong): Promise<Song> {
    const id = this.songIdCounter++;
    const newSong: Song = {
      ...song,
      id
    };
    this.songs.set(id, newSong);
    return newSong;
  }

  // Playlist operations
  async getPlaylistsByUserId(userId: number): Promise<Playlist[]> {
    return Array.from(this.playlists.values())
      .filter(playlist => playlist.userId === userId);
  }

  async createPlaylist(playlist: InsertPlaylist): Promise<Playlist> {
    const id = this.playlistIdCounter++;
    const newPlaylist: Playlist = {
      ...playlist,
      id
    };
    this.playlists.set(id, newPlaylist);
    return newPlaylist;
  }

  // Playlist song operations
  async getPlaylistSongsByPlaylistId(playlistId: number): Promise<PlaylistSong[]> {
    return Array.from(this.playlistSongs.values())
      .filter(playlistSong => playlistSong.playlistId === playlistId);
  }

  async getSongsByPlaylistId(playlistId: number): Promise<Song[]> {
    const playlistSongs = await this.getPlaylistSongsByPlaylistId(playlistId);
    const songIds = playlistSongs.map(ps => ps.songId);
    return Array.from(this.songs.values())
      .filter(song => songIds.includes(song.id));
  }

  async addSongToPlaylist(playlistSong: InsertPlaylistSong): Promise<PlaylistSong> {
    const id = this.playlistSongIdCounter++;
    const newPlaylistSong: PlaylistSong = {
      ...playlistSong,
      id
    };
    this.playlistSongs.set(id, newPlaylistSong);
    return newPlaylistSong;
  }

  async removeSongFromPlaylist(playlistId: number, songId: number): Promise<void> {
    const playlistSong = Array.from(this.playlistSongs.values())
      .find(ps => ps.playlistId === playlistId && ps.songId === songId);
    
    if (playlistSong) {
      this.playlistSongs.delete(playlistSong.id);
    }
  }
}

// Create and export the storage instance
export const storage = new MemStorage();
