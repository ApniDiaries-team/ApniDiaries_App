import { useEffect, useState } from 'react'
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import Icon from '../../../components/AppIcon'
import { useDarkMode } from '../../../context/DarkModeContext'
import { getPopularCities, searchCities } from '../../../data/cities'

const CityFilterChips = ({ selectedCity, onCitySelect, cities: propCities, totalPosts, sidebar = false }) => {
  const [expanded, setExpanded] = useState(false)
  const [popularCities, setPopularCities] = useState([])
  const [citySuggestions, setCitySuggestions] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [selectedCitiesList, setSelectedCitiesList] = useState([])
  const { isDarkMode } = useDarkMode()

  // Initialize with popular cities
  useEffect(() => {
    if (sidebar) {
      setPopularCities(getPopularCities(12))
    } else {
      setPopularCities(getPopularCities(6))
    }
  }, [sidebar])

  // Track selected cities to include in the list
  useEffect(() => {
    if (selectedCity && selectedCity !== 'all') {
      setSelectedCitiesList((prev) => {
        if (!prev.includes(selectedCity)) return [selectedCity, ...prev]
        return prev
      })
    }
  }, [selectedCity])

  // Determine which cities to show based on expanded state
  const getVisibleCities = () => {
    const staticCities = sidebar ? getPopularCities(12) : getPopularCities(6)

    if (propCities && propCities.length > 0) {
      const backendCityNames = propCities.map(c => c.name)
      const merged = [
        ...propCities,
        ...staticCities
          .filter(city => !backendCityNames.includes(city))
          .map(name => ({ name, postCount: 0 }))
      ]
      return expanded ? merged : merged.slice(0, sidebar ? 6 : 4)
    }

    return expanded ? staticCities : staticCities.slice(0, sidebar ? 6 : 4)
  }

  const visibleCities = getVisibleCities()

  const handleSearchChange = (text) => {
    setSearchQuery(text)
    if (text.length > 1) {
      setCitySuggestions(searchCities(text, 8))
    } else {
      setCitySuggestions([])
    }
  }

  const handleCitySelect = (cityName) => {
    onCitySelect(cityName)
    if (cityName !== 'all') {
      setSelectedCitiesList((prev) => (prev.includes(cityName) ? prev : [cityName, ...prev]))
    }
    setSearchQuery('')
    setCitySuggestions([])
    setShowSearch(false)
  }

  const clearFilter = () => {
    onCitySelect('all')
    setSearchQuery('')
    setCitySuggestions([])
    setShowSearch(false)
  }

  // Sidebar Version (Desktop/Right Column)
  if (sidebar) {
    return (
      <View
        className="p-5 rounded-3xl border shadow-lg overflow-hidden flex-col bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"
        style={{ maxHeight: '75%' }}
      >
        {/* Header */}
        <View className="flex-row items-center gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <View className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/30">
            <Icon name="MapPin" size={18} color="#FF9933" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-playfair-bold font-bold text-slate-900 dark:text-slate-100">Destinations</Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400">Filter travel stories</Text>
          </View>
          {selectedCity !== 'all' && (
            <Pressable onPress={clearFilter} className="px-2 py-1">
              <Text className="text-xs font-semibold" style={{ color: '#FF9933' }}>Clear</Text>
            </Pressable>
          )}
        </View>

        {/* Search Bar */}
        <View className="mb-4">
          <View className="relative">
            <View className="absolute left-3 top-3.5 z-10" >
              <Icon name="Search" size={16} color="#64748b" />
            </View>
            <TextInput
              placeholder="Search destinations..."
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholderTextColor="#64748b"
              className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
            {searchQuery !== '' && (
              <Pressable onPress={() => { setSearchQuery(''); setCitySuggestions([]) }} className="absolute right-3 top-3.5">
                <Icon name="X" size={14} color="#64748b" />
              </Pressable>
            )}
          </View>

          {/* Search Results */}
          {searchQuery !== '' && citySuggestions.length > 0 && (
            <View className="mt-2 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm max-h-40 overflow-hidden bg-white dark:bg-slate-800">
              <ScrollView>
                {citySuggestions.map((city) => (
                  <Pressable
                    key={city}
                    onPress={() => handleCitySelect(city)}
                    className={`w-full flex-row items-center gap-2 px-3 py-3 border-b border-slate-50 dark:border-slate-700 last:border-b-0 ${selectedCity === city ? 'bg-orange-50 dark:bg-orange-900/20' : ''
                      }`}
                  >
                    <Icon name="MapPin" size={14} color="#FF9933" />
                    <Text className={`text-sm ${selectedCity === city ? 'font-bold text-[#FF9933]' : 'text-slate-900 dark:text-slate-100'}`}>{city}</Text>
                    {selectedCity === city && <Icon name="Check" size={14} color="#FF9933" />}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Cities List */}
        <ScrollView className="flex-1 pr-1" showsVerticalScrollIndicator={false}>
          <View className="gap-1 mb-4">
            <Pressable
              onPress={() => handleCitySelect('all')}
              className={`w-full flex-row items-center justify-between px-3 py-3 rounded-xl ${selectedCity === 'all'
                ? 'bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500'
                : 'bg-white dark:bg-slate-900'
                }`}
            >
              <View className="flex-row items-center gap-2">
                <View className={`p-1.5 rounded ${selectedCity === 'all' ? 'bg-[#FF9933]' : 'bg-slate-50 dark:bg-slate-800'}`}>
                  <Icon name="Globe" size={14} color={selectedCity === 'all' ? '#fff' : '#64748b'} />
                </View>
                <Text className={`text-sm font-medium ${selectedCity === 'all' ? 'text-[#FF9933]' : 'text-slate-600 dark:text-slate-300'}`}>All Destinations</Text>
              </View>
              <View className="px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-800">
                <Text className="text-xs text-slate-500 dark:text-slate-400 font-bold">{totalPosts || 'All'}</Text>
              </View>
            </Pressable>

            {visibleCities?.map((city) => {
              const cityName = typeof city === 'string' ? city : city?.name
              const isActive = selectedCity === cityName
              return (
                <Pressable
                  key={cityName}
                  onPress={() => handleCitySelect(cityName)}
                  className={`w-full flex-row items-center justify-between px-3 py-3 rounded-xl ${isActive ? 'bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500' : 'bg-white dark:bg-slate-900'
                    }`}
                >
                  <View className="flex-row items-center gap-2">
                    <View className={`p-1.5 rounded ${isActive ? 'bg-[#FF9933]' : 'bg-slate-50 dark:bg-slate-800'}`}>
                      <Icon name="MapPin" size={14} color={isActive ? '#fff' : '#64748b'} />
                    </View>
                    <View>
                      <Text className={`text-sm font-medium ${isActive ? 'text-[#FF9933]' : 'text-slate-600 dark:text-slate-300'}`}>{cityName}</Text>
                      {selectedCitiesList.includes(cityName) && !isActive && (
                        <Text className="text-[10px] text-[#FF9933]">Recently selected</Text>
                      )}
                    </View>
                  </View>
                  <View className="flex-row items-center gap-2">
                    {typeof city !== 'string' && city?.postCount > 0 && (
                      <Text className="text-xs text-slate-400 dark:text-slate-500">{city.postCount}</Text>
                    )}
                    {isActive && <Icon name="Check" size={14} color="#FF9933" />}
                  </View>
                </Pressable>
              )
            })}
          </View>

          {!propCities && (
            <Pressable
              onPress={() => setExpanded(!expanded)}
              className="flex-row items-center justify-center gap-1 py-3 border-t border-slate-50 dark:border-slate-800"
            >
              <Icon name={expanded ? "ChevronUp" : "ChevronDown"} size={14} color="#FF9933" />
              <Text className="text-xs font-bold" style={{ color: '#FF9933' }}>
                {expanded ? 'Show less' : `+${popularCities.length - 6} more destinations`}
              </Text>
            </Pressable>
          )}

          <View className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
            <Text className="text-xs text-slate-400 dark:text-slate-500 font-bold mb-3">Popular Categories:</Text>
            <View className="flex-row flex-wrap gap-2">
              {['Hill Stations', 'Beaches', 'Spiritual', 'Adventure'].map((category) => (
                <Pressable
                  key={category}
                  className="px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-900/30 bg-orange-50 dark:bg-orange-950/20"
                >
                  <Text className="text-[10px] font-bold text-[#FF9933]">{category}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }

  // Mobile Version
  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <Icon name="MapPin" size={20} color="#FF9933" />
          <Text className="text-xl font-playfair-bold font-bold text-slate-900 dark:text-slate-100">Filter by City</Text>
        </View>

        <View className="flex-row items-center gap-2">
          {selectedCity !== 'all' && (
            <Pressable onPress={clearFilter} className="px-2 py-1">
              <Text className="text-xs font-semibold" style={{ color: '#FF9933' }}>Clear</Text>
            </Pressable>
          )}
          <Pressable onPress={() => setShowSearch(!showSearch)} className="p-1.5 rounded-lg bg-white dark:bg-slate-950 shadow-sm">
            <Icon name="Search" size={18} color="#64748b" />
          </Pressable>
        </View>
      </View>

      {showSearch && (
        <View className="relative mb-4">
          <View className="absolute left-3 top-3.5 z-10">
            <Icon name="Search" size={16} color="#64748b" />
          </View>
          <TextInput
            placeholder="Search destinations..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholderTextColor="#64748b"
            className="w-full pl-10 pr-4 py-3.5 text-sm rounded-2xl border border-slate-200 dark:border-slate-100 bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-slate-100"
          />
          {searchQuery !== '' && (
            <Pressable onPress={() => { setSearchQuery(''); setCitySuggestions([]) }} className="absolute right-3 top-3.5">
              <Icon name="X" size={16} color="#64748b" />
            </Pressable>
          )}
        </View>
      )}

      {showSearch && searchQuery !== '' && citySuggestions.length > 0 && (
        <View className="mb-4 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm bg-white dark:bg-slate-800 overflow-hidden max-h-48">
          <ScrollView>
            {citySuggestions.map((city) => (
              <Pressable
                key={city}
                onPress={() => handleCitySelect(city)}
                className={`flex-row items-center gap-3 px-4 py-4 border-b border-slate-50 dark:border-slate-700 last:border-b-0 ${selectedCity === city ? 'bg-orange-50 dark:bg-orange-900/20' : ''
                  }`}
              >
                <Icon name="MapPin" size={16} color="#FF9933" />
                <Text className={`text-base flex-1 ${selectedCity === city ? 'font-bold text-[#FF9933]' : 'text-slate-900 dark:text-slate-100'}`}>{city}</Text>
                {selectedCity === city && <Icon name="Check" size={18} color="#FF9933" />}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      <View className="flex-row flex-wrap gap-2.5 items-center">
        <Pressable
          onPress={() => handleCitySelect('all')}
          className={`px-5 py-3 rounded-2xl border-[1.5px] items-center justify-center ${selectedCity === 'all'
            ? 'bg-[#FF9933] border-[#FF9933] shadow-md shadow-[#FF9933]/30'
            : 'bg-white dark:bg-slate-900 border-slate-900 dark:border-slate-500'
            }`}
        >
          <View className="flex-row items-center gap-2">
            <Text className={`text-base font-bold ${selectedCity === 'all' ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
              All Cities
            </Text>
            <Text className={`text-xs ${selectedCity === 'all' ? 'text-white/80' : 'text-slate-900/80 dark:text-slate-100/80'}`}>
              ({totalPosts || 'All'})
            </Text>
          </View>
        </Pressable>

        {visibleCities?.map((city) => {
          const cityName = typeof city === 'string' ? city : city?.name
          const isActive = selectedCity === cityName
          return (
            <Pressable
              key={cityName}
              onPress={() => handleCitySelect(cityName)}
              className={`px-5 py-3 rounded-2xl border-[1.5px] relative items-center justify-center ${isActive
                ? 'bg-[#FF9933] border-[#FF9933] shadow-md shadow-[#FF9933]/30'
                : 'bg-white dark:bg-slate-900 border-slate-900 dark:border-slate-500'
                }`}
            >
              <View className="flex-row items-center gap-2">
                <Text className={`text-base font-bold ${isActive ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                  {cityName}
                </Text>
                {typeof city !== 'string' && city?.postCount > 0 && (
                  <Text className={`text-xs ${isActive ? 'text-white/80' : 'text-slate-900/80 dark:text-slate-100/80'}`}>
                    ({city.postCount})
                  </Text>
                )}
              </View>
              {selectedCitiesList.includes(cityName) && !isActive && (
                <View className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF9933]" />
              )}
            </Pressable>
          )
        })}

        {!propCities && (
          <Pressable
            onPress={() => setExpanded(!expanded)}
            className={`px-5 py-3 rounded-2xl border-[1.5px] items-center justify-center ${expanded
              ? 'bg-orange-50 dark:bg-orange-950/30 border-[#FF9933]'
              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
          >
            <Text className={`text-sm font-bold ${expanded ? 'text-[#FF9933]' : 'text-slate-400 dark:text-slate-500'}`}>
              {expanded ? 'Show less' : `+${popularCities.length - 4} more`}
            </Text>
          </Pressable>
        )}
      </View>

      {selectedCity !== 'all' && (
        <View className="mt-4 p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="w-2.5 h-2.5 rounded-full bg-[#FF9933] animate-pulse" />
            <Text className="text-sm text-slate-700 dark:text-slate-300">
              Active filter: <Text className="font-bold text-[#FF9933]">{selectedCity}</Text>
            </Text>
          </View>
          <Pressable onPress={clearFilter}>
            <Text className="text-xs font-bold text-[#FF9933]">Clear</Text>
          </Pressable>
        </View>
      )}

      {showSearch && searchQuery !== '' && citySuggestions.length === 0 && (
        <View className="mt-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
          <Text className="text-sm text-slate-500 dark:text-slate-400">
            No destinations found for "<Text className="font-medium text-slate-900 dark:text-slate-100">{searchQuery}</Text>"
          </Text>
          <Text className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try a different search term or browse popular destinations</Text>
        </View>
      )}
    </View>
  )
}

export default CityFilterChips
