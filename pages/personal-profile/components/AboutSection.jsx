import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { Fonts } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";

// Mirrors web pages/personal-profile/components/AboutSection.jsx — flat
// surface-container-low cards (no border), empty-bio CTA, solid primary
// preference pills.
const AboutSection = ({ userData }) => {
  const { theme } = useDarkMode();
  const router = useRouter();

  const aboutItems = [
    { icon: "Mail", label: "Email", value: userData?.email },
    { icon: "Phone", label: "Phone", value: userData?.phone || "-" },
    {
      icon: "Calendar",
      label: "Joined",
      value: userData?.created_at
        ? new Date(userData.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "-",
    },
    { icon: "MapPin", label: "Current City", value: userData?.city },
  ];

  const cardStyle = {
    backgroundColor: theme.surfaceContainerLow,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  };
  const titleStyle = { fontFamily: Fonts.display.semibold, fontSize: 17, color: theme.onSurface, marginBottom: 14 };

  return (
    <View>
      {/* About Me */}
      <View style={cardStyle}>
        <Text style={titleStyle}>About Me</Text>
        {userData?.bio ? (
          <Text style={{ fontSize: 14, color: theme.onSurfaceVariant, lineHeight: 21 }}>{userData.bio}</Text>
        ) : (
          <View style={{ alignItems: "center", paddingVertical: 20 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
                backgroundColor: theme.surfaceVariant,
              }}
            >
              <Icon name="FileText" size={22} color={theme.onSurfaceVariant} />
            </View>
            <Text style={{ fontSize: 14, color: theme.onSurfaceVariant, textAlign: "center", marginBottom: 16 }}>
              Share your story. Add a short bio to let others get to know you.
            </Text>
            <Pressable
              onPress={() => router.push({ pathname: "/edit-personal-details", params: { scrollTo: "bio" } })}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderRadius: 999,
                backgroundColor: theme.primary,
              }}
            >
              <Icon name="Plus" size={16} color="#FFFFFF" />
              <Text style={{ color: "#FFFFFF", fontSize: 13, fontFamily: Fonts.body.semibold }}>Add Bio</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Contact Information */}
      <View style={cardStyle}>
        <Text style={titleStyle}>Contact Information</Text>
        <View style={{ gap: 16 }}>
          {aboutItems.map((item, index) => (
            <View key={index} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: theme.surfaceVariant,
                }}
              >
                <Icon name={item.icon} size={19} color={theme.primary} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontSize: 11, color: theme.onSurfaceVariant, marginBottom: 2 }}>{item.label}</Text>
                <Text
                  style={{ fontSize: 14, fontFamily: Fonts.body.semibold, color: theme.onSurface }}
                  numberOfLines={1}
                >
                  {item.value}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Travel Preferences */}
      {userData?.interest?.length > 0 && (
        <View style={cardStyle}>
          <Text style={titleStyle}>Travel Preferences</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {userData.interest.map((preference, index) => (
              <View
                key={index}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 999,
                  backgroundColor: theme.primary,
                }}
              >
                <Text style={{ fontSize: 12, fontFamily: Fonts.body.semibold, color: "#FFFFFF" }}>
                  {preference}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default AboutSection;
