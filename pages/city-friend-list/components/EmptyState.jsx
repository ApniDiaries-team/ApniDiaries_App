import { Pressable, Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { Fonts, Palette } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";

const EmptyState = ({ filterType, onResetFilters }) => {
  const { isDarkMode } = useDarkMode();
  const textPrimary = isDarkMode ? Palette.dark.text : Palette.light.text;
  const textMuted = isDarkMode ? Palette.dark.textVariant : Palette.light.textVariant;
  const content = filterType === "friends"
    ? { title: "No connections in this city", description: "Start connecting with travelers to build your network", action: "Explore All Travelers" }
    : filterType === "followers"
      ? { title: "No followers yet", description: "Share your travel stories to attract followers", action: "View All Travelers" }
      : filterType === "available"
        ? { title: "No travelers available", description: "Check back later or explore other cities", action: "Change City" }
        : { title: "No connections found", description: "Try adjusting your filters or explore other cities", action: "Reset Filters" };

  return (
    <View style={{ alignItems: "center", paddingVertical: 64 }}>
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: isDarkMode ? Palette.dark.surfaceLow : Palette.light.surfaceLow, alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
        <Icon name="Users" size={26} color={textMuted} />
      </View>
      <Text style={{ fontFamily: Fonts.playfair.semibold, fontSize: 20, color: textPrimary, marginBottom: 8, textAlign: "center" }}>{content.title}</Text>
      <Text style={{ fontFamily: Fonts.inter.regular, fontSize: 14, lineHeight: 20, color: textMuted, marginBottom: 24, maxWidth: 300, textAlign: "center" }}>{content.description}</Text>
      <Pressable onPress={onResetFilters} style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999, backgroundColor: isDarkMode ? Palette.dark.primary : Palette.light.primary }}>
        <Icon name="RefreshCw" size={15} color={isDarkMode ? Palette.dark.onPrimary : Palette.light.onPrimary} />
        <Text style={{ fontFamily: Fonts.inter.semibold, fontSize: 14, color: isDarkMode ? Palette.dark.onPrimary : Palette.light.onPrimary }}>{content.action}</Text>
      </Pressable>
    </View>
  );
};

export default EmptyState;
