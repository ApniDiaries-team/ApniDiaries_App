import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { Fonts } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";
import { getProfilePhotoUrl } from "../../../helper/DefaultImageUrl";

const SuggestedFriends = ({ suggestions, onAddFriend }) => {
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const [hoveredId, setHoveredId] = useState(null);

  const colors = {
    bgCard: isDarkMode ? "#1E242F" : "#FFFFFF",
    bgSecondary: isDarkMode ? "#1A1F29" : "#F7FAFC",
    accent: "#FF9933",
    textPrimary: isDarkMode ? "#FFFFFF" : "#111827",
    textSecondary: isDarkMode ? "#A0AEC0" : "#6b7280",
    border: isDarkMode ? "#2D3748" : "rgba(0,0,0,0.08)",
  };

  if (!suggestions || suggestions?.length === 0) return null;

  const goToUserProfile = (id, name) => {
    if (!id || !name) return;
    router.push({
      pathname: "/other-user-profile",
      params: { userId: id },
    });
  };

  return (
    <View
      style={{
        backgroundColor: colors.bgCard,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      {/* ── Header ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              padding: 8,
              borderRadius: 8,
              backgroundColor: "rgba(255,153,51,0.1)",
            }}
          >
            <Icon name="UserPlus" size={20} color={colors.accent} />
          </View>
          <View>
            <Text
              style={{
                fontSize: 16,
                fontFamily: Fonts.playfair.bold,
                color: colors.textPrimary,
              }}
            >
              Suggested Friends
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontFamily: Fonts.inter.regular,
                color: colors.textSecondary,
              }}
            >
              Based on your travel patterns
            </Text>
          </View>
        </View>
      </View>

      {/* ── Suggestions list ── */}
      <View style={{ gap: 12 }}>
        {suggestions?.map((suggestion) => (
          <Pressable
            key={suggestion?.id}
            onPressIn={() => setHoveredId(suggestion?.id)}
            onPressOut={() => setHoveredId(null)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              padding: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "transparent",
              // mirrors web's hover:bg-[var(--color-bg-secondary)]
              backgroundColor:
                hoveredId === suggestion?.id
                  ? colors.bgSecondary
                  : "transparent",
            }}
          >
            {/* ── Avatar — web: w-12 h-12 md:w-14 md:h-14 ── */}
            <Pressable
              onPress={() => goToUserProfile(suggestion?.id, suggestion?.name)}
              style={{
                flexShrink: 0,
                opacity: 1,
              }}
            >
              <Image
                source={{ uri: getProfilePhotoUrl(suggestion?.avatar) }}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  borderWidth: 2,
                  borderColor: colors.border,
                }}
              />
            </Pressable>

            {/* ── Info ── */}
            <View style={{ flex: 1, minWidth: 0 }}>
              {/* Name — turns accent on row press, mirrors web's group-hover:text-[var(--color-accent)] */}
              <Pressable
                onPress={() =>
                  goToUserProfile(suggestion?.id, suggestion?.name)
                }
                style={{ alignSelf: "flex-start" }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 14,
                    fontFamily: Fonts.playfair.bold,
                    color:
                      hoveredId === suggestion?.id
                        ? colors.accent
                        : colors.textPrimary,
                  }}
                >
                  {suggestion?.name}
                </Text>
              </Pressable>

              <Text
                numberOfLines={1}
                style={{
                  fontSize: 12,
                  fontFamily: Fonts.inter.regular,
                  color: colors.textSecondary,
                  marginTop: 4,
                }}
              >
                {suggestion?.reason}
              </Text>

              {suggestion?.mutualConnections > 0 && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    marginTop: 4,
                  }}
                >
                  <Icon name="Users" size={12} color={colors.textSecondary} />
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: Fonts.inter.regular,
                      color: colors.textSecondary,
                    }}
                  >
                    {suggestion?.mutualConnections} mutual connections
                  </Text>
                </View>
              )}
            </View>

            {/* ── Add button — mirrors web's Button variant='default' size='sm' ── */}
            <Pressable
              onPress={() => onAddFriend(suggestion)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: "transparent",
              }}
            >
              <Icon name="UserPlus" size={14} color={colors.textPrimary} />
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: Fonts.inter.medium,
                  color: colors.textPrimary,
                }}
              >
                Add
              </Text>
            </Pressable>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default SuggestedFriends;
