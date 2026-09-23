import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import Toast from "react-native-toast-message";
import api from "../../api/axios";
import { AppContext } from "../../context/AppContext";
import AuthLayout from "./AuthLayout";

// ── Icon components ───────────────────────────────────────
const GoogleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <Path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <Path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <Path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </Svg>
);

const FacebookIcon = () => (
  <Svg width={20} height={20} fill="#1877F2" viewBox="0 0 24 24">
    <Path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </Svg>
);

// ── Component ─────────────────────────────────────────────
export default function Login() {
  const { login } = useContext(AppContext);
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);

  const { from } = useLocalSearchParams();
  const redirectTo = from || "/community-posts";

  const onSubmitHandler = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter both email and password",
      });
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.post("/api/user/login", { email, password });
      if (res.data.success) {
        await login(password);
        Toast.show({
          type: "success",
          text1: "Login Successful",
          text2: "Welcome back!",
        });
        router.replace(redirectTo);
      } else {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: res.data?.message || "Login failed",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          error.response?.data?.message ||
          "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      Alert.alert("Coming Soon", "Google login will be implemented with OAuth");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Google Login Failed",
        text2: "Please try again.",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setIsFacebookLoading(true);
    try {
      Alert.alert(
        "Coming Soon",
        "Facebook login will be implemented with OAuth",
      );
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Facebook Login Failed",
        text2: "Please try again.",
      });
    } finally {
      setIsFacebookLoading(false);
    }
  };

  const isDisabled = isLoading || isGoogleLoading || isFacebookLoading;

  return (
    <AuthLayout>
      {/* ── Header ── */}
      <View className="items-center mb-7">
        <Text className="font-playfair text-[27px] text-[#3A2A1F] mb-1.5">
          Login
        </Text>
        <Text className="text-[13px] text-[#6B5A4A]">
          Welcome back, traveler
        </Text>
      </View>

      {/* ── Form fields ── */}
      <View className="gap-3 mb-1">
        {/* Email */}
        <View
          className={`flex-row items-center border-[1.5px] border-[#E9DED3] rounded-xl px-3.5 py-0.5 bg-white/60 ${isDisabled ? "opacity-50" : ""}`}
        >
          <Text className="text-[15px] mr-2.5 opacity-50">👤</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!isDisabled}
            className="flex-1 font-inter text-sm text-gray-800 py-3"
          />
        </View>

        {/* Password */}
        <View
          className={`flex-row items-center border-[1.5px] border-[#E9DED3] rounded-xl px-3.5 py-0.5 bg-white/60 ${isDisabled ? "opacity-50" : ""}`}
        >
          <Text className="text-[15px] mr-2.5 opacity-50">🔒</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="password"
            editable={!isDisabled}
            className="flex-1 font-inter text-sm text-gray-800 py-3"
          />
          <TouchableOpacity
            onPress={() => setShowPassword((v) => !v)}
            disabled={isDisabled}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text className="text-xs text-[#9E8E80] font-medium pl-2">
              {showPassword ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Remember me + Forgot password */}
        <View className="flex-row items-center justify-between -mt-1 mb-1">
          <View className="flex-row items-center gap-1.5">

          </View>
          <TouchableOpacity
            onPress={() => router.push("/forgotPassword")}
            disabled={isDisabled}
          >
            <Text
              className={`font-inter text-xs text-[#E87722] font-medium ${isDisabled ? "opacity-50" : ""}`}
            >
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login button */}
        <TouchableOpacity
          onPress={onSubmitHandler}
          disabled={isDisabled}
          activeOpacity={0.85}
          className={`bg-[#E87722] rounded-xl py-[15px] items-center justify-center mt-1 ${isDisabled ? "opacity-50" : ""}`}
          style={{
            shadowColor: "#E87722",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 6,
          }}
        >
          {isLoading ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text className="text-white text-[15px] font-semibold tracking-wide">
                {" "}
                Logging in...
              </Text>
            </View>
          ) : (
            <Text className="text-white text-[15px] font-semibold tracking-wide">
              Login
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Divider ── */}
      {/* <View className="flex-row items-center my-5">
        <View className="flex-1 h-px bg-[#E9DED3]" />
        <Text className="font-inter text-xs text-[#6B5A4A] px-3">
          Or Continue With
        </Text>
        <View className="flex-1 h-px bg-[#E9DED3]" />
      </View> */}

      {/* ── Social buttons ── */}
      {/* <View className="flex-row gap-3 mb-2">
        <TouchableOpacity
          onPress={handleFacebookLogin}
          disabled={isDisabled}
          activeOpacity={0.8}
          className={`flex-1 bg-white border-[1.5px] border-[#E9DED3] rounded-xl py-[13px] items-center justify-center ${isDisabled ? "opacity-50" : ""}`}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 6,
            elevation: 3,
          }}
        >
          {isFacebookLoading ? (
            <ActivityIndicator color="#1877F2" size="small" />
          ) : (
            <View className="flex-row items-center gap-2">
              <FacebookIcon />
              <Text className="text-gray-700 text-sm font-medium">
                Facebook
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleGoogleLogin}
          disabled={isDisabled}
          activeOpacity={0.8}
          className={`flex-1 bg-white border-[1.5px] border-[#E9DED3] rounded-xl py-[13px] items-center justify-center ${isDisabled ? "opacity-50" : ""}`}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 6,
            elevation: 3,
          }}
        >
          {isGoogleLoading ? (
            <ActivityIndicator color="#4B5563" size="small" />
          ) : (
            <View className="flex-row items-center gap-2">
              <GoogleIcon />
              <Text className="text-gray-700 text-sm font-medium">Google</Text>
            </View>
          )}
        </TouchableOpacity>
      </View> */}

      {/* ── Footer ── */}
      <View className="flex-row items-center justify-center mt-5">
        <Text className="text-[13px] text-[#6B5A4A]">
          Don't Have An Account?{" "}
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/signup")}
          disabled={isDisabled}
        >
          <Text
            className={`text-[13px] text-[#E87722] font-semibold ${isDisabled ? "opacity-50" : ""}`}
          >
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
}
