import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { useDarkMode } from "../../../context/DarkModeContext";
import { Fonts } from "../../../constants/theme";

const FilterBar = ({
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
  selectedCity,
  onCityChange,
  cities,
  onSearchToggle,
}) => {
  const { isDarkMode } = useDarkMode();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCities, setFilteredCities] = useState(cities || []);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const colors = {
    bgCard: isDarkMode ? "#1E242F" : "#EDF2F7",
    bgSecondary: isDarkMode ? "#1A1F29" : "#F7FAFC",
    bgPrimary: isDarkMode ? "#0B0E14" : "#FFFFFF",
    textPrimary: isDarkMode ? "#FFFFFF" : "#1A202C",
    textSecondary: isDarkMode ? "#A0AEC0" : "#4A5568",
    border: isDarkMode ? "#2D3748" : "#E2E8F0",
    brandPrimary: "#FF9933",
    brandSecondary: "#FF6B00",
  };

  const filters = [
    { id: "all", label: "All", icon: "Users" },
    { id: "online", label: "Online", icon: "Wifi" },
    { id: "recent", label: "Recently Active", icon: "Clock" },
  ];

  const sortOptions = [
    { id: "recent", label: "Recent Activity", icon: "Clock" },
    { id: "favorites", label: "Favorites", icon: "Heart" },
    { id: "alphabetical", label: "A-Z", icon: "ArrowDownAZ" },
  ];

  const selectedCityName =
    cities?.find((c) => c.id === selectedCity)?.name || "";

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCities(cities || []);
    } else {
      setFilteredCities(
        (cities || []).filter((c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      );
    }
  }, [searchTerm, cities]);

  const handleCitySelect = (cityId) => {
    onCityChange(cityId);
    setIsDropdownOpen(false);
    setSearchTerm("");
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
      {/* Header — always visible */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            fontSize: 16, // Adjusted to match md:text-base conceptually
            fontFamily: Fonts.playfair.bold,
            color: colors.textPrimary,
          }}
        >
          Filters & Sort
        </Text>
        <Pressable
          onPress={() => {
            setIsExpanded(!isExpanded);
            onSearchToggle?.();
          }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            paddingHorizontal: 16, // Adjusted for 'sm' button size equivalent
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: isExpanded
              ? "rgba(255,153,51,0.1)"
              : "transparent",
          }}
        >
          <Icon
            name="Search"
            size={16}
            color={isExpanded ? colors.brandPrimary : colors.textPrimary}
          />
          <Text
            style={{
              fontSize: 14,
              fontWeight: "500",
              color: isExpanded ? colors.brandPrimary : colors.textPrimary,
            }}
          >
            {isExpanded ? "Close" : "Search"}
          </Text>
        </Pressable>
      </View>

      {/* Expandable content */}
      {isExpanded && (
        <View style={{ marginTop: 16, gap: 16 }}>
          {/* City Selector */}
          <View>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: colors.textSecondary,
                marginBottom: 8,
              }}
            >
              City
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingHorizontal: 12,
                paddingVertical: 2, // Increased padding
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.bgSecondary,
              }}
            >
              <Icon name="Search" size={16} color={colors.textSecondary} />
              <TextInput
                value={searchTerm}
                onChangeText={setSearchTerm}
                onFocus={() => setIsDropdownOpen(true)}
                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                placeholder={selectedCityName || "Search for a city..."}
                placeholderTextColor={colors.textSecondary}
                style={{ flex: 1, fontSize: 14, color: colors.textPrimary }}
              />
              {selectedCity && !searchTerm && (
                <Pressable onPress={() => onCityChange("")}>
                  <Icon name="X" size={16} color={colors.textSecondary} />
                </Pressable>
              )}
            </View>
            {isDropdownOpen && filteredCities.length > 0 && (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  marginTop: 4,
                  backgroundColor: colors.bgCard,
                  maxHeight: 240, // equivalent to max-h-60
                  overflow: "hidden",
                }}
              >
                <ScrollView nestedScrollEnabled>
                  {filteredCities.map((city) => (
                    <Pressable
                      key={city.id}
                      onPress={() => handleCitySelect(city.id)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        backgroundColor:
                          selectedCity === city.id
                            ? "rgba(255,153,51,0.2)"
                            : "transparent",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={{ fontSize: 14, color: colors.textPrimary }}>
                          {city.name}
                        </Text>
                        {selectedCity === city.id && (
                          <Icon name="Check" size={16} color={colors.brandPrimary} />
                        )}
                      </View>
                      {city.count && (
                        <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                          {city.count} listings
                        </Text>
                      )}
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
            {isDropdownOpen && filteredCities.length === 0 && (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  marginTop: 4,
                  backgroundColor: colors.bgCard,
                  paddingVertical: 16,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                  No cities found
                </Text>
              </View>
            )}
          </View>

          {/* Filter Buttons */}
          <View>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: colors.textSecondary,
                marginBottom: 8,
              }}
            >
              Filter by
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {filters.map((filter) => {
                const isActive = activeFilter === filter.id;
                return (
                  <Pressable
                    key={filter.id}
                    onPress={() => onFilterChange(filter.id)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: isActive
                        ? colors.brandPrimary // Simplified linear gradient to solid for RN for now, or you can use Expo LinearGradient if installed
                        : colors.bgSecondary,
                      borderWidth: 1,
                      borderColor: isActive ? colors.brandPrimary : colors.border,
                      shadowColor: isActive ? "#000" : "transparent",
                      shadowOffset: isActive ? { width: 0, height: 2 } : { width: 0, height: 0 },
                      shadowOpacity: isActive ? 0.1 : 0,
                      shadowRadius: isActive ? 4 : 0,
                      elevation: isActive ? 2 : 0,
                    }}
                  >
                    <Icon
                      name={filter.icon}
                      size={16}
                      color={isActive ? "#fff" : colors.textSecondary}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "500",
                        color: isActive ? "#fff" : colors.textPrimary,
                      }}
                    >
                      {filter.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Sort Buttons */}
          <View>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: colors.textSecondary,
                marginBottom: 8,
              }}
            >
              Sort by
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {sortOptions.map((option) => {
                const isActive = sortBy === option.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => onSortChange(option.id)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: isActive
                        ? colors.brandPrimary
                        : colors.bgSecondary,
                      borderWidth: 1,
                      borderColor: isActive ? colors.brandPrimary : colors.border,
                      shadowColor: isActive ? "#000" : "transparent",
                      shadowOffset: isActive ? { width: 0, height: 2 } : { width: 0, height: 0 },
                      shadowOpacity: isActive ? 0.1 : 0,
                      shadowRadius: isActive ? 4 : 0,
                      elevation: isActive ? 2 : 0,
                    }}
                  >
                    <Icon
                      name={option.icon}
                      size={16}
                      color={isActive ? "#fff" : colors.textSecondary}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "500",
                        color: isActive ? "#fff" : colors.textPrimary,
                      }}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default FilterBar;
