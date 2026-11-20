import ExternalDeepLinkRedirect from "../components/ExternalDeepLinkRedirect";

export default function NotificationsDeepLink() {
  return <ExternalDeepLinkRedirect destination={{ pathname: "/(protected)/notifications" }} />;
}
