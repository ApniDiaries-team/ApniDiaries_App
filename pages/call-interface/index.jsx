import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Line, Path } from "react-native-svg";

// Internal Components (Native versions)
import ActiveAudioCall from "./components/ActiveAudioCall";
import ActiveVideoCall from "./components/ActiveVideoCall";
import CallList from "./components/CallList";
import IncomingAudioCall from "./components/IncomingAudioCall";
import IncomingVideoCall from "./components/IncomingVideoCall";

// Hooks & Context
import { AppContext } from "../../context/AppContext";
import useCall from "../../hooks/useCall";
import { socket } from "../../lib/sockets";
import {
  getCallHistory,
  markAllMissedCallsSeen,
} from "../../services/call.api";
import { useCall as useCallContext } from "./context/CallContext";

const { width } = Dimensions.get("window");

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "";
const CALL_START_TIME_KEY = "callStartTime";

// ── Simple DTMF keypad overlay ─────────────────────────────────────────────
const KeypadOverlay = ({ visible, onClose }) => {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.keypadOverlay} onPress={onClose}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <Pressable
          style={styles.keypadContent}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.keypadHandle} />
          <Text style={styles.keypadLabel}>Keypad</Text>
          <View style={styles.keypadGrid}>
            {keys.map((k) => (
              <Pressable key={k} style={styles.keypadKey}>
                <Text style={styles.keypadKeyText}>{k}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={onClose} style={styles.keypadClose}>
            <Text style={styles.keypadCloseText}>Close</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// ── Outgoing ringing screen ────────────────────────────────────────────────
const OutgoingRinging = ({
  contact,
  onCancel,
  callType,
  isMuted,
  onToggleMute,
  hasLocalStream,
  localStreamURL, // FIX: Properly pass local stream URL
}) => {
  const isVideo = callType === "video";

  const photoUrl = (() => {
    const av = contact?.avatar;
    if (!av || av === "?") return null;
    if (av.startsWith("http")) return av;
    return `${BACKEND_URL}/public/images/${av}`;
  })();

  const initials = contact?.name?.[0]?.toUpperCase() || "?";

  return (
    <View style={styles.fullScreen}>
      {/* Background */}
      {photoUrl ? (
        <>
          <Image
            source={{ uri: photoUrl }}
            style={[StyleSheet.absoluteFill, styles.bgPhoto]}
            blurRadius={22}
          />
          <View style={[StyleSheet.absoluteFill, styles.bgOverlay]} />
        </>
      ) : (
        <LinearGradient
          colors={["#0f0c29", "#1a1a3e", "#24243e"]}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* Animated ring hint */}
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          style={[
            styles.ring,
            {
              width: 160 + i * 90,
              height: 160 + i * 90,
              borderRadius: (160 + i * 90) / 2,
              opacity: 0.06 * (4 - i),
            },
          ]}
        />
      ))}

      <View style={styles.outgoingContent}>
        {/* Label */}
        <View style={styles.outgoingTop}>
          <Text style={styles.callTypeLabel}>
            {isVideo ? "Video Call" : "Audio Call"} · Ringing…
          </Text>
        </View>

        {/* Avatar + name */}
        <View style={styles.outgoingCenter}>
          <View style={styles.avatarWrapper}>
            {photoUrl ? (
              <Image source={{ uri: photoUrl }} style={styles.avatar} />
            ) : (
              <LinearGradient
                colors={["#f7971e", "#ffd200"]}
                style={styles.avatar}
              >
                <Text style={styles.avatarInitials}>{initials}</Text>
              </LinearGradient>
            )}
          </View>

          <Text style={styles.contactName}>{contact?.name || "Unknown"}</Text>
          {contact?.phone ? (
            <Text style={styles.contactPhone}>{contact.phone}</Text>
          ) : null}

          <View style={styles.callingBadge}>
            <View style={styles.callingDot} />
            <Text style={styles.callingText}>Calling…</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.outgoingControls}>
          {/* Mute */}
          <View style={styles.controlItem}>
            <Pressable
              onPress={onToggleMute}
              style={[styles.controlBtn, isMuted && styles.controlBtnMuted]}
            >
              <Text style={styles.controlBtnIcon}>{isMuted ? "🔇" : "🎙️"}</Text>
            </Pressable>
            <Text style={styles.controlLabel}>
              {isMuted ? "Unmute" : "Mute"}
            </Text>
          </View>

          {/* Cancel */}
          <View style={styles.controlItem}>
            <Pressable onPress={onCancel} style={styles.declineBtn}>
              <Svg viewBox="0 0 24 24" fill="none" width={28} height={28}>
                <Path
                  d="M5.5 14.5c1.2 1.2 2.6 2.1 4.1 2.8l2.4-2.4 4.5 2.2-.7 3.4C15.8 20.8 10.5 19 6.5 15c-4-4-5.8-9.3-5.5-9.3l3.4-.7 2.2 4.5L4.2 12c.7 1.5 1.6 2.9 2.8 4.1"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <Line
                  x1="2"
                  y1="22"
                  x2="22"
                  y2="2"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </Svg>
            </Pressable>
            <Text style={styles.controlLabel}>Cancel</Text>
          </View>

          {/* Camera preview button, only for video calls */}
          {isVideo && (
            <View style={styles.controlItem}>
              <View style={styles.controlBtn}>
                <View style={styles.cameraPreviewBox}>
                  {hasLocalStream && localStreamURL ? (
                    <CameraPreview localStreamURL={localStreamURL} />
                  ) : (
                    <Text style={styles.cameraPlaceholder}>📷</Text>
                  )}
                </View>
              </View>
              <Text style={styles.controlLabel}>Camera</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

// ── Thin wrapper so RTCView import stays isolated ─────────────────────────
const CameraPreview = ({ localStreamURL }) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { RTCView } = require("react-native-webrtc");
    if (!localStreamURL)
      return <Text style={styles.cameraPlaceholder}>📷</Text>;
    return (
      <RTCView
        streamURL={localStreamURL}
        style={styles.cameraRTCView}
        objectFit="cover"
        mirror
      />
    );
  } catch {
    return <Text style={styles.cameraPlaceholder}>📷</Text>;
  }
};

// ── Main CallContainer ─────────────────────────────────────────────────────
const CallContainer = () => {
  const router = useRouter();
  const { user } = useContext(AppContext);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const {
    call,
    incoming,
    callStatus,
    isRestored,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall: contextEndCall,
  } = useCallContext();

  const callType = call?.callType;
  const isCaller = call?.callerId === user?.id;

  const {
    startCall,
    acceptIncoming,
    setupMedia,
    endCall: webrtcEndCall,
    toggleAudio,
    toggleVideo,
    toggleSpeaker,
    switchCamera,
    hasLocalStream,
    hasRemoteStream,
    localStreamURL,   // ✅ reactive state string
    remoteStreamURL,  // ✅ reactive state string
  } = useCall(); // using without refs

  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(call?.callType === "video");
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [duration, setDuration] = useState(0);
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showKeypad, setShowKeypad] = useState(false);

  const callStartTimeRef = useRef(null);

  useEffect(() => {
    if (callStatus === "active") {
      const initTimer = async () => {
        try {
          const isVideo = call?.callType === "video";
          if (isVideo) {
            setIsSpeaker(true);
          }
          const stored = await AsyncStorage.getItem(CALL_START_TIME_KEY);
          if (stored) {
            callStartTimeRef.current = parseInt(stored, 10);
            setDuration(
              Math.floor((Date.now() - callStartTimeRef.current) / 1000),
            );
          } else {
            const now = Date.now();
            callStartTimeRef.current = now;
            await AsyncStorage.setItem(CALL_START_TIME_KEY, String(now));
          }
        } catch {
          callStartTimeRef.current = Date.now();
          setDuration(0);
        }
      };

      initTimer();

      const interval = setInterval(() => {
        if (callStartTimeRef.current) {
          setDuration(
            Math.floor((Date.now() - callStartTimeRef.current) / 1000),
          );
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      callStartTimeRef.current = null;
      setDuration(0);
      AsyncStorage.removeItem(CALL_START_TIME_KEY).catch(() => { });
    }
  }, [callStatus]);

  useEffect(() => {
    // ✅ PRIORITIZE SIGNALING: If a call is already ringing or active (e.g. on start/restore/incoming), 
    // skip the heavy history fetch. We only need the list when idle.
    if (callStatus === "ringing" || callStatus === "active") {
      setLoading(false);
      return;
    }

    const fetchCalls = async () => {
      try {
        setLoading(true);
        markAllMissedCallsSeen().catch(() => { });
        const response = await getCallHistory();
        const allData = response.data?.data || [];

        // ✅ CHUNK THE LOAD: Process the first 20 items first to keep the JS thread free
        // for subsequent signaling/animations.
        const arr = allData.slice(0, 20);

        setCalls(
          arr.map((c) => ({
            id: c.id,
            contact: {
              id: c.contact?.id,
              name: c.contact?.name || "Unknown",
              avatar: c.contact?.avatar || "?",
              phone: c.contact?.phone || "",
              threadId: c.thread_id,
            },
            type: c.direction,
            status: c.status,
            callType: c.call_type,
            timestamp: c.created_at,
            duration: c.duration || "00:00",
          })),
        );
      } catch {
        setError("Could not load call history.");
      } finally {
        setLoading(false);
      }
    };
    fetchCalls();
  }, [callStatus]); // ✅ Re-fetch only when call status changes to idle

  // ✅ Guard: prevent startCall/acceptIncoming from firing more than once per call.
  // Without this, re-renders while callStatus==="active" spawn multiple RTCPeerConnections.
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (callStatus === "active") {
      if (hasStartedRef.current) return; // already started this call
      hasStartedRef.current = true;
      if (isCaller) startCall();
      else acceptIncoming();
    } else {
      // Reset for next call when status leaves "active"
      if (!["ringing"].includes(callStatus)) {
        hasStartedRef.current = false;
      }
    }
  }, [callStatus, isCaller]); // eslint-disable-line

  useEffect(() => {
    if (callStatus === "ringing" && !incoming && call && isCaller) {
      setupMedia().catch((err) =>
        console.warn("[PreWarm] setupMedia failed:", err.message),
      );
    }
  }, [callStatus, incoming, isCaller]); // eslint-disable-line

  const handleAudioCall = useCallback(
    (callObj) => {
      const contact = callObj.contact || callObj;
      initiateCall({
        receiverId: contact.id,
        threadId: callObj.thread_id || callObj.threadId || contact.threadId,
        callType: "audio",
        contact,
      });
    },
    [initiateCall],
  );

  const handleVideoCall = useCallback(
    (callObj) => {
      const contact = callObj.contact || callObj;
      initiateCall({
        receiverId: contact.id,
        threadId: callObj.thread_id || callObj.threadId || contact.threadId,
        callType: "video",
        contact,
      });
    },
    [initiateCall],
  );

  const handleEndCall = () => webrtcEndCall();

  const handleCancelCall = () => {
    if (call?.id) socket.emit("call:end", { callId: call.id });
    contextEndCall();
  };

  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
    toggleAudio();
  };

  const handleToggleVideo = () => {
    setIsVideoOn((prev) => !prev);
    toggleVideo();
  };

  const handleToggleSpeaker = () => {
    const next = !isSpeaker;
    setIsSpeaker(next);
    toggleSpeaker(next);
  };

  const handleSwitchCamera = () => switchCamera();

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // ── RENDER LOGIC ───────────────────────────────────────────────────────────

  if (callStatus === "ringing" && incoming) {
    const IncomingComp =
      callType === "video" ? IncomingVideoCall : IncomingAudioCall;
    return (
      <IncomingComp
        contact={call?.contact || { name: "Caller", avatar: "?" }}
        onAccept={acceptCall}
        onReject={rejectCall}
      />
    );
  }

  if (callStatus === "ringing" && !incoming && call) {
    return (
      <>
        <OutgoingRinging
          contact={call?.contact}
          onCancel={handleCancelCall}
          callType={callType}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          hasLocalStream={hasLocalStream}
          localStreamURL={localStreamURL} // Passed properly to CameraPreview
        />
      </>
    );
  }

  if (callStatus === "active") {
    if (callType === "video") {
      return (
        <ActiveVideoCall
          contact={call?.contact}
          onEndCall={handleEndCall}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          isVideoOn={isVideoOn}
          onToggleVideo={handleToggleVideo}
          duration={formatDuration(duration)}
          onSwitchCamera={handleSwitchCamera}
          localStreamURL={localStreamURL}
          remoteStreamURL={remoteStreamURL}
          hasLocalStream={hasLocalStream}
          hasRemoteStream={hasRemoteStream}
        />
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <KeypadOverlay
          visible={showKeypad}
          onClose={() => setShowKeypad(false)}
        />
        <ActiveAudioCall
          contact={call?.contact}
          onEndCall={handleEndCall}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          isSpeaker={isSpeaker}
          onToggleSpeaker={handleToggleSpeaker}
          duration={formatDuration(duration)}
          onShowKeypad={() => setShowKeypad(true)}
        />
      </View>
    );
  }

  if (loading) {
    return (
      <LinearGradient
        colors={["#0f0c29", "#1a1a3e"]}
        style={[styles.fullScreen, styles.center]}
      >
        <View style={styles.loadingInner}>
          <ActivityIndicator size="large" color="rgba(255,255,255,0.6)" />
          <Text style={styles.loadingText}>Loading calls…</Text>
        </View>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <View style={[styles.fullScreen, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <CallList
      callHistory={calls}
      onAudioCall={handleAudioCall}
      onVideoCall={handleVideoCall}
      onBack={() => router.back()}
    />
  );
}; // End of CallContainer!

const styles = StyleSheet.create({
  fullScreen: { flex: 1, backgroundColor: "#0a0a10" },
  center: { justifyContent: "center", alignItems: "center" },
  loadingInner: { alignItems: "center", gap: 12 },
  loadingText: { color: "rgba(255,255,255,0.4)", fontSize: 14 },
  errorText: { color: "#f87171", padding: 16, textAlign: "center" },

  hiddenRef: { width: 0, height: 0, position: "absolute" },

  keypadOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  keypadContent: {
    backgroundColor: "#1a1a2e",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  keypadHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "center",
    marginBottom: 20,
  },
  keypadLabel: {
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    fontSize: 12,
    letterSpacing: 4,
    textTransform: "uppercase",
    marginBottom: 20,
  },
  keypadGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginBottom: 32,
  },
  keypadKey: {
    width: 80,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  keypadKeyText: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },
  keypadClose: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignSelf: "center",
  },
  keypadCloseText: { color: "rgba(255,255,255,0.6)", fontSize: 14 },

  bgPhoto: {
    opacity: 0.18,
  },
  bgOverlay: {
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  ring: {
    position: "absolute",
    alignSelf: "center",
    top: "18%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,1)",
  },
  outgoingContent: { flex: 1 },
  outgoingTop: { paddingTop: 56, alignItems: "center" },
  callTypeLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 10,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  outgoingCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  avatarWrapper: { marginBottom: 32, position: "relative" },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
  },
  contactName: {
    color: "white",
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: "center",
  },
  contactPhone: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 14,
    marginBottom: 12,
  },
  callingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginTop: 16,
  },
  callingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#facc15",
  },
  callingText: { color: "rgba(255,255,255,0.4)", fontSize: 12 },
  outgoingControls: {
    paddingBottom: 64,
    paddingHorizontal: 32,
    flexDirection: "row",
    justifyContent: "center",
    gap: 48,
  },
  controlItem: { alignItems: "center", gap: 8 },
  controlBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  controlBtnMuted: {
    backgroundColor: "rgba(255,65,108,0.2)",
    borderColor: "rgba(255,65,108,0.5)",
  },
  controlBtnIcon: { fontSize: 22 },
  declineBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#ff416c",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ff416c",
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  controlLabel: { color: "rgba(255,255,255,0.4)", fontSize: 12 },

  cameraPreviewBox: {
    width: 40,
    height: 28,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#1a2030",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraRTCView: {
    width: "100%",
    height: "100%",
  },
  cameraPlaceholder: { fontSize: 14 },
});

export default CallContainer;
