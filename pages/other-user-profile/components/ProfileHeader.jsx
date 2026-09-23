import { useEffect, useState } from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";

import Icon from "../../../components/AppIcon";
import { useDarkMode } from "../../../context/DarkModeContext";

import {
  getCoverPhotoUrl,
  getProfilePhotoUrl,
} from "../../../helper/DefaultImageUrl";

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
  const { theme } = useDarkMode();

  const [friendRequestStatus, setFriendRequestStatus] = useState("none");

  useEffect(() => {
    if (userData?.friendStatus) {
      setFriendRequestStatus(userData.friendStatus);
    }
  }, [userData?.friendStatus]);

  const handleFriendToggle = async () => {
    if (friendRequestStatus === "none") {
      // Optimistic update first (matching web behavior)
      setFriendRequestStatus("pending");
      try {
        if (!isFriend) {
          const res = await sendFriendRequest(userData?.user?.id);
          if (res?.data?.success) {
            Alert.alert(
              "Success",
              `Friend request sent to ${userData?.user?.name}`,
            );
          }
        }
      } catch (error) {
        console.log(error);
      }
    } else if (friendRequestStatus === "pending") {
      // Web allows cancelling pending — revert to none
      setFriendRequestStatus("none");
    } else if (friendRequestStatus === "accepted") {
      try {
        const res = await removeFriend(userData?.user?.id);
        if (res?.data?.success) {
          Alert.alert("Friend removed");
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
      case "pending":
        return "Pending";
      case "accepted":
        return "Remove Friend";
      default:
        return "Add Friend";
    }
  };

  const getFriendIcon = () => {
    switch (friendRequestStatus) {
      case "pending":
        return "Clock";
      case "accepted":
        return "UserX";
      default:
        return "UserCheck"; // web uses UserCheck not UserPlus
    }
  };

  return (
    <View style={{ backgroundColor: theme.bgPrimary }}>
      {/* COVER */}
      <View style={{ height: 190 }}>
        <Image
          source={{ uri: getCoverPhotoUrl(userData?.user?.cover_photo) }}
          style={{
            width: "100%",
            height: "100%",
            borderBottomLeftRadius: 18,
            borderBottomRightRadius: 18,
          }}
          resizeMode="cover"
        />
      </View>

      {/* PROFILE CONTENT */}
      <View style={{ paddingHorizontal: 20 }}>
        {/* AVATAR */}
        <View
          style={{
            marginTop: -45,
            width: 90,
            height: 90,
            borderRadius: 45,
            overflow: "hidden",
            borderWidth: 4,
            borderColor: theme.bgPrimary,
          }}
        >
          <Image
            source={{
              uri: getProfilePhotoUrl(userData?.user?.profile_photo),
            }}
            style={{ width: "100%", height: "100%" }}
          />

          {/* Online Indicator */}
          {userData?.isOnline && (
            <View
              style={{
                position: "absolute",
                bottom: 4,
                right: 4,
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: "#22c55e",
                borderWidth: 2,
                borderColor: theme.bgPrimary,
              }}
            />
          )}
        </View>

        {/* NAME */}
        <Text
          style={{
            fontSize: 26,
            fontFamily: "PlayfairDisplay_700Bold",
            marginTop: 12,
            color: theme.textPrimary,
          }}
        >
          {userData?.user?.name}
        </Text>

        {/* USERNAME */}
        <Text
          style={{
            marginTop: 4,
            color: theme.textSecondary,
          }}
        >
          @{userData?.user?.username}
        </Text>

        {/* LOCATION */}
        {userData?.location && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 6,
            }}
          >
            <Icon name="MapPin" size={14} color={theme.textSecondary} />

            <Text
              style={{
                marginLeft: 4,
                color: theme.textSecondary,
              }}
            >
              {userData.location}
            </Text>
          </View>
        )}

        {/* BIO */}
        {userData?.user?.bio && (
          <Text
            style={{
              marginTop: 10,
              fontSize: 14,
              color: theme.textPrimary,
            }}
          >
            {userData.user.bio}
          </Text>
        )}

        {/* STATS */}
        <View
          style={{
            flexDirection: "row",
            marginTop: 18,
            justifyContent: "space-between",
            width: 220,
          }}
        >
          {[
            { label: "Posts", value: userData?.stats?.totalPosts },
            { label: "Followers", value: userData?.stats?.followers },
            { label: "Following", value: userData?.stats?.following },
          ].map((item, index) => (
            <View key={index} style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "600",
                  color: theme.textPrimary,
                }}
              >
                {item.value || 0}
              </Text>

              <Text
                style={{
                  fontSize: 12,
                  color: theme.textSecondary,
                }}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </View>

        {/* MUTUAL FRIENDS */}
        {userData?.mutualFriends?.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginTop: 16,
              padding: 12,
              borderRadius: 8,
              backgroundColor: theme.bgSecondary,
            }}
          >
            <View style={{ flexDirection: "row" }}>
              {userData.mutualFriends.slice(0, 3).map((friend, index) => (
                <Image
                  key={index}
                  source={{ uri: friend?.avatar }}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: theme.bgCard,
                    marginLeft: index === 0 ? 0 : -8,
                  }}
                  resizeMode="cover"
                />
              ))}
            </View>
            <Text style={{ fontSize: 12, color: theme.textSecondary }}>
              {userData.mutualFriends.length} mutual{" "}
              {userData.mutualFriends.length === 1 ? "friend" : "friends"}
            </Text>
          </View>
        )}

        {/* COMMON CITIES */}
        {userData?.commonCities?.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 12,
            }}
          >
            {userData.commonCities.map((city, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 999,
                  backgroundColor: theme.bgSecondary,
                }}
              >
                <Icon name="MapPin" size={14} color={theme.textPrimary} />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "500",
                    color: theme.textPrimary,
                  }}
                >
                  {city}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* BUTTON ROW 1 */}
        <View
          style={{
            flexDirection: "row",
            marginTop: 20,
            gap: 10,
          }}
        >
            {/* FOLLOW */}
            <Pressable
              onPress={onFollowToggle}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: "center",
                backgroundColor: isFollowing ? theme.bgSecondary : "#FF9933",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon
                  name={isFollowing ? "UserMinus" : "UserPlus"}
                  size={16}
                  color={isFollowing ? theme.textPrimary : "#fff"}
                />

                <Text
                  style={{
                    marginLeft: 6,
                    color: isFollowing ? theme.textPrimary : "#fff",
                    fontWeight: "500",
                  }}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Text>
              </View>
            </Pressable>

            {/* FRIEND */}
            <Pressable
              disabled={friendRequestStatus === "pending"}
              onPress={handleFriendToggle}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: "center",
                backgroundColor: theme.bgSecondary,
                opacity: friendRequestStatus === "pending" ? 0.6 : 1,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon
                  name={getFriendIcon()}
                  size={16}
                  color={theme.textPrimary}
                />

                <Text
                  style={{
                    marginLeft: 6,
                    color: theme.textPrimary,
                  }}
                >
                  {getFriendButtonText()}
                </Text>
              </View>
            </Pressable>
        </View>

        {/* BUTTON ROW 2 */}
        {canViewProfile && (
          <View
            style={{
              flexDirection: "row",
              marginTop: 10,
              gap: 10,
            }}
          >
            {/* MESSAGE — icon only, matches web ghost icon button */}
            <Pressable
              onPress={onMessageClick}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="MessageCircle" size={18} color={theme.textPrimary} />
            </Pressable>

            {/* SHARE — conditional on profile_sharing flag */}
            {userData?.user?.profile_sharing && (
              <Pressable
                onPress={onShareProfile}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#FF9933",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  gap: 6,
                }}
              >
                <Icon name="Share2" size={16} color="#FF9933" />
                <Text style={{ color: "#FF9933", fontWeight: "500" }}>Share</Text>
              </Pressable>
            )}

            <Pressable
              onPress={onMoreActions}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#FF9933",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 6,
              }}
            >
              <Icon name="MoreVertical" size={16} color="#FF9933" />
              <Text style={{ color: "#FF9933", fontWeight: "500" }}>More</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
};

export default ProfileHeader;
