import { Text, View } from "react-native";

export default function FormField({ label, error, children }) {
  return (
    <View className="gap-1">
      <Text
        className={`text-[11px] font-medium ${error ? "text-red-500" : "text-[#6B5A4A]"}`}
      >
        {label}
      </Text>
      {children}
      {error ? <Text className="text-red-500 text-xs">{error}</Text> : null}
    </View>
  );
}