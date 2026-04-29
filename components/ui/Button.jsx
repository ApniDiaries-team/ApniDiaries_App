import React from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";
import Icon from "../AppIcon";

const VARIANT_STYLES = {
  default: { bg: "#FF9933", text: "#ffffff" },
  destructive: { bg: "#ef4444", text: "#ffffff" },
  outline: {
    bg: "transparent",
    text: "#FF9933",
    borderColor: "#FF9933",
    borderWidth: 2,
  },
  secondary: { bg: "#f3f4f6", text: "#374151" },
  ghost: { bg: "transparent", text: "#FF9933" },
  success: { bg: "#22c55e", text: "#ffffff" },
  warning: { bg: "#f59e0b", text: "#ffffff" },
  danger: { bg: "#ef4444", text: "#ffffff" },
};

const SIZE_STYLES = {
  xs: { height: 32, paddingHorizontal: 12, fontSize: 12, borderRadius: 8 },
  sm: { height: 36, paddingHorizontal: 16, fontSize: 13, borderRadius: 8 },
  default: {
    height: 44,
    paddingHorizontal: 24,
    fontSize: 15,
    borderRadius: 16,
  },
  lg: { height: 48, paddingHorizontal: 32, fontSize: 15, borderRadius: 16 },
  xl: { height: 56, paddingHorizontal: 40, fontSize: 17, borderRadius: 16 },
  icon: { height: 40, width: 40, paddingHorizontal: 0, borderRadius: 16 },
};

const ICON_SIZE_MAP = { xs: 12, sm: 14, default: 16, lg: 18, xl: 20, icon: 16 };

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
    const vs = VARIANT_STYLES[variant] || VARIANT_STYLES.default;
    const ss = SIZE_STYLES[size] || SIZE_STYLES.default;
    const calcIconSize = iconSize || ICON_SIZE_MAP[size] || 16;
    const isDisabled = disabled || loading;

    const buttonStyle = {
      height: ss.height,
      width: size === "icon" ? ss.width : fullWidth ? "100%" : undefined,
      paddingHorizontal: ss.paddingHorizontal,
      borderRadius: ss.borderRadius,
      backgroundColor: vs.bg,
      borderWidth: vs.borderWidth,
      borderColor: vs.borderColor,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      opacity: isDisabled ? 0.5 : 1,
    };

    return (
      <Pressable
        ref={ref}
        onPress={!isDisabled ? onPress : undefined}
        style={[
          buttonStyle,
          style,
        ]}
        {...props}
      >
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
            style={{ color: vs.text, fontSize: ss.fontSize, fontWeight: "600" }}
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
      </Pressable>
    );
  },
);

Button.displayName = "Button";
export default Button;
