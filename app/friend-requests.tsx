import ExternalDeepLinkRedirect from "../components/ExternalDeepLinkRedirect";

export default function FriendRequestsDeepLink() {
  return <ExternalDeepLinkRedirect destination={{ pathname: "/(protected)/notifications" }} />;
}
