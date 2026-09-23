// components/common/verifyOtpModal.jsx — React Native version
import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native'
import { verifyAccountApi } from '../../services/user.api'

const EXPIRY_SECONDS = 3 * 60  // 3 minutes, matches web

const VerifyOtpModal = ({ isOpen, onClose, userId, onVerified, onExpired }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(EXPIRY_SECONDS)
  const [expired, setExpired] = useState(false)

  const inputRefs = useRef([])
  const timerRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    setOtp(['', '', '', '', '', ''])
    setError('')
    setExpired(false)
    setSecondsLeft(EXPIRY_SECONDS)
    setTimeout(() => inputRefs.current[0]?.focus(), 150)

    // Start the 3-minute countdown
    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(timerRef.current)
          setExpired(true)
          onExpired?.()
          return 0
        }
        return s - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [isOpen])

  const otpValue = otp.join('')
  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const secs = String(secondsLeft % 60).padStart(2, '0')
  const urgency = secondsLeft <= 30

  const handleChange = (value, index) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)
    if (digit && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (otp[index]) {
        const newOtp = [...otp]
        newOtp[index] = ''
        setOtp(newOtp)
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    }
  }

  const handleVerify = async () => {
    Keyboard.dismiss()
    if (expired) {
      setError('OTP has expired. Please sign up again.')
      return
    }
    if (otpValue.length !== 6) {
      setError('Please enter the 6-digit OTP')
      return
    }
    setError('')
    try {
      setLoading(true)
      const res = await verifyAccountApi({ userId, otp: otpValue })
      if (res?.data?.success) {
        clearInterval(timerRef.current)
        onVerified?.()
        onClose()
      } else {
        setError(res?.data?.message || 'Invalid OTP')
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Something went wrong'
      if (msg.toLowerCase().includes('expired')) {
        setExpired(true)
        onExpired?.()
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => {}}>
      <View
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 }}
      >
        <Pressable
          style={{ width: '100%', maxWidth: 360, backgroundColor: '#fff', borderRadius: 20, padding: 24 }}
          onPress={() => { }}
        >
          {/* Close button — hidden when expired, same as web */}
          {!expired && (
            <Pressable onPress={onClose} style={{ position: 'absolute', top: 16, right: 16, padding: 4 }}>
              <Text style={{ fontSize: 18, color: '#9ca3af' }}>✕</Text>
            </Pressable>
          )}

          <View style={{ alignItems: 'center', gap: 16 }}>
            <Text style={{ fontSize: 22, fontWeight: '600', color: '#111827' }}>
              {expired ? 'OTP Expired' : 'Verify OTP'}
            </Text>

            {!expired ? (
              <>
                <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20 }}>
                  Enter the 6-digit OTP sent to your email.
                </Text>

                {/* Countdown timer — matches web urgency styling */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 999,
                  backgroundColor: urgency ? '#fee2e2' : '#fff7ed',
                }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: urgency ? '#dc2626' : '#f97316' }}>
                    ⏱ {mins}:{secs}
                  </Text>
                  <Text style={{ fontSize: 12, color: urgency ? '#dc2626' : '#9ca3af' }}>
                    {urgency ? 'Hurry up!' : 'to verify'}
                  </Text>
                </View>

                {/* OTP Boxes */}
                <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      value={digit}
                      onChangeText={(val) => handleChange(val, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                      style={{
                        width: 44,
                        height: 52,
                        borderWidth: 1.5,
                        borderColor: digit ? '#E87722' : '#e5e7eb',
                        borderRadius: 12,
                        textAlign: 'center',
                        fontSize: 20,
                        fontWeight: '600',
                        color: '#111827',
                        backgroundColor: '#f9fafb',
                      }}
                    />
                  ))}
                </View>

                {!!error && (
                  <Text style={{ color: '#ef4444', fontSize: 13, fontWeight: '500' }}>{error}</Text>
                )}

                <Pressable
                  onPress={handleVerify}
                  disabled={loading || expired}
                  style={{
                    width: '100%',
                    paddingVertical: 13,
                    borderRadius: 100,
                    backgroundColor: loading ? '#e8904d' : '#E87722',
                    alignItems: 'center',
                    opacity: loading || expired ? 0.6 : 1,
                  }}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>Verify OTP</Text>
                  }
                </Pressable>
              </>
            ) : (
              /* Expired state — matches web exactly */
              <>
                <Text style={{ fontSize: 48 }}>⏰</Text>
                <Text style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20 }}>
                  Your OTP has expired and your account has been removed. Please sign up again.
                </Text>
                <Pressable
                  onPress={onClose}
                  style={{
                    width: '100%',
                    paddingVertical: 13,
                    borderRadius: 100,
                    backgroundColor: '#E87722',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>Sign Up Again</Text>
                </Pressable>
              </>
            )}
          </View>
        </Pressable>
      </View>
    </Modal>
  )
}

export default VerifyOtpModal