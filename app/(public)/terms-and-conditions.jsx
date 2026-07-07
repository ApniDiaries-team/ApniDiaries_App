import { ScrollView, Text, View } from "react-native";

export default function TermsAndConditions() {
  return (
    <ScrollView className="flex-1 bg-white px-6 py-10">
      <Text className="text-2xl font-bold text-gray-800 mb-2">
        Terms & Conditions
      </Text>
      <Text className="text-sm text-gray-500 mb-6">Last Updated: May 2026</Text>

      <Text className="mb-4 font-medium text-gray-800">
        PLEASE READ THESE TERMS CAREFULLY
      </Text>

      <Text className="mb-4 text-gray-700">
        By clicking "Sign Up", accessing, or using the Services, you agree to be
        legally bound by these Terms. If you do not agree, you must not access
        or use the Services.
      </Text>

      <Section title="1. Eligibility, Registration, and Account Responsibility">
        <BulletItem text="You must be at least 18 years of age." />
        <BulletItem text="Provide accurate and complete information." />
        <BulletItem text="Maintain account security and confidentiality." />
        <BulletItem text="Notify us of any unauthorized use." />
        <BulletItem text="You are responsible for all activity under your account." />
      </Section>

      <Section title="2. Third-Party Terms">
        <Text className="text-gray-700">
          Services may include third-party offerings governed by their own
          terms. We are not responsible for third-party services.
        </Text>
      </Section>

      <Section title="3. Interactions with Other Members">
        <BulletItem text="All interactions are at your own risk." />
        <BulletItem text="We do not verify identities or conduct." />
        <BulletItem text="You release us from any disputes with other users." />
      </Section>

      <Section title="4. Member Content and Conduct">
        <Text className="text-gray-700 mb-2">
          You are responsible for all content you post.
        </Text>
        <Text className="font-semibold text-gray-800 mb-1">
          Content Restrictions
        </Text>
        <BulletItem text="Illegal, abusive, or harmful content is prohibited." />
        <BulletItem text="No explicit, violent, or misleading content." />
        <BulletItem text="No malware or spam." />
        <Text className="font-semibold text-gray-800 mt-3 mb-1">
          Content License
        </Text>
        <Text className="text-gray-700">
          You grant us a worldwide, royalty-free license to use your content to
          operate and promote the Services.
        </Text>
      </Section>

      <Section title="5. Submissions">
        <Text className="text-gray-700">
          Feedback or suggestions become our property and may be used without
          compensation.
        </Text>
      </Section>

      <Section title="6. Copyright and Limited License">
        <Text className="text-gray-700">
          All platform content is owned or licensed by us. You are granted a
          limited license to use the Services.
        </Text>
      </Section>

      <Section title="7. Repeat Infringer Policy">
        <Text className="text-gray-700">
          We may terminate accounts of users who repeatedly violate intellectual
          property rights.
        </Text>
      </Section>

      <Section title="8. Copyright Complaints">
        <Text className="text-gray-700">
          Send complaints to:{" "}
          <Text className="font-semibold">admin@apnidiaries.org</Text>
        </Text>
      </Section>

      <Section title="9. Termination">
        <Text className="text-gray-700">
          We may suspend or terminate your account at any time.
        </Text>
      </Section>

      <Section title="10. Disclaimer of Warranties">
        <Text className="font-semibold uppercase text-gray-800">
          THE SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.
        </Text>
      </Section>

      <Section title="11. Limitation of Liability">
        <Text className="text-gray-700">
          Our total liability shall not exceed INR 1.
        </Text>
      </Section>

      <Section title="12. Indemnification">
        <Text className="text-gray-700">
          You agree to indemnify and hold us harmless from claims arising from
          your use of the Services.
        </Text>
      </Section>

      <Section title="13. Dispute Resolution">
        <Text className="text-gray-700">
          Disputes shall be resolved through arbitration in Jaipur, Rajasthan.
        </Text>
      </Section>

      <Section title="14. Miscellaneous">
        <BulletItem text="These Terms are the entire agreement." />
        <BulletItem text="Invalid provisions do not affect others." />
      </Section>

      <Text className="mt-10 mb-10 text-sm text-gray-500">
        Questions? Contact us at admin@apnidiaries.org
      </Text>
    </ScrollView>
  );
}

function Section({ title, children }) {
  return (
    <View className="mb-6">
      <Text className="text-base font-semibold text-gray-800 mb-2">
        {title}
      </Text>
      <View className="gap-1">{children}</View>
    </View>
  );
}

function BulletItem({ text }) {
  return (
    <View className="flex-row gap-2 mb-1">
      <Text className="text-gray-700">•</Text>
      <Text className="flex-1 text-gray-700">{text}</Text>
    </View>
  );
}
