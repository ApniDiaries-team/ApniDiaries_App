import { CameraView, useCameraPermissions } from "expo-camera";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { confirmPushPairing } from "../../services/push.service";

export default function PairDeviceScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const processedCode = useRef<string | null>(null);

  const pair = useCallback(async (rawValue: string) => {
    if (working || !rawValue) return;
    let code = rawValue.trim();
    try {
      if (code.startsWith("http://") || code.startsWith("https://")) {
        code = new URL(code).searchParams.get("code") || "";
      }
    } catch {
      code = "";
    }
    if (!code || processedCode.current === code) return;
    processedCode.current = code;
    setWorking(true);
    setMessage("");
    try {
      await confirmPushPairing(code);
      setMessage("This browser is paired. Notifications will arrive through the app on this device.");
      setTimeout(() => router.back(), 1800);
    } catch (error) {
      processedCode.current = null;
      const apiError = error as { response?: { data?: { message?: string } } };
      setMessage(apiError.response?.data?.message || "Pairing failed. Generate a fresh code on the website and try again.");
      setWorking(false);
    }
  }, [router, working]);

  if (!permission) {
    return <View className="flex-1 items-center justify-center"><ActivityIndicator color="#F97316" /></View>;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6 dark:bg-black">
        <Text className="mb-4 text-center text-lg font-semibold text-neutral-900 dark:text-white">Pair this phone with your browser</Text>
        <Text className="mb-6 text-center text-neutral-600 dark:text-neutral-300">Allow camera access to scan the short-lived pairing QR code shown in your signed-in ApniDiaries browser.</Text>
        <Text className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white" onPress={requestPermission}>Allow camera</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        className="flex-1"
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={working ? undefined : ({ data }) => pair(data)}
      />
      <View className="absolute inset-x-0 top-0 items-center bg-black/65 px-6 py-8">
        <Text className="text-center text-xl font-bold text-white">Pair this device</Text>
        <Text className="mt-2 text-center text-sm text-white/85">Scan the QR code displayed by your signed-in browser. It expires after five minutes.</Text>
      </View>
      {working && <View className="absolute inset-0 items-center justify-center bg-black/60"><ActivityIndicator size="large" color="#F97316" /></View>}
      {!!message && <View className="absolute inset-x-0 bottom-10 mx-5 rounded-xl bg-white p-4"><Text className="text-center text-neutral-800">{message}</Text></View>}
    </View>
  );
}
