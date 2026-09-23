import { Image, View } from "react-native";
import { getCoverPhotoUrl } from "../../../helper/DefaultImageUrl";

// Mirrors web pages/other-user-profile/components/CoverPhotoSection.jsx.
const CoverPhotoSection = ({ coverPhoto }) => (
  <View style={{ height: 160, overflow: "hidden" }}>
    <Image
      source={{ uri: getCoverPhotoUrl(coverPhoto) }}
      style={{ width: "100%", height: "100%" }}
      resizeMode="cover"
    />
  </View>
);

export default CoverPhotoSection;
