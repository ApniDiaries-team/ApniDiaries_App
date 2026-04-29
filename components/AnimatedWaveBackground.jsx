import { useEffect, useRef } from 'react'
import { Animated, Easing, StyleSheet, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'

const WAVE_PATH = "M0,64L48,74.7C96,85,192,107,288,101.3C384,96,480,64,576,58.7C672,53,768,75,864,85.3C960,96,1056,96,1152,90.7C1248,85,1344,75,1392,69.3L1440,64V0H0Z"

const WaveLayer = ({ opacity, duration, reverse }) => {
  const translateX = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: reverse ? -144 : 144,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start()
  }, [])

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFillObject,
        { opacity, transform: [{ translateX }] },
      ]}
      pointerEvents="none"
    >
      <Svg width="200%" height="40" viewBox="0 0 1440 120" preserveAspectRatio="none">
        <Path d={WAVE_PATH} fill="#FDF4DC" />
      </Svg>
    </Animated.View>
  )
}

const AnimatedWaveBackground = () => {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <WaveLayer opacity={0.08} duration={20000} reverse={false} />
      <WaveLayer opacity={0.05} duration={25000} reverse={true} />
    </View>
  )
}

export default AnimatedWaveBackground
