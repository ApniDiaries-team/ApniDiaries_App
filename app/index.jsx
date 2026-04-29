import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";
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
import { ActivityIndicator, Platform, Text, View } from "react-native";
import "react-native-get-random-values";
import { AppContext } from "../context/AppContext";

// NOTE: Do NOT override global.WebSocket here.
// socket.io-client handles React Native natively. Overriding it with RN's
// built-in WebSocket causes custom headers (Cookie/Authorization) to be
// silently dropped, making the server treat every socket as anonymous.

export default function Index() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
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
      <View className="flex-1 justify-center items-center bg-orange-50">
        <ActivityIndicator size="large" color="#EAB308" />
        <Text className="mt-2.5 text-gray-500">Loading Apni Diaries...</Text>
      </View>
    );
  }

  if (user) {
    return <Redirect href="/community-posts" />;
  }

  return <Redirect href="/home" />;
}
