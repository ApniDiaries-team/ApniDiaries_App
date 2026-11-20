import ExternalDeepLinkRedirect from "../components/ExternalDeepLinkRedirect";

export default function CallsDeepLink() {
  return <ExternalDeepLinkRedirect destination={{ pathname: "/(protected)/calls" }} />;
}
