import { Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { Fonts, Palette } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";

const TripStats = ({ trips }) => {
  const { isDarkMode } = useDarkMode();
  const text = isDarkMode ? Palette.dark.text : Palette.light.text;
  const muted = isDarkMode ? Palette.dark.textVariant : Palette.light.textVariant;
  const primary = isDarkMode ? Palette.dark.primary : Palette.light.primary;
  const surfaceLow = isDarkMode ? "rgba(255,255,255,0.08)" : "#FCE8DC";
  const stats = [
    { label: "Total Trips", value: trips?.length ?? 0, icon: "Luggage" },
    { label: "Planned", value: trips?.filter((trip) => trip?.status === "planned")?.length ?? 0, icon: "Calendar" },
    { label: "Ongoing", value: trips?.filter((trip) => trip?.status === "ongoing")?.length ?? 0, icon: "Plane" },
    { label: "Completed", value: trips?.filter((trip) => trip?.status === "completed")?.length ?? 0, icon: "CheckCircle2" },
  ];
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", rowGap: 24 }}>
      {stats.map((stat) => (
        <View key={stat.label} style={{ width: "50%" }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: surfaceLow, alignItems: "center", justifyContent: "center", marginBottom: 12 }}><Icon name={stat.icon} size={19} color={primary} /></View>
          <Text style={{ fontFamily: Fonts.playfair.bold, fontSize: 30, lineHeight: 36, color: text }}>{stat.value}</Text>
          <Text style={{ fontFamily: Fonts.inter.semibold, fontSize: 11, letterSpacing: 0.5, color: muted, marginTop: 4 }}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
};

export default TripStats;
