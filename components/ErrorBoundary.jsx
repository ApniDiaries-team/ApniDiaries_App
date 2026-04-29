import { useRouter } from 'expo-router'
import React from 'react'
import { Pressable, Text, View } from 'react-native'
import Icon from './AppIcon'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={() => this.setState({ hasError: false })} />
    }
    return this.props.children
  }
}

const ErrorFallback = ({ onReset }) => {
  const router = useRouter()
  return (
    <View className="flex-1 bg-neutral-50 items-center justify-center px-6">
      <View className="items-center">
        {/* Sad face SVG replaced with Icon */}
        <View className="w-16 h-16 rounded-full bg-neutral-100 items-center justify-center mb-4">
          <Icon name="AlertCircle" size={36} color="#737373" />
        </View>
        <Text className="text-2xl font-medium text-neutral-800 mb-2 text-center">Something went wrong</Text>
        <Text className="text-base text-neutral-600 text-center mb-6">
          We encountered an unexpected error while processing your request.
        </Text>
        <Pressable
          onPress={() => { onReset?.(); router.replace('/') }}
          className="flex-row items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-500"
        >
          <Icon name="ArrowLeft" size={18} color="#fff" />
          <Text className="text-white font-medium">Go Back</Text>
        </Pressable>
      </View>
    </View>
  )
}

export default ErrorBoundary
