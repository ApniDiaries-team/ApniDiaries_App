import React, { useRef } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useDarkMode } from '../../context/DarkModeContext'
import Icon from '../AppIcon'

// Size variants — matches web exactly: sm=16, default=16, lg=20
const SIZE_MAP = {
  sm: 16,
  default: 16,
  lg: 20,
}

// ── Checkbox ──────────────────────────────────────────────
const Checkbox = React.forwardRef(
  (
    {
      checked,
      indeterminate = false,
      disabled = false,
      required = false,
      label,
      description,
      error,
      size = 'default',
      onChange,
      ...props
    },
    ref,
  ) => {
    const { isDarkMode } = useDarkMode()
    const boxSize = SIZE_MAP[size] || 16

    // Unique ID generation — matches web: `checkbox-${Math.random().toString(36).substr(2, 9)}`
    const checkboxId = useRef(
      `checkbox-${Math.random().toString(36).substr(2, 9)}`
    ).current

    // Icon size — matches web: h-3 w-3 = 12px fixed
    const iconSize = 12

    return (
      <Pressable
        ref={ref}
        onPress={!disabled ? onChange : undefined}
        style={[
          {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 8,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: !!checked, disabled }}
        {...props}
      >
        {/* Checkbox box — matches web label element styling */}
        <View
          style={{
            width: boxSize,
            height: boxSize,
            // matches web: rounded-sm = 2px
            borderRadius: 2,
            borderWidth: 1.5,
            // matches web: border-primary when checked, border-destructive on error
            borderColor: error
              ? '#ef4444'
              : checked || indeterminate
                ? '#FF9933'
                : isDarkMode ? '#6b7280' : '#d1d5db',
            // matches web: data-[state=checked]:bg-primary
            backgroundColor: checked || indeterminate ? '#FF9933' : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 1,
          }}
        >
          {/* matches web: <Check className='h-3 w-3' /> */}
          {checked && !indeterminate && (
            <Icon name="Check" size={iconSize} color="#fff" />
          )}
          {/* matches web: <Minus className='h-3 w-3' /> */}
          {indeterminate && (
            <Icon name="Minus" size={iconSize} color="#fff" />
          )}
        </View>

        {/* Label + description + error — matches web: <div className='flex-1 space-y-1'> */}
        {(label || description || error) && (
          <View style={{ flex: 1, gap: 4 }}>
            {/* matches web: <label className='text-sm font-medium leading-none'> */}
            {label && (
              <Text
                style={{
                  fontSize: 14,   // text-sm = 14px
                  fontWeight: '500',
                  lineHeight: 18,
                  color: error
                    ? '#ef4444'                           // text-destructive
                    : isDarkMode ? '#f9fafb' : '#111827', // text-foreground
                }}
              >
                {label}
                {/* matches web: <span className='text-destructive ml-1'>*</span> */}
                {required && (
                  <Text style={{ color: '#ef4444' }}> *</Text>
                )}
              </Text>
            )}

            {/* matches web: <p className='text-sm text-muted-foreground'> */}
            {description && !error && (
              <Text
                style={{
                  fontSize: 14,  // text-sm = 14px (web uses text-sm not text-xs)
                  color: isDarkMode ? '#9ca3af' : '#6b7280',  // text-muted-foreground
                }}
              >
                {description}
              </Text>
            )}

            {/* matches web: <p className='text-sm text-destructive'> */}
            {error && (
              <Text style={{ fontSize: 14, color: '#ef4444' }}>
                {error}
              </Text>
            )}
          </View>
        )}
      </Pressable>
    )
  },
)

Checkbox.displayName = 'Checkbox'

// ── CheckboxGroup ─────────────────────────────────────────
// matches web: React.forwardRef, fieldset equivalent
const CheckboxGroup = React.forwardRef(
  (
    {
      children,
      label,
      description,
      error,
      required = false,
      disabled = false,
      style,
      ...props
    },
    ref,
  ) => {
    const { isDarkMode } = useDarkMode()

    return (
      // matches web: <fieldset disabled={disabled} className='space-y-3'>
      // disabled propagated via opacity since RN has no fieldset
      <View
        ref={ref}
        style={[{ gap: 12, opacity: disabled ? 0.5 : 1 }, style]}
        {...props}
      >
        {/* matches web: <legend className='text-sm font-medium'> */}
        {label && (
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: error
                ? '#ef4444'
                : isDarkMode ? '#f9fafb' : '#111827',
            }}
          >
            {label}
            {/* matches web: <span className='text-destructive ml-1'>*</span> */}
            {required && (
              <Text style={{ color: '#ef4444' }}> *</Text>
            )}
          </Text>
        )}

        {/* matches web: <p className='text-sm text-muted-foreground'> */}
        {description && !error && (
          <Text
            style={{
              fontSize: 14,
              color: isDarkMode ? '#9ca3af' : '#6b7280',
            }}
          >
            {description}
          </Text>
        )}

        {/* matches web: <div className='space-y-2'> */}
        <View style={{ gap: 8 }}>
          {children}
        </View>

        {/* matches web: <p className='text-sm text-destructive'> */}
        {error && (
          <Text style={{ fontSize: 14, color: '#ef4444', marginTop: 4 }}>
            {error}
          </Text>
        )}
      </View>
    )
  },
)

CheckboxGroup.displayName = 'CheckboxGroup'

export { Checkbox, CheckboxGroup }
