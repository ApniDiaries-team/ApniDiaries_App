import { Image, Pressable, Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { Fonts } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";
import { getProfilePhotoUrl } from "../../../helper/DefaultImageUrl";

const ProfileHeader = ({
  profileData,
  onEditProfile,
  onShareProfile,
  onFollowersClick,
  onFollowingClick,
}) => {
  const { isDarkMode } = useDarkMode();
  const bg = isDarkMode ? "#0B0E14" : "#FFF8F6";
  const surface = isDarkMode ? "#1A1F29" : "#FFF1EC";
  const text = isDarkMode ? "#FFFFFF" : "#261913";
  const muted = isDarkMode ? "#A0AEC0" : "#594137";
  const border = isDarkMode ? "#2D3748" : "#E1BFB2";
  const person = profileData?.user;
  const stats = [
    { label: "Posts", value: profileData?.stats?.totalPosts },
    { label: "Followers", value: profileData?.stats?.followers, onPress: onFollowersClick },
    { label: "Following", value: profileData?.stats?.following, onPress: onFollowingClick },
  ];

  const actionButton = (label, icon, onPress) => (
    <Pressable
      key={label}
      onPress={onPress}
      style={{
        flex: 1,
        minHeight: 44,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        paddingHorizontal: 10,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: border,
        backgroundColor: surface,
      }}
    >
      <Icon name={icon} size={15} color={text} />
      <Text style={{ color: text, fontFamily: Fonts.inter.semibold, fontSize: 12 }}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={{ paddingHorizontal: 18, marginTop: -42 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 14 }}>
        <View style={{ position: "relative" }}>
          <Image
            source={{ uri: getProfilePhotoUrl(person?.profile_photo) }}
            style={{
              width: 86,
              height: 86,
              borderRadius: 43,
              borderWidth: 4,
              borderColor: bg,
              backgroundColor: surface,
            }}
          />
          <View style={{ position: "absolute", right: 4, bottom: 5, width: 14, height: 14, borderRadius: 7, backgroundColor: "#10B981", borderWidth: 2, borderColor: bg }} />
        </View>
        <View style={{ flex: 1, paddingBottom: 3 }}>
          <Text numberOfLines={1} style={{ color: text, fontFamily: Fonts.playfair.bold, fontSize: 22 }}>
            {person?.name || "Traveler"}
          </Text>
          {!!person?.username && (
            <Text numberOfLines={1} style={{ color: ACCENT, fontFamily: Fonts.inter.medium, fontSize: 12, marginTop: 1 }}>
              @{person.username}
            </Text>
          )}
          {!!profileData?.city && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 5 }}>
              <Icon name="MapPin" size={13} color={muted} />
              <Text numberOfLines={1} style={{ color: muted, fontFamily: Fonts.inter.regular, fontSize: 12, flexShrink: 1 }}>
                {profileData.city}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={{ flexDirection: "row", marginTop: 20, paddingVertical: 14, borderTopWidth: 1, borderBottomWidth: 1, borderColor: border }}>
        {stats.map((item, index) => {
          const Content = (
            <>
              <Text style={{ color: text, fontFamily: Fonts.inter.bold, fontSize: 16 }}>
                {(item.value || 0).toLocaleString("en-IN")}
              </Text>
              <Text style={{ color: muted, fontFamily: Fonts.inter.regular, fontSize: 11, marginTop: 2 }}>{item.label}</Text>
            </>
          );
          return item.onPress ? (
            <Pressable key={item.label} onPress={item.onPress} style={{ flex: 1, alignItems: "center", borderRightWidth: index < 2 ? 1 : 0, borderColor: border }}>
              {Content}
            </Pressable>
          ) : (
            <View key={item.label} style={{ flex: 1, alignItems: "center", borderRightWidth: index < 2 ? 1 : 0, borderColor: border }}>
              {Content}
            </View>
          );
        })}
      </View>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
        {actionButton("Edit profile", "Edit", onEditProfile)}
        {actionButton("Share profile", "Share2", onShareProfile)}
      </View>
    </View>
  );
};

const ACCENT = "#A23F00";

export default ProfileHeader;
