import * as ImagePicker from "expo-image-picker";
import { Image, View } from "react-native";
import { getCoverPhotoUrl } from "../../../helper/DefaultImageUrl";

const CoverPhotoSection = ({ coverPhoto, onCoverPhotoChange, isEditing }) => {
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

      {/* ✅ Edit overlay — matches web's hover overlay with camera icon + label */}

    </View>
  );
};

export default CoverPhotoSection;
