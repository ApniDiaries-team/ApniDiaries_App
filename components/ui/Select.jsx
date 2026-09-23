import React, { useState } from 'react'
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import Icon from '../AppIcon'

const Select = React.forwardRef(
  (
    {
      options = [],
      value,
      placeholder = 'Select an option',
      multiple = false,
      disabled = false,
      required = false,
      label,
      description,
      error,
      searchable = false,
      clearable = false,
      loading = false,
      onChange,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const filteredOptions =
      searchable && searchTerm
        ? options.filter(
          (o) =>
            o.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
        : options

    const getSelectedDisplay = () => {
      if (!value) return placeholder
      if (multiple) {
        const sel = options.filter((o) => value?.includes(o.value))
        if (!sel.length) return placeholder
        if (sel.length === 1) return sel[0].label
        return `${sel.length} items selected`
      }
      return options.find((o) => o.value === value)?.label || placeholder
    }

    const isSelected = (optVal) => (multiple ? value?.includes(optVal) : value === optVal)
    const hasValue = multiple ? value?.length > 0 : value !== undefined && value !== ''

    const handleSelect = (option) => {
      if (multiple) {
        const cur = value || []
        onChange?.(cur.includes(option.value) ? cur.filter((v) => v !== option.value) : [...cur, option.value])
      } else {
        onChange?.(option.value)
        setIsOpen(false)
      }
    }

    return (
      <View>
        {label && (
          <Text className="text-sm font-medium mb-1" style={{ color: error ? '#ef4444' : '#374151' }}>
            {label}{required && <Text className="text-red-500"> *</Text>}
          </Text>
        )}

        {/* Trigger */}
        <Pressable
          onPress={() => !disabled && setIsOpen(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 40,
            borderWidth: 1,
            borderColor: error ? '#ef4444' : '#e5e7eb',
            borderRadius: 8,
            paddingHorizontal: 12,
            backgroundColor: disabled ? '#f3f4f6' : '#f9fafb',
            opacity: disabled ? 0.6 : 1,
          }}
        >
          <Text
            className="flex-1 text-sm"
            style={{ color: hasValue ? '#111827' : '#9ca3af' }}
            numberOfLines={1}
          >
            {getSelectedDisplay()}
          </Text>
          <View className="flex-row items-center gap-1">
            {loading && <ActivityIndicator size="small" color="#9ca3af" />}
            {clearable && hasValue && !loading && (
              <Pressable onPress={() => onChange?.(multiple ? [] : '')} className="p-1">
                <Icon name="X" size={14} color="#9ca3af" />
              </Pressable>
            )}
            <Icon name="ChevronDown" size={16} color="#9ca3af" />
          </View>
        </Pressable>

        {description && !error && <Text className="text-xs text-gray-400 mt-1">{description}</Text>}
        {error && <Text className="text-xs text-red-500 mt-1">{error}</Text>}

        {/* Dropdown Modal */}
        <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
          <Pressable
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 }}
            onPress={() => { setIsOpen(false); setSearchTerm('') }}
          >
            <Pressable
              style={{ backgroundColor: '#fff', borderRadius: 12, width: '100%', maxHeight: 400, overflow: 'hidden' }}
              onPress={() => { }}
            >
              {/* Search */}
              {searchable && (
                <View className="flex-row items-center border-b border-gray-100 px-3 py-2 gap-2">
                  <Icon name="Search" size={16} color="#9ca3af" />
                  <TextInput
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    placeholder="Search options..."
                    placeholderTextColor="#9ca3af"
                    className="flex-1 text-sm text-gray-800"
                    autoFocus
                  />
                </View>
              )}

              <ScrollView style={{ maxHeight: 320 }}>
                {filteredOptions.length === 0 ? (
                  <View className="px-4 py-3">
                    <Text className="text-sm text-gray-400">{searchTerm ? 'No options found' : 'No options available'}</Text>
                  </View>
                ) : (
                  filteredOptions.map((option) => (
                    <Pressable
                      key={option.value}
                      onPress={() => !option.disabled && handleSelect(option)}
                      className="flex-row items-center px-4 py-3 border-b border-gray-50"
                      style={{
                        backgroundColor: isSelected(option.value) ? '#FF9933' : 'transparent',
                        opacity: option.disabled ? 0.4 : 1,
                      }}
                    >
                      <Text className="flex-1 text-sm" style={{ color: isSelected(option.value) ? '#fff' : '#111827' }}>
                        {option.label}
                      </Text>
                      {multiple && isSelected(option.value) && <Icon name="Check" size={16} color="#fff" />}
                      {option.description && (
                        <Text className="text-xs ml-2" style={{ color: isSelected(option.value) ? 'rgba(255,255,255,0.8)' : '#9ca3af' }}>
                          {option.description}
                        </Text>
                      )}
                    </Pressable>
                  ))
                )}
              </ScrollView>

              {/* Close / Done */}
              <Pressable
                onPress={() => { setIsOpen(false); setSearchTerm('') }}
                className="py-3 border-t border-gray-100 items-center"
              >
                <Text className="text-sm font-semibold" style={{ color: '#FF9933' }}>Done</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    )
  }
)

Select.displayName = 'Select'
export default Select
