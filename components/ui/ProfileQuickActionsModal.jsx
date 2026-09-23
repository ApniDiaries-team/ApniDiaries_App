import { useEffect, useRef } from "react";
import { Animated, Image, Modal, Pressable, Text, View } from "react-native";
import { useDarkMode } from "../../context/DarkModeContext";
import { getProfilePhotoUrl } from "../../helper/DefaultImageUrl";
import Icon from "../AppIcon";

const ProfileQuickActionsModal = ({ isOpen, onClose, userData, onAction }) => {
  const { isDarkMode } = useDarkMode();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  // ── Colors — mirrors web CSS variables ───────────────────────────────────
  const colors = {
    bgCard: isDarkMode ? "#1E242F" : "#ffffff",
    bgSecondary: isDarkMode ? "#1A1F29" : "#f9fafb",
    bgPrimary: isDarkMode ? "#0B0E14" : "#f3f4f6",
    textPrimary: isDarkMode ? "#ffffff" : "#111827",
    textSecondary: isDarkMode ? "#A0AEC0" : "#6b7280",
    border: isDarkMode ? "#2D3748" : "#e5e7eb",
  };

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(40);
    }
  }, [isOpen]);

  const handleAction = (actionId) => {
    onAction?.(actionId, userData);
    onClose?.();
  };

  // ── Actions — mirrors web exactly ─────────────────────────────────────────
  const actions = [
    {
      id: "message",
      label: "Send Message",
      icon: "MessageCircle",
      variant: "default",
      description: "Start a conversation",
    },
    {
      id: "follow",
      label: userData?.isFollowing ? "Unfollow" : "Follow",
      icon: userData?.isFollowing ? "UserMinus" : "UserPlus",
      variant: "outline",
      description: userData?.isFollowing
        ? "Stop following updates"
        : "Follow their journey",
    },
    {
      id: "friend",
      label: userData?.isFriend ? "Remove Friend" : "Add Friend",
      icon: userData?.isFriend ? "UserX" : "UserCheck",
      variant: "outline",
      description: userData?.isFriend
        ? "Remove from friends"
        : "Connect as friends",
    },
    {
      id: "block",
      label: userData?.isBlocked ? "Unblock User" : "Block User",
      icon: "Ban",
      variant: "destructive",
      description: "Prevent interactions",
    },
  ];

  const getIconBg = (variant) => {
    if (variant === "destructive") return "rgba(239,68,68,0.15)";
    if (variant === "default") return "rgba(59,130,246,0.15)";
    return colors.bgPrimary;
  };

  const getIconColor = (variant) => {
    if (variant === "destructive") return "#ef4444";
    if (variant === "default") return "#3b82f6";
    return colors.textPrimary;
  };

  const initials = userData?.name?.charAt(0)?.toUpperCase() || "?";
  const [imgError, setImgError] = require("react").useState(false);

  return (
    <Modal
      visible={!!isOpen}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
          opacity: fadeAnim,
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      {/* Modal card — centered like web (not bottom sheet) */}
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
            width: "100%",
            maxWidth: 448,
            borderRadius: 16,
            padding: 24,
            backgroundColor: colors.bgCard,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 24,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* ── Close button ── */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              marginBottom: 12,
            }}
          >
            <Pressable
              onPress={onClose}
              style={{
                padding: 8,
                borderRadius: 8,
                backgroundColor: colors.bgSecondary,
              }}
            >
              <Icon name="X" size={20} color={colors.textPrimary} />
            </Pressable>
          </View>

          {/* ── Avatar + name ── */}
          <View style={{ alignItems: "center", gap: 12, marginBottom: 24 }}>
            <View style={{ position: "relative" }}>
              {userData?.avatar && !imgError ? (
                <Image
                  source={{ uri: getProfilePhotoUrl(userData.avatar) }}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    borderWidth: 2,
                    borderColor: colors.border,
                  }}
                  onError={() => setImgError(true)}
                />
              ) : (
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: colors.bgSecondary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontFamily: "Inter_700Bold",
                      color: colors.textSecondary,
                    }}
                  >
                    {initials}
                  </Text>
                </View>
              )}
            </View>

            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "PlayfairDisplay_700Bold",
                  color: colors.textPrimary,
                  textAlign: "center",
                }}
              >
                {userData?.name || "User"}
              </Text>
              {userData?.username && (
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "Inter_400Regular",
                    color: colors.textSecondary,
                    marginTop: 2,
                  }}
                >
                  @{userData.username}
                </Text>
              )}
              {userData?.currentCity && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    marginTop: 2,
                  }}
                >
                  <Icon name="MapPin" size={11} color={colors.textSecondary} />
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Inter_400Regular",
                      color: colors.textSecondary,
                    }}
                  >
                    {userData.currentCity}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* ── Actions ── */}
          <View style={{ gap: 8 }}>
            {actions.map((action) => (
              <Pressable
                key={action.id}
                onPress={() => handleAction(action.id)}
                style={
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 8,
                    backgroundColor: colors.bgSecondary,
                  }
                }
              >
                {/* Icon box */}
                <View
                  style={{
                    padding: 8,
                    borderRadius: 8,
                    marginRight: 12,
                    backgroundColor: getIconBg(action.variant),
                  }}
                >
                  <Icon
                    name={action.icon}
                    size={20}
                    color={getIconColor(action.variant)}
                  />
                </View>

                {/* Label + description */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontFamily: "Inter_600SemiBold",
                      color: colors.textPrimary,
                    }}
                  >
                    {action.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: "Inter_400Regular",
                      color: colors.textSecondary,
                    }}
                  >
                    {action.description}
                  </Text>
                </View>

                <Icon
                  name="ChevronRight"
                  size={20}
                  color={colors.textSecondary}
                />
              </Pressable>
            ))}
          </View>

          {/* ── Cancel button ── */}
          <View
            style={{
              marginTop: 24,
              paddingTop: 24,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            <Pressable
              onPress={onClose}
              style={{
                width: "100%",
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: "center",
                backgroundColor: colors.bgSecondary,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color: "#FF9933",
                }}
              >
                Cancel
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default ProfileQuickActionsModal;
