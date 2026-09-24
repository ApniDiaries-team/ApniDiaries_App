import {
  ArrowLeft,
  Clock,
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneMissed,
  PhoneOutgoing,
  Search,
  Video,
} from "lucide-react-native";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Fonts, Palette } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";
import { getProfilePhotoUrl } from "../../../helper/DefaultImageUrl";

// ─── CallList (native) ────────────────────────────────────────────────────
//
// Full parity with web CallList:
//  • Date grouping: Today / Yesterday / Earlier
//  • Search bar (filters by contact name)
//  • Per-row audio + video call-again buttons
//  • Animated entrance per row (Animated replaces framer-motion)
//  • Empty state with icon + message
//  • Flat fallback list when timestamp grouping fails
//  • All helpers: getInitials, formatTimestamp, formatDurationLabel
//

// ── Helpers ───────────────────────────────────────────────────────────────

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

const formatTimestamp = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  if (isNaN(d)) return String(ts);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

const formatDurationLabel = (dur) => {
  if (!dur || dur === "00:00" || dur === "00:00:00") return null;
  return dur;
};

// ── CallRow ───────────────────────────────────────────────────────────────

const CallRow = memo(({
  call,
  onAudioCall,
  onVideoCall,
  index,
  isDarkMode,
  theme,
}) => {
  const isMissed = call.status === "missed";
  const isIncoming = call.type === "incoming";
  const isVideo = call.callType === "video";
  const durationLabel = formatDurationLabel(call.duration);
  const photoUrl = getProfilePhotoUrl(call.contact?.avatar);

  const StatusIcon = isMissed
    ? PhoneMissed
    : isIncoming
      ? PhoneIncoming
      : PhoneOutgoing;

  const statusColor = isMissed
    ? theme.error
    : isIncoming
      ? "#22c55e"
      : theme.textVariant;

  const statusLabel = isMissed
    ? "Missed"
    : isIncoming
      ? isVideo
        ? "Incoming video"
        : "Incoming"
      : isVideo
        ? "Outgoing video"
        : "Outgoing";

  // Animated entrance — replaces framer-motion spring
  const translateY = useRef(new Animated.Value(16)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        delay: index * 40,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        speed: 18,
        bounciness: 6,
        delay: index * 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.rowCard,
        {
          backgroundColor: theme.surfaceLowest,
          borderColor: theme.outlineVariant,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {/* Avatar + call type badge */}
      <View style={styles.avatarWrap}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarFallback, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarInitials}>
              {getInitials(call.contact?.name)}
            </Text>
          </View>
        )}
        {/* Badge */}
        <View
          style={[
            styles.typeBadge,
            { backgroundColor: theme.surface, borderColor: theme.outlineVariant },
          ]}
        >
          {isVideo ? (
            <Video size={10} color={statusColor} strokeWidth={2} />
          ) : (
            <Phone size={10} color={statusColor} strokeWidth={2} />
          )}
        </View>
      </View>

      {/* Info column */}
      <View style={styles.infoCol}>
        <Text
          style={[
            styles.contactName,
            {
              color: isMissed ? theme.error : theme.text,
            },
          ]}
          numberOfLines={1}
        >
          {call.contact?.name || "Unknown"}
        </Text>
        <View style={styles.metaRow}>
          <StatusIcon size={12} color={statusColor} strokeWidth={2} />
          <Text
            style={[
              styles.metaText,
              { color: theme.textVariant },
            ]}
          >
            {statusLabel}
          </Text>
          {durationLabel ? (
            <>
              <Text
                style={[
                  styles.metaDot,
                  { color: theme.textVariant },
                ]}
              >
                ·
              </Text>
              <Clock
                size={10}
                color={theme.textVariant}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.metaText,
                  { color: theme.textVariant },
                ]}
              >
                {durationLabel}
              </Text>
            </>
          ) : null}
        </View>
        <Text style={[styles.timestamp, { color: theme.textVariant }]} numberOfLines={1}>
          {formatTimestamp(call.timestamp)}
        </Text>
      </View>

      {/* Call-again action buttons */}
      <View style={styles.actionBtns}>
        <TouchableOpacity
          onPress={() => onAudioCall(call)}
          activeOpacity={0.7}
          style={[styles.callBtn, { backgroundColor: isDarkMode ? "rgba(237,137,54,0.14)" : "#FFF1EC", borderColor: theme.outlineVariant }]}
        >
          <Phone size={16} color={theme.primary} strokeWidth={2} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onVideoCall(call)}
          activeOpacity={0.7}
          style={[styles.callBtn, { backgroundColor: isDarkMode ? "rgba(237,137,54,0.14)" : "#FFF1EC", borderColor: theme.outlineVariant }]}
        >
          <Video size={16} color={theme.primary} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
});

// ── Section header ────────────────────────────────────────────────────────

const SectionLabel = ({ label, isDarkMode }) => (
  <Text
    style={[styles.sectionLabel, { color: isDarkMode ? "#9ca3af" : "#6b7280" }]}
  >
    {label.toUpperCase()}
  </Text>
);

// ── CallList ──────────────────────────────────────────────────────────────

const CallList = ({ callHistory = [], onAudioCall, onVideoCall, onBack }) => {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useDarkMode();
  const theme = isDarkMode ? Palette.dark : Palette.light;
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return callHistory.filter((c) =>
      (c.contact?.name || "").toLowerCase().includes(search.toLowerCase()),
    );
  }, [callHistory, search]);

  // Date grouping: Today / Yesterday / Earlier
  const listData = useMemo(() => {

    const now = new Date();
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);

    const groups = [
      {
        label: "Today",
        items: filtered.filter((c) => {
          const d = new Date(c.timestamp);
          return !isNaN(d) && d.toDateString() === now.toDateString();
        }),
      },
      {
        label: "Yesterday",
        items: filtered.filter((c) => {
          const d = new Date(c.timestamp);
          return !isNaN(d) && d.toDateString() === yesterdayDate.toDateString();
        }),
      },
      {
        label: "Earlier",
        items: filtered.filter((c) => {
          const d = new Date(c.timestamp);
          return !isNaN(d) ? d < new Date(yesterdayDate.toDateString()) : true;
        }),
      },
    ].filter((g) => g.items.length > 0);

    const showFlat = groups.length === 0 && filtered.length > 0;

    return showFlat
      ? filtered.map((call, i) => ({ type: "row", call, index: i }))
      : groups.flatMap((group) => [
        { type: "header", label: group.label, key: `header-${group.label}` },
        ...group.items.map((call, i) => ({
          type: "row",
          call,
          index: i,
          key: `row-${call.id}`,
        })),
      ]);
  }, [filtered]);

  const keyExtractor = (item, i) =>
    item.key || (item.call ? `call-${item.call.id}` : `header-${i}`);

  const renderItem = useCallback(
    ({ item }) => {
      if (item.type === "header") {
        return <SectionLabel label={item.label} isDarkMode={isDarkMode} />;
      }
      return (
        <CallRow
          call={item.call}
          index={item.index}
          onAudioCall={onAudioCall}
          onVideoCall={onVideoCall}
          isDarkMode={isDarkMode}
          theme={theme}
        />
      );
    },
    [isDarkMode, onAudioCall, onVideoCall],
  );

  const bgColor = theme.surface;
  const borderColor = theme.outlineVariant;
  const textPrimary = theme.text;
  const textSecondary = theme.textVariant;
  const cardBg = theme.surfaceLowest;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* ── Header ── */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: bgColor,
            borderBottomColor: borderColor,
            paddingTop: insets.top + 8,
          },
        ]}
      >
        {/* Back + title row */}
        <View style={styles.titleRow}>
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.7}
            style={[styles.backBtn, { backgroundColor: cardBg, borderColor }]}
          >
            <ArrowLeft size={18} color={textPrimary} strokeWidth={2} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.pageTitle, { color: textPrimary }]}>
              Calls
            </Text>
            <Text style={[styles.pageSubtitle, { color: textSecondary }]}>
              {callHistory.length} recent{" "}
              {callHistory.length === 1 ? "call" : "calls"}
            </Text>
          </View>
        </View>

        {/* Search bar */}
        <View
          style={[styles.searchBar, { backgroundColor: cardBg, borderColor }]}
        >
          <Search size={16} color={textSecondary} strokeWidth={2} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search calls…"
            placeholderTextColor={textSecondary}
            style={[styles.searchInput, { color: textPrimary }]}
          />
        </View>
      </View>

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconWrap, { backgroundColor: theme.surfaceLow }]}>
            <PhoneCall size={26} color={theme.primary} strokeWidth={1.5} />
          </View>
          <Text style={[styles.emptyTitle, { color: textPrimary }]}>
            {search ? "No results" : "No calls yet"}
          </Text>
          <Text style={[styles.emptySubtitle, { color: textSecondary }]}>
            {search
              ? "Try a different name"
              : "Your call history will appear here"}
          </Text>
        </View>
      )}

      {/* ── List ── */}
      {listData.length > 0 && (
        <FlatList
          data={listData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 16 },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // ── Header ───────────────────────────────────────────────────────────────
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pageTitle: {
    fontSize: 25,
    fontFamily: Fonts.playfair.bold,
    lineHeight: 31,
  },
  pageSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.inter.regular,
    marginTop: 2,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 15,
    minHeight: 50,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 0.8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.inter.regular,
    paddingVertical: 0,
  },
  // ── Section label ─────────────────────────────────────────────────────────
  sectionLabel: {
    fontSize: 10,
    fontFamily: Fonts.inter.bold,
    letterSpacing: 1.2,
    paddingHorizontal: 4,
    paddingTop: 20,
    paddingBottom: 9,
  },
  // ── List ─────────────────────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  // ── Call row ──────────────────────────────────────────────────────────────
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10,
  },
  avatarWrap: {
    position: "relative",
    flexShrink: 0,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f7971e",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  typeBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  infoCol: {
    flex: 1,
    minWidth: 0,
  },
  contactName: {
    fontSize: 14,
    fontFamily: Fonts.inter.semibold,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    fontSize: 11,
    fontFamily: Fonts.inter.regular,
  },
  metaDot: {
    fontSize: 12,
  },
  timestamp: {
    fontSize: 10,
    fontFamily: Fonts.inter.regular,
    marginTop: 5,
  },
  actionBtns: {
    flexDirection: "row",
    gap: 6,
    flexShrink: 0,
  },
  callBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  audioCallBtn: {
    backgroundColor: "#FFF1EC",
    borderColor: "#E1BFB2",
  },
  videoCallBtn: {
    backgroundColor: "#FFF1EC",
    borderColor: "#E1BFB2",
  },
  // ── Empty state ───────────────────────────────────────────────────────────
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
});

export default CallList;
