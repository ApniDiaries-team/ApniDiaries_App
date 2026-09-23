import { Pressable, ScrollView, Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { Fonts } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";

// Mobile-width rendering of web's MessagesSidebarNav.jsx — the vertical
// sidebar becomes a horizontal scrollable pill row on a phone.
const FILTERS = [
  { id: "all", label: "All Messages", icon: "MessagesSquare" },
  { id: "unread", label: "Unread", icon: "MailOpen" },
  { id: "mentions", label: "Mentions", icon: "AtSign" },
  { id: "groups", label: "Trip Groups", icon: "Users2" },
];

const MessagesFilterBar = ({ activeFilter, onFilterChange, counts }) => {
  const { theme } = useDarkMode();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
      {FILTERS.map((f) => {
        const isActive = activeFilter === f.id;
        const count = counts?.[f.id] || 0;
        return (
          <Pressable
            key={f.id}
            onPress={() => onFilterChange(f.id)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 14,
              paddingVertical: 9,
              borderRadius: 999,
              backgroundColor: isActive ? theme.surfaceContainerLow : "transparent",
              borderWidth: 1,
              borderColor: isActive ? theme.primary : theme.outlineVariant,
            }}
          >
            <Icon name={f.icon} size={14} color={isActive ? theme.primary : theme.onSurfaceVariant} />
            <Text
              style={{
                fontSize: 13,
                fontFamily: Fonts.body.semibold,
                color: isActive ? theme.primary : theme.onSurface,
              }}
            >
              {f.label}
            </Text>
            {count > 0 && (
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
                  {count > 99 ? "99+" : count}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

export default MessagesFilterBar;
