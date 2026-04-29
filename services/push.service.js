import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import api from "../api/axios";

// ---------------------------------------------------------------------------
// Detect Expo Go — push is unavailable there since SDK 53
// ---------------------------------------------------------------------------
const isExpoGo = Constants.appOwnership === "expo";

// ---------------------------------------------------------------------------
// Foreground notification behaviour
// ---------------------------------------------------------------------------
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ---------------------------------------------------------------------------
// initPushNotifications
// ---------------------------------------------------------------------------
export async function initPushNotifications() {
  if (isExpoGo) {
    console.info(
      "[Push] Skipped — remote push is not available in Expo Go (SDK 53+). Use a development build.",
    );
    return;
  }

  if (!Device.isDevice) {
    console.warn("[Push] Must use a physical device for push notifications.");
    return;
  }

  try {
    // 1. Request / check permission
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("[Push] Permission not granted.");
      return;
    }

    // 2. Android notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    // 3. Fetch server key
    const keyRes = await api.get("/api/push/vapid-key");
    const vapidKey = keyRes.data?.publicKey;
    if (!vapidKey) {
      console.warn("[Push] No VAPID key returned from server.");
      return;
    }

    // 4. Get Expo push token
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      process.env.EXPO_PUBLIC_PROJECT_ID;

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;

    // 5. Register with backend
    await api
      .post("/api/push/subscribe", { token, platform: Platform.OS })
      .catch(() => {});
    console.info("[Push] Subscribed successfully:", token);
  } catch (err) {
    console.warn("[Push] Setup failed:", err.message);
  }
}

// ---------------------------------------------------------------------------
// removePushSubscription
// ---------------------------------------------------------------------------
export async function removePushSubscription() {
  if (isExpoGo) return;

  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      process.env.EXPO_PUBLIC_PROJECT_ID;

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;

    await api.post("/api/push/unsubscribe", { token }).catch(() => {});
    console.info("[Push] Unsubscribed successfully.");
  } catch (err) {
    console.warn("[Push] Unsubscribe failed:", err.message);
  }
}

// ---------------------------------------------------------------------------
// useNotificationObserver — replaces SW NOTIFICATION_CLICK handler
// Use in your root layout to handle notification taps.
//
// Usage:
//   import { useNotificationObserver } from '../services/push.service'
//   useNotificationObserver((data) => router.push(`/chat/${data.threadId}`))
// ---------------------------------------------------------------------------
export function useNotificationObserver(onNavigate) {
  if (isExpoGo) return;

  Notifications.useLastNotificationResponse((response) => {
    if (!response) return;
    const data = response.notification.request.content.data;
    if (data?.threadId && data?.senderId) {
      onNavigate?.(data);
    }
  });
}
