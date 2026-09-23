import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import Icon from '../AppIcon'
import Image from '../AppImage'

const STORAGE_KEY = 'apnidiaries_recent_searches'

const MOCK_RESULTS = [
  { id: 1, type: 'user', name: 'Sarah Johnson', username: '@sarahj', location: 'Paris, France', avatar: null, isOnline: true },
  { id: 2, type: 'user', name: 'Mike Chen', username: '@mikechen', location: 'Tokyo, Japan', avatar: null, isOnline: false },
  { id: 3, type: 'city', name: 'Barcelona', country: 'Spain', travelers: 234, image: null },
]

const SearchOverlay = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const debounceRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
        if (saved) setRecentSearches(JSON.parse(saved))
      })
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setSearchQuery('')
      setSearchResults([])
    }
  }, [isOpen])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (searchQuery.trim().length > 0) {
      setIsSearching(true)
      debounceRef.current = setTimeout(() => {
        const results = MOCK_RESULTS.filter(
          (r) =>
            r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.username?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setSearchResults(results)
        setIsSearching(false)
      }, 500)
    } else {
      setSearchResults([])
      setIsSearching(false)
    }
    return () => debounceRef.current && clearTimeout(debounceRef.current)
  }, [searchQuery])

  return (
    <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Pressable onPress={onClose} className="w-9 h-9 rounded-lg bg-gray-100 items-center justify-center">
            <Icon name="ArrowLeft" size={20} color="#374151" />
          </Pressable>
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-3 py-2 gap-2">
            <Icon name="Search" size={18} color="#9ca3af" />
            <TextInput
              ref={inputRef}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search travelers, cities..."
              placeholderTextColor="#9ca3af"
              className="flex-1 text-sm text-gray-800"
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Icon name="X" size={16} color="#9ca3af" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 px-4 py-4">
          {isSearching && (
            <View className="py-12 items-center">
              <ActivityIndicator size="large" color="#FF9933" />
            </View>
          )}

          {/* Recent Searches */}
          {!searchQuery && recentSearches.length > 0 && (
            <View>
              <Text className="text-sm font-semibold text-gray-800 mb-3">Recent Searches</Text>
              {recentSearches.map((search, i) => (
                <Pressable
                  key={i}
                  onPress={() => setSearchQuery(search)}
                  className="flex-row items-center gap-3 p-3 rounded-xl bg-gray-50 mb-2"
                >
                  <Icon name="Clock" size={16} color="#9ca3af" />
                  <Text className="flex-1 text-sm text-gray-700">{search}</Text>
                  <Icon name="ArrowUpLeft" size={14} color="#9ca3af" />
                </Pressable>
              ))}
            </View>
          )}

          {/* No Results */}
          {searchQuery && !isSearching && searchResults.length === 0 && (
            <View className="items-center py-16">
              <Icon name="SearchX" size={48} color="#d1d5db" />
              <Text className="mt-3 text-base font-semibold text-gray-700">No results found</Text>
              <Text className="text-sm text-gray-400">Try different keywords</Text>
            </View>
          )}

          {/* Search Results */}
          {searchResults.map((result) => (
            <Pressable key={result.id} className="flex-row items-center gap-3 p-3 rounded-xl bg-gray-50 mb-2">
              <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center overflow-hidden">
                {result.avatar || result.image ? (
                  <Image src={result.avatar || result.image} alt={result.name} className="w-10 h-10 rounded-full" />
                ) : (
                  <Icon name={result.type === 'city' ? 'MapPin' : 'User'} size={20} color="#9ca3af" />
                )}
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-sm font-semibold text-gray-800">{result.name}</Text>
                  {result.isOnline && <View className="w-2 h-2 rounded-full bg-green-500" />}
                </View>
                <Text className="text-xs text-gray-400">
                  {result.username || result.country}{result.location ? ` · ${result.location}` : ''}{result.travelers ? ` · ${result.travelers} travelers` : ''}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Modal>
  )
}

export default SearchOverlay
