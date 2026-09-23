import { Pressable, TextInput, View } from "react-native";
import Select from "../../../components/ui/Select";
import Icon from "../../../components/AppIcon";
import { Shadow } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";

// Mirrors web pages/my-trips/components/FilterControls.jsx.
const STATUS_OPTIONS = [
  { value: "all", label: "All Trips" },
  { value: "planned", label: "Planned" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
];

const SORT_OPTIONS = [
  { value: "date-desc", label: "Newest First" },
  { value: "date-asc", label: "Oldest First" },
  { value: "title-asc", label: "Title (A-Z)" },
  { value: "title-desc", label: "Title (Z-A)" },
  { value: "duration-desc", label: "Longest Duration" },
  { value: "duration-asc", label: "Shortest Duration" },
];

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
  const { theme } = useDarkMode();

  return (
    <View
      style={{
        padding: 14,
        borderRadius: 16,
        marginBottom: 16,
        gap: 10,
        backgroundColor: theme.surfaceContainerLowest,
        ...Shadow.soft,
      }}
    >
      {/* Search */}
      <View style={{ position: "relative", justifyContent: "center" }}>
        <Icon
          name="Search"
          size={16}
          color={theme.outline}
          style={{ position: "absolute", left: 14, zIndex: 1 }}
        />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search trips by title or destination..."
          placeholderTextColor={theme.outline}
          style={{
            paddingLeft: 40,
            paddingRight: 14,
            paddingVertical: 11,
            borderRadius: 12,
            fontSize: 14,
            color: theme.onSurface,
            backgroundColor: theme.surfaceContainerLow,
          }}
        />
      </View>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={onStatusChange}
            placeholder="All Trips"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Select
            options={SORT_OPTIONS}
            value={sortBy}
            onChange={onSortChange}
            placeholder="Sort"
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            gap: 2,
            padding: 3,
            borderRadius: 12,
            backgroundColor: theme.surfaceContainerLow,
          }}
        >
          <Pressable
            onPress={() => onViewModeChange("grid")}
            style={{
              padding: 8,
              borderRadius: 9,
              backgroundColor: viewMode === "grid" ? theme.primary : "transparent",
            }}
          >
            <Icon
              name="Grid3x3"
              size={16}
              color={viewMode === "grid" ? "#FFFFFF" : theme.onSurfaceVariant}
            />
          </Pressable>
          <Pressable
            onPress={() => onViewModeChange("list")}
            style={{
              padding: 8,
              borderRadius: 9,
              backgroundColor: viewMode === "list" ? theme.primary : "transparent",
            }}
          >
            <Icon
              name="List"
              size={16}
              color={viewMode === "list" ? "#FFFFFF" : theme.onSurfaceVariant}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default FilterControls;
