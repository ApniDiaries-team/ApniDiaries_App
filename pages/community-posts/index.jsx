import { useFocusEffect, useRouter } from "expo-router";
import { MapPin, Plus, Search, X } from "lucide-react-native";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Fonts } from "../../constants/theme";
import { AppContext } from "../../context/AppContext";
import { useDarkMode } from "../../context/DarkModeContext";
import { getCityPostCounts, getFeed } from "../../services/posts.api";
import PostCard, { AudioManager } from "./components/PostCard"; // ← ADD: import AudioManager

const S = "#FF9933";

const MOODS = [
  { id: "all", label: "For You" },
  { id: "new", label: "Recent" },
  { id: "popular", label: "Popular" },
  { id: "adventure", label: "Adventure" },
  { id: "solo", label: "Solo" },
  { id: "spiritual", label: "Spiritual" },
];

// ─── Skeleton card ────────────────────────────────────────────────────────────
const Skeleton = ({ dk }) => {
  const anim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);
  const bg = dk ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
  const bg2 = dk ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const bg3 = dk ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  return (
    <Animated.View style={{ opacity: anim, marginBottom: 2 }}>
      <View style={{ height: 320, backgroundColor: bg }} />
      <View
        style={{
          paddingHorizontal: 12,
          paddingTop: 12,
          paddingBottom: 16,
          gap: 8,
        }}
      >
        <View
          style={{
            height: 12,
            width: "55%",
            borderRadius: 6,
            backgroundColor: bg2,
          }}
        />
        <View
          style={{
            height: 11,
            width: "38%",
            borderRadius: 6,
            backgroundColor: bg3,
          }}
        />
      </View>
    </Animated.View>
  );
};

// ─── Loading dots ─────────────────────────────────────────────────────────────
const LoadingDots = () => {
  const a0 = useRef(new Animated.Value(0)).current;
  const a1 = useRef(new Animated.Value(0)).current;
  const a2 = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    [a0, a1, a2].forEach((a, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 100),
          Animated.timing(a, {
            toValue: -6,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(a, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(300),
        ]),
      ).start();
    });
  }, []);
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 32,
      }}
    >
      {[a0, a1, a2].map((a, i) => (
        <Animated.View
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: S,
            transform: [{ translateY: a }],
          }}
        />
      ))}
    </View>
  );
};

const CommunityPosts = () => {
  const router = useRouter();
  const { user } = useContext(AppContext);
  const { isDarkMode } = useDarkMode();
  const dk = isDarkMode;
  const insets = useSafeAreaInsets();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState(null);
  const [cities, setCities] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [selectedCity, setSelectedCity] = useState("all");
  const [mood, setMood] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const searchRef = useRef(null);
  const loadingRef = useRef(false);

  // ✅ Stop all audio when leaving the community feed screen
  useFocusEffect(
    useCallback(() => {
      // (Screen is focused)
      return () => {
        // (Screen is blurred)
        AudioManager.pauseAll();
      };
    }, [])
  );

  // ── ADD: viewability config for AudioManager ─────────────────────────────────
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useCallback(({ changed }) => {
    changed.forEach(({ item, isViewable }) => {
      if (isViewable) {
        AudioManager.onCardVisible(item.id);
      } else {
        AudioManager.onCardHidden(item.id);
      }
    });
  }, []);
  // ─────────────────────────────────────────────────────────────────────────────

  const bg = dk ? "#0d0d0d" : "#f7f4ef";
  const bdr = dk ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const surf = dk ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";

  // ── City counts ──────────────────────────────────────────────────────────────
  useEffect(() => {
    getCityPostCounts()
      .then((r) => {
        setCities(r.data?.data?.cities || []);
        setTotalPosts(r.data?.data?.totalPosts || 0);
      })
      .catch(() => { });
  }, []);

  // ── Load feed ────────────────────────────────────────────────────────────────
  const loadPosts = useCallback(async (cursor = null, reset = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const res = await getFeed(1, cursor);
      const incoming = res.data?.posts || [];
      if (reset) setPosts(incoming);
      else setPosts((prev) => [...prev, ...incoming]);
      setHasMore(res.data?.hasMore || false);
      setNextCursor(res.data?.nextCursor || null);
    } catch {
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts(null, true);
  }, []);

  const removePost = (id) => setPosts((p) => p.filter((x) => x.id !== id));

  // ── Filter / sort ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let out = posts;
    if (selectedCity !== "all") {
      const q = selectedCity.toLowerCase();
      out = out.filter((p) => (p?.destination || "").toLowerCase().includes(q));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      out = out.filter(
        (p) =>
          p?.content?.toLowerCase().includes(q) ||
          p?.destination?.toLowerCase().includes(q) ||
          p?.user?.name?.toLowerCase().includes(q),
      );
    }
    if (mood === "new")
      return [...out].sort(
        (a, b) =>
          new Date(b.createdAt || b.created_at) -
          new Date(a.createdAt || a.created_at),
      );
    if (mood === "popular")
      return [...out].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
    if (mood === "adventure")
      return out.filter((p) =>
        p?.trip_types?.some((t) =>
          ["adventure", "backpacking", "trekking"].includes(t?.toLowerCase()),
        ),
      );
    if (mood === "solo")
      return out.filter((p) =>
        p?.trip_types?.some((t) => t?.toLowerCase() === "solo"),
      );
    if (mood === "spiritual")
      return out.filter((p) =>
        p?.trip_types?.some((t) => t?.toLowerCase() === "spiritual"),
      );
    return out;
  }, [posts, selectedCity, searchQuery, mood]);

  const renderPost = useCallback(
    ({ item }) => <PostCard post={item} onPostDeleted={removePost} />,
    [],
  );

  const handleEndReached = useCallback(() => {
    if (hasMore && !loading && nextCursor) loadPosts(nextCursor);
  }, [hasMore, loading, nextCursor]);

  // ── List header ───────────────────────────────────────────────────────────────
  const ListHeader = () => (
    <View>
      {cities.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ paddingVertical: 12 }}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          <Pressable
            onPress={() => setSelectedCity("all")}
            style={{
              flexShrink: 0,
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 100,
              backgroundColor: selectedCity === "all" ? S : surf,
              borderWidth: 1,
              borderColor: selectedCity === "all" ? "transparent" : bdr,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontFamily: Fonts.inter.bold,
                color:
                  selectedCity === "all"
                    ? "#fff"
                    : dk
                      ? "rgba(255,255,255,0.6)"
                      : "rgba(0,0,0,0.5)",
              }}
            >
              All · {totalPosts}
            </Text>
          </Pressable>

          {cities.map((city) => {
            const active = selectedCity === city.name;
            return (
              <Pressable
                key={city.name}
                onPress={() => setSelectedCity(active ? "all" : city.name)}
                style={{
                  flexShrink: 0,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 100,
                  backgroundColor: active ? S : surf,
                  borderWidth: 1,
                  borderColor: active ? "transparent" : bdr,
                }}
              >
                <MapPin
                  size={9}
                  strokeWidth={2.5}
                  color={
                    active
                      ? "#fff"
                      : dk
                        ? "rgba(255,255,255,0.6)"
                        : "rgba(0,0,0,0.5)"
                  }
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: Fonts.inter.bold,
                    color: active
                      ? "#fff"
                      : dk
                        ? "rgba(255,255,255,0.6)"
                        : "rgba(0,0,0,0.5)",
                  }}
                >
                  {city.name}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: Fonts.inter.bold,
                    color: active
                      ? "rgba(255,255,255,0.7)"
                      : dk
                        ? "rgba(255,255,255,0.35)"
                        : "rgba(0,0,0,0.35)",
                  }}
                >
                  · {city.postCount}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {searchQuery.trim() ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginHorizontal: 16,
            marginBottom: 8,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
            backgroundColor: S + "0f",
            borderWidth: 1,
            borderColor: S + "25",
          }}
        >
          <Search size={12} color={S} />
          <Text
            style={{
              fontSize: 12,
              flex: 1,
              fontFamily: Fonts.inter.regular,
              color: dk ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.inter.extrabold,
                color: dk ? "#fff" : "#0f172a",
              }}
            >
              "{searchQuery}"
            </Text>
            {"  "}
            {filtered.length} {filtered.length === 1 ? "result" : "results"}
          </Text>
          <Pressable
            onPress={() => {
              setSearchQuery("");
              setSearchOpen(false);
            }}
            hitSlop={8}
          >
            <X
              size={12}
              color={dk ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
            />
          </Pressable>
        </View>
      ) : null}
    </View>
  );

  // ── List empty ────────────────────────────────────────────────────────────────
  const ListEmpty = () => {
    if (loading)
      return (
        <View style={{ paddingTop: 8 }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} dk={dk} />
          ))}
        </View>
      );
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 96,
          paddingHorizontal: 32,
        }}
      >
        <Text style={{ fontSize: 48, marginBottom: 20 }}>🧭</Text>
        <Text
          style={{
            fontSize: 16,
            fontFamily: Fonts.playfair.black,
            color: dk ? "#fff" : "#0f172a",
            marginBottom: 6,
            textAlign: "center",
          }}
        >
          {selectedCity !== "all"
            ? `No stories from ${selectedCity}`
            : "No stories yet"}
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: Fonts.inter.regular,
            color: dk ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          Be the first to share your adventure
        </Text>
        <Pressable
          onPress={() => router.push("/create-post")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 16,
            backgroundColor: S,
          }}
        >
          <Plus size={15} color="#fff" strokeWidth={2.5} />
          <Text
            style={{
              fontSize: 14,
              fontFamily: Fonts.inter.bold,
              color: "#fff",
            }}
          >
            Share a story
          </Text>
        </Pressable>
      </View>
    );
  };

  // ── List footer ───────────────────────────────────────────────────────────────
  const ListFooter = () => {
    if (loading && posts.length > 0) return <LoadingDots />;
    if (!hasMore && filtered.length > 0 && !loading) {
      return (
        <View style={{ alignItems: "center", paddingVertical: 40 }}>
          <Text
            style={{
              fontSize: 10,
              fontFamily: Fonts.inter.bold,
              color: dk ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
              letterSpacing: 1.2,
              textTransform: "uppercase",
            }}
          >
            All caught up
          </Text>
        </View>
      );
    }
    return <View style={{ height: 120 }} />;
  };

  return (
    <View style={{ flex: 1, backgroundColor: bg, paddingTop: 0 }}>
      {/* ── Sticky Header ────────────────────────────────────────────────────── */}
      <View
        style={{
          backgroundColor: bg,
          borderBottomWidth: 1,
          borderBottomColor: bdr,
        }}
      >
        {/* Top row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            {searchOpen ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 16,
                  backgroundColor: surf,
                  borderWidth: 1,
                  borderColor: bdr,
                }}
              >
                <Search size={14} color={S} />
                <TextInput
                  ref={searchRef}
                  autoFocus
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search stories, places…"
                  placeholderTextColor={
                    dk ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"
                  }
                  style={{
                    flex: 1,
                    fontSize: 14,
                    fontFamily: Fonts.inter.regular,
                    color: dk ? "#fff" : "#0f172a",
                    paddingVertical: 0,
                  }}
                />
                {searchQuery ? (
                  <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
                    <X
                      size={13}
                      color={dk ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"}
                    />
                  </Pressable>
                ) : null}
              </View>
            ) : (
              <Text
                style={{
                  fontSize: 17,
                  fontFamily: Fonts.playfair.black,
                  letterSpacing: -0.4,
                  color: dk ? "#fff" : "#0f172a",
                }}
              >
                Community
              </Text>
            )}
          </View>

          {/* Search toggle */}
          <Pressable
            onPress={() => {
              setSearchOpen((s) => !s);
              if (!searchOpen) setTimeout(() => searchRef.current?.focus(), 60);
            }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: searchOpen ? S + "18" : surf,
              borderWidth: 1,
              borderColor: bdr,
            }}
          >
            {searchOpen ? (
              <X size={15} color={S} />
            ) : (
              <Search
                size={15}
                color={dk ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)"}
              />
            )}
          </Pressable>

          {/* Post button */}
          <Pressable
            onPress={() => router.push("/create-post")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 16,
              backgroundColor: S,
              shadowColor: S,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.45,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <Plus size={14} color="#fff" strokeWidth={3} />
            <Text
              style={{
                fontSize: 12,
                fontFamily: Fonts.inter.extrabold,
                color: "#fff",
              }}
            >
              Post
            </Text>
          </Pressable>
        </View>

        {/* Mood tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {MOODS.map((m) => {
            const active = mood === m.id;
            return (
              <Pressable
                key={m.id}
                onPress={() => setMood(m.id)}
                style={{ paddingHorizontal: 14, paddingVertical: 10 }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: Fonts.inter.extrabold,
                    color: active
                      ? S
                      : dk
                        ? "rgba(255,255,255,0.45)"
                        : "rgba(0,0,0,0.4)",
                  }}
                >
                  {m.label}
                </Text>
                {active && (
                  <View
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 14,
                      right: 14,
                      height: 2,
                      borderRadius: 2,
                      backgroundColor: S,
                    }}
                  />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Feed ─────────────────────────────────────────────────────────────── */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderPost}
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={<ListEmpty />}
        ListFooterComponent={<ListFooter />}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={Platform.OS === "android"}
        maxToRenderPerBatch={5}
        windowSize={10}
        initialNumToRender={4}
        style={{ backgroundColor: bg }}
        // ── ADD: these 2 props wire up AudioManager ──────────────────────────
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
      // ────────────────────────────────────────────────────────────────────
      />

      {/* ── FAB ──────────────────────────────────────────────────────────────── */}
      <Pressable
        onPress={() => router.push("/create-post")}
        style={{
          position: "absolute",
          bottom: insets.bottom + 20,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: S,
          shadowColor: S,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.45,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <Plus size={24} color="#fff" strokeWidth={2.5} />
      </Pressable>
    </View>
  );
};

export default CommunityPosts;