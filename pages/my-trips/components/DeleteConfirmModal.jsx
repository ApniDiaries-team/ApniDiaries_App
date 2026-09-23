import { Modal, Pressable, Text, View } from 'react-native'
import Icon from '../../../components/AppIcon'
import { Fonts } from '../../../constants/theme'

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, tripTitle }) => {
  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View className="bg-white rounded-2xl p-6">
            <View className="flex-row items-start gap-4 mb-6">
              <View className="p-3 rounded-full" style={{ backgroundColor: '#fee2e2' }}>
                <Icon name="AlertTriangle" size={24} color="#ef4444" />
              </View>
              <View className="flex-1">
                <Text style={{ fontFamily: Fonts.playfair.bold, fontSize: 20, marginBottom: 8, color: '#111827' }}>Delete Trip?</Text>
                <Text className="text-sm text-gray-500">
                  Are you sure you want to delete "{tripTitle}"? This action cannot be undone and all trip data will be permanently removed.
                </Text>
              </View>
            </View>
            <View className="flex-row gap-3">
              <Pressable onPress={onClose} className="flex-1 py-3 rounded-lg border border-gray-200 items-center">
                <Text className="font-medium text-gray-700">Cancel</Text>
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
