import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { useDarkMode } from "../../../context/DarkModeContext";

// ── Reusable dropdown — replaces web <Select> component ───
const Dropdown = ({ options, value, onChange, placeholder, isDarkMode }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={{ position: "relative", zIndex: 10 }}>
      {/* Trigger — matches web Select trigger */}
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
          borderColor: isDarkMode ? "#374151" : "#e5e7eb",
          backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
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
          {selected ? selected.label : placeholder}
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
            position: "absolute",
            top: "110%",
            left: 0,
            right: 0,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: isDarkMode ? "#374151" : "#e5e7eb",
            backgroundColor: isDarkMode ? "#1f2937" : "#fff",
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            zIndex: 999,
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
                    color:
                      value === opt.value
                        ? "#fff"
                        : isDarkMode
                          ? "#f9fafb"
                          : "#111827",
                    fontWeight: value === opt.value ? "600" : "400",
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
const FilterControls = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}) => {
  const { isDarkMode } = useDarkMode();

  // matches web exactly — all 4 options
  const statusOptions = [
    { value: "all", label: "All Trips" },
    { value: "planned", label: "Planned" },
    { value: "ongoing", label: "Ongoing" },
    { value: "completed", label: "Completed" },
  ];

  // matches web exactly — all 6 options with exact labels
  const sortOptions = [
    { value: "date-desc", label: "Newest First" },
    { value: "date-asc", label: "Oldest First" },
    { value: "title-asc", label: "Title (A-Z)" },
    { value: "title-desc", label: "Title (Z-A)" },
    { value: "duration-desc", label: "Longest Duration" },
    { value: "duration-asc", label: "Shortest Duration" },
  ];

  return (
    // matches web: bg-[var(--color-bg-card)] rounded-xl p-4 border mb-6 md:mb-8
    <View
      style={{
        backgroundColor: isDarkMode ? "#1f2937" : "#fff",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: isDarkMode ? "#374151" : "#e5e7eb",
        marginBottom: 24,
        gap: 16,
      }}
    >
      {/* ── matches web: <div className="flex flex-col lg:flex-row gap-4"> ── */}
      <View style={{ gap: 16 }}>
        {/* Search — matches web: relative Input with Search icon on left */}
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: isDarkMode ? "#374151" : "#e5e7eb",
              backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
            }}
          >
            {/* matches web: <Icon name="Search" className="absolute left-3 top-1/2"> */}
            <Icon
              name="Search"
              size={18}
              color={isDarkMode ? "#9ca3af" : "#6b7280"}
            />
            <TextInput
              value={searchQuery}
              onChangeText={onSearchChange}
              placeholder="Search trips by title or destination..."
              placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
              style={{
                flex: 1,
                fontSize: 14,
                color: isDarkMode ? "#f9fafb" : "#111827",
                paddingVertical: 0,
              }}
            />
          </View>
        </View>

        {/* Filters row — matches web: <div className="flex flex-col sm:flex-row gap-4"> */}
        <View
          style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}
        >
          {/* Status Filter — matches web: <Select> w-full sm:w-48 */}
          <View style={{ flex: 1 }}>
            <Dropdown
              options={statusOptions}
              value={statusFilter}
              onChange={onStatusChange}
              placeholder="Filter by status"
              isDarkMode={isDarkMode}
            />
          </View>

          {/* Sort Options — matches web: <Select> w-full sm:w-48 */}
          <View style={{ flex: 1 }}>
            <Dropdown
              options={sortOptions}
              value={sortBy}
              onChange={onSortChange}
              placeholder="Sort by"
              isDarkMode={isDarkMode}
            />
          </View>

          {/* View Mode Toggle — matches web: border rounded-lg p-1 bg-secondary */}
          <View
            style={{
              flexDirection: "row",
              gap: 4,
              borderWidth: 1,
              borderColor: isDarkMode ? "#374151" : "#e5e7eb",
              borderRadius: 8,
              padding: 4,
              backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
            }}
          >
            {/* Grid button — matches web: bg-blue-500 when active */}
            <Pressable
              onPress={() => onViewModeChange("grid")}
              style={{
                padding: 8,
                borderRadius: 6,
                backgroundColor:
                  viewMode === "grid" ? "#3b82f6" : "transparent",
              }}
              aria-label="Grid view"
            >
              <Icon
                name="Grid3x3"
                size={18}
                color={
                  viewMode === "grid"
                    ? "#fff"
                    : isDarkMode
                      ? "#9ca3af"
                      : "#6b7280"
                }
              />
            </Pressable>

            {/* List button — matches web: bg-blue-500 when active */}
            <Pressable
              onPress={() => onViewModeChange("list")}
              style={{
                padding: 8,
                borderRadius: 6,
                backgroundColor:
                  viewMode === "list" ? "#3b82f6" : "transparent",
              }}
              aria-label="List view"
            >
              <Icon
                name="List"
                size={18}
                color={
                  viewMode === "list"
                    ? "#fff"
                    : isDarkMode
                      ? "#9ca3af"
                      : "#6b7280"
                }
              />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

export default FilterControls;
