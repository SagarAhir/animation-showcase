import { Dimensions } from "react-native";

export enum ANIMATION_ID {
  POINTER = "pointer",
  SMILEY = "smiley",
  PLANET = "planet",
  GRAVITY = "gravity",
  CHARGING = "charging",
}

export const ANIMATIONS = [
  { id: ANIMATION_ID.POINTER, title: "Fireball" },
  { id: ANIMATION_ID.SMILEY, title: "Smiley" },
  { id: ANIMATION_ID.PLANET, title: "Planetary System" },
  { id: ANIMATION_ID.GRAVITY, title: "Gravity Center (In Progress)" },
  { id: ANIMATION_ID.CHARGING, title: "Charging" },
];

export const { height: WINDOW_HEIGHT, width: WINDOW_WIDTH } =
  Dimensions.get("window");
