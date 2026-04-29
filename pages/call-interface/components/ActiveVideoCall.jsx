import {
  Mic,
  MicOff,
  Phone,
  SwitchCamera,
  Video,
  VideoOff,
} from "lucide-react-native";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RTCView } from "react-native-webrtc";
import { getProfilePhotoUrl } from "../../../helper/DefaultImageUrl";

// ─── ActiveVideoCall (native) ─────────────────────────────────────────────
//
// Key differences from web:
//  • Uses RTCView instead of <video>. RTCView requires a `streamURL` string
//    (obtained from stream.toURL()), NOT a ref object.
//  • localStreamURL / remoteStreamURL are passed as plain strings from CallContext.
//  • Camera toggle must also call track.enabled = false/true — not just setState.
//    The parent CallContext owns the stream; this component only fires onToggleVideo.
//    Make sure CallContext does: localStream.getVideoTracks()[0].enabled = !current
//  • Flip camera is always shown on native (all phones have front+back).
//  • No play() needed — RTCView handles playback automatically.
//  • Mirror transform on local PiP is done via StyleSheet (scaleX: -1).
//
const ActiveVideoCall = ({
  contact,
  onEndCall,
  isMuted,
  onToggleMute,
  isVideoOn,
  onToggleVideo,
  duration,
  onSwitchCamera,
  // These are stream.toURL() strings, NOT refs
  localStreamURL,
  remoteStreamURL,
  hasLocalStream = false,
  hasRemoteStream = false,
}) => {
  const insets = useSafeAreaInsets();
  const photoUrl = getProfilePhotoUrl(contact?.avatar);
  const initials = contact?.name?.[0]?.toUpperCase() || "?";

  // ── Control button ──────────────────────────────────────────────────────
  const ControlBtn = ({ onPress, active, Icon, label, testID }) => (
    <View style={styles.ctrlWrap}>
      <TouchableOpacity
        testID={testID}
        onPress={onPress}
        activeOpacity={0.75}
        style={[styles.ctrlBtn, active && styles.ctrlBtnActive]}
      >
        <Icon size={22} color="#fff" strokeWidth={1.8} />
      </TouchableOpacity>
      <Text style={styles.ctrlLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* ── Remote video — fills entire screen ── */}
      {hasRemoteStream && remoteStreamURL ? (
        <RTCView
          streamURL={remoteStreamURL}
          style={styles.remoteVideo}
          objectFit="cover"
          mirror={false}
          zOrder={0}
        />
      ) : (
        // No-remote-stream placeholder
        <View style={styles.noRemotePlaceholder}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          )}
          <Text style={styles.connectingText}>Connecting video…</Text>
        </View>
      )}

      {/* ── Top gradient overlay ── */}
      <View
        style={[styles.topGradient, { paddingTop: insets.top + 8 }]}
        pointerEvents="none"
      />

      {/* ── Bottom gradient overlay ── */}
      <View style={styles.bottomGradient} pointerEvents="none" />

      {/* ── Overlay UI ── */}
      <View style={[styles.overlay, { paddingTop: insets.top + 8 }]}>
        {/* Top: name + timer */}
        <View style={styles.nameBox}>
          <Text style={styles.contactName}>{contact?.name || "Unknown"}</Text>
          <Text style={styles.durationText}>{duration}</Text>
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* ── Local video PiP — bottom right ── */}
        <View style={styles.pipContainer}>
          {hasLocalStream && localStreamURL && isVideoOn ? (
            <RTCView
              streamURL={localStreamURL}
              style={styles.pipVideo}
              objectFit="cover"
              mirror={true}
              // mirror=true is LOCAL DISPLAY ONLY — WebRTC track to remote is unaffected
              zOrder={1}
            />
          ) : (
            <View style={styles.pipOff}>
              <VideoOff
                size={18}
                color="rgba(255,255,255,0.35)"
                strokeWidth={1.5}
              />
              <Text style={styles.pipOffLabel}>You</Text>
            </View>
          )}
        </View>

        {/* ── Bottom controls ── */}
        <View style={[styles.controls, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.controlsRow}>
            {/* Mute */}
            <ControlBtn
              testID="mute-btn"
              onPress={onToggleMute}
              active={isMuted}
              Icon={isMuted ? MicOff : Mic}
              label={isMuted ? "Unmute" : "Mute"}
            />

            {/* Camera toggle */}
            <ControlBtn
              testID="camera-btn"
              onPress={onToggleVideo}
              active={!isVideoOn}
              Icon={isVideoOn ? Video : VideoOff}
              label={isVideoOn ? "Camera" : "Cam Off"}
            />

            {/* End call — centre, bigger */}
            <View style={styles.ctrlWrap}>
              <TouchableOpacity
                testID="end-call-btn"
                onPress={onEndCall}
                activeOpacity={0.8}
                style={styles.endBtn}
              >
                <Phone
                  size={26}
                  color="#fff"
                  strokeWidth={2}
                  style={{ transform: [{ rotate: "135deg" }] }}
                />
              </TouchableOpacity>
              <Text style={styles.ctrlLabel}>End</Text>
            </View>

            {/* Flip camera — always shown on native (every phone has F+B cam) */}
            <ControlBtn
              testID="flip-btn"
              onPress={onSwitchCamera}
              active={false}
              Icon={SwitchCamera}
              label="Flip"
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  // ── Video layers ──────────────────────────────────────────────────────────
  remoteVideo: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  noRemotePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0f0c29",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 0,
  },
  avatarImg: {
    width: 112,
    height: 112,
    borderRadius: 56,
    marginBottom: 16,
  },
  avatarFallback: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "#667eea",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarInitials: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "700",
  },
  connectingText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    fontWeight: "500",
  },
  // ── Gradient overlays ─────────────────────────────────────────────────────
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    // React Native doesn't support CSS gradients in StyleSheet — use LinearGradient
    // from expo-linear-gradient if you want a true fade. For now, semi-transparent black.
    backgroundColor: "rgba(0,0,0,0.45)",
    zIndex: 1,
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 1,
  },
  // ── UI overlay ────────────────────────────────────────────────────────────
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    flexDirection: "column",
  },
  nameBox: {
    alignSelf: "flex-start",
    marginLeft: 16,
    marginTop: 8,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  contactName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
  },
  durationText: {
    color: "#fbbf24",
    fontSize: 13,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontWeight: "500",
    marginTop: 2,
  },
  // ── PiP ──────────────────────────────────────────────────────────────────
  pipContainer: {
    position: "absolute",
    bottom: 130,
    right: 14,
    width: 100,
    height: 138,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "#111",
    zIndex: 3,
  },
  pipVideo: {
    width: "100%",
    height: "100%",
  },
  pipOff: {
    flex: 1,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  pipOffLabel: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 11,
    marginTop: 4,
  },
  // ── Controls ─────────────────────────────────────────────────────────────
  controls: {
    paddingHorizontal: 24,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    maxWidth: 380,
    alignSelf: "center",
    width: "100%",
  },
  ctrlWrap: {
    alignItems: "center",
    gap: 6,
  },
  ctrlBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  ctrlBtnActive: {
    backgroundColor: "rgba(239,68,68,0.85)",
    borderColor: "rgba(239,68,68,0.6)",
  },
  ctrlLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    marginTop: 4,
  },
  endBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ff416c",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ff416c",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 8,
  },
});

export default ActiveVideoCall;
