import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { useDarkMode } from "../../../context/DarkModeContext";
import { Fonts } from "../../../constants/theme";

const TripCard = ({ trip, onEdit, onDelete, onView }) => {
  const { isDarkMode } = useDarkMode();

  // matches web: const [showActions, setShowActions] = useState(false)
  // In RN we use press-in/press-out on the card to toggle actions visibility
  const [showActions, setShowActions] = useState(false);

  // matches web getStatusColor — returns object for RN inline styles
  const getStatusColor = (status) => {
    switch (status) {
      case "ongoing":
        return {
          bg: "rgba(34,197,94,0.1)",
          text: "#22c55e",
          border: "rgba(34,197,94,0.2)",
        };
      case "completed":
        return {
          bg: isDarkMode ? "#374151" : "#f3f4f6",
          text: isDarkMode ? "#9ca3af" : "#6b7280",
          border: isDarkMode ? "#4b5563" : "#e5e7eb",
        };
      default:
        return {
          bg: "rgba(59,130,246,0.1)",
          text: "#3b82f6",
          border: "rgba(59,130,246,0.2)",
        };
    }
  };

  // matches web getStatusIcon exactly
  const getStatusIcon = (status) => {
    switch (status) {
      case "ongoing":
        return "Plane";
      case "completed":
        return "CheckCircle2";
      default:
        return "Calendar";
    }
  };

  // matches web formatDate — returns '—' for invalid dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date)
      ? "—"
      : date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  // matches web formatDateShort — day + month only
  const formatDateShort = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date)
      ? "—"
      : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  };

  const statusColor = getStatusColor(trip?.status);

  return (
    // matches web: bg-[var(--color-bg-card)] rounded-xl overflow-hidden border border-[var(--color-border)]
    <Pressable
      onPress={() => onView(trip)}
      onPressIn={() => setShowActions(true)}
      onPressOut={() => setShowActions(false)}
      style={{
        backgroundColor: isDarkMode ? "#1f2937" : "#fff",
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: isDarkMode ? "#374151" : "#e5e7eb",
      }}
    >
      {/* ── Image section — matches web: relative h-28 sm:h-48 ── */}
      <View style={{ position: "relative", height: 112, overflow: "hidden" }}>
        {trip?.image ? (
          <Image
            source={{ uri: trip.image }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: isDarkMode ? "#374151" : "#e5e7eb",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              name="Image"
              size={40}
              color={isDarkMode ? "#6b7280" : "#9ca3af"}
            />
          </View>
        )}

        {/* matches web: gradient overlay bg-gradient-to-t from-bg/80 to-transparent */}
        <LinearGradient
          colors={[
            isDarkMode ? "rgba(17,24,39,0.85)" : "rgba(249,250,251,0.85)",
            isDarkMode ? "rgba(17,24,39,0.2)" : "rgba(249,250,251,0.2)",
            "transparent",
          ]}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={{
            position: "absolute",
            inset: 0,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />

        {/* matches web: absolute top-2 left-2 right-2 flex items-start justify-between */}
        <View
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            right: 8,
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          {/* Status badge — matches web: flex items-center gap-1 px-2 py-1 rounded-lg border backdrop-blur */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
              borderWidth: 1,
              backgroundColor: statusColor.bg,
              borderColor: statusColor.border,
            }}
          >
            <Icon
              name={getStatusIcon(trip?.status)}
              size={11}
              color={statusColor.text}
            />
            <Text
              style={{
                fontSize: 10,
                fontWeight: "500",
                textTransform: "capitalize",
                color: statusColor.text,
              }}
            >
              {trip?.status}
            </Text>
          </View>

          {/* Participants badge — matches web: px-2 py-1 rounded-lg bg-card/90 border */}
          {trip?.participants > 1 && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
                backgroundColor: isDarkMode
                  ? "rgba(31,41,55,0.9)"
                  : "rgba(255,255,255,0.9)",
                borderWidth: 1,
                borderColor: isDarkMode ? "#374151" : "#e5e7eb",
              }}
            >
              <Icon
                name="Users"
                size={11}
                color={isDarkMode ? "#9ca3af" : "#6b7280"}
              />
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "500",
                  color: isDarkMode ? "#9ca3af" : "#6b7280",
                }}
              >
                {trip?.participants}
              </Text>
            </View>
          )}
        </View>

        {/* Edit/Delete overlay buttons — always visible to enable taping on mobile */}
        <View
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            flexDirection: "row",
            gap: 6,
          }}
        >
          {/* Edit button — matches web: p-1.5 rounded-lg bg-card/90 hover:bg-blue-500 */}
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              onEdit(trip);
            }}
            style={{
              padding: 6,
              borderRadius: 8,
              backgroundColor: isDarkMode
                ? "rgba(31,41,55,0.9)"
                : "rgba(255,255,255,0.9)",
              borderWidth: 1,
              borderColor: isDarkMode ? "#374151" : "#e5e7eb",
            }}
            aria-label="Edit"
          >
            <Icon
              name="Edit2"
              size={13}
              color={isDarkMode ? "#f9fafb" : "#111827"}
            />
          </Pressable>

          {/* Delete button — matches web: p-1.5 rounded-lg hover:bg-red-500 */}
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              onDelete(trip);
            }}
            style={{
              padding: 6,
              borderRadius: 8,
              backgroundColor: isDarkMode
                ? "rgba(31,41,55,0.9)"
                : "rgba(255,255,255,0.9)",
              borderWidth: 1,
              borderColor: isDarkMode ? "#374151" : "#e5e7eb",
            }}
            aria-label="Delete"
          >
            <Icon
              name="Trash2"
              size={13}
              color={isDarkMode ? "#f9fafb" : "#111827"}
            />
          </Pressable>
        </View>
      </View>

      {/* ── Content section — matches web: p-3 sm:p-4 md:p-5 ── */}
      <View style={{ padding: 12 }}>
        {/* Title — matches web: text-sm sm:text-lg font-semibold text-[var(--color-text-primary)] line-clamp-1 */}
        <Text
          style={{
            fontSize: 18,
            fontFamily: Fonts.playfair.bold,
            color: isDarkMode ? "#f9fafb" : "#111827",
            marginBottom: 6,
          }}
          numberOfLines={1}
        >
          {trip?.title}
        </Text>

        {/* Destination — matches web: flex items-center gap-1.5 text-secondary */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginBottom: 10,
          }}
        >
          <Icon
            name="MapPin"
            size={13}
            color={isDarkMode ? "#9ca3af" : "#6b7280"}
          />
          <Text
            style={{
              fontSize: 13,
              color: isDarkMode ? "#9ca3af" : "#6b7280",
              flex: 1,
            }}
            numberOfLines={1}
          >
            {trip?.destination}
          </Text>
        </View>

        {/* Date + duration row — matches web: flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4 */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Icon
              name="Calendar"
              size={13}
              color={isDarkMode ? "#9ca3af" : "#6b7280"}
            />
            {/* matches web: short date on mobile — formatDateShort */}
            <Text
              style={{
                fontSize: 12,
                color: isDarkMode ? "#9ca3af" : "#6b7280",
              }}
            >
              {formatDateShort(trip?.startDate)}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Icon
              name="Clock"
              size={13}
              color={isDarkMode ? "#9ca3af" : "#6b7280"}
            />
            {/* matches web: {trip?.duration}d — short "d" not "days" */}
            <Text
              style={{
                fontSize: 12,
                color: isDarkMode ? "#9ca3af" : "#6b7280",
              }}
            >
              {trip?.duration}d
            </Text>
          </View>
        </View>

        {/* Description — matches web: hidden sm:block — in RN hide by default (mobile-first) */}
        {/* Uncomment below to show description on larger screens if needed */}
        {/* {trip?.description && (
          <Text
            style={{ fontSize: 13, color: isDarkMode ? '#9ca3af' : '#6b7280', marginBottom: 12 }}
            numberOfLines={2}
          >
            {trip?.description}
          </Text>
        )} */}

        {/* View Details button — matches web: <Button variant='outline' fullWidth iconName='Eye'>View Details</Button> */}
        <Pressable
          onPress={() => onView(trip)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            paddingVertical: 8,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: isDarkMode ? "#374151" : "#e5e7eb",
            backgroundColor: "transparent",
            marginTop: 4,
          }}
        >
          <Icon
            name="Eye"
            size={14}
            color={isDarkMode ? "#f9fafb" : "#111827"}
          />
          <Text
            style={{
              fontSize: 13,
              fontWeight: "500",
              color: isDarkMode ? "#f9fafb" : "#111827",
            }}
          >
            View Details
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
};

export default TripCard;
