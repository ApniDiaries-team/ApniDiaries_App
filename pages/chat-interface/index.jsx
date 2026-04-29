import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Lock } from "lucide-react-native";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  AppState,
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message"; // or your toast lib

// Components
import CallEventBubble from "./components/CallEventBubble";
import ChatHeader from "./components/ChatHeader";
import ChatOptionsModal from "./components/ChatOptionsModal";
import DateDivider from "./components/DateDivider";
import MessageBubble from "./components/MessageBubble";
import MessageInput from "./components/MessageInput";
import TypingIndicator from "./components/TypingIndicator";
// Services & Logic
import { AppContext } from "../../context/AppContext";
import { useDarkMode } from "../../context/DarkModeContext";
import { socket } from "../../lib/sockets";
import { getCallLogsByThread, markCallsAsSeen } from "../../services/call.api";
import {
  clearChatMessages,
  createOrGetDirectThread,
  getMessages,
  markSeen,
  uploadChatMedia,
} from "../../services/chat.api";
import { ensureConversationKey } from "../../services/e2eeConversation";
import { blockUser, UnBlockUser } from "../../services/user.api";
import { decryptMessage, encryptMessage } from "../../utils/encryption";
import { useCall } from "../call-interface/context/CallContext";

const CHAT_SS_KEY = "apni_chat_session";

const ChatInterface = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const flatListRef = useRef(null);
  const { isDarkMode, theme } = useDarkMode();
  // Context
  const { user, keysReady, keysNeedPassword, unlockKeysWithPassword } =
    useContext(AppContext);
  const { initiateCall } = useCall();

  // State
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState("");
  const [unlockError, setUnlockError] = useState("");
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [isContactTyping, setIsContactTyping] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messages, setMessages] = useState([]);
  const [callLogs, setCallLogs] = useState([]);
  const [keysError, setKeysError] = useState(null);

  const chatClearedAt = useRef(null);
  const conversationKeyRef = useRef(null);
  const pendingMessagesRef = useRef([]);
  const keyFetchFailedRef = useRef(false);

  // Navigation Params & Session Logic
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [otherUserId, setOtherUserId] = useState(null);
  const [contactData, setContactData] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isBlockedByOther, setIsBlockedByOther] = useState(false);

  // Keyboard height synced to native animation — no jump on show/hide/swipe-dismiss
  const keyboardHeight = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const onShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        Animated.timing(keyboardHeight, {
          toValue: e.endCoordinates.height,
          duration: Platform.OS === "ios" ? e.duration : 160,
          useNativeDriver: false,
        }).start();
      },
    );
    const onHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      (e) => {
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: Platform.OS === "ios" ? e.duration : 160,
          useNativeDriver: false,
        }).start();
      },
    );
    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, [keyboardHeight]);

  // ─── Session Loading ──────────────────────────────────────────────────────
  useEffect(() => {
    const initSession = async () => {
      try {
        let chatState = {
          threadId: params.threadId || undefined,
          userId: params.userId || undefined,
          contact: params.contact || undefined,
        };

        // Remove undefined keys so we can merge cleanly later
        Object.keys(chatState).forEach(k => chatState[k] === undefined && delete chatState[k]);

        if (chatState.userId || chatState.threadId) {
          // Navigated with fresh params, store them like web's sessionStorage
          await AsyncStorage.setItem(CHAT_SS_KEY, JSON.stringify(chatState));
        } else {
          // No params (e.g., deep link or reload), load from AsyncStorage
          const stored = await AsyncStorage.getItem(CHAT_SS_KEY);
          if (stored) {
            chatState = { ...JSON.parse(stored), ...chatState };
          }
        }

        const tId = chatState.threadId || null;
        const uId = chatState.userId || null;
        let cData = null;

        if (chatState.contact) {
          try {
            cData = typeof chatState.contact === "string"
              ? JSON.parse(chatState.contact)
              : chatState.contact;
          } catch {
            cData = { name: "User " + uId };
          }
        }

        setActiveThreadId(tId);
        setOtherUserId(uId || cData?.id || null);
        setContactData(cData);
        setIsBlocked(!!cData?.isBlocked);
        setIsBlockedByOther(!!cData?.isBlockedByOther);
      } catch (err) {
        console.error("Failed to load session:", err);
      } finally {
        setIsSessionLoaded(true);
      }
    };
    initSession();
  }, [params.userId, params.threadId, params.contact]);

  // ─── AppState Auto-Refresh ────────────────────────────────────────────────
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === "active" && activeThreadId && isSessionLoaded && keysReady) {
        fetchMessages(activeThreadId);
        getCallLogs(activeThreadId).then((res) => {
          if (res?.data?.success) setCallLogs(res.data.logs);
        });
      }
    };
    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [activeThreadId, isSessionLoaded, keysReady]);

  // ─── Decryption Helpers ───────────────────────────────────────────────────
  const decryptRawMessage = (m, key) => {
    const plain = key ? decryptMessage(m.ciphertext, m.nonce, key) : null;
    return {
      id: m.id,
      text: plain ?? null,
      isEncrypted: plain === null,
      _raw: plain === null ? m : undefined,
      timestamp: new Date(m.created_at || m.timestamp || Date.now()),
      isSent: String(m.sender_id) === String(user?.id),
      status: m.status || "delivered",
      mediaUrl: m.media_url || null,
      mediaType: m.media_type || null,
      onceView: m.once_view || false,
      onceViewOpened: m.once_view_opened || false,
      type: m.message_type || "text",
      gifUrl: m.media_url && m.media_type === "gif" ? m.media_url : null,
    };
  };

  const redecryptEncryptedMessages = (key) => {
    setMessages((prev) => {
      if (!prev.some((m) => m.isEncrypted && m._raw)) return prev;
      return prev.map((m) =>
        !m.isEncrypted || !m._raw ? m : decryptRawMessage(m._raw, key),
      );
    });
  };

  const flushPendingMessages = (key) => {
    if (pendingMessagesRef.current.length === 0) return;
    const decrypted = pendingMessagesRef.current.map((m) =>
      decryptRawMessage(m, key),
    );
    pendingMessagesRef.current = [];
    setMessages((prev) => {
      const existingIds = new Set(prev.map((x) => x.id));
      const newOnes = decrypted.filter((m) => !existingIds.has(m.id));
      return newOnes.length > 0 ? [...newOnes, ...prev] : prev; // prepend for newest-first
    });
  };

  // ─── Fetching ─────────────────────────────────────────────────────────────
  const fetchMessages = async (tId) => {
    try {
      setLoadingMessages(true);
      setKeysError(null);
      let finalThreadId = tId;

      if (!finalThreadId && otherUserId) {
        const res = await createOrGetDirectThread(otherUserId);
        if (res?.data?.success) {
          finalThreadId = res?.data?.thread?.id;
          setActiveThreadId(finalThreadId);
          try {
            const stored = await AsyncStorage.getItem(CHAT_SS_KEY);
            const s = stored ? JSON.parse(stored) : {};
            await AsyncStorage.setItem(
              CHAT_SS_KEY,
              JSON.stringify({ ...s, threadId: finalThreadId }),
            );
          } catch {}
        }
      }

      if (finalThreadId) {
        try {
          keyFetchFailedRef.current = false;
          const keyBytes = await ensureConversationKey(
            finalThreadId,
            user?.id,
            otherUserId,
          );
          conversationKeyRef.current = keyBytes;
          flushPendingMessages(keyBytes);
          redecryptEncryptedMessages(keyBytes);
        } catch (keyErr) {
          keyFetchFailedRef.current = true;
          console.warn(
            "[E2EE] fetchMessages: could not get conversation key",
            keyErr.message,
          );
          if (
            keyErr.message?.includes("NO_LOCAL_KEYS") ||
            keyErr.message?.includes("DECRYPT_FAILED")
          ) {
            setKeysError(
              "Your encryption keys are missing. Please log out and log in again to restore your messages.",
            );
          } else {
            setKeysError("Encryption key error: " + (keyErr.message || "Unknown error"));
          }
          flushPendingMessages(null);
        }

        const res = await getMessages(finalThreadId);
        if (res?.data?.success) {
          const key = conversationKeyRef.current;
          const formatted = (res?.data?.messages || []).map((m) =>
            decryptRawMessage(m, key),
          );
          setMessages(formatted.reverse()); // Reverse to newest-first order
          await markSeen(finalThreadId);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchCallLogs = async (tId) => {
    if (!tId) return;
    try {
      const res = await getCallLogsByThread(tId);
      let logs = [];
      if (Array.isArray(res.data)) {
        logs = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        logs = res.data.data;
      } else if (res.data?.calls && Array.isArray(res.data.calls)) {
        logs = res.data.calls;
      }

      const transformed = logs
        .map((call) => ({
          id: call.id,
          type: call.call_type || call.type || "audio",
          callType: call.call_type || call.type || "audio",
          direction: call.direction,
          status: call.status,
          duration: call.duration || 0,
          timestamp: new Date(call.timestamp || call.created_at),
          otherUserId: call.otherUserId || call.contact?.id,
        }))
        .filter(Boolean);

      const filtered = chatClearedAt.current
        ? transformed.filter((l) => l.timestamp > chatClearedAt.current)
        : transformed;

      setCallLogs(filtered);
    } catch (e) {
      console.warn("Error fetching call logs", e);
    }
  };

  const markMissedCallsAsSeen = async () => {
    if (!activeThreadId) return;
    try {
      await markCallsAsSeen(activeThreadId);
    } catch (error) {
      console.log(error);
    }
  };

  // ─── Socket ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeThreadId || !keysReady) return;

    socket.emit("join_thread", { threadId: activeThreadId });

    const handleReconnect = () => {
      socket.emit("join_thread", { threadId: activeThreadId });
    };

    const handleReceiveMessage = (msg) => {
      console.log("[Chat] receive_message event fired", msg.id);
      const key = conversationKeyRef.current;
      if (!key && !keyFetchFailedRef.current) {
        pendingMessagesRef.current.push(msg);
        return;
      }

      const plain = key ? decryptMessage(msg.ciphertext, msg.nonce, key) : null;
      const isMine = String(msg.sender_id) === String(user?.id);

      const incoming = {
        id: msg.id,
        text: plain ?? null,
        isEncrypted: plain === null,
        _raw:
          plain === null
            ? {
                id: msg.id,
                ciphertext: msg.ciphertext,
                nonce: msg.nonce,
                created_at: msg.created_at,
                sender_id: msg.sender_id,
                status: msg.status,
                media_url: msg.media_url,
                media_type: msg.media_type,
                once_view: msg.once_view,
                once_view_opened: msg.once_view_opened,
                message_type: msg.message_type,
              }
            : undefined,
        timestamp: new Date(msg.created_at),
        isSent: isMine,
        status: "delivered",
        mediaUrl: msg.media_url || null,
        mediaType: msg.media_type || null,
        onceView: msg.once_view || false,
        onceViewOpened: msg.once_view_opened || false,
        type: msg.message_type || "text",
        gifUrl:
          msg.media_url && msg.media_type === "gif" ? msg.media_url : null,
      };

      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        if (isMine) {
          // Replace local optimistic message with confirmed one
          const localIdx = [...prev]
            .map((m, i) => ({ m, i }))
            .filter(
              ({ m }) =>
                String(m.id).startsWith("local-") &&
                ((incoming.mediaUrl && m.mediaUrl === incoming.mediaUrl) ||
                  (incoming.type === "gif" &&
                    m.type === "gif" &&
                    m.gifUrl === incoming.gifUrl) ||
                  (incoming.type === "sticker" &&
                    m.type === "sticker" &&
                    m.text === incoming.text) ||
                  (incoming.type === "text" &&
                    m.type === "text" &&
                    m.text === incoming.text)),
            )
            .map(({ i }) => i)
            .pop(); // findLastIndex equivalent

          if (localIdx !== undefined) {
            const updated = [...prev];
            updated[localIdx] = incoming;
            return updated;
          }
        }
        return [incoming, ...prev]; // Prepend for newest-first order
      });
    };


    const handleTyping = ({ threadId: tId, userId }) => {
      if (
        String(tId) === String(activeThreadId) &&
        String(userId) !== String(user?.id)
      )
        setIsContactTyping(true);
    };

    const handleStopTyping = ({ threadId: tId, userId }) => {
      if (
        String(tId) === String(activeThreadId) &&
        String(userId) !== String(user?.id)
      )
        setIsContactTyping(false);
    };

    const handleUserOnline = (userId) => {
      if (String(userId) === String(otherUserId)) {
        setContactData((prev) => (prev ? { ...prev, isOnline: true } : prev));
      }
    };

    const handleUserOffline = (userId) => {
      if (String(userId) === String(otherUserId)) {
        setContactData((prev) =>
          prev
            ? { ...prev, isOnline: false, lastActive: new Date().toISOString() }
            : prev,
        );
      }
    };

    const handleCallEnded = () => {
      setTimeout(() => fetchCallLogs(activeThreadId), 500);
    };

    const handleCallMissed = () => {
      setTimeout(() => fetchCallLogs(activeThreadId), 500);
    };

    socket.on("connect", handleReconnect);
    socket.on("receive_message", handleReceiveMessage);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);
    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);
    socket.on("call:ended", handleCallEnded);
    socket.on("call:missed", handleCallMissed);

    return () => {
      socket.off("connect", handleReconnect);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
      socket.off("call:ended", handleCallEnded);
      socket.off("call:missed", handleCallMissed);
      socket.emit("leave_thread", { threadId: activeThreadId });
    };
  }, [activeThreadId, keysReady, user?.id, otherUserId]);

  // Fetch on mount / thread change
  useEffect(() => {
    if (!keysReady || !isSessionLoaded) return;
    fetchMessages(activeThreadId);
  }, [activeThreadId, otherUserId, keysReady, isSessionLoaded]);

  useEffect(() => {
    if (activeThreadId) {
      fetchCallLogs(activeThreadId);
      markMissedCallsAsSeen();
    }
  }, [activeThreadId]);

  // Emit typing events
  useEffect(() => {
    if (!activeThreadId) return;
    if (isUserTyping) {
      socket.emit("typing", { threadId: activeThreadId, userId: user?.id });
    } else {
      socket.emit("stop_typing", {
        threadId: activeThreadId,
        userId: user?.id,
      });
    }
  }, [isUserTyping, activeThreadId]);

  // ─── Call Handlers ────────────────────────────────────────────────────────
  const handleAudioCall = () => {
    initiateCall({
      receiverId: otherUserId,
      threadId: activeThreadId,
      callType: "audio",
      contact: contactData,
    });
    router.replace("/(protected)/calls");
  };

  const handleVideoCall = () => {
    initiateCall({
      receiverId: otherUserId,
      threadId: activeThreadId,
      callType: "video",
      contact: contactData,
    });
    router.replace("/(protected)/calls");
  };

  const handleCallAgain = (callType, receiverId) => {
    initiateCall({
      receiverId,
      threadId: activeThreadId,
      callType,
      contact: contactData,
    });
    router.replace("/(protected)/calls");
  };

  // ─── Message Sending ──────────────────────────────────────────────────────
  const handleSendMessage = async (payload) => {
    const isLegacy = typeof payload === "string";
    const text = isLegacy ? payload : payload?.text;
    const files = isLegacy ? [] : payload?.files || [];
    const onceView = isLegacy ? false : payload?.onceView || false;
    const type = isLegacy ? "text" : payload?.type || "text";
    const gifUrl = payload?.gifUrl || null;

    if (!activeThreadId) return;
    if (isBlocked || isBlockedByOther) {
      Toast.show({
        type: "error",
        text1: isBlocked
          ? "You have blocked this user. Unblock to send messages."
          : "You cannot reply to this conversation.",
      });
      return;
    }

    const key = conversationKeyRef.current;
    if (!key) return;

    // GIF
    if (type === "gif" && gifUrl) {
      const { ciphertext, nonce } = encryptMessage(gifUrl, key);
      socket.emit("send_message", {
        threadId: activeThreadId,
        ciphertext,
        nonce,
        messageType: "gif",
        mediaUrl: gifUrl,
        mediaType: "gif",
        onceView: false,
      });
      setMessages((prev) => [
        {
          id: `local-${Date.now()}`,
          text: null,
          type: "gif",
          gifUrl,
          mediaUrl: gifUrl,
          mediaType: "gif",
          onceView: false,
          timestamp: new Date(),
          isSent: true,
          status: "pending",
        },
        ...prev,
      ]);
      return;
    }

    // Sticker
    if (type === "sticker" && text) {
      const { ciphertext, nonce } = encryptMessage(text, key);
      socket.emit("send_message", {
        threadId: activeThreadId,
        ciphertext,
        nonce,
        messageType: "sticker",
      });
      setMessages((prev) => [
        {
          id: `local-${Date.now()}`,
          text,
          type: "sticker",
          timestamp: new Date(),
          isSent: true,
          status: "pending",
        },
        ...prev,
      ]);
      return;
    }

    // Files / Media
    if (files.length > 0) {
      for (const file of files) {
        const localId = `local-${Date.now()}-${Math.random()}`;
        const isVideo = file.type?.startsWith("video/");

        setMessages((prev) => [
          {
            id: localId,
            text: text || null,
            type: isVideo ? "video" : "image",
            mediaUrl: file.uri || null,
            mediaType: isVideo ? "video" : "image",
            onceView,
            onceViewOpened: false,
            timestamp: new Date(),
            isSent: true,
            status: "uploading",
            localId,
          },
          ...prev,
        ]);

        try {
          const res = await uploadChatMedia(activeThreadId, file);
          if (!res?.data?.success) {
            setMessages((prev) => prev.filter((m) => m.id !== localId));
            Toast.show({ type: "error", text1: "Failed to send media." });
            continue;
          }

          const { url, mediaType: mType } = res.data;
          const { ciphertext, nonce } = encryptMessage(url, key);
          socket.emit("send_message", {
            threadId: activeThreadId,
            ciphertext,
            nonce,
            messageType: mType === "video" ? "video" : "image",
            mediaUrl: url,
            mediaType: mType,
            onceView,
          });

          setMessages((prev) =>
            prev.map((m) =>
              m.id === localId ? { ...m, mediaUrl: url, status: "pending" } : m,
            ),
          );
        } catch (err) {
          console.error("Media upload failed:", err.message);
          setMessages((prev) => prev.filter((m) => m.id !== localId));
          Toast.show({
            type: "error",
            text1: "Failed to send media. Please try again.",
          });
        }
      }

      // Also send accompanying text if any
      if (text?.trim()) {
        const { ciphertext, nonce } = encryptMessage(text.trim(), key);
        socket.emit("send_message", {
          threadId: activeThreadId,
          ciphertext,
          nonce,
          messageType: "text",
        });
        setMessages((prev) => [
          {
            id: `local-${Date.now()}`,
            text: text.trim(),
            type: "text",
            timestamp: new Date(),
            isSent: true,
            status: "pending",
          },
          ...prev,
        ]);
      }
      return;
    }

    // FIX 1: Plain text — add optimistic local message (was missing, parity with web)
    if (!text?.trim()) return;
    const { ciphertext, nonce } = encryptMessage(text.trim(), key);
    socket.emit("send_message", {
      threadId: activeThreadId,
      ciphertext,
      nonce,
      messageType: "text",
    });
    setMessages((prev) => [
      {
        id: `local-${Date.now()}`,
        text: text.trim(),
        type: "text",
        timestamp: new Date(),
        isSent: true,
        status: "pending",
      },
      ...prev,
    ]);
  };

  // ─── Block / Unblock ──────────────────────────────────────────────────────
  const handleBlock = async (id, name) => {
    try {
      const res = await blockUser(id);
      if (res.data.success) {
        Toast.show({ type: "success", text1: `Blocked ${name}` });
        setIsBlocked(true);
      }
    } catch {
      Toast.show({ type: "error", text1: "Failed to block user" });
    }
  };

  const handleUnblock = async () => {
    try {
      const res = await UnBlockUser(otherUserId);
      if (res.data.success) {
        Toast.show({
          type: "success",
          text1: `Unblocked ${contactData?.name}`,
        });
        setIsBlocked(false);
      }
    } catch {
      Toast.show({ type: "error", text1: "Failed to unblock" });
    }
  };

  // ─── Clear Chat ───────────────────────────────────────────────────────────
  const handleClearChat = async (tId) => {
    const id = tId || activeThreadId;
    if (!id) return;

    Alert.alert(
      "Clear Chat",
      "Clear all messages and call history? This cannot be undone on your side.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await clearChatMessages(id);
              if (res.data?.success) {
                chatClearedAt.current = new Date();
                setMessages([]);
                setCallLogs([]);
                Toast.show({ type: "success", text1: "Chat cleared" });
              }
            } catch {
              Toast.show({ type: "error", text1: "Failed to clear chat" });
            }
          },
        },
      ],
    );
  };

  // ─── Quick Actions (Options Modal) ────────────────────────────────────────
  const handleQuickAction = async (actionType) => {
    switch (actionType) {
      case "view-profile":
        router.push({
          pathname: `/${contactData?.name}`,
          params: { userId: contactData?.id, userName: contactData?.name },
        });
        break;
      case "search":
        console.log("search");
        break;
      case "mute":
        console.log("mute");
        break;
      case "clear":
        handleClearChat(activeThreadId);
        break;
      case "block":
        handleBlock(contactData?.id, contactData?.name);
        break;
      default:
        break;
    }
    fetchMessages(activeThreadId);
  };

  // ─── Grouping ─────────────────────────────────────────────────────────────
  const combinedItems = [...messages, ...callLogs].sort(
    (a, b) => b.timestamp - a.timestamp, // Sort descending (newest first)
  );

  const groupItemsByDate = (items) => {
    const grouped = {};
    items.forEach((item) => {
      const dateKey = item.timestamp.toDateString();
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(item);
    });
    return grouped;
  };

  const groupedItems = groupItemsByDate(combinedItems);

  // FIX 2: Namespace keys by type so message IDs and call IDs can never collide
  const flatListData = Object.entries(groupedItems).flatMap(([date, items]) => [
    ...items.map((item) => ({
      ...item,
      id: item.direction ? `call-${item.id}` : `msg-${item.id}`,
      _itemType: item.direction ? "call" : "message",
    })),
    { id: `date-${date}`, type: "date", date }, // Divider goes last so it's ABOVE in inverted list
  ]);

  // ─── Render ───────────────────────────────────────────────────────────────
  const renderItem = ({ item }) => {
    if (item.type === "date") {
      return <DateDivider date={new Date(item.date)} />;
    }
    if (item._itemType === "call") {
      return (
        <CallEventBubble
          call={item}
          isOutgoing={item.direction === "outgoing"}
          onCallAgain={handleCallAgain}
        />
      );
    }
    return <MessageBubble message={item} isSent={item.isSent} />;
  };

  // ─── Unlock handler ───────────────────────────────────────────────────────
  const handleUnlockSubmit = async () => {
    if (!unlockPassword) return;
    setUnlockError("");
    setUnlockLoading(true);
    try {
      await unlockKeysWithPassword(unlockPassword);
      setUnlockPassword("");
    } catch {
      setUnlockError("Incorrect password. Please try again.");
    } finally {
      setUnlockLoading(false);
    }
  };

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: theme.bgPrimary,
        paddingBottom: keyboardHeight,
      }}
    >
      <ChatHeader
        contact={contactData}
        onMoreOptions={() => setIsOptionsModalOpen(true)}
        onAudioCall={handleAudioCall}
        onVideoCall={handleVideoCall}
      />
      {/* Keys error banner */}
      {keysError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{keysError}</Text>
        </View>
      )}

      {/* Encryption unlock banner (password needed) */}
      {!keysReady && keysNeedPassword && (
        <View style={styles.unlockBanner}>
          <View style={styles.bannerRow}>
            <Lock size={14} color="#92400e" />
            <Text style={styles.bannerText}>
              Enter your password to unlock your encrypted messages on this
              device.
            </Text>
          </View>
          <View style={styles.unlockInputRow}>
            <TextInput
              secureTextEntry
              style={styles.unlockInput}
              value={unlockPassword}
              onChangeText={(v) => {
                setUnlockPassword(v);
                setUnlockError("");
              }}
              placeholder="Your account password"
              autoComplete="current-password"
              editable={!unlockLoading}
            />
            <TouchableOpacity
              style={[
                styles.unlockButton,
                (!unlockPassword || unlockLoading) &&
                  styles.unlockButtonDisabled,
              ]}
              onPress={handleUnlockSubmit}
              disabled={!unlockPassword || unlockLoading}
            >
              <Text style={styles.unlockButtonText}>
                {unlockLoading ? "Unlocking…" : "Unlock"}
              </Text>
            </TouchableOpacity>
          </View>
          {unlockError ? (
            <Text style={styles.unlockErrorText}>{unlockError}</Text>
          ) : null}
        </View>
      )}

      {/* Keys loading banner (not ready, no password needed) */}
      {!keysReady && !keysNeedPassword && (
        <View style={styles.loadingKeysBanner}>
          <Lock size={14} color="#92400e" />
          <Text style={styles.bannerText}>Loading encryption keys…</Text>
        </View>
      )}

      {/* E2E badge */}
      <View style={styles.encryptionBadge}>
        <Lock size={10} color="#666" />
        <Text style={styles.encryptionText}>End-to-end encrypted</Text>
      </View>

      {/* Block banners */}
      {isBlocked && (
        <View
          style={[styles.blockBanner, { backgroundColor: theme.bgSecondary }]}
        >
          <Text style={styles.blockText}>You blocked this contact. </Text>
          <TouchableOpacity onPress={handleUnblock}>
            <Text style={styles.unblockLink}>Unblock</Text>
          </TouchableOpacity>
        </View>
      )}
      {isBlockedByOther && (
        <View style={styles.blockedByOtherBanner}>
          <Text style={styles.blockedByOtherText}>
            You can't reply to this conversation.
          </Text>
        </View>
      )}

      {loadingMessages ? (
        <ActivityIndicator style={{ flex: 1 }} color="#FF9933" />
      ) : (
        <FlatList
          ref={flatListRef}
          data={flatListData}
          inverted // Index 0 is at bottom
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingVertical: 12,
            backgroundColor: theme.bgPrimary,
          }}
        />
      )}

      {isContactTyping && !isBlocked && !isBlockedByOther && (
        <TypingIndicator userName={contactData?.name} />
      )}

      <MessageInput
        onSendMessage={handleSendMessage}
        isTyping={isUserTyping}
        onTypingChange={setIsUserTyping}
        disabled={isBlocked || isBlockedByOther}
        placeholder={
          isBlocked
            ? "You blocked this contact"
            : isBlockedByOther
              ? "You can't reply"
              : "Type a message..."
        }
      />

      <ChatOptionsModal
        isOpen={isOptionsModalOpen}
        onClose={() => setIsOptionsModalOpen(false)}
        onAction={(actionType) => {
          handleQuickAction(actionType);
          setIsOptionsModalOpen(false);
        }}
        contactName={contactData?.name}
        isBlocked={isBlocked}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  errorBanner: {
    backgroundColor: "#fef2f2",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderBottomWidth: 1,
    borderColor: "#fee2e2",
  },
  errorBannerText: {
    fontSize: 12,
    color: "#991b1b",
    fontWeight: "500",
    flex: 1,
  },
  unlockBanner: {
    backgroundColor: "#fffbeb",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#fde68a",
  },
  loadingKeysBanner: {
    backgroundColor: "#fffbeb",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderBottomWidth: 1,
    borderColor: "#fde68a",
  },
  bannerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  bannerText: {
    fontSize: 12,
    color: "#92400e",
    fontWeight: "500",
    flex: 1,
  },
  unlockInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  unlockInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#fcd34d",
    borderRadius: 4,
    paddingHorizontal: 10,
    height: 26,
    fontSize: 13,
  },
  unlockButton: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 15,
    justifyContent: "center",
    borderRadius: 4,
  },
  unlockButtonDisabled: {
    opacity: 0.5,
  },
  unlockButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  unlockErrorText: {
    fontSize: 11,
    color: "#dc2626",
    marginTop: 4,
  },
  encryptionBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
  },
  encryptionText: {
    fontSize: 11,
    color: "#666",
  },
  blockBanner: {
    backgroundColor: "#fef9c3",
    padding: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#fef08a",
  },
  blockText: {
    fontSize: 13,
    color: "#854d0e",
  },
  unblockLink: {
    fontSize: 13,
    color: "#2563eb",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  blockedByOtherBanner: {
    backgroundColor: "#f3f4f6",
    padding: 10,
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  blockedByOtherText: {
    fontSize: 13,
    color: "#4b5563",
  },
});

export default ChatInterface;
