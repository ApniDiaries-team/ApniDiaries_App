import { Image, Pressable, Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { Fonts } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";
import { getProfilePhotoUrl } from "../../../helper/DefaultImageUrl";

// Mirrors web pages/messages/components/ChatListItem.jsx.
const relativeDay = (timestamp) => {
  if (!timestamp) return "";
  const d = new Date(timestamp);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday)
    return `${String(d.getHours() % 12 || 12).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} ${d.getHours() >= 12 ? "PM" : "AM"}`;
  if (isYesterday) return "Yesterday";
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays < 7) return d.toLocaleDateString("en-IN", { weekday: "short" });
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

// chat.lastMessage is the raw message row — ciphertext is plain text for
// group threads but genuinely encrypted for direct threads, so direct
// previews show a lock placeholder rather than decrypting every list item.
const getPreviewText = (chat, myId) => {
  const lm = chat.lastMessage;
  if (!lm) return "No messages yet";
  if (lm.media_type) {
    return lm.media_type === "video" ? "🎥 Video" : lm.media_type === "gif" ? "GIF" : "📷 Photo";
  }
  if (chat.threadType === "group") {
    const prefix = String(lm.sender_id) === String(myId) ? "You: " : "";
    const text = typeof lm.ciphertext === "string" ? lm.ciphertext : "Message";
    return `${prefix}${text}`;
  }
  return "🔒 Encrypted message";
};

const ChatListItem = ({ chat, isActive, onPress, unreadCount = 0, myId }) => {
  const { theme } = useDarkMode();
  const hasUnread = unreadCount > 0;
  const isGroup = chat.threadType === "group";
  const timestamp = chat.lastMessage?.created_at ?? chat.lastActive;

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderLeftWidth: 3,
        borderLeftColor: isActive ? theme.primary : "transparent",
        backgroundColor: isActive ? theme.surfaceContainerLow : "transparent",
      }}
    >
      <View style={{ position: "relative" }}>
        {isGroup ? (
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              overflow: "hidden",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.surfaceContainerHigh,
            }}
          >
            {chat.avatar ? (
              <Image source={{ uri: getProfilePhotoUrl(chat.avatar) }} style={{ width: "100%", height: "100%" }} />
            ) : (
              <Icon name="Users2" size={18} color={theme.onSurfaceVariant} />
            )}
          </View>
        ) : (
          <Image
            source={{ uri: getProfilePhotoUrl(chat.avatar) }}
            style={{ width: 44, height: 44, borderRadius: 999, backgroundColor: theme.surfaceContainerLow }}
          />
        )}
        {chat.isOnline && !isGroup && (
          <View
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 12,
              height: 12,
              borderRadius: 999,
              backgroundColor: "#22c55e",
              borderWidth: 2,
              borderColor: theme.surface,
            }}
          />
        )}
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              fontSize: 14,
              fontFamily: hasUnread ? Fonts.body.bold : Fonts.body.semibold,
              color: theme.onSurface,
            }}
          >
            {chat.name}
          </Text>
          <Text style={{ fontSize: 11, color: hasUnread ? theme.primary : theme.onSurfaceVariant, fontFamily: hasUnread ? Fonts.body.semibold : Fonts.body.regular }}>
            {relativeDay(timestamp)}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 2 }}>
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              fontSize: 12,
              color: hasUnread ? theme.onSurface : theme.onSurfaceVariant,
              fontFamily: hasUnread ? Fonts.body.medium : Fonts.body.regular,
            }}
          >
            {getPreviewText(chat, myId)}
          </Text>
          {hasUnread && (
            <View
              style={{
                minWidth: 18,
                height: 18,
                paddingHorizontal: 4,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.primary,
              }}
            >
              <Text style={{ fontSize: 10, fontFamily: Fonts.body.bold, color: "#FFFFFF" }}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export default ChatListItem;
