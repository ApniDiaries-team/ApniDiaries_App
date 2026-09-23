import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import Icon from "../../components/AppIcon";
import { Fonts } from "../../constants/theme";
import { AppContext } from "../../context/AppContext";
import { useDarkMode } from "../../context/DarkModeContext";
import { getProfilePhotoUrl } from "../../helper/DefaultImageUrl";
import {
  followUser,
  getFollowersList,
  getFollowingList,
  unFollowUser,
} from "../../services/user.api";

// Mirrors web pages/followers/index.jsx ("Connections" registry) at its
// mobile-width rendering: the ID/Status columns collapse and each entry
// stacks vertically instead of the desktop 5-column grid.
const PAGE_SIZE = 10;

const TABS = [
  { id: "followers", label: "Followers" },
  { id: "following", label: "Following" },
];

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "—";

const Followers = () => {
  const { theme } = useDarkMode();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useContext(AppContext) || {};

  const profileUserId = params?.userId || user?.id;
  const isOwnProfile = String(profileUserId) === String(user?.id);
  const initialTab = params?.tab === "following" ? "following" : "followers";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("recent");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [pendingIds, setPendingIds] = useState({});
  const [removedIds, setRemovedIds] = useState({});

  const isFollowers = activeTab === "followers";

  const fetchEntries = async (tab) => {
    if (!profileUserId) return;
    try {
      setLoading(true);
      const res = tab === "followers"
        ? await getFollowersList(profileUserId)
        : await getFollowingList(profileUserId);
      if (res?.data?.success) {
        setEntries((tab === "followers" ? res.data.followers : res.data.following) || []);
      }
    } catch (err) {
      Toast.show({ type: "error", text1: `Failed to load ${tab}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setRemovedIds({});
    fetchEntries(activeTab);
  }, [activeTab, profileUserId]);

  const handleFollow = async (id) => {
    setPendingIds((p) => ({ ...p, [id]: true }));
    try {
      const res = await followUser(id);
      if (res?.data?.success) {
        setEntries((prev) => prev.map((f) => (f.id === id ? { ...f, viewer_follows: true } : f)));
      }
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to follow" });
    } finally {
      setPendingIds((p) => ({ ...p, [id]: false }));
    }
  };

  const handleUnfollow = async (id) => {
    setPendingIds((p) => ({ ...p, [id]: true }));
    try {
      const res = await unFollowUser(id);
      if (res?.data?.success) {
        setEntries((prev) => prev.map((f) => (f.id === id ? { ...f, viewer_follows: false } : f)));
      }
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to unfollow" });
    } finally {
      setPendingIds((p) => ({ ...p, [id]: false }));
    }
  };

  const handleRemove = (id) => setRemovedIds((p) => ({ ...p, [id]: true }));

  const filtered = useMemo(() => {
    let list = entries.filter((f) => !removedIds[f.id]);
    if (filter === "mutual") list = list.filter((f) => f.viewer_follows && f.follows_viewer);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((f) => f.name?.toLowerCase().includes(q) || f.username?.toLowerCase().includes(q));
    }
    return list;
  }, [entries, filter, query, removedIds]);

  const visible = filtered.slice(0, visibleCount);

  const goToProfile = (f) => {
    const handle = f.username || f.name?.toLowerCase().replace(/\s+/g, "_");
    router.push({ pathname: "/other-user-profile", params: { userId: f.id, username: handle } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.surface }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 64, paddingBottom: 40 }}>
        {/* Header */}
        <Pressable onPress={() => router.back()} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 20 }}>
          <Icon name="ArrowLeft" size={18} color={theme.onSurface} />
          <Text style={{ fontSize: 14, fontFamily: Fonts.body.semibold, color: theme.onSurface }}>Back</Text>
        </Pressable>

        <Text
          style={{
            fontSize: 11,
            fontFamily: Fonts.body.bold,
            letterSpacing: 2,
            color: theme.primary,
            marginBottom: 6,
          }}
        >
          INDEX // 01
        </Text>
        <Text style={{ fontFamily: Fonts.display.bold, fontSize: 30, color: theme.onSurface, marginBottom: 8 }}>
          {isOwnProfile ? "Your Connections" : "Connections"}
        </Text>
        <Text style={{ fontSize: 14, color: theme.onSurfaceVariant, marginBottom: 20 }}>
          A curated registry of individuals in this journey, organized chronologically.
        </Text>

        {/* Search */}
        <View style={{ position: "relative", justifyContent: "center", marginBottom: 12 }}>
          <Icon name="Search" size={15} color={theme.outline} style={{ position: "absolute", left: 14, zIndex: 1 }} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Filter index..."
            placeholderTextColor={theme.outline}
            style={{
              paddingLeft: 38,
              paddingRight: 14,
              paddingVertical: 11,
              borderRadius: 12,
              fontSize: 14,
              color: theme.onSurface,
              backgroundColor: theme.surfaceContainerLow,
              borderWidth: 1,
              borderColor: theme.outlineVariant,
            }}
          />
        </View>

        {/* Recent / Mutual filter */}
        <View
          style={{
            flexDirection: "row",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.outlineVariant,
            overflow: "hidden",
            marginBottom: 20,
            alignSelf: "flex-start",
          }}
        >
          {["recent", "mutual"].map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                backgroundColor: filter === f ? theme.primaryFixed : "transparent",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: Fonts.body.semibold,
                  textTransform: "capitalize",
                  color: filter === f ? theme.primary : theme.onSurface,
                }}
              >
                {f}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: theme.outlineVariant, marginBottom: 4 }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 12,
                  borderBottomWidth: 2,
                  borderBottomColor: active ? theme.primary : "transparent",
                  marginBottom: -1,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: Fonts.body.semibold,
                    color: active ? theme.primary : theme.onSurfaceVariant,
                  }}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* List */}
        <View style={{ borderTopWidth: 1, borderTopColor: theme.outlineVariant }}>
          {loading ? (
            <View style={{ paddingVertical: 56, alignItems: "center" }}>
              <ActivityIndicator size="small" color={theme.primary} />
            </View>
          ) : visible.length === 0 ? (
            <Text style={{ textAlign: "center", paddingVertical: 56, fontSize: 14, color: theme.onSurfaceVariant }}>
              No {isFollowers ? "followers" : "following"} found.
            </Text>
          ) : (
            visible.map((f) => {
              const isPending = pendingIds[f.id];
              const isViewerRow = String(f.id) === String(user?.id);
              const handle = f.username || f.name?.toLowerCase().replace(/\s+/g, "_");
              const dateValue = isFollowers ? f.joined_at : f.followed_at;

              return (
                <View
                  key={f.id}
                  style={{
                    paddingVertical: 18,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.outlineVariant,
                    gap: 10,
                  }}
                >
                  <Pressable onPress={() => goToProfile(f)} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <Image
                      source={{ uri: getProfilePhotoUrl(f.profile_photo) }}
                      style={{ width: 44, height: 44, borderRadius: 999, backgroundColor: theme.surfaceContainerLow }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: Fonts.display.semibold, fontSize: 15, color: theme.onSurface }} numberOfLines={1}>
                        {f.name}
                      </Text>
                      <Text style={{ fontSize: 13, color: theme.onSurfaceVariant }} numberOfLines={1}>
                        @{handle}
                      </Text>
                    </View>
                  </Pressable>

                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    {f.follows_viewer && (
                      <View
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 6,
                          backgroundColor: theme.surfaceContainerLow,
                        }}
                      >
                        <Text style={{ fontSize: 10, fontFamily: Fonts.body.bold, textTransform: "uppercase", color: theme.onSurfaceVariant }}>
                          Follows you
                        </Text>
                      </View>
                    )}
                    <Text style={{ fontSize: 12, color: theme.onSurfaceVariant }}>
                      {isFollowers ? "Joined" : "Since"} {fmtDate(dateValue)}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    {isViewerRow ? (
                      <Text style={{ fontSize: 13, color: theme.onSurfaceVariant }}>You</Text>
                    ) : f.viewer_follows ? (
                      <Pressable
                        disabled={isPending}
                        onPress={() => handleUnfollow(f.id)}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 9,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: theme.outlineVariant,
                          opacity: isPending ? 0.5 : 1,
                        }}
                      >
                        <Text style={{ fontSize: 13, fontFamily: Fonts.body.semibold, color: theme.onSurface }}>Following</Text>
                      </Pressable>
                    ) : (
                      <Pressable
                        disabled={isPending}
                        onPress={() => handleFollow(f.id)}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 9,
                          borderRadius: 10,
                          backgroundColor: theme.primary,
                          opacity: isPending ? 0.5 : 1,
                        }}
                      >
                        <Text style={{ fontSize: 13, fontFamily: Fonts.body.semibold, color: "#FFFFFF" }}>
                          {f.follows_viewer ? "Follow Back" : "Follow"}
                        </Text>
                      </Pressable>
                    )}

                    {isOwnProfile && isFollowers && (
                      <Pressable onPress={() => handleRemove(f.id)} hitSlop={8}>
                        <Icon name="X" size={16} color={theme.onSurfaceVariant} />
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>

        {visible.length < filtered.length && (
          <Pressable
            onPress={() => setVisibleCount((c) => c + PAGE_SIZE)}
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 24 }}
          >
            <Text style={{ fontSize: 12, fontFamily: Fonts.body.bold, letterSpacing: 1, textTransform: "uppercase", color: theme.onSurface }}>
              Load More Entries
            </Text>
            <Icon name="ChevronDown" size={14} color={theme.onSurface} />
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
};

export default Followers;
