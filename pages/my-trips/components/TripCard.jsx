import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { Fonts, Shadow } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";

// Mirrors web pages/my-trips/components/TripCard.jsx 1:1.
const STATUS_CONFIG = {
  ongoing: { label: "Ongoing", icon: "Plane" },
  completed: { label: "Completed", icon: "CheckCircle2" },
  planned: { label: "Planned", icon: "Calendar" },
};

const VISIBILITY_CONFIG = {
  public: { label: "Public", icon: "Globe2" },
  private: { label: "Private", icon: "Lock" },
  only_me: { label: "Only Me", icon: "Eye" },
};

const formatDate = (ds) => {
  const d = new Date(ds);
  return isNaN(d)
    ? "—"
    : d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const TripCard = ({ trip, onEdit, onDelete, onView }) => {
  const { isDarkMode, theme } = useDarkMode();
  const [showActions, setShowActions] = useState(false);

  const status = STATUS_CONFIG[trip?.status] || STATUS_CONFIG.planned;
  const vis = VISIBILITY_CONFIG[trip?.visibility] || VISIBILITY_CONFIG.only_me;

  const statusColor =
    trip?.status === "ongoing"
      ? theme.tertiary
      : trip?.status === "completed"
        ? theme.onSurfaceVariant
        : theme.primary;

  return (
    <Pressable
      onPress={() => onView(trip)}
      style={{
        borderRadius: 24,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: theme.outlineVariant,
        backgroundColor: theme.surfaceContainerLowest,
        ...Shadow.soft,
      }}
    >
      {/* Image */}
      <View style={{ aspectRatio: 4 / 3, overflow: "hidden" }}>
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
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.surfaceContainerLow,
            }}
          >
            <Icon name="MapPin" size={28} color={theme.outline} />
          </View>
        )}
        <LinearGradient
          colors={["rgba(0,0,0,0.5)", "transparent"]}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0.4 }}
          style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
        />

        {/* Badges */}
        <View
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.92)",
            }}
          >
            <Icon name={status.icon} size={11} color={statusColor} />
            <Text
              style={{
                fontSize: 10,
                fontFamily: Fonts.body.bold,
                letterSpacing: 0.4,
                textTransform: "uppercase",
                color: statusColor,
              }}
            >
              {status.label}
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: "rgba(0,0,0,0.45)",
              }}
            >
              <Icon name={vis.icon} size={10} color="#FFFFFF" />
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: Fonts.body.semibold,
                  color: "#FFFFFF",
                }}
              >
                {vis.label}
              </Text>
            </View>
            {trip?.memberCount > 1 && trip?.visibility !== "only_me" && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 999,
                  backgroundColor: "rgba(0,0,0,0.45)",
                }}
              >
                <Icon name="Users" size={10} color="#FFFFFF" />
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: Fonts.body.semibold,
                    color: "#FFFFFF",
                  }}
                >
                  {trip.memberCount}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Edit / delete */}
        {(onEdit || onDelete) && (
          <View
            style={{
              position: "absolute",
              bottom: 12,
              right: 12,
              flexDirection: "row",
              gap: 6,
            }}
          >
            {onEdit && (
              <Pressable
                onPress={() => onEdit(trip)}
                style={{
                  padding: 8,
                  borderRadius: 999,
                  backgroundColor: "rgba(255,255,255,0.9)",
                }}
              >
                <Icon name="Edit2" size={13} color={theme.onSurface} />
              </Pressable>
            )}
            {onDelete && (
              <Pressable
                onPress={() => onDelete(trip)}
                style={{
                  padding: 8,
                  borderRadius: 999,
                  backgroundColor: "rgba(255,255,255,0.9)",
                }}
              >
                <Icon name="Trash2" size={13} color={theme.onSurface} />
              </Pressable>
            )}
          </View>
        )}
      </View>

      {/* Content */}
      <View style={{ padding: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Icon name="MapPin" size={13} color={theme.onSurfaceVariant} />
          <Text
            style={{ fontSize: 13, color: theme.onSurfaceVariant, flex: 1 }}
            numberOfLines={1}
          >
            {trip?.destination}
          </Text>
        </View>

        <Text
          style={{
            fontFamily: Fonts.display.bold,
            fontSize: 20,
            color: theme.onSurface,
            marginTop: 4,
            marginBottom: 12,
          }}
          numberOfLines={1}
        >
          {trip?.title}
        </Text>

        <View
          style={{ flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 12 }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Icon name="Calendar" size={12} color={theme.onSurfaceVariant} />
            <Text style={{ fontSize: 12, color: theme.onSurfaceVariant }}>
              {formatDate(trip?.startDate)}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Icon name="Clock" size={12} color={theme.onSurfaceVariant} />
            <Text style={{ fontSize: 12, color: theme.onSurfaceVariant }}>
              {trip?.duration}d
            </Text>
          </View>
        </View>

        {!!trip?.description && (
          <Text
            style={{ fontSize: 13, color: theme.onSurfaceVariant, marginBottom: 14 }}
            numberOfLines={2}
          >
            {trip.description}
          </Text>
        )}

        <Pressable
          onPress={() => onView(trip)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            paddingVertical: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.outlineVariant,
          }}
        >
          <Text
            style={{ fontSize: 14, fontFamily: Fonts.body.semibold, color: theme.onSurface }}
          >
            Open Trip
          </Text>
          <Icon name="ArrowRight" size={15} color={theme.onSurface} />
        </Pressable>
      </View>
    </Pressable>
  );
};

export default TripCard;
