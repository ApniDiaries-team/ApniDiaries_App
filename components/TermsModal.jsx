// src/components/TermsModal.jsx (React Native + NativeWind)
import React, { useEffect, useRef, useState } from 'react'
import {
  Animated,
  Easing,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'

// ─── Close Icon ───────────────────────────────────────────────────────────────
const CloseIcon = () => (
  <Text className="text-gray-400 text-xl font-light leading-snug">✕</Text>
)

// ─── Spinner Icon (Animated.Text — transform must stay inline style) ──────────
const SpinnerIcon = () => {
  const rotation = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start()
  }, [rotation])
  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })
  return (
    <Animated.Text
      className="text-white text-base mr-1.5"
      style={{ transform: [{ rotate: spin }] }}
    >
      ◌
    </Animated.Text>
  )
}

// ─── Bounce Arrow (Animated.Text — transform must stay inline style) ──────────
const BounceArrow = () => {
  const bounceAnim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 4, duration: 400, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ).start()
  }, [bounceAnim])
  return (
    <Animated.Text
      className="text-[#6B5A4A] text-[13px] mr-1"
      style={{ transform: [{ translateY: bounceAnim }] }}
    >
      ▼
    </Animated.Text>
  )
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────
const Checkbox = ({ checked, onChange, disabled }) => (
  <TouchableOpacity
    onPress={disabled ? undefined : onChange}
    activeOpacity={disabled ? 1 : 0.7}
    className={`w-[18px] h-[18px] rounded border-2 items-center justify-center
      ${checked ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-300'}`}
  >
    {checked && (
      <Text className="text-white text-[11px] font-bold leading-[13px]">✓</Text>
    )}
  </TouchableOpacity>
)

// ─── Main Component ───────────────────────────────────────────────────────────
const TermsModal = ({ isOpen, onClose, onAccept, termsVersion }) => {
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)
  const [acceptedClause, setAcceptedClause] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setHasScrolledToEnd(false)
      setAcceptedClause(null)
    }
  }, [isOpen])

  const handleScroll = (e) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent
    const isBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 10
    setHasScrolledToEnd(isBottom)
  }

  const handleAccept = async () => {
    setIsAccepting(true)
    const timestamp = new Date().toISOString()
    const raw = `apnidiaries-${termsVersion}-${timestamp}-accepted`
    const signature = Buffer
      ? Buffer.from(raw).toString('base64')
      : btoa(raw)

    const acceptanceProof = {
      termsVersion,
      acceptedAt: timestamp,
      signature,
      clause: 'Complete Terms & Conditions',
      ipAddress: null,
      userAgent: Platform.OS,
    }

    onAccept(acceptanceProof)
    setIsAccepting(false)
    onClose()
  }

  const handleClauseAccept = (clauseNumber) => setAcceptedClause(clauseNumber)
  const clauseChecked = (n) => acceptedClause === n || hasScrolledToEnd

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* ── Backdrop ──────────────────────────────────────────────────────── */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="absolute inset-0 bg-black/50" />
      </TouchableWithoutFeedback>

      {/* ── Centred wrapper ───────────────────────────────────────────────── */}
      <View
        className="flex-1 justify-center items-center px-4 py-8"
        pointerEvents="box-none"
      >
        {/* ── Card ────────────────────────────────────────────────────────── */}
        <View className="bg-white rounded-[20px] w-full max-h-[90%] overflow-hidden shadow-xl elevation-12">

          {/* ── Header ────────────────────────────────────────────────────── */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200">
            <View>
              <Text className="text-xl font-bold text-[#3A2A1F] tracking-tight">
                Terms & Conditions
              </Text>
              <Text className="text-xs text-[#6B5A4A] mt-0.5">
                Version {termsVersion} • Last Updated: January 2026
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <CloseIcon />
            </TouchableOpacity>
          </View>

          {/* ── Scrollable Terms Content ──────────────────────────────────── */}
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator
          >
            {/* Notice Banner */}
            <View className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded mb-4">
              <Text className="text-xs font-semibold text-[#3A2A1F] tracking-wide">
                PLEASE READ THESE TERMS CAREFULLY
              </Text>
              <Text className="text-xs text-[#6B5A4A] mt-1 leading-[18px]">
                By clicking "Accept", accessing, or using the Services, you agree to be legally bound by
                these Terms and all policies incorporated by reference. If you do not agree, you must not
                access or use the Services.
              </Text>
            </View>

            {/* Company Name */}
            <Text className="text-base font-bold text-[#3A2A1F] mb-3">
              Apni Diaries Ltd.
            </Text>

            {/* ── Section 1 ─────────────────────────────────────────────── */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-[#3A2A1F] mb-1.5">
                1. Eligibility, Registration, and Account Responsibility
              </Text>
              {[
                { text: 'You must be at least ', bold: '18 years of age', after: ' to access or use the Services.' },
                'By registering, you represent and warrant that you meet this requirement.',
                'Use a unique password not used on other services',
                'Provide accurate, current, and complete information',
                'Keep your account information up to date',
                'Protect the security of your account and password',
                'Notify Apni Diaries immediately of any suspected security breach',
                'Accept full responsibility for all activity under your account',
              ].map((item, i) => (
                <View key={i} className="flex-row items-start mb-1 pl-1">
                  <Text className="text-[13px] text-[#4A3A2A] mr-2 leading-5">•</Text>
                  {typeof item === 'object' ? (
                    <Text className="flex-1 text-[13px] text-[#4A3A2A] leading-5">
                      {item.text}
                      <Text className="font-bold text-orange-500">{item.bold}</Text>
                      {item.after}
                    </Text>
                  ) : (
                    <Text className="flex-1 text-[13px] text-[#4A3A2A] leading-5">{item}</Text>
                  )}
                </View>
              ))}
            </View>

            {/* ── Section 3 (highlighted) ───────────────────────────────── */}
            <View className="mb-4 border-l-4 border-orange-500 pl-3 bg-orange-500/[0.04] py-2.5 rounded">
              <Text className="text-sm font-semibold text-[#3A2A1F] mb-1.5">
                3. Interactions with Other Members
              </Text>
              <Text className="text-[13px] text-[#4A3A2A] leading-5">
                <Text className="font-bold text-[#3A2A1F]">3.1 User Responsibility: </Text>
                The Services provide a platform for members to communicate, travel, arrange stays, and
                participate in activities. Apni Diaries does not control or participate in member
                interactions. You interact with others
                <Text className="font-bold text-[#3A2A1F]"> at your own risk</Text>.
              </Text>
              <Text className="text-[13px] text-[#4A3A2A] leading-5 mt-2">
                <Text className="font-bold text-[#3A2A1F]">3.5 Release: </Text>
                You agree to release Apni Diaries and its officers, directors, employees, agents, and
                affiliates from any claims or disputes arising from interactions with other members.
              </Text>
            </View>

            {/* ── Section 4.3 ───────────────────────────────────────────── */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-[#3A2A1F] mb-1.5">4.3 Content License</Text>
              <Text className="text-[13px] text-[#4A3A2A] leading-5">
                You retain ownership of your content. By posting it, you grant Apni Diaries a{' '}
                <Text className="font-bold text-[#3A2A1F]">
                  perpetual, worldwide, royalty-free, irrevocable, non-exclusive, and sublicensable license
                </Text>{' '}
                to use, reproduce, modify, distribute, and display the content for operating and promoting
                the Services.
              </Text>
            </View>

            {/* ── Section 14 ────────────────────────────────────────────── */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-[#3A2A1F] mb-1.5">14. Limitation of Liability</Text>
              <Text className="text-[13px] text-[#4A3A2A] leading-5">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, APNI DIARIES SHALL NOT BE LIABLE FOR INDIRECT,
                INCIDENTAL, OR CONSEQUENTIAL DAMAGES. TOTAL LIABILITY SHALL NOT EXCEED{' '}
                <Text className="font-bold text-[#3A2A1F]">INR 1 (ONE INDIAN RUPEE).</Text>
              </Text>
            </View>

            {/* ── Section 17 ────────────────────────────────────────────── */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-[#3A2A1F] mb-1.5">
                17. Dispute Resolution and Arbitration
              </Text>
              <Text className="text-[13px] text-[#4A3A2A] leading-5">
                All disputes shall be resolved through{' '}
                <Text className="font-bold text-[#3A2A1F]">binding arbitration in Jaipur, Rajasthan</Text>,
                conducted confidentially. You waive the right to a jury trial or class action.
              </Text>
            </View>

            {/* Bottom spacer */}
            <View className="h-4" />
          </ScrollView>

          {/* ── Key Clauses Acknowledgement ───────────────────────────────── */}
          <View className="px-5 py-3.5 bg-gray-50 border-t border-gray-200">
            <Text className="text-[13px] font-semibold text-[#3A2A1F] mb-2.5">
              Please acknowledge these key clauses:
            </Text>
            {[
              { n: 1, label: 'I confirm I am at least 18 years of age (Section 1)' },
              { n: 2, label: 'I understand I interact with other members at my own risk (Section 3)' },
              { n: 3, label: 'I grant Apni Diaries a perpetual license to my content (Section 4.3)' },
              { n: 4, label: 'I agree to binding arbitration in Jaipur (Section 17)' },
            ].map(({ n, label }) => (
              <TouchableOpacity
                key={n}
                className="flex-row items-center mb-2 gap-2"
                onPress={() => !hasScrolledToEnd && handleClauseAccept(n)}
                activeOpacity={0.7}
              >
                <Checkbox
                  checked={clauseChecked(n)}
                  onChange={() => handleClauseAccept(n)}
                  disabled={hasScrolledToEnd}
                />
                <Text className="flex-1 text-[13px] text-[#4A3A2A] leading-[18px] ml-2">
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Footer Actions ────────────────────────────────────────────── */}
          <View className="flex-row items-center justify-between px-5 py-3.5 border-t border-gray-200">
            {/* Scroll hint */}
            <View className="flex-1">
              {!hasScrolledToEnd && (
                <View className="flex-row items-center">
                  <BounceArrow />
                  <Text className="text-xs text-[#6B5A4A]">Scroll to the end to accept</Text>
                </View>
              )}
            </View>

            {/* Buttons */}
            <View className="flex-row items-center gap-2.5">
              <TouchableOpacity
                className="px-[18px] py-[9px] border border-gray-300 rounded-[10px] bg-white"
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text className="text-sm font-medium text-[#3A2A1F]">Decline</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`px-[18px] py-[9px] rounded-[10px] flex-row items-center
                  ${hasScrolledToEnd && !isAccepting ? 'bg-orange-500' : 'bg-gray-300'}`}
                onPress={hasScrolledToEnd && !isAccepting ? handleAccept : undefined}
                activeOpacity={hasScrolledToEnd && !isAccepting ? 0.8 : 1}
              >
                {isAccepting ? (
                  <View className="flex-row items-center">
                    <SpinnerIcon />
                    <Text className="text-sm font-semibold text-white">Processing...</Text>
                  </View>
                ) : (
                  <Text className="text-sm font-semibold text-white">Accept Terms</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </View>
    </Modal>
  )
}

export default TermsModal