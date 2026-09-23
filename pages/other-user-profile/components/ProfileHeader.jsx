import { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";

import Icon from "../../../components/AppIcon";
import { Fonts } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";

import { getProfilePhotoUrl } from "../../../helper/DefaultImageUrl";
import { removeFriend, sendFriendRequest } from "../../../services/user.api";

// Mirrors web pages/other-user-profile/components/ProfileHeader.jsx
// (mobile-width rendering — cover photo renders separately via
// CoverPhotoSection, avatar+name overlaps it via negative margin).
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
  const { theme } = useDarkMode();
  const [friendRequestStatus, setFriendRequestStatus] = useState("none");

  useEffect(() => {
    if (userData?.friendStatus) setFriendRequestStatus(userData.friendStatus);
  }, [userData?.friendStatus]);

  const handleFriendToggle = async () => {
    if (friendRequestStatus === "none") {
      setFriendRequestStatus("pending");
      try {
        if (!isFriend) {
          const res = await sendFriendRequest(userData?.user?.id);
          if (res?.data?.success) {
            Toast.show({ type: "success", text1: `Friend request sent to ${userData?.user?.name}` });
          }
        }
      } catch (error) {
        console.log(error);
      }
    } else if (friendRequestStatus === "pending") {
      setFriendRequestStatus("none");
    } else if (friendRequestStatus === "accepted") {
      try {
        const res = await removeFriend(userData?.user?.id);
        if (res?.data?.success) {
          Toast.show({ type: "success", text1: "Friend removed" });
          setFriendRequestStatus("none");
        }
      } catch (error) {
        console.log(error);
      }
      onFriendToggle?.();
    }
  };

  const getFriendButtonText = () => {
    switch (friendRequestStatus) {
      case "pending": return "Pending";
      case "accepted": return "Remove Friend";
      default: return "Add Friend";
    }
  };
  const getFriendIcon = () => {
    switch (friendRequestStatus) {
      case "pending": return "Clock";
      case "accepted": return "UserX";
      default: return "UserCheck";
    }
  };

  const iconButtonStyle = {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.outline,
  };

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
              source={{ uri: getProfilePhotoUrl(userData?.user?.profile_photo) }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </View>
          {userData?.isOnline && (
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
          )}
        </View>

        <View style={{ flex: 1, paddingBottom: 4 }}>
          <Text style={{ fontFamily: Fonts.display.bold, fontSize: 21, color: theme.onSurface }} numberOfLines={1}>
            {userData?.user?.name}
          </Text>
          <Text style={{ fontSize: 14, color: theme.secondary || theme.onSurfaceVariant, marginTop: 1 }}>
            @{userData?.user?.username}
          </Text>
          {!!userData?.location && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
              <Icon name="MapPin" size={13} color={theme.onSurfaceVariant} />
              <Text style={{ fontSize: 12, color: theme.onSurfaceVariant }}>{userData.location}</Text>
            </View>
          )}
        </View>
      </View>

      {!!userData?.user?.bio && (
        <Text style={{ fontSize: 14, color: theme.onSurface, marginTop: 14, lineHeight: 21 }}>
          {userData.user.bio}
        </Text>
      )}

      {/* Mutual friends */}
      {userData?.mutualFriends?.length > 0 && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginTop: 14,
            padding: 12,
            borderRadius: 16,
            backgroundColor: theme.surfaceContainerLow,
          }}
        >
          <View style={{ flexDirection: "row" }}>
            {userData.mutualFriends.slice(0, 3).map((friend, index) => (
              <Image
                key={index}
                source={{ uri: friend?.avatar }}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 999,
                  borderWidth: 2,
                  borderColor: theme.surface,
                  marginLeft: index === 0 ? 0 : -8,
                }}
                resizeMode="cover"
              />
            ))}
          </View>
          <Text style={{ fontSize: 12, color: theme.onSurfaceVariant }}>
            {userData.mutualFriends.length} mutual {userData.mutualFriends.length === 1 ? "friend" : "friends"}
          </Text>
        </View>
      )}

      {/* Common cities */}
      {userData?.commonCities?.length > 0 && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          {userData.commonCities.map((city, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 999,
                backgroundColor: theme.surfaceContainerLow,
              }}
            >
              <Icon name="MapPin" size={12} color={theme.onSurface} />
              <Text style={{ fontSize: 12, color: theme.onSurface }}>{city}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Actions — mirrors web's flex-wrap button row */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 18 }}>
        <Pressable
          onPress={onFollowToggle}
          style={{
            flexGrow: 1,
            flexBasis: "45%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            paddingVertical: 11,
            borderRadius: 999,
            backgroundColor: isFollowing ? "transparent" : theme.primary,
            borderWidth: isFollowing ? 1 : 0,
            borderColor: theme.outline,
          }}
        >
          <Icon name={isFollowing ? "UserMinus" : "UserPlus"} size={16} color={isFollowing ? theme.onSurface : "#FFFFFF"} />
          <Text style={{ fontSize: 13, fontFamily: Fonts.body.semibold, color: isFollowing ? theme.onSurface : "#FFFFFF" }}>
            {isFollowing ? "Following" : "Follow"}
          </Text>
        </Pressable>

        <Pressable
          disabled={friendRequestStatus === "pending"}
          onPress={handleFriendToggle}
          style={{
            flexGrow: 1,
            flexBasis: "45%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            paddingVertical: 11,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: theme.outline,
            opacity: friendRequestStatus === "pending" ? 0.5 : 1,
          }}
        >
          <Icon name={getFriendIcon()} size={16} color={theme.onSurface} />
          <Text style={{ fontSize: 13, fontFamily: Fonts.body.semibold, color: theme.onSurface }}>
            {getFriendButtonText()}
          </Text>
        </Pressable>

        {canViewProfile && (
          <Pressable onPress={onMessageClick} style={iconButtonStyle}>
            <Icon name="MessageCircle" size={17} color={theme.onSurface} />
          </Pressable>
        )}
        {userData?.user?.profile_sharing && canViewProfile && (
          <Pressable onPress={onShareProfile} style={iconButtonStyle}>
            <Icon name="Share2" size={17} color={theme.onSurface} />
          </Pressable>
        )}
        {canViewProfile && (
          <Pressable onPress={onMoreActions} style={iconButtonStyle}>
            <Icon name="MoreVertical" size={17} color={theme.onSurface} />
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default ProfileHeader;
