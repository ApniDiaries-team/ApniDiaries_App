import { Pressable, Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { Fonts } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";

// Mirrors web pages/my-trips/components/EmptyState.jsx.
const FEATURES = [
  { label: "Plan", desc: "Organize your travel itinerary with detailed planning", icon: "MapPin" },
  { label: "Collaborate", desc: "Share trips with friends and plan together", icon: "Users" },
  { label: "Track", desc: "Monitor your trips from planning to completion", icon: "Calendar" },
];

const EmptyState = ({ onCreateTrip, hasFilters, message }) => {
  const { theme } = useDarkMode();

  if (hasFilters) {
    return (
      <View style={{ alignItems: "center", paddingVertical: 72, paddingHorizontal: 20 }}>
        <View
          style={{
            padding: 18,
            borderRadius: 999,
            marginBottom: 20,
            backgroundColor: theme.surfaceContainerLow,
          }}
        >
          <Icon name="SearchX" size={40} color={theme.onSurfaceVariant} />
        </View>
        <Text
          style={{
            fontFamily: Fonts.display.bold,
            fontSize: 22,
            color: theme.onSurface,
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          No Trips Found
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: theme.onSurfaceVariant,
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          We couldn't find any trips matching your filters. Try adjusting your search criteria.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ alignItems: "center", paddingVertical: 56, paddingHorizontal: 20 }}>
      <View style={{ marginBottom: 20 }}>
        <View style={{ padding: 22, borderRadius: 999, backgroundColor: theme.primaryFixed }}>
          <Icon name="Luggage" size={44} color={theme.primary} />
        </View>
        {onCreateTrip && (
          <View
            style={{
              position: "absolute",
              bottom: -4,
              right: -4,
              width: 30,
              height: 30,
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.primary,
            }}
          >
            <Icon name="Plus" size={16} color="#FFFFFF" />
          </View>
        )}
      </View>

      <Text
        style={{
          fontFamily: Fonts.display.bold,
          fontSize: 24,
          color: theme.onSurface,
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        {message ? "Nothing Here Yet" : "Start Your Journey"}
      </Text>

      <Text
        style={{
          fontSize: 14,
          color: theme.onSurfaceVariant,
          textAlign: "center",
          marginBottom: 28,
        }}
      >
        {message ||
          "You haven't created any trips yet. Start planning your next adventure and organize all your travel details in one place."}
      </Text>

      {onCreateTrip && (
        <Pressable
          onPress={onCreateTrip}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingHorizontal: 24,
            paddingVertical: 14,
            borderRadius: 12,
            marginBottom: 32,
            backgroundColor: theme.primary,
          }}
        >
          <Icon name="Plus" size={16} color="#FFFFFF" />
          <Text style={{ color: "#FFFFFF", fontFamily: Fonts.body.semibold, fontSize: 15 }}>
            Create New Trip
          </Text>
        </Pressable>
      )}

      {!message && (
        <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
          {FEATURES.map((item) => (
            <View key={item.label} style={{ flex: 1, alignItems: "center", paddingHorizontal: 4 }}>
              <View
                style={{
                  padding: 12,
                  borderRadius: 16,
                  marginBottom: 8,
                  backgroundColor: theme.surfaceContainerLow,
                }}
              >
                <Icon name={item.icon} size={18} color={theme.primary} />
              </View>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: Fonts.body.semibold,
                  color: theme.onSurface,
                  textAlign: "center",
                }}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default EmptyState;
