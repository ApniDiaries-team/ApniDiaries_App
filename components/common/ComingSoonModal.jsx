import React from "react";
import { Modal, Pressable, Text, View } from "react-native";

export default function ComingSoonModal({ isOpen, onClose }) {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable className="absolute inset-0 bg-black/40" onPress={onClose} />

      {/* Modal */}
      <View className="flex-1 justify-center items-center p-4">
        <View className="w-full max-w-[360px] bg-white rounded-[20px] p-6 shadow-xl">
          {/* Close button */}
          <Pressable onPress={onClose} className="absolute top-3 right-3">
            <Text className="text-lg text-gray-500">✕</Text>
          </Pressable>

          {/* Content */}
          <View className="items-center gap-4">
            <Text className="text-[22px] font-semibold">Coming Soon ✨</Text>

            <Text className="text-sm text-gray-500 text-center leading-5">
              ApniDiaries is currently under development.{"\n"}
              We’re building something meaningful for travelers, families, and
              solo explorers.
            </Text>

            <Text className="text-sm text-gray-500 text-center leading-5">
              Stay tuned — we’ll be live very soon.
            </Text>

            <Pressable className="mt-2 bg-brand-600 py-2.5 rounded-full w-full items-center" onPress={onClose}>
              <Text className="text-white font-semibold text-base">Got it</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
