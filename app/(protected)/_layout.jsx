import { Redirect, Stack } from "expo-router";
import React, { useContext } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { AppContext } from "../../context/AppContext";

export default function ProtectedLayout() {
  const { user, isLoading, isAuthenticating } = useContext(AppContext);

  if (isLoading || isAuthenticating) {
    return (
      <View className="flex-1 justify-center items-center bg-orange-50">
        <View className="items-center">
          <ActivityIndicator size="large" color="#EAB308" />
          <Text className="mt-4 text-gray-500 font-medium">
            Checking authentication...
          </Text>
        </View>
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/home" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Define screens here or let them be auto-discovered, but explicitly listing screenOptions is good practice for titles/headers if we wanted them. 
           For now, headerShown: false keeps it simple as requested. */}
    </Stack>
  );
}
