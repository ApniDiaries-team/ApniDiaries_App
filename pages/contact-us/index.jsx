import { Pressable, ScrollView, Text, View } from 'react-native';
import Icon from '../../components/AppIcon';
import { useDarkMode } from '../../context/DarkModeContext';
import { Fonts } from '../../constants/theme';
import ContactCard from './components/ContactCard';
import SocialMediaCard from './components/SocialMediaCard';
import TrustBadge from './components/TrustBadge';

const ContactUs = () => {
  const { isDarkMode } = useDarkMode();

  const bgPage = isDarkMode ? '#0b0e14' : '#f1f5f9';
  const bgCard = isDarkMode ? '#131c2b' : '#fff';
  const border = isDarkMode ? '#1e2d42' : '#e5e7eb';
  const textPrimary = isDarkMode ? '#f1f5f9' : '#111827';
  const textSecondary = isDarkMode ? '#64748b' : '#6b7280';

  const contactInfo = [
    {
      icon: 'MapPin',
      title: 'Global Headquarters',
      details: [
        'Goviandam market, silver jubilee road Shop no. 18,19',
        'near shehotiya petrol pump',
        'Sikar, Rajasthan, 332001',
      ],
      link: 'https://maps.google.com/?q=37.7749,-122.4194',
      linkText: 'View on Map',
    },
    {
      icon: 'Phone',
      title: 'Phone Support',
      details: ['IN: +91 8875002600', 'Available: Mon-Fri, 9AM-6PM PST'],
      link: 'tel:+917597080061',
      linkText: 'Call Now',
    },
    {
      icon: 'Mail',
      title: 'Email Contact',
      details: [
        'General: hello@apnidiaries.com',
        'Support: support@apnidiaries.com',
        'Response time: Within 24 hours',
      ],
      link: 'mailto:hello@apnidiaries.com',
      linkText: 'Send Email',
    },
  ];

  const socialMedia = [
    {
      platform: 'Instagram',
      handle: '@apnidiaries',
      followers: 245000,
      icon: 'Instagram',
      link: 'https://instagram.com/apnidiaries',
      color: '#E4405F',
    },
    {
      platform: 'Facebook',
      handle: 'apnidiaries Community',
      followers: 180000,
      icon: 'Facebook',
      link: 'https://facebook.com/apnidiaries',
      color: '#1877F2',
    },
    {
      platform: 'Twitter',
      handle: '@apnidiaries',
      followers: 125000,
      icon: 'Twitter',
      link: 'https://twitter.com/travel_connect',
      color: '#1DA1F2',
    },
  ];

  const trustBadges = [
    {
      icon: 'Shield',
      text: 'SSL Secured',
      description: 'Your data is encrypted and protected',
    },
    {
      icon: 'Lock',
      text: 'Privacy Protected',
      description: 'We never share your information',
    },
    {
      icon: 'CheckCircle',
      text: 'Verified Community',
      description: 'All members are authenticated',
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: bgPage }}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View style={{ paddingHorizontal: 16, paddingTop: 28, paddingBottom: 16 }}>

        {/* ── Header ── */}
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <Text
            style={{
              fontFamily: Fonts.playfair?.bold,
              fontSize: 30,
              color: textPrimary,
              textAlign: 'center',
              marginBottom: 10,
            }}
          >
            Get In Touch
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: textSecondary,
              textAlign: 'center',
              lineHeight: 22,
              maxWidth: 320,
            }}
          >
            We're here to help and answer any questions you might have. Reach out through any of these channels.
          </Text>
        </View>

        {/* ── Contact Cards ── */}
        <View style={{ gap: 14, marginBottom: 28 }}>
          {contactInfo.map((contact, index) => (
            <ContactCard key={index} {...contact} isDarkMode={isDarkMode} />
          ))}
        </View>

        {/* ── Social Media ── */}
        <View style={{ marginBottom: 28 }}>
          <Text
            style={{
              fontFamily: Fonts.playfair?.bold,
              fontSize: 22,
              color: textPrimary,
              textAlign: 'center',
              marginBottom: 6,
            }}
          >
            Connect With Us Online
          </Text>
          <Text style={{ fontSize: 13, color: textSecondary, textAlign: 'center', marginBottom: 16 }}>
            Follow our journey and join the conversation on social media
          </Text>
          <View style={{ gap: 12 }}>
            {socialMedia.map((social, index) => (
              <SocialMediaCard key={index} {...social} isDarkMode={isDarkMode} />
            ))}
          </View>
        </View>

        {/* ── Trust & Support ── */}
        <View
          style={{
            backgroundColor: bgCard,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: border,
            padding: 20,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon name="MessageCircle" size={24} color={textPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: Fonts.playfair?.bold,
                  fontSize: 18,
                  color: textPrimary,
                  marginBottom: 4,
                }}
              >
                Need Assistance?
              </Text>
              <Text style={{ fontSize: 13, color: textSecondary, lineHeight: 20 }}>
                Our support team is available 24/7 to help you with any questions or concerns
              </Text>
            </View>
          </View>

          {/* Trust Badges */}
          <View style={{ gap: 10, marginBottom: 20 }}>
            {trustBadges.map((badge, index) => (
              <TrustBadge key={index} {...badge} isDarkMode={isDarkMode} />
            ))}
          </View>

          {/* Action Buttons */}
          <View style={{ gap: 10 }}>
            <Pressable
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingVertical: 15,
                borderRadius: 12,
                backgroundColor: '#F97316',
                shadowColor: '#F97316',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Icon name="MessageSquare" size={18} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Contact Support</Text>
            </Pressable>
            <Pressable
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingVertical: 15,
                borderRadius: 12,
                backgroundColor: 'transparent',
                borderWidth: 1.5,
                borderColor: border,
              }}
            >
              <Icon name="FileText" size={18} color={textPrimary} />
              <Text style={{ color: textPrimary, fontSize: 15, fontWeight: '600' }}>Browse FAQs</Text>
            </Pressable>
          </View>
        </View>

        {/* ── Business Hours ── */}
        <View style={{ marginTop: 24, alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: textSecondary, textAlign: 'center' }}>
            Business hours: Monday - Friday, 9:00 AM - 6:00 PM PST
          </Text>
          <Text style={{ fontSize: 11, color: textSecondary, marginTop: 6, textAlign: 'center' }}>
            We typically respond within 24 hours during business days
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default ContactUs;
