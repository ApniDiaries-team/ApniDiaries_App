import { Stack, usePathname } from "expo-router";
import "react-native-get-random-values";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import BottomNavBar from "../components/BottomNavBar";
import NavBar from "../components/NavBar";
import AppContextProvider from "../context/AppContext";
import { DarkModeProvider } from "../context/DarkModeContext";
import { NotificationProvider } from "../context/NotificationContext";
import { ScrollProvider } from "../context/ScrollContext";
import "../global.css";
import { CallProvider } from "../pages/call-interface/context/CallContext";

export default function RootLayout() {
  const pathname = usePathname();

  // Exact match for public or specific routes
  const hideNavRoutesExact = [
    "/",
    "/home",
    "/login",
    "/signup",
    "/forgot-password",
    "/terms-and-conditions",
  ];
  // Substring match for feature routes
  const hideNavRoutesIncludes = ["/chat-interface", "/calls"];

  const shouldHideNav =
    hideNavRoutesExact.includes(pathname) ||
    hideNavRoutesIncludes.some((route) => pathname.includes(route));

  return (
    <SafeAreaProvider>
      <DarkModeProvider>
        <AppContextProvider>
          <NotificationProvider>
            <ScrollProvider>
              <CallProvider>
                <>
                  <Stack
                    screenOptions={{
                      headerShown: !shouldHideNav,
                      header: () => <NavBar />,
                    }}
                  >
                    <Stack.Screen
                      name="index"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="(public)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen name="(protected)" />
                  </Stack>
                  {!shouldHideNav && <BottomNavBar />}
                  <Toast />
                </>
              </CallProvider>
            </ScrollProvider>
          </NotificationProvider>
        </AppContextProvider>
      </DarkModeProvider>
    </SafeAreaProvider>
  );
}
