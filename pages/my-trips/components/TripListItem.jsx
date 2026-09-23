import { Image, Pressable, Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { Fonts, Shadow } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";

// Mirrors web pages/my-trips/components/TripListItem.jsx.
const STATUS_CONFIG = {
  ongoing: { label: "Ongoing", icon: "Plane" },
  completed: { label: "Completed", icon: "CheckCircle2" },
  planned: { label: "Planned", icon: "Calendar" },
};

const formatDateShort = (ds) => {
  const d = new Date(ds);
  return isNaN(d) ? "—" : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

const TripListItem = ({ trip, onEdit, onDelete, onView }) => {
  const { theme } = useDarkMode();
  const status = STATUS_CONFIG[trip?.status] || STATUS_CONFIG.planned;
  const statusColor =
    trip?.status === "ongoing"
      ? theme.tertiary
      : trip?.status === "completed"
        ? theme.onSurfaceVariant
        : theme.primary;

  return (
    <View
      style={{
        borderRadius: 24,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: theme.outlineVariant,
        backgroundColor: theme.surfaceContainerLowest,
        ...Shadow.soft,
      }}
    >
      <View style={{ flexDirection: "row" }}>
        <View style={{ width: 96, alignSelf: "stretch" }}>
          {trip?.image ? (
            <Image source={{ uri: trip.image }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
          ) : (
            <View
              style={{
                width: "100%",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.surfaceContainerLow,
              }}
            >
              <Icon name="MapPin" size={22} color={theme.outline} />
            </View>
          )}
        </View>

        <View style={{ flex: 1, minWidth: 0, padding: 16, justifyContent: "space-between", gap: 12 }}>
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                alignSelf: "flex-start",
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 999,
                marginBottom: 6,
                backgroundColor: theme.primaryFixed,
              }}
            >
              <Icon name={status.icon} size={11} color={statusColor} />
              <Text style={{ fontSize: 10, fontFamily: Fonts.body.bold, color: statusColor }}>
                {status.label}
              </Text>
            </View>

            <Text
              style={{ fontFamily: Fonts.display.bold, fontSize: 18, color: theme.onSurface, marginBottom: 4 }}
              numberOfLines={1}
            >
              {trip?.title}
            </Text>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <Icon name="MapPin" size={12} color={theme.onSurfaceVariant} />
              <Text style={{ fontSize: 13, color: theme.onSurfaceVariant, flexShrink: 1 }} numberOfLines={1}>
                {trip?.destination}
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Icon name="Calendar" size={12} color={theme.onSurfaceVariant} />
                <Text style={{ fontSize: 12, color: theme.onSurfaceVariant }}>
                  {formatDateShort(trip?.startDate)}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Icon name="Clock" size={12} color={theme.onSurfaceVariant} />
                <Text style={{ fontSize: 12, color: theme.onSurfaceVariant }}>
                  {trip?.duration} days
                </Text>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              onPress={() => onView(trip)}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                paddingVertical: 9,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: theme.outlineVariant,
              }}
            >
              <Icon name="Eye" size={13} color={theme.onSurface} />
              <Text style={{ fontSize: 12, fontFamily: Fonts.body.semibold, color: theme.onSurface }}>
                View
              </Text>
            </Pressable>
            {onEdit && (
              <Pressable
                onPress={() => onEdit(trip)}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  paddingVertical: 9,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: theme.outlineVariant,
                }}
              >
                <Icon name="Edit2" size={13} color={theme.onSurface} />
                <Text style={{ fontSize: 12, fontFamily: Fonts.body.semibold, color: theme.onSurface }}>
                  Edit
                </Text>
              </Pressable>
            )}
            {onDelete && (
              <Pressable
                onPress={() => onDelete(trip)}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  paddingVertical: 9,
                  borderRadius: 10,
                  backgroundColor: theme.error,
                }}
              >
                <Icon name="Trash2" size={13} color="#FFFFFF" />
                <Text style={{ fontSize: 12, fontFamily: Fonts.body.semibold, color: "#FFFFFF" }}>
                  Delete
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default TripListItem;
