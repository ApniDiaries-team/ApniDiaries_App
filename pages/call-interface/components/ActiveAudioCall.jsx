import {
  Keyboard,
  Mic,
  MicOff,
  Phone,
  Volume2,
  VolumeX,
} from "lucide-react-native";
import { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getProfilePhotoUrl } from "../../../helper/DefaultImageUrl";

// ─── ActiveAudioCall (native) ─────────────────────────────────────────────
//
// Key differences from web:
//  • Pulse glow uses React Native Animated API (no CSS keyframes).
//  • isSpeaker toggle must call InCallManager.setSpeakerphoneOn() in CallContext.
//    This component fires onToggleSpeaker — the parent wires the native API.
//  • onShowKeypad fires a handler in CallContext / parent screen.
//  • contact.phone is displayed (was missing in original native version).
//  • No <style> or CSS — everything via StyleSheet.
//
const ActiveAudioCall = ({
  contact,
  onEndCall,
  isMuted,
  onToggleMute,
  isSpeaker,
  onToggleSpeaker,
  duration,
  onShowKeypad,
}) => {
  const insets = useSafeAreaInsets();
  const photoUrl = getProfilePhotoUrl(contact?.avatar);
  const initials = contact?.name?.[0]?.toUpperCase() || "?";

  // ── Pulse animation (replaces CSS keyframe pulse) ──────────────────────
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1250,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 1250,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  // ── Control button ──────────────────────────────────────────────────────
  const ControlBtn = ({ onPress, active, Icon, label }) => (
    <View style={styles.ctrlWrap}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
        style={[styles.ctrlBtn, active && styles.ctrlBtnActive]}
      >
        <Icon
          size={24}
          color={active ? "#ffa500" : "rgba(255,255,255,0.85)"}
          strokeWidth={1.8}
        />
      </TouchableOpacity>
      <Text style={styles.ctrlLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Animated glow orb behind avatar */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glowOrb,
          { opacity: pulseAnim, transform: [{ scale: pulseAnim }] },
        ]}
      />

      {/* ── Status pill ── */}
      <View style={styles.statusPillWrap}>
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Connected</Text>
        </View>
      </View>

      {/* ── Center: avatar + name + phone + duration ── */}
      <View style={styles.centerSection}>
        {/* Avatar */}
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
        )}

        {/* Name */}
        <Text style={styles.contactName}>{contact?.name || "Unknown"}</Text>

        {/* Phone number — shown if present */}
        {contact?.phone ? (
          <Text style={styles.phoneNumber}>{contact.phone}</Text>
        ) : null}

        {/* Duration */}
        <Text testID="call-duration" style={styles.duration}>
          {duration}
        </Text>
      </View>

      {/* ── Controls ── */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + 24 }]}>
        {/* Top row: mute, speaker, keypad */}
        <View style={styles.topRow}>
          <ControlBtn
            onPress={onToggleMute}
            active={isMuted}
            Icon={isMuted ? MicOff : Mic}
            label={isMuted ? "Unmute" : "Mute"}
          />
          <ControlBtn
            onPress={onToggleSpeaker}
            active={isSpeaker}
            Icon={isSpeaker ? Volume2 : VolumeX}
            label={isSpeaker ? "Speaker" : "Earpiece"}
          />
          <ControlBtn
            onPress={onShowKeypad}
            active={false}
            Icon={Keyboard}
            label="Keypad"
          />
        </View>

        {/* End call */}
        <View style={styles.endRow}>
          <View style={styles.ctrlWrap}>
            <TouchableOpacity
              testID="end-call-btn"
              onPress={onEndCall}
              activeOpacity={0.8}
              style={styles.endBtn}
            >
              <Phone
                size={28}
                color="#fff"
                strokeWidth={2}
                style={{ transform: [{ rotate: "135deg" }] }}
              />
            </TouchableOpacity>
            <Text style={styles.endLabel}>End Call</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0c29",
  },
  // ── Glow orb ─────────────────────────────────────────────────────────────
  glowOrb: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(255,165,0,0.08)",
    top: "20%",
    alignSelf: "center",
    zIndex: 0,
  },
  // ── Status pill ──────────────────────────────────────────────────────────
  statusPillWrap: {
    alignItems: "center",
    paddingTop: 28,
    zIndex: 1,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "rgba(56,239,125,0.12)",
    borderWidth: 1,
    borderColor: "rgba(56,239,125,0.2)",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4ade80",
  },
  statusText: {
    color: "#38ef7d",
    fontSize: 12,
    fontWeight: "500",
  },
  // ── Center section ────────────────────────────────────────────────────────
  centerSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    zIndex: 1,
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    marginBottom: 28,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
  },
  avatarFallback: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "#f7971e",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
  },
  avatarInitials: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "700",
  },
  contactName: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 4,
    textAlign: "center",
  },
  phoneNumber: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  duration: {
    color: "#ffa500",
    fontSize: 26,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontWeight: "600",
    letterSpacing: 4,
  },
  // ── Controls ─────────────────────────────────────────────────────────────
  controls: {
    paddingHorizontal: 32,
    zIndex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 32,
  },
  endRow: {
    alignItems: "center",
  },
  ctrlWrap: {
    alignItems: "center",
    gap: 6,
  },
  ctrlBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  ctrlBtnActive: {
    backgroundColor: "rgba(255,165,0,0.25)",
    borderColor: "rgba(255,165,0,0.4)",
  },
  ctrlLabel: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
    marginTop: 4,
  },
  endBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#ff416c",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ff416c",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  endLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
    marginTop: 6,
  },
});

export default ActiveAudioCall;
