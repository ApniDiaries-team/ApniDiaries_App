import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { Fonts, Palette } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";
import { getProfilePhotoUrl } from "../../../helper/DefaultImageUrl";

const SuggestedFriends = ({ suggestions, onAddFriend }) => {
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const textPrimary = isDarkMode ? Palette.dark.text : Palette.light.text;
  const textMuted = isDarkMode ? Palette.dark.textVariant : Palette.light.textVariant;
  const accent = isDarkMode ? Palette.dark.primary : Palette.light.primary;
  const divider = isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(225,191,178,0.6)";
  if (!suggestions?.length) return null;

  const openProfile = (person) => {
    if (!person?.id || !person?.name) return;
    router.push({ pathname: "/other-user-profile", params: { userId: person.id } });
  };

  return (
    <View>
      <Text style={{ fontFamily: Fonts.playfair.bold, fontSize: 24, color: textPrimary, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: isDarkMode ? "rgba(255,255,255,0.1)" : Palette.light.outlineVariant }}>
        Suggested
      </Text>
      {suggestions.map((person, index) => (
        <View key={person?.id} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 20, borderBottomWidth: index < suggestions.length - 1 ? 1 : 0, borderBottomColor: divider }}>
          <Pressable onPress={() => openProfile(person)} style={{ flexShrink: 0 }}>
            <Image source={{ uri: getProfilePhotoUrl(person?.avatar) }} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: isDarkMode ? "#2D3748" : "#FFF1EC" }} />
          </Pressable>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Pressable onPress={() => openProfile(person)} style={{ alignSelf: "flex-start" }}>
              <Text numberOfLines={1} style={{ fontFamily: Fonts.playfair.semibold, fontSize: 16, color: textPrimary }}>{person?.name}</Text>
            </Pressable>
            {person?.mutualConnections > 0 && <Text style={{ fontFamily: Fonts.inter.regular, fontSize: 12, color: textMuted, marginTop: 2 }}>{person.mutualConnections} mutual connections</Text>}
            <Pressable onPress={() => onAddFriend(person)} hitSlop={6} style={{ alignSelf: "flex-start", marginTop: 5 }}>
              <Text style={{ fontFamily: Fonts.inter.bold, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase", color: accent }}>Connect</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
};

export default SuggestedFriends;
