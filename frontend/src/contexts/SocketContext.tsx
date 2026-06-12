'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { getSocket, SOCKET_EVENTS } from '@/lib/socket';
import { useAuth } from './AuthContext';
import type { SimulationEvent, Notification } from '@/types/simulation';
import type { Socket } from 'socket.io-client';

interface SocketContextValue {
  isConnected: boolean;
  joinStartup: (startupId: string) => void;
  leaveStartup: (startupId: string) => void;
  onSimulationTick: (cb: (data: unknown) => void) => () => void;
  onSimulationEvent: (cb: (event: SimulationEvent) => void) => () => void;
  notifications: Notification[];
  clearNotification: (id: string) => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, accessToken } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const socket = getSocket();
    socketRef.current = socket;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    const onNotification = (data: { title: string; message: string; type: Notification['type'] }) => {
      const notification: Notification = {
        id: crypto.randomUUID(),
        ...data,
        timestamp: new Date(),
      };
      setNotifications((prev) => [notification, ...prev].slice(0, 10));
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on(SOCKET_EVENTS.NOTIFICATION, onNotification);

    if (!socket.connected) socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off(SOCKET_EVENTS.NOTIFICATION, onNotification);
    };
  }, [isAuthenticated, accessToken]);

  const joinStartup = useCallback((startupId: string) => {
    socketRef.current?.emit(SOCKET_EVENTS.JOIN_STARTUP, { startupId });
  }, []);

  const leaveStartup = useCallback((startupId: string) => {
    socketRef.current?.emit(SOCKET_EVENTS.LEAVE_STARTUP, { startupId });
  }, []);

  const onSimulationTick = useCallback((cb: (data: unknown) => void) => {
    socketRef.current?.on(SOCKET_EVENTS.SIMULATION_TICK, cb);
    return () => { socketRef.current?.off(SOCKET_EVENTS.SIMULATION_TICK, cb); };
  }, []);

  const onSimulationEvent = useCallback((cb: (event: SimulationEvent) => void) => {
    socketRef.current?.on(SOCKET_EVENTS.SIMULATION_EVENT, cb);
    return () => { socketRef.current?.off(SOCKET_EVENTS.SIMULATION_EVENT, cb); };
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <SocketContext.Provider value={{
      isConnected, joinStartup, leaveStartup,
      onSimulationTick, onSimulationEvent,
      notifications, clearNotification,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): SocketContextValue {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}
