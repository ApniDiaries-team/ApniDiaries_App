import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Toast from "react-native-toast-message";
import { AppContext } from "../../../context/AppContext";
import { socket } from "../../../lib/sockets";
import { getUserById } from "../../../services/call.api";

const CallContext = createContext();
const ASYNC_STORAGE_KEY = "apni_active_call";

const persistCall = async (call, callStatus, isRestored) => {
  try {
    if (call && callStatus && callStatus !== "ended" && callStatus !== null) {
      await AsyncStorage.setItem(
        ASYNC_STORAGE_KEY,
        JSON.stringify({ call, callStatus, isRestored }),
      );
    } else {
      await AsyncStorage.removeItem(ASYNC_STORAGE_KEY);
    }
  } catch (e) {
    console.error("Storage Error:", e);
  }
};

const readPersistedCall = async () => {
  try {
    const raw = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const CallProvider = ({ children }) => {
  const { user } = useContext(AppContext);
  const router = useRouter();

  const [call, setCall] = useState(null);
  const [incoming, setIncoming] = useState(null);
  const [callStatus, setCallStatus] = useState(null);
  const [isRestored, setIsRestored] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const hadPersistedState = useRef(false);
  const currentUserId = user?.id;

  // ── Restore saved call on mount ────────────────────────────────────────────
  useEffect(() => {
    const loadState = async () => {
      const saved = await readPersistedCall();
      if (saved?.call && saved?.callStatus) {
        hadPersistedState.current = true;
        setCall(saved.call);
        setCallStatus(saved.callStatus);
        setIsRestored(saved.isRestored || false);
        setTimeout(() => {
          router.replace("/(protected)/calls");
        }, 50);
      }
      setIsReady(true);
    };
    loadState();
  }, []);

  // ── Persist call state on every change ────────────────────────────────────
  useEffect(() => {
    if (isReady) persistCall(call, callStatus, isRestored);
  }, [call, callStatus, isRestored, isReady]);

  // ── MAIN CALL SOCKET EVENT LISTENERS ──────────────────────────────────────
  useEffect(() => {
    if (!currentUserId) return;

    const handleIncomingCall = async (data) => {
      try {
        const response = await getUserById(data.callerId);
        const caller = response.data?.data || response.data;
        setIncoming(data);
        const newCall = {
          id: data.callId,
          callerId: data.callerId,
          receiverId: currentUserId,
          threadId: data.threadId,
          callType: data.callType,
          contact: {
            id: caller.id,
            name: caller.name || "Unknown",
            avatar: caller.avatar || "?",
            phone: caller.phone || "",
          },
        };
        setCall(newCall);
        setCallStatus("ringing");
        Toast.show({ type: "info", text1: "📞 Incoming Call", text2: caller.name || "Unknown" });
        router.replace("/(protected)/calls"); // replace not push — prevents duplicate CallContainer instances
      } catch {
        setIncoming(data);
        setCall({
          id: data.callId,
          callerId: data.callerId,
          receiverId: currentUserId,
          threadId: data.threadId,
          callType: data.callType,
          contact: { name: "Caller", avatar: "?" },
        });
        setCallStatus("ringing");
        Toast.show({ type: "info", text1: "📞 Incoming Call", text2: String(data.callerId) });
        router.replace("/(protected)/calls");
      }
    };

    // ✅ ADDED: updates call.id from server — without this call.id stays null
    // and all subsequent call:signal emissions are routed to callId:null (ignored)
    const handleRinging = ({ callId }) => {
      setCall((prev) => (prev ? { ...prev, id: callId } : prev));
    };

    const handleAccepted = ({ callId }) => {
      setCall((prev) => (prev ? { ...prev, id: callId } : prev));
      setIncoming(null);
      setIsRestored(false);
      setCallStatus("active");
      Toast.show({ type: "success", text1: "Call connected" });
    };

    // ✅ ADDED: caller gets stuck on ringing screen forever without this
    const handleRejected = () => {
      setIncoming(null);
      setCall(null);
      setCallStatus("rejected");
      Toast.show({ type: "info", text1: "Call rejected" });
      setTimeout(() => {
        setCallStatus(null);
        if (socket.connected && currentUserId) {
          socket.emit("setup", { userId: currentUserId });
          socket.emit("heartbeat");
        }
      }, 2000);
    };

    // ✅ ADDED: caller gets stuck on ringing screen forever without this
    const handleBusy = () => {
      setCall(null);
      setIncoming(null);
      setCallStatus("busy");
      Toast.show({ type: "error", text1: "User is busy on another call" });
      setTimeout(() => setCallStatus(null), 2000);
    };

    // ✅ ADDED: caller gets stuck on ringing screen forever without this
    const handleOffline = () => {
      setCall(null);
      setIncoming(null);
      setCallStatus("offline");
      Toast.show({ type: "error", text1: "User is offline" });
      setTimeout(() => setCallStatus(null), 2000);
    };

    // ✅ ADDED: receiver's screen never clears without this
    const handleMissed = () => {
      setIncoming(null);
      setCall(null);
      setCallStatus("missed");
      Toast.show({ type: "info", text1: "Missed call" });
      setTimeout(() => setCallStatus(null), 2000);
    };

    const reRegisterOnline = () => {
      // Re-announce presence to server so the next call attempt doesn't see "user offline"
      if (socket.connected && currentUserId) {
        socket.emit("setup", { userId: currentUserId });
        socket.emit("heartbeat");
        console.log("[Socket] Re-registered online after call ended");
      }
    };

    const handleEnded = ({ duration }) => {
      setIncoming(null);
      setCall(null);
      setCallStatus("ended");
      Toast.show({
        type: "info",
        text1: `Call ended${duration ? ` (${duration}s)` : ""}`,
      });
      setTimeout(() => { setCallStatus(null); reRegisterOnline(); }, 2000);
    };

    const handleDisconnect = (reason) => {
      console.log("[Socket] Call context disconnected:", reason);
      if (callStatus === "ringing" || callStatus === "active") {
        setCall(null);
        setIncoming(null);
        setCallStatus(null);
        Toast.show({ type: "info", text1: "Call disconnected" });
      }
    };

    socket.on("call:incoming", handleIncomingCall);
    socket.on("call:ringing", handleRinging);
    socket.on("call:accepted", handleAccepted);
    socket.on("call:rejected", handleRejected);
    socket.on("call:busy", handleBusy);
    socket.on("call:offline", handleOffline);
    socket.on("call:missed", handleMissed);
    socket.on("call:ended", handleEnded);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("call:incoming", handleIncomingCall);
      socket.off("call:ringing", handleRinging);
      socket.off("call:accepted", handleAccepted);
      socket.off("call:rejected", handleRejected);
      socket.off("call:busy", handleBusy);
      socket.off("call:offline", handleOffline);
      socket.off("call:missed", handleMissed);
      socket.off("call:ended", handleEnded);
      socket.off("disconnect", handleDisconnect);
    };
  }, [currentUserId]);

  // ── SOCKET RECONNECT + SERVER-SIDE RESTORE ─────────────────────────────────
  // ✅ ADDED: entire block was missing — handles reconnects and app restores
  useEffect(() => {
    const handleReconnect = () => {
      socket.emit("call:restore");
    };

    const handleCallRestored = async (data) => {
      if (!data) return;

      let contact = { name: "Unknown", avatar: "?" };
      try {
        const otherId =
          String(data.callerId) === String(currentUserId)
            ? data.receiverId
            : data.callerId;
        const res = await getUserById(otherId);
        const u = res.data?.data || res.data;
        contact = {
          id: u.id,
          name: u.name || "Unknown",
          avatar: u.avatar || "?",
          phone: u.phone || "",
        };
      } catch (e) {
        console.error("Could not fetch contact on restore:", e);
      }

      const restoredCall = {
        id: data.callId,
        callerId: data.callerId,
        receiverId: data.receiverId,
        threadId: data.threadId,
        callType: data.callType,
        contact,
      };

      setCall(restoredCall);

      if (data.status === "answered") {
        setIsRestored(true);
        setCallStatus("active");
      } else {
        setIsRestored(false);
        setCallStatus("ringing");
        if (String(data.receiverId) === String(currentUserId)) {
          setIncoming({ callId: data.callId, callerId: data.callerId });
        }
      }
      router.replace("/(protected)/calls");
    };

    socket.on("connect", handleReconnect);
    socket.on("call:restored", handleCallRestored);

    return () => {
      socket.off("connect", handleReconnect);
      socket.off("call:restored", handleCallRestored);
    };
  }, [currentUserId]);

  // ── INITIATE CALL ──────────────────────────────────────────────────────────
  const initiateCall = ({ receiverId, threadId, callType, contact }) => {
    if (callStatus === "ringing" || callStatus === "active") return;

    // ✅ ADDED: guard matches web — prevents call without auth
    if (!currentUserId) {
      Toast.show({ type: "error", text1: "You are not connected" });
      return;
    }

    if (!socket.connected) socket.connect();

    console.log("[Call] Emitting call:initiate →", { threadId, receiverId, callType, myId: currentUserId, socketId: socket.id, socketConnected: socket.connected });
    socket.emit("call:initiate", { threadId, receiverId, callType });
    setIsRestored(false);
    setCall({
      id: null, // will be filled by call:ringing event from server
      callerId: currentUserId,
      receiverId,
      threadId,
      callType,
      contact,
    });
    setCallStatus("ringing");
  };

  // ── ACCEPT CALL ────────────────────────────────────────────────────────────
  const acceptCall = () => {
    if (!incoming) return;
    setIsRestored(false);
    socket.emit("call:accept", { callId: incoming.callId });
    setCallStatus("active");
    setIncoming(null);
  };

  // ── REJECT CALL ────────────────────────────────────────────────────────────
  const rejectCall = () => {
    if (!incoming) return;
    socket.emit("call:reject", { callId: incoming.callId });
    setIncoming(null);
    setCall(null);
    setCallStatus(null);
  };

  // ── END CALL ───────────────────────────────────────────────────────────────
  const endCall = useCallback(() => {
    if (call?.id) socket.emit("call:end", { callId: call.id });
    setIncoming(null);
    setCall(null);
    setCallStatus("ended");
    setTimeout(() => setCallStatus(null), 2000);
  }, [call?.id]);

  return (
    <CallContext.Provider
      value={{
        call,
        incoming,
        callStatus,
        isRestored,
        initiateCall,
        acceptCall,
        rejectCall,
        endCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);
