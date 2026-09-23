import { Text, TextInput, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { useDarkMode } from "../../../context/DarkModeContext";

const SearchBar = ({ searchQuery, onSearchChange, resultCount }) => {
  const { isDarkMode } = useDarkMode();

  return (
    // matches web: bg-[var(--color-bg-card)] rounded-xl p-4 md:p-6 shadow-md mb-6 border border-[var(--color-border)]
    <View
      style={{
        backgroundColor: isDarkMode ? "#3C2D27" : "#fff",
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: isDarkMode ? "#594137" : "#EDD6CD",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      {/* matches web: relative div with icon absolute left-4 top-1/2 + Input pl-12 */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: isDarkMode ? "#594137" : "#EDD6CD",
          backgroundColor: isDarkMode ? "#261913" : "#FFF1EC",
        }}
      >
        {/* matches web: <Icon name='Search' size={20} className='text-[var(--color-text-secondary)]' /> */}
        <Icon
          name="Search"
          size={20}
          color={isDarkMode ? "#A9917F" : "#8D7165"}
        />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search cities by name, country, or activities..."
          placeholderTextColor={isDarkMode ? "#8D7165" : "#A9917F"}
          style={{
            flex: 1,
            fontSize: 14,
            color: isDarkMode ? "#FFF1EC" : "#261913",
            paddingVertical: 0,
          }}
        />
      </View>

      {/* matches web: {searchQuery && ...} */}
      {searchQuery && (
        // matches web: mt-3 flex items-center justify-between
        <View
          style={{
            marginTop: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* matches web: text-sm text-[var(--color-text-secondary)] with
              font-semibold text-[var(--color-text-primary)] span for the number
              — web uses system font-semibold, NOT playfair */}
          <Text
            style={{ fontSize: 14, color: isDarkMode ? "#A9917F" : "#8D7165" }}
          >
            Found{" "}
            <Text
              style={{
                fontWeight: "600",
                color: isDarkMode ? "#FFF1EC" : "#261913",
              }}
            >
              {resultCount}
            </Text>{" "}
            {resultCount === 1 ? "city" : "cities"}
          </Text>

          {/* matches web: text-sm text-red-500 */}
          {resultCount === 0 && (
            <Text style={{ fontSize: 14, color: "#ef4444" }}>
              Try different search terms
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export default SearchBar;
