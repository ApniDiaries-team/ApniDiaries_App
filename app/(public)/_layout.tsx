import { Stack } from "expo-router";

export default function PublicLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="home" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="terms-and-conditions" />
      {/* <Stack.Screen name="blogs/index" />
      <Stack.Screen name="blogs/[slug]" /> */}
    </Stack>
  );
}
