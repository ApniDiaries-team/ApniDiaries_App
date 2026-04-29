import { Pressable, Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { Fonts } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";

const EmptyState = ({ filterType, onResetFilters }) => {
  const { isDarkMode } = useDarkMode();

  const colors = {
    bgCard: isDarkMode ? "#1E242F" : "#FFFFFF",
    bgSecondary: isDarkMode ? "#1A1F29" : "#F7FAFC",
    textPrimary: isDarkMode ? "#FFFFFF" : "#111827",
    textSecondary: isDarkMode ? "#A0AEC0" : "#6b7280",
    border: isDarkMode ? "#2D3748" : "rgba(0,0,0,0.08)",
  };

  const getEmptyStateContent = () => {
    switch (filterType) {
      case "friends":
        return {
          icon: "UserCheck",
          title: "No friends in this city",
          description: "Start connecting with travelers to build your network",
          action: "Explore All Travelers",
        };
      case "followers":
        return {
          icon: "UserPlus",
          title: "No followers yet",
          description: "Share your travel stories to attract followers",
          action: "View All Travelers",
        };
      case "available":
        return {
          icon: "Calendar",
          title: "No travelers available",
          description: "Check back later or explore other cities",
          action: "Change City",
        };
      default:
        return {
          icon: "Users",
          title: "No travelers found",
          description: "Try adjusting your filters or explore other cities",
          action: "Reset Filters",
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <View
      style={{
        backgroundColor: colors.bgCard,
        borderRadius: 12,
        padding: 32,
        paddingVertical: 48,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      <View style={{ maxWidth: 448, width: "100%", alignItems: "center" }}>
        {/* ── Icon circle — mirrors web's w-16/w-20 rounded-full ── */}
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.bgSecondary,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Icon name={content?.icon} size={32} color={colors.textSecondary} />
        </View>

        {/* ── Title — mirrors web's text-lg/text-xl font-semibold ── */}
        <Text
          style={{
            fontSize: 20,
            fontFamily: Fonts.playfair.bold,
            color: colors.textPrimary,
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          {content?.title}
        </Text>

        {/* ── Description — mirrors web's text-sm/text-base ── */}
        <Text
          style={{
            fontSize: 14,
            fontFamily: "Inter_400Regular",
            color: colors.textSecondary,
            marginBottom: 24,
            textAlign: "center",
            lineHeight: 20,
          }}
        >
          {content?.description}
        </Text>

        {/* ── Button — mirrors web's !bg-[#F97316] shadow-lg ── */}
        <Pressable
          onPress={onResetFilters}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
            backgroundColor: "#F97316",
            shadowColor: "#F97316",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
            opacity: 1,
          }}
        >
          <Icon name="RefreshCw" size={16} color="#FFFFFF" />
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 14,
              fontFamily: "Inter_600SemiBold",
            }}
          >
            {content?.action}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default EmptyState;
