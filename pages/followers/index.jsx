import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
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

const ACCENT = "#A23F00";
const PAGE_SIZE = 8;

const ConnectionsPage = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useContext(AppContext);
  const { isDarkMode } = useDarkMode();
  const profileUserId = params?.userId || user?.id;
  const isOwnProfile = String(profileUserId) === String(user?.id);
  const [activeTab, setActiveTab] = useState(
    params?.tab === "following" ? "following" : "followers",
  );
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("recent");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [pendingIds, setPendingIds] = useState({});

  const colors = {
    background: isDarkMode ? "#0B0E14" : "#FFF8F6",
    card: isDarkMode ? "#1E242F" : "#FFFFFF",
    surface: isDarkMode ? "#1A1F29" : "#FFF1EC",
    text: isDarkMode ? "#FFFFFF" : "#261913",
    muted: isDarkMode ? "#A0AEC0" : "#594137",
    border: isDarkMode ? "#2D3748" : "#E1BFB2",
  };

  const fetchEntries = useCallback(async () => {
    if (!profileUserId) {
      setEntries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response =
        activeTab === "followers"
          ? await getFollowersList(profileUserId)
          : await getFollowingList(profileUserId);
      const payload = response?.data;
      const rows =
        activeTab === "followers"
          ? payload?.followers
          : payload?.following;
      setEntries(Array.isArray(rows) ? rows : []);
    } catch (error) {
      Alert.alert(
        "Could not load connections",
        error?.response?.data?.message || "Please try again in a moment.",
      );
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, profileUserId]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    fetchEntries();
  }, [fetchEntries]);

  const filtered = useMemo(() => {
    let rows = entries;
    if (filter === "mutual") {
      rows = rows.filter((person) => person.viewer_follows && person.follows_viewer);
    }
    const normalized = query.trim().toLowerCase();
    if (normalized) {
      rows = rows.filter((person) =>
        `${person.name || ""} ${person.username || ""}`
          .toLowerCase()
          .includes(normalized),
      );
    }
    return rows;
  }, [entries, filter, query]);

  const updateFollow = async (person) => {
    if (!person?.id || pendingIds[person.id]) return;
    const wasFollowing = !!person.viewer_follows;
    setPendingIds((current) => ({ ...current, [person.id]: true }));
    try {
      const response = wasFollowing
        ? await unFollowUser(person.id)
        : await followUser(person.id);
      if (response?.data?.success !== false) {
        setEntries((current) =>
          current.map((entry) =>
            entry.id === person.id
              ? { ...entry, viewer_follows: !wasFollowing }
              : entry,
          ),
        );
      }
    } catch (error) {
      Alert.alert(
        "Action failed",
        error?.response?.data?.message || "Please try again.",
      );
    } finally {
      setPendingIds((current) => ({ ...current, [person.id]: false }));
    }
  };

  const openProfile = (person) => {
    const handle = person?.username || person?.name?.toLowerCase()?.replace(/\s+/g, "-");
    router.push({
      pathname: "/other-user-profile",
      params: { userId: person.id, username: handle },
    });
  };

  const dateLabel = (person) => {
    const date = activeTab === "followers" ? person.joined_at : person.followed_at;
    if (!date) return "Connection";
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime())
      ? "Connection"
      : parsed.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 18, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              marginRight: 14,
            }}
          >
            <Icon name="ArrowLeft" size={20} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ color: ACCENT, fontSize: 10, letterSpacing: 2, fontFamily: Fonts.inter.bold }}>
              YOUR TRAVEL CIRCLE
            </Text>
            <Text style={{ color: colors.text, fontSize: 26, fontFamily: Fonts.playfair.bold, marginTop: 2 }}>
              {isOwnProfile ? "Your connections" : "Connections"}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", backgroundColor: colors.surface, borderRadius: 16, padding: 5, marginBottom: 18 }}>
          {["followers", "following"].map((tab) => {
            const active = activeTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  minHeight: 44,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: active ? colors.card : "transparent",
                  shadowColor: "#261913",
                  shadowOpacity: active ? 0.08 : 0,
                  shadowRadius: 6,
                  elevation: active ? 1 : 0,
                }}
              >
                <Text style={{ color: active ? ACCENT : colors.muted, fontSize: 14, fontFamily: Fonts.inter.bold, textTransform: "capitalize" }}>
                  {tab}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingHorizontal: 14,
            minHeight: 50,
            backgroundColor: colors.card,
            borderRadius: 15,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 12,
          }}
        >
          <Icon name="Search" size={18} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Find a traveler..."
            placeholderTextColor={colors.muted}
            style={{ flex: 1, color: colors.text, fontSize: 14, fontFamily: Fonts.inter.regular, paddingVertical: 12 }}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Icon name="X" size={17} color={colors.muted} />
            </Pressable>
          )}
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <Text style={{ fontSize: 13, color: colors.muted, fontFamily: Fonts.inter.medium }}>
            {filtered.length} {activeTab}
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {["recent", "mutual"].map((option) => {
              const active = filter === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => setFilter(option)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 20,
                    backgroundColor: active ? ACCENT : colors.surface,
                    borderWidth: 1,
                    borderColor: active ? ACCENT : colors.border,
                  }}
                >
                  <Text style={{ color: active ? "#fff" : colors.muted, fontSize: 11, fontFamily: Fonts.inter.semibold, textTransform: "capitalize" }}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ gap: 10 }}>
          {loading ? (
            <View style={{ paddingVertical: 52, alignItems: "center" }}>
              <ActivityIndicator color={ACCENT} size="large" />
              <Text style={{ color: colors.muted, fontSize: 13, marginTop: 12 }}>Loading connections…</Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 44, paddingHorizontal: 24, backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.border }}>
              <View style={{ width: 54, height: 54, borderRadius: 18, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <Icon name="Users" size={24} color={ACCENT} />
              </View>
              <Text style={{ color: colors.text, fontFamily: Fonts.playfair.bold, fontSize: 18 }}>No {activeTab} yet</Text>
              <Text style={{ color: colors.muted, fontSize: 13, marginTop: 6, textAlign: "center" }}>
                {query ? "Try a different name or username." : "Your travel community will show up here."}
              </Text>
            </View>
          ) : (
            filtered.slice(0, visibleCount).map((person) => {
              const isYou = String(person.id) === String(user?.id);
              const handle = person.username || person.name?.toLowerCase()?.replace(/\s+/g, "_");
              const isPending = pendingIds[person.id];
              return (
                <View
                  key={person.id}
                  style={{
                    minHeight: 86,
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 13,
                    paddingVertical: 12,
                    backgroundColor: colors.card,
                    borderRadius: 17,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Pressable onPress={() => openProfile(person)} style={{ flexDirection: "row", alignItems: "center", flex: 1, minWidth: 0 }}>
                    <Image
                      source={{ uri: getProfilePhotoUrl(person.profile_photo || person.avatar) }}
                      style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: colors.surface, marginRight: 12 }}
                    />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text numberOfLines={1} style={{ color: colors.text, fontFamily: Fonts.playfair.semibold, fontSize: 15 }}>{person.name || "Traveler"}</Text>
                      <Text numberOfLines={1} style={{ color: colors.muted, fontFamily: Fonts.inter.regular, fontSize: 12, marginTop: 2 }}>@{handle || "traveler"}</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 5 }}>
                        {person.follows_viewer && <Text style={{ color: ACCENT, backgroundColor: colors.surface, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, fontSize: 9, fontFamily: Fonts.inter.bold }}>FOLLOWS YOU</Text>}
                        <Text style={{ color: colors.muted, fontSize: 10 }}>{dateLabel(person)}</Text>
                      </View>
                    </View>
                  </Pressable>
                  {isYou ? (
                    <Text style={{ color: colors.muted, fontSize: 12, fontFamily: Fonts.inter.medium, paddingHorizontal: 6 }}>You</Text>
                  ) : (
                    <Pressable
                      disabled={isPending}
                      onPress={() => updateFollow(person)}
                      style={{
                        minWidth: 88,
                        paddingHorizontal: 12,
                        paddingVertical: 9,
                        borderRadius: 12,
                        alignItems: "center",
                        backgroundColor: person.viewer_follows ? colors.surface : ACCENT,
                        borderWidth: person.viewer_follows ? 1 : 0,
                        borderColor: colors.border,
                        opacity: isPending ? 0.6 : 1,
                      }}
                    >
                      <Text style={{ color: person.viewer_follows ? colors.text : "#fff", fontSize: 11, fontFamily: Fonts.inter.bold }}>
                        {isPending ? "Please wait" : person.viewer_follows ? "Following" : person.follows_viewer ? "Follow back" : "Follow"}
                      </Text>
                    </Pressable>
                  )}
                </View>
              );
            })
          )}
        </View>

        {!loading && visibleCount < filtered.length && (
          <Pressable onPress={() => setVisibleCount((count) => count + PAGE_SIZE)} style={{ alignSelf: "center", marginTop: 22, flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, paddingHorizontal: 16 }}>
            <Text style={{ color: colors.text, fontSize: 12, fontFamily: Fonts.inter.bold, letterSpacing: 1 }}>LOAD MORE</Text>
            <Icon name="ChevronDown" size={15} color={ACCENT} />
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
};

export default ConnectionsPage;
