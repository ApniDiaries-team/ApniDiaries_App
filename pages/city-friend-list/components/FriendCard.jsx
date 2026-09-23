import { useEffect, useRef } from "react";
import { Animated, Image, Pressable, Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { Fonts } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";
import { getProfilePhotoUrl } from "../../../helper/DefaultImageUrl";
import { formatLastActive } from "../../../helper/LastActiveFormatter";

const FriendCard = ({ friend, onMessage, onQuickActions, unreadCount = 0 }) => {
  const { isDarkMode } = useDarkMode();
  const hasUnread = unreadCount > 0;

  // ── Bounce animation for unread badge — mirrors web animate-bounce-once ──
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (hasUnread) {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.3,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0.9,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [hasUnread]);

  const colors = {
    bgCard: isDarkMode ? "#1E242F" : "#FFFFFF",
    bgSecondary: isDarkMode ? "#1A1F29" : "#F7FAFC",
    textPrimary: isDarkMode ? "#FFFFFF" : "#111827",
    textSecondary: isDarkMode ? "#A0AEC0" : "#6b7280",
    border: isDarkMode ? "#2D3748" : "rgba(0,0,0,0.08)",
    accent: "#FF9933",
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "#22c55e";
      case "away":
        return "#eab308";
      default:
        return "#6b7280";
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case "online":
        return isDarkMode ? "#4ade80" : "#16a34a";
      case "away":
        return isDarkMode ? "#facc15" : "#ca8a04";
      default:
        return colors.textSecondary;
    }
  };

  return (
    <Pressable
      onPress={() => onMessage(friend)}
      style={{
        position: "relative",
        borderRadius: 12,
        borderWidth: hasUnread ? 2 : 1,
        borderColor: hasUnread ? "#22c55e" : colors.border,
        backgroundColor: colors.bgCard,
        overflow: "hidden",
        opacity: 1,
        // mirrors web shadow-[0_0_0_4px_rgba(34,197,94,0.3)] when hasUnread
        shadowColor: hasUnread ? "#22c55e" : "#000",
        shadowOffset: { width: 0, height: hasUnread ? 0 : 1 },
        shadowOpacity: hasUnread ? 0.3 : 0.05,
        shadowRadius: hasUnread ? 8 : 2,
        elevation: hasUnread ? 4 : 1,
      }}
    >
      {/* ── Top accent bar — mirrors web's h-0.5 accent bar ── */}
      {hasUnread && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: colors.accent,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
        />
      )}

      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          {/* ── Avatar with status dot ── */}
          <View style={{ flexShrink: 0 }}>
            <View
              style={{
                borderRadius: 999,
                // mirrors web ring-2 ring-accent ring-offset-1 when hasUnread
                borderWidth: hasUnread ? 2 : 0,
                borderColor: hasUnread ? colors.accent : "transparent",
                padding: hasUnread ? 2 : 0,
              }}
            >
              <Image
                source={{ uri: getProfilePhotoUrl(friend?.avatar) }}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  borderWidth: 2,
                  borderColor: colors.border,
                }}
              />
            </View>
            <View
              style={{
                position: "absolute",
                bottom: hasUnread ? 4 : 0,
                right: hasUnread ? 4 : 0,
                width: 14,
                height: 14,
                borderRadius: 7,
                borderWidth: 2,
                borderColor: colors.bgCard,
                backgroundColor: getStatusColor(friend?.status),
              }}
            />
          </View>

          {/* ── Info ── */}
          <View style={{ flex: 1, minWidth: 0 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <View style={{ flex: 1, minWidth: 0 }}>
                {/* ── Name + unread badge row ── */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 16,
                      // mirrors web font-bold when hasUnread, font-semibold otherwise
                      fontFamily: hasUnread
                        ? Fonts.playfair.bold
                        : Fonts.playfair.semibold,
                      color: colors.textPrimary,
                      flex: 1,
                      textTransform: "capitalize",
                    }}
                  >
                    {friend?.name}
                  </Text>

                  {/* ── Unread count badge — mirrors web green badge ── */}
                  {hasUnread && (
                    <Animated.View
                      style={{
                        transform: [{ scale: bounceAnim }],
                        minWidth: 20,
                        height: 20,
                        paddingHorizontal: 6,
                        borderRadius: 10,
                        backgroundColor: "#16a34a",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "#FFFFFF",
                          fontSize: 10,
                          fontFamily: "Inter_700Bold",
                        }}
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </Text>
                    </Animated.View>
                  )}
                </View>

                {/* ── City ── */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    marginTop: 4,
                  }}
                >
                  <Icon name="MapPin" size={14} color={colors.textSecondary} />
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 13,
                      fontFamily: "Inter_400Regular",
                      color: colors.textSecondary,
                      flex: 1,
                    }}
                  >
                    {friend?.currentCity}
                  </Text>
                </View>
              </View>

              {/* ── More options button ── */}
              <Pressable
                onPress={(e) => {
                  e.stopPropagation?.();
                  onQuickActions(friend);
                }}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: "transparent",
                }}
              >
                <Icon
                  name="MoreVertical"
                  size={20}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>

            {/* ── Status + mutual connections ── */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginTop: 8,
              }}
            >
              {friend?.onlineStatus && (
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_400Regular",
                    color: getStatusTextColor(friend?.status),
                  }}
                >
                  {friend?.status === "online"
                    ? "Online"
                    : `Last seen ${formatLastActive(friend?.lastActive)}`}
                </Text>
              )}
              {friend?.mutualConnections > 0 && (
                <>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.textSecondary,
                    }}
                  >
                    •
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Icon name="Users" size={12} color={colors.textSecondary} />
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Inter_400Regular",
                        color: colors.textSecondary,
                      }}
                    >
                      {friend?.mutualConnections} mutual
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* ── Badges — mirrors web, NOTE: isFriend badge removed to match web ── */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 8,
              }}
            >
              {friend?.availableForMeetup && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 6,
                    backgroundColor: "rgba(72,187,120,0.1)",
                    borderWidth: 1,
                    borderColor: "rgba(72,187,120,0.2)",
                  }}
                >
                  <Icon name="Calendar" size={12} color="#48BB78" />
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_500Medium",
                      color: "#48BB78",
                    }}
                  >
                    Available
                  </Text>
                </View>
              )}

              {friend?.isFavorite && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 6,
                    backgroundColor: "rgba(237,100,166,0.1)",
                    borderWidth: 1,
                    borderColor: "rgba(237,100,166,0.2)",
                  }}
                >
                  <Icon name="Heart" size={12} color="rgb(237,100,166)" />
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_500Medium",
                      color: "rgb(237,100,166)",
                    }}
                  >
                    Favorite
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default FriendCard;
