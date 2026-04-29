import { useAudioPlayer } from "expo-audio";
import { PhoneOff, Video as VideoIcon } from "lucide-react-native";
import { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getProfilePhotoUrl } from "../../../helper/DefaultImageUrl";

// ─── IncomingVideoCall (native) ───────────────────────────────────────────
//
// Key differences from web:
//  • Ringtone uses expo-audio (AudioContext not available in RN).
//    Uses a bundled ringtone asset. Falls back silently if unavailable.
//  • Blurred background photo uses Image with blurRadius prop (built-in RN).
//  • Pulse rings use Animated.loop / Animated.timing (no CSS keyframes).
//  • All layout via StyleSheet + SafeAreaInsets (no Tailwind / className).
//
const IncomingVideoCall = ({ contact, onAccept, onReject }) => {
  const insets = useSafeAreaInsets();
  const photoUrl = getProfilePhotoUrl(contact?.avatar);
  const initials = contact?.name?.[0]?.toUpperCase() || "?";

  // ── Ringtone ────────────────────────────────────────────────────────────
  const player = useAudioPlayer(require("../../../assets/sounds/ringtone.mp3"));

  useEffect(() => {
    let timer;
    if (player) {
      player.loop = true;
      timer = setTimeout(() => {
        try { player.play(); } catch {}
      }, 300);
    }
    return () => {
      clearTimeout(timer);
      if (player) {
        try { player.pause(); } catch {}
      }
    };
  }, [player]);

  // ── Pulse ring animations ───────────────────────────────────────────────
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const makeLoop = (anim, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      );

    const l1 = makeLoop(ring1, 0);
    const l2 = makeLoop(ring2, 500);
    l1.start();
    l2.start();
    return () => {
      l1.stop();
      l2.stop();
    };
  }, [ring1, ring2]);

  const ringStyle = (anim) => ({
    opacity: anim.interpolate({
      inputRange: [0, 0.4, 1],
      outputRange: [0.4, 0.2, 0],
    }),
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.7, 1.4],
        }),
      },
    ],
  });

  return (
    <View style={styles.container}>
      {/* ── Blurred profile photo background ── */}
      {photoUrl ? (
        <Image
          source={{ uri: photoUrl }}
          style={styles.blurredBg}
          blurRadius={20}
          resizeMode="cover"
        />
      ) : null}

      {/* ── Dark overlay gradient ── */}
      <View
        style={[
          styles.overlay,
          { backgroundColor: photoUrl ? "rgba(0,0,0,0.65)" : "#0f0c29" },
        ]}
      />

      {/* ── Pulse rings (centred at avatar position) ── */}
      <View style={styles.ringsContainer} pointerEvents="none">
        {[ring1, ring2].map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              styles.pulseRing,
              {
                width: 200 + (i + 1) * 100,
                height: 200 + (i + 1) * 100,
                borderRadius: (200 + (i + 1) * 100) / 2,
              },
              ringStyle(anim),
            ]}
          />
        ))}
      </View>

      {/* ── Content ── */}
      <View style={[styles.content, { paddingTop: insets.top + 16 }]}>
        {/* Top label */}
        <View style={styles.labelRow}>
          <VideoIcon
            size={14}
            color="rgba(255,255,255,0.4)"
            strokeWidth={1.5}
          />
          <Text style={styles.topLabel}>INCOMING VIDEO CALL</Text>
        </View>

        {/* Center: avatar + name + phone */}
        <View style={styles.center}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          )}

          <Text style={styles.contactName}>
            {contact?.name || "Unknown Caller"}
          </Text>

          {contact?.phone ? (
            <Text style={styles.phoneNumber}>{contact.phone}</Text>
          ) : null}

          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Wants to video call</Text>
          </View>
        </View>

        {/* Buttons */}
        <View
          style={[styles.buttonsRow, { paddingBottom: insets.bottom + 40 }]}
        >
          {/* Decline */}
          <View style={styles.btnWrap}>
            <TouchableOpacity
              testID="reject-video-call-btn"
              onPress={onReject}
              activeOpacity={0.8}
              style={[styles.actionBtn, styles.declineBtn]}
            >
              <PhoneOff size={28} color="#fff" strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.btnLabel}>Decline</Text>
          </View>

          {/* Accept */}
          <View style={styles.btnWrap}>
            <TouchableOpacity
              testID="accept-video-call-btn"
              onPress={onAccept}
              activeOpacity={0.8}
              style={[styles.actionBtn, styles.acceptBtn]}
            >
              <VideoIcon size={28} color="#fff" strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.btnLabel}>Accept</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0f",
  },
  blurredBg: {
    ...StyleSheet.absoluteFillObject,
    transform: [{ scale: 1.1 }],
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  ringsContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    // offset to align with avatar which is ~35% down the screen
    justifyContent: "flex-start",
    paddingTop: "28%",
  },
  pulseRing: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  content: {
    flex: 1,
    zIndex: 2,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 0,
  },
  topLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 2,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  avatarFallback: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "#667eea",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  avatarInitials: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "700",
  },
  contactName: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: "center",
  },
  phoneNumber: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 15,
    marginBottom: 16,
    textAlign: "center",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#60a5fa",
  },
  statusText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    letterSpacing: 0.3,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 64,
    paddingHorizontal: 32,
  },
  btnWrap: {
    alignItems: "center",
    gap: 10,
  },
  actionBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  declineBtn: {
    backgroundColor: "#ff416c",
    shadowColor: "#ff416c",
  },
  acceptBtn: {
    backgroundColor: "#11998e",
    shadowColor: "#38ef7d",
  },
  btnLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
  },
});

export default IncomingVideoCall;
