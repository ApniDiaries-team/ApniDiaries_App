import { useLocalSearchParams } from "expo-router";
import ExternalDeepLinkRedirect from "../../components/ExternalDeepLinkRedirect";

export default function ChatDeepLink() {
  const { chatId } = useLocalSearchParams();
  return <ExternalDeepLinkRedirect destination={{ pathname: "/(protected)/chat-interface", params: { threadId: String(chatId || "") } }} />;
}
