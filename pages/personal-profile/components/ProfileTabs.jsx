import { Pressable, ScrollView, Text, View } from "react-native";

const ProfileTabs = ({ activeTab, onTabChange, postCount }) => {

  const tabs = [
    { id: "posts", label: "Posts", count: postCount },
    { id: "about", label: "About", count: null },
    { id: "stats", label: "Travel Stats", count: null },
  ];

  return (
    <View className="border-b border-profile-border dark:border-profile-border-dark bg-profile-primary dark:bg-profile-primary-dark">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-4"
      >
        <View className="flex-row gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => onTabChange(tab.id)}
                className="px-4 py-3.5 flex-row items-center gap-2 relative"
              >
                <Text
                  className={`text-sm font-medium ${isActive
                      ? "text-profile-text-primary dark:text-profile-text-primary-dark"
                      : "text-profile-text-secondary dark:text-profile-text-secondary-dark"
                    }`}
                >
                  {tab.label}
                </Text>

                {tab.count !== null && (
                  <View className="px-2 py-0.5 rounded-full bg-profile-secondary dark:bg-profile-secondary-dark">
                    <Text className="text-xs text-profile-text-secondary dark:text-profile-text-secondary-dark">
                      {tab.count}
                    </Text>
                  </View>
                )}

                {/* ✅ Active underline indicator — matches web's absolute bottom bar */}
                {isActive && (
                  <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-profile-indicator dark:bg-profile-indicator-dark rounded-sm" />
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileTabs;
