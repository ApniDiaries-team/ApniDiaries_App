import { useRouter } from "expo-router";
import { useContext, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, View } from "react-native";
import Icon from "../../components/AppIcon";
import { Fonts } from "../../constants/theme";
import { AppContext } from "../../context/AppContext";
import { useDarkMode } from "../../context/DarkModeContext";
import { getChatList } from "../../services/chat.api";
import ChatListItem from "./components/ChatListItem";
import MessagesFilterBar from "./components/MessagesFilterBar";

// Mirrors web pages/messages/index.jsx at mobile width: rather than an
// inline split-pane (desktop-only), tapping a chat pushes the existing
// full-screen /chat-interface route.
const Messages = () => {
  const router = useRouter();
  const { theme } = useDarkMode();
  const { user } = useContext(AppContext) || {};

  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});

  const fetchChatList = async () => {
    try {
      setLoadingChats(true);
      const res = await getChatList();
      if (res?.data?.success) {
        const list = res?.data?.data || [];
        setChats(list);
        const counts = {};
        list.forEach((c) => { if (c.unreadCount > 0) counts[c.id] = c.unreadCount; });
        setUnreadCounts(counts);
      }
    } catch (e) {
      console.log("Error loading chat list", e);
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => { fetchChatList(); }, []);

  const counts = useMemo(() => ({
    all: chats.filter((c) => (unreadCounts[c.id] ?? c.unreadCount ?? 0) > 0).length,
    unread: chats.filter((c) => (unreadCounts[c.id] ?? c.unreadCount ?? 0) > 0).length,
    mentions: 0,
    groups: chats.filter((c) => c.threadType === "group" && (unreadCounts[c.id] ?? c.unreadCount ?? 0) > 0).length,
  }), [chats, unreadCounts]);

  const filteredChats = useMemo(() => {
    let list = chats;
    if (activeFilter === "unread") list = list.filter((c) => (unreadCounts[c.id] ?? c.unreadCount ?? 0) > 0);
    if (activeFilter === "mentions") list = [];
    if (activeFilter === "groups") list = list.filter((c) => c.threadType === "group");
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.name?.toLowerCase().includes(q));
    }
    return list;
  }, [chats, activeFilter, unreadCounts, search]);

  const openChat = (chat) => {
    setUnreadCounts((prev) => ({ ...prev, [chat.id]: 0 }));
    router.push({
      pathname: "/chat-interface",
      params: {
        userId: chat.id,
        threadId: chat.threadId || "",
        contact: JSON.stringify({
          name: chat.name,
          avatar: chat.avatar,
          isOnline: chat.isOnline,
          lastActive: chat.lastActive,
        }),
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.surface }}>
      <View style={{ paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 }}>
        <Text style={{ fontFamily: Fonts.display.bold, fontSize: 28, color: theme.onSurface }}>
          Messages
        </Text>
      </View>

      <MessagesFilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} counts={counts} />

      <View style={{ paddingHorizontal: 20, paddingVertical: 14 }}>
        <View style={{ position: "relative", justifyContent: "center" }}>
          <Icon name="Search" size={15} color={theme.outline} style={{ position: "absolute", left: 14, zIndex: 1 }} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search chats..."
            placeholderTextColor={theme.outline}
            style={{
              paddingLeft: 38,
              paddingRight: 14,
              paddingVertical: 11,
              borderRadius: 12,
              fontSize: 14,
              color: theme.onSurface,
              backgroundColor: theme.surfaceContainerLow,
            }}
          />
        </View>
      </View>

      {loadingChats ? (
        <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 64 }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : filteredChats.length === 0 ? (
        <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 64, gap: 12 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.surfaceContainerLow,
            }}
          >
            <Icon name="MessageCircle" size={26} color={theme.onSurfaceVariant} />
          </View>
          <Text style={{ fontSize: 14, color: theme.onSurfaceVariant }}>
            {activeFilter === "mentions" ? "Mentions aren't supported yet." : "No chats found."}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          {filteredChats.map((chat) => (
            <ChatListItem
              key={`${chat.threadType}-${chat.id}`}
              chat={chat}
              myId={user?.id}
              onPress={() => openChat(chat)}
              unreadCount={unreadCounts[chat.id] ?? chat.unreadCount ?? 0}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default Messages;
