import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { Fonts } from "../../constants/theme";
import { useDarkMode } from "../../context/DarkModeContext";

/**
 * Input – mirrors the web text field: rounded-xl, warm hairline border,
 * brand-orange focus ring, Plus Jakarta Sans copy.
 */
const Input = React.forwardRef(
  (
    {
      type = "text",
      label,
      description,
      error,
      required = false,
      value,
      onChangeText,
      onChange,
      placeholder,
      style,
      containerStyle,
      secureTextEntry,
      keyboardType,
      multiline,
      numberOfLines,
      maxLength,
      editable,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const { theme } = useDarkMode();
    const [focused, setFocused] = useState(false);

    // Derive react-native keyboard type from the web `type`
    const deriveKeyboardType = () => {
      if (keyboardType) return keyboardType;
      switch (type) {
        case "number":
          return "numeric";
        case "tel":
          return "phone-pad";
        case "email":
          return "email-address";
        case "url":
          return "url";
        default:
          return "default";
      }
    };

    // Handle both web (onChange) and RN (onChangeText) style callbacks
    const handleChangeText = (text) => {
      onChangeText?.(text);
      onChange?.({ target: { value: text } });
    };

    const isSecure = secureTextEntry || type === "password";
    const borderColor = error
      ? theme.error
      : focused
        ? theme.brand
        : theme.outlineVariant;

    return (
      <View style={[{ marginBottom: 4 }, containerStyle]}>
        {label && (
          <Text
            style={{
              fontFamily: Fonts.body.semibold,
              fontSize: 13,
              marginBottom: 6,
              color: error ? theme.error : theme.onSurface,
            }}
          >
            {label}
            {required && <Text style={{ color: theme.error }}> *</Text>}
          </Text>
        )}
        <TextInput
          ref={ref}
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.outline}
          secureTextEntry={isSecure}
          keyboardType={deriveKeyboardType()}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          editable={editable}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            {
              minHeight: multiline ? 88 : 44,
              borderWidth: focused ? 2 : 1,
              borderColor,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: multiline ? 12 : 0,
              fontSize: 14,
              fontFamily: Fonts.body.regular,
              color: theme.onSurface,
              backgroundColor: theme.surfaceContainerLowest,
              textAlignVertical: multiline ? "top" : "center",
              opacity: editable === false ? 0.5 : 1,
            },
            style,
          ]}
          {...props}
        />
        {description && !error && (
          <Text
            style={{
              fontFamily: Fonts.body.regular,
              fontSize: 12,
              marginTop: 4,
              color: theme.outline,
            }}
          >
            {description}
          </Text>
        )}
        {error && (
          <Text
            style={{
              fontFamily: Fonts.body.medium,
              fontSize: 12,
              marginTop: 4,
              color: theme.error,
            }}
          >
            {error}
          </Text>
        )}
      </View>
    );
  },
);

Input.displayName = "Input";
export default Input;
