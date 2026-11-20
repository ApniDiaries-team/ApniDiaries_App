import { useScroll } from "@/context/ScrollContext";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { usePathname, useRouter } from "expo-router";
import React, { useContext } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Fonts, Palette } from "../constants/theme";
import { AppContext } from "../context/AppContext";
import { useDarkMode } from "../context/DarkModeContext";

const AUTH_ROUTES = ["/login", "/signup", "/forgotPassword"];
const BOTTOM_TABS = [
  { id: "community", label: "Community", path: "/community-posts", icon: "home" },
  { id: "messages", label: "Messages", path: "/chat-list", icon: "message-circle" },
  { id: "search", label: "Search", path: "/search-user", icon: "search" },
  { id: "profile", label: "Profile", path: "/personal-profile", icon: "user" },
];

const BottomTab = ({ tab, active, color, isDarkMode, onPress }) => {
  const progress = React.useRef(new Animated.Value(active ? 1 : 0)).current;

  React.useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: active ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [active, progress]);

  const activeBackground = {
    opacity: progress,
    transform: [
      { scaleY: progress.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
    ],
  };
  const iconMotion = {
    transform: [
      { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [1, -1] }) },
      { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) },
    ],
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={tab.label}
      hitSlop={4}
      style={({ pressed }) => ({
        flex: 0,

        width: 72,
        height: 60,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.88 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <View style={{ width: "100%", height: 60, alignItems: "center", justifyContent: "center", paddingVertical: 2 }}>
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              top: 3,

              width: 80,
              height: 54,
              alignSelf: "center",

              borderRadius: 18,
              backgroundColor: isDarkMode ? "rgba(237,137,54,0.15)" : "#FFF1EC",
            },
            activeBackground,
          ]}
        />
        <View style={{ width: "100%", height: 30, alignItems: "center", justifyContent: "center" }}>
          <Animated.View style={iconMotion}>
            <Feather name={tab.icon} size={21} color={color} />
          </Animated.View>
        </View>
        {active && (
          <Animated.View style={{ opacity: progress, width: 80, alignSelf: "center", paddingHorizontal: 2 }}>
            <Text
              numberOfLines={1}
              allowFontScaling={false}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
              style={{
                textAlign: "center",
                includeFontPadding: false,
                fontSize: 11,
                lineHeight: 18,
                fontFamily: Fonts.inter.bold,
                color,
              }}
            >
              {tab.label}
            </Text>
          </Animated.View>
        )}
      </View>
    </Pressable>
  );
};

const BottomNavBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isBootstrapped } = useContext(AppContext) || { user: null, isBootstrapped: false };
  const { isDarkMode } = useDarkMode();
  const { isScrolling } = useScroll();
  const insets = useSafeAreaInsets();

  if (!isBootstrapped || !user || AUTH_ROUTES.includes(pathname)) return null;

  const surface = isDarkMode ? Palette.dark.surfaceContainer : Palette.light.surfaceLowest;
  const outline = isDarkMode ? Palette.dark.outlineVariant : Palette.light.outlineVariant;
  const bottomSpace = Math.max(insets.bottom, 12);

  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        paddingHorizontal: 10,
        paddingTop: 4,
        paddingBottom: bottomSpace,
        backgroundColor: "transparent",
      }}
    >
      <View
        style={{
          width: "100%",
          height: 64,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          backgroundColor: surface,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: outline,
          shadowColor: "#261913",
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: isScrolling ? 0.16 : 0.1,
          shadowRadius: 12,
          elevation: 9,
        }}
      >
        {BOTTOM_TABS.map((tab) => {
          const isActive = pathname === tab.path || pathname.startsWith(`${tab.path}/`) ||
            (tab.id === "messages" && pathname.startsWith("/chat-interface")) ||
            (tab.id === "community" && pathname.startsWith("/create-post")) ||
            (tab.id === "profile" && ["/other-user-profile", "/followers", "/following", "/edit-personal-details"].some((route) => pathname.startsWith(route)));
          const tabColor = isActive
            ? (isDarkMode ? Palette.dark.primary : Palette.light.primary)
            : (isDarkMode ? Palette.dark.textVariant : Palette.light.textVariant);

          return (
            <BottomTab
              key={tab.id}
              tab={tab}
              active={isActive}
              color={tabColor}
              isDarkMode={isDarkMode}
              onPress={() => {
                if (isActive) return;
                Haptics.selectionAsync().catch(() => {});
                router.navigate(tab.path);
              }}
            />
          );
        })}
      </View>
    </View>
  );
};

export default BottomNavBar;
