import ExternalDeepLinkRedirect from "../components/ExternalDeepLinkRedirect";

export default function CommunityPostsDeepLink() {
  return <ExternalDeepLinkRedirect destination={{ pathname: "/(protected)/community-posts" }} />;
}
