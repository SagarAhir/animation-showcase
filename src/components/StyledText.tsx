import { Fonts } from "@/assets/fonts";
import { Text, TextProps } from "./Themed";

export function MonoText(props: TextProps) {
  return <Text {...props} style={[props.style, { fontFamily: "SpaceMono" }]} />;
}

export function CustomText(props: TextProps) {
  return (
    <Text {...props} style={[props.style, { fontFamily: Fonts.regular }]} />
  );
}
