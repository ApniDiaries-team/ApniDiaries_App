import { useScroll } from "@/context/ScrollContext";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { usePathname, useRouter } from "expo-router";
import React, { useContext } from "react";
import { Animated, Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Fonts, Palette } from "../constants/theme";
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
  { id: "messages", label: "Messages", path: "/chat-list", icon: "message-circle" },
  {
    id: "search",
    label: "Search",
    path: "/search-user",
    icon: "search",
  },
  { id: "profile", label: "Profile", path: "/personal-profile", icon: "user" },
];

const BottomTab = ({ tab, active, color, isDarkMode, onPress }) => {
  const progress = React.useRef(new Animated.Value(active ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(progress, {
      toValue: active ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [active, progress]);

  const indicatorStyle = {
    opacity: progress,
    transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] }) }],
  };
  const iconStyle = {
    transform: [
      { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, -1] }) },
      { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }) },
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
        flex: 1,
        minWidth: 0,
        minHeight: 60,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.78 : 1,
      })}
    >
      <View style={{ width: "100%", minHeight: 60, paddingVertical: 4, alignItems: "center", justifyContent: "center" }}>
        <View style={{ width: 52, height: 32, alignItems: "center", justifyContent: "center", marginBottom: 2 }}>
          <Animated.View
            pointerEvents="none"
            style={[
              { position: "absolute", width: 48, height: 30, borderRadius: 15, backgroundColor: isDarkMode ? "rgba(237,137,54,0.14)" : "#FFF1EC" },
              indicatorStyle,
            ]}
          />
          <Animated.View style={iconStyle}>
            <Feather name={tab.icon} size={22} color={color} />
          </Animated.View>
        </View>
        <Text
          numberOfLines={1}
          // iOS Dynamic Type + a tight lineHeight is what clips the glyphs, so
          // pin the scale, give the line real room and let it shrink if needed.
          allowFontScaling={false}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
          style={{
            alignSelf: "stretch",
            textAlign: "center",
            includeFontPadding: false,
            fontSize: 11,
            lineHeight: 18,
            paddingHorizontal: 2,
            paddingBottom: Platform.OS === "ios" ? 1 : 0,
            fontFamily: active ? Fonts.inter.bold : Fonts.inter.medium,
            color,
          }}
        >
          {tab.label}
        </Text>
      </View>
    </Pressable>
  );
};

const BottomNavBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isBootstrapped } = useContext(AppContext) || {
    user: null,
    isBootstrapped: false,
  };
  const { isDarkMode } = useDarkMode();
  const { isScrolling } = useScroll();
  const insets = useSafeAreaInsets();
  if (!isBootstrapped || !user) return null;
  if (AUTH_ROUTES.includes(pathname)) return null;
  return (
    <View
      style={{
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: isDarkMode ? Palette.dark.surface : Palette.light.surfaceLowest,
        borderTopWidth: 0.2,
        borderTopColor: isDarkMode ? Palette.dark.outlineVariant : Palette.light.outlineVariant,
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
      <View
        style={{
          width: "100%",
          paddingBottom: Platform.OS === "ios" ? Math.max(insets.bottom, 8) : insets.bottom,
          backgroundColor: isDarkMode ? Palette.dark.surface : Palette.light.surfaceLowest,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            minHeight: 64,
            paddingHorizontal: 12,
            paddingTop: 4,
          }}
        >
          {BOTTOM_TABS.map((tab) => {
            const isActive = pathname === tab.path || pathname.startsWith(`${tab.path}/`) ||
              (tab.id === "messages" && pathname.startsWith("/chat-interface")) ||
              (tab.id === "community" && pathname.startsWith("/create-post")) ||
              (tab.id === "profile" && ["/other-user-profile", "/followers", "/following", "/edit-personal-details"].some((route) => pathname.startsWith(route)));
            const tabColor = isActive
              ? (isDarkMode ? Palette.dark.primary : Palette.light.primary)
              : isDarkMode
                ? Palette.dark.textVariant
                : Palette.light.textVariant;
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
    </View>
  );
};

export default BottomNavBar;