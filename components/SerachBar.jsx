import { useState } from 'react'
import { Pressable, TextInput, View } from 'react-native'
import Icon from './AppIcon'

const SearchBar = ({ value, onChangeText, placeholder = 'Search', onClear }) => {
  const [internalValue, setInternalValue] = useState('')
  const isControlled = value !== undefined
  const text = isControlled ? value : internalValue

  const handleChange = (t) => {
    if (!isControlled) setInternalValue(t)
    onChangeText?.(t)
  }

  const handleClear = () => {
    if (!isControlled) setInternalValue('')
    onChangeText?.('')
    onClear?.()
  }

  return (
    <View className="bg-gray-50 px-3">
      <View className="flex-row items-center border border-gray-400 px-4 py-2 rounded-lg">
        <Icon name="Search" size={16} color="#6b7280" />
        <TextInput
          className="flex-1 ml-3 text-sm text-gray-800 outline-none"
          value={text}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
        />
        {text?.length > 0 && (
          <Pressable onPress={handleClear}>
            <Icon name="X" size={14} color="#9ca3af" />
          </Pressable>
        )}
      </View>
    </View>
  )
}

export default SearchBar