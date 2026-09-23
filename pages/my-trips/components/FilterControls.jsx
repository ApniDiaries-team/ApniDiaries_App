import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { Fonts, Palette } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";

const Dropdown = ({ label, options, value, onChange, colors, isDarkMode }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((item) => item.value === value);
  return (
    <View style={{ flex: 1, minWidth: 145, zIndex: open ? 20 : 1 }}>
      <Pressable onPress={() => setOpen((state) => !state)} style={{ minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.input }}>
        <Text numberOfLines={1} style={{ flex: 1, fontFamily: Fonts.inter.medium, fontSize: 13, color: selected ? colors.text : colors.muted }}>{selected?.label || label}</Text>
        <Icon name={open ? "ChevronUp" : "ChevronDown"} size={15} color={colors.muted} />
      </Pressable>
      {open && <View style={{ position: "absolute", left: 0, right: 0, top: 48, maxHeight: 210, borderRadius: 10, overflow: "hidden", borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, elevation: 10, zIndex: 50 }}><ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">{options.map((option) => <Pressable key={option.value} onPress={() => { onChange(option.value); setOpen(false); }} style={{ paddingHorizontal: 12, paddingVertical: 11, backgroundColor: value === option.value ? colors.selected : "transparent" }}><Text style={{ fontFamily: value === option.value ? Fonts.inter.semibold : Fonts.inter.regular, fontSize: 13, color: value === option.value ? colors.primary : colors.text }}>{option.label}</Text></Pressable>)}</ScrollView></View>}
    </View>
  );
};

const FilterControls = ({ searchQuery, onSearchChange, statusFilter, onStatusChange, sortBy, onSortChange, viewMode, onViewModeChange }) => {
  const { isDarkMode } = useDarkMode();
  const colors = {
    surface: isDarkMode ? Palette.dark.surfaceLowest : Palette.light.surfaceLowest,
    input: isDarkMode ? "rgba(255,255,255,0.05)" : Palette.light.surfaceLow,
    text: isDarkMode ? Palette.dark.text : Palette.light.text,
    muted: isDarkMode ? Palette.dark.textVariant : Palette.light.textVariant,
    border: isDarkMode ? Palette.dark.outlineVariant : Palette.light.outlineVariant,
    primary: isDarkMode ? Palette.dark.primary : Palette.light.primary,
    selected: isDarkMode ? "rgba(237,137,54,0.18)" : "#FCE8DC",
  };
  const statusOptions = [
    { value: "all", label: "All Trips" }, { value: "planned", label: "Planned" },
    { value: "ongoing", label: "Ongoing" }, { value: "completed", label: "Completed" },
  ];
  const sortOptions = [
    { value: "date-desc", label: "Newest First" }, { value: "date-asc", label: "Oldest First" },
    { value: "title-asc", label: "Title (A-Z)" }, { value: "title-desc", label: "Title (Z-A)" },
    { value: "duration-desc", label: "Longest Duration" }, { value: "duration-asc", label: "Shortest Duration" },
  ];
  return (
    <View style={{ padding: 16, borderRadius: 16, marginBottom: 24, gap: 12, backgroundColor: colors.surface, borderWidth: isDarkMode ? 1 : 0, borderColor: colors.border, shadowColor: isDarkMode ? "#000" : "#6A3824", shadowOffset: { width: 0, height: 3 }, shadowOpacity: isDarkMode ? 0.15 : 0.05, shadowRadius: 10, elevation: 2 }}>
      <View style={{ minHeight: 44, flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: isDarkMode ? colors.border : "transparent", backgroundColor: colors.input }}>
        <Icon name="Search" size={16} color={colors.muted} />
        <TextInput value={searchQuery} onChangeText={onSearchChange} placeholder="Search trips by title or destination..." placeholderTextColor={colors.muted} style={{ flex: 1, paddingVertical: 9, fontFamily: Fonts.inter.regular, fontSize: 13, color: colors.text }} />
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
        <Dropdown label="All Trips" options={statusOptions} value={statusFilter} onChange={onStatusChange} colors={colors} isDarkMode={isDarkMode} />
        <Dropdown label="Sort by" options={sortOptions} value={sortBy} onChange={onSortChange} colors={colors} isDarkMode={isDarkMode} />
        <View style={{ flexDirection: "row", gap: 4, padding: 4, borderRadius: 10, backgroundColor: colors.input }}>
          {[{ id: "grid", icon: "Grid3x3" }, { id: "list", icon: "List" }].map((mode) => <Pressable key={mode.id} accessibilityRole="button" accessibilityLabel={`${mode.id} view`} onPress={() => onViewModeChange(mode.id)} style={{ padding: 8, borderRadius: 7, backgroundColor: viewMode === mode.id ? colors.primary : "transparent" }}><Icon name={mode.icon} size={16} color={viewMode === mode.id ? "#FFFFFF" : colors.muted} /></Pressable>)}
        </View>
      </View>
    </View>
  );
};

export default FilterControls;
