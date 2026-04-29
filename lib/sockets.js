import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

// The server only accepts WebSocket transport (polling fails with xhr post error).
// Auth is sent via socket.auth (handshake packet) and query string — both are
// included in the WebSocket upgrade URL and are readable by the server.
export const socket = io(BACKEND_URL, {
  autoConnect: false,
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
});

let lastToken = null;

export async function initSocket(explicitToken = null) {
  let token = explicitToken;

  if (!token) {
    try {
      token = (await AsyncStorage.getItem("token")) || "";
    } catch (e) {
      console.warn("[Socket] Could not read token:", e.message);
    }
  }

  if (!token) {
    console.log("[Socket] No token yet, retrying in 500ms...");
    await new Promise((r) => setTimeout(r, 500));
    try {
      token = (await AsyncStorage.getItem("token")) || "";
    } catch (_) {}
  }

  if (!token) {
    console.warn("[Socket] Aborting: no token.");
    if (socket.connected) socket.disconnect();
    lastToken = null;
    return;
  }

  if (socket.connected && token === lastToken) {
    console.log("[Socket] Already connected. Skipping re-init.");
    return;
  }

  lastToken = token;

  if (socket.connected || socket.active) {
    socket.disconnect();
    await new Promise((r) => setTimeout(r, 80));
  }

  // Three auth channels — server can read from whichever it supports:
  socket.auth = { token };           // socket.handshake.auth.token  (socket.io v4 standard)
  socket.io.opts.query = { token };  // socket.handshake.query.token (in WS upgrade URL)

  if (!socket._hasListeners) {
    socket.on("connect", () => {
      console.log("[Socket] ✅ Connected:", socket.id);
      console.log("[Socket] handshake query token set:", !!socket.io.opts.query?.token);
    });

    socket.on("connect_error", (err) => {
      console.warn("[Socket] ❌ Error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
    });

    socket.on("call:error", (data) => {
      console.warn("[Socket] call:error:", JSON.stringify(data));
    });

    // 🔍 DEBUG: Log EVERY event the server sends so we can see what it expects
    socket.onAny((event, ...args) => {
      if (!["call:signal"].includes(event)) { // skip noisy WebRTC events
        console.log(`[Socket][SERVER→] event="${event}" data=${JSON.stringify(args).slice(0, 200)}`);
      }
    });

    socket._hasListeners = true;
  }

  console.log("[Socket] Connecting (token len:", token.length, ")...");
  socket.connect();
}