export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Room {
  id: string;
  slug: string;
  title: string;
  ottUrl?: string;
  ottPlatform?: string;
  hostId: string;
  hostName: string;
  isActive: boolean;
  isPrivate: boolean;
  members: RoomMember[];
  createdAt: string;
}

export interface RoomMember {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  isReady: boolean;
  isHost: boolean;
  syncStatus: 'synced' | 'drifting' | 'disconnected';
  joinedAt: string;
}

export interface PlaybackState {
  currentTime: number;
  isPlaying: boolean;
  duration: number;
  updatedAt: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: 'user' | 'system';
  createdAt: string;
}

export type SyncStatus = 'perfect' | 'good' | 'drifting' | 'disconnected';
