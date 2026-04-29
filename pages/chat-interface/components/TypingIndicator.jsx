import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const Dot = ({ delay }) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-5, { duration: 400 }),
          withTiming(0, { duration: 400 }),
        ),
        -1,
        false,
      ),
    );
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      // Uses NativeWind for colors and size. No var() or style prop used.
      className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 mx-0.5"
      style={animatedStyle}
    />
  );
};

const TypingIndicator = () => {
  return (
    <View className="flex-row justify-start mb-2 px-4 md:px-6 lg:px-8">
      <View className="max-w-[75%] rounded-2xl rounded-bl-sm px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-black/5 dark:border-white/10">
        <View className="flex-row items-center h-2">
          {/* Exact delay logic from web version */}
          <Dot delay={0} />
          <Dot delay={150} />
          <Dot delay={300} />
        </View>
      </View>
    </View>
  );
};

export default TypingIndicator;
