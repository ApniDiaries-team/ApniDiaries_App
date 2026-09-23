import { Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { Fonts } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";

// Mirrors web pages/my-trips/components/TripStats.jsx (2x2 grid on mobile).
const TripStats = ({ trips }) => {
  const { theme } = useDarkMode();

  const stats = {
    total: trips?.length ?? 0,
    planned: trips?.filter((t) => t?.status === "planned")?.length ?? 0,
    ongoing: trips?.filter((t) => t?.status === "ongoing")?.length ?? 0,
    completed: trips?.filter((t) => t?.status === "completed")?.length ?? 0,
  };

  const items = [
    { label: "Total Trips", value: stats.total, icon: "Luggage" },
    { label: "Planned", value: stats.planned, icon: "Calendar" },
    { label: "Ongoing", value: stats.ongoing, icon: "Plane" },
    { label: "Completed", value: stats.completed, icon: "CheckCircle2" },
  ];

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
      {items.map((stat) => (
        <View key={stat.label} style={{ width: "50%", paddingRight: 12, marginBottom: 20 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 10,
              backgroundColor: theme.primaryFixed,
            }}
          >
            <Icon name={stat.icon} size={19} color={theme.primary} />
          </View>
          <Text style={{ fontFamily: Fonts.display.bold, fontSize: 26, color: theme.onSurface }}>
            {stat.value}
          </Text>
          <Text
            style={{
              fontSize: 11,
              fontFamily: Fonts.body.semibold,
              letterSpacing: 0.4,
              textTransform: "uppercase",
              color: theme.onSurfaceVariant,
              marginTop: 2,
            }}
          >
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default TripStats;
