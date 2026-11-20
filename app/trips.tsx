import ExternalDeepLinkRedirect from "../components/ExternalDeepLinkRedirect";

export default function TripsDeepLink() {
  return <ExternalDeepLinkRedirect destination={{ pathname: "/(protected)/trips" }} />;
}
