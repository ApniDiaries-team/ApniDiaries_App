import { Pressable, Text, View } from "react-native";
import { Fonts } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";

// Mirrors web pages/personal-profile/components/ProfileStats.jsx (2-column
// grid on mobile, matching the web's `grid-cols-2 md:grid-cols-4`).
const ProfileStats = ({ expeditions, followers, following, onFollowersClick, onFollowingClick }) => {
  const { theme } = useDarkMode();

  const tiles = [
    { label: "Expeditions", value: expeditions, onPress: null },
    { label: "Follower", value: followers, onPress: onFollowersClick },
    { label: "Following", value: following, onPress: onFollowingClick },
  ];

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, marginTop: 28, gap: 12 }}>
      {tiles.map((t) => {
        const Wrapper = t.onPress ? Pressable : View;
        const basis = tiles.length === 3 ? "31.5%" : "48%";
        return (
          <Wrapper
            key={t.label}
            onPress={t.onPress || undefined}
            style={{
              flexBasis: basis,
              flexGrow: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 20,
              borderRadius: 16,
              backgroundColor: theme.surfaceContainerLow,
            }}
          >
            <Text style={{ fontFamily: Fonts.display.bold, fontSize: 22, color: theme.primary, marginBottom: 2 }}>
              {(t.value ?? 0).toLocaleString("en-IN")}
            </Text>
            <Text style={{ fontSize: 12, fontFamily: Fonts.body.semibold, color: theme.secondary || theme.onSurfaceVariant }}>
              {t.label}
            </Text>
          </Wrapper>
        );
      })}
    </View>
  );
};

export default ProfileStats;
