import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import api from "../../api/axios";
import { getCachedPasswordForEmail } from "../../context/AppContext";
import { decryptPrivateKey, encryptPrivateKey } from "../../utils/encryption";
import AuthLayout from "./AuthLayout";

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------
const Step = ({ n, active, done, label }) => (
  <View className="items-center gap-1">
    <View
      className={`w-8 h-8 rounded-full items-center justify-center border-2 ${
        done
          ? "bg-[#F97316] border-[#F97316]"
          : active
            ? "bg-white border-[#F97316]"
            : "bg-white border-[#D5C5B8]"
      }`}
    >
      {done ? (
        <Text className="text-white text-sm font-bold">✓</Text>
      ) : (
        <Text
          className={`text-[13px] font-bold ${active ? "text-[#F97316]" : "text-[#9E8E80]"}`}
        >
          {n}
        </Text>
      )}
    </View>
    <Text
      className={`text-[10px] font-semibold ${active ? "text-[#F97316]" : "text-[#9E8E80]"}`}
    >
      {label}
    </Text>
  </View>
);

const StepConnector = ({ done }) => (
  <View
    className={`flex-1 h-0.5 mb-4 rounded-full ${done ? "bg-[#F97316]" : "bg-[#E8D8CC]"}`}
  />
);

// ---------------------------------------------------------------------------
// OTP input — 6 individual boxes
// ---------------------------------------------------------------------------
const OtpInput = ({ value, onChange }) => {
  const refs = Array.from({ length: 6 }, () => useRef(null));
  const digits = (value + "      ").slice(0, 6).split("");

  const handleChange = (i, text) => {
    // Handle pasting (multiple digits at once)
    if (text.length > 1) {
      const pasted = text.replace(/\D/g, "").slice(0, 6);
      onChange(pasted);
      // Focus the next empty box or the last one
      const nextIndex = Math.min(pasted.length, 5);
      refs[nextIndex].current?.focus();
      return;
    }

    const char = text.replace(/\D/g, "");
    const next = value.slice(0, i) + char + value.slice(i + 1);
    onChange(next.slice(0, 6));
    if (char && i < 5) refs[i + 1].current?.focus();
  };

  const handleKeyPress = (i, e) => {
    if (e.nativeEvent.key === "Backspace") {
      const next = value.slice(0, i) + " " + value.slice(i + 1);
      onChange(next.trimEnd());
      if (i > 0) refs[i - 1].current?.focus();
    }
  };

  return (
    <View className="flex-row gap-2 justify-center">
      {digits.map((d, i) => (
        <TextInput
          key={i}
          ref={refs[i]}
          value={d.trim()}
          onChangeText={(t) => handleChange(i, t)}
          onKeyPress={(e) => handleKeyPress(i, e)}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
          className={`w-11 h-[52px] text-center text-xl font-bold rounded-xl border-2 bg-white/70 text-[#3A2A1F] ${
            d.trim() ? "border-[#F97316]" : "border-[#D5C5B8]"
          }`}
        />
      ))}
    </View>
  );
};

// ---------------------------------------------------------------------------
// Password strength meter
// ---------------------------------------------------------------------------
const PasswordStrength = ({ password }) => {
  if (!password) return null;
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#EF4444", "#F59E0B", "#3B82F6", "#22C55E"];
  return (
    <View className="mt-2 gap-1">
      <View className="flex-row gap-1">
        {[1, 2, 3, 4].map((n) => (
          <View
            key={n}
            className="flex-1 h-1 rounded-full"
            style={{ backgroundColor: n <= score ? colors[score] : "#E8D8CC" }}
          />
        ))}
      </View>
      <Text className="text-xs font-semibold" style={{ color: colors[score] }}>
        {labels[score]}
      </Text>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Reusable info banner
// ---------------------------------------------------------------------------
const Banner = ({ type, children }) => {
  const isGreen = type === "green";
  return (
    <View
      className={`flex-row gap-2 p-3 rounded-xl border ${isGreen ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}
    >
      <Text className="text-sm">{isGreen ? "🛡️" : "⚠️"}</Text>
      <Text
        className={`flex-1 text-xs leading-[18px] ${isGreen ? "text-green-800" : "text-amber-800"}`}
      >
        {children}
      </Text>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function ForgotPassword() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const serverKeyRef = useRef(null);
  const decryptedPrivKeyRef = useRef(null);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleSendOtp = async () => {
    if (!email) {
      Toast.show({ type: "error", text1: "Please enter your email" });
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/user/send-reset-otp", { email });
      if (res.data.success) {
        Toast.show({ type: "success", text1: "OTP sent! Check your inbox." });
        setStep(2);
        setResendCooldown(60);
      } else {
        Toast.show({
          type: "error",
          text1: res.data.message || "Failed to send OTP",
        });
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: err.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.trim().length !== 6) {
      Toast.show({ type: "error", text1: "Enter the 6-digit OTP" });
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/keys/fetch-for-reset", {
        email,
        otp: otp.trim(),
      });
      if (
        res.data?.success &&
        res.data?.encryptedPrivateKey &&
        res.data?.privateKeyNonce &&
        res.data?.privateKeySalt
      ) {
        serverKeyRef.current = res.data;
        // Silent, best-effort E2EE key migration: no password field is shown
        // to the user. If this exact device still has a cached password for
        // this email from a previous logged-in session, we use it to decrypt
        // the existing key so old chat history keeps working after reset. If
        // nothing is cached (new device, or never logged in here), this just
        // stays null — old encrypted messages won't be recoverable, same as
        // choosing "skip" used to do, just without asking the user first.
        try {
          const cachedPwd = await getCachedPasswordForEmail(email);
          if (cachedPwd) {
            const privKey = await decryptPrivateKey(
              res.data.encryptedPrivateKey,
              res.data.privateKeyNonce,
              res.data.privateKeySalt,
              cachedPwd,
            );
            decryptedPrivKeyRef.current = privKey;
          } else {
            decryptedPrivKeyRef.current = null;
          }
        } catch {
          decryptedPrivKeyRef.current = null;
        }
      } else {
        serverKeyRef.current = null;
        decryptedPrivKeyRef.current = null;
      }
    } catch {
      serverKeyRef.current = null;
      decryptedPrivKeyRef.current = null;
    } finally {
      setLoading(false);
    }
    setStep(3);
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      Toast.show({
        type: "error",
        text1: "Password must be at least 8 characters",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      Toast.show({ type: "error", text1: "Passwords do not match" });
      return;
    }
    setLoading(true);
    try {
      let reEncryptedPayload = {};
      if (decryptedPrivKeyRef.current) {
        const { encryptedPrivateKey, nonce, salt } = await encryptPrivateKey(
          decryptedPrivKeyRef.current,
          newPassword,
        );
        reEncryptedPayload = {
          encryptedPrivateKey,
          privateKeyNonce: nonce,
          privateKeySalt: salt,
        };
      }
      const res = await api.post("/api/user/reset-password", {
        email,
        otp: otp.trim(),
        newPassword,
        ...reEncryptedPayload,
      });
      if (res.data.success) {
        Toast.show({
          type: "success",
          text1: "Password reset! Please log in.",
        });
        router.replace("/login");
      } else {
        Toast.show({
          type: "error",
          text1: res.data.message || "Reset failed",
        });
        if (res.data.message?.toLowerCase().includes("otp")) setStep(2);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      Toast.show({ type: "error", text1: msg });
      if (
        msg.toLowerCase().includes("otp") ||
        msg.toLowerCase().includes("expired")
      )
        setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ["Email", "OTP", "Password"];
  const stepSubtitles = {
    1: "We'll send a 6-digit OTP to your email",
    2: `OTP sent to ${email}`,
    3: "Choose a strong new password",
  };

  // Shared class helpers
  const inputBase =
    "border-2 border-[#E9DED3] rounded-xl px-4 py-3 text-sm text-[#111] bg-white";
  const btnPrimaryClass = (disabled) =>
    `flex-row items-center justify-center gap-2 rounded-xl py-3.5 bg-[#F97316] ${disabled ? "opacity-50" : ""}`;
  const btnOutlineClass =
    "flex-row items-center justify-center border-2 border-[#D5C5B8] rounded-xl py-3.5";

  return (
    <AuthLayout isCentered>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title — Playfair */}
        <View className="items-center mb-5">
          <Text className="font-playfair text-[22px] text-[#3A2A1F]">
            Reset Password
          </Text>
          <Text className="text-[13px] text-[#6B5A4A] mt-1.5 text-center">
            {stepSubtitles[step]}
          </Text>
        </View>

        {/* Step indicators */}
        <View className="flex-row items-center mb-6">
          {stepLabels.map((label, idx) => (
            <View
              key={label}
              className="flex-row items-center"
              style={{ flex: idx < stepLabels.length - 1 ? 1 : 0 }}
            >
              <Step
                n={idx + 1}
                active={step === idx + 1}
                done={step > idx + 1}
                label={label}
              />
              {idx < stepLabels.length - 1 && (
                <StepConnector done={step > idx + 1} />
              )}
            </View>
          ))}
        </View>

        {/* ── STEP 1: Email ── */}
        {step === 1 && (
          <View className="gap-4">
            <View className="gap-1.5">
              <Text className="text-[11px] font-bold text-[#6B5A4A] tracking-widest">
                EMAIL ADDRESS
              </Text>
              <TextInput
                placeholder="you@example.com"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus
                className={inputBase}
                editable={!loading}
              />
            </View>
            <Pressable
              onPress={handleSendOtp}
              disabled={loading}
              className={btnPrimaryClass(loading)}
            >
              {loading ? <ActivityIndicator color="#fff" /> : null}
              <Text className="text-white text-[15px] font-semibold">
                {loading ? "Sending OTP…" : "Send OTP"}
              </Text>
            </Pressable>
          </View>
        )}

        {/* ── STEP 2: OTP ── */}
        {step === 2 && (
          <View className="gap-5">
            <View className="gap-3">
              <Text className="text-[11px] font-bold text-[#6B5A4A] tracking-widest text-center">
                ENTER 6-DIGIT OTP
              </Text>
              <OtpInput value={otp} onChange={setOtp} />
            </View>
            <Text className="text-center text-[13px] text-[#6B5A4A]">
              Didn't receive it?{" "}
              {resendCooldown > 0 ? (
                <Text className="text-[#9E8E80]">
                  Resend in {resendCooldown}s
                </Text>
              ) : (
                <Text
                  className="text-[#F97316] font-semibold"
                  onPress={handleSendOtp}
                >
                  Resend OTP
                </Text>
              )}
            </Text>
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setStep(1)}
                className={`${btnOutlineClass} flex-1`}
              >
                <Text className="text-[#6B5A4A] font-semibold">← Back</Text>
              </Pressable>
              <Pressable
                onPress={handleVerifyOtp}
                disabled={otp.trim().length !== 6 || loading}
                className={`${btnPrimaryClass(otp.trim().length !== 6 || loading)} flex-1`}
              >
                {loading ? <ActivityIndicator color="#fff" /> : null}
                <Text className="text-white font-semibold">
                  {loading ? "Verifying…" : "Verify OTP →"}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ── STEP 3: New password ── */}
        {step === 3 && (
          <View className="gap-4">
            {decryptedPrivKeyRef.current ? (
              <Banner type="green">
                Encryption key verified — your full chat history will be
                preserved across all devices.
              </Banner>
            ) : (
              <Banner type="amber">
                Your encryption key could not be migrated. Previous messages may
                not be visible on new devices. Existing sessions will continue
                to work normally.
              </Banner>
            )}

            <View className="gap-1.5">
              <Text className="text-[11px] font-bold text-[#6B5A4A] tracking-widest">
                NEW PASSWORD
              </Text>
              <View>
                <TextInput
                  placeholder="Min. 8 characters"
                  placeholderTextColor="#9ca3af"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPwd}
                  autoFocus
                  autoCapitalize="none"
                  autoCorrect={false}
                  className={`${inputBase} pr-12`}
                />
                <Pressable
                  onPress={() => setShowNewPwd((v) => !v)}
                  className="absolute right-3 top-3.5"
                >
                  <Text className="text-[#9E8E80] text-[13px]">
                    {showNewPwd ? "Hide" : "Show"}
                  </Text>
                </Pressable>
              </View>
              <PasswordStrength password={newPassword} />
            </View>

            <View className="gap-1.5">
              <Text className="text-[11px] font-bold text-[#6B5A4A] tracking-widest">
                CONFIRM PASSWORD
              </Text>
              <View>
                <TextInput
                  placeholder="Repeat your password"
                  placeholderTextColor="#9ca3af"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                  autoCorrect={false}
                  className={`${inputBase} pr-12 ${
                    confirmPassword && confirmPassword !== newPassword
                      ? "border-red-400"
                      : confirmPassword && confirmPassword === newPassword
                        ? "border-green-400"
                        : "border-[#E9DED3]"
                  }`}
                />
                <Pressable
                  onPress={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-3.5"
                >
                  <Text className="text-[#9E8E80] text-[13px]">
                    {showConfirm ? "Hide" : "Show"}
                  </Text>
                </Pressable>
              </View>
              {confirmPassword && confirmPassword !== newPassword && (
                <Text className="text-xs text-red-500">
                  Passwords do not match
                </Text>
              )}
              {confirmPassword && confirmPassword === newPassword && (
                <Text className="text-xs text-green-600">
                  ✓ Passwords match
                </Text>
              )}
            </View>

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setStep(2)}
                className={`${btnOutlineClass} flex-1`}
              >
                <Text className="text-[#6B5A4A] font-semibold">← Back</Text>
              </Pressable>
              <Pressable
                onPress={handleResetPassword}
                disabled={
                  loading ||
                  newPassword !== confirmPassword ||
                  newPassword.length < 8
                }
                className={`${btnPrimaryClass(loading || newPassword !== confirmPassword || newPassword.length < 8)} flex-1`}
              >
                {loading ? <ActivityIndicator color="#fff" /> : null}
                <Text className="text-white font-semibold">
                  {loading ? "Resetting…" : "Reset Password"}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Footer */}
        <View className="mt-6 items-center">
          <Text className="text-[13px] text-[#6B5A4A]">
            Remembered your password?{" "}
            <Text
              className="text-[#F97316] font-semibold"
              onPress={() => router.push("/login")}
            >
              Log in
            </Text>
          </Text>
        </View>
      </ScrollView>
    </AuthLayout>
  );
}