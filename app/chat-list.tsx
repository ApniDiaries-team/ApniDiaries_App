import ExternalDeepLinkRedirect from "../components/ExternalDeepLinkRedirect";

export default function ChatListDeepLink() {
  return <ExternalDeepLinkRedirect destination={{ pathname: "/(protected)/chat-list" }} />;
}
