import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import "react-native-get-random-values"; // must be first — polyfills crypto.getRandomValues for tweetnacl on Android
import Toast from "react-native-toast-message";
import api from "../../api/axios";
import VerifyOtpModal from "../../components/common/verifyOtpModal";
import TermsModal from "../../components/TermsModal";
import { AppContext } from "../../context/AppContext";
import {
  encryptPrivateKey,
  generateNewKeyPair,
  saveUserKeysLocally,
} from "../../utils/encryption.js";
import AuthLayout from "./AuthLayout";

// ---------------------------------------------------------------------------
// AsyncStorage keys (mirrors web STORAGE_KEYS exactly)
// ---------------------------------------------------------------------------
const STORAGE_KEYS = {
  FORM: "signup_form",
  DOB: "signup_dob",
  TERMS_ACCEPTED: "signup_terms_accepted",
  TERMS_VERSION: "signup_terms_version",
  DIGITAL_SIGNATURE: "signup_digital_signature",
  ACKNOWLEDGED_CLAUSES: "signup_acknowledged_clauses",
  IS_EMAIL_VERIFIED: "signup_is_email_verified",
  USER_ID: "signup_user_id",
  VERIFICATION_TOKEN: "signup_verification_token",
  OTP_TIMER: "signup_otp_timer",
  OTP_TIMER_START: "signup_otp_timer_start",
  IS_OTP_MODAL_OPEN: "signup_is_otp_modal_open",
  TERMS_ACCEPTED_AT: "signup_terms_accepted_at",
};

const clearAllSignupStorage = async () => {
  await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
};

// ---------------------------------------------------------------------------
// Inline validators
// ---------------------------------------------------------------------------
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return { isValid: false, error: "Email is required" };
  if (!re.test(email))
    return { isValid: false, error: "Invalid email address" };
  return { isValid: true };
};

const validateDOB = (day, month, year) => {
  if (!day || !month || !year)
    return { isValid: false, error: "Date of birth is required" };
  const dob = new Date(
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
  );
  if (isNaN(dob.getTime()))
    return { isValid: false, error: "Invalid date of birth" };
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  if (age < 18)
    return { isValid: false, error: "You must be at least 18 years old" };
  return { isValid: true };
};

const validateSignupForm = (form, dob) => {
  const errors = {};
  if (!form.name?.trim()) errors.name = "Full name is required";
  if (!form.username?.trim()) errors.username = "Username is required";
  const emailV = validateEmail(form.email);
  if (!emailV.isValid) errors.email = emailV.error;
  if (!form.password || form.password.length < 8)
    errors.password = "Password must be at least 8 characters";
  if (!form.sex) errors.sex = "Please select your sex";
  const dobV = validateDOB(dob.day, dob.month, dob.year);
  if (!dobV.isValid) errors.dob = dobV.error;
  if (!form.interests || form.interests.length === 0)
    errors.interests = "Select at least one interest";
  return { isValid: Object.keys(errors).length === 0, errors };
};

// ---------------------------------------------------------------------------
// NativeSelect
// ---------------------------------------------------------------------------
const NativeSelect = ({
  value,
  options,
  placeholder,
  onSelect,
  isOpen,
  onToggle,
  openUp = false,
  hasError = false,
}) => (
  <View className="relative">
    <Pressable
      onPress={onToggle}
      className={`flex-row items-center justify-between border-[1.5px] rounded-xl px-[14px] bg-white/60 ${
        hasError ? "border-red-500" : "border-[#E9DED3]"
      }`}
    >
      <Text
        className={`flex-1 text-[14px] py-[11px] ${value ? "text-[#1F2937]" : "text-[#9CA3AF]"}`}
      >
        {value
          ? options.find((o) => String(o.value) === String(value))?.label ||
            value
          : placeholder}
      </Text>
      <Text className="text-[11px] text-[#9CA3AF]">▼</Text>
    </Pressable>

    {isOpen && (
      <View
        className={`absolute left-0 right-0 z-30 bg-white border-[1.5px] border-[#E9DED3] rounded-xl overflow-hidden ${
          openUp ? "bottom-[110%]" : "top-[110%]"
        }`}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 8,
        }}
      >
        <ScrollView
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          style={{ maxHeight: 220 }}
        >
          {options.map((opt) => (
            <Pressable
              key={opt.value}
              className="py-3 px-4 border-b border-[#F5EDE4]"
              onPress={() => {
                onSelect(String(opt.value));
                onToggle();
              }}
            >
              <Text
                className={`text-[14px] ${
                  String(value) === String(opt.value)
                    ? "text-[#E87722] font-semibold"
                    : "text-[#374151]"
                }`}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    )}
  </View>
);

// ---------------------------------------------------------------------------
// CheckboxItem
// ---------------------------------------------------------------------------
const CheckboxItem = ({ label, checked, onPress }) => (
  <Pressable
    onPress={onPress}
    className={`flex-row items-center py-2 px-3 rounded-[10px] border-[1.5px] gap-[6px] ${
      checked
        ? "border-[#E87722] bg-[#E87722]/[0.08]"
        : "border-[#E9DED3] bg-white/60"
    }`}
  >
    <View
      className={`w-4 h-4 rounded border-[1.5px] items-center justify-center ${
        checked ? "bg-[#E87722] border-[#E87722]" : "border-[#9CA3AF] bg-white"
      }`}
    >
      {checked && (
        <Text className="text-white text-[9px] font-extrabold">✓</Text>
      )}
    </View>
    <Text
      className={`text-[13px] ${checked ? "text-[#E87722] font-semibold" : "text-[#3A2A1F]"}`}
    >
      {label}
    </Text>
  </Pressable>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function Signup() {
  const { checkAuth, backendUrl } = useContext(AppContext);
  const router = useRouter();
  const CURRENT_YEAR = new Date().getFullYear();
  const TERMS_VERSION = "1.0.0";

  // ── Form state ───────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    sex: "",
    username: "",
    interests: [],
  });
  const [dob, setDob] = useState({ day: "", month: "", year: "" });

  // ── Terms state (mirrors web) ────────────────────────────────────────────
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [digitalSignature, setDigitalSignature] = useState(null);
  const [acknowledgedClauses, setAcknowledgedClauses] = useState(null);

  // ── OTP / registration state ─────────────────────────────────────────────
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [verificationToken, setVerificationToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [otpTimer, setOtpTimer] = useState(0);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const toggleDropdown = (id) =>
    setOpenDropdownId((prev) => (prev === id ? null : id));

  // ── Restore persisted state on mount (mirrors web localStorage init) ─────
  useEffect(() => {
    const restore = async () => {
      try {
        const pairs = await AsyncStorage.multiGet([
          STORAGE_KEYS.FORM,
          STORAGE_KEYS.DOB,
          STORAGE_KEYS.TERMS_ACCEPTED,
          STORAGE_KEYS.DIGITAL_SIGNATURE,
          STORAGE_KEYS.ACKNOWLEDGED_CLAUSES,
          STORAGE_KEYS.USER_ID,
          STORAGE_KEYS.VERIFICATION_TOKEN,
          STORAGE_KEYS.IS_OTP_MODAL_OPEN,
          STORAGE_KEYS.OTP_TIMER,
          STORAGE_KEYS.OTP_TIMER_START,
        ]);

        const get = (key) => pairs.find(([k]) => k === key)?.[1] ?? null;

        if (get(STORAGE_KEYS.FORM)) setForm(JSON.parse(get(STORAGE_KEYS.FORM)));
        if (get(STORAGE_KEYS.DOB)) setDob(JSON.parse(get(STORAGE_KEYS.DOB)));
        if (get(STORAGE_KEYS.TERMS_ACCEPTED) === "true") setTermsAccepted(true);
        if (get(STORAGE_KEYS.DIGITAL_SIGNATURE))
          setDigitalSignature(get(STORAGE_KEYS.DIGITAL_SIGNATURE));
        if (get(STORAGE_KEYS.ACKNOWLEDGED_CLAUSES))
          setAcknowledgedClauses(
            JSON.parse(get(STORAGE_KEYS.ACKNOWLEDGED_CLAUSES)),
          );
        if (get(STORAGE_KEYS.USER_ID)) setUserId(get(STORAGE_KEYS.USER_ID));
        if (get(STORAGE_KEYS.VERIFICATION_TOKEN))
          setVerificationToken(get(STORAGE_KEYS.VERIFICATION_TOKEN));
        if (get(STORAGE_KEYS.IS_OTP_MODAL_OPEN) === "true")
          setIsOtpModalOpen(true);

        // Restore OTP countdown — subtract elapsed time, same logic as web
        const savedTimer = get(STORAGE_KEYS.OTP_TIMER);
        const savedStart = get(STORAGE_KEYS.OTP_TIMER_START);
        if (savedTimer && savedStart) {
          const elapsed = Math.floor(
            (Date.now() - parseInt(savedStart)) / 1000,
          );
          const remaining = Math.max(0, parseInt(savedTimer) - elapsed);
          setOtpTimer(remaining);
        }
      } catch (err) {
        console.error("Failed to restore signup state:", err);
      }
    };
    restore();
  }, []);

  // ── Persist to AsyncStorage on change (mirrors web useEffect syncs) ──────
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.FORM, JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.DOB, JSON.stringify(dob));
  }, [dob]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.TERMS_ACCEPTED, String(termsAccepted));
  }, [termsAccepted]);

  useEffect(() => {
    if (digitalSignature)
      AsyncStorage.setItem(STORAGE_KEYS.DIGITAL_SIGNATURE, digitalSignature);
  }, [digitalSignature]);

  useEffect(() => {
    if (acknowledgedClauses)
      AsyncStorage.setItem(
        STORAGE_KEYS.ACKNOWLEDGED_CLAUSES,
        JSON.stringify(acknowledgedClauses),
      );
  }, [acknowledgedClauses]);

  useEffect(() => {
    if (userId) AsyncStorage.setItem(STORAGE_KEYS.USER_ID, String(userId));
  }, [userId]);

  useEffect(() => {
    if (verificationToken)
      AsyncStorage.setItem(STORAGE_KEYS.VERIFICATION_TOKEN, verificationToken);
  }, [verificationToken]);

  useEffect(() => {
    AsyncStorage.setItem(
      STORAGE_KEYS.IS_OTP_MODAL_OPEN,
      String(isOtpModalOpen),
    );
  }, [isOtpModalOpen]);

  useEffect(() => {
    if (otpTimer > 0) {
      AsyncStorage.multiSet([
        [STORAGE_KEYS.OTP_TIMER, String(otpTimer)],
        [STORAGE_KEYS.OTP_TIMER_START, String(Date.now())],
      ]);
    } else {
      AsyncStorage.multiRemove([
        STORAGE_KEYS.OTP_TIMER,
        STORAGE_KEYS.OTP_TIMER_START,
      ]);
    }
  }, [otpTimer]);

  // ── OTP countdown ticker ──────────────────────────────────────────────────
  useEffect(() => {
    if (otpTimer <= 0) return;
    const t = setTimeout(() => setOtpTimer((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [otpTimer]);

  // ── DOB helpers ──────────────────────────────────────────────────────────
  const getDaysInMonth = (month, year) => {
    if (!month || !year) return 31;
    return new Date(year, month, 0).getDate();
  };

  const handleDayChange = (value) => {
    const day = Number(value);
    const maxDays = getDaysInMonth(dob.month, dob.year);
    if (day < 0 || day > maxDays) {
      Toast.show({
        type: "error",
        text1: `Invalid date. Selected month has only ${maxDays} days.`,
      });
      return;
    }
    setDob((prev) => ({ ...prev, day: value }));
    if (dob.month && dob.year) {
      const v = validateDOB(value, dob.month, dob.year);
      setErrors((prev) => ({ ...prev, dob: v.isValid ? null : v.error }));
    }
  };

  const handleYearChange = (value) => {
    if (!/^\d*$/.test(value)) return;
    if (value.length < 4) {
      setDob((prev) => ({ ...prev, year: value }));
      return;
    }
    const year = Number(value);
    if (year < 1940 || year > CURRENT_YEAR) {
      Toast.show({
        type: "error",
        text1: `Year must be between 1940 and ${CURRENT_YEAR}`,
      });
      return;
    }
    setDob((prev) => ({ ...prev, year: value }));
    if (dob.day && dob.month) {
      const v = validateDOB(dob.day, dob.month, value);
      setErrors((prev) => ({ ...prev, dob: v.isValid ? null : v.error }));
    }
  };

  const handleMonthChange = (value) => {
    const maxDays = getDaysInMonth(value, dob.year);
    if (dob.day && Number(dob.day) > maxDays) {
      Toast.show({
        type: "error",
        text1: `Selected month has only ${maxDays} days`,
      });
      setDob((prev) => ({ ...prev, month: value, day: "" }));
      return;
    }
    setDob((prev) => ({ ...prev, month: value }));
    if (dob.day && dob.year) {
      const v = validateDOB(dob.day, value, dob.year);
      setErrors((prev) => ({ ...prev, dob: v.isValid ? null : v.error }));
    }
  };

  // ── Interests ────────────────────────────────────────────────────────────
  const toggleInterest = (interest) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  // ── Email ─────────────────────────────────────────────────────────────────
  const handleEmailChange = (email) => {
    setForm((prev) => ({ ...prev, email }));
    if (email) {
      const v = validateEmail(email);
      setErrors((prev) => ({ ...prev, email: v.isValid ? null : v.error }));
    } else {
      setErrors((prev) => ({ ...prev, email: null }));
    }
  };

  const handleBlur = (field) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  // ── Terms accept (mirrors web handleTermsAccept exactly) ─────────────────
  const handleTermsAccept = (acceptanceData) => {
    setTermsAccepted(true);
    setTermsError("");
    setDigitalSignature(acceptanceData.signatureHash);
    setAcknowledgedClauses(acceptanceData.acknowledgedClauses);
    // Persist extras not covered by individual useEffects
    AsyncStorage.multiSet([
      [STORAGE_KEYS.TERMS_VERSION, TERMS_VERSION],
      [STORAGE_KEYS.TERMS_ACCEPTED_AT, acceptanceData.acceptedAt],
    ]);
  };

  // ── Open terms URL (mirrors web openTermsModal) ───────────────────────────
  const openTermsUrl = () => {
    router.push("/(public)/terms-and-conditions");
  };

  // ── E2EE setup (mirrors web setupE2EE exactly) ────────────────────────────
  const setupE2EE = async (id, password) => {
    try {
      const { publicKey, privateKey } = generateNewKeyPair();
      await saveUserKeysLocally(id, publicKey, privateKey);

      const {
        encryptedPrivateKey,
        nonce: privateKeyNonce,
        salt: privateKeySalt,
      } = await encryptPrivateKey(privateKey, password);

      await api.post(
        "/api/keys/me",
        {
          publicKey,
          encryptedPrivateKey,
          privateKeyNonce,
          privateKeySalt,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // ← explicit auth header
          },
        },
      );
      console.info("[E2EE] Keypair generated and saved during signup.");
    } catch (err) {
      console.warn(
        "[E2EE] Key generation during signup failed (will retry on login):",
        err.message,
      );
    }
  };

  // ── Send OTP (mirrors web handleSendOtp exactly) ─────────────────────────
  const handleSendOtp = async () => {
    const emailV = validateEmail(form.email);
    if (!emailV.isValid) {
      Toast.show({ type: "error", text1: emailV.error });
      return;
    }
    if (!termsAccepted) {
      setTermsError("You must agree to the Terms & Conditions");
      Toast.show({
        type: "error",
        text1: "Please accept the Terms & Conditions first",
      });
      return;
    }

    setIsSendingOtp(true);
    try {
      // Mirror web: fall back to default clauses if TermsModal wasn't used
      const clauses = acknowledgedClauses || {
        age: true,
        risk: true,
        license: true,
        arbitration: true,
      };

      const termsAcceptedAt = await AsyncStorage.getItem(
        STORAGE_KEYS.TERMS_ACCEPTED_AT,
      );

      const signupData = {
        name: form.name,
        email: form.email,
        password: form.password,
        username: form.username,
        sex: form.sex,
        dob: `${dob.year}-${String(dob.month).padStart(2, "0")}-${String(dob.day).padStart(2, "0")}`,
        interests: form.interests,
        terms: {
          accepted: true,
          version: TERMS_VERSION,
          acceptedAt: termsAcceptedAt || new Date().toISOString(),
          signatureHash: digitalSignature,
          acknowledgedClauses: clauses,
        },
      };

      const res = await api.post("/api/user/register", signupData);

      if (res.data.success) {
        const uid = String(res.data.userId); // AsyncStorage requires strings
        const token = String(res.data.token);
        setUserId(uid);
        setVerificationToken(token);

        const otpRes = await api.post(
          "/api/user/send-verify-otp",
          { userId: uid },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (otpRes.data.success) {
          Toast.show({ type: "success", text1: "OTP sent to your email!" });
          setIsOtpModalOpen(true);
          setOtpTimer(60);
        }
      }
    } catch (error) {
      console.error("error in signing", error);
      console.error(
        "Backend response:",
        JSON.stringify(error.response?.data, null, 2),
      );
      const finalError =
        error.response?.data?.errors?.[0]?.message ||
        error.response?.data?.message ||
        "Failed to send OTP";
      Toast.show({ type: "error", text1: finalError });
    } finally {
      setIsSendingOtp(false);
    }
  };

  // ── After OTP verified — clears ALL storage, mirrors web exactly ──────────
  const handleVerifyOtp = async () => {
    setIsOtpModalOpen(false);
    await clearAllSignupStorage();
    await setupE2EE(userId, form.password, verificationToken); // move here
    await checkAuth(form.password);
    Toast.show({ type: "success", text1: "Signup successful!" });
    router.replace("/community-posts");
  };

  // ── Resend OTP (mirrors web handleResendOtp) ──────────────────────────────
  const handleResendOtp = async () => {
    if (otpTimer > 0) {
      Toast.show({
        type: "info",
        text1: `Please wait ${otpTimer} seconds before resending`,
      });
      return;
    }
    setIsSendingOtp(true);
    try {
      const res = await api.post(
        "/api/user/send-verify-otp",
        {},
        { headers: { Authorization: `Bearer ${verificationToken}` } },
      );
      if (res.data.success) {
        Toast.show({ type: "success", text1: "OTP resent successfully!" });
        setOtpTimer(60);
      }
    } catch {
      Toast.show({ type: "error", text1: "Failed to resend OTP" });
    } finally {
      setIsSendingOtp(false);
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    setTouched({
      name: true,
      username: true,
      email: true,
      password: true,
      sex: true,
      dob: true,
      interests: true,
    });

    if (!termsAccepted) {
      setTermsError("You must agree to the Terms & Conditions");
      Toast.show({
        type: "error",
        text1: "Please accept the Terms & Conditions",
      });
      return;
    }

    const validation = validateSignupForm(form, dob);
    if (!validation.isValid) {
      setErrors(validation.errors);
      Toast.show({ type: "error", text1: Object.values(validation.errors)[0] });
      return;
    }

    handleSendOtp();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AuthLayout>
      {/* Title */}
      <View className="items-center mb-7">
        <Text className="font-[PlayfairDisplay_700Bold] text-[27px] text-[#3A2A1F] mb-[6px]">
          Sign Up
        </Text>
        <Text className="text-[13px] text-[#6B5A4A]">
          Let's get you ready for your next trip
        </Text>
      </View>

      {/* Form */}
      <View className="gap-3">
        {/* Full name */}
        <View className="gap-1">
          <View
            className={`flex-row items-center border-[1.5px] rounded-xl px-[14px] bg-white/60 ${
              errors.name && touched.name
                ? "border-red-500"
                : "border-[#E9DED3]"
            }`}
          >
            <Text className="text-[15px] mr-[10px] opacity-50">👤</Text>
            <TextInput
              placeholder="Full name"
              value={form.name}
              onChangeText={(v) => setForm({ ...form, name: v })}
              onBlur={() => handleBlur("name")}
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-[14px] text-[#1F2937] py-[13px]"
            />
          </View>
          {errors.name && touched.name && (
            <Text className="text-red-500 text-xs">{errors.name}</Text>
          )}
        </View>

        {/* Username */}
        <View className="gap-1">
          <View
            className={`flex-row items-center border-[1.5px] rounded-xl px-[14px] bg-white/60 ${
              errors.username && touched.username
                ? "border-red-500"
                : "border-[#E9DED3]"
            }`}
          >
            <Text className="text-[15px] mr-[10px] opacity-50">🪪</Text>
            <TextInput
              placeholder="Username"
              value={form.username}
              onChangeText={(v) => setForm({ ...form, username: v })}
              onBlur={() => handleBlur("username")}
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-[14px] text-[#1F2937] py-[13px]"
            />
          </View>
          {errors.username && touched.username && (
            <Text className="text-red-500 text-xs">{errors.username}</Text>
          )}
        </View>

        {/* Email */}
        <View className="gap-1">
          <View
            className={`flex-row items-center border-[1.5px] rounded-xl px-[14px] bg-white/60 ${
              errors.email && touched.email
                ? "border-red-500"
                : "border-[#E9DED3]"
            }`}
          >
            <Text className="text-[15px] mr-[10px] opacity-50">✉️</Text>
            <TextInput
              placeholder="Email address"
              value={form.email}
              onChangeText={handleEmailChange}
              onBlur={() => handleBlur("email")}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-[14px] text-[#1F2937] py-[13px]"
            />
          </View>
          {errors.email && touched.email && (
            <Text className="text-red-500 text-xs">{errors.email}</Text>
          )}
        </View>

        {/* Password */}
        <View className="gap-1">
          <View
            className={`flex-row items-center border-[1.5px] rounded-xl px-[14px] bg-white/60 ${
              errors.password && touched.password
                ? "border-red-500"
                : "border-[#E9DED3]"
            }`}
          >
            <Text className="text-[15px] mr-[10px] opacity-50">🔒</Text>
            <TextInput
              placeholder="Password"
              value={form.password}
              onChangeText={(v) => setForm({ ...form, password: v })}
              onBlur={() => handleBlur("password")}
              secureTextEntry={!showPassword}
              placeholderTextColor="#9CA3AF"
              editable={!isSendingOtp}
              className="flex-1 text-[14px] text-[#1F2937] py-[13px]"
            />
            <Pressable
              onPress={() => setShowPassword((v) => !v)}
              disabled={isSendingOtp}
            >
              <Text className="text-[#9CA3AF] text-[13px]">
                {showPassword ? "Hide" : "Show"}
              </Text>
            </Pressable>
          </View>
          {errors.password && touched.password && (
            <Text className="text-red-500 text-xs">{errors.password}</Text>
          )}
        </View>

        {/* Sex */}
        <View className="gap-1">
          <NativeSelect
            value={form.sex}
            placeholder="Sex"
            onSelect={(v) => {
              setForm({ ...form, sex: v });
              handleBlur("sex");
            }}
            isOpen={openDropdownId === "sex"}
            onToggle={() => toggleDropdown("sex")}
            hasError={!!(errors.sex && touched.sex)}
            options={[
              { label: "Male", value: "Male" },
              { label: "Female", value: "Female" },
              { label: "Other", value: "Other" },
            ]}
          />
          {errors.sex && touched.sex && (
            <Text className="text-red-500 text-xs">{errors.sex}</Text>
          )}
        </View>

        {/* Date of Birth */}
        <View className="gap-1">
          <Text className="text-[13px] text-[#3A2A1F] font-medium mb-2">
            Date of Birth (Must be 18+)
          </Text>
          <View className="flex-row gap-2 items-start">
            <TextInput
              placeholder="DD"
              value={dob.day}
              onChangeText={handleDayChange}
              onBlur={() => handleBlur("dob")}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
              className={`flex-[2] border-[1.5px] rounded-xl px-[14px] py-3 bg-white/60 text-[14px] text-[#1F2937] text-center ${
                errors.dob && touched.dob
                  ? "border-red-500"
                  : "border-[#E9DED3]"
              }`}
            />
            <View className="flex-[2]">
              <NativeSelect
                value={dob.month}
                placeholder="MM"
                onSelect={(v) => {
                  handleMonthChange(v);
                  handleBlur("dob");
                }}
                isOpen={openDropdownId === "month"}
                onToggle={() => toggleDropdown("month")}
                openUp
                hasError={!!(errors.dob && touched.dob)}
                options={[...Array(12)].map((_, i) => ({
                  label: String(i + 1),
                  value: String(i + 1),
                }))}
              />
            </View>
            <TextInput
              placeholder="YYYY"
              value={dob.year}
              onChangeText={handleYearChange}
              onBlur={() => handleBlur("dob")}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
              className={`flex-[2] border-[1.5px] rounded-xl px-[14px] py-3 bg-white/60 text-[14px] text-[#1F2937] text-center ${
                errors.dob && touched.dob
                  ? "border-red-500"
                  : "border-[#E9DED3]"
              }`}
            />
          </View>
          {errors.dob && touched.dob && (
            <Text className="text-red-500 text-xs">{errors.dob}</Text>
          )}
        </View>

        {/* Interests */}
        <View className="gap-1">
          <Text className="text-[13px] text-[#3A2A1F] font-medium mb-2">
            Area of interest (Select at least one)
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {["Trekking", "Culture", "Beach", "Wildlife"].map((item) => (
              <CheckboxItem
                key={item}
                label={item}
                checked={form.interests.includes(item)}
                onPress={() => toggleInterest(item)}
              />
            ))}
          </View>
          {errors.interests && touched.interests && (
            <Text className="text-red-500 text-xs">{errors.interests}</Text>
          )}
        </View>

        {/* Terms & Conditions */}
        <View className="gap-1">
          <View className="flex-row items-start gap-2">
            <Pressable
              onPress={() => {
                setTermsAccepted((v) => !v);
                setTermsError("");
              }}
              className={`w-5 h-5 mt-[2px] rounded border-[1.5px] items-center justify-center ${
                termsAccepted
                  ? "bg-[#E87722] border-[#E87722]"
                  : "border-[#9CA3AF] bg-white"
              }`}
            >
              {termsAccepted && (
                <Text className="text-white text-[10px] font-extrabold">✓</Text>
              )}
            </Pressable>
            <Text className="flex-1 text-[13px] text-[#3A2A1F]">
              I have read and agree to the{" "}
              <Text
                className="text-[#E87722] font-medium"
                onPress={openTermsUrl}
              >
                Terms & Conditions
              </Text>
            </Text>
          </View>
          {termsError ? (
            <Text className="text-red-500 text-xs">{termsError}</Text>
          ) : null}

          {/* Digital signature badge — mirrors web's green confirmation box */}
          {digitalSignature ? (
            <View className="bg-green-50 border border-green-200 rounded-xl p-3 mt-1">
              <Text className="text-xs text-green-700 font-medium">
                ✓ Digital Signature Recorded
              </Text>
              <Text
                className="text-xs font-mono text-gray-600 mt-1"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Signature: {digitalSignature}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Submit */}
        <Pressable
          onPress={handleSubmit}
          disabled={!termsAccepted || isSendingOtp}
          className={`flex-row items-center justify-center gap-2 rounded-xl py-[15px] bg-[#E87722] mt-1 ${
            !termsAccepted || isSendingOtp ? "opacity-50" : ""
          }`}
          style={{
            shadowColor: "#E87722",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 6,
          }}
        >
          {isSendingOtp ? <ActivityIndicator color="#fff" /> : null}
          <Text className="text-white text-[15px] font-semibold tracking-[0.3px]">
            {isSendingOtp ? "Sending OTP…" : "Sign Up & Verify Email"}
          </Text>
        </Pressable>
      </View>

      {/* Footer */}
      <View className="mt-6 flex-row items-center justify-center">
        <Text className="text-[13px] text-[#6B5A4A]">
          Already have an account?{" "}
        </Text>
        <Text
          className="text-[13px] text-[#E87722] font-semibold"
          onPress={() => router.push("/login")}
        >
          Log In
        </Text>
      </View>

      {/* TermsModal — same component as web */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleTermsAccept}
        termsVersion={TERMS_VERSION}
      />

      {/* VerifyOtpModal — same component as web */}
      {isOtpModalOpen && (
        <VerifyOtpModal
          isOpen={isOtpModalOpen}
          onClose={() => setIsOtpModalOpen(false)}
          userId={userId}
          onVerified={handleVerifyOtp}
          onExpired={() => {
            // Mirrors web: clear modal, reset userId, show error
            setIsOtpModalOpen(false);
            setUserId(null);
            AsyncStorage.removeItem(STORAGE_KEYS.USER_ID);
            Toast.show({
              type: "error",
              text1: "OTP expired. Please sign up again.",
            });
          }}
        />
      )}
    </AuthLayout>
  );
}
