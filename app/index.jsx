import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_800ExtraBold,
} from "@expo-google-fonts/playfair-display";
import { useFonts } from "expo-font";
import { Redirect } from "expo-router";
import { useContext } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import "react-native-get-random-values";
import { Fonts, LightPalette } from "../constants/theme";
import { AppContext } from "../context/AppContext";

// NOTE: Do NOT override global.WebSocket here.
// socket.io-client handles React Native natively. Overriding it with RN's
// built-in WebSocket causes custom headers (Cookie/Authorization) to be
// silently dropped, making the server treat every socket as anonymous.

export default function Index() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_800ExtraBold,
  });

  const context = useContext(AppContext);
  const { user, isLoading, isBootstrapped } = context || {
    user: null,
    isLoading: true,
    isBootstrapped: false,
  };

  if (!fontsLoaded || isLoading || !isBootstrapped) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: LightPalette.surface,
        }}
      >
        <ActivityIndicator size="large" color={LightPalette.brand} />
        <Text
          style={{
            marginTop: 12,
            fontSize: 14,
            color: LightPalette.onSurfaceVariant,
            fontFamily: fontsLoaded ? Fonts.body.medium : undefined,
          }}
        >
          Loading Apni Diaries...
        </Text>
      </View>
    );
  }

  if (user) {
    return <Redirect href="/community-posts" />;
  }

  return <Redirect href="/home" />;
}
