import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { useDarkMode } from "../../../context/DarkModeContext";

const budgetOptions = [
  { value: "budget", label: "Budget (₹5,000 - ₹15,000)" },
  { value: "moderate", label: "Moderate (₹15,000 - ₹30,000)" },
  { value: "luxury", label: "Luxury (₹30,000+)" },
];

const accommodationOptions = [
  { value: "hostel", label: "Hostel/Backpackers" },
  { value: "hotel", label: "Hotel" },
  { value: "homestay", label: "Homestay" },
  { value: "camping", label: "Camping" },
];

const popularActivities = [
  { id: 1, name: "Trekking & Hiking", icon: "Mountain" },
  { id: 2, name: "Local Food Tours", icon: "UtensilsCrossed" },
  { id: 3, name: "Photography Walks", icon: "Camera" },
  { id: 4, name: "Café Hopping", icon: "Coffee" },
  { id: 5, name: "Shopping", icon: "ShoppingBag" },
  { id: 6, name: "Cultural Sites", icon: "Landmark" },
];

const suggestedItineraries = [
  {
    id: 1,
    title: "Weekend Getaway",
    duration: "2-3 days",
    highlights: ["City tour", "Local food", "Shopping", "Café hopping"],
    icon: "Coffee",
  },
  {
    id: 2,
    title: "Adventure Package",
    duration: "4-5 days",
    highlights: ["Trekking", "Camping", "Mountain biking", "Photography"],
    icon: "Mountain",
  },
  {
    id: 3,
    title: "Cultural Experience",
    duration: "3-4 days",
    highlights: [
      "Heritage sites",
      "Local markets",
      "Traditional food",
      "Workshops",
    ],
    icon: "Landmark",
  },
];

// ── Reusable chip select — RN equivalent of web's Select ──
const ChipSelect = ({
  label,
  options,
  value,
  onChange,
  isDarkMode,
  colors,
}) => (
  <View style={{ marginBottom: 16 }}>
    <Text
      style={{
        fontSize: 14,
        fontWeight: "500",
        color: colors.textPrimary,
        marginBottom: 8,
      }}
    >
      {label}
    </Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {options.map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
              borderWidth: 1,
              backgroundColor: value === opt.value ? "#FF9933" : "transparent",
              borderColor: value === opt.value ? "#FF9933" : colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "500",
                color: value === opt.value ? "#fff" : colors.textSecondary,
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  </View>
);

const TripPlanningTab = ({ cityName, onCreateTrip }) => {
  const { isDarkMode } = useDarkMode();

  const colors = {
    bg: isDarkMode ? "#1f2937" : "#fff",
    bgSecondary: isDarkMode ? "#374151" : "#f3f4f6",
    bgInput: isDarkMode ? "#111827" : "#f9fafb",
    border: isDarkMode ? "#374151" : "#e5e7eb",
    textPrimary: isDarkMode ? "#f9fafb" : "#111827",
    textSecondary: isDarkMode ? "#9ca3af" : "#6b7280",
  };

  const [tripData, setTripData] = useState({
    title: `My ${cityName} Adventure`,
    startDate: "",
    endDate: "",
    budget: "",
    travelers: "1",
    accommodation: "",
    activities: [],
  });

  const handleActivityToggle = (name) => {
    setTripData((prev) => ({
      ...prev,
      activities: prev.activities.includes(name)
        ? prev.activities.filter((a) => a !== name)
        : [...prev.activities, name],
    }));
  };

  const inputStyle = {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgInput,
    fontSize: 14,
    color: colors.textPrimary,
  };

  return (
    <View style={{ gap: 24 }}>
      {/* ── Header Banner — matches web: bg-gradient from-blue-500/10 to-purple-500/10 border-blue-500/20 ── */}
      <View
        style={{
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: "rgba(59,130,246,0.2)",
          // RN linear gradient workaround: layered bg with blue tint
          backgroundColor: isDarkMode
            ? "rgba(59,130,246,0.08)"
            : "rgba(59,130,246,0.07)",
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 16,
        }}
      >
        {/* matches web: w-12 h-12 md:w-16 md:h-16 rounded-xl bg-blue-500/20 */}
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: "rgba(59,130,246,0.2)",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon name="MapPin" size={24} color="#3b82f6" />
        </View>
        <View style={{ flex: 1 }}>
          {/* matches web: text-lg md:text-xl font-semibold text-[var(--color-text-primary)] mb-2 */}
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: colors.textPrimary,
              marginBottom: 8,
            }}
          >
            Plan Your {cityName} Trip
          </Text>
          {/* matches web full description */}
          <Text
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              lineHeight: 20,
            }}
          >
            Create a customized itinerary with pre-populated city information
            and suggested activities
          </Text>
        </View>
      </View>

      {/* ── Trip Details Form — matches web: bg-[var(--color-bg-card)] rounded-xl p-4 md:p-6 border ── */}
      <View
        style={{
          backgroundColor: colors.bg,
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
          gap: 16,
        }}
      >
        <Text
          style={{ fontSize: 16, fontWeight: "600", color: colors.textPrimary }}
        >
          Trip Details
        </Text>

        {/* Trip Title — matches web: Input label='Trip Title' */}
        <View>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: colors.textPrimary,
              marginBottom: 6,
            }}
          >
            Trip Title
          </Text>
          <TextInput
            value={tripData.title}
            onChangeText={(v) => setTripData({ ...tripData, title: v })}
            placeholder="Enter trip title"
            placeholderTextColor={colors.textSecondary}
            style={inputStyle}
          />
        </View>

        {/* Dates — matches web: grid grid-cols-2 gap-4 */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: colors.textPrimary,
                marginBottom: 6,
              }}
            >
              Start Date
            </Text>
            <TextInput
              value={tripData.startDate}
              onChangeText={(v) => setTripData({ ...tripData, startDate: v })}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textSecondary}
              style={inputStyle}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: colors.textPrimary,
                marginBottom: 6,
              }}
            >
              End Date
            </Text>
            <TextInput
              value={tripData.endDate}
              onChangeText={(v) => setTripData({ ...tripData, endDate: v })}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textSecondary}
              style={inputStyle}
            />
          </View>
        </View>

        {/* Budget — matches web: Select label='Budget Range' */}
        <ChipSelect
          label="Budget Range"
          options={budgetOptions}
          value={tripData.budget}
          onChange={(v) => setTripData({ ...tripData, budget: v })}
          isDarkMode={isDarkMode}
          colors={colors}
        />

        {/* Travelers — matches web: Input label='Number of Travelers' type='number' */}
        <View>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: colors.textPrimary,
              marginBottom: 6,
            }}
          >
            Number of Travelers
          </Text>
          <TextInput
            value={tripData.travelers}
            onChangeText={(v) => setTripData({ ...tripData, travelers: v })}
            keyboardType="number-pad"
            placeholderTextColor={colors.textSecondary}
            style={[inputStyle, { width: 96 }]}
          />
        </View>

        {/* Accommodation — matches web: Select label='Accommodation Type' */}
        <ChipSelect
          label="Accommodation Type"
          options={accommodationOptions}
          value={tripData.accommodation}
          onChange={(v) => setTripData({ ...tripData, accommodation: v })}
          isDarkMode={isDarkMode}
          colors={colors}
        />

        {/* Activities — matches web: Checkbox grid grid-cols-2
            RN equivalent: 2-col grid of checkbox-style rows with icon + label */}
        <View>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: colors.textPrimary,
              marginBottom: 12,
            }}
          >
            Select Activities
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {popularActivities.map((act) => {
              const checked = tripData.activities.includes(act.name);
              return (
                // matches web: Checkbox with icon + name label, checked = blue-500
                <Pressable
                  key={act.id}
                  onPress={() => handleActivityToggle(act.name)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    width: "47%",
                  }}
                >
                  {/* Checkbox square — matches web Checkbox component */}
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      borderWidth: 1.5,
                      borderColor: checked ? "#3b82f6" : colors.border,
                      backgroundColor: checked ? "#3b82f6" : "transparent",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {checked && <Icon name="Check" size={11} color="#fff" />}
                  </View>
                  {/* Icon + label — matches web: flex items-center gap-2 */}
                  <Icon
                    name={act.icon}
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={{ fontSize: 13, color: colors.textPrimary, flex: 1 }}
                    numberOfLines={1}
                  >
                    {act.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Action Buttons — matches web: flex flex-col sm:flex-row gap-3 pt-4 */}
        <View style={{ gap: 12, paddingTop: 4 }}>
          {/* Create Trip Plan — matches web: Button variant='default' iconName='Calendar' */}
          <Pressable
            onPress={() => onCreateTrip(tripData)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              paddingVertical: 12,
              borderRadius: 8,
              backgroundColor: "#FF9933",
            }}
          >
            <Icon name="Calendar" size={18} color="#fff" />
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#fff" }}>
              Create Trip Plan
            </Text>
          </Pressable>

          {/* Save as Draft — matches web: Button variant='outline' iconName='Save'
              border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] */}
          <Pressable
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              paddingVertical: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: "transparent",
            }}
          >
            <Icon name="Save" size={18} color={colors.textPrimary} />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.textPrimary,
              }}
            >
              Save as Draft
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ── Suggested Itineraries — matches web: bg-[var(--color-bg-card)] rounded-xl p-4 md:p-6 border ── */}
      <View
        style={{
          backgroundColor: colors.bg,
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: colors.textPrimary,
            marginBottom: 16,
          }}
        >
          Suggested Itineraries
        </Text>
        <View style={{ gap: 12 }}>
          {suggestedItineraries.map((it) => (
            // matches web: p-4 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)]
            <View
              key={it.id}
              style={{
                padding: 16,
                backgroundColor: colors.bgSecondary,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              {/* matches web: flex items-start gap-3 mb-3 */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                {/* matches web: w-10 h-10 rounded-lg bg-blue-500/10 */}
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    backgroundColor: "rgba(59,130,246,0.1)",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon name={it.icon} size={20} color="#3b82f6" />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: colors.textPrimary,
                      marginBottom: 4,
                    }}
                  >
                    {it.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                    {it.duration}
                  </Text>
                </View>
              </View>
              {/* Highlights — matches web: flex flex-wrap gap-2, bg-[var(--color-bg-primary)] rounded text-xs */}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {it.highlights.map((h, i) => (
                  <View
                    key={i}
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      backgroundColor: isDarkMode ? "#1f2937" : "#fff",
                      borderRadius: 4,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                      {h}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* ── Quick Tips — matches web: bg-[var(--color-bg-card)] rounded-xl p-4 md:p-6 border ── */}
      <View
        style={{
          backgroundColor: colors.bg,
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: colors.textPrimary,
            marginBottom: 16,
          }}
        >
          Quick Tips
        </Text>
        <View style={{ gap: 12 }}>
          {[
            "Best time to visit: March to June",
            "Book accommodations 2-3 weeks in advance",
            "Carry warm clothing for evenings",
            "Local transport is easily available",
          ].map((tip, i) => (
            // matches web: flex gap-3, icon size={18} text-green-500
            <View key={i} style={{ flexDirection: "row", gap: 12 }}>
              <Icon name="CheckCircle2" size={18} color="#10b981" />
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  flex: 1,
                  lineHeight: 20,
                }}
              >
                {tip}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default TripPlanningTab;
