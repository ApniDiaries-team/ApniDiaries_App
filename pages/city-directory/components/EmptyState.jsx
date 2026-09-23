import { Pressable, Text, View } from "react-native";
import Icon from "../../../components/AppIcon";
import { Fonts } from "../../../constants/theme";
import { useDarkMode } from "../../../context/DarkModeContext";

const EmptyState = ({ onClearFilters }) => {
  const { isDarkMode } = useDarkMode();

  return (
    // matches web: flex flex-col items-center justify-center py-16 md:py-24 px-4
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 80,
        paddingHorizontal: 16,
      }}
    >
      {/* matches web: w-24 h-24 md:w-32 md:h-32 bg-[var(--color-bg-secondary)] rounded-full mb-6 */}
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 999,
          backgroundColor: isDarkMode ? "#374151" : "#f3f4f6",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        {/* matches web: <Icon name='MapOff' size={48} className='text-[var(--color-text-secondary)]' /> */}
        <Icon
          name="MapOff"
          size={48}
          color={isDarkMode ? "#9ca3af" : "#6b7280"}
        />
      </View>

      {/* matches web: text-xl md:text-2xl font-bold text-[var(--color-text-primary)] mb-3 */}
      <Text
        style={{
          fontSize: 22,
          fontFamily: Fonts.playfair.bold,
          color: isDarkMode ? "#f9fafb" : "#111827",
          marginBottom: 12,
          textAlign: "center",
        }}
      >
        No Cities Found
      </Text>

      {/* matches web: text-sm text-[var(--color-text-secondary)] mb-6 max-w-md */}
      <Text
        style={{
          fontSize: 14,
          color: isDarkMode ? "#9ca3af" : "#6b7280",
          marginBottom: 24,
          textAlign: "center",
          maxWidth: 448,
          lineHeight: 20,
        }}
      >
        We couldn't find any cities matching your search criteria. Try adjusting
        your filters or search terms.
      </Text>

      {/* matches web: Button variant='default' iconName='RotateCcw' iconPosition='left'
          pressed state darkens bg, mirrors browser active state */}
      <Pressable
        onPress={onClearFilters}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 8,
          backgroundColor: "#FF9933",
        }}
      >
        <Icon name="RotateCcw" size={16} color="#fff" />
        <Text style={{ fontSize: 14, fontWeight: "600", color: "#fff" }}>
          Clear All Filters
        </Text>
      </Pressable>
    </View>
  );
};

export default EmptyState;
