import { useState } from "react";
import { Image, Pressable, Text, useWindowDimensions, View } from "react-native";
import { Palette, Fonts } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";
import Icon from "../../../components/AppIcon";

const STATUS = {
  ongoing: { label: "Ongoing", icon: "Plane", color: "#147D74" },
  completed: { label: "Completed", icon: "CheckCircle2", color: "#7A6B62" },
  planned: { label: "Planned", icon: "Calendar", color: "#A23F00" },
};
const VISIBILITY = {
  public: { label: "Public", icon: "Globe2" },
  private: { label: "Private", icon: "Lock" },
  only_me: { label: "Only Me", icon: "Eye" },
};

const dateLabel = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const TripCard = ({ trip, onEdit, onDelete, onView }) => {
  const { isDarkMode } = useDarkMode();
  const { width } = useWindowDimensions();
  const [cardWidth, setCardWidth] = useState(0);
  const surface = isDarkMode ? Palette.dark.surfaceLowest : Palette.light.surfaceLowest;
  const border = isDarkMode ? Palette.dark.outlineVariant : Palette.light.outlineVariant;
  const text = isDarkMode ? Palette.dark.text : Palette.light.text;
  const muted = isDarkMode ? Palette.dark.textVariant : Palette.light.textVariant;
  const status = { ...(STATUS[trip?.status] || STATUS.planned), ...(trip?.status === "planned" ? { color: isDarkMode ? "#ED8936" : "#A23F00" } : {}) };
  const visibility = VISIBILITY[trip?.visibility] || VISIBILITY.only_me;
  const visibilityIcon = visibility.icon;
  const imageHeight = cardWidth ? cardWidth * 0.75 : (width - 40) * 0.75;
  const memberCount = trip?.memberCount || trip?.participants || 1;

  return (
    <View onLayout={(event) => setCardWidth(event.nativeEvent.layout.width)} style={{ borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: isDarkMode ? "rgba(255,255,255,0.1)" : border, backgroundColor: surface, shadowColor: isDarkMode ? "#000" : "#6A3824", shadowOffset: { width: 0, height: 5 }, shadowOpacity: isDarkMode ? 0.2 : 0.08, shadowRadius: 14, elevation: 3 }}>
      <View style={{ height: imageHeight, position: "relative", overflow: "hidden", backgroundColor: isDarkMode ? Palette.dark.surfaceLow : Palette.light.surfaceLow }}>
        {trip?.image ? <Image source={{ uri: trip.image }} accessibilityLabel={trip?.imageAlt || trip?.title} style={{ width: "100%", height: "100%" }} resizeMode="cover" /> : <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><Icon name="MapPin" size={28} color={muted} /></View>}
        <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.08)" }} />
        <View style={{ position: "absolute", left: 12, right: 12, top: 12, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.94)" }}><Icon name={status.icon} size={11} color={status.color} /><Text style={{ color: status.color, fontFamily: Fonts.inter.bold, fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase" }}>{status.label}</Text></View>
          <View style={{ alignItems: "flex-end", gap: 6 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: "rgba(20,18,16,0.62)" }}><Icon name={visibilityIcon} size={10} color="#FFFFFF" /><Text style={{ color: "#FFFFFF", fontFamily: Fonts.inter.medium, fontSize: 10 }}>{visibility.label}</Text></View>
            {memberCount > 1 && trip?.visibility !== "only_me" && <View style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: "rgba(20,18,16,0.62)" }}><Icon name="Users" size={10} color="#FFFFFF" /><Text style={{ color: "#FFFFFF", fontFamily: Fonts.inter.medium, fontSize: 10 }}>{memberCount}</Text></View>}
          </View>
        </View>
        {(onEdit || onDelete) && <View style={{ position: "absolute", right: 12, bottom: 12, flexDirection: "row", gap: 8 }}>
          {onEdit && <Pressable onPress={() => onEdit(trip)} accessibilityLabel="Edit trip" hitSlop={4} style={{ width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.94)" }}><Icon name="Edit2" size={14} color="#261913" /></Pressable>}
          {onDelete && <Pressable onPress={() => onDelete(trip)} accessibilityLabel="Delete trip" hitSlop={4} style={{ width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.94)" }}><Icon name="Trash2" size={14} color="#BA1A1A" /></Pressable>}
        </View>}
      </View>

      <View style={{ padding: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><Icon name="MapPin" size={13} color={muted} /><Text numberOfLines={1} style={{ flex: 1, fontFamily: Fonts.inter.regular, fontSize: 14, color: muted }}>{trip?.destination}</Text></View>
        <Text numberOfLines={1} style={{ fontFamily: Fonts.playfair.bold, fontSize: 20, color: text, marginTop: 5, marginBottom: 12 }}>{trip?.title}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: trip?.description ? 12 : 18 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><Icon name="Calendar" size={12} color={muted} /><Text style={{ fontFamily: Fonts.inter.regular, fontSize: 12, color: muted }}>{dateLabel(trip?.startDate)}</Text></View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><Icon name="Clock" size={12} color={muted} /><Text style={{ fontFamily: Fonts.inter.regular, fontSize: 12, color: muted }}>{trip?.duration}d</Text></View>
        </View>
        {!!trip?.description && <Text numberOfLines={2} style={{ fontFamily: Fonts.inter.regular, fontSize: 13, lineHeight: 19, color: muted, marginBottom: 16 }}>{trip.description}</Text>}
        <Pressable onPress={() => onView(trip)} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 11, borderRadius: 10, borderWidth: 1, borderColor: isDarkMode ? "rgba(255,255,255,0.16)" : border }}><Text style={{ fontFamily: Fonts.inter.semibold, fontSize: 14, color: text }}>Open Trip</Text><Icon name="ArrowRight" size={15} color={text} /></Pressable>
      </View>
    </View>
  );
};

export default TripCard;

