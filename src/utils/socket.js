import { io } from 'socket.io-client';
import { getToken } from './api';

let socket = null;

// Determine backend URL
const getBackendUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '');
  }
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return `http://${hostname}:4000`; // Port 4000 is our backend port
};

export const initSocket = (onFallback) => {
  if (socket) return socket;

  const token = getToken();
  if (!token) return null;

  const backendUrl = getBackendUrl();
  console.log(`[WS] Connecting to ${backendUrl}...`);

  socket = io(backendUrl, {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000
  });

  socket.on('connect', () => {
    console.log('[WS] Connected successfully. Socket ID:', socket.id);
  });

  socket.on('connect_error', (error) => {
    console.error('[WS] Connection error:', error.message);
  });

  socket.on('reconnect_attempt', (attempt) => {
    console.log(`[WS] Reconnection attempt #${attempt}...`);
  });

  socket.on('reconnect_failed', () => {
    console.warn('[WS] Reconnection failed completely. Switching to fallback mode.');
    if (typeof onFallback === 'function') {
      onFallback();
    }
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log('[WS] Disconnecting socket...');
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => {
  return socket;
};

// Payload Version Compatibility Parser
export const parsePayload = (data) => {
  if (!data) return null;
  // Handle payload wrapped in versioning structure
  if (data.version && data.payload !== undefined) {
    // If future version structures are introduced, they can be processed here based on data.version
    return data.payload;
  }
  return data;
};
