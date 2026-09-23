import { Image, Pressable, Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { Fonts } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";
import { getProfilePhotoUrl } from "../../../helper/DefaultImageUrl";

// Mirrors web pages/personal-profile/components/ProfileHeader.jsx (mobile-
// width rendering: avatar + name sit in a row, action buttons follow below
// as an outline-pill pair — Followers/Following now live in ProfileStats).
const ProfileHeader = ({ profileData, onEditProfile, onShareProfile }) => {
  const { theme } = useDarkMode();

  return (
    <View style={{ paddingHorizontal: 16, marginTop: -48 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 14 }}>
        <View style={{ position: "relative" }}>
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 999,
              overflow: "hidden",
              borderWidth: 4,
              borderColor: theme.surface,
              backgroundColor: theme.surfaceContainerLow,
            }}
          >
            <Image
              source={{ uri: getProfilePhotoUrl(profileData?.user?.profile_photo) }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </View>
          <View
            style={{
              position: "absolute",
              bottom: 3,
              right: 3,
              width: 16,
              height: 16,
              borderRadius: 999,
              backgroundColor: "#10B981",
              borderWidth: 2,
              borderColor: theme.surface,
            }}
          />
        </View>

        <View style={{ flex: 1, paddingBottom: 4 }}>
          <Text
            style={{ fontFamily: Fonts.display.bold, fontSize: 21, color: theme.onSurface }}
            numberOfLines={1}
          >
            {profileData?.user?.name}
          </Text>
          <Text style={{ fontSize: 14, color: theme.secondary || theme.onSurfaceVariant, marginTop: 1 }}>
            @{profileData?.user?.username}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
            <Icon name="MapPin" size={13} color={theme.onSurfaceVariant} />
            <Text style={{ fontSize: 12, color: theme.onSurfaceVariant }}>{profileData?.city}</Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
        <Pressable
          onPress={onEditProfile}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            paddingVertical: 11,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: theme.outline,
          }}
        >
          <Icon name="Edit" size={15} color={theme.onSurface} />
          <Text style={{ fontSize: 13, fontFamily: Fonts.body.semibold, color: theme.onSurface }}>
            Edit Profile
          </Text>
        </Pressable>
        <Pressable
          onPress={onShareProfile}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            paddingVertical: 11,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: theme.outline,
          }}
        >
          <Icon name="Share2" size={15} color={theme.onSurface} />
          <Text style={{ fontSize: 13, fontFamily: Fonts.body.semibold, color: theme.onSurface }}>
            Share Profile
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default ProfileHeader;
