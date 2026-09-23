import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Fonts, Shadow } from "../../constants/theme";
import { useDarkMode } from "../../context/DarkModeContext";
import Icon from "../AppIcon";

/**
 * Button – mirrors web `components/ui/Button.jsx`
 *   default   → saffron → orange gradient, white text, soft shadow
 *   outline   → surface fill, 2px saffron border, saffron text
 *   secondary → soft cream fill, dark-brown text
 *   ghost / link → saffron text only
 */
const SIZE_STYLES = {
  xs: { height: 32, paddingHorizontal: 12, fontSize: 12, borderRadius: 8 },
  sm: { height: 36, paddingHorizontal: 16, fontSize: 13, borderRadius: 8 },
  default: { height: 44, paddingHorizontal: 24, fontSize: 15, borderRadius: 16 },
  lg: { height: 48, paddingHorizontal: 32, fontSize: 15, borderRadius: 16 },
  xl: { height: 56, paddingHorizontal: 40, fontSize: 17, borderRadius: 16 },
  icon: { height: 40, width: 40, paddingHorizontal: 0, borderRadius: 16 },
};

const ICON_SIZE_MAP = { xs: 12, sm: 14, default: 16, lg: 18, xl: 20, icon: 16 };

const GRADIENT = ["#FF9933", "#FF6B35"];

const getVariant = (variant, isDarkMode) => {
  const saffron = isDarkMode ? "#FDBA74" : "#F97316";
  switch (variant) {
    case "destructive":
    case "danger":
      return { bg: "#EF4444", text: "#FFFFFF", shadow: true };
    case "outline":
      return {
        bg: isDarkMode ? "transparent" : "#FFFFFF",
        text: saffron,
        borderColor: "#FF9933",
        borderWidth: 2,
      };
    case "secondary":
      return {
        bg: isDarkMode ? "#1E242F" : "#F3ECE3",
        text: isDarkMode ? "#FFFFFF" : "#3A2A1F",
      };
    case "ghost":
      return { bg: "transparent", text: saffron };
    case "link":
      return { bg: "transparent", text: saffron, underline: true };
    case "success":
      return { bg: "#22C55E", text: "#FFFFFF", shadow: true };
    case "warning":
      return { bg: "#F59E0B", text: "#FFFFFF", shadow: true };
    default:
      return { gradient: true, text: "#FFFFFF", shadow: true };
  }
};

const Button = React.forwardRef(
  (
    {
      variant = "default",
      size = "default",
      children,
      loading = false,
      iconName = null,
      iconPosition = "left",
      iconSize = null,
      fullWidth = false,
      disabled = false,
      onPress,
      style,
      ...props
    },
    ref,
  ) => {
    const { isDarkMode } = useDarkMode();
    const vs = getVariant(variant, isDarkMode);
    const ss = SIZE_STYLES[size] || SIZE_STYLES.default;
    const calcIconSize = iconSize || ICON_SIZE_MAP[size] || 16;
    const isDisabled = disabled || loading;

    // A caller-supplied fill/border belongs on the visible inner surface.
    const flat = StyleSheet.flatten(style) || {};
    const {
      backgroundColor: bgOverride,
      borderColor: borderOverride,
      ...outerOverrides
    } = flat;

    const containerStyle = {
      height: ss.height,
      width: size === "icon" ? ss.width : fullWidth ? "100%" : undefined,
      borderRadius: ss.borderRadius,
      overflow: "hidden",
      opacity: isDisabled ? 0.5 : 1,
      ...(vs.shadow ? Shadow.raised : null),
    };

    const innerStyle = {
      flex: 1,
      paddingHorizontal: ss.paddingHorizontal,
      backgroundColor: bgOverride ?? (vs.gradient ? undefined : vs.bg),
      borderWidth: vs.borderWidth,
      borderColor: borderOverride ?? vs.borderColor,
      borderRadius: ss.borderRadius,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    };

    const content = (
      <>
        {loading && (
          <ActivityIndicator
            size="small"
            color={vs.text}
            style={{ marginRight: 8 }}
          />
        )}
        {!loading && iconName && iconPosition === "left" && (
          <Icon
            name={iconName}
            size={calcIconSize}
            color={vs.text}
            style={children ? { marginRight: 8 } : undefined}
          />
        )}
        {typeof children === "string" ? (
          <Text
            style={{
              color: vs.text,
              fontSize: ss.fontSize,
              fontFamily: Fonts.body.semibold,
              textDecorationLine: vs.underline ? "underline" : "none",
            }}
          >
            {children}
          </Text>
        ) : (
          children
        )}
        {!loading && iconName && iconPosition === "right" && (
          <Icon
            name={iconName}
            size={calcIconSize}
            color={vs.text}
            style={children ? { marginLeft: 8 } : undefined}
          />
        )}
      </>
    );

    return (
      <Pressable
        ref={ref}
        onPress={!isDisabled ? onPress : undefined}
        style={({ pressed }) => [
          containerStyle,
          pressed && !isDisabled && { transform: [{ scale: 0.97 }] },
          outerOverrides,
        ]}
        {...props}
      >
        {vs.gradient && bgOverride === undefined ? (
          <LinearGradient
            colors={GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={innerStyle}
          >
            {content}
          </LinearGradient>
        ) : (
          <View style={innerStyle}>{content}</View>
        )}
      </Pressable>
    );
  },
);

Button.displayName = "Button";
export default Button;
