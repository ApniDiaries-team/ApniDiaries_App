import { useEffect, useRef } from "react";
import { Animated, Image, Pressable, Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { Fonts, Palette } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";
import { getProfilePhotoUrl } from "../../../helper/DefaultImageUrl";
import { formatLastActive } from "../../../helper/LastActiveFormatter";

const FriendCard = ({ friend, onMessage, onQuickActions, unreadCount = 0, showDivider = false }) => {
  const { isDarkMode } = useDarkMode();
  const badgeScale = useRef(new Animated.Value(1)).current;
  const textPrimary = isDarkMode ? Palette.dark.text : Palette.light.text;
  const textMuted = isDarkMode ? Palette.dark.textVariant : Palette.light.textVariant;
  const primary = isDarkMode ? Palette.dark.primary : Palette.light.primary;
  const border = isDarkMode ? Palette.dark.outlineVariant : Palette.light.outlineVariant;
  const hasUnread = unreadCount > 0;

  useEffect(() => {
    if (!hasUnread) return;
    Animated.sequence([
      Animated.timing(badgeScale, { toValue: 1.16, duration: 120, useNativeDriver: true }),
      Animated.spring(badgeScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  }, [hasUnread, unreadCount, badgeScale]);

  const statusColor = friend?.status === "online" ? "#22C55E" : friend?.status === "away" ? "#EAB308" : "#9CA3AF";
  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 20, borderBottomWidth: showDivider ? 1 : 0, borderBottomColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(225,191,178,0.6)" }}>
      <Pressable onPress={() => onMessage(friend)} style={{ flexDirection: "row", alignItems: "center", gap: 16, flex: 1, minWidth: 0 }}>
        <View style={{ width: 56, height: 56, borderRadius: 28, flexShrink: 0 }}>
          <Image source={{ uri: getProfilePhotoUrl(friend?.avatar) }} style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: isDarkMode ? "#2D3748" : "#FFF1EC" }} />
          {friend?.onlineStatus && <View style={{ position: "absolute", right: 0, bottom: 0, width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: isDarkMode ? "#0B0E14" : "#FFF8F6", backgroundColor: statusColor }} />}
        </View>

        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: Fonts.playfair.semibold, fontSize: 18, color: textPrimary, textTransform: "capitalize" }}>{friend?.name}</Text>
            {hasUnread && <Animated.View style={{ transform: [{ scale: badgeScale }], minWidth: 18, height: 18, paddingHorizontal: 4, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: primary }}><Text style={{ fontSize: 10, fontFamily: Fonts.inter.bold, color: "#FFFFFF" }}>{unreadCount > 99 ? "99+" : unreadCount}</Text></Animated.View>}
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", marginTop: 4 }}>
            {friend?.currentCity ? <><Icon name="MapPin" size={13} color={textMuted} /><Text numberOfLines={1} style={{ maxWidth: "78%", marginLeft: 4, fontFamily: Fonts.inter.regular, fontSize: 14, color: textMuted }}>{friend.currentCity}</Text></> : null}
            {friend?.onlineStatus && <Text numberOfLines={1} style={{ marginLeft: friend?.currentCity ? 5 : 0, fontFamily: Fonts.inter.regular, fontSize: 14, color: textMuted }}>· {friend?.status === "online" ? "Online" : `Last seen ${formatLastActive(friend?.lastActive)}`}</Text>}
          </View>

          {(friend?.availableForMeetup || friend?.isFavorite || friend?.mutualConnections > 0) && (
            <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", columnGap: 12, rowGap: 4, marginTop: 6 }}>
              {friend?.mutualConnections > 0 && <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><Icon name="Users" size={11} color={textMuted} /><Text style={{ fontFamily: Fonts.inter.regular, fontSize: 11, color: textMuted }}>{friend.mutualConnections} mutual</Text></View>}
              {friend?.availableForMeetup && <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><Icon name="Calendar" size={11} color={isDarkMode ? "#68D391" : "#16803C"} /><Text style={{ fontFamily: Fonts.inter.medium, fontSize: 11, color: isDarkMode ? "#68D391" : "#16803C" }}>Available</Text></View>}
              {friend?.isFavorite && <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><Icon name="Heart" size={11} color={primary} fill={primary} /><Text style={{ fontFamily: Fonts.inter.medium, fontSize: 11, color: primary }}>Favorite</Text></View>}
            </View>
          )}
        </View>
      </Pressable>

      <Pressable onPress={(event) => { event.stopPropagation?.(); onQuickActions(friend); }} accessibilityRole="button" accessibilityLabel="More options" hitSlop={8} style={{ width: 36, height: 40, alignItems: "center", justifyContent: "center", marginLeft: 6 }}>
        <Icon name="MoreVertical" size={18} color={textMuted} />
      </Pressable>
    </View>
  );
};

export default FriendCard;
