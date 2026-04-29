import { Redirect, useLocalSearchParams } from "expo-router";
import { useContext } from "react";
import Signup from "../(auth)/signup";
import { AppContext } from "../../context/AppContext";

export default function SignupRoute() {
  const { user, isLoading } = useContext(AppContext);
  const { from } = useLocalSearchParams();

  if (!isLoading && user) {
    return <Redirect href={from || "/community-posts"} />;
  }

  return <Signup />;
}
