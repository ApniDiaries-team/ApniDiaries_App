import { Image, Pressable, Text, TouchableOpacity, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { getProfilePhotoUrl } from "../../../helper/DefaultImageUrl";

const ProfileHeader = ({
  profileData,
  onEditProfile,
  onShareProfile,
  onFollowersClick,
  onFollowingClick,
}) => {

  return (
    <View className="px-4 pb-4">
      {/* Avatar — centered, overlapping cover photo */}
      <View className="items-center -mt-[52px]">
        <View className="relative">
          <View className="w-[100px] h-[100px] rounded-full overflow-hidden border-4 border-profile-primary dark:border-profile-primary-dark bg-profile-card dark:bg-profile-card-dark shadow-lg elevation-6">
            <Image
              source={{
                uri: getProfilePhotoUrl(profileData?.user?.profile_photo),
              }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
          {/* Online dot */}
          <View className="absolute bottom-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-profile-primary dark:border-profile-primary-dark" />
        </View>
      </View>

      {/* Name, username, location — centered */}
      <View className="items-center mt-3">
        <Text className="text-2xl font-playfair-bold text-profile-text-primary dark:text-profile-text-primary-dark">
          {profileData?.user?.name}
        </Text>
        <Text className="text-sm text-profile-text-secondary dark:text-profile-text-secondary-dark mt-0.5">
          @{profileData?.user?.username}
        </Text>
        <View className="flex-row items-center gap-1 mt-1">
          <Icon name="MapPin" size={16} className="text-profile-text-secondary dark:text-profile-text-secondary-dark" />
          <Text className="text-sm text-profile-text-secondary dark:text-profile-text-secondary-dark">
            {profileData?.city}
          </Text>
        </View>

        {/* Followers / Following */}
        <View className="flex-row gap-8 mt-4">
          <Pressable
            onPress={onFollowersClick}
            className="items-center"
          >
            <Text className="text-xl font-semibold text-profile-text-primary dark:text-profile-text-primary-dark">
              {profileData?.stats?.followers?.toLocaleString("en-IN") ?? 0}
            </Text>
            <Text className="text-[13px] text-profile-text-secondary dark:text-profile-text-secondary-dark">
              Followers
            </Text>
          </Pressable>
          <Pressable
            onPress={onFollowingClick}
            className="items-center"
          >
            <Text className="text-xl font-semibold text-profile-text-primary dark:text-profile-text-primary-dark">
              {profileData?.stats?.following?.toLocaleString("en-IN") ?? 0}
            </Text>
            <Text className="text-[13px] text-profile-text-secondary dark:text-profile-text-secondary-dark">
              Following
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Action buttons — full width, stacked */}
      <View className="gap-2.5 mt-5">
        <TouchableOpacity
          onPress={onEditProfile}
          activeOpacity={0.7}
          className="flex-row items-center justify-center gap-2 py-3.5 rounded-[20px] border border-profile-border dark:border-profile-border-dark bg-profile-secondary dark:bg-profile-secondary-dark"
        >
          <Icon
            name="Edit"
            size={16}
            className="text-profile-text-primary dark:text-profile-text-primary-dark"
          />
          <Text className="text-base font-medium text-profile-text-primary dark:text-profile-text-primary-dark">
            Edit Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onShareProfile}
          activeOpacity={0.7}
          className="flex-row items-center justify-center gap-2 py-3.5 rounded-[20px] border border-profile-border dark:border-profile-border-dark bg-profile-secondary dark:bg-profile-secondary-dark"
        >
          <Icon
            name="Share2"
            size={16}
            className="text-profile-text-primary dark:text-profile-text-primary-dark"
          />
          <Text className="text-base font-medium text-profile-text-primary dark:text-profile-text-primary-dark">
            Share Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileHeader;
