import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

const mainBg = require("../../assets/HomePage.png");
const { height } = Dimensions.get("window");

export default function AuthLayout({ children, isCentered = false }) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* ── Single ScrollView wraps EVERYTHING so whole page scrolls ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* ── Top image section — fixed height ── */}
        <View style={{ height: height * 0.42 }}>
          <ImageBackground
            source={mainBg}
            style={{ flex: 1 }}
            resizeMode="cover"
          >
            <LinearGradient
              colors={["rgba(255,247,237,0.1)", "rgba(255,247,237,0.1)"]}
              style={StyleSheet_absoluteFill}
            />
            {/* ── Text over the image ── */}
            <View
              style={{
                flex: 1,
                justifyContent: "flex-end",
                paddingHorizontal: 28,
                paddingBottom: 100,
              }}
            >
              {/* Brand name — small refined label */}
              <Text
                style={{
                  fontSize: 18,
                  color: "rgba(255,255,255,1)",
                  letterSpacing: 4,
                  textTransform: "uppercase",
                  fontFamily: "PlayfairDisplay_500Medium",
                  marginBottom: 12,
                }}
              >
                ApniDiaries
              </Text>

              {/* Main headline */}
              <Text
                style={{
                  fontSize: 38,
                  color: "#fff",
                  lineHeight: 46,
                  marginBottom: 14,
                  fontFamily: "PlayfairDisplay_800ExtraBold",
                  letterSpacing: -0.5,
                }}
              >
                {"Share your\n"}
                <Text
                  style={{
                    color: "#E87722",
                    fontFamily: "PlayfairDisplay_800ExtraBold",
                    fontStyle: "italic",
                  }}
                >
                  {"travel stories"}
                </Text>
              </Text>

              {/* Thin divider line */}
              <View
                style={{
                  width: 40,
                  height: 2,
                  backgroundColor: "#E87722",
                  borderRadius: 2,
                  marginBottom: 14,
                  opacity: 1,
                }}
              />

              {/* Subtitle */}
              <Text
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.78)",
                  lineHeight: 22,
                  fontFamily: "PlayfairDisplay_500Medium",
                  letterSpacing: 0.2,
                }}
              >
                {"Connect with travelers across India"}
              </Text>
            </View>
          </ImageBackground>
        </View>

        {/* ── Bottom card — overlaps image, grows to fill rest of screen ── */}
        <View
          style={{
            flex: 1,
            marginTop: -(height * 0.07),
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            backgroundColor: "#FFFFFF",
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 16,
            elevation: 12,
            // Ensure card is tall enough even with little content
            minHeight: height * 0.7,
          }}
        >
          <View
            style={{
              paddingHorizontal: 24,
              paddingTop: 32,
              paddingBottom: Platform.OS === "ios" ? 40 : 28,
            }}
          >
            {children}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const StyleSheet_absoluteFill = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};
