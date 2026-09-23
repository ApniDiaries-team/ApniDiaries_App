import { Text, View } from "react-native";
import { useDarkMode } from "../../../context/DarkModeContext";

// Mirrors web pages/my-trips/components/ViewField.jsx.
export const ViewField = ({ label, value }) => {
  const { theme } = useDarkMode();
  return (
    <View>
      <Text style={{ fontSize: 12, fontWeight: "500", color: theme.onSurfaceVariant, marginBottom: 4 }}>
        {label}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: theme.onSurface,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 12,
          backgroundColor: theme.surfaceContainerLow,
          borderWidth: 1,
          borderColor: theme.outlineVariant,
        }}
      >
        {value || "—"}
      </Text>
    </View>
  );
};
