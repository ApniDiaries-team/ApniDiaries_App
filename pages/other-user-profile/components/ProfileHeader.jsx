import { useEffect, useState } from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { Fonts } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";
import { getCoverPhotoUrl, getProfilePhotoUrl } from "../../../helper/DefaultImageUrl";
import { removeFriend, sendFriendRequest } from "../../../services/user.api";

const ProfileHeader = ({
  userData,
  isFollowing,
  isFriend,
  onFollowToggle,
  onFriendToggle,
  onMessageClick,
  onShareProfile,
  onMoreActions,
  canViewProfile = true,
}) => {
  const { isDarkMode } = useDarkMode();
  const [friendRequestStatus, setFriendRequestStatus] = useState("none");
  const palette = {
    background: isDarkMode ? "#0B0E14" : "#FFF8F6",
    card: isDarkMode ? "#1E242F" : "#FFFFFF",
    surface: isDarkMode ? "#1A1F29" : "#FFF1EC",
    text: isDarkMode ? "#FFFFFF" : "#261913",
    muted: isDarkMode ? "#A0AEC0" : "#594137",
    border: isDarkMode ? "#2D3748" : "#E1BFB2",
    accent: isDarkMode ? "#ED8936" : "#A23F00",
  };
  const profile = userData?.user;

  useEffect(() => {
    setFriendRequestStatus(userData?.friendStatus || "none");
  }, [userData?.friendStatus]);

  const handleFriendToggle = async () => {
    if (friendRequestStatus === "none") {
      setFriendRequestStatus("pending");
      try {
        const response = await sendFriendRequest(profile?.id);
        if (!response?.data?.success) setFriendRequestStatus("none");
        else Alert.alert("Request sent", `Friend request sent to ${profile?.name}.`);
      } catch {
        setFriendRequestStatus("none");
        Alert.alert("Could not send request", "Please try again.");
      }
      return;
    }
    if (friendRequestStatus === "pending") {
      setFriendRequestStatus("none");
      return;
    }
    if (friendRequestStatus === "accepted") {
      try {
        const response = await removeFriend(profile?.id);
        if (response?.data?.success) {
          setFriendRequestStatus("none");
          onFriendToggle?.();
        }
      } catch {
        Alert.alert("Could not remove friend", "Please try again.");
      }
    }
  };

  const friendLabel = friendRequestStatus === "pending"
    ? "Pending"
    : friendRequestStatus === "accepted"
      ? "Remove friend"
      : "Add friend";
  const friendIcon = friendRequestStatus === "pending"
    ? "Clock"
    : friendRequestStatus === "accepted"
      ? "UserCheck"
      : "UserPlus";

  const outlineAction = (icon, onPress, label) => (
    <Pressable
      key={label}
      onPress={onPress}
      accessibilityLabel={label}
      style={{ width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: palette.border, alignItems: "center", justifyContent: "center", backgroundColor: palette.card }}
    >
      <Icon name={icon} size={17} color={palette.text} />
    </Pressable>
  );

  return (
    <View style={{ backgroundColor: palette.background }}>
      <View style={{ height: 174, backgroundColor: palette.surface, overflow: "hidden", borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
        <Image source={{ uri: getCoverPhotoUrl(profile?.cover_photo) }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
      </View>

      <View style={{ paddingHorizontal: 18, marginTop: -42 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 13 }}>
          <View style={{ position: "relative" }}>
            <Image
              source={{ uri: getProfilePhotoUrl(profile?.profile_photo) }}
              style={{ width: 84, height: 84, borderRadius: 42, borderWidth: 4, borderColor: palette.background, backgroundColor: palette.surface }}
            />
            {userData?.isOnline && (
              <View style={{ position: "absolute", right: 3, bottom: 4, width: 15, height: 15, borderRadius: 8, backgroundColor: "#10B981", borderWidth: 2, borderColor: palette.background }} />
            )}
          </View>
          <View style={{ flex: 1, paddingBottom: 3 }}>
            <Text numberOfLines={1} style={{ color: palette.text, fontFamily: Fonts.playfair.bold, fontSize: 22 }}>{profile?.name || "Traveler"}</Text>
            {!!profile?.username && <Text numberOfLines={1} style={{ color: palette.accent, fontFamily: Fonts.inter.medium, fontSize: 12, marginTop: 1 }}>@{profile.username}</Text>}
            {!!userData?.location && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 5 }}>
                <Icon name="MapPin" size={13} color={palette.muted} />
                <Text numberOfLines={1} style={{ color: palette.muted, fontFamily: Fonts.inter.regular, fontSize: 12, flexShrink: 1 }}>{userData.location}</Text>
              </View>
            )}
          </View>
        </View>

        {!!profile?.bio && <Text style={{ marginTop: 14, color: palette.text, fontFamily: Fonts.inter.regular, fontSize: 13, lineHeight: 20 }}>{profile.bio}</Text>}

        {canViewProfile && userData?.mutualFriends?.length > 0 && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 9, marginTop: 14, padding: 11, borderRadius: 14, backgroundColor: palette.surface }}>
            <View style={{ flexDirection: "row" }}>
              {userData.mutualFriends.slice(0, 3).map((friend, index) => (
                <Image key={friend.id || index} source={{ uri: getProfilePhotoUrl(friend?.profile_photo || friend?.avatar) }} style={{ width: 28, height: 28, borderRadius: 14, marginLeft: index ? -7 : 0, borderWidth: 2, borderColor: palette.surface }} />
              ))}
            </View>
            <Text style={{ color: palette.muted, fontFamily: Fonts.inter.medium, fontSize: 11 }}>{userData.mutualFriends.length} mutual {userData.mutualFriends.length === 1 ? "friend" : "friends"}</Text>
          </View>
        )}

        {canViewProfile && userData?.commonCities?.length > 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 12 }}>
            {userData.commonCities.map((city) => (
              <View key={city} style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 18, backgroundColor: palette.surface }}>
                <Icon name="MapPin" size={12} color={palette.accent} />
                <Text style={{ color: palette.text, fontFamily: Fonts.inter.medium, fontSize: 11 }}>{city}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ flexDirection: "row", gap: 9, marginTop: 16 }}>
          <Pressable onPress={onFollowToggle} style={{ flex: 1, minHeight: 42, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, borderRadius: 24, backgroundColor: isFollowing ? "transparent" : palette.accent, borderWidth: isFollowing ? 1 : 0, borderColor: palette.border }}>
            <Icon name={isFollowing ? "UserMinus" : "UserPlus"} size={15} color={isFollowing ? palette.text : "#FFFFFF"} />
            <Text style={{ color: isFollowing ? palette.text : "#FFFFFF", fontFamily: Fonts.inter.semibold, fontSize: 12 }}>{isFollowing ? "Following" : "Follow"}</Text>
          </Pressable>
          <Pressable disabled={friendRequestStatus === "pending"} onPress={handleFriendToggle} style={{ flex: 1, minHeight: 42, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, borderRadius: 24, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.card, opacity: friendRequestStatus === "pending" ? 0.65 : 1 }}>
            <Icon name={friendIcon} size={15} color={palette.text} />
            <Text style={{ color: palette.text, fontFamily: Fonts.inter.semibold, fontSize: 12 }}>{friendLabel}</Text>
          </Pressable>
        </View>
        {canViewProfile && (
          <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
            {outlineAction("MessageCircle", onMessageClick, "Message")}
            {profile?.profile_sharing && outlineAction("Share2", onShareProfile, "Share profile")}
            {outlineAction("MoreVertical", onMoreActions, "More actions")}
          </View>
        )}

      </View>
    </View>
  );
};

export default ProfileHeader;
