import { LinearGradient } from "expo-linear-gradient";
import { Image, Pressable, Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { useDarkMode } from "../../../context/DarkModeContext";
import { Fonts } from "../../../constants/theme";

const TripListItem = ({ trip, onEdit, onDelete, onView }) => {
  const { isDarkMode } = useDarkMode();

  // matches web getStatusColor — returns RN style object
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
    <View
      style={{
        backgroundColor: isDarkMode ? "#1f2937" : "#fff",
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: isDarkMode ? "#374151" : "#e5e7eb",
        flexDirection: "row",
      }}
    >
      {/* ── Image section — matches web: relative w-24 sm:w-48 flex-shrink-0 self-stretch ── */}
      <View style={{ position: "relative", width: 96, flexShrink: 0 }}>
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
              minHeight: 120,
              backgroundColor: isDarkMode ? "#374151" : "#e5e7eb",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              name="Image"
              size={28}
              color={isDarkMode ? "#6b7280" : "#9ca3af"}
            />
          </View>
        )}

        {/* matches web: absolute inset-0 bg-gradient-to-r from-transparent to-bg/20 */}
        <LinearGradient
          colors={[
            "transparent",
            isDarkMode ? "rgba(17,24,39,0.2)" : "rgba(249,250,251,0.2)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />

        {/* Status badge ON image — matches web: hidden sm:block absolute top-2 left-2
            In RN: always show on image (mobile-first, equivalent to sm:block) */}
        <View style={{ position: "absolute", top: 8, left: 8 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingHorizontal: 6,
              paddingVertical: 3,
              borderRadius: 6,
              borderWidth: 1,
              backgroundColor: statusColor.bg,
              borderColor: statusColor.border,
            }}
          >
            <Icon
              name={getStatusIcon(trip?.status)}
              size={12}
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
        </View>
      </View>

      {/* ── Content — matches web: flex-1 min-w-0 p-3 sm:p-4 md:p-5 ── */}
      <View
        style={{
          flex: 1,
          padding: 12,
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <View style={{ minWidth: 0 }}>
          {/* Status badge in content — matches web: sm:hidden (mobile only)
              In RN: hidden since we show it on image above */}
          {/* <View>...</View> — intentionally omitted, shown on image instead */}

          {/* Title — matches web: text-sm sm:text-lg md:text-xl font-semibold */}
          <Text
            style={{
              fontSize: 18,
              fontFamily: Fonts.playfair.bold,
              color: isDarkMode ? "#f9fafb" : "#111827",
              marginBottom: 4,
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
              marginBottom: 6,
            }}
          >
            <Icon
              name="MapPin"
              size={12}
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

          {/* Date + duration — matches web: flex flex-wrap items-center gap-2 sm:gap-4 */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Icon
                name="Calendar"
                size={12}
                color={isDarkMode ? "#9ca3af" : "#6b7280"}
              />
              {/* matches web: short date on mobile (sm:hidden) */}
              <Text
                style={{
                  fontSize: 12,
                  color: isDarkMode ? "#9ca3af" : "#6b7280",
                }}
              >
                {formatDateShort(trip?.startDate)}
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Icon
                name="Clock"
                size={12}
                color={isDarkMode ? "#9ca3af" : "#6b7280"}
              />
              {/* matches web: {trip?.duration} days — full word */}
              <Text
                style={{
                  fontSize: 12,
                  color: isDarkMode ? "#9ca3af" : "#6b7280",
                }}
              >
                {trip?.duration} days
              </Text>
            </View>
          </View>

          {/* Description — matches web: hidden sm:block text-sm line-clamp-2
              In RN: hidden by default (mobile-first = hidden sm:block means hidden on mobile) */}
          {/* {trip?.description && (
            <Text style={{ fontSize: 13, color: isDarkMode ? '#9ca3af' : '#6b7280', marginBottom: 8 }} numberOfLines={2}>
              {trip?.description}
            </Text>
          )} */}
        </View>

        {/* Action buttons — matches web: flex flex-row gap-1.5 sm:gap-2 */}
        <View style={{ flexDirection: "row", gap: 6 }}>
          {/* View — matches web: Button variant='outline' size='sm' iconName='Eye' */}
          <Pressable
            onPress={() => onView(trip)}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              paddingHorizontal: 8,
              paddingVertical: 6,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: isDarkMode ? "#374151" : "#e5e7eb",
              backgroundColor: "transparent",
            }}
          >
            <Icon
              name="Eye"
              size={12}
              color={isDarkMode ? "#f9fafb" : "#374151"}
            />
            <Text
              style={{
                fontSize: 12,
                color: isDarkMode ? "#f9fafb" : "#374151",
              }}
            >
              View
            </Text>
          </Pressable>

          {/* Edit — matches web: Button variant='outline' size='sm' iconName='Edit2' */}
          <Pressable
            onPress={() => onEdit(trip)}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              paddingHorizontal: 8,
              paddingVertical: 6,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: isDarkMode ? "#374151" : "#e5e7eb",
              backgroundColor: "transparent",
            }}
          >
            <Icon
              name="Edit2"
              size={12}
              color={isDarkMode ? "#f9fafb" : "#374151"}
            />
            <Text
              style={{
                fontSize: 12,
                color: isDarkMode ? "#f9fafb" : "#374151",
              }}
            >
              Edit
            </Text>
          </Pressable>

          {/* Delete — matches web: Button variant='destructive' size='sm' iconName='Trash2'
              Mobile label = "Del" matching web: <span className='sm:hidden'>Del</span> */}
          <Pressable
            onPress={() => onDelete(trip)}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              paddingHorizontal: 8,
              paddingVertical: 6,
              borderRadius: 6,
              backgroundColor: "#ef4444",
            }}
          >
            <Icon name="Trash2" size={12} color="#fff" />
            <Text style={{ fontSize: 12, color: "#fff", fontWeight: "500" }}>
              Del
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default TripListItem;
