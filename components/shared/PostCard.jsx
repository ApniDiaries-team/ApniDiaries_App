import { useAudioPlayer } from "expo-audio";
import { useRouter } from "expo-router";
import {
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Music2,
  Play,
  Send,
  Share2,
  Trash2,
  UserPlus,
  X,
} from "lucide-react-native";
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  AppState,
  FlatList,
  Image,
  Modal,
  Pressable,
  Share,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Fonts } from "../../constants/theme";
import { AppContext } from "../../context/AppContext";
import { useDarkMode } from "../../context/DarkModeContext";
import { getProfilePhotoUrl } from "../../helper/DefaultImageUrl";
import { formatLastActive } from "../../helper/LastActiveFormatter";
import {
  addComment,
  deleteComment,
  deletePost,
  getComments,
  getUsersByPostLike,
  toggleLike,
} from "../../services/posts.api";
import { followUser, unFollowUser } from "../../services/user.api";

// ─── Constants ────────────────────────────────────────────────────────────────
const ORANGE = "#FF9933";
const ONE_HOUR = 3_600_000;

const TRIP_COLORS = {
  solo: "#f59e0b",
  group: "#10b981",
  couple: "#ec4899",
  adventure: "#ef4444",
  family: "#3b82f6",
  backpacking: "#f97316",
  spiritual: "#8b5cf6",
  road_trip: "#22c55e",
  honeymoon: "#f472b6",
  food: "#fb923c",
  photography: "#38bdf8",
  leisure: "#84cc16",
  business: "#94a3b8",
};

const isFresh = (d) => d && Date.now() - new Date(d).getTime() < ONE_HOUR;
const isVideo = (u) =>
  /\.(mp4|mov|avi|webm)(\?|$)/i.test(u) || (u || "").includes("video");

// expo-audio handles audio with its hook and returns the player synchronously.

// ─── Global Audio Manager (mirrors web _userHasInteracted pattern) ────────────
//
// Responsibilities:
//   1. Track whether the user has ever tapped to unmute ("audio mode")
//   2. Keep a registry of all mounted card sounds
//   3. Ensure only ONE card plays un-muted at a time
//   4. Stop all audio when AppState goes to background
//
export const AudioManager = (() => {
  // postId → { sound, setMuted, setPlaying, muted }
  const registry = new Map();

  // Has the user ever explicitly tapped to unmute?
  let _audioModeActive = false;

  // Which postId is currently un-muted (playing audibly)?
  let _currentActiveId = null;

  const register = (postId, sound, setMuted, setPlaying) => {
    // ── FIX: Clean up any existing sound for this postId before overwriting ──
    // This prevents "zombie sounds" if the same post is registered multiple times
    // (e.g. going from feed to profile and back).
    const existing = registry.get(postId);
    if (existing?.sound) {
      try {
        existing.sound.pause();
      } catch {}
    }
    registry.set(postId, { sound, setMuted, setPlaying, muted: true });
  };

  const unregister = (postId) => {
    const entry = registry.get(postId);
    if (entry) {
      // Definitive stop and unload
      if (entry.sound) {
        try {
          entry.sound.pause();
        } catch {}
      }
      registry.delete(postId);
      if (_currentActiveId === postId) _currentActiveId = null;
    }
  };

  // Called when a card's Intersection Observer fires (card in view)
  const onCardVisible = async (postId) => {
    const entry = registry.get(postId);
    if (!entry?.sound) return;

    // Pause the previously active card
    if (_currentActiveId && _currentActiveId !== postId) {
      const prev = registry.get(_currentActiveId);
      if (prev?.sound) {
        try {
          prev.sound.pause();
          prev.sound.muted = true;
          prev.muted = true;
          prev.setMuted(true);
          prev.setPlaying(false);
        } catch {}
      }
    }

    _currentActiveId = postId;

    try {
      // If audio mode is active, play un-muted; otherwise play muted
      const shouldMute = !_audioModeActive;
      entry.sound.muted = shouldMute;
      entry.muted = shouldMute;
      entry.setMuted(shouldMute);
      entry.sound.play();
      entry.setPlaying(true);
    } catch {}
  };

  // Called when a card's Intersection Observer fires (card out of view)
  const onCardHidden = async (postId) => {
    const entry = registry.get(postId);
    if (!entry?.sound) return;
    try {
      entry.sound.pause();
      entry.setPlaying(false);
      // Keep muted state as-is so it restores correctly
    } catch {}
    if (_currentActiveId === postId) _currentActiveId = null;
  };

  // Called when user TAPS to unmute a specific card
  // Returns the new muted state
  const onUserTapToggle = async (postId) => {
    const entry = registry.get(postId);
    if (!entry?.sound) return true;

    if (entry.muted) {
      // --- UNMUTING ---
      // Activate audio mode globally
      _audioModeActive = true;

      // Mute all other cards first
      for (const [id, e] of registry.entries()) {
        if (id !== postId && e.sound) {
          try {
            e.sound.pause();
            e.sound.muted = true;
            e.muted = true;
            e.setMuted(true);
            e.setPlaying(false);
          } catch {}
        }
      }

      // Unmute + play this card
      try {
        entry.sound.muted = false;
        entry.muted = false;
        entry.setMuted(false);
        entry.sound.play();
        entry.setPlaying(true);
        _currentActiveId = postId;
      } catch {}

      return false; // now un-muted
    } else {
      // --- MUTING ---
      // Deactivate audio mode globally (all future scroll-ins will be muted)
      _audioModeActive = false;
      _currentActiveId = null;

      try {
        entry.sound.muted = true;
        entry.muted = true;
        entry.setMuted(true);
        // Keep playing but muted (like web el.muted = true)
      } catch {}

      return true; // now muted
    }
  };

  // Called on AppState change to background / navigation away
  const pauseAll = async () => {
    _audioModeActive = false;
    _currentActiveId = null;
    for (const [, entry] of registry.entries()) {
      if (entry.sound) {
        try {
          entry.sound.pause();
          entry.sound.muted = true;
          entry.muted = true;
          entry.setMuted(true);
          entry.setPlaying(false);
        } catch {}
      }
    }
  };

  const isAudioModeActive = () => _audioModeActive;

  return {
    register,
    unregister,
    onCardVisible,
    onCardHidden,
    onUserTapToggle,
    pauseAll,
    isAudioModeActive,
  };
})();

// ─── AppState listener — pause all on background (page change / tab switch) ──
AppState.addEventListener("change", (nextState) => {
  if (nextState === "background" || nextState === "inactive") {
    AudioManager.pauseAll();
  }
});

// ─── Trip Pills ───────────────────────────────────────────────────────────────
const TripPills = ({ trips = [] }) => {
  if (!trips.length) return null;
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        marginBottom: 8,
      }}
    >
      {trips.slice(0, 3).map((t) => {
        const col = TRIP_COLORS[t?.toLowerCase()] || ORANGE;
        return (
          <View
            key={t}
            style={{
              backgroundColor: col + "20",
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 6,
            }}
          >
            <Text
              style={{
                color: col,
                fontSize: 9,
                fontFamily: Fonts.inter.extrabold,
                letterSpacing: 0.8,
                textTransform: "uppercase",
              }}
            >
              {(t || "").replace("_", " ")}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

// ─── Music Pill ───────────────────────────────────────────────────────────────
const MusicPill = ({ name, playing, muted, onToggle }) => {
  const anim1 = useRef(new Animated.Value(0.3)).current;
  const anim2 = useRef(new Animated.Value(0.3)).current;
  const anim3 = useRef(new Animated.Value(0.3)).current;
  const animRef = useRef(null);

  useEffect(() => {
    if (animRef.current) {
      animRef.current.forEach((a) => a.stop());
    }

    if (playing && !muted) {
      const bar = (anim, delay) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 300,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.3,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        );
      const a1 = bar(anim1, 0);
      const a2 = bar(anim2, 150);
      const a3 = bar(anim3, 300);
      animRef.current = [a1, a2, a3];
      a1.start();
      a2.start();
      a3.start();
    } else {
      animRef.current = null;
      [anim1, anim2, anim3].forEach((a) =>
        Animated.timing(a, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }).start(),
      );
    }

    return () => {
      if (animRef.current) {
        animRef.current.forEach((a) => a.stop());
        animRef.current = null;
      }
    };
  }, [playing, muted]);

  if (!name) return null;
  return (
    <Pressable
      onPress={onToggle}
      hitSlop={8}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: 2,
      }}
    >
      <Music2 size={9} color={ORANGE} />
      <Text
        numberOfLines={1}
        style={{
          color: ORANGE,
          fontSize: 10,
          fontFamily: Fonts.inter.bold,
          maxWidth: 120,
        }}
      >
        {name}
      </Text>
      {playing && !muted ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 1.5,
            height: 8,
          }}
        >
          {[anim1, anim2, anim3].map((a, i) => (
            <Animated.View
              key={i}
              style={{
                width: 2,
                height: 8,
                borderRadius: 1,
                backgroundColor: ORANGE,
                transform: [{ scaleY: a }],
              }}
            />
          ))}
        </View>
      ) : (
        <Text style={{ fontSize: 9 }}>🔇</Text>
      )}
    </Pressable>
  );
};

// ─── Media Carousel ───────────────────────────────────────────────────────────
const MediaCarousel = ({
  urls = [],
  onTap,
  onDoubleTap,
  musicMuted,
  hasMusicName,
}) => {
  const [index, setIndex] = useState(0);
  const [showMuteFlash, setShowMuteFlash] = useState(false);
  const flashAnim = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  const n = urls.length;
  if (!n) return null;

  const height = width / (n === 1 ? 4 / 5 : 1);

  const lastTapRef = useRef(null);
  const DOUBLE_TAP_DELAY = 300;

  const handleTap = () => {
    const now = Date.now();
    if (lastTapRef.current && now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap
      lastTapRef.current = null;
      onDoubleTap?.(); // ← fires like
    } else {
      // Single tap (music toggle)
      lastTapRef.current = now;
      if (!hasMusicName) return;
      onTap?.();
      setShowMuteFlash(true);
      flashAnim.setValue(0);
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 600,
          delay: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setShowMuteFlash(false));
    }
  };

  const cur = urls[index];
  const isVid = isVideo(cur);

  return (
    <Pressable
      onPress={handleTap}
      style={{ width: "100%", height, backgroundColor: "#000" }}
    >
      {isVid ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Image
            source={{ uri: cur }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
          <View
            style={{
              position: "absolute",
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: "rgba(0,0,0,0.52)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Play size={22} color="#fff" fill="#fff" />
          </View>
        </View>
      ) : (
        <Image
          source={{ uri: cur }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      )}

      {n > 1 && index > 0 && (
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            setIndex((i) => i - 1);
          }}
          hitSlop={8}
          style={{
            position: "absolute",
            left: 10,
            top: "50%",
            marginTop: -16,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "rgba(0,0,0,0.42)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ChevronLeft size={16} color="#fff" />
        </Pressable>
      )}
      {n > 1 && index < n - 1 && (
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            setIndex((i) => i + 1);
          }}
          hitSlop={8}
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            marginTop: -16,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "rgba(0,0,0,0.42)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ChevronRight size={16} color="#fff" />
        </Pressable>
      )}
      {n > 1 && (
        <View
          style={{
            position: "absolute",
            bottom: 12,
            left: 0,
            right: 0,
            flexDirection: "row",
            justifyContent: "center",
            gap: 4,
          }}
        >
          {urls.map((_, j) => (
            <View
              key={j}
              style={{
                width: j === index ? 16 : 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: j === index ? ORANGE : "rgba(255,255,255,0.5)",
              }}
            />
          ))}
        </View>
      )}
      {showMuteFlash && (
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
            opacity: flashAnim,
            pointerEvents: "none",
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: "rgba(0,0,0,0.52)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 22 }}>{musicMuted ? "🔇" : "🔊"}</Text>
          </View>
        </Animated.View>
      )}
    </Pressable>
  );
};

// ─── Likes Modal ──────────────────────────────────────────────────────────────
const LikesModal = ({
  visible,
  onClose,
  postId,
  likeCount,
  myId,
  isDarkMode,
}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followStatus, setFollowStatus] = useState({});
  const [followLoading, setFollowLoading] = useState({});
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(400)).current;
  const dk = isDarkMode;

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      damping: 20,
      stiffness: 200,
    }).start();
    getUsersByPostLike(postId)
      .then((r) => {
        const list = r?.data?.users || r?.data || [];
        setUsers(list);
        const s = {};
        list.forEach((u) => {
          s[u.id] = u.followStatus || u.follow_status || "not_following";
        });
        setFollowStatus(s);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [visible, postId]);

  const handleClose = () =>
    Animated.timing(slideAnim, {
      toValue: 400,
      duration: 220,
      useNativeDriver: true,
    }).start(onClose);

  const handleFollow = async (userId) => {
    if (followLoading[userId]) return;
    setFollowLoading((p) => ({ ...p, [userId]: true }));
    try {
      if (followStatus[userId] === "following") {
        await unFollowUser(userId);
        setFollowStatus((p) => ({ ...p, [userId]: "not_following" }));
      } else {
        await followUser(userId);
        setFollowStatus((p) => ({ ...p, [userId]: "following" }));
      }
    } catch {
    } finally {
      setFollowLoading((p) => ({ ...p, [userId]: false }));
    }
  };

  const goProfile = (u) => {
    handleClose();
    setTimeout(() => {
      if (String(u.id) === String(myId)) router.push("/personal-profile");
      else
        router.push({
          pathname: "/other-user-profile",
          params: { userId: u.id },
        });
    }, 250);
  };

  const cardBg = dk ? "#1a1a1a" : "#ffffff";
  const borderCol = dk ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
        onPress={handleClose}
      >
        <Animated.View
          style={{ transform: [{ translateY: slideAnim }] }}
          onStartShouldSetResponder={() => true}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <View
            style={{
              backgroundColor: cardBg,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              height: 420,
              paddingBottom: insets.bottom,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 24,
            }}
          >
            <View
              style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}
            >
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: borderCol,
                }}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingBottom: 12,
                paddingTop: 4,
                borderBottomWidth: 1,
                borderBottomColor: borderCol,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: Fonts.inter.extrabold,
                  color: dk ? "#fff" : "#0f172a",
                }}
              >
                {likeCount?.toLocaleString("en-IN")}{" "}
                {likeCount === 1 ? "like" : "likes"}
              </Text>
              <Pressable
                onPress={handleClose}
                hitSlop={8}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: borderCol,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={15} color={dk ? "#94a3b8" : "#64748b"} />
              </Pressable>
            </View>
            {loading ? (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ActivityIndicator color={ORANGE} />
              </View>
            ) : users.length === 0 ? (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                <Heart size={36} color={dk ? "#475569" : "#94a3b8"} />
                <Text
                  style={{
                    color: dk ? "#475569" : "#94a3b8",
                    fontSize: 13,
                    fontFamily: Fonts.inter.regular,
                  }}
                >
                  No likes yet
                </Text>
              </View>
            ) : (
              <FlatList
                data={users}
                keyExtractor={(u) => String(u.id)}
                contentContainerStyle={{
                  paddingHorizontal: 20,
                  paddingVertical: 8,
                }}
                renderItem={({ item: u }) => {
                  const isMe = String(u.id) === String(myId);
                  const status = followStatus[u.id] || "not_following";
                  const isFollowing = status === "following";
                  const isFollowBack = status === "follow_back";
                  const isLoad = followLoading[u.id];
                  const btnLabel = isFollowing
                    ? "Following"
                    : isFollowBack
                      ? "Follow back"
                      : "Follow";
                  const ini = u.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  return (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                        paddingVertical: 10,
                        borderBottomWidth: 1,
                        borderBottomColor: dk
                          ? "rgba(255,255,255,0.03)"
                          : "rgba(0,0,0,0.03)",
                      }}
                    >
                      <Pressable onPress={() => goProfile(u)} hitSlop={4}>
                        <View
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            overflow: "hidden",
                            backgroundColor: "#FF6B35",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {u.profile_photo ? (
                            <Image
                              source={{
                                uri: getProfilePhotoUrl(u.profile_photo),
                              }}
                              style={{ width: 44, height: 44 }}
                            />
                          ) : (
                            <Text
                              style={{
                                color: "#fff",
                                fontFamily: Fonts.inter.extrabold,
                                fontSize: 13,
                              }}
                            >
                              {ini}
                            </Text>
                          )}
                        </View>
                      </Pressable>
                      <Pressable
                        onPress={() => goProfile(u)}
                        style={{ flex: 1 }}
                      >
                        <Text
                          numberOfLines={1}
                          style={{
                            fontSize: 14,
                            fontFamily: Fonts.inter.extrabold,
                            color: dk ? "#fff" : "#0f172a",
                          }}
                        >
                          {u.name}
                        </Text>
                        {u.username && (
                          <Text
                            numberOfLines={1}
                            style={{
                              fontSize: 11,
                              fontFamily: Fonts.inter.regular,
                              color: dk ? "#64748b" : "#94a3b8",
                            }}
                          >
                            @{u.username}
                          </Text>
                        )}
                      </Pressable>
                      {!isMe && (
                        <Pressable
                          onPress={() => handleFollow(u.id)}
                          disabled={isLoad}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                            paddingHorizontal: 14,
                            paddingVertical: 6,
                            borderRadius: 20,
                            minWidth: 80,
                            justifyContent: "center",
                            backgroundColor: isFollowing
                              ? "transparent"
                              : ORANGE,
                            borderWidth: isFollowing ? 1.5 : 0,
                            borderColor: borderCol,
                            opacity: isLoad ? 0.5 : 1,
                          }}
                        >
                          {isLoad ? (
                            <ActivityIndicator
                              size="small"
                              color={
                                isFollowing
                                  ? dk
                                    ? "#64748b"
                                    : "#94a3b8"
                                  : "#fff"
                              }
                            />
                          ) : isFollowing ? (
                            <>
                              <Check
                                size={11}
                                color={dk ? "#64748b" : "#94a3b8"}
                              />
                              <Text
                                style={{
                                  fontSize: 11,
                                  fontFamily: Fonts.inter.extrabold,
                                  color: dk ? "#64748b" : "#94a3b8",
                                }}
                              >
                                {btnLabel}
                              </Text>
                            </>
                          ) : (
                            <>
                              <UserPlus size={11} color="#fff" />
                              <Text
                                style={{
                                  fontSize: 11,
                                  fontFamily: Fonts.inter.extrabold,
                                  color: "#fff",
                                }}
                              >
                                {btnLabel}
                              </Text>
                            </>
                          )}
                        </Pressable>
                      )}
                    </View>
                  );
                }}
              />
            )}
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

// ─── Comment Row ──────────────────────────────────────────────────────────────
const CommentRow = ({ comment, onPressUser, isDarkMode, canDelete, onDelete }) => {
  const dk = isDarkMode;
  const ini = comment?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
      <Pressable onPress={() => onPressUser(comment?.user_id)} hitSlop={4}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            overflow: "hidden",
            backgroundColor: "#FF6B35",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {comment?.profile_photo ? (
            <Image
              source={{ uri: getProfilePhotoUrl(comment.profile_photo) }}
              style={{ width: 28, height: 28 }}
            />
          ) : (
            <Text
              style={{
                color: "#fff",
                fontFamily: Fonts.inter.extrabold,
                fontSize: 9,
              }}
            >
              {ini}
            </Text>
          )}
        </View>
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 13,
            lineHeight: 19,
            color: dk ? "#f1f5f9" : "#0f172a",
            fontFamily: Fonts.inter.regular,
          }}
        >
          <Text style={{ fontFamily: Fonts.inter.extrabold }}>
            {comment?.name}{" "}
          </Text>
          {comment?.content}
        </Text>
        <Text
          style={{
            fontSize: 10,
            fontFamily: Fonts.inter.regular,
            color: dk ? "#475569" : "#94a3b8",
            marginTop: 2,
          }}
        >
          {formatLastActive(comment?.created_at)}
        </Text>
      </View>
      {canDelete && (
        <Pressable
          onPress={() => onDelete?.(comment?.id)}
          hitSlop={10}
          style={{ padding: 4 }}
        >
          <Trash2 size={15} color={dk ? "#64748b" : "#94a3b8"} />
        </Pressable>
      )}
    </View>
  );
};

// ─── PostCard ─────────────────────────────────────────────────────────────────
const PostCard = ({ post, onPostDeleted, onViewableChange }) => {
  const router = useRouter();
  const { user } = useContext(AppContext);
  const { isDarkMode: dk } = useDarkMode();
  const myId = user?.id;

  const [liked, setLiked] = useState(post?.isLiked || false);
  const [likeCount, setLikeCount] = useState(
    post?.likeCount ?? post?.likes?.length ?? 0,
  );
  const [likeLoading, setLikeLoading] = useState(false);
  const [likeAnim] = useState(new Animated.Value(1));

  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(post?.comments?.length ?? 0);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);

  const [expanded, setExpanded] = useState(false);
  const [overflow, setOverflow] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showLikes, setShowLikes] = useState(false);

  // ── Audio state ─────────────────────────────────────────────────────────────
  const soundRef = useRef(null);
  const loadedRef = useRef(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicMuted, setMusicMuted] = useState(true);

  // ── Reveal animation ─────────────────────────────────────────────────────────
  const revealAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(18)).current;

  const [heartBurst, setHeartBurst] = useState(false);
  const burstAnim = useRef(new Animated.Value(0)).current;

  const triggerHeartBurst = () => {
    setHeartBurst(true);
    burstAnim.setValue(0);
    Animated.sequence([
      Animated.spring(burstAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 12,
      }),
      Animated.timing(burstAnim, {
        toValue: 0,
        duration: 400,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setHeartBurst(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(revealAnim, {
          toValue: 1,
          duration: 460,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          duration: 460,
          useNativeDriver: true,
        }),
      ]).start();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const isOwner = String(myId) === String(post?.user?.id);
  const city = post?.destination || post?.city || post?.location;
  const media = post?.media_urls ?? [];
  const trips = Array.isArray(post?.trip_types)
    ? post.trip_types
    : Array.isArray(post?.trip_type)
      ? post.trip_type
      : [];
  const hasMedia = media.length > 0;
  const fresh = isFresh(post?.createdAt ?? post?.created_at);
  const musicUrl = post?.music_url || post?.musicUrl || null;
  const musicName =
    post?.music_name ||
    post?.musicName ||
    (musicUrl
      ? decodeURIComponent(
          musicUrl
            .split("/")
            .pop()
            .replace(/\.[^.]+$/, "")
            .replace(/%20/g, " ")
            .replace(/\+/g, " "),
        )
      : null);

  const accentColor =
    trips.length > 0 ? TRIP_COLORS[trips[0]?.toLowerCase()] || ORANGE : ORANGE;

  const cardBg = dk ? "#161616" : "#ffffff";
  const subColor = dk ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";
  const textPrimary = dk ? "#f1f5f9" : "#0f172a";
  const borderCol = dk ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const initials =
    post?.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "??";
  const myInitials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "??";

  // ── Load audio ONCE, register with AudioManager ───────────────────────────
  const player = useAudioPlayer(musicUrl || null);

  useEffect(() => {
    if (!musicUrl || !player) return;

    player.loop = true;
    player.muted = true;
    player.volume = 0.8;

    AudioManager.register(post.id, player, setMusicMuted, setMusicPlaying);
    loadedRef.current = true;

    return () => {
      loadedRef.current = false;
      AudioManager.unregister(post.id);
      setMusicPlaying(false);
      setMusicMuted(true);
    };
  }, [musicUrl, player, post.id]);

  // ── Visibility change from parent FlatList (via onViewableItemsChanged) ────
  //
  // Your FeedScreen / parent should pass `onViewableChange` prop like:
  //   viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
  //   onViewableItemsChanged={({ viewableItems }) => {
  //     // call each PostCard's onViewableChange(isVisible)
  //   }}
  //
  // OR use the useEffect below with a fallback IntersectionObserver-style
  // polling if you can't modify the parent. We handle BOTH approaches.
  useEffect(() => {
    if (onViewableChange === undefined) return;
    if (!loadedRef.current) return;

    if (onViewableChange) {
      AudioManager.onCardVisible(post.id);
    } else {
      AudioManager.onCardHidden(post.id);
    }
  }, [onViewableChange, post.id]);

  // ── Tap to toggle mute (via image tap OR music pill tap) ─────────────────
  const handleMusicMuteToggle = async () => {
    if (!musicUrl || !loadedRef.current) return;
    await AudioManager.onUserTapToggle(post.id);
    // setMusicMuted / setMusicPlaying are called inside AudioManager
  };

  // ── Navigation ──────────────────────────────────────────────────────────────
  const goProfile = () => {
    if (!post?.user?.id) return;
    if (String(post.user.id) === String(myId)) router.push("/personal-profile");
    else
      router.push({
        pathname: "/other-user-profile",
        params: { userId: post.user.id },
      });
  };
  const goUserProfile = (userId) => {
    if (!userId) return;
    if (String(userId) === String(myId)) router.push("/personal-profile");
    else router.push({ pathname: "/other-user-profile", params: { userId } });
  };
  const goCity = () => {
    if (!city) return;
    router.push({ pathname: "/city-details", params: { cityName: city } });
  };

  // ── Like ────────────────────────────────────────────────────────────────────
  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    if (!liked) {
      Animated.sequence([
        Animated.spring(likeAnim, {
          toValue: 1.55,
          useNativeDriver: true,
          speed: 40,
        }),
        Animated.spring(likeAnim, {
          toValue: 0.88,
          useNativeDriver: true,
          speed: 40,
        }),
        Animated.spring(likeAnim, {
          toValue: 1.08,
          useNativeDriver: true,
          speed: 40,
        }),
      ]).start();
    }
    const prev = { liked, likeCount };
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    try {
      const res = await toggleLike(post.id);
      setLiked(res?.data?.liked);
      setLikeCount(
        res?.data?.likeCount ??
          (prev.liked ? prev.likeCount - 1 : prev.likeCount + 1),
      );
    } catch {
      setLiked(prev.liked);
      setLikeCount(prev.likeCount);
    } finally {
      setLikeLoading(false);
    }
  };
  const handleDoubleTap = () => {
    if (!liked) handleLike();
    triggerHeartBurst();
  };

  // ── Comments ────────────────────────────────────────────────────────────────
  const loadComments = async () => {
    try {
      const res = await getComments(post.id);
      const list = res?.data?.data ?? [];
      setComments(list);
      setCommentCount(list.length);
    } catch {}
  };
  const toggleComments = async () => {
    const next = !showComments;
    setShowComments(next);
    if (next && comments.length === 0) await loadComments();
  };
  const submitComment = async () => {
    if (!commentText.trim() || commentLoading) return;
    setCommentLoading(true);
    try {
      await addComment(post.id, commentText);
      setCommentText("");
      await loadComments();
    } catch {
    } finally {
      setCommentLoading(false);
    }
  };
  const handleDeleteComment = async (commentId) => {
    if (!commentId) return;
    // Optimistic update: remove immediately, restore if the request fails.
    const previous = comments;
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setCommentCount((prev) => Math.max(0, prev - 1));
    try {
      await deleteComment(post.id, commentId);
    } catch {
      setComments(previous);
      setCommentCount(previous.length);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setMenuOpen(false);
    setDeleting(true);
    try {
      await deletePost(post.id);
      onPostDeleted?.(post.id);
    } catch {
      setDeleting(false);
    }
  };

  // ── Share ────────────────────────────────────────────────────────────────────
  const handleShare = async () => {
    try {
      await Share.share({
        title: `${post?.user?.name}'s travel post`,
        message: post?.content,
      });
    } catch {}
  };

  const onTextLayout = useCallback(
    (e) => {
      if (!expanded)
        setOverflow(e.nativeEvent.lines.length > (hasMedia ? 3 : 5));
    },
    [expanded, hasMedia],
  );

  // ── Menu ─────────────────────────────────────────────────────────────────────
  const MenuSheet = () =>
    menuOpen ? (
      <Pressable
        style={{
          position: "absolute",
          right: 0,
          top: 36,
          width: 160,
          borderRadius: 16,
          overflow: "hidden",
          backgroundColor: dk ? "#222" : "#fff",
          borderWidth: 1,
          borderColor: borderCol,
          zIndex: 50,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.18,
          shadowRadius: 20,
          elevation: 12,
        }}
        onPress={(e) => e.stopPropagation()}
      >
        {isOwner ? (
          <>
            <Pressable
              onPress={() => setMenuOpen(false)}
              style={{ paddingHorizontal: 16, paddingVertical: 12 }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: Fonts.inter.semibold,
                  color: textPrimary,
                }}
              >
                Edit
              </Text>
            </Pressable>
            <View
              style={{
                height: 1,
                backgroundColor: borderCol,
                marginHorizontal: 12,
              }}
            />
            <Pressable
              onPress={handleDelete}
              style={{ paddingHorizontal: 16, paddingVertical: 12 }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: Fonts.inter.semibold,
                  color: "#ef4444",
                }}
              >
                Delete
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable
              onPress={() => setMenuOpen(false)}
              style={{ paddingHorizontal: 16, paddingVertical: 12 }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: Fonts.inter.semibold,
                  color: textPrimary,
                }}
              >
                Follow
              </Text>
            </Pressable>
            <View
              style={{
                height: 1,
                backgroundColor: borderCol,
                marginHorizontal: 12,
              }}
            />
            <Pressable
              onPress={() => setMenuOpen(false)}
              style={{ paddingHorizontal: 16, paddingVertical: 12 }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: Fonts.inter.semibold,
                  color: "#ef4444",
                }}
              >
                Report
              </Text>
            </Pressable>
          </>
        )}
      </Pressable>
    ) : null;

  // ── Action Bar ───────────────────────────────────────────────────────────────
  const ActionBar = ({ compact = false }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: compact ? 2 : 4,
      }}
    >
      <Pressable
        onPress={handleLike}
        disabled={likeLoading}
        hitSlop={8}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingHorizontal: compact ? 10 : 8,
          paddingVertical: 6,
          borderRadius: 12,
        }}
      >
        <Animated.View style={{ transform: [{ scale: likeAnim }] }}>
          <Heart
            size={compact ? 19 : 24}
            color={liked ? "#ef4444" : subColor}
            fill={liked ? "#ef4444" : "none"}
          />
        </Animated.View>
        {compact && likeCount > 0 && (
          <Pressable onPress={() => setShowLikes(true)} hitSlop={8}>
            <Text
              style={{
                fontSize: 12,
                fontFamily: Fonts.inter.extrabold,
                color: liked ? "#ef4444" : subColor,
              }}
            >
              {likeCount.toLocaleString("en-IN")}
            </Text>
          </Pressable>
        )}
      </Pressable>

      {!compact && likeCount > 0 && (
        <Pressable
          onPress={() => setShowLikes(true)}
          hitSlop={8}
          style={{ paddingRight: 8, paddingVertical: 6 }}
        >
          <Text
            style={{
              fontSize: 12,
              fontFamily: Fonts.inter.extrabold,
              color: liked ? "#ef4444" : subColor,
            }}
          >
            {likeCount.toLocaleString("en-IN")}
          </Text>
        </Pressable>
      )}

      <Pressable
        onPress={toggleComments}
        hitSlop={8}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingHorizontal: compact ? 10 : 8,
          paddingVertical: 6,
          borderRadius: 12,
        }}
      >
        <MessageCircle
          size={compact ? 19 : 24}
          color={showComments ? ORANGE : subColor}
        />
        {commentCount > 0 && (
          <Text
            style={{
              fontSize: 12,
              fontFamily: Fonts.inter.bold,
              color: showComments ? ORANGE : subColor,
            }}
          >
            {commentCount}
          </Text>
        )}
      </Pressable>

      <Pressable
        onPress={handleShare}
        hitSlop={8}
        style={{
          paddingHorizontal: compact ? 10 : 8,
          paddingVertical: 6,
          borderRadius: 12,
        }}
      >
        <Share2 size={compact ? 18 : 22} color={subColor} />
      </Pressable>

      <Pressable
        onPress={() => setSaved((s) => !s)}
        hitSlop={8}
        style={{
          marginLeft: "auto",
          paddingHorizontal: 8,
          paddingVertical: 6,
          borderRadius: 12,
        }}
      >
        <Bookmark
          size={compact ? 18 : 22}
          color={saved ? ORANGE : subColor}
          fill={saved ? ORANGE : "none"}
        />
      </Pressable>
    </View>
  );

  // ── Comments Drawer ──────────────────────────────────────────────────────────
  const CommentsDrawer = () =>
    showComments ? (
      <View style={{ paddingHorizontal: 14, paddingBottom: 16 }}>
        <View
          style={{ height: 1, backgroundColor: borderCol, marginBottom: 12 }}
        />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              overflow: "hidden",
              backgroundColor: "#FF6B35",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {user?.avatar ? (
              <Image
                source={{ uri: getProfilePhotoUrl(user.avatar) }}
                style={{ width: 30, height: 30 }}
              />
            ) : (
              <Text
                style={{
                  color: "#fff",
                  fontFamily: Fonts.inter.extrabold,
                  fontSize: 10,
                }}
              >
                {myInitials}
              </Text>
            )}
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: dk
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.05)",
              borderWidth: 1,
              borderColor: borderCol,
              gap: 8,
            }}
          >
            <TextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Add a comment…"
              placeholderTextColor={subColor}
              style={{
                flex: 1,
                fontSize: 14,
                fontFamily: Fonts.inter.regular,
                color: textPrimary,
                paddingVertical: 0,
              }}
              onSubmitEditing={submitComment}
              returnKeyType="send"
            />
            <Pressable
              onPress={submitComment}
              disabled={!commentText.trim() || commentLoading}
              hitSlop={8}
              style={{
                opacity: !commentText.trim() || commentLoading ? 0.2 : 1,
              }}
            >
              {commentLoading ? (
                <ActivityIndicator size="small" color={ORANGE} />
              ) : (
                <Send size={15} color={ORANGE} />
              )}
            </Pressable>
          </View>
        </View>
        {comments.length > 0 ? (
          comments.map((c) => (
            <CommentRow
              key={c.id}
              comment={c}
              onPressUser={goUserProfile}
              isDarkMode={dk}
              canDelete={user?.id === c.user_id || user?.id === post?.user?.id}
              onDelete={handleDeleteComment}
            />
          ))
        ) : (
          <View style={{ alignItems: "center", paddingVertical: 16 }}>
            <Text
              style={{
                fontSize: 12,
                fontFamily: Fonts.inter.bold,
                color: subColor,
              }}
            >
              No comments yet
            </Text>
          </View>
        )}
      </View>
    ) : null;

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <>
      <Animated.View
        style={{
          opacity: revealAnim,
          transform: [{ translateY: translateAnim }],
          backgroundColor: cardBg,
          borderBottomWidth: 8,
          borderBottomColor: dk ? "#0d0d0d" : "#f7f4ef",
          ...(deleting && { opacity: 0.1 }),
        }}
      >
        {/* ── MEDIA LAYOUT ──────────────────────────────────────────────────── */}
        {hasMedia && (
          <>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingHorizontal: 14,
                paddingVertical: 10,
              }}
            >
              <Pressable onPress={goProfile} hitSlop={8}>
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    overflow: "hidden",
                    backgroundColor: "#FF6B35",
                    alignItems: "center",
                    justifyContent: "center",
                    ...(fresh
                      ? { borderWidth: 2, borderColor: ORANGE }
                      : {
                          borderWidth: 1.5,
                          borderColor: "rgba(255,153,51,0.3)",
                        }),
                  }}
                >
                  {post?.user?.avatar ? (
                    <Image
                      source={{ uri: getProfilePhotoUrl(post.user.avatar) }}
                      style={{ width: 34, height: 34 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text
                      style={{
                        color: "#fff",
                        fontFamily: Fonts.inter.extrabold,
                        fontSize: 11,
                      }}
                    >
                      {initials}
                    </Text>
                  )}
                </View>
              </Pressable>

              <View style={{ flex: 1 }}>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <Pressable onPress={goProfile} hitSlop={4}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontFamily: Fonts.playfair.bold,
                        color: textPrimary,
                      }}
                    >
                      {post?.user?.name}
                    </Text>
                  </Pressable>
                  {fresh && (
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: ORANGE,
                      }}
                    />
                  )}
                </View>
                {musicName && !musicMuted ? (
                  <MusicPill
                    name={musicName}
                    playing={musicPlaying}
                    muted={musicMuted}
                    onToggle={handleMusicMuteToggle}
                  />
                ) : (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      marginTop: 2,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontFamily: Fonts.inter.regular,
                        color: subColor,
                      }}
                    >
                      {formatLastActive(post?.createdAt ?? post?.created_at)}
                    </Text>
                    {city && (
                      <>
                        <Text style={{ color: subColor, fontSize: 8 }}>·</Text>
                        <Pressable
                          onPress={goCity}
                          hitSlop={4}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 2,
                          }}
                        >
                          <MapPin size={8} color={ORANGE} strokeWidth={2.5} />
                          <Text
                            style={{
                              fontSize: 11,
                              fontFamily: Fonts.inter.bold,
                              color: ORANGE,
                            }}
                          >
                            {city}
                          </Text>
                        </Pressable>
                      </>
                    )}
                  </View>
                )}
              </View>

              <View style={{ position: "relative" }}>
                <Pressable
                  onPress={() => setMenuOpen((p) => !p)}
                  hitSlop={8}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MoreHorizontal size={17} color={subColor} />
                </Pressable>
                <MenuSheet />
              </View>
            </View>

            <Pressable onPress={handleDoubleTap} activeOpacity={1}>
              <View>
                <MediaCarousel
                  urls={media}
                  musicMuted={musicMuted}
                  hasMusicName={!!musicName}
                  onTap={handleMusicMuteToggle}
                  onDoubleTap={handleDoubleTap}
                />
                {heartBurst && (
                  <Animated.View
                    pointerEvents="none"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: burstAnim,
                      transform: [
                        {
                          scale: burstAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.4, 1.2],
                          }),
                        },
                      ],
                    }}
                  >
                    <Heart size={90} color="#ef4444" fill="#ef4444" />
                  </Animated.View>
                )}
              </View>
            </Pressable>

            <View
              style={{ paddingHorizontal: 10, paddingTop: 6, paddingBottom: 2 }}
            >
              <ActionBar compact={false} />
            </View>

            {likeCount > 0 && (
              <Pressable
                onPress={() => setShowLikes(true)}
                hitSlop={4}
                style={{ paddingHorizontal: 16, paddingBottom: 4 }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: Fonts.inter.extrabold,
                    color: textPrimary,
                  }}
                >
                  {likeCount.toLocaleString("en-IN")}{" "}
                  {likeCount === 1 ? "like" : "likes"}
                </Text>
              </Pressable>
            )}

            <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
              <TripPills trips={trips} />

              <Text
                onTextLayout={onTextLayout}
                numberOfLines={expanded ? undefined : 3}
                style={{
                  fontSize: 13.5,
                  lineHeight: 21,
                  fontFamily: Fonts.inter.regular,
                  color: textPrimary,
                }}
              >
                <Text style={{ fontFamily: Fonts.inter.extrabold }}>
                  {post?.user?.name?.split(" ")[0]}{" "}
                </Text>
                {post?.content}
              </Text>
              {(overflow || expanded) && (
                <Pressable onPress={() => setExpanded((e) => !e)} hitSlop={4}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: Fonts.inter.semibold,
                      color: subColor,
                      marginTop: 2,
                    }}
                  >
                    {expanded ? "less" : "more"}
                  </Text>
                </Pressable>
              )}
              {commentCount > 0 && (
                <Pressable
                  onPress={toggleComments}
                  hitSlop={4}
                  style={{ marginTop: 6 }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: Fonts.inter.regular,
                      color: subColor,
                    }}
                  >
                    View all {commentCount} comments
                  </Text>
                </Pressable>
              )}
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: Fonts.inter.regular,
                  color: subColor,
                  opacity: 0.55,
                  marginTop: 4,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {formatLastActive(post?.createdAt ?? post?.created_at)}
              </Text>
            </View>
          </>
        )}

        {/* ── TEXT-ONLY LAYOUT ──────────────────────────────────────────────── */}
        {!hasMedia && (
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 16,
              borderLeftWidth: 3,
              borderLeftColor: accentColor,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <Pressable onPress={goProfile} hitSlop={8}>
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    overflow: "hidden",
                    backgroundColor: "#FF6B35",
                    alignItems: "center",
                    justifyContent: "center",
                    ...(fresh
                      ? { borderWidth: 2, borderColor: ORANGE }
                      : {
                          borderWidth: 1.5,
                          borderColor: "rgba(255,153,51,0.3)",
                        }),
                  }}
                >
                  {post?.user?.avatar ? (
                    <Image
                      source={{ uri: getProfilePhotoUrl(post.user.avatar) }}
                      style={{ width: 38, height: 38 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text
                      style={{
                        color: "#fff",
                        fontFamily: Fonts.inter.extrabold,
                        fontSize: 12,
                      }}
                    >
                      {initials}
                    </Text>
                  )}
                </View>
              </Pressable>
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    flexWrap: "wrap",
                  }}
                >
                  <Pressable onPress={goProfile} hitSlop={4}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontFamily: Fonts.playfair.bold,
                        color: textPrimary,
                      }}
                    >
                      {post?.user?.name}
                    </Text>
                  </Pressable>
                  {city && (
                    <Pressable
                      onPress={goCity}
                      hitSlop={4}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <MapPin size={8} color={ORANGE} strokeWidth={2.5} />
                      <Text
                        style={{
                          fontSize: 11,
                          fontFamily: Fonts.inter.bold,
                          color: ORANGE,
                        }}
                      >
                        {city}
                      </Text>
                    </Pressable>
                  )}
                </View>
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: Fonts.inter.regular,
                    color: subColor,
                    marginTop: 1,
                  }}
                >
                  {formatLastActive(post?.createdAt ?? post?.created_at)}
                </Text>
                {musicName && (
                  <MusicPill
                    name={musicName}
                    playing={musicPlaying}
                    muted={musicMuted}
                    onToggle={handleMusicMuteToggle}
                  />
                )}
              </View>
              <View style={{ position: "relative" }}>
                <Pressable
                  onPress={() => setMenuOpen((p) => !p)}
                  hitSlop={8}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MoreHorizontal size={16} color={subColor} />
                </Pressable>
                <MenuSheet />
              </View>
            </View>

            <TripPills trips={trips} />
            <Text
              onTextLayout={onTextLayout}
              numberOfLines={expanded ? undefined : 5}
              style={{
                fontSize: 14.5,
                lineHeight: 24,
                fontFamily: Fonts.inter.regular,
                color: textPrimary,
                marginBottom: 8,
              }}
            >
              {post?.content}
            </Text>
            {(overflow || expanded) && (
              <Pressable
                onPress={() => setExpanded((e) => !e)}
                hitSlop={4}
                style={{ marginBottom: 12 }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: Fonts.inter.semibold,
                    color: subColor,
                  }}
                >
                  {expanded ? "Show less" : "Read more"}
                </Text>
              </Pressable>
            )}
            <View
              style={{
                height: 1,
                backgroundColor: dk
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.06)",
                marginBottom: 8,
                marginTop: 2,
              }}
            />
            <ActionBar compact />
          </View>
        )}

        {showComments && (
          <View style={{ paddingHorizontal: 14, paddingBottom: 16 }}>
            <View
              style={{
                height: 1,
                backgroundColor: borderCol,
                marginBottom: 12,
              }}
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  overflow: "hidden",
                  backgroundColor: "#FF6B35",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {user?.avatar ? (
                  <Image
                    source={{ uri: getProfilePhotoUrl(user.avatar) }}
                    style={{ width: 30, height: 30 }}
                  />
                ) : (
                  <Text
                    style={{
                      color: "#fff",
                      fontFamily: Fonts.inter.extrabold,
                      fontSize: 10,
                    }}
                  >
                    {myInitials}
                  </Text>
                )}
              </View>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: dk
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.05)",
                  borderWidth: 1,
                  borderColor: borderCol,
                  gap: 8,
                }}
              >
                <TextInput
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholder="Add a comment…"
                  placeholderTextColor={subColor}
                  style={{
                    flex: 1,
                    fontSize: 14,
                    fontFamily: Fonts.inter.regular,
                    color: textPrimary,
                    paddingVertical: 0,
                  }}
                  onSubmitEditing={submitComment}
                  returnKeyType="send"
                />
                <Pressable
                  onPress={submitComment}
                  disabled={!commentText.trim() || commentLoading}
                  hitSlop={8}
                  style={{
                    opacity: !commentText.trim() || commentLoading ? 0.2 : 1,
                  }}
                >
                  {commentLoading ? (
                    <ActivityIndicator size="small" color={ORANGE} />
                  ) : (
                    <Send size={15} color={ORANGE} />
                  )}
                </Pressable>
              </View>
            </View>
            {comments.length > 0 ? (
              comments.map((c) => (
                <CommentRow
                  key={c.id}
                  comment={c}
                  onPressUser={goUserProfile}
                  isDarkMode={dk}
                />
              ))
            ) : (
              <View style={{ alignItems: "center", paddingVertical: 16 }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: Fonts.inter.bold,
                    color: subColor,
                  }}
                >
                  No comments yet
                </Text>
              </View>
            )}
          </View>
        )}
      </Animated.View>

      <LikesModal
        visible={showLikes}
        onClose={() => setShowLikes(false)}
        postId={post?.id}
        likeCount={likeCount}
        myId={myId}
        isDarkMode={dk}
      />
    </>
  );
};

export default memo(PostCard);
