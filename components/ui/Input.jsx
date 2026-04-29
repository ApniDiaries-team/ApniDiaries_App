import React from 'react'
import { Text, TextInput, View } from 'react-native'

const Input = React.forwardRef(
  ({ type = 'text', label, description, error, required = false, value, onChangeText, onChange, placeholder, style, containerStyle, secureTextEntry, keyboardType, multiline, numberOfLines, maxLength, editable, ...props }, ref
  ) => {
    // Derive react-native keyboard type from the web `type`
    const deriveKeyboardType = () => {
      if (keyboardType) return keyboardType
      switch (type) {
        case 'number': return 'numeric'
        case 'tel': return 'phone-pad'
        case 'email': return 'email-address'
        case 'url': return 'url'
        default: return 'default'
      }
    }

    // Handle both web (onChange) and RN (onChangeText) style callbacks
    const handleChangeText = (text) => {
      onChangeText?.(text)
      onChange?.({ target: { value: text } })
    }

    const isSecure = secureTextEntry || type === 'password'

    return (
      <View style={[{ marginBottom: 4 }, containerStyle]}>
        {label && (
          <Text className="text-sm font-medium mb-1" style={{ color: error ? '#ef4444' : '#374151' }}>
            {label}
            {required && <Text className="text-red-500"> *</Text>}
          </Text>
        )}
        <TextInput
          ref={ref}
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          secureTextEntry={isSecure}
          keyboardType={deriveKeyboardType()}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          editable={editable}
          style={[
            {
              height: multiline ? undefined : 40,
              borderWidth: 1,
              borderColor: error ? '#ef4444' : '#e5e7eb',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: multiline ? 10 : 0,
              fontSize: 14,
              color: '#111827',
              backgroundColor: '#f9fafb',
            },
            style,
          ]}
          {...props}
        />
        {description && !error && <Text className="text-xs text-gray-400 mt-1">{description}</Text>}
        {error && <Text className="text-xs text-red-500 mt-1">{error}</Text>}
      </View>
    )
  }
)

Input.displayName = 'Input'
export default Input
