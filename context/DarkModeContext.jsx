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
import { DarkPalette, LightPalette } from "../constants/theme";

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

// Theme tokens now come from constants/theme.ts so the mobile app shares the
// exact palette of the refreshed web app. Legacy keys (bgPrimary, bgSecondary,
// bgCard, textPrimary, textSecondary, border) are preserved.
export const lightTheme = LightPalette;
export const darkTheme = DarkPalette;
