import { useRef, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import Icon from '../../../components/AppIcon'

const CommunitySearchBar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const timerRef = useRef(null)

  const handleSearchChange = (text) => {
    setSearchQuery(text)
    setLoading(true)

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onSearch?.(text)
      setLoading(false)
    }, 300)
  }

  const handleClear = () => {
    setSearchQuery('')
    setLoading(false)
    onSearch?.('')
  }

  return (
    <View>
      <View
        className="flex-row items-center gap-3 px-4 py-3.5 md:py-4 rounded-3xl border-[1.5px] bg-white dark:bg-slate-900 shadow-sm border-slate-900 dark:border-slate-100"
      >
        <Icon name="Search" size={20} color="#64748b" />
        <TextInput
          value={searchQuery}
          onChangeText={handleSearchChange}
          placeholder="Search posts, travelers, destinations..."
          placeholderTextColor="#64748b"
          className="flex-1 text-sm md:text-base text-slate-900 dark:text-slate-100"
        />
        {searchQuery !== '' && (
          <Pressable onPress={handleClear}>
            <Icon name="X" size={18} color="#64748b" />
          </Pressable>
        )}
      </View>

      {searchQuery !== '' && (
        <View className="flex-row items-center mt-2 ml-1">
          <Text className="text-xs text-slate-500 dark:text-slate-400">
            Searching for: <Text className="font-medium" style={{ color: '#FF9933' }}>{searchQuery}</Text>
          </Text>
          {loading && (
            <Text className="text-xs ml-2 font-bold animate-pulse" style={{ color: '#FF9933' }}>
              Searching...
            </Text>
          )}
        </View>
      )}
    </View>
  )
}

export default CommunitySearchBar
