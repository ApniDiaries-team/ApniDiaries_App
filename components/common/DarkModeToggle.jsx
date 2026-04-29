import React from "react";
import { Pressable } from "react-native";
import { useDarkMode } from "../../context/DarkModeContext";
import Icon from "../AppIcon"; // assuming RN-compatible icons

const DarkModeToggle = ({ className }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <Pressable
      onPress={toggleDarkMode}
      accessibilityLabel={
        isDarkMode ? "Switch to light mode" : "Switch to dark mode"
      }
      className={`w-10 h-10 rounded-full items-center justify-center border ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-orange-50 border-orange-200"
      } active:scale-95 ${className || ""}`}
    >
      <Icon
        name={isDarkMode ? "sun" : "moon"}
        size={20}
        color={isDarkMode ? "#f59e0b" : "#ea580c"}
      />
    </Pressable>
  );
};

export default DarkModeToggle;
