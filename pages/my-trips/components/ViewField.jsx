import { View, Text } from "react-native";
import { useDarkMode } from "../../../context/DarkModeContext";

export const ViewField = ({ label, value }) => {
  const { isDarkMode } = useDarkMode();
  return (
    <View style={{ gap: 4 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "500",
          color: isDarkMode ? "#9ca3af" : "#6b7280",
        }}
      >
        {label}
      </Text>
      <Text style={{ fontSize: 16, color: isDarkMode ? "#f9fafb" : "#111827" }}>
        {value || "—"}
      </Text>
    </View>
  );
};