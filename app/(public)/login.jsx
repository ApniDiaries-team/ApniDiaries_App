import { Redirect, useLocalSearchParams } from "expo-router";
import { useContext } from "react";
import Login from "../(auth)/login";
import { AppContext } from "../../context/AppContext";

export default function LoginRoute() {
  const { user, isLoading } = useContext(AppContext);
  const { from } = useLocalSearchParams();

  if (!isLoading && user) {
    return <Redirect href={from || "/community-posts"} />;
  }

  return <Login />;
}
