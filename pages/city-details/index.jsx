import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";
import Icon from "../../components/AppIcon";
import { useDarkMode } from "../../context/DarkModeContext";
import { getCityById } from "../../services/cityDetails.api";
import { transformCity } from "../../utils/cityTransform";
import CityHeader from "./components/CityHeader";
import CommunityPostsTab from "./components/CommunityPostsTab";
import TripPlanningTab from "./components/TripPlanningTab";

const tabs = [
  { id: "posts", label: "Community Posts", icon: "Users" },
  { id: "planning", label: "Trip Planning", icon: "Calendar" },
];

const CityDetails = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isDarkMode } = useDarkMode();

  const [activeTab, setActiveTab] = useState("posts");
  const [city, setCity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bgPrimary = isDarkMode ? "#111827" : "#f9fafb";
  const bgCard = isDarkMode ? "#1f2937" : "#fff";
  const border = isDarkMode ? "#374151" : "#e5e7eb";
  const textPrimary = isDarkMode ? "#f9fafb" : "#111827";
  const textSecondary = isDarkMode ? "#9ca3af" : "#6b7280";

  useEffect(() => {
    const fetchCity = async () => {
      if (!id) {
        router.replace("/cities");
        return;
      }
      try {
        setLoading(true);
        const data = await getCityById(id);
        if (!data || Object.keys(data).length === 0) {
          router.replace("/cities");
          return;
        }
        setCity(transformCity(data));
        setError(null);
      } catch (err) {
        setError("Could not load city details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCity();
    } else {
      router.replace("/cities");
    }
  }, [id]);

  const handlePlanTrip = () => setActiveTab("planning");

  const handleCreatePost = () =>
    router.push({
      pathname: "/create-post",
      params: { cityName: city?.name },
    });

  const handleCreateTrip = (tripData) =>
    router.push({
      pathname: "/my-trips",
      params: { newTrip: JSON.stringify({ ...tripData, city: city?.name }) },
    });

  const handleShare = async () => {
    try {
      await Share.share({
        title: city?.name,
        message: `${city?.name} - ${city?.description}`,
      });
    } catch {}
  };

  // ── Loading — matches web: blue spinner ──────────────────────
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: bgPrimary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* matches web: border-b-2 border-blue-500 */}
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  // ── Error — matches web: text-red-500 centered ───────────────
  if (error || !city) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: bgPrimary,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <Text style={{ color: "#ef4444", textAlign: "center" }}>
          {error || "City not found"}
        </Text>
        <Pressable
          onPress={() => router.replace("/cities")}
          style={{ marginTop: 16 }}
        >
          <Text style={{ color: "#3b82f6" }}>Back to Cities</Text>
        </Pressable>
      </View>
    );
  }

  return (
    // matches web: bg-[var(--color-bg-primary)]
    <View style={{ flex: 1, backgroundColor: bgPrimary }}>
      {/* Back button — native-only affordance, not in web */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 8,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: isDarkMode ? "#374151" : "#f3f4f6",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 8,
          }}
        >
          <Icon name="ArrowLeft" size={18} color={textPrimary} />
        </Pressable>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: textPrimary,
            flex: 1,
          }}
          numberOfLines={1}
        >
          {city?.name}
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <View style={{ paddingHorizontal: 16 }}>
          <CityHeader
            city={city}
            onPlanTrip={handlePlanTrip}
            onShare={handleShare}
          />

          {/* ── Tabs — matches web: border-b border-[var(--color-border)] underline style ── */}
          <View
            style={{
              marginTop: 16,
              marginBottom: 24,
              borderBottomWidth: 1,
              borderBottomColor: border,
            }}
          >
            <View style={{ flexDirection: "row", gap: 4 }}>
              {tabs.map((tab) => (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    // matches web: border-b-2 border-blue-500 when active
                    borderBottomWidth: 2,
                    borderBottomColor:
                      activeTab === tab.id ? "#3b82f6" : "transparent",
                    marginBottom: -1, // overlap the container border
                  }}
                >
                  {/* matches web: size={16}, blue when active, secondary when inactive */}
                  <Icon
                    name={tab.icon}
                    size={16}
                    color={activeTab === tab.id ? "#3b82f6" : textSecondary}
                  />
                  {/* matches web: text-xs sm:text-sm font-medium */}
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "500",
                      color: activeTab === tab.id ? "#3b82f6" : textSecondary,
                    }}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Tab Content */}
          {activeTab === "posts" && (
            <CommunityPostsTab
              cityName={city?.name}
              onCreatePost={handleCreatePost}
            />
          )}
          {activeTab === "planning" && (
            <TripPlanningTab
              cityName={city?.name}
              onCreateTrip={handleCreateTrip}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default CityDetails;
