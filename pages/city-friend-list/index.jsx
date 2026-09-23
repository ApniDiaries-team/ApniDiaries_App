import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import PrivateAccountModal from "../../components/common/PrivateAccountModal";
import ProfileQuickActionsModal from "../../components/ui/ProfileQuickActionsModal";
import { Fonts } from "../../constants/theme";
import { AppContext } from "../../context/AppContext";
import { useDarkMode } from "../../context/DarkModeContext";
import { socket } from "../../lib/sockets";
import {
  getUnseenMissedCallCount,
  markAllMissedCallsSeen,
} from "../../services/call.api";
import { getChatList } from "../../services/chat.api";
import { getTrips } from "../../services/trips.api";
import {
  blockUser,
  followUser,
  getSuggestedFriendsList,
  removeFriend,
  sendFriendRequest,
  UnBlockUser,
  unFollowUser,
} from "../../services/user.api";
import EmptyState from "./components/EmptyState";
import FriendCard from "./components/FriendCard";
import StatsBar from "./components/StatsBar";
import SuggestedFriends from "./components/SuggestedFriends";
import TripCalendarModal from "./components/TripCalendarModal";

const ORANGE = "#FF9933";

const CityFriendList = () => {
  const params = useLocalSearchParams();
  const cityId = params?.cityId;
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { isDarkMode } = useDarkMode();
  const { user } = useContext(AppContext);
  const isDesktop = width >= 1024;

  const colors = {
    bgPrimary: isDarkMode ? "#0B0E14" : "#FFFFFF",
    bgCard: isDarkMode ? "#1E242F" : "#EDF2F7",
    bgSecondary: isDarkMode ? "#1A1F29" : "#F7FAFC",
    textPrimary: isDarkMode ? "#FFFFFF" : "#111827",
    textSecondary: isDarkMode ? "#A0AEC0" : "#6b7280",
    border: isDarkMode ? "#2D3748" : "rgba(0,0,0,0.08)",
  };

  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedCity, setSelectedCity] = useState(cityId || "all");
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [allTrips, setAllTrips] = useState([]);
  const [upcomingTrips, setUpcomingTrips] = useState(0);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [missedCalls, setMissedCalls] = useState(0);
  const [isPrivateModalOpen, setIsPrivateModalOpen] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [activeMessageUserId, setActiveMessageUserId] = useState(null);

  const friendsRef = useRef(friends);
  useEffect(() => {
    friendsRef.current = friends;
  }, [friends]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const computeStatus = (lastActive) => {
    if (!lastActive) return "offline";
    const diffMinutes = (Date.now() - new Date(lastActive).getTime()) / 60000;
    if (diffMinutes < 1) return "online";
    if (diffMinutes < 5) return "away";
    return "offline";
  };

  // ── Fetch chat list ───────────────────────────────────────────────────────
  const fetchChatList = useCallback(async () => {
    try {
      setLoadingMessages(true);
      const res = await getChatList();
      if (res?.data?.success) {
        const seen = new Set();
        const unique = (res?.data?.data || [])
          .filter((f) => {
            if (seen.has(f.id)) return false;
            seen.add(f.id);
            return true;
          })
          .map((friend) => ({
            ...friend,
            status: computeStatus(friend.lastActive),
          }));

        setFriends(unique);

        const counts = {};
        unique.forEach((f) => {
          if (f.unreadCount > 0) counts[f.id] = f.unreadCount;
        });
        setUnreadCounts((prev) => ({ ...prev, ...counts }));
      }
    } catch (error) {
      console.log("Error loading chat list", error);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // ── Filter + sort ─────────────────────────────────────────────────────────
  useEffect(() => {
    let filtered = [...friends];

    switch (activeFilter) {
      case "online":
        filtered = filtered.filter((f) => f.isFriend && f.status === "online");
        break;
      case "recent":
        const oneDayAgo = new Date(Date.now() - 86400000);
        filtered = filtered.filter(
          (f) => f.isFriend && new Date(f.lastActive) > oneDayAgo,
        );
        break;
      case "all":
      default:
        filtered = filtered.filter((f) => f.isFriend);
        break;
    }

    if (selectedCity !== "all") {
      filtered = filtered.filter((f) => f.cityId === selectedCity);
    }

    filtered.sort((a, b) => {
      const aUnread = unreadCounts[a.id] || 0;
      const bUnread = unreadCounts[b.id] || 0;
      if (bUnread !== aUnread) return bUnread - aUnread;

      switch (sortBy) {
        case "recent":
          return new Date(b.lastActive) - new Date(a.lastActive);
        case "favorites":
          if (a.isFavorite !== b.isFavorite) return b.isFavorite ? 1 : -1;
          return new Date(b.lastActive) - new Date(a.lastActive);
        case "alphabetical":
          return a.name?.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredFriends(filtered);
  }, [activeFilter, sortBy, selectedCity, friends, unreadCounts]);

  // ── Fetch trips ───────────────────────────────────────────────────────────
  const fetchAllTrips = async () => {
    try {
      const res = await getTrips(1);
      if (res?.data) {
        setAllTrips(res.data);
        const now = new Date();
        const upcoming = res.data.filter(
          (trip) => new Date(trip.startDate) > now,
        ).length;
        setUpcomingTrips(upcoming);
      }
    } catch (error) {
      console.log("Error fetching trips", error);
    }
  };

  // ── Fetch suggested friends ───────────────────────────────────────────────
  const getMutualFriends = async () => {
    try {
      const res = await getSuggestedFriendsList(user?.id);
      if (res?.data?.success) setSuggestedFriends(res?.data?.data);
    } catch (error) {
      console.log("Error fetching mutual friends", error);
    }
  };

  // ── Fetch missed calls ────────────────────────────────────────────────────
  const fetchMissedCalls = async () => {
    try {
      const res = await getUnseenMissedCallCount();
      if (res?.data?.success) setMissedCalls(res.data.count);
    } catch (e) {
      console.log("fetchMissedCalls error", e);
    }
  };

  // ── Socket ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket.connected) socket.connect();

    const handleUserOnline = (userId) => {
      const update = (list) =>
        list.map((f) =>
          String(f.id) === String(userId) ? { ...f, status: "online" } : f,
        );
      setFriends(update);
      setFilteredFriends(update);
    };

    const handleUserOffline = (userId) => {
      const update = (list) =>
        list.map((f) =>
          String(f.id) === String(userId) ? { ...f, status: "offline" } : f,
        );
      setFriends(update);
      setFilteredFriends(update);
    };

    const handleNewNotification = ({ type, actor_id }) => {
      if (type !== "message" || !actor_id) return;
      setUnreadCounts((prev) => ({
        ...prev,
        [actor_id]: (prev[actor_id] || 0) + 1,
      }));
      setActiveMessageUserId(String(actor_id));
    };

    // Navigate directly to chat on notification — passes full contact object
    const handleNotifNavigate = ({ threadId, senderId }) => {
      if (!senderId) return;
      const friend = friendsRef.current.find(
        (f) => String(f.id) === String(senderId),
      );
      if (friend) {
        router.push({
          pathname: "/chat-interface",
          params: {
            userId: friend.id,
            threadId: friend.threadId,
            contact: JSON.stringify(friend), // ← full object
          },
        });
      }
    };

    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);
    socket.on("notification:new", handleNewNotification);
    socket.on("notification:navigate", handleNotifNavigate);

    return () => {
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
      socket.off("notification:new", handleNewNotification);
      socket.off("notification:navigate", handleNotifNavigate);
    };
  }, []);

  // ── Initial fetch ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchChatList();
    getMutualFriends();
    fetchAllTrips();
    fetchMissedCalls();
  }, []);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = {
    friends: friends.filter((f) => f.isFriend).length,
    followers: friends.filter((f) => f.isFollower && !f.isFriend).length,
    missedCalls,
    upcomingTrips,
  };

  const totalUnread = Object.values(unreadCounts).reduce(
    (sum, c) => sum + c,
    0,
  );

  // ── handleMessage — passes full contact object like web ───────────────────
  const handleMessage = (friend) => {
    setUnreadCounts((prev) => ({ ...prev, [friend.id]: 0 }));
    if (String(friend.id) === String(activeMessageUserId)) {
      setActiveMessageUserId(null);
    }

    const visibility = friend.messageVisibility || "public";
    const canMessage = friend.isFriend || visibility === "public";

    if (canMessage) {
      router.push({
        pathname: "/chat-interface",
        params: {
          userId: friend.id,
          threadId: friend.threadId,
          contact: JSON.stringify(friend), // ← full object, matches web
        },
      });
    } else {
      setIsPrivateModalOpen(true);
    }
  };

  // ── handleStatClick ───────────────────────────────────────────────────────
  const handleStatClick = (statType) => {
    switch (statType) {
      case "friends":
        break;
      case "followers":
        Alert.alert("Coming Soon", "Followers page coming soon.");
        break;
      case "calls":
        markAllMissedCallsSeen().catch(() => {});
        setMissedCalls(0);

        router.replace("/(protected)/calls");
        break;
      case "upcomingTrips":
        setIsCalendarOpen(true);
        break;
      default:
        break;
    }
  };

  const handleFollowToggle = async (id, name) => {
    try {
      if (!isFollowing) {
        const res = await followUser(id);
        if (res?.data?.success) Alert.alert("Success", `Following ${name}`);
      } else {
        const res = await unFollowUser(id);
        if (res?.data?.success) Alert.alert("Success", `Unfollowing ${name}`);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.log(error);
    }
  };

  const handleRemoveFriend = async (id) => {
    try {
      const res = await removeFriend(id);
      if (res?.data?.success) Alert.alert("Success", "Friend removed");
    } catch (error) {
      console.log(error);
    }
  };

  const handleBlock = async (id, name, isBlocked) => {
    try {
      if (!isBlocked) {
        const res = await blockUser(id);
        if (res?.data?.success) Alert.alert("Success", `Blocking ${name}`);
      } else {
        const res = await UnBlockUser(id);
        if (res?.data?.success) Alert.alert("Success", `Unblocking ${name}`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleQuickActions = (friend) => {
    setSelectedFriend(friend);
    setIsQuickActionsOpen(true);
  };

  const handleQuickAction = async (actionType, userData) => {
    switch (actionType) {
      case "message":
        handleMessage(userData);
        break;
      case "follow":
        setIsFollowing(userData?.isFollowing);
        handleFollowToggle(userData?.id, userData?.name);
        break;
      case "friend":
        handleRemoveFriend(userData?.id);
        break;
      case "block":
        handleBlock(userData?.id, userData?.name, userData?.isBlocked);
        break;
      default:
        break;
    }
    await fetchChatList();
  };

  // ── handleAddFriend — removes from suggested list immediately like web ─────
  const handleAddFriend = async (suggestion) => {
    try {
      const res = await sendFriendRequest(suggestion?.id);
      if (res?.data?.success) {
        setSuggestedFriends((prev) =>
          prev.filter((s) => s.id !== suggestion.id),
        );
        Alert.alert("Success", "Friend request sent");
      }
    } catch (err) {
      console.log("send friend request error", err);
    }
  };

  const handleResetFilters = () => {
    setActiveFilter("all");
    setSortBy("recent");
    setSelectedCity("all");
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View
          style={{
            maxWidth: 1280,
            width: "100%",
            alignSelf: "center",
            paddingHorizontal: 16,
            paddingVertical: 24,
          }}
        >
          {/* ── Header ── */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: isDesktop ? 32 : 24,
                fontFamily: Fonts.playfair.bold,
                color: colors.textPrimary,
                marginBottom: 4,
              }}
            >
              Friends
            </Text>
            <Text
              style={{
                fontSize: isDesktop ? 16 : 14,
                fontFamily: Fonts.inter.regular,
                color: colors.textSecondary,
              }}
            >
              Connect with travelers from around the world
            </Text>
          </View>

          {/* ── Main content ── */}
          <View style={{ gap: 16 }}>
            <StatsBar stats={stats} onStatClick={handleStatClick} />

            <View
              style={{
                flexDirection: isDesktop ? "row" : "column",
                gap: 16,
                alignItems: "flex-start",
              }}
            >
              {/* ── Friends list ── */}
              <View
                style={{
                  flex: isDesktop ? 2 : undefined,
                  width: isDesktop ? undefined : "100%",
                  gap: 12,
                }}
              >
                {loadingMessages ? (
                  <View
                    style={{
                      backgroundColor: colors.bgCard,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 12,
                      padding: 24,
                      alignItems: "center",
                      justifyContent: "center",
                      paddingVertical: 64,
                    }}
                  >
                    <ActivityIndicator size="large" color={ORANGE} />
                    <Text
                      style={{
                        marginTop: 12,
                        fontSize: 14,
                        fontFamily: Fonts.inter.regular,
                        color: colors.textSecondary,
                      }}
                    >
                      Loading friends...
                    </Text>
                  </View>
                ) : filteredFriends.length > 0 ? (
                  <View style={{ gap: 12 }}>
                    {filteredFriends.map((friend) => (
                      <View
                        key={friend?.id}
                        style={{
                          backgroundColor: colors.bgCard,
                          borderWidth: 1,
                          borderColor: colors.border,
                          borderRadius: 12,
                          padding: 16,
                        }}
                      >
                        <View
                          style={{
                            backgroundColor: colors.bgCard,
                            borderWidth: 1,
                            borderColor: colors.border,
                            borderRadius: 12,
                            padding: 12,
                          }}
                        >
                          <FriendCard
                            friend={friend}
                            onMessage={handleMessage}
                            onQuickActions={handleQuickActions}
                            unreadCount={unreadCounts[friend.id] || 0}
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View
                    style={{
                      backgroundColor: colors.bgCard,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 12,
                      padding: 24,
                    }}
                  >
                    <EmptyState
                      filterType={activeFilter}
                      onResetFilters={handleResetFilters}
                    />
                  </View>
                )}
              </View>

              {/* ── Suggested friends sidebar ── */}
              {suggestedFriends.length > 0 && (
                <View
                  style={{
                    flex: isDesktop ? 1 : undefined,
                    width: isDesktop ? undefined : "100%",
                    backgroundColor: colors.bgCard,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  <SuggestedFriends
                    suggestions={suggestedFriends}
                    onAddFriend={handleAddFriend}
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <ProfileQuickActionsModal
        isOpen={isQuickActionsOpen}
        onClose={() => setIsQuickActionsOpen(false)}
        userData={selectedFriend}
        onAction={handleQuickAction}
      />

      <TripCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        trips={allTrips}
      />

      <PrivateAccountModal
        isOpen={isPrivateModalOpen}
        onClose={() => setIsPrivateModalOpen(false)}
        username={selectedFriend?.name}
      />
    </View>
  );
};

export default CityFriendList;
