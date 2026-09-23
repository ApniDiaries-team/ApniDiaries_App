import { useScroll } from "@/context/ScrollContext";
import { Feather } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useContext } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Fonts } from "../constants/theme";
import { AppContext } from "../context/AppContext";
import { useDarkMode } from "../context/DarkModeContext";
const AUTH_ROUTES = ["/login", "/signup", "/forgotPassword"];
const BOTTOM_TABS = [
  {
    id: "community",
    label: "Community",
    path: "/community-posts",
    icon: "home",
  },
  { id: "messages", label: "Messages", path: "/chat-list", icon: "send" },
  {
    id: "search",
    label: "Search",
    path: "/search-user",
    icon: "search",
  },
  { id: "profile", label: "Profile", path: "/personal-profile", icon: "user" },
];

const BottomNavBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isBootstrapped } = useContext(AppContext) || {
    user: null,
    isBootstrapped: false,
  };
  const { isDarkMode } = useDarkMode();
  const { isScrolling } = useScroll();
  if (!isBootstrapped || !user) return null;
  if (AUTH_ROUTES.includes(pathname)) return null;
  return (
    <View
      style={{
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: isDarkMode ? "#0b0e14" : "#ffffff",
        borderTopWidth: 0.2,
        borderTopColor: isDarkMode ? "2D3748" : "rgba(0,0,0,0.08)",
        ...(isScrolling
          ? {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4,
          }
          : undefined),
      }}
    >
      <SafeAreaView edges={["bottom"]}>
        <View
          style={{
            top: 5,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around",
            height: 45,
            paddingBottom: 4,
          }}
        >
          {BOTTOM_TABS.map((tab) => {
            const isActive = pathname === tab.path;
            const tabColor = isActive
              ? "#f97316"
              : isDarkMode
                ? "#9ca3af"
                : "#6b7280";
            return (
              <Pressable
                key={tab.id}
                onPress={() => router.push(tab.path)}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  opacity: 1,
                }}
              >
                <Feather
                  name={tab.icon}
                  size={24}
                  color={tabColor}
                  style={{ marginBottom: 4 }}
                />
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: isActive
                      ? Fonts.inter.bold
                      : Fonts.inter.semibold,
                    paddingLeft: 6,
                    color: tabColor,
                  }}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
};

export default BottomNavBar;
