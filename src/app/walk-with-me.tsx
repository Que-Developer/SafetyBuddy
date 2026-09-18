import { Redirect } from "expo-router";

/** Walk With Me now lives on the interactive Map tab. */
export default function WalkWithMeScreen() {
  return <Redirect href="/(tabs)/map" />;
}
