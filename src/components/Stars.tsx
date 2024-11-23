import { Circle } from "@shopify/react-native-skia";
import { useTheme } from "@/context/ThemeContext";
import {
  useSharedValue,
  useDerivedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";
import { WINDOW_WIDTH, WINDOW_HEIGHT } from "@/constants/Constants";

const STAR_COUNT = 30;
const CENTER_X = WINDOW_WIDTH;
const CENTER_Y = WINDOW_HEIGHT;
const STARS = Array.from({ length: STAR_COUNT }, (_, id) => ({
  id,
  radius: Math.random() * Math.max(WINDOW_WIDTH, WINDOW_HEIGHT) * 1.5,
  size: Math.random() * 2 + 1,
  initialAngle: Math.random() * Math.PI * 2,
}));

const Stars = () => {
  const { colors } = useTheme();

  // Shared value for the angle controlling all stars
  const angle = useSharedValue(0);

  useEffect(() => {
    // Animate the angle value to create the anticlockwise motion
    angle.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 600000, easing: Easing.linear }), // Increased from 45000 to 60000 ms
      -1, // Infinite repetition
      false // No reversing (ensures anticlockwise movement)
    );
  }, []);

  return (
    <>
      {STARS.map((star) => {
        // Calculate X and Y positions based on the angle
        const cx = useDerivedValue(() => {
          return (
            CENTER_X - star.radius * Math.sin(angle.value + star.initialAngle)
          ); // Use sine for X
        });

        const cy = useDerivedValue(() => {
          return (
            CENTER_Y - star.radius * Math.cos(angle.value + star.initialAngle)
          ); // Use cosine for Y
        });

        return (
          <Circle
            key={star.id}
            cx={cx} // Dynamically updated X position
            cy={cy} // Dynamically updated Y position
            r={star.size} // Visual size of the star
            color={colors.white}
          />
        );
      })}
    </>
  );
};

export default Stars;
