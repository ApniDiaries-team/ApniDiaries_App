import { Text, View } from "react-native";
import Icon from "../../../components/AppIcon";

const TravelStatsSection = ({ stats }) => {
  const statCards = [
    {
      icon: "MapPin",
      label: "Cities Visited",
      value: stats?.citiesVisited,
      iconColor: "#3B82F6",
      bgClass: "bg-blue-500/10 dark:bg-blue-500/20",
    },
    {
      icon: "Globe",
      label: "Countries Explored",
      value: stats?.countriesExplored,
      iconColor: "#8B5CF6",
      bgClass: "bg-purple-500/10 dark:bg-purple-500/20",
    },
    {
      icon: "Calendar",
      label: "Travel Days",
      value: stats?.travelDays,
      iconColor: "#10B981",
      bgClass: "bg-emerald-500/10 dark:bg-emerald-500/20",
    },
    {
      icon: "Users",
      label: "Travel Buddies",
      value: stats?.travelBuddies,
      iconColor: "#EF4444",
      bgClass: "bg-red-500/10 dark:bg-red-500/20",
    },
  ];

  const cardClasses =
    "bg-profile-card dark:bg-profile-card-dark rounded-xl p-4 border border-profile-border dark:border-profile-border-dark mb-4";

  return (
    <View>
      {/* Stat cards — 2-column grid */}
      <View className="flex-row flex-wrap gap-3 mb-4">
        {statCards.map((stat, index) => (
          <View
            key={index}
            className={`${cardClasses} flex-1 min-w-[45%] mb-0`}
          >
            <View
              className={`w-12 h-12 rounded-xl ${stat.bgClass} items-center justify-center mb-3 border border-profile-border dark:border-profile-border-dark`}
            >
              <Icon name={stat.icon} size={24} color={stat.iconColor} />
            </View>
            <Text className="text-3xl font-playfair-bold text-profile-text-primary dark:text-profile-text-primary-dark">
              {stat.value?.toLocaleString("en-IN") || 0}
            </Text>
            <Text className="text-xs text-profile-text-secondary dark:text-profile-text-secondary-dark mt-1">
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Recent Destinations */}
      <View className={cardClasses}>
        <Text className="text-lg font-playfair-bold text-profile-text-primary dark:text-profile-text-primary-dark mb-4">
          Recent Destinations
        </Text>
        <View className="gap-2">
          {stats?.recentDestinations?.map((destination, index) => (
            <View
              key={index}
              className="flex-row items-center justify-between p-3"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-lg bg-profile-secondary dark:bg-profile-secondary-dark items-center justify-center border border-profile-border dark:border-profile-border-dark">
                  <Icon
                    name="MapPin"
                    size={20}
                    className="text-profile-indicator dark:text-profile-indicator-dark"
                  />
                </View>
                <View>
                  <Text className="text-sm font-medium text-profile-text-primary dark:text-profile-text-primary-dark">
                    {destination?.city}
                  </Text>
                  <Text className="text-xs text-profile-text-secondary dark:text-profile-text-secondary-dark">
                    {destination?.country}
                  </Text>
                </View>
              </View>
              <Text className="text-xs text-profile-text-secondary dark:text-profile-text-secondary-dark">
                {new Date(destination.visitDate)?.toLocaleDateString("en-IN", {
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Travel Achievements */}
      <View className={cardClasses}>
        <Text className="text-lg font-playfair-bold text-profile-text-primary dark:text-profile-text-primary-dark mb-4">
          Travel Achievements
        </Text>
        <View className="gap-3">
          {stats?.achievements?.map((achievement, index) => (
            <View
              key={index}
              className="flex-row items-center gap-3 p-3 rounded-xl bg-profile-secondary dark:bg-profile-secondary-dark border border-profile-border dark:border-profile-border-dark"
            >
              <View className="w-10 h-10 rounded-full bg-profile-card dark:bg-profile-card-dark items-center justify-center border border-profile-border dark:border-profile-border-dark">
                <Icon
                  name="Award"
                  size={20}
                  className="text-amber-500 dark:text-amber-400"
                />
              </View>
              <View className="flex-1">
                <Text
                  className="text-sm font-medium text-profile-text-primary dark:text-profile-text-primary-dark mb-0.5"
                  numberOfLines={1}
                >
                  {achievement?.title}
                </Text>
                <Text className="text-xs text-profile-text-secondary dark:text-profile-text-secondary-dark">
                  {achievement?.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default TravelStatsSection;
