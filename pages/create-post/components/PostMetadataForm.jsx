import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { useDarkMode } from "../../../context/DarkModeContext";
import { getCitiesByCategory, getPopularCities } from "../../../data/cities";

const tripTypeOptions = [
  { value: "solo", label: "Solo Travel" },
  { value: "group", label: "Group Travel" },
  { value: "backpacking", label: "Backpacking" },
  { value: "family", label: "Family Trip" },
  { value: "adventure", label: "Adventure" },
  { value: "leisure", label: "Leisure" },
  { value: "road_trip", label: "Road Trip" },
  { value: "honeymoon", label: "Honeymoon" },
  { value: "business", label: "Business Trip" },
  { value: "spiritual", label: "Spiritual Journey" },
  { value: "food", label: "Food Trip" },
  { value: "photography", label: "Photography Trip" },
];

const privacyOptions = [
  { value: "public", label: "Public - Everyone can see" },
  { value: "friends", label: "Friends Only" },
  { value: "private", label: "Private - Only me" },
];

const PostMetadataForm = ({ metadata, onChange }) => {
  const { isDarkMode } = useDarkMode();
  const [popularCities, setPopularCities] = useState([]);
  const [cityCategories, setCityCategories] = useState([]);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [cityQuery, setCityQuery] = useState(metadata?.city || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showPrivacyDropdown, setShowPrivacyDropdown] = useState(false);
  const [showTripTypeDropdown, setShowTripTypeDropdown] = useState(false);
  const colors = {
    bg: isDarkMode ? "#1f2937" : "#FFFFFF",
    bgSecondary: isDarkMode ? "#111827" : "#f9fafb",
    bgSoft: isDarkMode ? "#1a2233" : "#faf7f2",
    textPrimary: isDarkMode ? "#f3f4f6" : "#1a1a1a",
    textSecondary: isDarkMode ? "#9ca3af" : "#6b7280",
    border: isDarkMode ? "#374151" : "#e5e7eb",
    borderSoft: isDarkMode ? "#2d3748" : "#e9ded3",
    saffron: "#FF9933",
    orange: "#EA580C",
    white: "#FFFF",
  };

  useEffect(() => {
    setPopularCities(getPopularCities(8));
    const hillStations = getCitiesByCategory("hillStations").slice(0, 4);
    const beaches = getCitiesByCategory("beaches").slice(0, 4);
    const spiritual = getCitiesByCategory("spiritual").slice(0, 4);
    setCityCategories([
      { name: "Hill Stations", cities: hillStations, icon: "Mountain" },
      { name: "Beaches", cities: beaches, icon: "Umbrella" },
      { name: "Spiritual", cities: spiritual, icon: "Church" },
    ]);
  }, []);

  const handleChange = (field, value) => {
    onChange({ ...metadata, [field]: value });
  };

  const handleCityInputChange = (text) => {
    setCityQuery(text);
    handleChange("city", text);
    // if (text.length > 1) {
    //   setCitySuggestions(searchCities(text, 8));
    //   setShowSuggestions(true);
    // } else {
    //   setShowSuggestions(false);
    // }
  };

  const handleCitySelect = (cityName) => {
    setCityQuery(cityName);
    handleChange("city", cityName);
    setShowSuggestions(false);
  };

  const toggleTripType = (value) => {
    const current = metadata?.tripType || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    handleChange("tripType", updated);
  };

  const CityTag = ({ label, selected, onPress }) => (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 999,
        backgroundColor: selected
          ? colors.saffron
          : isDarkMode
            ? "#374151"
            : colors.white,
        borderWidth: 0.5,
        borderColor: selected ? colors.saffron : "",
        // opacity: pressed ? 0.8 : 1,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: selected ? "700" : "400",
          color: selected ? colors.white : "",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View style={{ gap: 24, padding: 4 }}>
      {/* ── Destination ── */}
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Icon name="MapPin" size={20} color={colors.saffron} />
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: colors.textPrimary,
            }}
          >
            Destination <Text style={{ color: "#ef4444" }}>*</Text>
          </Text>
        </View>

        {/* Search input */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            paddingHorizontal: 10,
            paddingVertical: 3,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: colors.border,
            backgroundColor: isDarkMode ? "#0b0e14" : "#fff",
            overflow: "hidden",
          }}
        >
          <Icon name="Search" size={16} color={colors.textSecondary} />
          <TextInput
            value={cityQuery}
            onChangeText={handleCityInputChange}
            placeholder="Enter city, state, or destination (e.g., Manali)"
            placeholderTextColor={colors.textSecondary}
            style={{ flex: 1, fontSize: 14, color: colors.textPrimary }}
          />
        </View>

        {/* Popular destinations - filtered when typing */}
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Icon name="TrendingUp" size={13} color={colors.textSecondary} />
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              Popular destinations in India:
            </Text>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {(cityQuery.length > 1
              ? popularCities.filter((city) =>
                city.toLowerCase().includes(cityQuery.toLowerCase()),
              )
              : popularCities
            ).map((city) => (
              <CityTag
                key={city}
                label={city}
                selected={metadata?.city === city}
                onPress={() => handleCitySelect(city)}
              />
            ))}
          </View>
        </View>

        {/* Browse by category */}
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Icon name="Layers" size={13} color={colors.textSecondary} />
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              Browse by category:
            </Text>
          </View>
          {cityCategories.map((cat) => (
            <View key={cat.name} style={{ gap: 8 }}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Icon name={cat.icon} size={15} color={colors.saffron} />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: colors.textPrimary,
                  }}
                >
                  {cat.name}
                </Text>
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {cat.cities.map((city) => (
                  <CityTag
                    key={city}
                    label={city}
                    selected={metadata?.city === city}
                    onPress={() => handleCitySelect(city)}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Tip box */}
        <View
          style={{
            padding: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "rgba(255,153,51,0.2)",
            backgroundColor: "rgba(255,153,51,0.05)",
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 8,
          }}
        >
          <Icon name="Lightbulb" size={14} color={colors.saffron} />
          <Text
            style={{
              flex: 1,
              fontSize: 12,
              color: colors.textPrimary,
              lineHeight: 18,
            }}
          >
            <Text style={{ fontWeight: "600" }}>Tip: </Text>
            Be specific with location names. Include state name if it's a common
            city name (e.g., "Udaipur, Rajasthan").
          </Text>
        </View>
      </View>

      {/* ── Travel Date ── */}
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Icon name="Calendar" size={20} color={colors.saffron} />
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: colors.textPrimary,
            }}
          >
            Travel Date
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: colors.border,
            backgroundColor: isDarkMode ? "#0b0e14" : "#fff",
          }}
        >
          <Icon name="Calendar" size={16} color={colors.textSecondary} />
          <TextInput
            value={metadata?.travelDate || ""}
            onChangeText={(text) => handleChange("travelDate", text)}
            placeholder="mm/dd/yyyy"
            placeholderTextColor={colors.textSecondary}
            style={{ flex: 1, fontSize: 14, color: colors.textPrimary }}
          />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Icon name="CalendarDays" size={13} color={colors.saffron} />
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>
            Optional - helps others plan their trips better
          </Text>
        </View>
      </View>

      {/* ── Trip Type ── */}
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Icon name="Compass" size={20} color={colors.saffron} />
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: colors.textPrimary,
            }}
          >
            Trip Type
          </Text>
        </View>

        {/* Dropdown trigger */}
        <Pressable
          onPress={() => setShowTripTypeDropdown((prev) => !prev)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: colors.border,
            backgroundColor: isDarkMode ? "#0b0e14" : "#fff",
            // opacity: pressed ? 0.9 : 1,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color:
                (metadata?.tripType || []).length > 0
                  ? colors.textPrimary
                  : colors.textSecondary,
            }}
          >
            {(metadata?.tripType || []).length > 0
              ? tripTypeOptions
                .filter((o) => (metadata?.tripType || []).includes(o.value))
                .map((o) => o.label)
                .join(", ")
              : "Select trip types (multiple)"}
          </Text>
          <Icon
            name={showTripTypeDropdown ? "ChevronUp" : "ChevronDown"}
            size={18}
            color={colors.textSecondary}
          />
        </Pressable>

        {/* Dropdown list */}
        {showTripTypeDropdown && (
          <View
            style={{
              borderRadius: 12,
              // borderWidth: 1.5,
              // borderColor: "rgba(255,153,51,0.3)",
              overflow: "hidden",
              backgroundColor: isDarkMode ? "#1f2937" : "#fff",
              maxHeight: 280,
              elevation: 5,
            }}
          >
            <ScrollView
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
              style={{ flexGrow: 0 }}
            >
              {tripTypeOptions.map((opt, idx) => {
                const isSelected = (metadata?.tripType || []).includes(
                  opt.value,
                );
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => toggleTripType(opt.value)}
                    style={{
                      top: 2,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingHorizontal: 14,
                      paddingVertical: 13,
                      borderRadius: 10,
                      // borderBottomWidth:
                      //   idx < tripTypeOptions.length - 1 ? 1 : 0,
                      // borderBottomColor: colors.borderSoft,
                      backgroundColor: isSelected
                        ? colors.saffron
                        : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: isSelected ? "600" : "400",
                        color: isSelected ? "#fff" : colors.textPrimary,
                      }}
                    >
                      {opt.label}
                    </Text>
                    {isSelected && <Icon name="Check" size={16} color="#fff" />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Icon name="Tag" size={13} color={colors.saffron} />
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>
            Helps categorize your travel experience
          </Text>
        </View>
      </View>

      {/* ── Privacy Settings ── */}
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Icon name="Shield" size={20} color={colors.saffron} />
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: colors.textPrimary,
            }}
          >
            Privacy Settings
          </Text>
        </View>

        {/* Dropdown trigger */}
        <Pressable
          onPress={() => setShowPrivacyDropdown((prev) => !prev)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: colors.border,
            backgroundColor: isDarkMode ? "#0b0e14" : "#fff",
            // opacity: pressed ? 0.9 : 1,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: colors.textPrimary,
            }}
          >
            {privacyOptions.find((o) => o.value === metadata?.privacy)?.label ||
              "Public - Everyone can see"}
          </Text>
          <Icon
            name={showPrivacyDropdown ? "ChevronUp" : "ChevronDown"}
            size={18}
            color={colors.textSecondary}
          />
        </Pressable>

        {/* Dropdown list */}
        {showPrivacyDropdown && (
          <View
            style={{
              borderRadius: 12,
              // borderWidth: 1.5,
              // borderColor: "rgba(255,153,51,0.3)",
              overflow: "hidden",
              backgroundColor: isDarkMode ? "#1f2937" : "#fff",
              elevation: 5,
            }}
          >
            {privacyOptions.map((opt, idx) => (
              <Pressable
                key={opt.value}
                onPress={() => {
                  handleChange("privacy", opt.value);
                  setShowPrivacyDropdown(false);
                }}
                style={{
                  top: 2,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 14,
                  paddingVertical: 13,
                  borderRadius: 10,
                  // borderBottomWidth:
                  //   idx < tripTypeOptions.length - 1 ? 1 : 0,
                  // borderBottomColor: colors.borderSoft,
                  backgroundColor:
                    metadata?.privacy === opt.value
                      ? colors.saffron
                      : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: metadata?.privacy === opt.value ? "600" : "400",
                    color:
                      metadata?.privacy === opt.value
                        ? "#fff"
                        : colors.textPrimary,
                  }}
                >
                  {opt.label}
                </Text>
                {metadata?.privacy === opt.value && (
                  <Icon name="Check" size={16} color={colors.saffron} />
                )}
              </Pressable>
            ))}
          </View>
        )}

        {/* Privacy info box */}
        <View
          style={{
            padding: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "rgba(255,153,51,0.2)",
            backgroundColor: "rgba(255,153,51,0.05)",
            gap: 8,
          }}
        >
          {[
            {
              dot: colors.saffron,
              label: "Public",
              desc: "Visible to all community members",
            },
            {
              // dot: colors.orange,
              label: "Friends Only",
              desc: "Only your connections can see",
            },
            { dot: "#f97316", label: "Private", desc: "Only visible to you" },
          ].map((item) => (
            <View
              key={item.label}
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: item.dot,
                }}
              />
              <Text style={{ fontSize: 12, color: colors.textPrimary }}>
                <Text style={{ fontWeight: "600", color: item.dot }}>
                  {item.label}:{" "}
                </Text>
                {item.desc}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Allow Comments ── */}
      <Pressable
        onPress={() => handleChange("allowComments", !metadata?.allowComments)}
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 12,
          padding: 16,
          borderRadius: 12,
          borderWidth: 0.5,
          // borderColor: colors.borderSoft,
          backgroundColor: isDarkMode ? "#111827" : colors.white,
          // opacity: pressed ? 0.9 : 1,
        }}
      >
        {/* Checkbox */}
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            borderWidth: 2,
            borderColor:
              metadata?.allowComments !== false
                ? colors.saffron
                : colors.textSecondary,
            backgroundColor:
              metadata?.allowComments !== false
                ? colors.saffron
                : "transparent",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 2,
          }}
        >
          {metadata?.allowComments !== false && (
            <Icon name="Check" size={13} color="#fff" />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <Icon name="MessageCircle" size={17} color={colors.saffron} />
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: colors.textPrimary,
              }}
            >
              Allow Comments
            </Text>
          </View>
          <Text
            style={{
              fontSize: 12,
              color: colors.textSecondary,
              lineHeight: 18,
            }}
          >
            Let fellow travelers share their thoughts, ask questions, and
            connect with you about your experience. Disabling comments will
            prevent others from commenting on your post.
          </Text>
        </View>
      </Pressable>

      {/* ── Form note ── */}
      <View
        style={{
          padding: 12,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "rgba(255,153,51,0.2)",
          backgroundColor: "rgba(255,153,51,0.05)",
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 8,
        }}
      >
        <Icon name="HelpCircle" size={16} color={colors.saffron} />
        <View style={{ flex: 1 }}>
          <Text
            style={{ fontSize: 12, color: colors.textPrimary, lineHeight: 18 }}
          >
            ✨{" "}
            <Text style={{ fontWeight: "700", color: colors.saffron }}>
              Destination is required
            </Text>{" "}
            to help others discover your story
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: colors.textSecondary,
              marginTop: 4,
              lineHeight: 18,
            }}
          >
            Other fields are optional but help categorize your post better and
            reach the right audience
          </Text>
        </View>
      </View>
    </View>
  );
};

export default PostMetadataForm;
