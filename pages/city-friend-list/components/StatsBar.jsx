import { Pressable, Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { useDarkMode } from "../../../context/DarkModeContext";
import { Fonts } from "../../../constants/theme";

const StatsBar = ({ stats, onStatClick }) => {
  const { isDarkMode } = useDarkMode();

  const colors = {
    bgCard: isDarkMode ? "#1E242F" : "#EDF2F7",
    bgSecondary: isDarkMode ? "#1A1F29" : "#F7FAFC",
    bgPrimary: isDarkMode ? "#0B0E14" : "#FFFFFF",
    textPrimary: isDarkMode ? "#FFFFFF" : "#1A202C",
    textSecondary: isDarkMode ? "#A0AEC0" : "#4A5568",
    border: isDarkMode ? "#2D3748" : "#E2E8F0",
    success: "#68D391",
    warning: "#F6AD55",
    error: "#EF4444",
  };

  const getFriendCount = () => {
    if (!stats) return 0;
    if (stats.friends !== undefined) return stats.friends;
    if (stats.friendsCount !== undefined) return stats.friendsCount;
    if (stats.totalFriends !== undefined) return stats.totalFriends;
    return 0;
  };

  const statItems = [
    {
      type: "friends",
      icon: "UserCheck",
      label: "Friends",
      value: getFriendCount(),
      color: colors.success,
      bgColor: "rgba(104,211,145,0.1)", // ← add this
      iconColor: colors.success,
    },
    {
      type: "followers",
      icon: "UserPlus",
      label: "Followers",
      value: stats?.followers || 0,
      color: colors.textSecondary,
      bgColor: colors.bgSecondary, // ← add this
      iconColor: colors.textSecondary,
    },
    {
      type: "calls",
      icon: "Phone",
      label: "Missed Calls",
      value: stats?.missedCalls || 0,
      color: stats?.missedCalls > 0 ? colors.error : colors.textSecondary,
      bgColor:
        stats?.missedCalls > 0 ? "rgba(239,68,68,0.1)" : colors.bgSecondary, // ← add this
      iconColor: stats?.missedCalls > 0 ? colors.error : colors.textSecondary,
    },
    {
      type: "upcomingTrips",
      icon: "Calendar",
      label: "Upcoming Trips",
      value: stats?.upcomingTrips || 0,
      color: colors.warning,
      bgColor: "rgba(246,173,85,0.1)", // ← add this
      iconColor: colors.warning,
    },
  ];

  return (
    <View
      style={{
        backgroundColor: colors.bgCard,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {statItems?.map((item, index) => (
          <Pressable
            key={item.type}
            onPress={() => onStatClick?.(item.type)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              padding: 12,
              borderRadius: 10,
              backgroundColor: colors.bgSecondary,
              borderWidth: 1,
              borderColor: colors.border,
              flex: 1,
              minWidth: "45%",
            }}
          >
            <View
              style={{
                padding: 8,
                borderRadius: 8,
                backgroundColor: item.bgColor,
                borderWidth: 1,
                borderColor: `${item.iconColor}20`,
              }}
            >
              <Icon name={item.icon} size={20} color={item.iconColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                {item.label}
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: Fonts.playfair.bold,
                  color: item.color,
                }}
              >
                {item.value}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default StatsBar;
