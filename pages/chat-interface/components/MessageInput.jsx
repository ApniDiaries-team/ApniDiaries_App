import * as DocumentPicker from "expo-document-picker";
import { Image as ExpoImage } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Image as RNImage,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "../../../components/AppIcon";
import { useDarkMode } from "../../../context/DarkModeContext";

const GIF_API_KEY = "GlVGYHkr3WSBnllca54iNt0yFbjz7L65";
const ORANGE = "#FF9933";

const EMOJI_TABS = [
  {
    label: "😀",
    name: "smileys",
    emojis: [
      "😀",
      "😂",
      "🥲",
      "😍",
      "🥰",
      "😘",
      "😎",
      "🤩",
      "😏",
      "😒",
      "😔",
      "😢",
      "😭",
      "😤",
      "😡",
      "🤬",
      "🥳",
      "🤯",
      "🤔",
      "🫠",
      "😶",
      "🫡",
      "🤗",
      "😴",
      "🤤",
      "🤑",
      "🥴",
      "😵",
      "🫥",
      "😈",
      "💀",
      "💩",
    ],
  },
  {
    label: "❤️",
    name: "love",
    emojis: [
      "❤️",
      "🧡",
      "💛",
      "💚",
      "💙",
      "💜",
      "🖤",
      "🤍",
      "💕",
      "💞",
      "💓",
      "💗",
      "💖",
      "💘",
      "💝",
      "💟",
      "❣️",
      "💔",
      "🫀",
      "♥️",
      "💋",
      "👄",
      "🫦",
    ],
  },
  {
    label: "👋",
    name: "gestures",
    emojis: [
      "👋",
      "🤚",
      "🖐️",
      "✋",
      "🖖",
      "🫱",
      "🫲",
      "👌",
      "🤌",
      "✌️",
      "🤞",
      "🫰",
      "🤟",
      "🤘",
      "🤙",
      "👈",
      "👉",
      "👆",
      "👇",
      "👍",
      "👎",
      "✊",
      "👊",
      "👏",
      "🙌",
      "🫶",
      "👐",
      "🤲",
      "🤝",
      "🙏",
    ],
  },
  {
    label: "🌍",
    name: "travel",
    emojis: [
      "🌍",
      "🏔️",
      "⛰️",
      "🗻",
      "🏕️",
      "🏖️",
      "🏜️",
      "🏝️",
      "🌋",
      "🛫",
      "🛬",
      "🚂",
      "🚢",
      "⛵",
      "🏄",
      "🤿",
      "🧗",
      "🚵",
      "🌄",
      "🌅",
      "🌆",
      "🌇",
      "🗺️",
      "🧭",
      "⛺",
      "🎒",
      "🏷️",
    ],
  },
  {
    label: "🍕",
    name: "food",
    emojis: [
      "🍕",
      "🍔",
      "🍟",
      "🌮",
      "🌯",
      "🥙",
      "🍳",
      "🥘",
      "🍲",
      "🥗",
      "🍱",
      "🍣",
      "🍜",
      "🍝",
      "🧁",
      "🍰",
      "🎂",
      "🍭",
      "🍬",
      "🍫",
      "🍿",
      "🍩",
      "🍪",
      "🥐",
      "🥖",
      "🥞",
      "☕",
      "🧋",
      "🍵",
      "🥤",
    ],
  },
];

const STICKERS = [
  { id: "s1", emoji: "🏔️", label: "Mountain" },
  { id: "s2", emoji: "🌅", label: "Sunrise" },
  { id: "s3", emoji: "🎒", label: "Backpack" },
  { id: "s4", emoji: "🗺️", label: "Map" },
  { id: "s5", emoji: "⛺", label: "Camp" },
  { id: "s6", emoji: "🌊", label: "Wave" },
  { id: "s7", emoji: "🦁", label: "Safari" },
  { id: "s8", emoji: "🌸", label: "Spring" },
  { id: "s9", emoji: "🏝️", label: "Island" },
  { id: "s10", emoji: "🚂", label: "Train" },
  { id: "s11", emoji: "🛵", label: "Scooter" },
  { id: "s12", emoji: "🌻", label: "Sunflower" },
  { id: "s13", emoji: "🦋", label: "Butterfly" },
  { id: "s14", emoji: "🌙", label: "Night" },
  { id: "s15", emoji: "☕", label: "Chai" },
  { id: "s16", emoji: "🎵", label: "Music" },
];

const ATTACH_OPTIONS = [
  {
    id: "photos",
    label: "Photos",
    icon: "Image",
    color: ORANGE,
    bg: "rgba(255,153,51,0.12)",
  },
  {
    id: "videos",
    label: "Videos",
    icon: "Video",
    color: "#7C3AED",
    bg: "rgba(124,58,237,0.12)",
  },
  {
    id: "document",
    label: "Document",
    icon: "FileText",
    color: "#0891B2",
    bg: "rgba(8,145,178,0.12)",
  },
  {
    id: "camera",
    label: "Camera",
    icon: "Camera",
    color: "#059669",
    bg: "rgba(5,150,105,0.12)",
  },
];

// ─── MediaPreview ─────────────────────────────────────────────────────────────
const MediaPreview = ({ files, onRemove }) => {
  if (!files.length) return null;
  return (
    <ScrollView
      horizontal
      style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 4 }}
    >
      {files.map((file, i) => {
        const isVideo = file.type?.startsWith("video/");
        const isDoc =
          !file.type?.startsWith("image/") && !file.type?.startsWith("video/");
        return (
          <View
            key={i}
            style={{
              marginRight: 8,
              width: 56,
              height: 56,
              borderRadius: 12,
              overflow: "hidden",
              borderWidth: 1.5,
              borderColor: "rgba(255,153,51,0.4)",
              position: "relative",
            }}
          >
            {isDoc ? (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(8,145,178,0.08)",
                }}
              >
                <Icon name="FileText" size={18} color="#0891B2" />
                <Text style={{ fontSize: 8, color: "#0891B2", marginTop: 2 }}>
                  {file.name?.split(".").pop()?.toUpperCase() || "DOC"}
                </Text>
              </View>
            ) : isVideo ? (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(0,0,0,0.7)",
                }}
              >
                <Icon name="Play" size={16} color="white" />
              </View>
            ) : (
              <RNImage
                source={{ uri: file.uri }}
                style={{ width: "100%", height: "100%" }}
              />
            )}
            <Pressable
              onPress={() => onRemove(i)}
              style={{
                position: "absolute",
                top: 2,
                right: 2,
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: "rgba(0,0,0,0.7)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="X" size={9} color="white" />
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
};

// ─── EmojiPanel — renders inline above input bar ──────────────────────────────
const EmojiPanel = ({ onSelect, isDarkMode }) => {
  const [tab, setTab] = useState(0);
  const bg = isDarkMode ? "#1E242F" : "#ffffff";
  const bdr = isDarkMode ? "#2D3748" : "rgba(0,0,0,0.08)";

  return (
    <View
      style={{
        backgroundColor: bg,
        borderTopWidth: 1,
        borderTopColor: bdr,
        maxHeight: 280,
      }}
    >
      {/* Tab bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ borderBottomWidth: 1, borderBottomColor: bdr }}
      >
        <View style={{ flexDirection: "row", gap: 4, padding: 8 }}>
          {EMOJI_TABS.map((t, i) => (
            <Pressable
              key={t.name}
              onPress={() => setTab(i)}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 10,
                backgroundColor:
                  tab === i ? "rgba(255,153,51,0.12)" : "transparent",
                borderWidth: tab === i ? 1.5 : 0,
                borderColor: "rgba(255,153,51,0.35)",
              }}
            >
              <Text style={{ fontSize: 18 }}>{t.label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      {/* Emoji grid */}
      <ScrollView>
        <View style={{ flexDirection: "row", flexWrap: "wrap", padding: 4 }}>
          {EMOJI_TABS[tab].emojis.map((e) => (
            <Pressable
              key={e}
              onPress={() => onSelect(e)}
              style={{
                width: "12.5%",
                alignItems: "center",
                paddingVertical: 8,
              }}
            >
              <Text style={{ fontSize: 22 }}>{e}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// ─── StickerPanel — renders inline above input bar ────────────────────────────
const StickerPanel = ({ onSelect, isDarkMode }) => {
  const bg = isDarkMode ? "#1E242F" : "#ffffff";
  const bdr = isDarkMode ? "#2D3748" : "rgba(0,0,0,0.08)";
  const sub = isDarkMode ? "#A0AEC0" : "#94a3b8";

  return (
    <View
      style={{
        backgroundColor: bg,
        borderTopWidth: 1,
        borderTopColor: bdr,
        maxHeight: 280,
      }}
    >
      <Text
        style={{
          fontSize: 11,
          fontFamily: "Inter_600SemiBold",
          color: sub,
          paddingHorizontal: 14,
          paddingTop: 10,
          paddingBottom: 6,
        }}
      >
        Travel Stickers
      </Text>
      <ScrollView>
        <View style={{ flexDirection: "row", flexWrap: "wrap", padding: 8 }}>
          {STICKERS.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => onSelect(s)}
              style={{ width: "25%", alignItems: "center", padding: 8, gap: 4 }}
            >
              <Text style={{ fontSize: 32 }}>{s.emoji}</Text>
              <Text style={{ fontSize: 9, color: sub }}>{s.label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// ─── GifPanel — renders inline above input bar ────────────────────────────────
const GifPanel = ({ onSelect, isDarkMode }) => {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  const bg = isDarkMode ? "#1E242F" : "#ffffff";
  const bdr = isDarkMode ? "#2D3748" : "rgba(0,0,0,0.08)";
  const inputBg = isDarkMode ? "#1A1F29" : "#f1f5f9";
  const sub = isDarkMode ? "#A0AEC0" : "#94a3b8";
  const textColor = isDarkMode ? "#ffffff" : "#0f172a";

  const fetchGifs = async (q = "") => {
    setLoading(true);
    setError(null);
    try {
      const url = q
        ? `https://api.giphy.com/v1/gifs/search?api_key=${GIF_API_KEY}&q=${encodeURIComponent(q)}&limit=12&rating=g`
        : `https://api.giphy.com/v1/gifs/trending?api_key=${GIF_API_KEY}&limit=12&rating=g`;
      const res = await fetch(url);
      const data = await res.json();
      setGifs(data.data || []);
    } catch (e) {
      setError(e.message);
      setGifs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGifs("");
  }, []);

  const handleSearch = (text) => {
    setQuery(text);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchGifs(text), 500);
  };

  // Use Dimensions instead of onLayout — guaranteed non-zero immediately
  const screenWidth = Dimensions.get("window").width;
  const GAP = 4;
  const COLS = 3;
  const tileSize = Math.floor((screenWidth - GAP * (COLS + 1)) / COLS);

  const renderGrid = () => {
    if (loading) {
      console.log(
        "TILE SIZE:",
        tileSize,
        "SCREEN:",
        screenWidth,
        "GIFS COUNT:",
        gifs.length,
      );
      return (
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {[...Array(9)].map((_, i) => (
            <View
              key={i}
              style={{
                width: tileSize,
                height: tileSize,
                margin: GAP / 2,
                borderRadius: 8,
                backgroundColor: inputBg,
              }}
            />
          ))}
        </View>
      );
    }

    if (error) {
      return (
        <View style={{ alignItems: "center", padding: 24, gap: 8 }}>
          <Text style={{ fontSize: 24 }}>😵</Text>
          <Text style={{ fontSize: 13, color: sub }}>Couldn't load GIFs</Text>
          <Pressable
            onPress={() => fetchGifs(query)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: "rgba(255,153,51,0.15)",
              borderWidth: 1,
              borderColor: "rgba(255,153,51,0.4)",
            }}
          >
            <Text style={{ fontSize: 12, color: "#FF9933" }}>Retry</Text>
          </Pressable>
        </View>
      );
    }

    if (gifs.length === 0) {
      return (
        <View style={{ alignItems: "center", padding: 24 }}>
          <Text style={{ fontSize: 24 }}>🔍</Text>
          <Text style={{ fontSize: 13, color: sub, marginTop: 8 }}>
            No GIFs found
          </Text>
        </View>
      );
    }
    return (
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {gifs.map((g) => {
          // fixed_height_small is 100x100 square — perfect for tiles
          const uri =
            g.images?.fixed_height_small?.webp ||
            g.images?.fixed_width_small?.webp ||
            g.images?.preview_webp?.url;

          return (
            <Pressable
              key={g.id}
              onPress={() => onSelect(g)}
              style={{
                width: tileSize,
                height: tileSize,
                margin: GAP / 2,
                borderRadius: 8,
                overflow: "hidden",
                backgroundColor: inputBg,
              }}
            >
              <ExpoImage
                source={{ uri }}
                style={{ width: tileSize, height: tileSize }}
                contentFit="cover"
                autoplay={true}
                cachePolicy="memory-disk"
              />
            </Pressable>
          );
        })}
      </View>
    );
  };

  return (
    <View
      style={{
        backgroundColor: bg,
        borderTopWidth: 1,
        borderTopColor: bdr,
        height: 320, // ← fixed height, not maxHeight
      }}
    >
      {/* Search */}
      <View style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 4 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: inputBg,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderWidth: 1,
            borderColor: bdr,
          }}
        >
          <Icon name="Search" size={13} color={sub} />
          <TextInput
            value={query}
            onChangeText={handleSearch}
            placeholder="Search GIFs…"
            placeholderTextColor={sub}
            style={{
              flex: 1,
              fontSize: 14,
              fontFamily: "Inter_400Regular",
              color: textColor,
            }}
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => {
                setQuery("");
                fetchGifs("");
              }}
            >
              <Icon name="X" size={13} color={sub} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Grid — explicit height so ScrollView has room */}
      <ScrollView
        style={{ height: 240 }} // ← explicit, not flex:1
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", padding: GAP / 2 }}
          >
            {[...Array(9)].map((_, i) => (
              <View
                key={i}
                style={{
                  width: tileSize,
                  height: tileSize,
                  margin: GAP / 2,
                  borderRadius: 8,
                  backgroundColor: inputBg,
                }}
              />
            ))}
          </View>
        ) : error ? (
          <View style={{ alignItems: "center", padding: 24, gap: 8 }}>
            <Text style={{ fontSize: 24 }}>😵</Text>
            <Text style={{ fontSize: 13, color: sub }}>Couldn't load GIFs</Text>
            <Pressable
              onPress={() => fetchGifs(query)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: "rgba(255,153,51,0.15)",
                borderWidth: 1,
                borderColor: "rgba(255,153,51,0.4)",
              }}
            >
              <Text style={{ fontSize: 12, color: "#FF9933" }}>Retry</Text>
            </Pressable>
          </View>
        ) : gifs.length === 0 ? (
          <View style={{ alignItems: "center", padding: 24 }}>
            <Text style={{ fontSize: 24 }}>🔍</Text>
            <Text style={{ fontSize: 13, color: sub, marginTop: 8 }}>
              No GIFs found
            </Text>
          </View>
        ) : (
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", padding: GAP / 2 }}
          >
            {gifs.map((g) => {
              const uri =
                g.images?.fixed_height_small?.webp ||
                g.images?.fixed_width_small?.webp ||
                g.images?.preview_webp?.url;

              return (
                <Pressable
                  key={g.id}
                  onPress={() => onSelect(g)}
                  style={{
                    width: tileSize,
                    height: tileSize,
                    margin: GAP / 2,
                    borderRadius: 8,
                    overflow: "hidden",
                    backgroundColor: inputBg,
                  }}
                >
                  <ExpoImage
                    source={{ uri }}
                    style={{ width: tileSize, height: tileSize }}
                    contentFit="cover"
                    autoplay={true}
                    cachePolicy="memory-disk"
                  />
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      <Text
        style={{
          fontSize: 10,
          textAlign: "center",
          color: sub,
          paddingVertical: 6,
        }}
      >
        Powered by GIPHY
      </Text>
    </View>
  );
};

// ─── AttachSheet — bottom Modal matching web's AttachSheet ────────────────────
const AttachSheet = ({ open, onClose, onAttachOption, isDarkMode }) => {
  const bg = isDarkMode ? "#1E242F" : "#ffffff";
  const bdr = isDarkMode ? "#2D3748" : "rgba(0,0,0,0.08)";
  const sub = isDarkMode ? "#A0AEC0" : "#64748b";
  const textPrimary = isDarkMode ? "#ffffff" : "#0f172a";

  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }}
          onPress={onClose}
        />
        <View
          style={{
            backgroundColor: bg,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingBottom: Platform.OS === "ios" ? 34 : 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -8 },
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 20,
          }}
        >
          {/* Handle */}
          <View
            style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: bdr,
              }}
            />
          </View>
          {/* Title row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingVertical: 12,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_600SemiBold",
                color: textPrimary,
              }}
            >
              Share
            </Text>
            <Pressable
              onPress={onClose}
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: isDarkMode ? "#1A1F29" : "#f3f4f6",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="X" size={14} color={sub} />
            </Pressable>
          </View>
          {/* Options grid */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              paddingHorizontal: 20,
              paddingBottom: 24,
            }}
          >
            {ATTACH_OPTIONS.map((opt) => (
              <Pressable
                key={opt.id}
                onPress={() => onAttachOption(opt.id)}
                style={{ alignItems: "center", gap: 8 }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: opt.bg,
                  }}
                >
                  <Icon
                    name={opt.icon}
                    size={24}
                    color={opt.color}
                    strokeWidth={1.8}
                  />
                </View>
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: "Inter_500Medium",
                    color: sub,
                  }}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── Main MessageInput ─────────────────────────────────────────────────────────
const MessageInput = ({
  onSendMessage,
  onTypingChange,
  disabled,
  placeholder,
}) => {
  const { isDarkMode } = useDarkMode();
  const [message, setMessage] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [onceView, setOnceView] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [showSticker, setShowSticker] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const insets = useSafeAreaInsets();
  const typingTimeoutRef = useRef(null);

  // ── Colors ────────────────────────────────────────────────────────────────
  const bgSecondary = isDarkMode ? "#1A1F29" : "#F7FAFC";
  const bgCard = isDarkMode ? "#1E242F" : "#ffffff";
  const bdr = isDarkMode ? "#2D3748" : "rgba(0,0,0,0.08)";
  const sub = isDarkMode ? "#A0AEC0" : "#64748b";
  const textPrimary = isDarkMode ? "#ffffff" : "#1e293b";

  const closeAllPickers = () => {
    setShowEmoji(false);
    setShowGif(false);
    setShowSticker(false);
  };

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    const hasText = message.trim();
    const hasMedia = mediaFiles.length > 0;
    if (!hasText && !hasMedia) return;
    if (disabled) return;
    onSendMessage({
      text: message.trim() || null,
      files: mediaFiles,
      onceView,
      type: hasMedia ? "media" : "text",
    });
    setMessage("");
    setMediaFiles([]);
    setOnceView(false);
    closeAllPickers();
    if (onTypingChange) {
      onTypingChange(false);
      clearTimeout(typingTimeoutRef.current);
    }
  }, [message, mediaFiles, onceView, disabled, onSendMessage, onTypingChange]);

  // ── Typing ────────────────────────────────────────────────────────────────
  const handleInputChange = (text) => {
    setMessage(text);
    if (onTypingChange) {
      onTypingChange(true);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => onTypingChange(false), 1000);
    }
  };

  // ── Emoji ─────────────────────────────────────────────────────────────────
  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji);
    setShowEmoji(false);
  };

  // ── Sticker ───────────────────────────────────────────────────────────────
  const handleStickerSelect = (sticker) => {
    onSendMessage({
      text: sticker.emoji,
      files: [],
      onceView: false,
      type: "sticker",
      stickerLabel: sticker.label,
    });
    closeAllPickers();
  };

  // ── GIF ───────────────────────────────────────────────────────────────────
  const handleGifSelect = (gif) => {
    onSendMessage({
      text: null,
      files: [],
      onceView,
      type: "gif",
      gifUrl: gif.images?.original?.url, // full gif for chat display
      gifMp4: gif.images?.original_mp4?.mp4, // mp4 for chat playback
      gifTitle: gif.title,
    });
    closeAllPickers();
  };

  // ── Attach ────────────────────────────────────────────────────────────────
  const handleAttachOption = async (optId) => {
    setShowAttach(false);
    if (optId === "photos") {
      const r = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
      });
      if (!r.canceled) setMediaFiles((p) => [...p, ...r.assets].slice(0, 10));
    } else if (optId === "videos") {
      const r = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsMultipleSelection: true,
      });
      if (!r.canceled) setMediaFiles((p) => [...p, ...r.assets].slice(0, 10));
    } else if (optId === "camera") {
      const r = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });
      if (!r.canceled) setMediaFiles((p) => [...p, ...r.assets].slice(0, 10));
    } else if (optId === "document") {
      const r = await DocumentPicker.getDocumentAsync({ multiple: true });
      if (!r.canceled) setMediaFiles((p) => [...p, ...r.assets].slice(0, 10));
    }
  };

  const canSend = (message.trim() || mediaFiles.length > 0) && !disabled;
  const hasMedia = mediaFiles.length > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ width: "100%" }}
    >
      {/* Attach modal */}
      <AttachSheet
        open={showAttach}
        onClose={() => setShowAttach(false)}
        onAttachOption={handleAttachOption}
        isDarkMode={isDarkMode}
      />

      {/* Panels ABOVE input bar */}
      {showEmoji && (
        <EmojiPanel onSelect={handleEmojiSelect} isDarkMode={isDarkMode} />
      )}

      {showGif && (
        <GifPanel onSelect={handleGifSelect} isDarkMode={isDarkMode} />
      )}

      {showSticker && (
        <StickerPanel onSelect={handleStickerSelect} isDarkMode={isDarkMode} />
      )}

      {/* Media preview */}
      {mediaFiles.length > 0 && (
        <MediaPreview
          files={mediaFiles}
          onRemove={(i) =>
            setMediaFiles((f) => f.filter((_, idx) => idx !== i))
          }
        />
      )}

      {/* Once view toggle */}
      {mediaFiles.length > 0 && (
        <View style={{ paddingHorizontal: 12, paddingTop: 4 }}>
          <Pressable
            onPress={() => setOnceView((v) => !v)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 999,
              alignSelf: "flex-start",
              backgroundColor: onceView
                ? "rgba(255,153,51,0.15)"
                : "transparent",
              borderWidth: 1,
              borderColor: onceView ? "rgba(255,153,51,0.4)" : bdr,
            }}
          >
            <Icon
              name={onceView ? "EyeOff" : "Eye"}
              size={11}
              color={onceView ? ORANGE : sub}
            />
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Inter_600SemiBold",
                marginLeft: 4,
                color: onceView ? ORANGE : sub,
              }}
            >
              {onceView ? "Once view on" : "Once view"}
            </Text>
          </Pressable>
        </View>
      )}

      {/* INPUT BAR */}
      <View
        style={{
          height: 60 + insets.bottom,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: bgSecondary,
          borderTopWidth: 1,
          borderTopColor: bdr,
          paddingBottom: Platform.OS === "ios" ? 8 : 4,
          paddingHorizontal: 12,
        }}
      >
        {/* Attach button */}
        <Pressable
          onPress={() => {
            closeAllPickers();
            setShowAttach(true);
          }}
          disabled={disabled}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: showAttach ? ORANGE : bgCard,
            borderWidth: showAttach ? 0 : 1,
            borderColor: bdr,
          }}
        >
          <Icon name="Plus" size={18} color={showAttach ? "white" : sub} />
        </Pressable>

        {/* Text input */}
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: bgCard,
            borderWidth: 1,
            borderColor: bdr,
            borderRadius: 999,
            paddingHorizontal: 12,
            minHeight: 40,
            marginHorizontal: 8,
          }}
        >
          <TextInput
            multiline
            value={message}
            onChangeText={handleInputChange}
            placeholder={
              disabled
                ? placeholder || "Can't send messages"
                : placeholder || "Message…"
            }
            placeholderTextColor={sub}
            editable={!disabled}
            style={{
              flex: 1,
              fontSize: 14,
              fontFamily: "Inter_400Regular",
              color: textPrimary,
              paddingVertical: 8,
              maxHeight: 120,
            }}
          />

          {/* Emoji / GIF / Sticker */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Pressable
              onPress={() => {
                const n = !showEmoji;
                closeAllPickers();
                setShowEmoji(n);
              }}
            >
              <Icon name="Smile" size={16} color={showEmoji ? ORANGE : sub} />
            </Pressable>

            <Pressable
              onPress={() => {
                const n = !showGif;
                closeAllPickers();
                setShowGif(n);
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "Inter_800ExtraBold",
                  color: showGif ? ORANGE : sub,
                }}
              >
                GIF
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                const n = !showSticker;
                closeAllPickers();
                setShowSticker(n);
              }}
            >
              <Text style={{ fontSize: 16 }}>🎭</Text>
            </Pressable>
          </View>
        </View>

        {/* Send */}
        <Pressable
          onPress={handleSend}
          disabled={!canSend}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: canSend ? ORANGE : bgCard,
            borderWidth: canSend ? 0 : 1,
            borderColor: bdr,
          }}
        >
          <Icon name="Send" size={16} color={canSend ? "white" : sub} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

export default MessageInput;
