import { useRouter } from "expo-router";
import { useContext } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "../../../components/AppIcon";
import { Fonts, Palette } from "../../../constants/theme";
import { AppContext } from "../../../context/AppContext";
import { useDarkMode } from "../../../context/DarkModeContext";
import { getProfilePhotoUrl } from "../../../helper/DefaultImageUrl";
import { formatLastActive } from "../../../helper/LastActiveFormatter";

const ChatHeader = ({ contact, onMoreOptions, onAudioCall, onVideoCall }) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDarkMode } = useDarkMode();

  const handleBackPress = () => router.back();

  const handleProfilePress = () => {
    router.push({
      pathname: "/other-user-profile",
      params: { userId: contact?.id },
    });
  };

  const palette = isDarkMode ? Palette.dark : Palette.light;
  const surface = isDarkMode ? palette.surfaceContainer : palette.surfaceLowest;
  const iconColor = palette.text;
  const nameColor = palette.text;
  const statusColor = contact?.isOnline
    ? "#22c55e"
    : isDarkMode
      ? "#A0AEC0"
      : "#594137";

  return (
    <View
      style={{
        backgroundColor: surface,
        borderBottomWidth: 1,
        borderBottomColor: palette.outlineVariant,
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
              style={{ backgroundColor: isDarkMode ? "#2D3748" : "#FFF1EC" }}
            />
            {contact?.isOnline && (
              <View
                className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2"
                style={{ borderColor: surface }}
              />
            )}
          </View>

          <View className="ml-3 flex-1 justify-center">
            <Text
              numberOfLines={1}
              className="text-[17px] "
              style={{
                color: nameColor,
                fontFamily: Fonts.playfair.semibold,
              }}
            >
              {contact?.name || "User"}
            </Text>
            <Text
              numberOfLines={1}
              className="text-[13px]"
              style={{ color: statusColor, fontFamily: Fonts.inter.regular, fontSize: 12 }}
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
          <Pressable onPress={onAudioCall} style={{ width: 38, height: 38, borderRadius: 14, alignItems: "center", justifyContent: "center", marginLeft: 2, backgroundColor: isDarkMode ? "#1A1F29" : "#FFF1EC" }}>
            <Icon name="Phone" size={22} color={iconColor} strokeWidth={1.5} />
          </Pressable>
          <Pressable onPress={onVideoCall} style={{ width: 38, height: 38, borderRadius: 14, alignItems: "center", justifyContent: "center", marginLeft: 2, backgroundColor: isDarkMode ? "#1A1F29" : "#FFF1EC" }}>
            <Icon name="Video" size={22} color={iconColor} strokeWidth={1.5} />
          </Pressable>
          <Pressable onPress={onMoreOptions} style={{ width: 38, height: 38, borderRadius: 14, alignItems: "center", justifyContent: "center", marginLeft: 2, backgroundColor: isDarkMode ? "#1A1F29" : "#FFF1EC" }}>
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
