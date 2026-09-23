import { Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { Fonts } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";

// Mirrors web pages/notifications/components/EmptyNotifications.jsx.
const MESSAGES = {
  all: {
    icon: "Bell",
    title: "No notifications yet",
    description: "When someone follows you, sends a friend request, or interacts with your posts, you'll see it here.",
  },
  invites: {
    icon: "UserPlus2",
    title: "No invites",
    description: "You don't have any pending friend or trip invites at the moment.",
  },
  message: {
    icon: "MessageCircle",
    title: "No message notifications",
    description: "Message notifications will appear here when you receive new messages.",
  },
  alerts: {
    icon: "BellRing",
    title: "No alerts yet",
    description: "Follows, likes, comments, and other activity will show up here.",
  },
};

const EmptyNotifications = ({ filterType }) => {
  const { theme } = useDarkMode();
  const { icon, title, description } = MESSAGES[filterType] || MESSAGES.all;

  return (
    <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 64, paddingHorizontal: 16 }}>
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 999,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
          backgroundColor: theme.surfaceContainerLow,
        }}
      >
        <Icon name={icon} size={34} color={theme.onSurfaceVariant} />
      </View>
      <Text
        style={{
          fontFamily: Fonts.display.semibold,
          fontSize: 19,
          color: theme.onSurface,
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        {title}
      </Text>
      <Text style={{ fontSize: 14, color: theme.onSurfaceVariant, textAlign: "center" }}>{description}</Text>
    </View>
  );
};

export default EmptyNotifications;
