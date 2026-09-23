import { Pressable, Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { Fonts } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";

// Mirrors web pages/notifications/components/NotificationFilter.jsx.
const FILTERS = [
  { id: "all", label: "All", icon: "Bell" },
  { id: "message", label: "Messages", icon: "MessageCircle" },
  { id: "invites", label: "Invites", icon: "UserPlus2" },
  { id: "alerts", label: "Alerts", icon: "BellRing" },
];

const NotificationFilter = ({ activeFilter, onFilterChange, counts }) => {
  const { theme } = useDarkMode();

  return (
    <View style={{ gap: 4 }}>
      {FILTERS.map((filter) => {
        const isActive = activeFilter === filter.id;
        const count = counts?.[filter.id] || 0;
        return (
          <Pressable
            key={filter.id}
            onPress={() => onFilterChange(filter.id)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingHorizontal: 14,
              paddingVertical: 11,
              borderRadius: 12,
              backgroundColor: isActive ? theme.surfaceContainerLow : "transparent",
            }}
          >
            <Icon name={filter.icon} size={18} color={isActive ? theme.primary : theme.onSurfaceVariant} />
            <Text
              style={{
                flex: 1,
                fontSize: 14,
                fontFamily: Fonts.body.semibold,
                color: isActive ? theme.onSurface : theme.onSurfaceVariant,
              }}
            >
              {filter.label}
            </Text>
            {count > 0 && (
              <View
                style={{
                  minWidth: 22,
                  height: 22,
                  paddingHorizontal: 6,
                  borderRadius: 999,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: theme.primary,
                }}
              >
                <Text style={{ fontSize: 11, fontFamily: Fonts.body.bold, color: "#FFFFFF" }}>
                  {count > 99 ? "99+" : count}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
};

export default NotificationFilter;
