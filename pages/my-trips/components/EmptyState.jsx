import { Pressable, Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { useDarkMode } from "../../../context/DarkModeContext";
import { Fonts } from "../../../constants/theme";

const EmptyState = ({ onCreateTrip, hasFilters }) => {
  const { isDarkMode } = useDarkMode();

  // ── hasFilters state — matches web exactly ─────────────────
  if (hasFilters) {
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 80, // matches web: py-8 md:py-20 lg:py-24
          paddingHorizontal: 16,
        }}
      >
        {/* matches web: <div className='p-4 rounded-full bg-[var(--color-bg-secondary)] mb-6'> */}
        <View
          style={{
            padding: 16,
            borderRadius: 999,
            backgroundColor: isDarkMode ? "#374151" : "#f3f4f6",
            marginBottom: 24,
          }}
        >
          <Icon
            name="SearchX"
            size={48}
            color={isDarkMode ? "#9ca3af" : "#6b7280"}
          />
        </View>

        {/* matches web: <h3 className='text-xl md:text-2xl font-semibold text-[var(--color-text-primary)]'> */}
        <Text
          style={{
            fontSize: 22,
            fontFamily: Fonts.playfair.bold,
            color: isDarkMode ? "#f9fafb" : "#111827",
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          No Trips Found
        </Text>

        {/* matches web full description text */}
        <Text
          style={{
            fontSize: 14,
            color: isDarkMode ? "#9ca3af" : "#6b7280",
            textAlign: "center",
            maxWidth: 400,
            marginBottom: 24,
            lineHeight: 20,
          }}
        >
          We couldn't find any trips matching your filters. Try adjusting your
          search criteria or create a new trip.
        </Text>

        {/* matches web: <Button variant='outline' iconName='RotateCcw'> Clear Filters </Button> */}
        <Pressable
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: isDarkMode ? "#374151" : "#e5e7eb",
            backgroundColor: "transparent",
          }}
        >
          <Icon
            name="RotateCcw"
            size={16}
            color={isDarkMode ? "#f9fafb" : "#111827"}
          />
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: isDarkMode ? "#f9fafb" : "#111827",
            }}
          >
            Clear Filters
          </Text>
        </Pressable>
      </View>
    );
  }

  // ── No trips state — matches web exactly ───────────────────
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 80, // matches web: py-8 md:py-20 lg:py-24
        paddingHorizontal: 16,
      }}
    >
      {/* matches web: <div className='relative mb-6 md:mb-8'> */}
      <View style={{ position: "relative", marginBottom: 28 }}>
        {/* matches web: <div className='p-4 md:p-6 rounded-full bg-blue-500/10'> */}
        <View
          style={{
            padding: 20,
            borderRadius: 999,
            backgroundColor: "rgba(59,130,246,0.1)",
          }}
        >
          {/* matches web: <Icon name='Luggage' size={48}> */}
          <Icon name="Luggage" size={48} color="#3b82f6" />
        </View>

        {/* matches web: absolute -bottom-2 -right-2 p-1.5 rounded-full bg-purple-500 */}
        <View
          style={{
            position: "absolute",
            bottom: -8,
            right: -8,
            padding: 6,
            borderRadius: 999,
            backgroundColor: "#a855f7",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          {/* matches web: <Icon name='Plus' size={16}> */}
          <Icon name="Plus" size={16} color="#fff" />
        </View>
      </View>

      {/* matches web: <h3 className='text-xl md:text-3xl font-semibold text-[var(--color-text-primary)]'> */}
      <Text
        style={{
          fontSize: 26,
          fontFamily: Fonts.playfair.bold,
          color: isDarkMode ? "#f9fafb" : "#111827",
          marginBottom: 10,
          textAlign: "center",
        }}
      >
        Start Your Journey
      </Text>

      {/* matches web full description text exactly */}
      <Text
        style={{
          fontSize: 14,
          color: isDarkMode ? "#9ca3af" : "#6b7280",
          textAlign: "center",
          maxWidth: 400,
          marginBottom: 32,
          lineHeight: 20,
        }}
      >
        You haven't created any trips yet. Start planning your next adventure
        and organize all your travel details in one place.
      </Text>

      {/* Feature cards grid — matches web: grid grid-cols-3 gap-2 md:gap-6 mt-4 md:mt-12 max-w-3xl */}
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          marginTop: 16,
          width: "100%",
        }}
      >
        {/* Plan */}
        <View style={{ flex: 1, alignItems: "center", padding: 8 }}>
          {/* matches web: <div className='p-2 md:p-3 rounded-lg bg-[var(--color-bg-secondary)] inline-flex mb-1 md:mb-3'> */}
          <View
            style={{
              padding: 8,
              borderRadius: 8,
              backgroundColor: isDarkMode ? "#374151" : "#f3f4f6",
              marginBottom: 6,
            }}
          >
            <Icon name="MapPin" size={20} color="#3b82f6" />
          </View>
          {/* matches web: <h4 className='text-xs md:text-base font-medium text-[var(--color-text-primary)]'> */}
          <Text
            style={{
              fontSize: 14,
              fontFamily: Fonts.playfair.semibold,
              color: isDarkMode ? "#f9fafb" : "#111827",
              textAlign: "center",
              marginBottom: 4,
            }}
          >
            Plan
          </Text>
          {/* matches web: <p className='text-[10px] md:text-sm text-[var(--color-text-secondary)]'> */}
          <Text
            style={{
              fontSize: 10,
              color: isDarkMode ? "#9ca3af" : "#6b7280",
              textAlign: "center",
              lineHeight: 14,
            }}
          >
            Organize your travel itinerary with detailed planning
          </Text>
        </View>

        {/* Collaborate */}
        <View style={{ flex: 1, alignItems: "center", padding: 8 }}>
          <View
            style={{
              padding: 8,
              borderRadius: 8,
              backgroundColor: isDarkMode ? "#374151" : "#f3f4f6",
              marginBottom: 6,
            }}
          >
            <Icon name="Users" size={20} color="#3b82f6" />
          </View>
          <Text
            style={{
              fontSize: 14,
              fontFamily: Fonts.playfair.semibold,
              color: isDarkMode ? "#f9fafb" : "#111827",
              textAlign: "center",
              marginBottom: 4,
            }}
          >
            Collaborate
          </Text>
          <Text
            style={{
              fontSize: 10,
              color: isDarkMode ? "#9ca3af" : "#6b7280",
              textAlign: "center",
              lineHeight: 14,
            }}
          >
            Share trips with friends and plan together
          </Text>
        </View>

        {/* Track */}
        <View style={{ flex: 1, alignItems: "center", padding: 8 }}>
          <View
            style={{
              padding: 8,
              borderRadius: 8,
              backgroundColor: isDarkMode ? "#374151" : "#f3f4f6",
              marginBottom: 6,
            }}
          >
            <Icon name="Calendar" size={20} color="#3b82f6" />
          </View>
          <Text
            style={{
              fontSize: 14,
              fontFamily: Fonts.playfair.semibold,
              color: isDarkMode ? "#f9fafb" : "#111827",
              textAlign: "center",
              marginBottom: 4,
            }}
          >
            Track
          </Text>
          <Text
            style={{
              fontSize: 10,
              color: isDarkMode ? "#9ca3af" : "#6b7280",
              textAlign: "center",
              lineHeight: 14,
            }}
          >
            Monitor your trips from planning to completion
          </Text>
        </View>
      </View>
    </View>
  );
};

export default EmptyState;
