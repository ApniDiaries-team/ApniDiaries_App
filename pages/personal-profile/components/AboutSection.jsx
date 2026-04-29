import { Text, View } from "react-native";
import Icon from "../../../components/AppIcon";

const AboutSection = ({ userData }) => {
  const aboutItems = [
    { icon: "Mail", label: "Email", value: userData?.email },
    { icon: "Phone", label: "Phone", value: userData?.phone || "-" },
    {
      icon: "Calendar",
      label: "Joined",
      value: userData?.created_at
        ? new Date(userData.created_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
        : "-",
    },
    { icon: "MapPin", label: "Current City", value: userData?.city },
  ];

  const cardClasses = "bg-profile-card dark:bg-profile-card-dark rounded-xl p-4 border border-profile-border dark:border-profile-border-dark mb-4";

  return (
    <View>
      {/* About Me */}
      <View className={cardClasses}>
        <Text className="text-lg font-playfair-bold text-profile-text-primary dark:text-profile-text-primary-dark mb-3">
          About Me
        </Text>
        <Text className="text-sm text-profile-text-secondary dark:text-profile-text-secondary-dark leading-5">
          {userData?.bio}
        </Text>
      </View>

      {/* Contact Information */}
      <View className={cardClasses}>
        <Text className="text-lg font-playfair-bold text-profile-text-primary dark:text-profile-text-primary-dark mb-4">
          Contact Information
        </Text>
        <View className="gap-4">
          {aboutItems.map((item, index) => (
            <View
              key={index}
              className="flex-row items-center gap-3"
            >
              <View className="w-10 h-10 rounded-lg bg-profile-secondary dark:bg-profile-secondary-dark items-center justify-center border border-profile-border dark:border-profile-border-dark">
                <Icon
                  name={item.icon}
                  size={20}
                  className="text-profile-indicator dark:text-profile-indicator-dark"
                />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] uppercase tracking-wider text-profile-text-secondary dark:text-profile-text-secondary-dark mb-0.5">
                  {item.label}
                </Text>
                <Text
                  className="text-sm font-medium text-profile-text-primary dark:text-profile-text-primary-dark"
                  numberOfLines={1}
                >
                  {item.value}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Travel Preferences */}
      <View className={cardClasses}>
        <Text className="text-lg font-playfair-bold text-profile-text-primary dark:text-profile-text-primary-dark mb-4">
          Travel Preferences
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {userData?.interest?.map((preference, index) => (
            <View
              key={index}
              className="px-3 py-1.5 bg-profile-secondary dark:bg-profile-secondary-dark rounded-full border border-profile-border dark:border-profile-border-dark"
            >
              <Text className="text-xs font-medium text-profile-indicator dark:text-profile-indicator-dark">
                {preference}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default AboutSection;
