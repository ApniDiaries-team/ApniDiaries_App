import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { Linking, Modal, Pressable, Share, Text, View } from "react-native";

import Icon from "../../../components/AppIcon";
import { useDarkMode } from "../../../context/DarkModeContext";

const ShareProfileModal = ({ isOpen, onClose, userData }) => {
  const { theme } = useDarkMode();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const profileUrl = `https://apnidiaries.com/profile/${userData?.username}`;

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    try {
      await Share.share({
        message: `Check out ${userData?.name}'s travel profile: ${profileUrl}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const shareOptions = [
    {
      id: "whatsapp",
      name: "WhatsApp",
      icon: "MessageCircle",
      action: () =>
        Linking.openURL(
          `https://wa.me/?text=Check out ${userData?.name}'s travel profile: ${profileUrl}`,
        ),
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: "Facebook",
      action: () =>
        Linking.openURL(
          `https://www.facebook.com/sharer/sharer.php?u=${profileUrl}`,
        ),
    },
    {
      id: "twitter",
      name: "Twitter",
      icon: "Twitter",
      action: () =>
        Linking.openURL(
          `https://twitter.com/intent/tweet?text=Check out ${userData?.name}'s travel profile&url=${profileUrl}`,
        ),
    },
    {
      id: "email",
      name: "Email",
      icon: "Mail",
      action: () =>
        Linking.openURL(
          `mailto:?subject=Check out this traveler&body=Check out ${userData?.name}'s travel profile: ${profileUrl}`,
        ),
    },
  ];

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "flex-end",
        }}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: theme.bgCard,
            padding: 24,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontFamily: "PlayfairDisplay_700Bold",
                color: theme.textPrimary,
              }}
            >
              Share Profile
            </Text>

            <Pressable
              onPress={onClose}
              style={{
                padding: 8,
                borderRadius: 8,
                backgroundColor: theme.bgSecondary,
              }}
            >
              <Icon name="X" size={20} color={theme.textPrimary} />
            </Pressable>
          </View>

          {/* Profile Preview */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderRadius: 12,
              backgroundColor: theme.bgSecondary,
              marginBottom: 24,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.bgPrimary,
              }}
            >
              <Icon name="User" size={24} color={theme.textPrimary} />
            </View>

            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text
                numberOfLines={1}
                style={{
                  fontFamily: "PlayfairDisplay_700Bold",
                  color: theme.textPrimary,
                }}
              >
                {userData?.name}
              </Text>

              <Text
                numberOfLines={1}
                style={{
                  fontSize: 12,
                  color: theme.textSecondary,
                }}
              >
                @{userData?.username}
              </Text>
            </View>
          </View>

          {/* Share Options */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            {shareOptions.map((option) => (
              <Pressable
                key={option.id}
                onPress={option.action}
                style={{
                  alignItems: "center",
                  width: "23%",
                  marginBottom: 16,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: theme.bgSecondary,
                  }}
                >
                  <Icon
                    name={option.icon}
                    size={22}
                    color={theme.textPrimary}
                  />
                </View>

                <Text
                  style={{
                    fontSize: 12,
                    marginTop: 6,
                    color: theme.textPrimary,
                  }}
                >
                  {option.name}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Copy Link */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 12,
              borderRadius: 10,
              backgroundColor: theme.bgSecondary,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                flex: 1,
                fontSize: 12,
                color: theme.textSecondary,
              }}
            >
              {profileUrl}
            </Text>

            <Pressable
              onPress={handleCopyLink}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
                backgroundColor: copied ? "#10B981" : "#374151",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 12 }}>
                {copied ? "Copied" : "Copy"}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ShareProfileModal;
