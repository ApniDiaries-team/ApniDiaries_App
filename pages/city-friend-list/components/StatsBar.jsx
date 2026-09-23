import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { Fonts, Palette } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";

const StatsBar = ({ stats, onStatClick }) => {
  const { isDarkMode } = useDarkMode();
  const { width } = useWindowDimensions();
  const text = isDarkMode ? Palette.dark.text : Palette.light.text;
  const muted = isDarkMode ? Palette.dark.textVariant : Palette.light.textVariant;
  const primary = isDarkMode ? Palette.dark.primary : Palette.light.primary;
  const items = [
    { type: "friends", label: "Connections", value: stats?.friends ?? 0 },
    { type: "followers", label: "Followers", value: stats?.followers ?? 0 },
    { type: "calls", label: "Missed Calls", value: stats?.missedCalls ?? 0 },
    { type: "upcomingTrips", label: "Upcoming Trips", value: stats?.upcomingTrips ?? 0 },
  ];

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: width >= 1024 ? 48 : 20, rowGap: 20 }}>
      {items.map((item) => (
        <Pressable key={item.type} onPress={() => onStatClick?.(item.type)} style={{ minWidth: width >= 500 ? 112 : "44%" }}>
          <Text style={{ fontFamily: Fonts.playfair.bold, fontSize: width >= 768 ? 36 : 30, lineHeight: width >= 768 ? 42 : 36, color: primary }}>
            {Number(item.value || 0).toLocaleString("en-IN")}
          </Text>
          <Text style={{ fontFamily: Fonts.inter.semibold, fontSize: 11, letterSpacing: 1.1, textTransform: "uppercase", color: muted, marginTop: 8 }}>
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

export default StatsBar;
