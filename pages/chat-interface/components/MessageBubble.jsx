import { useVideoPlayer, VideoView } from "expo-video";
import { useState } from "react";
import { Image, Modal, Pressable, Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { useDarkMode } from "../../../context/DarkModeContext";

// ─── Tick Icon ────────────────────────────────────────────────────────────────
const TickIcon = ({ status }) => {
  if (status === "pending" || status === "uploading" || !status) {
    return <Icon name="Clock" size={12} color="rgba(255,255,255,0.6)" />;
  }

  // Single tick — sent only
  if (status === "sent") {
    return <Icon name="Check" size={12} color="rgba(255,255,255,0.7)" />;
  }

  // Double tick — delivered or read
  const color = status === "read" ? "#53BDEB" : "rgba(255,255,255,0.7)";
  return (
    <View style={{ flexDirection: "row" }}>
      <Icon name="Check" size={12} color={color} />
      <View style={{ marginLeft: -6 }}>
        <Icon name="Check" size={12} color={color} />
      </View>
    </View>
  );
};

const fmt = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
};

// ─── Once-view bubble ─────────────────────────────────────────────────────────
const OnceViewMedia = ({ message, isSent, isDarkMode }) => {
  const [viewed, setViewed] = useState(false);
  const [open, setOpen] = useState(false);
  const time = fmt(message.timestamp);

  const handleOpen = () => {
    if (viewed || isSent) return;
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setViewed(true);
  };

  if (viewed) {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: isSent ? "flex-end" : "flex-start",
          marginBottom: 4,
          paddingHorizontal: 12,
        }}
      >
        <View
          style={{
            maxWidth: "60%",
            borderRadius: 16,
            paddingHorizontal: 12,
            paddingVertical: 8,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: isSent
              ? "rgba(0,122,255,0.1)"
              : isDarkMode
                ? "#1A1F29"
                : "#fff",
            borderWidth: 1,
            borderStyle: "dashed",
            borderColor: isDarkMode
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.1)",
          }}
        >
          <Icon
            name="EyeOff"
            size={14}
            color={isDarkMode ? "#A0AEC0" : "#6b7280"}
          />
          <Text
            style={{
              fontSize: 12,
              fontStyle: "italic",
              color: isDarkMode ? "#A0AEC0" : "#6b7280",
            }}
          >
            Opened
          </Text>
          <Text
            style={{
              fontSize: 10,
              marginLeft: "auto",
              color: isDarkMode ? "#A0AEC0" : "#6b7280",
            }}
          >
            {time}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: isSent ? "flex-end" : "flex-start",
        marginBottom: 4,
        paddingHorizontal: 12,
      }}
    >
      <Pressable
        onPress={handleOpen}
        disabled={isSent}
        style={{
          minWidth: 160,
          maxWidth: "60%",
          borderRadius: 16,
          overflow: "hidden",
          borderWidth: 1.5,
          borderColor: isSent
            ? "rgba(0,122,255,0.3)"
            : isDarkMode
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.1)",
          backgroundColor: isSent
            ? "rgba(0,122,255,0.08)"
            : isDarkMode
              ? "#1A1F29"
              : "#fff",
        }}
      >
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 20,
            paddingHorizontal: 24,
            gap: 8,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isSent
                ? "rgba(0,122,255,0.15)"
                : "rgba(255,153,51,0.12)",
            }}
          >
            <Icon
              name={isSent ? "Lock" : "Eye"}
              size={18}
              color={isSent ? "#007AFF" : "#FF9933"}
            />
          </View>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: isSent ? "#007AFF" : "#FF9933",
            }}
          >
            {isSent ? "Once-view sent" : "Tap to view"}
          </Text>
          <Text
            style={{ fontSize: 10, color: isDarkMode ? "#A0AEC0" : "#6b7280" }}
          >
            {message.mediaType === "video" ? "Video" : "Photo"} · disappears
            after viewing
          </Text>
        </View>
      </Pressable>

      <Modal visible={open} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.97)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Pressable
            onPress={handleClose}
            style={{
              position: "absolute",
              top: 48,
              right: 24,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.15)",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
            }}
          >
            <Icon name="X" size={20} color="white" />
          </Pressable>
          <View
            style={{
              width: "100%",
              paddingHorizontal: 16,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 12,
                marginBottom: 16,
              }}
            >
              This media will disappear after you close it
            </Text>
            {message.mediaType === "video" ? (
              <VideoView
                player={useVideoPlayer(message.mediaUrl, player => {
                  player.loop = true;
                  player.play();
                })}
                allowsFullscreen
                allowsPictureInPicture
                contentFit="contain"
                style={{ width: "100%", height: "70%", borderRadius: 16 }}
              />
            ) : (
              <Image
                source={{ uri: message.mediaUrl }}
                style={{ width: "100%", height: "70%", borderRadius: 16 }}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ─── GIF bubble ───────────────────────────────────────────────────────────────
const GifBubble = ({ message, isSent }) => {
  const time = fmt(message?.timestamp);
  const isUploading = message?.status === "uploading";

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: isSent ? "flex-end" : "flex-start",
        marginBottom: 4,
        paddingHorizontal: 12,
      }}
    >
      <View
        style={{
          position: "relative",
          minWidth: 120,
          maxWidth: "55%",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <Image
          source={{ uri: message.gifUrl }}
          style={{ width: "100%", height: 200, opacity: isUploading ? 0.6 : 1 }}
          resizeMode="cover"
        />
        <View
          style={{
            position: "absolute",
            top: 6,
            left: 6,
            backgroundColor: "rgba(0,0,0,0.55)",
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
          }}
        >
          <Text style={{ fontSize: 9, fontWeight: "bold", color: "white" }}>
            GIF
          </Text>
        </View>
        <View
          style={{
            position: "absolute",
            bottom: 4,
            right: 8,
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Text style={{ fontSize: 10, color: "white" }}>{time}</Text>
          {isSent && <TickIcon status={message?.status} />}
        </View>
      </View>
    </View>
  );
};

// ─── Sticker bubble ───────────────────────────────────────────────────────────
const StickerBubble = ({ message, isSent }) => {
  const time = fmt(message?.timestamp);
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: isSent ? "flex-end" : "flex-start",
        marginBottom: 4,
        paddingHorizontal: 12,
      }}
    >
      <View style={{ alignItems: "center", gap: 4 }}>
        <Text style={{ fontSize: 48 }}>{message.text}</Text>
        <View
          style={{
            flexDirection: isSent ? "row-reverse" : "row",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Text style={{ fontSize: 10, color: "#6b7280" }}>{time}</Text>
          {isSent && <TickIcon status={message?.status} />}
        </View>
      </View>
    </View>
  );
};

// ─── Media bubble — handles uploading state with spinner + cancel ─────────────
const MediaBubble = ({ message, isSent, isDarkMode }) => {
  const [playing, setPlaying] = useState(false);
  const time = fmt(message?.timestamp);
  const isVideo = message.mediaType === "video";
  const isUploading = message?.status === "uploading";

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: isSent ? "flex-end" : "flex-start",
        marginBottom: 4,
        paddingHorizontal: 12,
      }}
    >
      <View
        style={{
          position: "relative",
          maxWidth: "70%",
          borderRadius: 16,
          overflow: "hidden",
          backgroundColor: isSent ? "#007AFF" : isDarkMode ? "#1A1F29" : "#fff",
          borderWidth: 1,
          borderColor: isSent
            ? "#007AFF"
            : isDarkMode
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.1)",
        }}
      >
        {/* Image / Video */}
        {isVideo ? (
          <VideoView
            player={useVideoPlayer(message.mediaUrl)}
            allowsFullscreen
            allowsPictureInPicture
            contentFit="cover"
            style={{
              width: "100%",
              height: 256,
              opacity: isUploading ? 0.5 : 1,
            }}
          />
        ) : (
          <Image
            source={{ uri: message.mediaUrl }}
            style={{
              width: "100%",
              height: 256,
              opacity: isUploading ? 0.5 : 1,
            }}
            resizeMode="cover"
          />
        )}

        {/* Uploading overlay with spinner + cancel */}
        {isUploading && (
          <View
            style={{
              position: "absolute",
              inset: 0,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.35)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View style={{ alignItems: "center", gap: 8 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  borderWidth: 3,
                  borderColor: "rgba(255,255,255,0.3)",
                  borderTopColor: "white",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {message.cancelUpload && (
                  <Pressable onPress={() => message.cancelUpload()} hitSlop={8}>
                    <Icon name="X" size={16} color="white" />
                  </Pressable>
                )}
              </View>
              <Text style={{ fontSize: 10, color: "white", fontWeight: "500" }}>
                Uploading…
              </Text>
            </View>
          </View>
        )}

        {/* Caption — only shown if text is a real caption, not a URL */}
        {message.text && !message.text.startsWith("http") && (
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: isSent
                ? "#007AFF"
                : isDarkMode
                  ? "#1A1F29"
                  : "#fff",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: isSent ? "white" : isDarkMode ? "white" : "#111827",
              }}
            >
              {message.text}
            </Text>
          </View>
        )}

        {/* Timestamp — hidden while uploading */}
        {!isUploading && (
          <View
            style={{
              position: "absolute",
              bottom: 6,
              right: 8,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Text style={{ fontSize: 10, color: "white" }}>{time}</Text>
            {isSent && <TickIcon status={message?.status} />}
          </View>
        )}
      </View>
    </View>
  );
};

// ─── Main MessageBubble ───────────────────────────────────────────────────────
const MessageBubble = ({ message, isSent }) => {
  const { isDarkMode } = useDarkMode();
  const time = fmt(message?.timestamp);

  // Once-view
  if (message?.onceView && message?.mediaUrl) {
    return (
      <OnceViewMedia
        message={message}
        isSent={isSent}
        isDarkMode={isDarkMode}
      />
    );
  }

  // GIF
  if (message?.type === "gif" && message?.gifUrl) {
    return <GifBubble message={message} isSent={isSent} />;
  }

  // Sticker
  if (message?.type === "sticker") {
    return <StickerBubble message={message} isSent={isSent} />;
  }

  // Media
  if (message?.mediaUrl) {
    return (
      <MediaBubble message={message} isSent={isSent} isDarkMode={isDarkMode} />
    );
  }

  // Encrypted fallback
  if (message?.isEncrypted) {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: isSent ? "flex-end" : "flex-start",
          marginBottom: 4,
          paddingHorizontal: 12,
        }}
      >
        <View
          style={{
            maxWidth: "75%",
            borderRadius: 16,
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: isSent
              ? "rgba(0,122,255,0.1)"
              : isDarkMode
                ? "#1A1F29"
                : "#f9fafb",
            borderWidth: 1,
            borderStyle: "dashed",
            borderColor: isDarkMode
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.1)",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Icon
              name="Lock"
              size={12}
              color={isDarkMode ? "#A0AEC0" : "#6b7280"}
            />
            <Text
              style={{
                fontSize: 12,
                fontStyle: "italic",
                color: isDarkMode ? "#A0AEC0" : "#6b7280",
              }}
            >
              Encrypted message
            </Text>
          </View>
          <View
            style={{
              flexDirection: isSent ? "row-reverse" : "row",
              alignItems: "center",
              gap: 4,
              marginTop: 2,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                color: isDarkMode ? "#A0AEC0" : "#6b7280",
              }}
            >
              {time}
            </Text>
            {isSent && <TickIcon status={message?.status} />}
          </View>
        </View>
      </View>
    );
  }

  // Standard text bubble — sent
  if (isSent) {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-end",
          marginBottom: 4,
          paddingHorizontal: 12,
        }}
      >
        <View
          style={{
            maxWidth: "72%",
            borderRadius: 16,
            borderBottomRightRadius: 4,
            paddingHorizontal: 12,
            paddingTop: 8,
            paddingBottom: 6,
            backgroundColor: "#007AFF",
          }}
        >
          <Text
            style={{
              fontSize: 15,
              lineHeight: 20,
              color: "white",
              flexShrink: 1,
            }}
          >
            {message?.text}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 2,
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.65)" }}>
              {time}
            </Text>
            <TickIcon status={message?.status} />
          </View>
        </View>
      </View>
    );
  }

  // Standard text bubble — received
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "flex-start",
        marginBottom: 4,
        paddingHorizontal: 12,
      }}
    >
      <View
        style={{
          maxWidth: "72%",
          borderRadius: 16,
          borderBottomLeftRadius: 4,
          paddingHorizontal: 12,
          paddingTop: 8,
          paddingBottom: 6,
          backgroundColor: isDarkMode ? "#1A1F29" : "#fff",
          borderWidth: 1,
          borderColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
        }}
      >
        <Text
          style={{
            fontSize: 15,
            lineHeight: 20,
            color: isDarkMode ? "#fff" : "#111827",
          }}
        >
          {message?.text}
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            marginTop: 2,
          }}
        >
          <Text
            style={{ fontSize: 10, color: isDarkMode ? "#A0AEC0" : "#6b7280" }}
          >
            {time}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default MessageBubble;
