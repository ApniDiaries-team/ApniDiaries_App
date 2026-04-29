import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from '../../components/AppIcon';
import { useDarkMode } from '../../context/DarkModeContext';
import { Fonts } from '../../constants/theme';
import { getUserSettings, updateUserSettings } from '../../services/settings.api';

// ── Dropdown Select (matches web designs exactly) ─────────────────────────────
const Dropdown = ({ label, description, options, value, onChange, isDarkMode }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  const bg = isDarkMode ? '#1a2233' : '#fff';
  const bgDropdown = isDarkMode ? '#1e2b3a' : '#fff';
  const border = isDarkMode ? '#2d3f55' : '#d1d5db';
  const borderOpen = '#F97316';
  const textPrimary = isDarkMode ? '#f1f5f9' : '#111827';
  const textSecondary = isDarkMode ? '#94a3b8' : '#6b7280';

  return (
    <View style={{ gap: 6, zIndex: open ? 999 : 1 }}>
      {/* Label */}
      <Text style={{ fontSize: 14, fontWeight: '600', color: textPrimary, fontFamily: Fonts.inter?.semibold }}>
        {label}
      </Text>

      {/* Trigger */}
      <Pressable
        onPress={() => setOpen((prev) => !prev)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderRadius: 10,
          borderWidth: 1.5,
          borderColor: open ? borderOpen : border,
          backgroundColor: bg,
        }}
      >
        <Text style={{ fontSize: 15, color: textPrimary, fontWeight: '500' }}>
          {selected?.label || `Select ${label}`}
        </Text>
        <Icon
          name={open ? 'ChevronUp' : 'ChevronDown'}
          size={18}
          color={open ? '#F97316' : textSecondary}
        />
      </Pressable>

      {/* Open dropdown panel */}
      {open && (
        <View
          style={{
            borderRadius: 10,
            borderWidth: 1,
            borderColor: border,
            backgroundColor: bgDropdown,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  backgroundColor: isSelected ? '#F97316' : 'transparent',
                  borderTopWidth: i > 0 ? 1 : 0,
                  borderTopColor: isDarkMode ? '#2d3f55' : '#f3f4f6',
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: isSelected ? '600' : '500',
                    color: isSelected ? '#fff' : textPrimary,
                  }}
                >
                  {opt.label}
                </Text>
                {opt.description && (
                  <Text
                    style={{
                      fontSize: 12,
                      color: isSelected ? 'rgba(255,255,255,0.8)' : textSecondary,
                      flexShrink: 1,
                      textAlign: 'right',
                      marginLeft: 8,
                    }}
                  >
                    {opt.description}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Description below trigger */}
      {description && !open && (
        <Text style={{ fontSize: 12, color: textSecondary, marginTop: 2 }}>
          {description}
        </Text>
      )}
    </View>
  );
};

// ── Checkbox Item ─────────────────────────────────────────────────────────────
const CheckboxItem = ({ label, description, checked, onChange, isDarkMode }) => {
  const textPrimary = isDarkMode ? '#f1f5f9' : '#111827';
  const textSecondary = isDarkMode ? '#94a3b8' : '#6b7280';

  return (
    <Pressable
      onPress={() => onChange(!checked)}
      style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingVertical: 4 }}
    >
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          borderWidth: 2,
          borderColor: checked ? '#F97316' : (isDarkMode ? '#4b5563' : '#d1d5db'),
          backgroundColor: checked ? '#F97316' : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 1,
          flexShrink: 0,
        }}
      >
        {checked && <Icon name="Check" size={13} color="#fff" />}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: textPrimary, lineHeight: 20 }}>
          {label}
        </Text>
        {description && (
          <Text style={{ fontSize: 12, color: textSecondary, marginTop: 2, lineHeight: 18 }}>
            {description}
          </Text>
        )}
      </View>
    </Pressable>
  );
};

// ── Section Card ──────────────────────────────────────────────────────────────
const Section = ({ title, icon, children, isDarkMode, zIndex = 1 }) => {
  const bg = isDarkMode ? '#131c2b' : '#fff';
  const border = isDarkMode ? '#1e2d42' : '#e5e7eb';
  const textPrimary = isDarkMode ? '#e2e8f0' : '#111827';
  const textSecondary = isDarkMode ? '#64748b' : '#6b7280';

  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: border,
        gap: 18,
        zIndex,
      }}
    >
      {/* Section header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Icon name={icon} size={18} color={textSecondary} />
        <Text
          style={{
            fontSize: 17,
            fontFamily: Fonts.playfair?.bold,
            color: textPrimary,
          }}
        >
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const SettingsPage = () => {
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    profileVisibility: 'public',
    messagePrivacy: 'friends',
    emailFollowers: true,
    emailFriendRequests: true,
    emailMessages: true,
    emailPostInteractions: false,
    showInDiscovery: true,
    showOnlineStatus: true,
    allowProfileSharing: true,
  });

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getUserSettings();
        if (res?.data?.success) {
          const u = res.data.data;
          setFormData({
            profileVisibility: u.profile_visibility || 'public',
            messagePrivacy: u.message_visibility || 'friends',
            emailFollowers: u.notify_follows ?? true,
            emailFriendRequests: u.notify_friend_request ?? true,
            emailMessages: u.notify_messages ?? true,
            emailPostInteractions: u.notify_interactions ?? false,
            showInDiscovery: u.city_discovery ?? true,
            showOnlineStatus: u.online_status ?? true,
            allowProfileSharing: u.profile_sharing ?? true,
          });
        }
      } catch {
        showToast('error', 'Could not load settings');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        profile_visibility: formData.profileVisibility,
        message_visibility: formData.messagePrivacy,
        notify_follows: formData.emailFollowers,
        notify_friend_request: formData.emailFriendRequests,
        notify_messages: formData.emailMessages,
        notify_interactions: formData.emailPostInteractions,
        city_discovery: formData.showInDiscovery,
        online_status: formData.showOnlineStatus,
        profile_sharing: formData.allowProfileSharing,
      };
      const res = await updateUserSettings(payload);
      if (res?.data?.success) {
        showToast('success', 'Settings updated!');
      } else {
        showToast('error', res?.data?.message || 'Update failed');
      }
    } catch {
      showToast('error', 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const profileVisibilityOptions = [
    { value: 'public', label: 'Public', description: 'Anyone can view your profile' },
    { value: 'friends', label: 'Friends Only', description: 'Only your friends can view' },
    { value: 'private', label: 'Private', description: 'Only you can view' },
  ];
  const messagePrivacyOptions = [
    { value: 'everyone', label: 'Everyone', description: 'Anyone can message you' },
    { value: 'friends', label: 'Friends Only', description: 'Only friends can message' },
    { value: 'nobody', label: 'Nobody', description: 'Disable messages' },
  ];

  const bgPage = isDarkMode ? '#0b0e14' : '#f1f5f9';
  const bgCard = isDarkMode ? '#131c2b' : '#fff';
  const border = isDarkMode ? '#1e2d42' : '#e5e7eb';
  const textPrimary = isDarkMode ? '#f1f5f9' : '#111827';
  const textSecondary = isDarkMode ? '#64748b' : '#6b7280';

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: bgPage, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: bgPage }}>
      {/* Toast */}
      {toast && (
        <View
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            right: 16,
            zIndex: 9999,
            backgroundColor: toast.type === 'success' ? '#16a34a' : '#dc2626',
            borderRadius: 10,
            padding: 14,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Icon name={toast.type === 'success' ? 'CheckCircle2' : 'AlertCircle'} size={18} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', flex: 1 }}>{toast.msg}</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Page Header ── */}
        <View
          style={{
            backgroundColor: bgCard,
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: border,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              backgroundColor: isDarkMode ? '#1e2b3a' : '#f3f4f6',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="ArrowLeft" size={20} color={textSecondary} />
          </Pressable>

          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 13,
              backgroundColor: isDarkMode ? 'rgba(59,130,246,0.18)' : 'rgba(59,130,246,0.1)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="Shield" size={24} color={isDarkMode ? '#60a5fa' : '#3b82f6'} />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 22,
                fontFamily: Fonts.playfair?.bold,
                color: textPrimary,
                lineHeight: 28,
              }}
            >
              Privacy & Settings
            </Text>
            <Text style={{ fontSize: 13, color: textSecondary, marginTop: 3, lineHeight: 18 }}>
              Manage your profile visibility and notification preferences
            </Text>
          </View>
        </View>

        {/* ── Privacy Controls — high zIndex so dropdowns overlap below ── */}
        <Section title="Privacy Controls" icon="Lock" isDarkMode={isDarkMode} zIndex={20}>
          <Dropdown
            label="Profile Visibility"
            description="Control who can see your profile"
            options={profileVisibilityOptions}
            value={formData.profileVisibility}
            onChange={(v) => handleChange('profileVisibility', v)}
            isDarkMode={isDarkMode}
          />
          <Dropdown
            label="Message Privacy"
            description="Control who can send you messages"
            options={messagePrivacyOptions}
            value={formData.messagePrivacy}
            onChange={(v) => handleChange('messagePrivacy', v)}
            isDarkMode={isDarkMode}
          />
        </Section>

        {/* ── Notification Preferences ── */}
        <Section title="Notification Preferences" icon="Bell" isDarkMode={isDarkMode} zIndex={10}>
          <CheckboxItem
            label="Email notifications for new followers"
            description="Get notified when someone follows you"
            checked={formData.emailFollowers}
            onChange={(v) => handleChange('emailFollowers', v)}
            isDarkMode={isDarkMode}
          />
          <CheckboxItem
            label="Email notifications for friend requests"
            description="Get notified about new friend requests"
            checked={formData.emailFriendRequests}
            onChange={(v) => handleChange('emailFriendRequests', v)}
            isDarkMode={isDarkMode}
          />
          <CheckboxItem
            label="Email notifications for messages"
            description="Get notified about new messages"
            checked={formData.emailMessages}
            onChange={(v) => handleChange('emailMessages', v)}
            isDarkMode={isDarkMode}
          />
          <CheckboxItem
            label="Email notifications for post interactions"
            description="Get notified when someone interacts with your posts"
            checked={formData.emailPostInteractions}
            onChange={(v) => handleChange('emailPostInteractions', v)}
            isDarkMode={isDarkMode}
          />
        </Section>

        {/* ── Discovery Settings ── */}
        <Section title="Discovery Settings" icon="Compass" isDarkMode={isDarkMode} zIndex={5}>
          <CheckboxItem
            label="Show my profile in city-based discovery"
            description="Let travelers in your city find you"
            checked={formData.showInDiscovery}
            onChange={(v) => handleChange('showInDiscovery', v)}
            isDarkMode={isDarkMode}
          />
          <CheckboxItem
            label="Show my online status"
            description="Let others see when you're active"
            checked={formData.showOnlineStatus}
            onChange={(v) => handleChange('showOnlineStatus', v)}
            isDarkMode={isDarkMode}
          />
          <CheckboxItem
            label="Allow profile sharing"
            description="Let others share your profile"
            checked={formData.allowProfileSharing}
            onChange={(v) => handleChange('allowProfileSharing', v)}
            isDarkMode={isDarkMode}
          />
        </Section>

        {/* ── Info note ── */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 12,
            backgroundColor: isDarkMode ? 'rgba(59,130,246,0.08)' : '#eff6ff',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: isDarkMode ? 'rgba(59,130,246,0.2)' : '#bfdbfe',
            padding: 14,
          }}
        >
          <Icon name="Info" size={17} color={isDarkMode ? '#60a5fa' : '#3b82f6'} />
          <Text style={{ flex: 1, fontSize: 13, color: textSecondary, lineHeight: 20 }}>
            Your privacy is important to us. You can change these settings anytime.
          </Text>
        </View>

        {/* ── Save Button ── */}
        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={{
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 10,
            opacity: saving ? 0.7 : 1,
            backgroundColor: '#F97316',
            shadowColor: '#F97316',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 10,
            elevation: 5,
          }}
        >
          <Icon name={saving ? 'Loader' : 'Save'} size={18} color="#fff" />
          <Text
            style={{
              fontSize: 16,
              fontFamily: Fonts.playfair?.bold,
              color: '#fff',
              letterSpacing: 0.3,
            }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

export default SettingsPage;
