import { useRouter } from "expo-router";
import { useContext } from "react";
import { Image, Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "../../../components/AppIcon";
import { AppContext } from "../../../context/AppContext";
import { useDarkMode } from "../../../context/DarkModeContext";
import { getProfilePhotoUrl } from "../../../helper/DefaultImageUrl";
import { formatLastActive } from "../../../helper/LastActiveFormatter";

const ChatHeader = ({ contact, onMoreOptions, onAudioCall, onVideoCall }) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const { user } = useContext(AppContext);
  const myId = user?.id;

  const handleBackPress = () => router.back();

  const handleProfilePress = () => {
    router.push({
      pathname: "/other-user-profile",
      params: { userId: contact?.id },
    });
  };

  const iconColor = isDarkMode ? "#FFFFFF" : "#111827";
  const nameColor = isDarkMode ? "#FFFFFF" : "#001f3f";
  const statusColor = contact?.isOnline
    ? "#22c55e"
    : isDarkMode
      ? "#A0AEC0"
      : "#6b7280";

  return (
    <View
      className={`border-b ${isDarkMode ? "bg-[#1A1F29] border-[#2D3748]" : "bg-[#F7FAFC] border-black/10"}`}
      style={{
        paddingTop: insets.top - 10,
        height: 60 + insets.top,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      }}
    >
      <View className="flex-row items-center px-4 py-2 w-full">
        {/* Back Button */}
        <Pressable onPress={handleBackPress} className="p-2 -ml-2">
          <Icon name="ArrowLeft" size={24} color={iconColor} />
        </Pressable>

        {/* Profile Info */}
        <Pressable
          onPress={handleProfilePress}
          className="flex-row items-center flex-1 ml-1"
        >
          <View className="relative">
            <Image
              source={{ uri: getProfilePhotoUrl(contact?.avatar) }}
              className="w-11 h-11 rounded-full"
              style={{ backgroundColor: isDarkMode ? "#2D3748" : "#E2E8F0" }}
            />
            {contact?.isOnline && (
              <View
                className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2"
                style={{ borderColor: isDarkMode ? "#1A1F29" : "#F7FAFC" }}
              />
            )}
          </View>

          <View className="ml-3 flex-1 justify-center">
            <Text
              numberOfLines={1}
              className="text-[17px] "
              style={{
                color: nameColor,
                fontFamily:
                  Platform.OS === "ios"
                    ? "Georgia"
                    : "PlayfairDisplay_600SemiBold",
              }}
            >
              {contact?.name || "User"}
            </Text>
            <Text
              numberOfLines={1}
              className="text-[13px]"
              style={{ color: statusColor }}
            >
              {contact?.isOnline
                ? "Online"
                : contact?.lastActive
                  ? `Last seen ${formatLastActive(contact?.lastActive)}`
                  : "Offline"}
            </Text>
          </View>
        </Pressable>

        {/* Action Buttons */}
        <View className="flex-row items-center">
          <Pressable onPress={onAudioCall} className="p-2">
            <Icon name="Phone" size={22} color={iconColor} strokeWidth={1.5} />
          </Pressable>
          <Pressable onPress={onVideoCall} className="p-2">
            <Icon name="Video" size={22} color={iconColor} strokeWidth={1.5} />
          </Pressable>
          <Pressable onPress={onMoreOptions} className="p-2">
            <Icon
              name="MoreVertical"
              size={22}
              color={iconColor}
              strokeWidth={1.5}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default ChatHeader;
