import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useContext, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { AppContext } from "../context/AppContext";

const PENDING_DESTINATION_KEY = "apniDiariesPendingPushDestination";

export default function ExternalDeepLinkRedirect({ destination }) {
  const router = useRouter();
  const { user, isBootstrapped } = useContext(AppContext);
  const destinationKey = JSON.stringify(destination);

  useEffect(() => {
    if (!isBootstrapped) return;
    const target = JSON.parse(destinationKey);
    if (!user?.id) {
      AsyncStorage.setItem(PENDING_DESTINATION_KEY, JSON.stringify({ destination: target, savedAt: Date.now() }))
        .catch(() => {})
        .finally(() => router.replace("/(auth)/login"));
      return;
    }
    router.replace(target);
  }, [destinationKey, isBootstrapped, router, user?.id]);

  return <View className="flex-1 items-center justify-center bg-white dark:bg-black"><ActivityIndicator color="#F97316" /></View>;
}
