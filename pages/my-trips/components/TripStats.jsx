import { Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { useDarkMode } from "../../../context/DarkModeContext";
import { Fonts } from "../../../constants/theme";

const TripStats = ({ trips }) => {
  const { isDarkMode } = useDarkMode();

  // matches web exactly — no || 0 fallback
  const stats = {
    total: trips?.length,
    planned: trips?.filter((t) => t?.status === "planned")?.length,
    ongoing: trips?.filter((t) => t?.status === "ongoing")?.length,
    completed: trips?.filter((t) => t?.status === "completed")?.length,
  };

  // matches web statCards array exactly — same variable name, same colors
  const statCards = [
    {
      label: "Total Trips",
      value: stats?.total,
      icon: "Luggage",
      iconColor: "#3b82f6", // text-blue-500
      bgColor: "rgba(59,130,246,0.1)", // bg-blue-500/10
    },
    {
      label: "Planned",
      value: stats?.planned,
      icon: "Calendar",
      iconColor: "#3b82f6", // text-blue-500 (same as Total)
      bgColor: "rgba(59,130,246,0.1)", // bg-blue-500/10
    },
    {
      label: "Ongoing",
      value: stats?.ongoing,
      icon: "Plane",
      iconColor: "#22c55e", // text-green-500
      bgColor: "rgba(34,197,94,0.1)", // bg-green-500/10
    },
    {
      label: "Completed",
      value: stats?.completed,
      icon: "CheckCircle2",
      iconColor: isDarkMode ? "#9ca3af" : "#6b7280", // text-[var(--color-text-secondary)]
      bgColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f3f4f6", // bg-[var(--color-bg-secondary)]
    },
  ];

  return (
    // matches web: grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 md:mb-8
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 16,
        marginBottom: 24,
      }}
    >
      {statCards?.map((stat, index) => (
        <View
          key={index}
          style={{
            // matches web: bg-[var(--color-bg-card)] rounded-xl p-4 md:p-5 lg:p-6 border border-[var(--color-border)]
            flex: 1,
            minWidth: "45%",
            backgroundColor: isDarkMode ? "#1f2937" : "#fff",
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: isDarkMode ? "#374151" : "#e5e7eb",
          }}
        >
          {/* matches web: <div className="flex items-start justify-between mb-3"> */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            {/* matches web: <div className={`p-2 md:p-3 rounded-lg ${stat?.bgColor}`}> */}
            <View
              style={{
                padding: 8,
                borderRadius: 8,
                backgroundColor: stat.bgColor,
              }}
            >
              {/* matches web: <Icon name={stat?.icon} size={20} className={stat?.iconColor} /> */}
              <Icon name={stat?.icon} size={20} color={stat.iconColor} />
            </View>
          </View>

          {/* matches web: <div className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mb-1"> */}
          <Text
            style={{
              fontSize: 32, // larger for serif numbers
              fontFamily: Fonts.playfair.bold,
              color: isDarkMode ? "#f9fafb" : "#111827",
              marginBottom: 4,
            }}
          >
            {stat?.value}
          </Text>

          {/* matches web: <div className="text-xs md:text-sm text-[var(--color-text-secondary)]"> */}
          <Text
            style={{
              fontSize: 13, // between text-xs(12) and text-sm(14)
              color: isDarkMode ? "#9ca3af" : "#6b7280",
            }}
          >
            {stat?.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default TripStats;
