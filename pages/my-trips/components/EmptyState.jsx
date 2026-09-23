import { Pressable, Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { Fonts, Palette } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";

const EmptyState = ({ onCreateTrip, onClearFilters, hasFilters, message }) => {
  const { isDarkMode } = useDarkMode();
  const text = isDarkMode ? Palette.dark.text : Palette.light.text;
  const muted = isDarkMode ? Palette.dark.textVariant : Palette.light.textVariant;
  const primary = isDarkMode ? Palette.dark.primary : Palette.light.primary;
  const soft = isDarkMode ? "rgba(255,255,255,0.06)" : "#FCE8DC";
  if (hasFilters) return (
    <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 72, paddingHorizontal: 16 }}>
      <View style={{ padding: 16, borderRadius: 999, backgroundColor: soft, marginBottom: 24 }}><Icon name="SearchX" size={40} color={muted} /></View>
      <Text style={{ fontFamily: Fonts.playfair.bold, fontSize: 24, color: text, textAlign: "center", marginBottom: 8 }}>No Trips Found</Text>
      <Text style={{ fontFamily: Fonts.inter.regular, fontSize: 14, lineHeight: 21, color: muted, textAlign: "center", maxWidth: 380, marginBottom: 24 }}>We couldn't find any trips matching your filters. Try adjusting your search criteria or create a new trip.</Text>
      <Pressable onPress={onClearFilters} style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 11, borderRadius: 10, borderWidth: 1, borderColor: isDarkMode ? "rgba(255,255,255,0.15)" : Palette.light.outlineVariant }}><Icon name="RotateCcw" size={15} color={text} /><Text style={{ fontFamily: Fonts.inter.semibold, fontSize: 14, color: text }}>Clear Filters</Text></Pressable>
    </View>
  );

  const features = [
    { label: "Plan", description: "Organize your travel itinerary with detailed planning", icon: "MapPin" },
    { label: "Collaborate", description: "Share trips with friends and plan together", icon: "Users" },
    { label: "Track", description: "Monitor your trips from planning to completion", icon: "Calendar" },
  ];
  return (
    <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 64, paddingHorizontal: 16 }}>
      <View style={{ position: "relative", marginBottom: 24 }}>
        <View style={{ padding: 24, borderRadius: 999, backgroundColor: soft }}><Icon name="Luggage" size={44} color={primary} /></View>
        {onCreateTrip && <View style={{ position: "absolute", right: -4, bottom: -4, width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: primary }}><Icon name="Plus" size={16} color="#FFFFFF" /></View>}
      </View>
      <Text style={{ fontFamily: Fonts.playfair.bold, fontSize: 28, color: text, textAlign: "center", marginBottom: 8 }}>{message ? "Nothing Here Yet" : "Start Your Journey"}</Text>
      <Text style={{ fontFamily: Fonts.inter.regular, fontSize: 14, lineHeight: 21, color: muted, textAlign: "center", maxWidth: 380, marginBottom: 28 }}>{message || "You haven't created any trips yet. Start planning your next adventure and organize all your travel details in one place."}</Text>
      {onCreateTrip && <Pressable onPress={onCreateTrip} style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, backgroundColor: primary, marginBottom: 32 }}><Icon name="Plus" size={16} color="#FFFFFF" /><Text style={{ fontFamily: Fonts.inter.semibold, fontSize: 14, color: "#FFFFFF" }}>Create New Trip</Text></Pressable>}
      {!message && <View style={{ width: "100%", maxWidth: 560, flexDirection: "row", gap: 12 }}>
        {features.map((feature) => <View key={feature.label} style={{ flex: 1, alignItems: "center", padding: 8 }}><View style={{ padding: 10, borderRadius: 10, backgroundColor: soft, marginBottom: 8 }}><Icon name={feature.icon} size={18} color={primary} /></View><Text style={{ fontFamily: Fonts.inter.semibold, fontSize: 13, color: text, marginBottom: 4 }}>{feature.label}</Text><Text style={{ fontFamily: Fonts.inter.regular, fontSize: 10, lineHeight: 14, textAlign: "center", color: muted }}>{feature.description}</Text></View>)}
      </View>}
    </View>
  );
};

export default EmptyState;
