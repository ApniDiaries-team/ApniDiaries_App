import { Modal, Pressable, Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { Fonts, Shadow } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";

// Mirrors web pages/my-trips/components/DeleteConfirmModal.jsx.
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, tripTitle }) => {
  const { theme } = useDarkMode();

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <Pressable style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} onPress={onClose} />

        <View
          style={{
            width: "100%",
            maxWidth: 420,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: theme.outlineVariant,
            backgroundColor: theme.surfaceContainerLowest,
            padding: 24,
            ...Shadow.soft,
          }}
        >
          <View style={{ flexDirection: "row", gap: 16, marginBottom: 24 }}>
            <View
              style={{
                padding: 12,
                borderRadius: 999,
                backgroundColor: theme.errorContainer,
              }}
            >
              <Icon name="AlertTriangle" size={22} color={theme.error} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: Fonts.display.bold, fontSize: 18, color: theme.onSurface, marginBottom: 6 }}>
                Delete Trip?
              </Text>
              <Text style={{ fontSize: 14, color: theme.onSurfaceVariant }}>
                Are you sure you want to delete "{tripTitle}"? This action cannot be undone and all trip data will be permanently removed.
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <Pressable
              onPress={onClose}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.outlineVariant,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 14, fontFamily: Fonts.body.semibold, color: theme.onSurface }}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: theme.error,
              }}
            >
              <Icon name="Trash2" size={15} color="#FFFFFF" />
              <Text style={{ fontSize: 14, fontFamily: Fonts.body.semibold, color: "#FFFFFF" }}>
                Delete Trip
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DeleteConfirmModal;
