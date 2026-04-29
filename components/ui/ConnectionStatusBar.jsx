import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useDarkMode } from "../../context/DarkModeContext";
import Icon from "../AppIcon";

const CITY_CACHE_KEY = "apni_cached_city";
const CITY_CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours — mirrors web exactly

const ConnectionStatusBar = ({ visible = true }) => {
  const { isDarkMode } = useDarkMode();
  const [isOnline, setIsOnline] = useState(true);
  const [currentCity, setCurrentCity] = useState("Mumbai");

  const colors = {
    bgSecondary: isDarkMode ? "#1A1F29" : "#F7FAFC",
    border: isDarkMode ? "#2D3748" : "rgba(0,0,0,0.08)",
    textPrimary: isDarkMode ? "#FFFFFF" : "#111827",
    textSecondary: isDarkMode ? "#A0AEC0" : "#6b7280",
  };

  // ── Network status — mirrors web online/offline listeners ────────────────
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? true);
    });
    return () => unsubscribe();
  }, []);

  // ── City — mirrors web cache + geolocation logic exactly ─────────────────
  useEffect(() => {
    const fetchCity = async () => {
      // Check cache first — mirrors web localStorage check
      try {
        const cached = await AsyncStorage.getItem(CITY_CACHE_KEY);
        if (cached) {
          const { city, ts } = JSON.parse(cached);
          if (Date.now() - ts < CITY_CACHE_TTL) {
            setCurrentCity(city);
            return;
          }
        }
      } catch {}

      // Request permission then get location
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        });

        // Use bigdatacloud API — mirrors web exactly
        const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${loc.coords.latitude}&longitude=${loc.coords.longitude}&localityLanguage=en`,
        );
        const data = await res.json();

        if (data?.city) {
          setCurrentCity(data.city);
          // Cache result — mirrors web localStorage.setItem
          await AsyncStorage.setItem(
            CITY_CACHE_KEY,
            JSON.stringify({ city: data.city, ts: Date.now() }),
          );
        }
      } catch (err) {
        console.error("City fetch error:", err);
      }
    };

    fetchCity();
  }, []);

  if (!visible) return null;

  return (
    <View
      style={{
        width: "100%",
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.bgSecondary,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
      >
        {/* ── Online / Offline indicator ── */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: isOnline ? "#22c55e" : "#ef4444",
            }}
          />
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_500Medium",
              color: colors.textPrimary,
            }}
          >
            {isOnline ? "Online" : "Offline"}
          </Text>
        </View>

        {/* ── City indicator ── */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Icon name="MapPin" size={16} color={colors.textSecondary} />
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_500Medium",
              color: colors.textSecondary,
            }}
          >
            {currentCity}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ConnectionStatusBar;
