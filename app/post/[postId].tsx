import { useLocalSearchParams } from "expo-router";
import ExternalDeepLinkRedirect from "../../components/ExternalDeepLinkRedirect";

export default function PostDeepLink() {
  const { postId } = useLocalSearchParams();
  return <ExternalDeepLinkRedirect destination={{ pathname: "/(protected)/community-posts", params: { postId: String(postId || "") } }} />;
}
