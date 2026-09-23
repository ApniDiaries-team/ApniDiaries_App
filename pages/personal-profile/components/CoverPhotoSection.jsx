import * as ImagePicker from "expo-image-picker";
import { Image, Pressable, Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { Fonts } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";
import { getCoverPhotoUrl } from "../../../helper/DefaultImageUrl";

const CoverPhotoSection = ({ coverPhoto, onCoverPhotoChange, isEditing }) => {
  const { isDarkMode } = useDarkMode();
  const handlePickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        // Pass base64 like web's FileReader result
        onCoverPhotoChange?.(`data:image/jpeg;base64,${asset.base64}`);
      }
    } catch (error) {
      console.log("Image pick error:", error);
    }
  };

  return (
    <View className="relative w-full h-[180px] bg-gray-100 dark:bg-profile-secondary-dark border-b border-profile-border dark:border-profile-border-dark overflow-hidden rounded-b-xl">
      <Image
        source={{ uri: getCoverPhotoUrl(coverPhoto) }}
        className="w-full h-full"
        resizeMode="cover"
      />

      {isEditing && (
        <Pressable
          onPress={handlePickImage}
          style={{
            position: "absolute",
            right: 16,
            bottom: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 7,
            paddingHorizontal: 13,
            paddingVertical: 9,
            borderRadius: 22,
            backgroundColor: isDarkMode ? "rgba(11,14,20,0.82)" : "rgba(255,248,246,0.94)",
            borderWidth: 1,
            borderColor: isDarkMode ? "#2D3748" : "#E1BFB2",
          }}
        >
          <Icon name="Camera" size={15} color={isDarkMode ? "#ED8936" : "#A23F00"} />
          <Text style={{ fontFamily: Fonts.inter.semibold, fontSize: 11, color: isDarkMode ? "#FFFFFF" : "#261913" }}>
            Edit cover
          </Text>
        </Pressable>
      )}
    </View>
  );
};

export default CoverPhotoSection;
