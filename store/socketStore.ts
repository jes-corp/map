import { create } from "zustand";
import { io, Socket } from "socket.io-client";

const API_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL;

export interface Event {
  id: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  datetime: string;
  icon: string;
  userId: string;
  attendees: { id: string; username: string; [key: string]: any }[]; // List of user objects attending
}

interface UserLocation {
  userId: string;
  lat: number;
  lng: number;
  username: string;
}

interface Response {
  success: boolean;
  message: string;
}
interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  events: Event[];
  otherUsers: Record<string, UserLocation>;

  // Actions
  connect: (token?: string) => void;
  disconnect: () => void;
  emitCreateEvent: (eventData: Omit<Event, "id" | "userId" | "attendees">) => Promise<Response>;
  emitUpdateEvent: (id: string, eventData: Partial<Omit<Event, "id" | "userId" | "attendees">>) => Promise<Response>;
  emitDeleteEvent: (id: string) => Promise<Response>;
  emitUpdateLocation: (location: { lat: number; lng: number }) => void;
  emitJoinEvent: (eventId: string) => void;
  emitLeaveEvent: (eventId: string) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  events: [],
  otherUsers: {},

  connect: (token?: string) => {
    try {
      const currentSocket = get().socket;

      if (currentSocket) {
        if (token) {
          console.log("Reconnecting with new token...");
          currentSocket.disconnect();
        } else {
          return;
        }
      }

      if (!API_URL) {
        console.warn("[Socket] No API_URL configured — running in offline mode");
        return;
      }

      console.log("Connecting to socket at:", API_URL, token ? "with token" : "as guest");

      const socketOptions: any = {
        // Fail fast — don't block the UI waiting for a dead server
        timeout: 3000,
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
      };
      if (token) {
        socketOptions.auth = { token: `Bearer ${token}` };
      }

      const socket = io(API_URL, socketOptions);

      socket.on("connect", () => {
        set({ isConnected: true });
        console.log("Socket connected:", socket.id);
      });

      socket.on("disconnect", () => {
        set({ isConnected: false });
        console.log("Socket disconnected");
      });

      socket.on("connect_error", (err) => {
        console.warn("[Socket] Connection error (app continues offline):", err.message);
      });

      socket.on("event_created", (newEvent: Event) => {
        set((state) => ({ 
          events: [{ ...newEvent, attendees: newEvent.attendees || [] }, ...state.events] 
        }));
      });

      socket.on("all_events", (allEvents: Event[]) => {
        set({ events: allEvents.map(e => ({ ...e, attendees: e.attendees || [] })) });
      });

      socket.on("event_updated", (updatedEvent: Event) => {
        set((state) => ({
          events: state.events.map(e => e.id === updatedEvent.id ? { ...updatedEvent, attendees: updatedEvent.attendees || [] } : e)
        }));
      });

      socket.on("events_deleted", (deletedIds: string[]) => {
        set((state) => ({
          events: state.events.filter(e => !deletedIds.includes(e.id))
        }));
      });

      socket.on("user_location_updated", (userData: UserLocation) => {
        set((state) => ({
          otherUsers: { ...state.otherUsers, [userData.userId]: userData },
        }));
      });

      set({ socket });
    } catch (err) {
      // FRONTEND-FIRST: if socket fails to initialize, app continues offline
      console.warn("[Socket] Failed to initialize — running in offline mode", err);
    }
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  emitCreateEvent: (eventData) => {
    const { socket } = get();
    if (!socket || !socket.connected) {
      // FRONTEND-FIRST: return success immediately — data is already in the store
      console.warn("[Socket] Offline — event saved locally only");
      return Promise.resolve({ success: false, message: "Sin conexión — guardado localmente" });
    }

    return new Promise((resolve) => {
      // 2s timeout — don't block the UI
      const timeout = setTimeout(() => {
        console.warn("[Socket] Server timeout — event saved locally");
        resolve({ success: false, message: "Timeout — guardado localmente" });
      }, 2000);

      socket.emit("create_event", eventData, (response: Response) => {
        clearTimeout(timeout);
        resolve(response || { success: true, message: "Evento creado" });
      });
    });
  },

  emitUpdateEvent: (id, eventData) => {
    const { socket } = get();
    if (!socket?.connected) return Promise.resolve({ success: false, message: "Sin conexión" });

    return new Promise((resolve) => {
      socket.emit("update_event", { id, updateEventDto: eventData }, (response: any) => {
        resolve(response?.success === false ? response : { success: true, message: "Evento actualizado" });
      });
    });
  },

  emitDeleteEvent: (id) => {
    const { socket } = get();
    if (!socket?.connected) return Promise.resolve({ success: false, message: "Sin conexión" });

    return new Promise((resolve) => {
      socket.emit("delete_event", id, (response: any) => {
        resolve(response?.success === false ? response : { success: true, message: "Evento eliminado" });
      });
    });
  },

  emitUpdateLocation: (location) => {
    try {
      const { socket } = get();
      if (socket?.connected) {
        socket.emit("update_location", location);
      }
    } catch {
      // Silently swallow — geolocation is non-critical
    }
  },

  emitJoinEvent: (eventId) => {
    const { socket } = get();
    if (socket?.connected) {
      socket.emit("join_event", { eventId });
    }
  },

  emitLeaveEvent: (eventId) => {
    const { socket } = get();
    if (socket?.connected) {
      socket.emit("leave_event", { eventId });
    }
  },
}));
