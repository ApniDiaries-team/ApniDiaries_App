import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useAudioPlayer } from "expo-audio";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "../../components/AppIcon";
import { Fonts } from "../../constants/theme";
import { AppContext } from "../../context/AppContext";
import { useDarkMode } from "../../context/DarkModeContext";
import { getPopularCities, searchCities } from "../../data/cities";
import { getProfilePhotoUrl } from "../../helper/DefaultImageUrl";
import { createPostApi } from "../../services/posts.api";

const { width } = Dimensions.get("window");

const MAX_FILES = 10;
const MAX_IMG_SZ = 10 * 1024 * 1024;
const MAX_VID_SZ = 100 * 1024 * 1024;
const MAX_VID_SECONDS = 90;
const S = "#FF9933";

const TRIP_TYPES = [
  { value: "solo", label: "Solo", emoji: "🎒" },
  { value: "group", label: "Group", emoji: "👥" },
  { value: "couple", label: "Couple", emoji: "💑" },
  { value: "family", label: "Family", emoji: "👨‍👩‍👧" },
  { value: "adventure", label: "Adventure", emoji: "🏔" },
  { value: "backpacking", label: "Backpack", emoji: "🏕" },
  { value: "road_trip", label: "Road Trip", emoji: "🚗" },
  { value: "spiritual", label: "Spiritual", emoji: "🙏" },
  { value: "food", label: "Foodie", emoji: "🍛" },
  { value: "photography", label: "Photography", emoji: "📸" },
  { value: "leisure", label: "Leisure", emoji: "🌴" },
  { value: "honeymoon", label: "Honeymoon", emoji: "💍" },
];

const PRIVACY_OPTIONS = [
  { value: "public", label: "Everyone", icon: "Globe", desc: "Anyone can see this" },
  { value: "friends", label: "Friends only", icon: "Users", desc: "Only your connections" },
  { value: "private", label: "Only me", icon: "Lock", desc: "Just for yourself" },
];

const STEPS = [
  { label: "Story", hint: "Write your experience" },
  { label: "Media", hint: "Add photos & videos" },
  { label: "Details", hint: "Tags & privacy" },
  { label: "Share", hint: "Review & post" },
];

const fmtBytes = (b) =>
  b < 1048576 ? `${(b / 1024).toFixed(0)}KB` : `${(b / 1048576).toFixed(1)}MB`;

const fmtTime = (s) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

// ─── Step 0: Story ────────────────────────────────────────────────────────────
const StepStory = ({ content, setContent, city, setCity, user, dk }) => {
  const [citySearch, setCitySearch] = useState(city || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showSug, setShowSug] = useState(false);
  const popular = getPopularCities(8);
  const initials =
    user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "??";

  const charsLeft = 5000 - content.length;
  const pct = content.length / 5000;

  const onCityInput = (v) => {
    setCitySearch(v);
    if (!v.trim()) {
      setCity("");
      setSuggestions([]);
      setShowSug(false);
      return;
    }
    const r = searchCities(v.trim(), 6);
    setSuggestions(r);
    setShowSug(r.length > 0);
  };

  const pickCity = (c) => {
    setCity(c);
    setCitySearch(c);
    setShowSug(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Author row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 12,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              overflow: "hidden",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: S,
            }}
          >
            {user?.avatar ? (
              <Image
                source={{ uri: getProfilePhotoUrl(user.avatar) }}
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <Text style={{ color: "#fff", fontFamily: Fonts.inter.bold, fontSize: 12 }}>
                {initials}
              </Text>
            )}
          </View>
          <View>
            <Text style={{ fontSize: 14, fontFamily: Fonts.inter.bold, color: dk ? "#fff" : "#0f172a" }}>
              {user?.name}
            </Text>
            <Text style={{ fontSize: 12, color: "#94a3b8" }}>Sharing a travel story…</Text>
          </View>
        </View>

        {/* Text area */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 8, position: "relative" }}>
          <TextInput
            autoFocus
            multiline
            value={content}
            onChangeText={(v) => setContent(v.slice(0, 5000))}
            placeholder={"What happened? What did you feel?\nShare the moment that made this trip unforgettable…"}
            placeholderTextColor="#94a3b8"
            style={{
              width: "100%",
              minHeight: 180,
              fontSize: 16,
              lineHeight: 26,
              textAlignVertical: "top",
              fontFamily: Fonts.inter.regular,
              color: dk ? "#fff" : "#0f172a",
              letterSpacing: -0.16,
            }}
          />
          {content.length > 0 && (
            <View
              style={{
                position: "absolute",
                bottom: 12,
                right: 20,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  borderWidth: 2,
                  borderColor: pct > 0.9 ? "#ef4444" : S,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.85,
                }}
              />
              {charsLeft < 200 && (
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: Fonts.inter.bold,
                    color: charsLeft < 50 ? "#ef4444" : "#94a3b8",
                  }}
                >
                  {charsLeft}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Destination */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
          <View style={{ position: "relative" }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 16,
                backgroundColor: "rgba(255,153,51,0.07)",
                borderWidth: 1.5,
                borderColor: "rgba(255,153,51,0.2)",
              }}
            >
              <Icon name="MapPin" size={15} color={S} strokeWidth={2.5} />
              <TextInput
                value={citySearch}
                onChangeText={onCityInput}
                onFocus={() => { if (suggestions.length > 0) setShowSug(true); }}
                onBlur={() => setTimeout(() => setShowSug(false), 150)}
                placeholder="Where did you go?  (required)"
                placeholderTextColor="#94a3b8"
                style={{
                  flex: 1,
                  fontSize: 14,
                  fontFamily: Fonts.inter.semibold,
                  color: dk ? "#fff" : "#0f172a",
                }}
              />
              {city ? <Icon name="Check" size={14} color={S} /> : null}
            </View>

            {showSug && suggestions.length > 0 && (
              <View
                style={{
                  position: "absolute",
                  bottom: "100%",
                  left: 0,
                  right: 0,
                  marginBottom: 4,
                  borderRadius: 16,
                  overflow: "hidden",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.12,
                  shadowRadius: 12,
                  elevation: 8,
                  zIndex: 10,
                  backgroundColor: dk ? "#1a1a1a" : "#fff",
                  borderWidth: 1,
                  borderColor: "rgba(0,0,0,0.08)",
                  maxHeight: 200,
                }}
              >
                {suggestions.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => pickCity(c)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: dk ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                    }}
                  >
                    <Icon name="MapPin" size={12} color={S} />
                    <Text style={{ fontSize: 14, color: dk ? "#fff" : "#0f172a" }}>{c}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {!city && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 8 }}
              contentContainerStyle={{ gap: 6 }}
            >
              {popular.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => pickCity(c)}
                  style={{
                    flexShrink: 0,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 100,
                    backgroundColor: "rgba(0,0,0,0.04)",
                    borderWidth: 1,
                    borderColor: "rgba(0,0,0,0.08)",
                  }}
                >
                  <Text style={{ fontSize: 11, fontFamily: Fonts.inter.bold, color: "#94a3b8" }}>
                    {c}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

// ─── WaveformTrimmer ──────────────────────────────────────────────────────────
// Matches web: drag start/end handles and slide window, with playhead
// Uses absolute position tracking (like web's dragStart ref pattern)

const BARS = Array.from({ length: 80 }, (_, i) =>
  30 + Math.sin(i * 0.37) * 22 + Math.sin(i * 1.2) * 14 + Math.sin(i * 2.9) * 8
);
const TRACK_W = width - 40 - 32; // screen - horizontal padding - panel padding

const WaveformTrimmer = ({ duration, trimStart, trimEnd, currentTime, onChange, dk }) => {
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  // Store latest values in refs so PanResponder callbacks always see fresh values
  const stateRef = useRef({ trimStart, trimEnd });
  useEffect(() => { stateRef.current = { trimStart, trimEnd }; }, [trimStart, trimEnd]);

  // ── START handle PanResponder ──────────────────────────────────────────────
  const startDragOrigin = useRef({ x: 0, startVal: 0, endVal: 0 });
  const startPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, g) => {
        startDragOrigin.current = {
          x: g.x0,
          startVal: stateRef.current.trimStart,
          endVal: stateRef.current.trimEnd,
        };
      },
      onPanResponderMove: (_, g) => {
        const dx = (g.moveX - startDragOrigin.current.x) / TRACK_W * duration;
        const { startVal, endVal } = startDragOrigin.current;
        const ns = clamp(startVal + dx, 0, endVal - 1);
        // Cap end so window doesn't exceed 30s
        const ne = endVal - startVal + ns > 30 ? ns + 30 : endVal;
        onChange(ns, clamp(ne, ns + 1, duration));
      },
      onPanResponderRelease: () => { },
    })
  ).current;

  // ── END handle PanResponder ────────────────────────────────────────────────
  const endDragOrigin = useRef({ x: 0, startVal: 0, endVal: 0 });
  const endPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, g) => {
        endDragOrigin.current = {
          x: g.x0,
          startVal: stateRef.current.trimStart,
          endVal: stateRef.current.trimEnd,
        };
      },
      onPanResponderMove: (_, g) => {
        const dx = (g.moveX - endDragOrigin.current.x) / TRACK_W * duration;
        const { startVal, endVal } = endDragOrigin.current;
        const ne = clamp(endVal + dx, startVal + 1, duration);
        // Cap start so window doesn't exceed 30s
        const ns = ne - endVal + startVal < ne - 30 ? ne - 30 : startVal;
        onChange(clamp(ns, 0, ne - 1), ne);
      },
      onPanResponderRelease: () => { },
    })
  ).current;

  // ── WINDOW drag PanResponder ───────────────────────────────────────────────
  const windowDragOrigin = useRef({ x: 0, startVal: 0, endVal: 0 });
  const windowPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, g) => {
        windowDragOrigin.current = {
          x: g.x0,
          startVal: stateRef.current.trimStart,
          endVal: stateRef.current.trimEnd,
        };
      },
      onPanResponderMove: (_, g) => {
        const dx = (g.moveX - windowDragOrigin.current.x) / TRACK_W * duration;
        const { startVal, endVal } = windowDragOrigin.current;
        const windowLen = endVal - startVal;
        const ns = clamp(startVal + dx, 0, duration - windowLen);
        onChange(ns, ns + windowLen);
      },
      onPanResponderRelease: () => { },
    })
  ).current;

  const startPct = (trimStart / duration) * 100;
  const endPct = (trimEnd / duration) * 100;
  const playPct = currentTime != null ? (currentTime / duration) * 100 : null;
  const HANDLE_W = 24;

  return (
    <View style={{ marginBottom: 8 }}>
      {/* Track */}
      <View
        style={{
          height: 56,
          borderRadius: 12,
          overflow: "hidden",
          backgroundColor: "rgba(0,0,0,0.08)",
          position: "relative",
          width: TRACK_W,
        }}
      >
        {/* Waveform bars */}
        <View
          style={{
            position: "absolute",
            top: 0, bottom: 0, left: 4, right: 4,
            flexDirection: "row",
            alignItems: "center",
            gap: 1,
          }}
          pointerEvents="none"
        >
          {BARS.map((h, i) => {
            const pct = i / BARS.length;
            const inClip = pct >= trimStart / duration && pct <= trimEnd / duration;
            return (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: `${h}%`,
                  borderRadius: 2,
                  backgroundColor: inClip ? S : "rgba(0,0,0,0.18)",
                }}
              />
            );
          })}
        </View>

        {/* Dim left of selection */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0, bottom: 0, left: 0,
            width: `${startPct}%`,
            backgroundColor: "rgba(0,0,0,0.28)",
          }}
        />
        {/* Dim right of selection */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0, bottom: 0, right: 0,
            width: `${100 - endPct}%`,
            backgroundColor: "rgba(0,0,0,0.28)",
          }}
        />

        {/* Selection border */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0, bottom: 0,
            left: `${startPct}%`,
            width: `${endPct - startPct}%`,
            borderWidth: 2,
            borderColor: S,
            borderRadius: 6,
          }}
        />

        {/* Window drag zone — sits between handles */}
        <View
          {...windowPan.panHandlers}
          style={{
            position: "absolute",
            top: 0, bottom: 0,
            left: `${startPct}%`,
            width: `${endPct - startPct}%`,
          }}
        />

        {/* START handle */}
        <View
          {...startPan.panHandlers}
          style={{
            position: "absolute",
            top: 0, bottom: 0,
            left: `${startPct}%`,
            width: HANDLE_W,
            marginLeft: -(HANDLE_W / 2),
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <View
            style={{
              width: 16,
              height: 32,
              borderTopLeftRadius: 6,
              borderBottomLeftRadius: 6,
              backgroundColor: S,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: S,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.5,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            {[0, 1, 2].map((k) => (
              <View
                key={k}
                style={{
                  width: 2,
                  height: 10,
                  borderRadius: 1,
                  backgroundColor: "rgba(255,255,255,0.8)",
                  marginVertical: 1,
                }}
              />
            ))}
          </View>
        </View>

        {/* END handle */}
        <View
          {...endPan.panHandlers}
          style={{
            position: "absolute",
            top: 0, bottom: 0,
            left: `${endPct}%`,
            width: HANDLE_W,
            marginLeft: -(HANDLE_W / 2),
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <View
            style={{
              width: 16,
              height: 32,
              borderTopRightRadius: 6,
              borderBottomRightRadius: 6,
              backgroundColor: S,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: S,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.5,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            {[0, 1, 2].map((k) => (
              <View
                key={k}
                style={{
                  width: 2,
                  height: 10,
                  borderRadius: 1,
                  backgroundColor: "rgba(255,255,255,0.8)",
                  marginVertical: 1,
                }}
              />
            ))}
          </View>
        </View>

        {/* Playhead — mirrors web's white line at currentTime */}
        {playPct != null && (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${playPct}%`,
              width: 2,
              backgroundColor: "#fff",
              shadowColor: "#fff",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.9,
              shadowRadius: 4,
            }}
          />
        )}
      </View>

      {/* Time labels */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 6,
          paddingHorizontal: 2,
        }}
      >
        <Text style={{ fontSize: 11, fontFamily: Fonts.inter.bold, color: S }}>
          {fmtTime(trimStart)}
        </Text>
        <Text style={{ fontSize: 10, color: "#94a3b8" }}>drag handles or slide window</Text>
        <Text style={{ fontSize: 11, fontFamily: Fonts.inter.bold, color: S }}>
          {fmtTime(trimEnd)}
        </Text>
      </View>
    </View>
  );
};

// ─── Step 1: Media + Music ────────────────────────────────────────────────────
const StepMedia = ({ mediaItems, setMediaItems, music, setMusic, dk }) => {
  // Main preview player
  const mainPlayer = useAudioPlayer(music?.uri || null);
  const [playing, setPlaying] = useState(false);

  // Trim preview player — separate instance, mirrors web's trimAudioRef
  const trimPlayer = useAudioPlayer(music?.uri || null);
  const [trimPlaying, setTrimPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const trimIntervalRef = useRef(null);

  const [showTrim, setShowTrim] = useState(false);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(30);

  const hasMedia = mediaItems.length > 0;
  const hasImages = mediaItems.some((m) => m.type === "image");

  const stopTrimInterval = () => {
    if (trimIntervalRef.current) {
      clearInterval(trimIntervalRef.current);
      trimIntervalRef.current = null;
    }
  };

  useEffect(() => {
    if (music && music.duration === 0 && mainPlayer?.isLoaded) {
      const dur = mainPlayer.duration;
      const clipEnd = dur > 0 ? Math.min(30, dur) : 30;
      setTrimEnd(clipEnd);
      setMusic(m => m ? { ...m, duration: dur, trimEnd: clipEnd } : null);
      if (dur > 30) {
        setShowTrim(true);
      }
    }
  }, [music, mainPlayer?.isLoaded, mainPlayer?.duration]);

  // ── Main play/pause toggle — matches web's togglePlay ────────────────────
  const togglePlay = () => {
    if (!music || !mainPlayer) return;

    if (playing) {
      try { mainPlayer.pause(); } catch {}
      setPlaying(false);
    } else {
      try { mainPlayer.play(); } catch {}
      setPlaying(true);
    }
  };

  // ── Trim preview — matches web's playTrimPreview ──────────────────────────
  const playTrimPreview = () => {
    if (!music || !trimPlayer) return;

    if (trimPlaying) {
      try { trimPlayer.pause(); } catch {}
      stopTrimInterval();
      setTrimPlaying(false);
      setCurrentTime(trimStart);
      return;
    }

    try {
      trimPlayer.seekTo(trimStart);
      trimPlayer.play();
    } catch {}
    setTrimPlaying(true);
    setCurrentTime(trimStart);

    stopTrimInterval();
    trimIntervalRef.current = setInterval(() => {
      const pos = trimPlayer.currentTime;
      setCurrentTime(pos);
      if (pos >= trimEnd || !trimPlayer.playing) {
        try { trimPlayer.pause(); } catch {}
        stopTrimInterval();
        setTrimPlaying(false);
      }
    }, 100);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopTrimInterval();
  }, []);

  useEffect(() => {
    setPlaying(false);
    setTrimPlaying(false);
  }, [music?.uri]);

  // ── Pick media ──────────────────────────────────────────────────────────────
  const pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: MAX_FILES - mediaItems.length,
    });

    if (!result.canceled) {
      const valid = [];
      for (const asset of result.assets) {
        if (asset.type === "video") {
          if (asset.duration && asset.duration > MAX_VID_SECONDS * 1000) {
            Alert.alert("Video too long", "Max duration is 1 min 30 sec.");
            continue;
          }
          if (asset.fileSize && asset.fileSize > MAX_VID_SZ) {
            Alert.alert("File too large", "Video must be under 100MB.");
            continue;
          }
        } else {
          if (asset.fileSize && asset.fileSize > MAX_IMG_SZ) {
            Alert.alert("File too large", "Image must be under 10MB.");
            continue;
          }
        }
        valid.push({
          id: asset.assetId || `${Date.now()}-${Math.random()}`,
          uri: asset.uri,
          type: asset.type || "image",
          fileSize: asset.fileSize || 0,
          duration: asset.duration || 0,
        });
      }
      setMediaItems((prev) => [...prev, ...valid].slice(0, MAX_FILES));
    }
  };

  const removeMedia = (id) => setMediaItems((prev) => prev.filter((m) => m.id !== id));

  // ── Pick music ──────────────────────────────────────────────────────────────
  const pickMusic = async () => {
    try {
      const DocumentPicker = require("expo-document-picker");
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      if (file.size > 50 * 1024 * 1024) {
        Alert.alert("File too large", "Music file must be under 50MB.");
        return;
      }

      stopTrimInterval();
      setPlaying(false);
      setTrimPlaying(false);

      setTrimStart(0);
      setTrimEnd(30);
      setCurrentTime(0);
      setShowTrim(false);

      setMusic({
        uri: file.uri,
        name: file.name?.replace(/\.[^.]+$/, "") || "Audio",
        size: file.size || 0,
        duration: 0,
        trimStart: 0,
        trimEnd: 30,
      });
    } catch {
      Alert.alert("Error", "Could not pick music file.");
    }
  };

  const removeMusic = () => {
    stopTrimInterval();
    setPlaying(false);
    setTrimPlaying(false);
    setShowTrim(false);
    setCurrentTime(0);
    setMusic(null);
  };

  // onChange matches web: receives (start, end) directly — not an updater fn
  const handleTrimChange = (ns, ne) => {
    setTrimStart(ns);
    setTrimEnd(ne);
  };

  const saveTrim = () => {
    setMusic((p) => ({ ...p, trimStart, trimEnd }));
    setShowTrim(false);
    Alert.alert("Clip saved", `${fmtTime(trimStart)} – ${fmtTime(trimEnd)}`);
  };

  const photoCount = mediaItems.filter((m) => m.type === "image").length;
  const videoCount = mediaItems.filter((m) => m.type === "video").length;

  return (
    <ScrollView
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 }}
    >
      {/* Drop / upload zone */}
      {!hasMedia ? (
        <Pressable
          onPress={pickMedia}
          style={{
            width: "100%",
            minHeight: 160,
            borderRadius: 16,
            borderWidth: 2,
            borderStyle: "dashed",
            borderColor: "rgba(0,0,0,0.12)",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.02)",
            paddingVertical: 40,
            gap: 12,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,153,51,0.1)",
            }}
          >
            <Icon name="Image" size={26} color={S} strokeWidth={2.5} />
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 14, fontFamily: Fonts.inter.bold, color: dk ? "#fff" : "#0f172a" }}>
              Add photos & videos
            </Text>
            <Text style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
              Tap · up to {MAX_FILES} files
            </Text>
          </View>
        </Pressable>
      ) : (
        <View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {mediaItems.map((item) => {
              const isV = item.type === "video";
              return (
                <View
                  key={item.id}
                  style={{
                    width: (width - 56) / 3,
                    aspectRatio: 1,
                    borderRadius: 12,
                    overflow: "hidden",
                    backgroundColor: "#000",
                  }}
                >
                  <Image
                    source={{ uri: item.uri }}
                    style={{ width: "100%", height: "100%", opacity: isV ? 0.85 : 1 }}
                    resizeMode="cover"
                  />
                  {isV && (
                    <View
                      style={{
                        position: "absolute",
                        top: 0, bottom: 0, left: 0, right: 0,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: "rgba(0,0,0,0.5)",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon name="Play" size={14} color="#fff" fill="#fff" />
                      </View>
                    </View>
                  )}
                  <Pressable
                    onPress={() => removeMedia(item.id)}
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: "rgba(0,0,0,0.65)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name="X" size={11} color="#fff" />
                  </Pressable>
                  {item.fileSize > 0 && (
                    <View
                      style={{
                        position: "absolute",
                        bottom: 4,
                        left: 4,
                        backgroundColor: "rgba(0,0,0,0.4)",
                        borderRadius: 4,
                        paddingHorizontal: 4,
                        paddingVertical: 1,
                      }}
                    >
                      <Text style={{ fontSize: 9, color: "rgba(255,255,255,0.75)" }}>
                        {fmtBytes(item.fileSize)}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
            {mediaItems.length < MAX_FILES && (
              <Pressable
                onPress={pickMedia}
                style={{
                  width: (width - 56) / 3,
                  aspectRatio: 1,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderStyle: "dashed",
                  borderColor: "rgba(0,0,0,0.12)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="Plus" size={22} color="rgba(0,0,0,0.3)" />
              </Pressable>
            )}
          </View>
          <Text
            style={{
              fontSize: 11,
              textAlign: "center",
              marginTop: 8,
              color: "#94a3b8",
              fontFamily: Fonts.inter.semibold,
            }}
          >
            {mediaItems.length}/{MAX_FILES} ·{" "}
            {photoCount > 0 ? `${photoCount} photo${photoCount > 1 ? "s" : ""}` : ""}
            {videoCount > 0 ? ` · ${videoCount} video${videoCount > 1 ? "s" : ""}` : ""}
          </Text>
        </View>
      )}

      {/* ── Music section — only when images present ── */}
      {hasMedia && hasImages && (
        <View style={{ marginTop: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Icon name="Music" size={15} color={S} />
            <Text style={{ fontSize: 14, fontFamily: Fonts.inter.bold, color: dk ? "#fff" : "#0f172a" }}>
              Background music
            </Text>
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 100,
                backgroundColor: "rgba(255,153,51,0.12)",
              }}
            >
              <Text style={{ fontSize: 10, fontFamily: Fonts.inter.bold, color: S }}>
                For images only
              </Text>
            </View>
          </View>

          {!music ? (
            <Pressable
              onPress={pickMusic}
              style={{
                width: "100%",
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderRadius: 16,
                backgroundColor: "rgba(255,153,51,0.06)",
                borderWidth: 1.5,
                borderStyle: "dashed",
                borderColor: "rgba(255,153,51,0.3)",
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255,153,51,0.15)",
                  flexShrink: 0,
                }}
              >
                <Icon name="Music" size={18} color={S} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: Fonts.inter.bold,
                    color: dk ? "#fff" : "#0f172a",
                  }}
                >
                  Add a song
                </Text>
                <Text style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
                  MP3, AAC, M4A · any length · max 50MB
                </Text>
              </View>
              <Icon name="Plus" size={18} color={S} />
            </Pressable>
          ) : (
            <View style={{ gap: 8 }}>
              {/* Music row */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 16,
                  backgroundColor: "rgba(255,153,51,0.08)",
                  borderWidth: 1.5,
                  borderColor: "rgba(255,153,51,0.25)",
                }}
              >
                {/* Main play/pause */}
                <Pressable
                  onPress={togglePlay}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: S,
                    flexShrink: 0,
                  }}
                >
                  <Icon
                    name={playing ? "Pause" : "Play"}
                    size={16}
                    color="#fff"
                    fill={playing ? undefined : "#fff"}
                  />
                </Pressable>

                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 14,
                      fontFamily: Fonts.inter.bold,
                      color: dk ? "#fff" : "#0f172a",
                    }}
                  >
                    {music.name}
                  </Text>
                  {music.trimStart !== undefined && music.trimEnd !== undefined ? (
                    <Text style={{ fontSize: 11, fontFamily: Fonts.inter.bold, color: S }}>
                      Clip: {fmtTime(music.trimStart)} – {fmtTime(music.trimEnd)} (
                      {Math.round(music.trimEnd - music.trimStart)}s)
                    </Text>
                  ) : playing ? (
                    // Music bars animation when playing
                    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 2, height: 12, marginTop: 2 }}>
                      {[0, 1, 2, 3, 4].map((i) => (
                        <View
                          key={i}
                          style={{
                            width: 2.5,
                            height: "100%",
                            borderRadius: 2,
                            backgroundColor: S,
                          }}
                        />
                      ))}
                    </View>
                  ) : (
                    <Text style={{ fontSize: 11, color: "#94a3b8" }}>Tap ▶ to preview</Text>
                  )}
                </View>

                {/* Trim button — only show if duration > 0 */}
                {music.duration > 0 && (
                  <Pressable
                    onPress={() => setShowTrim((p) => !p)}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 12,
                      backgroundColor: showTrim ? S : "rgba(255,153,51,0.12)",
                      flexShrink: 0,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontFamily: Fonts.inter.bold,
                        color: showTrim ? "#fff" : S,
                      }}
                    >
                      ✂️ Trim
                    </Text>
                  </Pressable>
                )}

                <Pressable
                  onPress={removeMusic}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(0,0,0,0.08)",
                    flexShrink: 0,
                  }}
                >
                  <Icon name="X" size={13} color="#94a3b8" />
                </Pressable>
              </View>

              {/* ── Trim panel — only when duration > 0, mirrors web ── */}
              {showTrim && music.duration > 0 && (
                <View
                  style={{
                    borderRadius: 16,
                    backgroundColor: "rgba(255,153,51,0.06)",
                    borderWidth: 1.5,
                    borderColor: "rgba(255,153,51,0.2)",
                    padding: 16,
                  }}
                >
                  {/* Header */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: Fonts.inter.bold,
                        color: dk ? "#fff" : "#0f172a",
                      }}
                    >
                      Select clip · max 30 sec
                    </Text>
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 100,
                        backgroundColor: "rgba(255,153,51,0.15)",
                      }}
                    >
                      <Text style={{ fontSize: 11, fontFamily: Fonts.inter.bold, color: S }}>
                        {Math.round(trimEnd - trimStart)}s selected
                      </Text>
                    </View>
                  </View>

                  {/* Waveform trimmer with playhead */}
                  <WaveformTrimmer
                    duration={music.duration > 0 ? music.duration : 60}
                    trimStart={trimStart}
                    trimEnd={trimEnd}
                    currentTime={trimPlaying ? currentTime : null}
                    onChange={handleTrimChange}
                    dk={dk}
                  />

                  {/* Validation */}
                  {trimEnd - trimStart > 30 && (
                    <Text
                      style={{
                        fontSize: 11,
                        textAlign: "center",
                        fontFamily: Fonts.inter.bold,
                        color: "#ef4444",
                        marginBottom: 8,
                      }}
                    >
                      Clip too long — max 30 seconds
                    </Text>
                  )}

                  {/* Preview + Save row */}
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
                    {/* Trim preview button — separate from main player */}
                    <Pressable
                      onPress={playTrimPreview}
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        paddingVertical: 10,
                        borderRadius: 12,
                        backgroundColor: "rgba(255,153,51,0.12)",
                      }}
                    >
                      <Icon
                        name={trimPlaying ? "Pause" : "Play"}
                        size={13}
                        color={S}
                        fill={trimPlaying ? undefined : S}
                      />
                      <Text style={{ fontSize: 12, fontFamily: Fonts.inter.bold, color: S }}>
                        {trimPlaying ? "Stop preview" : "Preview clip"}
                      </Text>
                    </Pressable>

                    {/* Save trim */}
                    <Pressable
                      onPress={saveTrim}
                      disabled={trimEnd - trimStart > 30 || trimEnd - trimStart < 1}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 12,
                        backgroundColor: S,
                        opacity:
                          trimEnd - trimStart > 30 || trimEnd - trimStart < 1 ? 0.4 : 1,
                        flexShrink: 0,
                      }}
                    >
                      <Icon name="Check" size={13} color="#fff" />
                      <Text style={{ fontSize: 12, fontFamily: Fonts.inter.bold, color: "#fff" }}>
                        Use clip
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          )}

          <Text
            style={{
              fontSize: 10,
              textAlign: "center",
              marginTop: 8,
              color: "#94a3b8",
              opacity: 0.7,
            }}
          >
            Music plays when viewers scroll through your photos
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

// ─── Step 2: Details ──────────────────────────────────────────────────────────
const StepTag = ({ metadata, setMetadata, dk }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const set = (k, v) => setMetadata((p) => ({ ...p, [k]: v }));
  const toggleTrip = (v) =>
    set(
      "tripType",
      metadata.tripType.includes(v)
        ? metadata.tripType.filter((x) => x !== v)
        : [...metadata.tripType, v]
    );

  return (
    <ScrollView
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
    >
      {/* Trip type */}
      <View style={{ marginBottom: 24 }}>
        <Text
          style={{
            fontSize: 14,
            fontFamily: Fonts.inter.bold,
            color: dk ? "#fff" : "#0f172a",
            marginBottom: 12,
          }}
        >
          What kind of trip?{" "}
          <Text style={{ color: "#94a3b8", fontFamily: Fonts.inter.regular }}>(optional)</Text>
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {TRIP_TYPES.map((t) => {
            const active = metadata.tripType.includes(t.value);
            return (
              <Pressable
                key={t.value}
                onPress={() => toggleTrip(t.value)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 100,
                  backgroundColor: active ? S : "rgba(0,0,0,0.04)",
                  borderWidth: 1.5,
                  borderColor: active ? S : "rgba(0,0,0,0.1)",
                  transform: [{ scale: active ? 1.04 : 1 }],
                }}
              >
                <Text style={{ fontSize: 13 }}>{t.emoji}</Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: Fonts.inter.bold,
                    color: active ? "#fff" : "#94a3b8",
                  }}
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Date */}
      <View style={{ marginBottom: 24 }}>
        <Text
          style={{
            fontSize: 14,
            fontFamily: Fonts.inter.bold,
            color: dk ? "#fff" : "#0f172a",
            marginBottom: 10,
          }}
        >
          When did you travel?{" "}
          <Text style={{ color: "#94a3b8", fontFamily: Fonts.inter.regular }}>(optional)</Text>
        </Text>
        <Pressable
          onPress={() => setShowDatePicker(true)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderRadius: 16,
            backgroundColor: "rgba(0,0,0,0.03)",
            borderWidth: 1.5,
            borderColor: "rgba(0,0,0,0.08)",
          }}
        >
          <Icon name="Calendar" size={15} color={S} />
          <Text
            style={{
              fontSize: 14,
              color: metadata.travelDate ? (dk ? "#fff" : "#0f172a") : "#94a3b8",
            }}
          >
            {metadata.travelDate
              ? new Date(metadata.travelDate).toLocaleDateString()
              : "Select date"}
          </Text>
        </Pressable>
        {showDatePicker && (
          <DateTimePicker
            value={metadata.travelDate ? new Date(metadata.travelDate) : new Date()}
            mode="date"
            display="default"
            onChange={(e, date) => {
              setShowDatePicker(false);
              if (date) set("travelDate", date.toISOString());
            }}
          />
        )}
      </View>

      {/* Privacy */}
      <View>
        <Text
          style={{
            fontSize: 14,
            fontFamily: Fonts.inter.bold,
            color: dk ? "#fff" : "#0f172a",
            marginBottom: 10,
          }}
        >
          Who can see this?
        </Text>
        <View style={{ gap: 8 }}>
          {PRIVACY_OPTIONS.map((opt) => {
            const active = metadata.privacy === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => set("privacy", opt.value)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 16,
                  backgroundColor: active
                    ? "rgba(255,153,51,0.08)"
                    : dk
                      ? "#1a1a1a"
                      : "rgba(0,0,0,0.03)",
                  borderWidth: 1.5,
                  borderColor: active ? S : "rgba(0,0,0,0.08)",
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: active ? "rgba(255,153,51,0.15)" : "rgba(0,0,0,0.06)",
                    flexShrink: 0,
                  }}
                >
                  <Icon name={opt.icon} size={15} color={active ? S : "#94a3b8"} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: Fonts.inter.bold,
                      color: active ? S : dk ? "#fff" : "#0f172a",
                    }}
                  >
                    {opt.label}
                  </Text>
                  <Text style={{ fontSize: 11, color: "#94a3b8" }}>{opt.desc}</Text>
                </View>
                {active && <Icon name="Check" size={16} color={S} strokeWidth={3} />}
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

// ─── Step 3: Review ───────────────────────────────────────────────────────────
const StepReview = ({ content, city, mediaItems, music, metadata, user, dk }) => {
  const hasImg = mediaItems.some((m) => m.type === "image");
  const hasVid = mediaItems.some((m) => m.type === "video");

  const rows = [
    {
      label: "Story",
      value: content ? `${content.slice(0, 60)}${content.length > 60 ? "…" : ""}` : null,
    },
    { label: "Destination", value: city },
    {
      label: "Photos",
      value: hasImg ? `${mediaItems.filter((m) => m.type === "image").length} photo(s)` : null,
    },
    {
      label: "Videos",
      value: hasVid ? `${mediaItems.filter((m) => m.type === "video").length} video(s)` : null,
    },
    { label: "Music", value: music ? `🎵 ${music.name}` : null },
    {
      label: "Trip type",
      value: metadata.tripType.length > 0 ? metadata.tripType.join(", ") : null,
    },
    { label: "Date", value: metadata.travelDate || null },
    {
      label: "Audience",
      value: PRIVACY_OPTIONS.find((p) => p.value === metadata.privacy)?.label,
    },
  ].filter((r) => r.value);

  return (
    <ScrollView
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
    >
      {/* Preview thumbnail strip */}
      {mediaItems.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
          contentContainerStyle={{ gap: 8 }}
        >
          {mediaItems.slice(0, 4).map((item) => (
            <View
              key={item.id}
              style={{
                width: 80,
                height: 80,
                borderRadius: 12,
                overflow: "hidden",
                backgroundColor: "#000",
                flexShrink: 0,
              }}
            >
              <Image
                source={{ uri: item.uri }}
                style={{
                  width: "100%",
                  height: "100%",
                  opacity: item.type === "video" ? 0.8 : 1,
                }}
                resizeMode="cover"
              />
            </View>
          ))}
          {mediaItems.length > 4 && (
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0,0,0,0.06)",
                flexShrink: 0,
              }}
            >
              <Text style={{ fontSize: 14, fontFamily: Fonts.inter.bold, color: "#94a3b8" }}>
                +{mediaItems.length - 4}
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Summary card */}
      <View
        style={{
          borderRadius: 16,
          overflow: "hidden",
          borderWidth: 1.5,
          borderColor: "rgba(0,0,0,0.08)",
          marginBottom: 16,
        }}
      >
        {rows.map((row, i) => (
          <View
            key={row.label}
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderTopWidth: i > 0 ? 1 : 0,
              borderTopColor: "rgba(0,0,0,0.06)",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: Fonts.inter.bold,
                width: 80,
                flexShrink: 0,
                paddingTop: 1,
                color: "#94a3b8",
              }}
            >
              {row.label}
            </Text>
            <Text
              style={{
                fontSize: 12,
                flex: 1,
                lineHeight: 18,
                color: dk ? "#fff" : "#0f172a",
              }}
            >
              {row.value}
            </Text>
          </View>
        ))}
      </View>

      {/* Validation feedback */}
      {!content?.trim() && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 16,
            backgroundColor: "rgba(239,68,68,0.08)",
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 12, fontFamily: Fonts.inter.bold, color: "#ef4444" }}>
            ⚠ Story text is required
          </Text>
        </View>
      )}
      {!city && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 16,
            backgroundColor: "rgba(239,68,68,0.08)",
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 12, fontFamily: Fonts.inter.bold, color: "#ef4444" }}>
            ⚠ Destination is required
          </Text>
        </View>
      )}
      {content?.trim() && city && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 16,
            backgroundColor: "rgba(34,197,94,0.08)",
          }}
        >
          <Icon name="Check" size={14} color="#22c55e" />
          <Text style={{ fontSize: 12, fontFamily: Fonts.inter.bold, color: "#16a34a" }}>
            Ready to share!
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const CreatePost = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useContext(AppContext);
  const { isDarkMode: dk } = useDarkMode();

  const [step, setStep] = useState(0);
  const [content, setContent] = useState("");
  const [city, setCity] = useState("");
  const [mediaItems, setMediaItems] = useState([]);
  const [music, setMusic] = useState(null);
  const [metadata, setMetadata] = useState({
    tripType: [],
    travelDate: "",
    privacy: "public",
    allowComments: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    slideAnim.setValue(0);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [step]);

  const canNext =
    step === 0 ? content.trim().length > 0 && city.length > 0 : true;
  const isReady = content.trim() && city;

  const handleBack = () => {
    if (step > 0) {
      setStep((s) => s - 1);
    } else {
      if (content || mediaItems.length > 0) {
        Alert.alert(
          "Leave without saving?",
          "Your changes won't be saved.",
          [
            { text: "Continue Editing", style: "cancel" },
            {
              text: "Leave",
              style: "destructive",
              onPress: () => router.push("/community-posts"),
            },
          ]
        );
      } else {
        router.push("/community-posts");
      }
    }
  };

  const handleSubmit = async () => {
    if (!isReady) {
      Alert.alert("Missing info", "Add your story and destination first.");
      return;
    }
    setIsSubmitting(true);
    try {
      const postData = {
        content: content.trim(),
        destination: city,
        travel_date: metadata.travelDate || null,
        trip_types: metadata.tripType,
        privacy: metadata.privacy,
        allow_comments: metadata.allowComments,
        is_draft: false,
        music_trim_start: music?.trimStart ?? null,
        music_trim_end: music?.trimEnd ?? null,
        music_name: music?.name || null,
      };
      const files = mediaItems;
      await createPostApi(postData, files, music || null);
      Alert.alert("Story shared! 🎉", "", [
        { text: "OK", onPress: () => router.push("/community-posts") },
      ]);
    } catch {
      Alert.alert("Error", "Failed to share. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const bg = dk ? "#111" : "#fff";
  const bdr = dk ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return (
    <View style={{ flex: 1, backgroundColor: bg, paddingTop: 0 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* ── Header ── */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: bdr,
          }}
        >
          <Pressable
            onPress={handleBack}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0,0,0,0.06)",
            }}
          >
            <Icon
              name={step > 0 ? "ChevronLeft" : "X"}
              size={18}
              color={dk ? "#fff" : "#0f172a"}
            />
          </Pressable>

          {/* Step dots */}
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={{
                  height: 6,
                  width: i === step ? 24 : 6,
                  borderRadius: 3,
                  backgroundColor:
                    i <= step
                      ? S
                      : dk
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(0,0,0,0.12)",
                }}
              />
            ))}
          </View>

          <View style={{ width: 36, alignItems: "flex-end" }}>
            <Text style={{ fontSize: 12, fontFamily: Fonts.inter.bold, color: "#94a3b8" }}>
              {step + 1}/{STEPS.length}
            </Text>
          </View>
        </View>

        {/* ── Step label ── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 }}>
          <Text
            style={{
              fontSize: 12,
              fontFamily: Fonts.inter.bold,
              textTransform: "uppercase",
              letterSpacing: 2,
              color: S,
            }}
          >
            {STEPS[step].label}
          </Text>
          <Text
            style={{
              fontSize: 20,
              fontFamily: Fonts.playfair?.black || Fonts.inter.bold,
              letterSpacing: -0.4,
              color: dk ? "#fff" : "#0f172a",
            }}
          >
            {STEPS[step].hint}
          </Text>
        </View>

        {/* ── Step content ── */}
        <Animated.View
          key={step}
          style={{
            flex: 1,
            opacity: slideAnim,
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          }}
        >
          {step === 0 && (
            <StepStory
              content={content}
              setContent={setContent}
              city={city}
              setCity={setCity}
              user={user}
              dk={dk}
            />
          )}
          {step === 1 && (
            <StepMedia
              mediaItems={mediaItems}
              setMediaItems={setMediaItems}
              music={music}
              setMusic={setMusic}
              dk={dk}
            />
          )}
          {step === 2 && (
            <StepTag metadata={metadata} setMetadata={setMetadata} dk={dk} />
          )}
          {step === 3 && (
            <StepReview
              content={content}
              city={city}
              mediaItems={mediaItems}
              music={music}
              metadata={metadata}
              user={user}
              dk={dk}
            />
          )}
        </Animated.View>

        {/* ── Footer CTA ── */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: insets.bottom + 16,
            borderTopWidth: 1,
            borderTopColor: bdr,
          }}
        >
          {step < 3 ? (
            <Pressable
              onPress={() => canNext && setStep((s) => s + 1)}
              style={{ borderRadius: 16, overflow: "hidden" }}
            >
              <LinearGradient
                colors={
                  canNext
                    ? [S, "#FF6B35"]
                    : dk
                      ? ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.08)"]
                      : ["rgba(0,0,0,0.07)", "rgba(0,0,0,0.07)"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: "100%",
                  paddingVertical: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  shadowColor: canNext ? S : "transparent",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.27,
                  shadowRadius: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: Fonts.inter.bold,
                    color: canNext ? "#fff" : "#94a3b8",
                  }}
                >
                  {step === 0 && !canNext
                    ? "Write your story & add destination first"
                    : STEPS[step + 1].label}
                </Text>
                {canNext && (
                  <Icon name="ChevronRight" size={17} color="#fff" strokeWidth={2.5} />
                )}
              </LinearGradient>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleSubmit}
              disabled={!isReady || isSubmitting}
              style={{
                borderRadius: 16,
                overflow: "hidden",
                opacity: isReady && !isSubmitting ? 1 : 0.5,
              }}
            >
              <LinearGradient
                colors={
                  isReady
                    ? [S, "#FF6B35"]
                    : dk
                      ? ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.08)"]
                      : ["rgba(0,0,0,0.07)", "rgba(0,0,0,0.07)"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: "100%",
                  paddingVertical: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  shadowColor: isReady ? S : "transparent",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.27,
                  shadowRadius: 8,
                }}
              >
                {isSubmitting ? (
                  <>
                    <Animated.View
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                        borderWidth: 2,
                        borderColor: "#fff",
                        borderTopColor: "transparent",
                      }}
                    />
                    <Text
                      style={{ fontSize: 14, fontFamily: Fonts.inter.bold, color: "#fff" }}
                    >
                      Sharing…
                    </Text>
                  </>
                ) : (
                  <>
                    <Icon name="Send" size={16} color="#fff" strokeWidth={2.5} />
                    <Text
                      style={{ fontSize: 14, fontFamily: Fonts.inter.bold, color: "#fff" }}
                    >
                      Share Story
                    </Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>
          )}

          {/* Skip hint for optional steps */}
          {(step === 1 || step === 2) && (
            <Pressable
              onPress={() => setStep((s) => s + 1)}
              style={{ width: "100%", alignItems: "center", paddingTop: 10 }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: Fonts.inter.semibold,
                  color: "#94a3b8",
                }}
              >
                Skip for now →
              </Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default CreatePost;