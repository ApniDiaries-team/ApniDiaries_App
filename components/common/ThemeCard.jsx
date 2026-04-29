// components/common/ThemeCard.jsx — React Native version
// Replaces the web <div> wrapper with a React Native <View>
import { View } from 'react-native'

const ThemeCard = ({ children, className = '', style }) => {
  return (
    <View
      className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}
      style={style}
    >
      {children}
    </View>
  )
}

export default ThemeCard
