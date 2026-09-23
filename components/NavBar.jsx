import { Feather } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { Dimensions, Image, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "../api/axios";
import Logo from "../assets/Apni diaries logo 1.png";
import { Fonts } from "../constants/theme";
import { AppContext } from "../context/AppContext";
import { useDarkMode } from "../context/DarkModeContext";
import { useNotifications } from "../context/NotificationContext";
import { useScroll } from "../context/ScrollContext";
import ComingSoonModal from "./common/ComingSoonModal";
import DarkModeToggle from "./common/DarkModeToggle";

const { height } = Dimensions.get("window");
const AUTH_ROUTES = ["/login", "/signup", "/forgotPassword"];

const NavBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, backendUrl, setUser, isBootstrapped } = useContext(
    AppContext,
  ) || {
    user: null,
    isBootstrapped: false,
  };
  const insets = useSafeAreaInsets();
  const { isDarkMode, setDarkMode } = useDarkMode();
  const { unreadCount } = useNotifications();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { isScrolling } = useScroll();
  const isUserLoggedIn = Boolean(user);
  if (!isBootstrapped) return null;

  if (AUTH_ROUTES.includes(pathname)) return null;
  const MenuItem = ({ label, onPress, danger, primary }) => {
    return (
      <Pressable
        onPress={onPress}
        className={`py-3 ${primary ? "bg-brand-600 rounded-lg p-3 mt-2" : ""}`}
        style={({ pressed }) => [pressed && { opacity: 0.6 }]}
      >
        <Text
          className={`text-base ${danger ? "text-red-500" : primary ? "text-white" : "text-brand-600"}`}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  const onLogout = async () => {
    try {
      await api.post(
        `${backendUrl}/api/user/logout`,
        {},
        { withCredentials: true },
      );
    } catch (e) {
      console.log(e.message);
    } finally {
      // setDarkMode(false); // Optional: reset theme on logout
      setUser(null);
      setMenuOpen(false);
      router.replace("/login");
    }
  };

  const navigateTo = (path) => {
    setMenuOpen(false);
    router.push(path);
  };
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isScrolling) {
      setMenuOpen(false);
    }
  }, [isScrolling]);
  return (
    <>
      <View
        style={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          height: 45 + insets.top,
          paddingHorizontal: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: isDarkMode ? "#0b0e14" : "#FFFFFF",
          zIndex: 20,
          borderBottomWidth: 0.2,
          borderBottomColor: isDarkMode ? "#2D3748" : "rgba(0,0,0,0.05)",
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
        {/* Logo */}
        <Pressable onPress={() => router.push("/community-posts")}>
          <Image
            source={Logo}
            style={{
              height: 45,
              width: 90,
              marginLeft: -10,
              tintColor: isDarkMode && isUserLoggedIn ? "#FFFFFF" : undefined,
            }}
            resizeMode="contain"
          />
        </Pressable>

        {/* Right actions */}
        <View className="flex-row items-center gap-5">
          {/* {isUserLoggedIn && (
            <>
              <Pressable onPress={() => router.push("/cities")}>
                <Feather
                  name="message-circle"
                  size={22}
                  color={iconColor(isDarkMode, isUserLoggedIn)}
                />
              </Pressable>

              <Pressable onPress={() => router.push("/notifications")}>
                <Feather
                  name="bell"
                  size={22}
                  color={iconColor(isDarkMode, isUserLoggedIn)}
                />
                <View className="absolute top-[-2px] right-[-2px] h-2 w-2 rounded-full bg-red-500" />
              </Pressable>
            </>
          )} */}

          <Pressable
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => {
              const isProfilePage = pathname.includes("personal-profile");
              if (menuOpen) {
                setMenuOpen(false);
              } else if (isProfilePage) {
                setMenuOpen(true);
              } else {
                router.push("/notifications");
              }
            }}
          >
            {menuOpen ? (
              <Feather
                name="x"
                size={26}
                color={iconColor(isDarkMode, isUserLoggedIn)}
              />
            ) : pathname.includes("personal-profile") ? (
              <Feather
                name="menu"
                size={26}
                color={iconColor(isDarkMode, isUserLoggedIn)}
              />
            ) : (
              // Fixed-size, overflow-visible wrapper: on iOS a bare <View> that
              // sizes itself purely from the icon glyph's own font metrics can
              // end up with a tighter bounding box than on Android, clipping
              // the badge (or part of the icon itself) that is positioned
              // absolutely relative to it. Giving it an explicit box matching
              // the icon size, with overflow left visible, guarantees both the
              // icon and the badge always have room to render fully.
              <View
                style={{
                  width: 26,
                  height: 26,
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "visible",
                }}
              >
                <Feather
                  name="heart"
                  size={26}
                  color={iconColor(isDarkMode, isUserLoggedIn)}
                />
                {unreadCount > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      backgroundColor: "#ef4444",
                      borderRadius: 10,
                      minWidth: 16,
                      height: 16,
                      paddingHorizontal: 4,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1.5,
                      borderColor: isDarkMode ? "#0b0e14" : "#FFFFFF",
                    }}
                  >
                    <Text
                      style={{
                        color: "#FFFFFF",
                        fontSize: 8,
                        fontWeight: "700",
                      }}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* Hamburger Menu Overlay */}
      {menuOpen && (
        <>
          <Pressable
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99,
            }}
            onPress={() => setMenuOpen(false)}
          />
          {isUserLoggedIn ? (
            /* Fullscreen Menu for Logged-in Users */
            <>
              <View
                className="absolute top-0 left-0 right-0 z-[100]"
                style={{
                  flex: 1,
                  backgroundColor: isDarkMode ? "#0b0e14" : "#ffffff",
                }}
              >
                {/* Internal Header */}
                <View
                  className="flex-row justify-between items-center px-5"
                  style={{ height: 70 + insets.top, paddingTop: insets.top }}
                >
                  <Pressable
                    onPress={() => {
                      setMenuOpen(false);
                      router.push("/home");
                    }}
                  >
                    <Image
                      source={Logo}
                      style={{
                        height: 70,
                        width: 110,
                        left: -15,
                        tintColor: isDarkMode ? "#fff" : undefined,
                      }}
                      resizeMode="contain"
                    />
                  </Pressable>

                  <Pressable onPress={() => setMenuOpen(false)}>
                    <Feather
                      name="x"
                      size={28}
                      color={isDarkMode ? "#fff" : "#ea580c"}
                    />
                  </Pressable>
                </View>

                {/* Menu Content */}
                <View className="px-5 py-4">
                  {/* User Info Header */}
                  <View
                    style={{
                      backgroundColor: isDarkMode
                        ? "rgba(31, 41, 55, 0.5)"
                        : "#fff7ed",
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 24,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    <View
                      style={{
                        height: 56,
                        width: 56,
                        borderRadius: 28,
                        overflow: "hidden",
                        backgroundColor: "#f97316",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {user?.avatar ? (
                        <Image
                          source={{ uri: user.avatar }}
                          style={{ height: "100%", width: "100%" }}
                          resizeMode="cover"
                        />
                      ) : (
                        <Feather name="user" size={28} color="#fff" />
                      )}
                    </View>
                    <View>
                      <Text
                        style={{
                          fontFamily: Fonts.playfair.bold,
                          fontSize: 20,
                          color: isDarkMode ? "#fff" : "#111827",
                        }}
                      >
                        {user?.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: isDarkMode ? "#d1d5db" : "#4b5563",
                        }}
                      >
                        {user?.email}
                      </Text>
                    </View>
                  </View>

                  {/* Menu Items */}
                  {[
                    { id: "home", label: "Home", path: "/" },
                    { id: "trips", label: "Trips", path: "/trips" },
                    { id: "cities", label: "Cities", path: "/cities" },
                    { id: "settings", label: "Settings", path: "/settings" },
                    {
                      id: "contact-us",
                      label: "Contact Us",
                      path: "/contact-us",
                    },
                  ].map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => {
                        navigateTo(item.path);
                        setMenuOpen(false);
                      }}
                      className="py-4"
                    >
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "500",
                          color: isDarkMode ? "#e5e7eb" : "#374151",
                        }}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  ))}

                  {/* Divider Line */}
                  <View
                    className="my-2 h-[1px]"
                    style={{
                      backgroundColor: isDarkMode ? "#374151" : "#f3f4f6",
                    }}
                  />

                  {/* Dark Mode Row */}
                  <View className="flex-row justify-between items-center py-4">
                    <Text
                      style={{
                        fontWeight: "500",
                        fontSize: 16,
                        color: isDarkMode ? "#e5e7eb" : "#374151",
                      }}
                    >
                      Dark Mode
                    </Text>
                    <DarkModeToggle />
                  </View>

                  {/* Logout Button */}
                  <Pressable onPress={onLogout} className="py-4 items-center">
                    <Text
                      style={{
                        fontWeight: "600",
                        fontSize: 16,
                        color: "#ef4444",
                      }}
                    >
                      Logout
                    </Text>
                  </Pressable>
                </View>
              </View>
            </>
          ) : (
            /* Guest Menu Overlay (Slide in below navbar) */
            <>
              {/* Overlay BELOW navbar */}
              <Pressable
                className="absolute top-[79px] left-0 right-0 bottom-0 z-10"
                onPress={() => setMenuOpen(false)}
              />
              {/* Floating menu card */}
              <View className="absolute top-[80px] left-0 right-0 items-center z-[11]">
                <View
                  className={`w-[100%] bg-white p-5 shadow-xl ${isDarkMode ? "bg-dark-card" : ""}`}
                >
                  <MenuItem
                    label="Log In"
                    onPress={() => navigateTo("/login")}
                  />

                  <Pressable
                    className="mt-4 bg-brand-600 py-[14px] rounded-xl items-center"
                    onPress={() => navigateTo("/signup")}
                  >
                    <Text className="text-white text-base font-semibold">
                      Join Now!
                    </Text>
                  </Pressable>
                </View>
              </View>
            </>
          )}
        </>
      )}

      <ComingSoonModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};

export default NavBar;

const iconColor = (dark, isLoggedIn) =>
  isLoggedIn && dark ? "#FFFFFF" : "#ea580c";