import { Text, TextInput, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { useDarkMode } from "../../../context/DarkModeContext";

const SearchBar = ({ searchQuery, onSearchChange, resultCount }) => {
  const { isDarkMode } = useDarkMode();

  return (
    // matches web: bg-[var(--color-bg-card)] rounded-xl p-4 md:p-6 shadow-md mb-6 border border-[var(--color-border)]
    <View
      style={{
        backgroundColor: isDarkMode ? "#1f2937" : "#fff",
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: isDarkMode ? "#374151" : "#e5e7eb",
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
          borderColor: isDarkMode ? "#374151" : "#e5e7eb",
          backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
        }}
      >
        {/* matches web: <Icon name='Search' size={20} className='text-[var(--color-text-secondary)]' /> */}
        <Icon
          name="Search"
          size={20}
          color={isDarkMode ? "#9ca3af" : "#6b7280"}
        />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search cities by name, country, or activities..."
          placeholderTextColor={isDarkMode ? "#6b7280" : "#9ca3af"}
          style={{
            flex: 1,
            fontSize: 14,
            color: isDarkMode ? "#f9fafb" : "#111827",
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
            style={{ fontSize: 14, color: isDarkMode ? "#9ca3af" : "#6b7280" }}
          >
            Found{" "}
            <Text
              style={{
                fontWeight: "600",
                color: isDarkMode ? "#f9fafb" : "#111827",
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
