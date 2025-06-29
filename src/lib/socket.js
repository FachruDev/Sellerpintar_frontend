import { io } from 'socket.io-client';
import { getCookie } from 'cookies-next';

let socket = null;

export const initializeSocket = () => {
  if (typeof window === 'undefined') return null;
  if (socket) return socket;

  // Ambil token dari cookie atau localStorage
  const token = getCookie('token') || localStorage.getItem('token');

  socket = io('https://sellerpintar-backend.fachru.xyz', {
    auth: { token },
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('Connected to socket server:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connect error:', err);
  });

  socket.on('disconnect', (reason) => {
    console.log('Disconnected from socket server:', reason);
  });

  socket.on('task-created', (task) => {
    console.log('New task created:', task);
  });

  socket.on('task-updated', (task) => {
    console.log('Task updated:', task);
  });

  socket.on('task-deleted', (task) => {
    console.log('Task deleted:', task);
  });

  socket.on('task-status-changed', (data) => {
    console.log('Task status changed:', data);
    const customEvent = new CustomEvent('task-status-update', { detail: data });
    window.dispatchEvent(customEvent);
  });

  socket.on('member-added', (data) => {
    console.log('Member added:', data);
  });

  socket.on('member-removed', (data) => {
    console.log('Member removed:', data);
  });

  socket.on('project-updated', (project) => {
    console.log('Project updated:', project);
  });

  socket.on('project-deleted', (data) => {
    console.log('Project deleted:', data);
  });

  return socket;
};

// Join ke room proyek
export const joinProjectRoom = (projectId) => {
  const sock = initializeSocket();
  if (!sock) return;
  sock.emit('join-project', projectId);
  console.log(`Joined project room: ${projectId}`);
};

// Keluar dari room proyek
export const leaveProjectRoom = (projectId) => {
  if (!socket) return;
  socket.emit('leave-project', projectId);
  console.log(`Left project room: ${projectId}`);
};

// Ekspos raw socket jika diperlukan
export const getSocket = () => initializeSocket();

export default {
  initializeSocket,
  joinProjectRoom,
  leaveProjectRoom,
  getSocket,
};
