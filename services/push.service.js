import Constants from "expo-constants";
import * as Crypto from "expo-crypto";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import api from "../api/axios";

const DEVICE_ID_KEY = "apniDiariesPushInstallationId";
const isExpoGo = Constants.appOwnership === "expo";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function getPushInstallationId() {
  let id = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (!id) {
    id = Crypto.randomUUID().replaceAll("-", "");
    await SecureStore.setItemAsync(DEVICE_ID_KEY, id);
  }
  return id;
}

async function getExpoToken() {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? process.env.EXPO_PUBLIC_PROJECT_ID;
  if (!projectId) throw new Error("Expo EAS project ID is not configured");
  return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
}

export async function initPushNotifications() {
  if (isExpoGo || !Device.isDevice || !["android", "ios"].includes(Platform.OS)) return;

  try {
    let { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") ({ status } = await Notifications.requestPermissionsAsync());
    const deviceId = await getPushInstallationId();
    if (status !== "granted") {
      await api.post("/api/push/unsubscribe", { deviceId }).catch(() => {});
      return;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "ApniDiaries notifications",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#F97316",
        sound: "default",
      });
    }

    const token = await getExpoToken();
    await api.post("/api/push/subscribe", {
      subscriptionType: "expo_push",
      token,
      platform: Platform.OS,
      deviceId,
      deviceName: Device.deviceName || Device.modelName || undefined,
    });
  } catch (err) {
    console.warn("[Push] Registration failed:", err.message);
  }
}

export async function removePushSubscription() {
  if (isExpoGo) return;
  try {
    const deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    if (deviceId) await api.post("/api/push/unsubscribe", { deviceId });
  } catch (err) {
    console.warn("[Push] Unregistration failed:", err.message);
  }
}

export async function confirmPushPairing(code) {
  const deviceId = await getPushInstallationId();
  return api.post("/api/push/pairing/confirm", { code, deviceId });
}

export function addPushTokenRefreshListener() {
  if (isExpoGo || !Device.isDevice) return () => {};
  const subscription = Notifications.addPushTokenListener(() => {
    initPushNotifications().catch(() => {});
  });
  return () => subscription.remove();
}

export function addNotificationResponseListener(listener) {
  if (isExpoGo) return () => {};
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    listener(response.notification.request.content.data || {}, response.notification.request.identifier);
  });
  return () => subscription.remove();
}

export async function getLastNotificationResponse() {
  if (isExpoGo) return null;
  const response = await Notifications.getLastNotificationResponseAsync();
  if (!response) return null;
  return {
    data: response.notification.request.content.data || {},
    identifier: response.notification.request.identifier,
  };
}
