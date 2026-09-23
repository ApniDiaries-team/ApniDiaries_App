import { Modal, Platform, Pressable, Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { useDarkMode } from "../../../context/DarkModeContext";

const options = [
  {
    id: "view-profile",
    label: "View Profile",
    icon: "User",
    description: "See full profile details",
  },
  {
    id: "search",
    label: "Search in Chat",
    icon: "Search",
    description: "Find messages",
  },
  {
    id: "mute",
    label: "Mute Notifications",
    icon: "BellOff",
    description: "Stop receiving alerts",
  },
  {
    id: "clear",
    label: "Clear Chat",
    icon: "Trash2",
    description: "Delete all messages",
    variant: "destructive",
  },
  {
    id: "block",
    label: "Block User",
    icon: "Ban",
    description: "Prevent contact",
    variant: "destructive",
  },
];

const ChatOptionsModal = ({ isOpen, onClose, contactName, onAction }) => {
  const { isDarkMode } = useDarkMode();

  const handleAction = (actionId) => {
    if (onAction) onAction(actionId);
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Backdrop - Web standard opacity */}
      <Pressable className="flex-1 bg-black/60 justify-end" onPress={onClose}>
        <View className="flex-1 justify-end">
          <Pressable
            className={`w-full rounded-t-[32px] px-6 pt-8 border-t ${
              isDarkMode
                ? "bg-[#1A1F29] border-white/5"
                : "bg-[#F8FAFC] border-black/5"
            }`}
            style={{ paddingBottom: Platform.OS === "ios" ? 40 : 24 }}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header Section - Exactly like web layout */}
            <View className="flex-row items-start justify-between mb-8">
              <View>
                <Text
                  className={`text-2xl font-playfair-semibold ${isDarkMode ? "text-white" : "text-[#001f3f]"}`}
                >
                  Chat Options
                </Text>
                <Text
                  className={`text-[15px] mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                >
                  {contactName}
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                className={`p-2 rounded-xl ${isDarkMode ? "bg-white/5" : "bg-black/5"}`}
              >
                <Icon
                  name="X"
                  size={22}
                  color={isDarkMode ? "#FFFFFF" : "#111827"}
                />
              </Pressable>
            </View>

            {/* Options List */}
            <View className="gap-y-3">
              {options.map((option) => {
                const isDestructive = option.variant === "destructive";

                return (
                  <Pressable
                    key={option.id}
                    onPress={() => handleAction(option.id)}
                    className={`flex-row items-center p-4 rounded-[20px] ${
                      isDarkMode ? "active:bg-white/5" : "active:bg-black/5"
                    }`}
                  >
                    {/* Icon Container - Square Rounded like web image */}
                    <View
                      className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${
                        isDestructive
                          ? "bg-red-500/10"
                          : isDarkMode
                            ? "bg-white/5"
                            : "bg-black/5"
                      }`}
                    >
                      <Icon
                        name={option.icon}
                        size={22}
                        color={
                          isDestructive
                            ? "#ef4444"
                            : isDarkMode
                              ? "#FFFFFF"
                              : "#111827"
                        }
                        strokeWidth={1.5}
                      />
                    </View>

                    {/* Labels */}
                    <View className="flex-1">
                      <Text
                        className={`text-[16px] font-bold ${
                          isDestructive
                            ? "text-[#ef4444]"
                            : isDarkMode
                              ? "text-white"
                              : "text-[#111827]"
                        }`}
                      >
                        {option.label}
                      </Text>
                      <Text
                        className={`text-[13px] mt-0.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        {option.description}
                      </Text>
                    </View>

                    <Icon
                      name="ChevronRight"
                      size={18}
                      color={isDarkMode ? "#4A5568" : "#CBD5E0"}
                    />
                  </Pressable>
                );
              })}
            </View>

            {/* Footer Cancel - Fixed orange color from your screenshot */}
            <View
              className={`mt-6 pt-2 border-t ${isDarkMode ? "border-white/5" : "border-black/5"}`}
            >
              <Pressable onPress={onClose} className="w-full items-center py-4">
                <Text className="text-[16px] font-bold text-[#f97316]">
                  Cancel
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

export default ChatOptionsModal;
