import DateTimePicker from '@react-native-community/datetimepicker'
import { useState } from 'react'
import { Platform, Pressable, Text, TextInput, View } from 'react-native'
import Icon from '../../../components/AppIcon'
import { useDarkMode } from '../../../context/DarkModeContext'

// ── Field wrapper — mirrors web Input component + Bio label pattern ──
const Field = ({ label, required, description, error, isDarkMode, children }) => (
  <View style={{ gap: 6 }}>
    {/* Label — matches: <label className='block text-sm font-medium'> */}
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: '500',
          color: isDarkMode ? '#f9fafb' : '#111827',
        }}
      >
        {label}
      </Text>
      {required && (
        <Text style={{ color: isDarkMode ? '#F87171' : '#EF4444', fontSize: 14 }}>*</Text>
      )}
    </View>

    {children}

    {/* Description + shown below input unless it's Bio (Bio has its own row) */}
    {description && (
      <Text
        style={{
          fontSize: 12,
          color: isDarkMode ? '#9ca3af' : '#6b7280',
        }}
      >
        {description}
      </Text>
    )}

    {/* Error — matches: <p className='text-sm flex items-center gap-1'> */}
    {error && (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Icon name="AlertCircle" size={14} color={isDarkMode ? '#F87171' : '#EF4444'} />
        <Text style={{ fontSize: 14, color: isDarkMode ? '#F87171' : '#EF4444' }}>
          {error}
        </Text>
      </View>
    )}
  </View>
)

// ── Shared input style ────────────────────────────────────────────────
const inputStyle = (isDarkMode) => ({
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: isDarkMode ? '#374151' : '#e5e7eb',
  backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
  fontSize: 14,
  color: isDarkMode ? '#f9fafb' : '#111827',
})

// ── Main Component ────────────────────────────────────────────────────
const BasicInfoSection = ({ formData, errors, onChange }) => {
  const { isDarkMode } = useDarkMode()

  const bioLength = formData?.bio?.length || 0
  const maxBioLength = 500

  // Date picker state — replaces web <input type='date'>
  const [showDatePicker, setShowDatePicker] = useState(false)

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios') // keep open on iOS
    if (selectedDate) {
      const formatted = selectedDate.toISOString().split('T')[0] // YYYY-MM-DD
      onChange('dateOfBirth', formatted)
    }
  }

  const parsedDate = formData?.dateOfBirth
    ? new Date(formData.dateOfBirth)
    : new Date(new Date().setFullYear(new Date().getFullYear() - 18))

  return (
    <View
      style={{
        borderRadius: 12,
        padding: 16,
        backgroundColor: isDarkMode ? '#1f2937' : '#fff',
        borderWidth: 1,
        borderColor: isDarkMode ? '#374151' : '#f3f4f6',
        top: 25
      }}
    >
      {/* Header — matches: <div className='flex items-center gap-3 mb-6'> */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isDarkMode
              ? 'rgba(59, 130, 246, 0.2)'
              : 'rgba(59, 130, 246, 0.1)',
          }}
        >
          <Icon
            name="User"
            size={20}
            color={isDarkMode ? '#60A5FA' : '#3B82F6'}
          />
        </View>
        {/* matches: <h3 className='text-lg md:text-xl font-semibold'> */}
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: isDarkMode ? '#f9fafb' : '#111827',
          }}
        >
          Basic Information
        </Text>
      </View>

      {/* Fields — matches: <div className='space-y-4 md:space-y-6'> */}
      <View style={{ gap: 20 }}>

        {/* Full Name */}
        <Field
          label="Full Name"
          required
          description="Your name will be visible to other travelers"
          error={errors?.name}
          isDarkMode={isDarkMode}
        >
          <TextInput
            value={formData?.name || ''}
            onChangeText={(v) => onChange('name', v)}
            placeholder="Enter your full name"
            placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
            style={inputStyle(isDarkMode)}
          />
        </Field>

        {/* Username */}
        <Field
          label="Username"
          required
          description="Unique identifier for your profile"
          error={errors?.username}
          isDarkMode={isDarkMode}
        >
          <TextInput
            value={formData?.username || ''}
            onChangeText={(v) => onChange('username', v)}
            placeholder="@username"
            placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
            autoCapitalize="none"
            style={inputStyle(isDarkMode)}
          />
        </Field>

        {/* Bio — custom layout to match web's flex justify-between description+counter row */}
        <View style={{ gap: 6 }}>
          {/* Label row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: isDarkMode ? '#f9fafb' : '#111827',
              }}
            >
              Bio
            </Text>
            <Text style={{ color: isDarkMode ? '#F87171' : '#EF4444', fontSize: 14 }}>*</Text>
          </View>

          {/* Textarea — matches: <textarea rows={5}> */}
          <TextInput
            value={formData?.bio || ''}
            onChangeText={(v) => onChange('bio', v)}
            placeholder="Tell other travelers about yourself, your travel experiences, and what you're looking for..."
            placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
            multiline
            maxLength={maxBioLength}
            style={[
              inputStyle(isDarkMode),
              {
                minHeight: 140, // matches rows={5}
                textAlignVertical: 'top',
              },
            ]}
            aria-label="Biography"
          />

          {/* Description + counter row — matches: <div className='flex items-center justify-between'> */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 12, color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
              Share your travel story and interests
            </Text>
            {/* Counter — matches amber warning at 90% */}
            <Text
              style={{
                fontSize: 12,
                fontWeight: '500',
                color: bioLength > maxBioLength * 0.9
                  ? (isDarkMode ? '#FBBF24' : '#D97706')
                  : (isDarkMode ? '#9ca3af' : '#6b7280'),
              }}
            >
              {bioLength}/{maxBioLength}
            </Text>
          </View>

          {/* Bio error */}
          {errors?.bio && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="AlertCircle" size={14} color={isDarkMode ? '#F87171' : '#EF4444'} />
              <Text style={{ fontSize: 14, color: isDarkMode ? '#F87171' : '#EF4444' }}>
                {errors.bio}
              </Text>
            </View>
          )}
        </View>

        {/* Email Address */}
        <Field
          label="Email Address"
          required
          description="Used for account notifications and recovery"
          error={errors?.email}
          isDarkMode={isDarkMode}
        >
          <TextInput
            value={formData?.email || ''}
            onChangeText={(v) => onChange('email', v)}
            placeholder="your.email@example.com"
            placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
            keyboardType="email-address"
            autoCapitalize="none"
            style={inputStyle(isDarkMode)}
          />
        </Field>

        {/* Phone Number */}
        <Field
          label="Phone Number"
          description="Optional - for verified travelers only"
          error={errors?.phone}
          isDarkMode={isDarkMode}
        >
          <TextInput
            value={formData?.phone || ''}
            onChangeText={(v) => onChange('phone', v)}
            placeholder="+91 98765 43210"
            placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
            keyboardType="phone-pad"
            style={inputStyle(isDarkMode)}
          />
        </Field>

        {/* Date of Birth — replaces web <input type='date'> with native date picker */}
        <Field
          label="Date of Birth"
          required
          description="Must be 18+ to use ApniDiaries"
          error={errors?.dateOfBirth}
          isDarkMode={isDarkMode}
        >
          {/* Pressable trigger — looks like the other inputs */}
          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={[
              inputStyle(isDarkMode),
              { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
            ]}
          >
            <Text
              style={{
                fontSize: 14,
                color: formData?.dateOfBirth
                  ? (isDarkMode ? '#f9fafb' : '#111827')
                  : (isDarkMode ? '#6b7280' : '#9ca3af'),
              }}
            >
              {formData?.dateOfBirth || 'Select date of birth'}
            </Text>
            <Icon name="Calendar" size={16} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={parsedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              onChange={handleDateChange}
            />
          )}
        </Field>

      </View>
    </View>
  )
}

export default BasicInfoSection