// components/common/ThemeContainer.jsx — React Native version
// Replaces the web <div> wrapper with a React Native <View>
import { View } from 'react-native'

const ThemeContainer = ({ children, className = '', style }) => {
  return (
    <View
      className={`flex-1 bg-white ${className}`}
      style={style}
    >
      {children}
    </View>
  )
}

export default ThemeContainer
