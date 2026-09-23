import { Pressable, Text, View } from "react-native";
import { Fonts } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";

const ProfileStats = ({ posts, followers, following, friends, onFollowersClick, onFollowingClick }) => {
  const { isDarkMode } = useDarkMode();
  const bg = isDarkMode ? "#1A1F29" : "#FFF1EC";
  const text = isDarkMode ? "#FFFFFF" : "#261913";
  const muted = isDarkMode ? "#A0AEC0" : "#594137";
  const accent = isDarkMode ? "#ED8936" : "#A23F00";
  const tiles = [
    { label: "Posts", value: posts },
    { label: "Followers", value: followers, onPress: onFollowersClick },
    { label: "Following", value: following, onPress: onFollowingClick },
    { label: "Friends", value: friends },
  ];

  return (
    <View style={{ paddingHorizontal: 18, marginTop: 20 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {tiles.map((tile) => (
          <Pressable
            key={tile.label}
            disabled={!tile.onPress}
            onPress={tile.onPress}
            style={{ width: "48%", minHeight: 82, alignItems: "center", justifyContent: "center", backgroundColor: bg, borderRadius: 17, paddingVertical: 12 }}
          >
            <Text style={{ color: accent, fontFamily: Fonts.playfair.bold, fontSize: 22 }}>
              {Number(tile.value || 0).toLocaleString("en-IN")}
            </Text>
            <Text style={{ color: muted, fontFamily: Fonts.inter.medium, fontSize: 11, marginTop: 2 }}>
              {tile.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default ProfileStats;
