import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import Icon from "../../components/AppIcon";
import { Fonts } from "../../constants/theme";
import { useDarkMode } from "../../context/DarkModeContext";
import { useNotifications } from "../../context/NotificationContext";
import { getProfilePhotoUrl } from "../../helper/DefaultImageUrl";
import { markAllRead as apiMarkAllRead, markNotificationRead } from "../../services/notification.api";
import { acceptFriend, declineFriend } from "../../services/user.api";
import EmptyNotifications from "./components/EmptyNotifications";
import NotificationFilter from "./components/NotificationFilter";

// Mirrors web pages/notifications/index.jsx: date-grouped flat list with
// inline unread dot, accept/decline, reply, and view-details actions —
// replacing the old boxed-card design and its friend_request/follow/
// message/engagement filter set with web's all/message/invites/alerts.
const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const groupByDate = (list) => {
  const today = new Date();
  const yesterday = new Date(Date.now() - 86400000);
  const groups = { Today: [], Yesterday: [], Earlier: [] };
  list.forEach((n) => {
    const d = n.timestamp ? new Date(n.timestamp) : null;
    if (d && isSameDay(d, today)) groups.Today.push(n);
    else if (d && isSameDay(d, yesterday)) groups.Yesterday.push(n);
    else groups.Earlier.push(n);
  });
  return Object.entries(groups).filter(([, items]) => items.length > 0);
};

const relativeTime = (timestamp) => {
  if (!timestamp) return "";
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const hrs = Math.floor(diffMs / 3600000);
  if (hrs < 1) return `${Math.max(1, Math.floor(diffMs / 60000))}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const Notifications = () => {
  const router = useRouter();
  const { theme } = useDarkMode();
  const { notifications, unreadCount, markAllRead, markOneRead, respondToFriendRequest, isLoading } =
    useNotifications();

  const [activeFilter, setActiveFilter] = useState("all");

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "message") return n.type === "message";
    if (activeFilter === "invites") return n.type === "friend_request";
    if (activeFilter === "alerts") return !["message", "friend_request"].includes(n.type);
    return true;
  });

  const grouped = groupByDate(filteredNotifications);

  const handleAcceptRequest = async (n) => {
    try {
      const res = await acceptFriend(n.friendRequestId);
      if (res?.data?.success) respondToFriendRequest(n.id, true);
    } catch (e) { console.log(e); }
  };
  const handleDeclineRequest = async (n) => {
    try {
      const res = await declineFriend(n.friendRequestId);
      if (res?.data?.success) respondToFriendRequest(n.id, false);
    } catch (e) { console.log(e); }
  };
  const handleMarkAllRead = async () => {
    try { await apiMarkAllRead(); markAllRead(); } catch (e) { console.log(e); }
  };

  const handleCardPress = async (n) => {
    if (!n.isRead) {
      try { await markNotificationRead(n.id); markOneRead(n.id); } catch (e) { console.log(e); }
    }
    switch (n.type) {
      case "follow":
      case "like":
      case "comment":
        router.push({ pathname: "/other-user-profile", params: { userId: n.userId, username: n.name } });
        break;
      case "message":
        router.push({
          pathname: "/chat-interface",
          params: { userId: n.userId, threadId: n.threadId || "" },
        });
        break;
      case "missed_call":
        router.push("/calls");
        break;
      default:
        if (n.link) router.push(n.link);
        break;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.surface }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 64, paddingBottom: 40 }}>
        <Text style={{ fontFamily: Fonts.display.bold, fontSize: 28, color: theme.onSurface, marginBottom: 20 }}>
          Inbox
        </Text>

        <NotificationFilter
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={{
            all: notifications.filter((n) => !n.isRead).length,
            message: notifications.filter((n) => n.type === "message" && !n.isRead).length,
            invites: notifications.filter((n) => n.type === "friend_request" && !n.isResponded).length,
            alerts: notifications.filter((n) => !["message", "friend_request"].includes(n.type) && !n.isRead).length,
          }}
        />

        <View style={{ borderTopWidth: 1, borderTopColor: theme.outlineVariant, marginTop: 20, paddingTop: 8, gap: 2 }}>
          <Pressable
            onPress={() => router.push("/settings")}
            style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 12 }}
          >
            <Icon name="Settings" size={18} color={theme.onSurfaceVariant} />
            <Text style={{ fontSize: 14, fontFamily: Fonts.body.semibold, color: theme.onSurfaceVariant }}>
              Notification Settings
            </Text>
          </Pressable>
          {unreadCount > 0 && (
            <Pressable
              onPress={handleMarkAllRead}
              style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 12 }}
            >
              <Icon name="CheckCheck" size={18} color={theme.primary} />
              <Text style={{ fontSize: 14, fontFamily: Fonts.body.semibold, color: theme.primary }}>
                Mark all as read
              </Text>
            </Pressable>
          )}
        </View>

        {isLoading ? (
          <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 64 }}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : filteredNotifications.length === 0 ? (
          <EmptyNotifications filterType={activeFilter} />
        ) : (
          <View style={{ gap: 32, marginTop: 28 }}>
            {grouped.map(([label, items]) => (
              <View key={label}>
                <View style={{ paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: theme.outlineVariant }}>
                  <Text style={{ fontFamily: Fonts.display.bold, fontSize: 19, color: theme.onSurface }}>
                    {label}
                  </Text>
                </View>

                <View>
                  {items.map((n) => (
                    <Pressable
                      key={n.id}
                      onPress={() => handleCardPress(n)}
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        gap: 12,
                        paddingVertical: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: theme.outlineVariant,
                      }}
                    >
                      {!n.isRead && (
                        <View
                          style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.primary, marginTop: 8 }}
                        />
                      )}
                      <View style={{ marginLeft: n.isRead ? 14 : 0 }}>
                        {n.avatar ? (
                          <Image
                            source={{ uri: getProfilePhotoUrl(n.avatar) }}
                            style={{ width: 44, height: 44, borderRadius: 999, backgroundColor: theme.surfaceContainerLow }}
                          />
                        ) : (
                          <View
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 999,
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: theme.tertiary,
                            }}
                          >
                            <Icon name="ExternalLink" size={16} color="#FFFFFF" />
                          </View>
                        )}
                      </View>

                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{ fontSize: 14, lineHeight: 20, color: theme.onSurface }}>
                          {!!n.userName && (
                            <Text style={{ fontFamily: Fonts.body.bold }}>{n.userName} </Text>
                          )}
                          {n.message}
                        </Text>

                        {!!n.previewText && (
                          <Text numberOfLines={2} style={{ fontSize: 13, color: theme.onSurfaceVariant, marginTop: 3 }}>
                            "{n.previewText}"
                          </Text>
                        )}

                        {n.type === "friend_request" && !n.isResponded && (
                          <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                            <Pressable
                              onPress={(e) => { e.stopPropagation?.(); handleAcceptRequest(n); }}
                              style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: theme.primary }}
                            >
                              <Text style={{ fontSize: 12, fontFamily: Fonts.body.bold, color: "#FFFFFF" }}>Accept</Text>
                            </Pressable>
                            <Pressable
                              onPress={(e) => { e.stopPropagation?.(); handleDeclineRequest(n); }}
                              style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: theme.outlineVariant }}
                            >
                              <Text style={{ fontSize: 12, fontFamily: Fonts.body.bold, color: theme.onSurface }}>Decline</Text>
                            </Pressable>
                          </View>
                        )}

                        {n.type === "message" && (
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8 }}>
                            <Icon name="CornerUpLeft" size={13} color={theme.primary} />
                            <Text style={{ fontSize: 12, fontFamily: Fonts.body.bold, color: theme.primary }}>Reply</Text>
                          </View>
                        )}

                        {!!n.link && n.type !== "message" && n.type !== "friend_request" && (
                          <Text style={{ fontSize: 12, fontFamily: Fonts.body.bold, color: theme.tertiary, marginTop: 8 }}>
                            {n.linkLabel || "View Details"}
                          </Text>
                        )}
                      </View>

                      <Text style={{ fontSize: 11, color: theme.onSurfaceVariant }}>{relativeTime(n.timestamp)}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Notifications;
