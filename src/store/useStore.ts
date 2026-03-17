import { create } from 'zustand';
import type { User, Room, ChatMessage, PlaybackState, RoomMember } from '@/types';

interface AppStore {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;

  // Rooms
  rooms: Room[];
  currentRoom: Room | null;
  setCurrentRoom: (room: Room | null) => void;
  addRoom: (room: Room) => void;

  // Chat
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;

  // Playback
  playback: PlaybackState;
  updatePlayback: (state: Partial<PlaybackState>) => void;

  // Presence
  members: RoomMember[];
  setMembers: (members: RoomMember[]) => void;
}

const demoUser: User = {
  id: 'u1',
  name: 'Alex Chen',
  email: 'alex@flickcall.com',
  avatar: undefined,
};

const demoRooms: Room[] = [
  {
    id: 'r1',
    slug: 'movie-night-42',
    title: 'Friday Movie Night',
    ottUrl: 'https://www.netflix.com/title/81767635',
    ottPlatform: 'Netflix',
    hostId: 'u1',
    hostName: 'Alex Chen',
    isActive: true,
    isPrivate: false,
    members: [],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'r2',
    slug: 'binge-crew',
    title: 'Binge Crew — Season Finale',
    ottUrl: 'https://www.primevideo.com/detail/0PXSB5G',
    ottPlatform: 'Prime Video',
    hostId: 'u2',
    hostName: 'Jordan Lee',
    isActive: true,
    isPrivate: true,
    members: [],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

export const useStore = create<AppStore>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false, currentRoom: null, messages: [] }),

  rooms: demoRooms,
  currentRoom: null,
  setCurrentRoom: (room) => set({ currentRoom: room }),
  addRoom: (room) => set((s) => ({ rooms: [room, ...s.rooms] })),

  messages: [],
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  clearMessages: () => set({ messages: [] }),

  playback: { currentTime: 0, isPlaying: false, duration: 7200, updatedAt: Date.now() },
  updatePlayback: (state) => set((s) => ({ playback: { ...s.playback, ...state, updatedAt: Date.now() } })),

  members: [
    { id: 'm1', userId: 'u1', name: 'Alex Chen', isReady: true, isHost: true, syncStatus: 'synced', joinedAt: new Date().toISOString() },
    { id: 'm2', userId: 'u2', name: 'Jordan Lee', isReady: true, isHost: false, syncStatus: 'synced', joinedAt: new Date().toISOString() },
    { id: 'm3', userId: 'u3', name: 'Sam Rivera', isReady: false, isHost: false, syncStatus: 'drifting', joinedAt: new Date().toISOString() },
  ],
  setMembers: (members) => set({ members }),
}));
