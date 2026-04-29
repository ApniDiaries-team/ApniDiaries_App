import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Appearance } from "react-native";

const DarkModeContext = createContext(null);

export const DarkModeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { setColorScheme } = useColorScheme();

  // Initialize theme
  useEffect(() => {
    const initTheme = async () => {
      const savedTheme = await AsyncStorage.getItem("theme");
      const systemTheme = Appearance.getColorScheme(); // 'dark' | 'light'

      const initialTheme =
        savedTheme === "dark" || (!savedTheme && systemTheme === "dark");

      setIsDarkMode(initialTheme);
      setColorScheme(initialTheme ? "dark" : "light");
      setMounted(true);
    };

    initTheme();

    // Listen for system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      AsyncStorage.getItem("theme").then((stored) => {
        if (!stored) {
          setIsDarkMode(colorScheme === "dark");
          setColorScheme(colorScheme === "dark" ? "dark" : "light");
        }
      });
    });

    return () => subscription.remove();
  }, []);

  // Toggle dark mode
  const toggleDarkMode = useCallback(async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    setColorScheme(newMode ? "dark" : "light");
    await AsyncStorage.setItem("theme", newMode ? "dark" : "light");
  }, [isDarkMode, setColorScheme]);

  // Set dark mode directly
  const setDarkMode = useCallback(async (enabled) => {
    setIsDarkMode(enabled);
    setColorScheme(enabled ? "dark" : "light");
    await AsyncStorage.setItem("theme", enabled ? "dark" : "light");
  }, [setColorScheme]);

  const value = {
    isDarkMode,
    toggleDarkMode,
    setDarkMode,
    mounted,
    theme: isDarkMode ? darkTheme : lightTheme,
  };

  return (
    <DarkModeContext.Provider value={value}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error("useDarkMode must be used within DarkModeProvider");
  }
  return context;
};

export const lightTheme = {
  bgPrimary: "#FFFFFF",
  bgSecondary: "#F7FAFC",
  bgCard: "#EDF2F7",
  textPrimary: "#1A202C",
  textSecondary: "#4A5568",
  border: "#E2E8F0",
};

export const darkTheme = {
  bgPrimary: "#0B0E14",
  bgSecondary: "#1A1F29",
  bgCard: "#1E242F",
  textPrimary: "#FFFFFF",
  textSecondary: "#A0AEC0",
  border: "#2D3748",
};
