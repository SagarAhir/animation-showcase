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

const STAR_COUNT = 50;
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

  const angle = useSharedValue(0);

  useEffect(() => {
    angle.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 600000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  return (
    <>
      {STARS.map((star) => {
        const cx = useDerivedValue(() => {
          return (
            CENTER_X - star.radius * Math.sin(angle.value + star.initialAngle)
          );
        });

        const cy = useDerivedValue(() => {
          return (
            CENTER_Y - star.radius * Math.cos(angle.value + star.initialAngle)
          );
        });

        return (
          <Circle
            key={star.id}
            cx={cx}
            cy={cy}
            r={star.size}
            color={colors.star}
          />
        );
      })}
    </>
  );
};

export default Stars;
