import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { Fonts } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";

const CityCard = ({ city }) => {
  const router = useRouter();
  const { isDarkMode } = useDarkMode();

  // matches web: group hover state → in RN use press/focus state
  const [showHoverDetails, setShowHoverDetails] = useState(false);
  const [viewPostsPressed, setViewPostsPressed] = useState(false);
  const [packagesPressed, setPackagesPressed] = useState(false);

  // matches web handlePlanTrip exactly
  const handlePlanTrip = () => {
    router.push({
      pathname: "/trips",
      params: { cityId: city?.id, cityName: city?.name },
    });
  };

  // matches web handleViewPosts exactly
  const handleViewPosts = () => {
    router.push({
      pathname: "/city-details",
      params: { id: city?.id },
    });
  };

  // matches web handleViewPackages exactly
  const handleViewPackages = () => {
    router.push({
      pathname: "/city-details",
      params: { id: city?.id },
    });
  };

  return (
    // matches web: bg-[var(--color-bg-card)] rounded-xl overflow-hidden shadow-md border border-[var(--color-border)]
    <Pressable
      onPressIn={() => setShowHoverDetails(true)}
      onPressOut={() => setShowHoverDetails(false)}
      style={{
        backgroundColor: isDarkMode ? "#1f2937" : "#fff",
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: isDarkMode ? "#374151" : "#e5e7eb",
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      {/* ── Image Section — matches web: relative h-48 md:h-56 lg:h-64 ── */}
      <View style={{ position: "relative", height: 192, overflow: "hidden" }}>
        <Image
          source={{ uri: city?.image }}
          alt={city?.imageAlt}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />

        {/* matches web: bg-gradient-to-t from-black/70 via-black/30 to-transparent */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.7)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />

        {/* Badges — matches web: absolute top-4 right-4 flex gap-2 */}
        <View
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            flexDirection: "row",
            gap: 8,
          }}
        >
          {city?.isFeatured && (
            // matches web: px-3 py-1 bg-purple-500 text-white text-xs font-semibold rounded-full
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: "#a855f7",
              }}
            >
              <Icon name="Star" size={12} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
                Featured
              </Text>
            </View>
          )}
          {city?.isTrending && (
            // matches web: px-3 py-1 bg-orange-500 rounded-full
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: "#f97316",
              }}
            >
              <Icon name="TrendingUp" size={12} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
                Trending
              </Text>
            </View>
          )}
        </View>

        {/* City Info Overlay — matches web: absolute bottom-4 left-4 right-4 */}
        <View
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            right: 16,
          }}
        >
          {/* matches web: text-xl md:text-2xl font-bold text-white */}
          <Text
            style={{
              fontSize: 24,
              fontFamily: Fonts.playfair.bold,
              color: "#fff",
              marginBottom: 4,
            }}
          >
            {city?.name}
          </Text>
          {/* matches web: text-sm text-white/90 flex items-center gap-1 */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Icon name="MapPin" size={14} color="rgba(255,255,255,0.9)" />
            <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.9)" }}>
              {city?.country}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Content Section — matches web: p-4 md:p-5 lg:p-6 ── */}
      <View style={{ padding: 16 }}>
        {/* Description — matches web: text-sm md:text-base text-[var(--color-text-secondary)] line-clamp-2 */}
        <Text
          style={{
            fontSize: 14,
            color: isDarkMode ? "#9ca3af" : "#6b7280",
            marginBottom: 16,
            lineHeight: 20,
          }}
          numberOfLines={2}
        >
          {city?.description}
        </Text>

        {/* Stats — matches web: grid grid-cols-3 gap-3 mb-4 pb-4 border-b */}
        <View
          style={{
            flexDirection: "row",
            marginBottom: 16,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? "#374151" : "#f3f4f6",
          }}
        >
          {/* Active Travelers — matches web: text-blue-500 for icon AND number */}
          <View style={{ flex: 1, alignItems: "center" }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                marginBottom: 4,
              }}
            >
              <Icon name="Users" size={16} color="#3b82f6" />
              {/* matches web: text-lg font-bold in the blue-500 container */}
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: "#3b82f6",
                }}
              >
                {city?.activeTravelers}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 12,
                color: isDarkMode ? "#9ca3af" : "#6b7280",
              }}
            >
              Active Travelers
            </Text>
          </View>

          {/* Recent Posts — matches web: text-purple-500 for icon AND number */}
          <View style={{ flex: 1, alignItems: "center" }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                marginBottom: 4,
              }}
            >
              <Icon name="MessageCircle" size={16} color="#8b5cf6" />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: "#8b5cf6",
                }}
              >
                {city?.recentPosts}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 12,
                color: isDarkMode ? "#9ca3af" : "#6b7280",
              }}
            >
              Recent Posts
            </Text>
          </View>

          {/* Packages — matches web: text-green-500 for icon AND number */}
          <View style={{ flex: 1, alignItems: "center" }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                marginBottom: 4,
              }}
            >
              <Icon name="Package" size={16} color="#22c55e" />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: "#22c55e",
                }}
              >
                {city?.packages}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 12,
                color: isDarkMode ? "#9ca3af" : "#6b7280",
              }}
            >
              Packages
            </Text>
          </View>
        </View>

        {/* Hover Details — matches web: hidden group-hover:block mb-4 space-y-2 animate-fadeIn
            In RN: shown when card is pressed (showHoverDetails) */}
        {showHoverDetails && (
          <View style={{ marginBottom: 16, gap: 8 }}>
            {/* Weather — matches web: flex items-center gap-2 text-sm */}
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Icon name="Cloud" size={16} color="#3b82f6" />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "500",
                  color: isDarkMode ? "#f9fafb" : "#111827",
                }}
              >
                Weather:
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: isDarkMode ? "#9ca3af" : "#6b7280",
                }}
              >
                {city?.weather}
              </Text>
            </View>

            {/* Rating — matches web: flex items-center gap-2 */}
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Icon name="Star" size={16} color="#f59e0b" />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "500",
                  color: isDarkMode ? "#f9fafb" : "#111827",
                }}
              >
                Rating:
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: isDarkMode ? "#9ca3af" : "#6b7280",
                }}
              >
                {city?.rating}/5.0
              </Text>
            </View>

            {/* Activities — matches web: flex flex-wrap gap-2 mt-2, slice(0, 3) */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 8,
              }}
            >
              {city?.popularActivities?.slice(0, 3)?.map((activity, index) => (
                <View
                  key={index}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 999,
                    // matches web: bg-[var(--color-bg-secondary)]
                    backgroundColor: isDarkMode ? "#374151" : "#f3f4f6",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: isDarkMode ? "#9ca3af" : "#6b7280",
                    }}
                  >
                    {activity}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons — matches web: grid grid-cols-2 gap-2 md:gap-3 */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
          {/* View Posts — matches web: hover:bg-[#FF9933] hover:text-white */}
          <Pressable
            onPress={handleViewPosts}
            onPressIn={() => setViewPostsPressed(true)}
            onPressOut={() => setViewPostsPressed(false)}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              paddingVertical: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: viewPostsPressed
                ? "#FF9933"
                : isDarkMode
                  ? "#374151"
                  : "#e5e7eb",
              backgroundColor: viewPostsPressed ? "#FF9933" : "transparent",
            }}
          >
            <Icon
              name="MessageCircle"
              size={14}
              color={
                viewPostsPressed ? "#fff" : isDarkMode ? "#f9fafb" : "#374151"
              }
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: "500",
                color: viewPostsPressed
                  ? "#fff"
                  : isDarkMode
                    ? "#f9fafb"
                    : "#374151",
              }}
            >
              View Posts
            </Text>
          </Pressable>

          {/* Packages — matches web: hover:bg-[#FF9933] hover:text-white */}
          <Pressable
            onPress={handleViewPackages}
            onPressIn={() => setPackagesPressed(true)}
            onPressOut={() => setPackagesPressed(false)}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              paddingVertical: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: packagesPressed
                ? "#FF9933"
                : isDarkMode
                  ? "#374151"
                  : "#e5e7eb",
              backgroundColor: packagesPressed ? "#FF9933" : "transparent",
            }}
          >
            <Icon
              name="Package"
              size={14}
              color={
                packagesPressed ? "#fff" : isDarkMode ? "#f9fafb" : "#374151"
              }
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: "500",
                color: packagesPressed
                  ? "#fff"
                  : isDarkMode
                    ? "#f9fafb"
                    : "#374151",
              }}
            >
              Packages
            </Text>
          </Pressable>
        </View>

        {/* Plan Trip — matches web: Button variant='default' iconName='Luggage' fullWidth mt-3 */}
        <Pressable
          onPress={handlePlanTrip}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            paddingVertical: 12,
            borderRadius: 8,
            backgroundColor: "#FF9933",
            marginTop: 4,
          }}
        >
          <Icon name="Luggage" size={16} color="#fff" />
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#fff" }}>
            Plan Trip
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
};

export default CityCard;
