import { useAudioPlayer } from "expo-audio";
import { Phone, PhoneOff } from "lucide-react-native";
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

// ─── IncomingAudioCall (native) ───────────────────────────────────────────
//
// Key differences from web:
//  • Ringtone uses expo-audio (AudioContext not available in RN).
//    Web plays 3 tones (880/660/880 Hz). We replicate with a bundled asset.
//  • 3 pulse rings use Animated.loop / Animated.timing (no CSS).
//    Each ring has a staggered delay matching the web (i * 0.4s).
//  • Glow orb behind avatar also uses Animated (matches web radial-gradient pulse).
//  • contact.phone shown below name (matching web).
//  • All layout via StyleSheet + SafeAreaInsets.
//
const IncomingAudioCall = ({ contact, onAccept, onReject }) => {
  const insets = useSafeAreaInsets();
  const photoUrl = getProfilePhotoUrl(contact?.avatar);
  const initials = contact?.name?.[0]?.toUpperCase() || "?";

  // ── Ringtone (expo-audio) ───────────────────────────────────────────────
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

  // ── Three staggered pulse ring animations ────────────────────────────────
  const rings = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    // Delays match web: i * 0.4s → 0ms, 400ms, 800ms
    const delays = [0, 400, 800];
    const loops = rings.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delays[i]),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, []);

  const ringAnimStyle = (anim) => ({
    opacity: anim.interpolate({
      inputRange: [0, 0.3, 1],
      outputRange: [0.5, 0.25, 0],
    }),
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.7, 1.5],
        }),
      },
    ],
  });

  // Ring sizes match web: 160 + i*90 → 250, 340, 430
  const ringSizes = [250, 340, 430];

  // ── Glow orb behind avatar ───────────────────────────────────────────────
  const glowAnim = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1250,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 1250,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [glowAnim]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Pulse rings (behind everything) ── */}
      <View style={styles.ringsLayer} pointerEvents="none">
        {rings.map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              styles.pulseRing,
              {
                width: ringSizes[i],
                height: ringSizes[i],
                borderRadius: ringSizes[i] / 2,
              },
              ringAnimStyle(anim),
            ]}
          />
        ))}
      </View>

      {/* ── Content ── */}
      <View style={styles.content}>
        {/* Top label */}
        <View style={styles.topLabelWrap}>
          <Text style={styles.topLabel}>INCOMING CALL</Text>
        </View>

        {/* Center: glow + avatar + name + phone + status */}
        <View style={styles.center}>
          {/* Glow orb */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.glowOrb,
              { opacity: glowAnim, transform: [{ scale: glowAnim }] },
            ]}
          />

          {/* Avatar */}
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
            <Text style={styles.statusText}>Audio call</Text>
          </View>
        </View>

        {/* Buttons */}
        <View
          style={[styles.buttonsRow, { paddingBottom: insets.bottom + 40 }]}
        >
          {/* Decline */}
          <View style={styles.btnWrap}>
            <TouchableOpacity
              testID="reject-call-btn"
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
              testID="accept-call-btn"
              onPress={onAccept}
              activeOpacity={0.8}
              style={[styles.actionBtn, styles.acceptBtn]}
            >
              <Phone size={28} color="#fff" strokeWidth={2} />
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
    backgroundColor: "#0f0c29",
  },
  ringsLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    // position rings at ~35% from top to align with avatar
    justifyContent: "flex-start",
    paddingTop: "26%",
  },
  pulseRing: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  topLabelWrap: {
    alignItems: "center",
    paddingTop: 28,
  },
  topLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 2.5,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  glowOrb: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,165,0,0.12)",
    // scale to 1.8x visually matches web's `transform: scale(1.8)`
    transform: [{ scale: 1.8 }],
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
    zIndex: 1,
  },
  avatarFallback: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "#f7971e",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
    zIndex: 1,
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
    zIndex: 1,
  },
  phoneNumber: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 15,
    marginBottom: 16,
    textAlign: "center",
    zIndex: 1,
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
    zIndex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ade80",
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

export default IncomingAudioCall;
