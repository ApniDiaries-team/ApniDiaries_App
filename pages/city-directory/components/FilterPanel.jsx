import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { useDarkMode } from "../../../context/DarkModeContext";

// ── Dropdown — replaces web <Select> component ─────────────
const FilterDropdown = ({ label, options, value, onChange, isDarkMode }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={{ gap: 6 }}>
      {/* Label — matches web Select label style: text-sm font-medium */}
      <Text
        style={{
          fontSize: 14,
          fontWeight: "500",
          color: isDarkMode ? "#f9fafb" : "#111827",
        }}
      >
        {label}
      </Text>

      {/* Trigger — matches web Select trigger: bg-[var(--color-bg-card)] border */}
      <Pressable
        onPress={() => setOpen((prev) => !prev)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: open ? "#3b82f6" : isDarkMode ? "#374151" : "#e5e7eb",
          // matches web: bg-[var(--color-bg-card)] — white in light, dark card in dark
          backgroundColor: "#ffffff",
        }}
      >
        <Text
          style={{
            fontSize: 14,
            color: selected
              ? isDarkMode
                ? "#f9fafb"
                : "#111827"
              : isDarkMode
                ? "#6b7280"
                : "#9ca3af",
            flex: 1,
          }}
        >
          {selected ? selected.label : `Select ${label}`}
        </Text>
        <Icon
          name={open ? "ChevronUp" : "ChevronDown"}
          size={16}
          color={isDarkMode ? "#9ca3af" : "#6b7280"}
        />
      </Pressable>

      {/* Dropdown list */}
      {open && (
        <View
          style={{
            borderRadius: 8,
            borderWidth: 1,
            borderColor: isDarkMode ? "#374151" : "#e5e7eb",
            backgroundColor: isDarkMode ? "#1f2937" : "#fff",
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            overflow: "hidden",
          }}
        >
          <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
            {options.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  backgroundColor:
                    value === opt.value ? "#3b82f6" : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: value === opt.value ? "600" : "400",
                    color:
                      value === opt.value
                        ? "#fff"
                        : isDarkMode
                          ? "#f9fafb"
                          : "#111827",
                  }}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

// ── Main Component ─────────────────────────────────────────
const FilterPanel = ({
  filters,
  onFilterChange,
  onClearFilters,
  isOpen,
  onToggle,
}) => {
  const { isDarkMode } = useDarkMode();

  const regionOptions = [
    { value: "all", label: "All Regions" },
    { value: "north", label: "North India" },
    { value: "south", label: "South India" },
    { value: "east", label: "East India" },
    { value: "west", label: "West India" },
    { value: "central", label: "Central India" },
    { value: "northeast", label: "Northeast India" },
  ];

  const travelStyleOptions = [
    { value: "all", label: "All Styles" },
    { value: "adventure", label: "Adventure" },
    { value: "cultural", label: "Cultural" },
    { value: "relaxation", label: "Relaxation" },
    { value: "backpacking", label: "Backpacking" },
    { value: "luxury", label: "Luxury" },
    { value: "spiritual", label: "Spiritual" },
  ];

  const climateOptions = [
    { value: "all", label: "All Climates" },
    { value: "tropical", label: "Tropical" },
    { value: "temperate", label: "Temperate" },
    { value: "cold", label: "Cold" },
    { value: "arid", label: "Arid" },
    { value: "coastal", label: "Coastal" },
    { value: "mountain", label: "Mountain" },
  ];

  const activityOptions = [
    { value: "all", label: "All Activities" },
    { value: "trekking", label: "Trekking" },
    { value: "sightseeing", label: "Sightseeing" },
    { value: "photography", label: "Photography" },
    { value: "food", label: "Food Tours" },
    { value: "shopping", label: "Shopping" },
    { value: "nightlife", label: "Nightlife" },
    { value: "wildlife", label: "Wildlife" },
    { value: "water-sports", label: "Water Sports" },
  ];

  const hasActiveFilters =
    filters?.region !== "all" ||
    filters?.travelStyle !== "all" ||
    filters?.climate !== "all" ||
    filters?.activity !== "all";

  return (
    <View>
      {/* ── Toggle Button — matches web: variant='outline' hover:bg-[var(--color-bg-secondary)] ── */}
      <View style={{ marginBottom: 16 }}>
        <Pressable
          onPress={onToggle}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: isDarkMode ? "#374151" : "#e5e7eb",
            // matches web: hover:bg-[var(--color-bg-secondary)]
            backgroundColor: "transparent",
            width: "100%",
          }}
        >
          <Icon
            name={isOpen ? "X" : "SlidersHorizontal"}
            size={16}
            color={isDarkMode ? "#f9fafb" : "#374151"}
          />
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: isDarkMode ? "#f9fafb" : "#374151",
            }}
          >
            {isOpen ? "Close Filters" : "Show Filters"}
          </Text>
          {/* matches web: ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full */}
          {hasActiveFilters && (
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 999,
                backgroundColor: "#3b82f6",
                marginLeft: 4,
              }}
            >
              <Text style={{ fontSize: 12, color: "#fff", fontWeight: "600" }}>
                Active
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* ── Filter Panel — matches web: bg-[var(--color-bg-card)] rounded-xl p-4 md:p-6 border ── */}
      {isOpen && (
        <View
          style={{
            backgroundColor: isDarkMode ? "#1f2937" : "#fff",
            borderRadius: 12,
            padding: 20,
            borderWidth: 1,
            borderColor: isDarkMode ? "#374151" : "#e5e7eb",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 4,
            gap: 24,
          }}
        >
          {/* Panel Header — matches web: flex items-center justify-between mb-6 */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* matches web: text-lg font-semibold — NOT playfair, plain system font */}
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Icon name="SlidersHorizontal" size={20} color="#3b82f6" />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: isDarkMode ? "#f9fafb" : "#111827",
                }}
              >
                Filters
              </Text>
            </View>

            {/* matches web: Button variant='ghost' size='sm' — plain text, hover bg on press */}
            {hasActiveFilters && (
              <Pressable
                onPress={onClearFilters}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                  // matches web: hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]
                  backgroundColor: "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: isDarkMode ? "#9ca3af" : "#6b7280",
                  }}
                >
                  Clear All
                </Text>
              </Pressable>
            )}
          </View>

          {/* Filter Selects — matches web: space-y-4 */}
          <View style={{ gap: 16 }}>
            <FilterDropdown
              label="Region"
              options={regionOptions}
              value={filters?.region}
              onChange={(value) => onFilterChange("region", value)}
              isDarkMode={isDarkMode}
            />
            <FilterDropdown
              label="Travel Style"
              options={travelStyleOptions}
              value={filters?.travelStyle}
              onChange={(value) => onFilterChange("travelStyle", value)}
              isDarkMode={isDarkMode}
            />
            <FilterDropdown
              label="Climate"
              options={climateOptions}
              value={filters?.climate}
              onChange={(value) => onFilterChange("climate", value)}
              isDarkMode={isDarkMode}
            />
            <FilterDropdown
              label="Activity Type"
              options={activityOptions}
              value={filters?.activity}
              onChange={(value) => onFilterChange("activity", value)}
              isDarkMode={isDarkMode}
            />
          </View>

          {/* Active Filters — matches web: mt-6 pt-6 border-t */}
          {hasActiveFilters && (
            <View
              style={{
                paddingTop: 20,
                borderTopWidth: 1,
                borderTopColor: isDarkMode ? "#374151" : "#e5e7eb",
                gap: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: isDarkMode ? "#9ca3af" : "#6b7280",
                }}
              >
                Active Filters:
              </Text>

              {/* Filter tags — matches web: flex flex-wrap gap-2 */}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {/* Region — matches web: bg-blue-500/10 text-blue-600 dark:text-blue-400 */}
                {filters?.region !== "all" && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderRadius: 999,
                      backgroundColor: "rgba(59,130,246,0.1)",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: isDarkMode ? "#60a5fa" : "#2563eb",
                      }}
                    >
                      {
                        regionOptions?.find((o) => o?.value === filters?.region)
                          ?.label
                      }
                    </Text>
                    {/* matches web: hover:opacity-70 on X */}
                    <Pressable
                      onPress={() => onFilterChange("region", "all")}
                      style={{ opacity: 1 }}
                      hitSlop={8}
                    >
                      <Icon
                        name="X"
                        size={12}
                        color={isDarkMode ? "#60a5fa" : "#2563eb"}
                      />
                    </Pressable>
                  </View>
                )}

                {/* Travel Style — matches web: bg-purple-500/10 text-purple-600 dark:text-purple-400 */}
                {filters?.travelStyle !== "all" && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderRadius: 999,
                      backgroundColor: "rgba(168,85,247,0.1)",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: isDarkMode ? "#c084fc" : "#9333ea",
                      }}
                    >
                      {
                        travelStyleOptions?.find(
                          (o) => o?.value === filters?.travelStyle,
                        )?.label
                      }
                    </Text>
                    <Pressable
                      onPress={() => onFilterChange("travelStyle", "all")}
                      style={{ opacity: 1 }}
                      hitSlop={8}
                    >
                      <Icon
                        name="X"
                        size={12}
                        color={isDarkMode ? "#c084fc" : "#9333ea"}
                      />
                    </Pressable>
                  </View>
                )}

                {/* Climate — matches web: bg-green-500/10 text-green-600 dark:text-green-400 */}
                {filters?.climate !== "all" && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderRadius: 999,
                      backgroundColor: "rgba(34,197,94,0.1)",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: isDarkMode ? "#4ade80" : "#16a34a",
                      }}
                    >
                      {
                        climateOptions?.find(
                          (o) => o?.value === filters?.climate,
                        )?.label
                      }
                    </Text>
                    <Pressable
                      onPress={() => onFilterChange("climate", "all")}
                      style={{ opacity: 1 }}
                      hitSlop={8}
                    >
                      <Icon
                        name="X"
                        size={12}
                        color={isDarkMode ? "#4ade80" : "#16a34a"}
                      />
                    </Pressable>
                  </View>
                )}

                {/* Activity — matches web: bg-orange-500/10 text-orange-600 dark:text-orange-400 */}
                {filters?.activity !== "all" && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderRadius: 999,
                      backgroundColor: "rgba(249,115,22,0.1)",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: isDarkMode ? "#fb923c" : "#ea580c",
                      }}
                    >
                      {
                        activityOptions?.find(
                          (o) => o?.value === filters?.activity,
                        )?.label
                      }
                    </Text>
                    <Pressable
                      onPress={() => onFilterChange("activity", "all")}
                      style={{ opacity: 1 }}
                      hitSlop={8}
                    >
                      <Icon
                        name="X"
                        size={12}
                        color={isDarkMode ? "#fb923c" : "#ea580c"}
                      />
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default FilterPanel;
