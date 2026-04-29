import { Text, View } from "react-native";
import { useDarkMode } from "../../../context/DarkModeContext";

const DateDivider = ({ date }) => {
  const { isDarkMode } = useDarkMode();

  const formatDate = (dateObj) => {
    if (!dateObj) return "";

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = dateObj.toDateString() === today.toDateString();
    const isYesterday = dateObj.toDateString() === yesterday.toDateString();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";

    // Standard date format for other days matching web logic
    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <View className="flex-row items-center justify-center my-4 md:my-6 px-4">
      <View
        className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full border ${
          isDarkMode
            ? "bg-[#1A1F29] border-[#2D3748]"
            : "bg-[#F7FAFC] border-black/5"
        }`}
      >
        <Text
          className={`text-[12px] md:text-[14px] font-medium ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {formatDate(date)}
        </Text>
      </View>
    </View>
  );
};

export default DateDivider;
