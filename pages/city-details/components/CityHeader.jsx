import { LinearGradient } from "expo-linear-gradient";
import { Image, Pressable, Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { useDarkMode } from "../../../context/DarkModeContext";

const CityHeader = ({ city, onPlanTrip, onShare }) => {
  const { isDarkMode } = useDarkMode();

  return (
    // matches web: relative w-full h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden border border-[var(--color-border)]
    <View
      style={{
        height: 256,
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: isDarkMode ? "#374151" : "#e5e7eb",
        marginBottom: 16,
      }}
    >
      <Image
        source={{ uri: city?.image }}
        style={{ width: "100%", height: "100%" }}
        resizeMode="cover"
      />

      {/* Gradient Overlay — matches web: bg-gradient-to-t from-black/80 via-black/40 to-transparent */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.8)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        pointerEvents="none"
      />

      {/* Content Overlay — matches web: absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8 */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: 16,
          gap: 12,
        }}
      >
        {/* Title + Description — matches web: flex-1 min-w-0 */}
        <View style={{ flex: 1, minWidth: 0 }}>
          {/* matches web: text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 */}
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: "#fff",
              marginBottom: 8,
            }}
          >
            {city?.name}
          </Text>
          {/* matches web: text-sm md:text-base text-white/90 line-clamp-2 */}
          <Text
            style={{ fontSize: 14, color: "rgba(255,255,255,0.9)" }}
            numberOfLines={2}
          >
            {city?.description}
          </Text>
        </View>

        {/* Stats — matches web: flex flex-wrap items-center gap-4 md:gap-6 */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
          {/* Active Members — matches web: bg-blue-500/20 + "Active Members" label */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "rgba(59,130,246,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="Users" size={16} color="#fff" />
            </View>
            <View>
              {/* matches web: text-xs md:text-sm text-white/70 */}
              <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                Active Members
              </Text>
              {/* matches web: text-sm md:text-base font-semibold text-white */}
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#fff" }}>
                {city?.activeMembers}
              </Text>
            </View>
          </View>

          {/* Recent Posts — matches web: bg-purple-500/20 + "Recent Posts" label */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "rgba(168,85,247,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="MessageCircle" size={16} color="#fff" />
            </View>
            <View>
              <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                Recent Posts
              </Text>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#fff" }}>
                {city?.recentPosts}
              </Text>
            </View>
          </View>

          {/* Activity Level — matches web: bg-green-500/20 + "Activity" label */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "rgba(34,197,94,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="TrendingUp" size={16} color="#fff" />
            </View>
            <View>
              <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                Activity
              </Text>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#fff" }}>
                {city?.activityLevel}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons — matches web: flex flex-wrap gap-3 md:gap-4 */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {/* Plan Trip — matches web: bg-blue-500 hover:bg-blue-600 text-sm font-medium px-4 py-2.5 */}
          <Pressable
            onPress={onPlanTrip}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor: "#3b82f6",
            }}
          >
            <Icon name="Calendar" size={18} color="#fff" />
            <Text style={{ fontSize: 14, fontWeight: "500", color: "#fff" }}>
              Plan Trip
            </Text>
          </Pressable>

          {/* Share — matches web: bg-white/10 border-white/30 hover:bg-white/20 text-sm font-medium px-4 py-2.5 */}
          <Pressable
            onPress={onShare}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor: "rgba(255,255,255,0.1)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.3)",
            }}
          >
            <Icon name="Share2" size={18} color="#fff" />
            <Text style={{ fontSize: 14, fontWeight: "500", color: "#fff" }}>
              Share
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default CityHeader;
