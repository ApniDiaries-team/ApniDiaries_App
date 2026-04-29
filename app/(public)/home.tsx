import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

// ── Replace with your local assets ────────────────────────
// const BG_IMAGE        = require('../assets/landing-bg.jpg')
// const FOREGROUND_IMG  = require('../assets/landing-camera.jpg')
// OR if it's the same image inside the blur panel:
// const FOREGROUND_IMG  = require('../assets/landing-bg.jpg')

const BG_IMAGE = require("../../assets/HomePage.png");

// The image visible inside the blur panel on the right side
// From the screenshot this appears to be the same scene / a camera image
const FOREGROUND_IMG = require("../../assets/HomePage.png");

export default function LandingScreen() {
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(36)).current;
  const btnScale = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 12,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.spring(btnScale, {
        toValue: 1,
        tension: 70,
        friction: 8,
        delay: 480,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () =>
    Animated.spring(btnScale, {
      toValue: 0.97,
      tension: 400,
      friction: 10,
      useNativeDriver: true,
    }).start();

  const handlePressOut = () =>
    Animated.spring(btnScale, {
      toValue: 1,
      tension: 400,
      friction: 10,
      useNativeDriver: true,
    }).start();

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ImageBackground source={BG_IMAGE} style={styles.bg} resizeMode="cover">
        {/* ── Frosted glass blur panel — bottom 60% of screen ── */}
        <Animated.View
          style={[
            styles.blurContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <BlurView
            intensity={Platform.OS === "ios" ? 50 : 75}
            tint="dark"
            style={styles.blurView}
          >
            {/* Dark tint layer over blur */}
            <View style={styles.darkTint} />

            {/* ── Foreground image inside blur panel (right side) ──
                From the screenshot: image positioned on right,
                partially cut off by panel edge                    */}
            <Image
              source={FOREGROUND_IMG}
              style={styles.foregroundImg}
              resizeMode="cover"
            />

            {/* ── Text + button content ── */}
            <View style={styles.content}>
              {/* Headline */}
              <View style={styles.textGroup}>
                <Text style={styles.headline}>
                  <Text style={styles.white}>{"Connect with "}</Text>
                  <Text style={styles.orange}>{"Travelers, plan trips"}</Text>
                  <Text style={styles.white}>
                    {", explore India with\npassionate community"}
                  </Text>
                </Text>

                {/* Body */}
                <Text style={styles.body}>
                  {
                    "Find travel companions for your next trip, join group\nadventures, and share experiences with like-\nminded travelers across India"
                  }
                </Text>
              </View>

              {/* Get Started button */}
              <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                <Pressable
                  style={styles.btn}
                  onPress={() => router.push("/(auth)/login")}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  android_ripple={{
                    color: "rgba(255,255,255,0.15)",
                    borderless: false,
                  }}
                >
                  <Text style={styles.btnText}>Get Started</Text>
                </Pressable>
              </Animated.View>
            </View>
          </BlurView>
        </Animated.View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },

  bg: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  // Blur panel — bottom 60%, no border radius (matches screenshot: sharp top edge)
  blurContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 360,
    overflow: "hidden",
  },

  blurView: {
    flex: 1,
  },

  // Dark semi-transparent overlay over the blur
  darkTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8, 10, 18, 0.75)",
  },

  // ── Foreground image inside the blur panel ──────────────
  // Positioned on the right side, partially visible
  // Matches screenshot: camera/scene image bleeding from right edge
  foregroundImg: {
    position: "absolute",

    width: width,
    height: height,
    opacity: 0.3,
  },

  // Text + button laid over everything
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: Platform.OS === "ios" ? 44 : 32,
    justifyContent: "space-between",
  },

  textGroup: {
    flex: 1,
    justifyContent: "flex-start",
  },

  headline: {
    fontSize: 28,
    lineHeight: 36,
    marginBottom: 14,
    letterSpacing: -0.3,
  },

  white: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 24,
  },

  orange: {
    color: "#E87722",
    fontStyle: "italic",
    fontWeight: "800",
    fontSize: 24,
  },

  body: {
    fontSize: 14,
    color: "rgba(255,255,255,0.68)",
    lineHeight: 21,
    letterSpacing: 0.05,
  },

  // Orange rounded-rect button
  btn: {
    backgroundColor: "#E87722",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E87722",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },

  btnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
