import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { Fonts } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";

const FeaturedSection = ({ featuredCities }) => {
  const router = useRouter();
  const { isDarkMode } = useDarkMode();

  // matches web: if (!featuredCities || featuredCities?.length === 0) return null
  if (!featuredCities || featuredCities?.length === 0) return null;

  return (
    // matches web: mb-8
    <View style={{ marginBottom: 32 }}>
      {/* Header — matches web: flex items-center justify-between mb-6 */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        {/* matches web: text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] flex items-center gap-3 */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Icon name="Star" size={28} color="#f59e0b" />
          <Text
            style={{
              fontSize: 26,
              fontFamily: Fonts.playfair.bold,
              color: isDarkMode ? "#f9fafb" : "#111827",
            }}
          >
            Featured Destinations
          </Text>
        </View>
      </View>

      {/* Featured Cities — matches web: grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 */}
      <View style={{ gap: 16 }}>
        {featuredCities?.map((city) => {
          return (
            <CityItem
              key={city?.id}
              city={city}
              isDarkMode={isDarkMode}
              router={router}
            />
          );
        })}
      </View>
    </View>
  );
};

// Extracted so each card can independently track its own pressed states
const CityItem = ({ city, isDarkMode, router }) => {
  const [planTripPressed, setPlanTripPressed] = useState(false);
  const [explorePressed, setExplorePressed] = useState(false);

  return (
    <View
      style={{
        position: "relative",
        // matches web: bg-[var(--color-bg-card)] rounded-xl overflow-hidden h-64 md:h-80 lg:h-96
        backgroundColor: isDarkMode ? "#1f2937" : "#fff",
        borderRadius: 12,
        overflow: "hidden",
        height: 256,
        borderWidth: 1,
        borderColor: isDarkMode ? "#374151" : "#e5e7eb",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
      }}
    >
      {/* Background Image */}
      <Image
        source={{ uri: city?.image }}
        alt={city?.imageAlt}
        style={{ width: "100%", height: "100%" }}
        resizeMode="cover"
      />

      {/* Gradient Overlay — matches web: bg-gradient-to-t from-black/80 via-black/40 to-transparent */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.8)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      {/* Featured Badge — matches web: absolute top-4 right-4 px-4 py-2 bg-purple-500 rounded-full */}
      <View style={{ position: "absolute", top: 16, right: 16 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 999,
            backgroundColor: "#a855f7",
          }}
        >
          <Icon name="Star" size={16} color="#fff" />
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
            Featured
          </Text>
        </View>
      </View>

      {/* Content Overlay — matches web: absolute bottom-0 left-0 right-0 p-6 md:p-8 */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: 24,
        }}
      >
        {/* Location — matches web: flex items-center gap-2 text-white/90 mb-2 */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <Icon name="MapPin" size={16} color="rgba(255,255,255,0.9)" />
          <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.9)" }}>
            {city?.country}
          </Text>
        </View>

        {/* City Name — matches web: text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3
            web uses plain font-bold (no playfair), so we use fontWeight '700' only */}
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: "#fff",
            marginBottom: 12,
          }}
        >
          {city?.name}
        </Text>

        {/* Description — matches web: text-sm text-white/90 mb-4 line-clamp-2 */}
        <Text
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.9)",
            marginBottom: 16,
            lineHeight: 20,
          }}
          numberOfLines={2}
        >
          {city?.description}
        </Text>

        {/* Stats — matches web: flex flex-wrap gap-3 mb-4 */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 16,
          }}
        >
          {/* Active Travelers — matches web: text-white icon + text-sm font-medium */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Icon name="Users" size={16} color="#fff" />
            <Text style={{ fontSize: 14, fontWeight: "500", color: "#fff" }}>
              {city?.activeTravelers} travelers
            </Text>
          </View>

          {/* Recent Posts */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Icon name="MessageCircle" size={16} color="#fff" />
            <Text style={{ fontSize: 14, fontWeight: "500", color: "#fff" }}>
              {city?.recentPosts} posts
            </Text>
          </View>

          {/* Rating — matches web: text-yellow-400 icon, text-white text */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Icon name="Star" size={16} color="#fbbf24" />
            <Text style={{ fontSize: 14, fontWeight: "500", color: "#fff" }}>
              {city?.rating}/5.0
            </Text>
          </View>
        </View>

        {/* Action Buttons — matches web: flex gap-3 */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          {/* Plan Trip — matches web: Button variant='default' iconName='Luggage' */}
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/trips",
                params: { cityId: city?.id, cityName: city?.name },
              })
            }
            onPressIn={() => setPlanTripPressed(true)}
            onPressOut={() => setPlanTripPressed(false)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 8,
              // darken slightly on press, mirrors browser active state
              backgroundColor: planTripPressed ? "#e6891f" : "#FF9933",
            }}
          >
            <Icon name="Luggage" size={16} color="#fff" />
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#fff" }}>
              Plan Trip
            </Text>
          </Pressable>

          {/* Explore — matches web: bg-white/10 border-white/30 hover:bg-white/20 hover:border-white/40 */}
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/city-details",
                params: { id: city?.id },
              })
            }
            onPressIn={() => setExplorePressed(true)}
            onPressOut={() => setExplorePressed(false)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 8,
              // matches web: hover:bg-white/20 hover:border-white/40
              backgroundColor: explorePressed
                ? "rgba(255,255,255,0.2)"
                : "rgba(255,255,255,0.1)",
              borderWidth: 1,
              borderColor: explorePressed
                ? "rgba(255,255,255,0.4)"
                : "rgba(255,255,255,0.3)",
            }}
          >
            <Icon name="Eye" size={16} color="#fff" />
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#fff" }}>
              Explore
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default FeaturedSection;
