import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "../../../components/AppIcon";
import { Fonts } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";
import { getProfilePhotoUrl } from "../../../helper/DefaultImageUrl";
import { formatLastActive } from "../../../helper/LastActiveFormatter";

// Mirrors web pages/chat-interface/components/ChatHeader.jsx.
const ChatHeader = ({ contact, onMoreOptions, onAudioCall, onVideoCall }) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useDarkMode();

  const handleBackPress = () => router.back();
  const handleProfilePress = () => {
    router.push({ pathname: "/other-user-profile", params: { userId: contact?.id } });
  };

  const statusColor = contact?.isOnline ? "#22c55e" : theme.onSurfaceVariant;

  return (
    <View
      style={{
        paddingTop: insets.top,
        borderBottomWidth: 1,
        borderBottomColor: theme.outlineVariant,
        backgroundColor: theme.surfaceContainerLowest,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10 }}>
        <Pressable onPress={handleBackPress} style={{ padding: 8 }} hitSlop={8}>
          <Icon name="ArrowLeft" size={20} color={theme.onSurface} />
        </Pressable>

        <Pressable
          onPress={handleProfilePress}
          style={{ flexDirection: "row", alignItems: "center", flex: 1, paddingHorizontal: 8, borderRadius: 12 }}
        >
          <View style={{ position: "relative" }}>
            <Image
              source={{ uri: getProfilePhotoUrl(contact?.avatar) }}
              style={{ width: 44, height: 44, borderRadius: 999, backgroundColor: theme.surfaceContainerLow }}
            />
            {contact?.isOnline && (
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
                  borderColor: theme.surfaceContainerLowest,
                }}
              />
            )}
          </View>

          <View style={{ marginLeft: 12, flex: 1, justifyContent: "center" }}>
            <Text
              numberOfLines={1}
              style={{ fontFamily: Fonts.display.semibold, fontSize: 16, color: theme.onSurface }}
            >
              {contact?.name || "User"}
            </Text>
            <Text numberOfLines={1} style={{ fontSize: 13, color: statusColor, marginTop: 1 }}>
              {contact?.isOnline
                ? "Online"
                : contact?.lastActive
                  ? `Last seen ${formatLastActive(contact?.lastActive)}`
                  : ""}
            </Text>
          </View>
        </Pressable>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable onPress={onAudioCall} style={{ padding: 8, borderRadius: 999 }}>
            <Icon name="Phone" size={19} color={theme.onSurface} />
          </Pressable>
          <Pressable onPress={onVideoCall} style={{ padding: 8, borderRadius: 999 }}>
            <Icon name="Video" size={19} color={theme.onSurface} />
          </Pressable>
          <Pressable onPress={onMoreOptions} style={{ padding: 8, borderRadius: 999 }}>
            <Icon name="MoreVertical" size={19} color={theme.onSurface} />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default ChatHeader;
