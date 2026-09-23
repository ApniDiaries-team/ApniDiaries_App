import { Modal, Pressable, Text, View } from 'react-native'
import Icon from '../../../components/AppIcon'
import { useDarkMode } from '../../../context/DarkModeContext'
import { Fonts } from '../../../constants/theme'

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, tripTitle }) => {
  const { isDarkMode } = useDarkMode();
  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View className="rounded-2xl p-6" style={{ backgroundColor: isDarkMode ? "#1E242F" : "#FFF8F6" }}>
            <View className="flex-row items-start gap-4 mb-6">
              <View className="p-3 rounded-full" style={{ backgroundColor: '#fee2e2' }}>
                <Icon name="AlertTriangle" size={24} color="#ef4444" />
              </View>
              <View className="flex-1">
                <Text style={{ fontFamily: Fonts.playfair.bold, fontSize: 20, marginBottom: 8, color: isDarkMode ? "#FFFFFF" : "#261913" }}>Delete Trip?</Text>
                <Text style={{ fontSize: 14, color: isDarkMode ? "#A0AEC0" : "#594137" }}>
                  Are you sure you want to delete "{tripTitle}"? This action cannot be undone and all trip data will be permanently removed.
                </Text>
              </View>
            </View>
            <View className="flex-row gap-3">
              <Pressable onPress={onClose} style={{ flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: isDarkMode ? "#2D3748" : "#E1BFB2", alignItems: "center" }}>
                <Text style={{ fontFamily: Fonts.inter.medium, color: isDarkMode ? "#FFFFFF" : "#261913" }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={onConfirm} className="flex-1 py-3 rounded-lg items-center flex-row justify-center gap-2" style={{ backgroundColor: '#ef4444' }}>
                <Icon name="Trash2" size={16} color="#fff" />
                <Text className="font-medium text-white">Delete Trip</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

export default DeleteConfirmModal



