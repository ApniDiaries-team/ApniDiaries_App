import { useLocalSearchParams } from "expo-router";
import CityFriendList from "../../pages/city-friend-list";
import Messages from "../../pages/messages";

// The bottom-nav "Messages" tab routes here with no params and should show
// the general chat inbox (web's pages/messages). When navigated with a
// cityId (e.g. from a city page's "friends here" link), it shows the
// city-scoped friend directory instead — same route, same as before.
export default function ChatListRoute() {
  const { cityId } = useLocalSearchParams();
  return cityId ? <CityFriendList /> : <Messages />;
}
