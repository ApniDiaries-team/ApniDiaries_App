import { Pressable, Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { useDarkMode } from "../../../context/DarkModeContext";
import { formatDuration } from "../../../helper/formatDuration";

const CallEventBubble = ({ call, isOutgoing, onCallAgain }) => {
  const { isDarkMode } = useDarkMode();

  const isMissed = call.status === "missed";
  const isVideo = (call.callType || call.type) === "video";

  const typeWord = isVideo ? "Video call" : "Voice call";
  const directionWord = isMissed
    ? "Missed"
    : isOutgoing
      ? "Outgoing"
      : "Incoming";

  const label = `${directionWord} ${typeWord.toLowerCase()}`;

  const directionIconName = isMissed
    ? "PhoneMissed"
    : isOutgoing
      ? "PhoneOutgoing"
      : "PhoneIncoming";

  const colors = isMissed
    ? {
        bg: "rgba(239,68,68,0.07)",
        border: "rgba(239,68,68,0.16)",
        icon: "#ef4444",
        iconBg: "rgba(239,68,68,0.1)",
      }
    : isOutgoing
      ? {
          bg: "rgba(59,130,246,0.07)",
          border: "rgba(59,130,246,0.16)",
          icon: "#3b82f6",
          iconBg: "rgba(59,130,246,0.1)",
        }
      : {
          bg: "rgba(34,197,94,0.07)",
          border: "rgba(34,197,94,0.16)",
          icon: "#22c55e",
          iconBg: "rgba(34,197,94,0.1)",
        };

  const handleCallAgain = () => {
    if (onCallAgain) {
      onCallAgain(call.callType || call.type, call.otherUserId);
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        marginBottom: 8,
        paddingHorizontal: 12,
        justifyContent: isOutgoing ? "flex-end" : "flex-start",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderRadius: 20,
          borderWidth: 1,
          maxWidth: "85%",
          minWidth: 200,
          backgroundColor: colors.bg,
          borderColor: colors.border,
        }}
      >
        {/* Left icon */}
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.iconBg,
            marginRight: 8, // add this
          }}
        >
          <Icon name={directionIconName} size={16} color={colors.icon} />
        </View>

        {/* Center content */}
        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: isDarkMode ? "#fff" : "#111827",
            }}
          >
            {label}
          </Text>

          {call.duration > 0 && (
            <Text
              style={{
                fontSize: 12,
                marginTop: 2,
                color: isDarkMode ? "#9CA3AF" : "#6B7280",
              }}
            >
              {formatDuration(call.duration)}
            </Text>
          )}

          {isMissed && (
            <Text
              style={{
                fontSize: 12,
                marginTop: 2,
                color: colors.icon,
                opacity: 0.85,
              }}
            >
              Tap to call back
            </Text>
          )}
        </View>

        {/* Right button */}
        <Pressable
          onPress={handleCallAgain}
          style={({ pressed }) => ({
            width: 32,
            height: 32,
            borderRadius: 16,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.iconBg,
            transform: [{ scale: pressed ? 0.9 : 1 }],
          })}
        >
          <Icon
            name={isVideo ? "Video" : "Phone"}
            size={14}
            color={colors.icon}
          />
        </Pressable>
      </View>
    </View>
  );
};

export default CallEventBubble;
