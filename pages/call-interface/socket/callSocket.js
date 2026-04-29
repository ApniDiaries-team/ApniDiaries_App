import { socket } from "../../../lib/sockets"; // ✅ FIXED: was "../../../lib/socket" (missing 's')

export const initiateCall = (data) => {
  socket.emit("call:initiate", data);
};

export const acceptCall = (callId) => {
  socket.emit("call:accept", { callId });
};

export const rejectCall = (callId) => {
  socket.emit("call:reject", { callId });
};

export const endCall = (callId) => {
  socket.emit("call:end", { callId });
};

export const sendSignal = (callId, payload) => {
  socket.emit("call:signal", { callId, payload });
};
