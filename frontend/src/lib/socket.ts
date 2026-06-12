import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    socket = io(WS_URL, {
      auth: { token },
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function connectSocket(token: string): Socket {
  const s = getSocket();
  if (s.auth) (s.auth as { token: string }).token = token;
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
    socket = null;
  }
}

export const SOCKET_EVENTS = {
  // Client → Server
  JOIN_STARTUP: 'join:startup',
  LEAVE_STARTUP: 'leave:startup',
  // Server → Client
  SIMULATION_TICK: 'simulation:tick',
  SIMULATION_EVENT: 'simulation:event',
  SIMULATION_STARTED: 'simulation:started',
  SIMULATION_PAUSED: 'simulation:paused',
  NOTIFICATION: 'notification',
  JOINED: 'joined',
} as const;
