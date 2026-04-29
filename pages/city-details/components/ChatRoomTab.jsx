import { useEffect, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Icon from "../../../components/AppIcon";
import { useDarkMode } from "../../../context/DarkModeContext";

const ChatRoomTab = ({ cityName }) => {
  const { isDarkMode } = useDarkMode();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "Sarah Explorer",
      avatar:
        "https://img.rocket.new/generatedImages/rocket_gen_img_14dcf8575-1763301362559.png",
      content: `Hey everyone! Just arrived in ${cityName}. Any recommendations for good cafes?`,
      timestamp: new Date(Date.now() - 3600000),
      isOwn: false,
    },
    {
      id: 2,
      sender: "Mike Wanderer",
      avatar:
        "https://img.rocket.new/generatedImages/rocket_gen_img_1ee6ab722-1763294988340.png",
      content:
        "Welcome! Try the Mountain View Café near Mall Road. Great coffee and wifi!",
      timestamp: new Date(Date.now() - 3300000),
      isOwn: false,
    },
    {
      id: 3,
      sender: "You",
      avatar:
        "https://img.rocket.new/generatedImages/rocket_gen_img_1d4884314-1763296936686.png",
      content:
        "Thanks for the recommendation! Planning to check it out tomorrow.",
      timestamp: new Date(Date.now() - 3000000),
      isOwn: true,
    },
    {
      id: 4,
      sender: "Emma Traveler",
      avatar:
        "https://img.rocket.new/generatedImages/rocket_gen_img_1730761bb-1763300899832.png",
      content:
        "Anyone interested in a group trek this weekend? Looking for 3-4 people.",
      timestamp: new Date(Date.now() - 2700000),
      isOwn: false,
    },
    {
      id: 5,
      sender: "Alex Nomad",
      avatar:
        "https://img.rocket.new/generatedImages/rocket_gen_img_1137cabc3-1763294027055.png",
      content: "I'm in for the trek! What's the difficulty level?",
      timestamp: new Date(Date.now() - 2400000),
      isOwn: false,
    },
  ]);

  const [activeUsers] = useState([
    {
      id: 1,
      name: "Sarah Explorer",
      avatar:
        "https://img.rocket.new/generatedImages/rocket_gen_img_14dcf8575-1763301362559.png",
      status: "online",
    },
    {
      id: 2,
      name: "Mike Wanderer",
      avatar:
        "https://img.rocket.new/generatedImages/rocket_gen_img_1ee6ab722-1763294988340.png",
      status: "online",
    },
    {
      id: 3,
      name: "Emma Traveler",
      avatar:
        "https://img.rocket.new/generatedImages/rocket_gen_img_1730761bb-1763300899832.png",
      status: "online",
    },
    {
      id: 4,
      name: "Alex Nomad",
      avatar:
        "https://img.rocket.new/generatedImages/rocket_gen_img_1137cabc3-1763294027055.png",
      status: "online",
    },
    {
      id: 5,
      name: "Lisa Backpacker",
      avatar:
        "https://img.rocket.new/generatedImages/rocket_gen_img_11bd95422-1763297575944.png",
      status: "away",
    },
  ]);

  const scrollRef = useRef(null);

  // matches web scrollToBottom — scroll to end on new messages
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  const handleSendMessage = () => {
    if (message?.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: "You",
        avatar:
          "https://img.rocket.new/generatedImages/rocket_gen_img_1d4884314-1763296936686.png",
        content: message,
        timestamp: new Date(),
        isOwn: true,
      };
      setMessages([...messages, newMessage]);
      setMessage("");
    }
  };

  // matches web formatTime exactly
  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const bg = isDarkMode ? "#1f2937" : "#fff";
  const border = isDarkMode ? "#374151" : "#e5e7eb";
  const textPrimary = isDarkMode ? "#f9fafb" : "#111827";
  const textSecondary = isDarkMode ? "#9ca3af" : "#6b7280";
  const inputBg = isDarkMode ? "#111827" : "#f9fafb";
  const bgPrimary = isDarkMode ? "#111827" : "#f9fafb";
  const bgSecondary = isDarkMode ? "#374151" : "#f3f4f6";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      {/* ── Chat Container — matches web: lg:col-span-3 flex flex-col rounded-2xl ── */}
      <View
        style={{
          backgroundColor: bg,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: border,
          overflow: "hidden",
          marginBottom: 16,
        }}
      >
        {/* Chat Header — matches web: px-4 md:px-6 py-4 border-b */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: border,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            {/* matches web: text-base md:text-lg font-semibold */}
            <Text
              style={{ fontSize: 16, fontWeight: "600", color: textPrimary }}
            >
              {cityName} Community Chat
            </Text>
            {/* matches web: text-xs md:text-sm mt-1 */}
            <Text style={{ fontSize: 12, color: textSecondary, marginTop: 4 }}>
              {activeUsers?.filter((u) => u?.status === "online")?.length}{" "}
              members online
            </Text>
          </View>
          {/* matches web: Button variant='ghost' size='icon' */}
          <Pressable
            style={{
              padding: 8,
              borderRadius: 8,
              backgroundColor: "transparent",
            }}
          >
            <Icon name="MoreVertical" size={20} color={textSecondary} />
          </Pressable>
        </View>

        {/* Messages Container — matches web: flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[var(--color-bg-primary)] */}
        <ScrollView
          ref={scrollRef}
          style={{ maxHeight: 400, backgroundColor: bgPrimary }}
          contentContainerStyle={{ padding: 16, gap: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={{
                flexDirection: msg.isOwn ? "row-reverse" : "row",
                gap: 12,
                alignItems: "flex-start",
              }}
            >
              {/* matches web: w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-[var(--color-bg-card)] */}
              <Image
                source={{ uri: msg.avatar }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  borderWidth: 2,
                  borderColor: bg,
                  flexShrink: 0,
                }}
              />
              <View
                style={{
                  flex: 1,
                  alignItems: msg.isOwn ? "flex-end" : "flex-start",
                }}
              >
                {/* Sender + timestamp — matches web: flex items-center gap-2 mb-1 */}
                <View
                  style={{
                    flexDirection: msg.isOwn ? "row-reverse" : "row",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  {/* matches web: text-xs md:text-sm font-medium text-[var(--color-text-primary)] */}
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "500",
                      color: textPrimary,
                    }}
                  >
                    {msg.sender}
                  </Text>
                  {/* matches web: text-xs text-[var(--color-text-secondary)] */}
                  <Text style={{ fontSize: 11, color: textSecondary }}>
                    {formatTime(msg.timestamp)}
                  </Text>
                </View>

                {/* Bubble — matches web: px-4 py-2 rounded-xl max-w-[85%] shadow-sm
                    own → bg-blue-500 text-white
                    other → bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] */}
                <View
                  style={{
                    backgroundColor: msg.isOwn ? "#3b82f6" : bgSecondary,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 12,
                    maxWidth: "85%",
                  }}
                >
                  {/* matches web: text-sm md:text-base leading-relaxed */}
                  <Text
                    style={{
                      fontSize: 14,
                      lineHeight: 22,
                      color: msg.isOwn ? "#fff" : textPrimary,
                    }}
                  >
                    {msg.content}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Message Input — matches web: p-4 md:p-6 border-t, flex gap-2 md:gap-3 */}
        <View
          style={{
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: border,
            flexDirection: "row",
            gap: 12,
            alignItems: "center",
          }}
        >
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type your message..."
            placeholderTextColor={textSecondary}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
            style={{
              flex: 1,
              backgroundColor: inputBg,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: border,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 14,
              color: textPrimary,
            }}
          />
          {/* matches web: Button variant='default' size='icon' disabled={!message?.trim()} */}
          <Pressable
            onPress={handleSendMessage}
            disabled={!message?.trim()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: !message?.trim()
                ? isDarkMode
                  ? "#374151"
                  : "#e5e7eb"
                : "#FF9933",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              name="Send"
              size={20}
              color={message?.trim() ? "#fff" : textSecondary}
            />
          </Pressable>
        </View>
      </View>

      {/* ── Active Members — matches web sidebar layout adapted for mobile:
          web: vertical list with full name + status beside avatar (hidden lg:block)
          mobile: same vertical list layout (no horizontal scroll) ── */}
      <View
        style={{
          backgroundColor: bg,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: border,
          padding: 16,
        }}
      >
        {/* matches web: text-base font-semibold mb-4 */}
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: textPrimary,
            marginBottom: 16,
          }}
        >
          Active Members ({activeUsers.length})
        </Text>

        {/* matches web: space-y-3 vertical list — each row: avatar + name/status beside it */}
        <View style={{ gap: 12 }}>
          {activeUsers.map((user) => (
            <View
              key={user.id}
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              {/* Avatar with status dot — matches web: relative w-10 h-10 */}
              <View style={{ position: "relative" }}>
                <Image
                  source={{ uri: user.avatar }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    borderWidth: 2,
                    borderColor: bg,
                  }}
                />
                {/* matches web: absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 */}
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor: bg,
                    backgroundColor:
                      user.status === "online" ? "#22c55e" : "#eab308",
                  }}
                />
              </View>

              {/* Name + status — matches web: flex-1 min-w-0 */}
              <View style={{ flex: 1, minWidth: 0 }}>
                {/* matches web: text-sm font-medium truncate */}
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: textPrimary,
                  }}
                >
                  {user.name}
                </Text>
                {/* matches web: text-xs capitalize */}
                <Text
                  style={{
                    fontSize: 12,
                    color: textSecondary,
                    textTransform: "capitalize",
                  }}
                >
                  {user.status}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatRoomTab;
