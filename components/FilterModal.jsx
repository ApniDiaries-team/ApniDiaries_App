import { useState } from 'react'
import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import Icon from './AppIcon'

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune']

const FilterModal = ({ isOpen, onClose, onApply }) => {
  const [selectedCities, setSelectedCities] = useState([])

  const toggle = (city) => {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    )
  }

  const handleApply = () => {
    onApply?.(selectedCities)
    onClose?.()
  }

  return (
    <Modal visible={!!isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={onClose}>
        <View style={{ flex: 1 }} />
        <View className="bg-white rounded-t-2xl px-5 pt-5 pb-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-900">Filter By Cities</Text>
            <Pressable onPress={onClose}>
              <Icon name="X" size={20} color="#6b7280" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {CITIES.map((city) => (
              <Pressable
                key={city}
                onPress={() => toggle(city)}
                className="flex-row items-center gap-3 py-3 border-b border-gray-100"
              >
                <View
                  className="w-5 h-5 rounded border-2 items-center justify-center"
                  style={{
                    borderColor: selectedCities.includes(city) ? '#000' : '#d1d5db',
                    backgroundColor: selectedCities.includes(city) ? '#000' : 'transparent',
                  }}
                >
                  {selectedCities.includes(city) && <Icon name="Check" size={12} color="#fff" />}
                </View>
                <Text className="text-sm text-gray-700">{city}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View className="flex-row gap-3 mt-5">
            <Pressable
              onPress={() => setSelectedCities([])}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 items-center"
            >
              <Text className="text-sm font-medium text-gray-700">Clear</Text>
            </Pressable>
            <Pressable
              onPress={handleApply}
              className="flex-1 py-2.5 rounded-xl bg-black items-center"
            >
              <Text className="text-sm font-medium text-white">Apply</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  )
}

export default FilterModal