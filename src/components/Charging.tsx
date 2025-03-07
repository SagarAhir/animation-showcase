import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import React, { useEffect, useRef } from "react";
import {
  Canvas,
  Circle,
  Group,
  vec,
  Text as SkiaText,
  useFont,
} from "@shopify/react-native-skia";
import { useTheme } from "@/context/ThemeContext";
import { Text } from "./Themed";
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
  SharedValue,
  runOnJS,
  interpolateColor,
} from "react-native-reanimated";

interface DotType {
  startX: number;
  startY: number;
  x: number;
  y: number;
  scale: number;
  opacity: number;
}

const { height, width } = Dimensions.get("window");

const CIRCLE_RADIUS = 125; // Radius of the main circle
const CIRCLE_STROKE_WIDTH = 3; // Stroke width of the circle
const DOT_COUNT = 50; // Number of dots around the circle
const DOT_RADIUS = 1.5; // Size of each dot
const CHARGING_DURATION = 10000; // 10 seconds in milliseconds

const Charging = () => {
  const { colors } = useTheme();
  const [startAnimation, setStartAnimation] = React.useState(false);
  const percentage = useSharedValue(0);

  const dots = useRef(
    Array.from({ length: DOT_COUNT }, (_, index) => {
      const angle = (2 * Math.PI * index) / DOT_COUNT;
      const startX = width / 2 + CIRCLE_RADIUS * Math.cos(angle);
      const startY = height / 2 + CIRCLE_RADIUS * Math.sin(angle);
      return {
        startX,
        startY,
        x: startX,
        y: startY,
        scale: 1,
        opacity: 1,
      };
    })
  ).current;

  const onPressStart = () => {
    setStartAnimation(!startAnimation);
    if (startAnimation) {
      setStartAnimation(false);
      percentage.value = withTiming(0, { duration: 300 });
    } else {
      percentage.value = withTiming(
        100,
        { duration: CHARGING_DURATION },
        (finished) => {
          if (finished) {
            runOnJS(setStartAnimation)(false);
            percentage.value = withTiming(0, { duration: 300 });
          }
        }
      );
    }
  };

  return (
    <View style={styles.container}>
      <Canvas style={{ height, width }}>
        <Circle
          cx={width / 2}
          cy={height / 2}
          r={CIRCLE_RADIUS}
          color={colors.accent1}
          style="stroke"
          strokeWidth={CIRCLE_STROKE_WIDTH}
        />
        <Group>
          {dots.map((dot, index) => (
            <AnimatedDot
              key={index}
              dot={dot}
              startAnimation={startAnimation}
              color={colors.accent1}
            />
          ))}
        </Group>
        <AnimatedPercentageText
          percentage={percentage}
          startAnimation={startAnimation}
        />
      </Canvas>
      <Pressable
        style={[styles.button, { backgroundColor: colors.gray100 }]}
        onPress={onPressStart}
      >
        <Text>{startAnimation ? "Stop Download" : "Start Download"}</Text>
      </Pressable>
    </View>
  );
};

const AnimatedPercentageText = ({
  startAnimation,
  percentage,
}: {
  startAnimation: boolean;
  percentage: SharedValue<number>;
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const font = useFont(require("../assets/fonts/Quicksand-Regular.ttf"), 40);

  useEffect(() => {
    if (startAnimation) {
      scale.value = withRepeat(
        withTiming(1.2, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      opacity.value = withRepeat(
        withTiming(0.7, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      cancelAnimation(scale);
      cancelAnimation(opacity);
      scale.value = withTiming(1, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });
    }
  }, [startAnimation]);

  const derivedScale = useDerivedValue(() => scale.value);
  const derivedOpacity = useDerivedValue(() => opacity.value);
  const text = useDerivedValue(() => `${Math.round(percentage.value)}%`);
  const derivedColor = useDerivedValue(() =>
    interpolateColor(
      percentage.value,
      [0, 100], // Input range: 0% to 100%
      [colors.error, colors.success] // Output range: red to green
    )
  );
  if (!font) return null; // Wait for font to load

  // Calculate text width to center it
  const textWidth = font.measureText(text.value).width;
  const x = (width - textWidth) / 2;
  const y = height / 2 + font.getSize() / 3;

  return (
    <SkiaText
      x={x}
      y={y}
      text={text}
      font={font}
      color={derivedColor}
      opacity={derivedOpacity}
      transform={[{ scale: derivedScale.value }]}
      origin={vec(width / 2, height / 2)}
    />
  );
};

const AnimatedDot = React.memo(
  ({
    dot,
    startAnimation,
    color,
  }: {
    dot: DotType;
    startAnimation: boolean;
    color: string;
  }) => {
    const x = useSharedValue(dot.x);
    const y = useSharedValue(dot.y);
    const opacity = useSharedValue(dot.opacity);
    const scale = useSharedValue(dot.scale);

    const duration = Math.random() * 5000 + 1000; // Random duration between 1000ms and 6000ms
    if (startAnimation) {
      const easing = Easing.exp;
      x.value = withRepeat(withTiming(width / 2, { duration, easing }), -1);
      y.value = withRepeat(withTiming(height / 2, { duration, easing }), -1);
      opacity.value = withRepeat(withTiming(0, { duration, easing }), -1);
      scale.value = withRepeat(withTiming(0, { duration, easing }), -1);
    } else {
      cancelAnimation(x);
      cancelAnimation(y);
      cancelAnimation(opacity);
      cancelAnimation(scale);

      x.value = withTiming(dot.startX, { duration: 300 });
      y.value = withTiming(dot.startY, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withTiming(1, { duration: 300 });
    }

    const derivedX = useDerivedValue(() => x.value);
    const derivedY = useDerivedValue(() => y.value);
    const derivedOpacity = useDerivedValue(() => opacity.value);
    const derivedScale = useDerivedValue(() => scale.value);

    return (
      <Circle
        cx={derivedX}
        cy={derivedY}
        r={DOT_RADIUS}
        color={color}
        opacity={derivedOpacity}
        transform={[{ scale: derivedScale.value }]}
        origin={vec(dot.startX, dot.startY)}
      />
    );
  },
  (prevProps, nextProps) =>
    prevProps.startAnimation === nextProps.startAnimation
);

export default Charging;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    position: "absolute",
    bottom: 50,
    padding: 10,
    borderRadius: 5,
  },
});
