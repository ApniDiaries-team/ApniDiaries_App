import { useLocalSearchParams } from "expo-router";
import ExternalDeepLinkRedirect from "../../components/ExternalDeepLinkRedirect";

export default function ProfileDeepLink() {
  const { userId } = useLocalSearchParams();
  return <ExternalDeepLinkRedirect destination={{ pathname: "/(protected)/other-user-profile", params: { id: String(userId || "") } }} />;
}
