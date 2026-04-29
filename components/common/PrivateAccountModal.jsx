import { useEffect, useRef } from "react";
import { Animated, Modal, Pressable, Text, View } from "react-native";

const PrivateAccountModal = ({
  isOpen,
  onClose,
  username,
  onAction,
  actionLabel = "Send Friend Request",
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.95);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Overlay with backdrop blur effect */}
      <Animated.View
        style={{
          position: "absolute",
          inset: 0,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          opacity: fadeAnim,
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      {/* Modal container */}
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <Animated.View
          style={{
            backgroundColor: "#ffffff",
            width: "90%",
            maxWidth: 384,
            borderRadius: 16,
            padding: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 24,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          <View style={{ alignItems: "center" }}>
            {/* Lock emoji */}
            <Text style={{ fontSize: 36, marginBottom: 12 }}>🔒</Text>

            {/* Title */}
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Inter_600SemiBold",
                color: "#111827",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              Account is Private
            </Text>

            {/* Description */}
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: "#4B5563",
                marginBottom: 24,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              {username
                ? `You can't view @${username}'s profile because their account is private.`
                : `You can't view this profile because the account is private.`}
            </Text>

            {/* Buttons */}
            <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
              {onAction && (
                <Pressable
                  onPress={onAction}
                  style={({ pressed }) => ({
                    flex: 1,
                    backgroundColor: "#000000",
                    paddingVertical: 10,
                    borderRadius: 8,
                    alignItems: "center",
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 14,
                      fontFamily: "Inter_600SemiBold",
                      textAlign: "center",
                    }}
                  >
                    {actionLabel}
                  </Text>
                </Pressable>
              )}

              <Pressable
                onPress={onClose}
                style={({ pressed }) => ({
                  flex: 1,
                  borderWidth: 1,
                  borderColor: "#D1D5DB",
                  paddingVertical: 10,
                  borderRadius: 8,
                  alignItems: "center",
                  backgroundColor: pressed ? "#F3F4F6" : "transparent",
                })}
              >
                <Text
                  style={{
                    color: "#374151",
                    fontSize: 14,
                    fontFamily: "Inter_600SemiBold",
                    textAlign: "center",
                  }}
                >
                  Close
                </Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default PrivateAccountModal;
