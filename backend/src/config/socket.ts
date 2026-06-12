import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { env } from './env';
import { verifyAccessToken } from '../modules/auth/auth.service';

let io: SocketIOServer;

export function initSocketIO(server: HttpServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Auth middleware for socket connections
  io.use(async (socket: Socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const payload = verifyAccessToken(token);
      socket.data.userId = payload.sub;
      socket.data.email = payload.email;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id} (user: ${socket.data.userId})`);

    // Join user's personal room
    socket.join(`user:${socket.data.userId}`);

    // Join startup-specific room for simulation updates
    socket.on('join:startup', ({ startupId }: { startupId: string }) => {
      socket.join(`startup:${startupId}`);
      socket.emit('joined', { startupId });
    });

    socket.on('leave:startup', ({ startupId }: { startupId: string }) => {
      socket.leave(`startup:${startupId}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id} — ${reason}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

// Emit helpers
export const socketEmit = {
  simulationTick: (startupId: string, data: unknown) => {
    getIO().to(`startup:${startupId}`).emit('simulation:tick', data);
  },
  simulationEvent: (startupId: string, event: unknown) => {
    getIO().to(`startup:${startupId}`).emit('simulation:event', event);
  },
  notification: (userId: string, notification: unknown) => {
    getIO().to(`user:${userId}`).emit('notification', notification);
  },
  simulationStarted: (startupId: string) => {
    getIO().to(`startup:${startupId}`).emit('simulation:started', { startupId });
  },
  simulationPaused: (startupId: string) => {
    getIO().to(`startup:${startupId}`).emit('simulation:paused', { startupId });
  },
};
