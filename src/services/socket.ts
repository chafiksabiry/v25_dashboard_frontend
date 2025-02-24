import { io } from 'socket.io-client';
import { store } from '../store';
import { updateLiveCall, removeLiveCall } from '../store/slices/dashboardSlice';

<<<<<<< HEAD
const socket = io('http://localhost:5000', {
=======
const socket = io(`${import.meta.env.VITE_API_URL}`, {
>>>>>>> origin/main
  autoConnect: false
});

socket.on('call:update', (call) => {
  store.dispatch(updateLiveCall(call));
});

socket.on('call:end', (callId) => {
  store.dispatch(removeLiveCall(callId));
});

export const connectSocket = () => {
  const token = localStorage.getItem('token');
  if (token) {
    socket.auth = { token };
    socket.connect();
  }
};

export const disconnectSocket = () => {
  socket.disconnect();
};

export default socket;